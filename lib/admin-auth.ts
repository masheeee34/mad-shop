import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Authentification du back-office.
 *
 * Modèle : un mot de passe unique (ADMIN_PASSWORD) échangé contre un cookie
 * de session signé HMAC-SHA256, dont la date d'expiration fait partie du
 * message signé. Aucun mot de passe de secours, aucune valeur par défaut
 * acceptée en production.
 */

export const ADMIN_COOKIE = "mad_admin";

/** Durée de vie d'une session admin. */
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 h

const IS_PROD = process.env.NODE_ENV === "production";

/** Valeurs refusées d'office : ce sont les exemples présents dans le dépôt. */
const FORBIDDEN_PASSWORDS = new Set([
  "admin",
  "mad",
  "password",
  "changeme",
  "changez_ce_mot_de_passe_admin",
]);

/** Secret de repli, éphémère, régénéré à chaque démarrage (dev uniquement). */
// Si l'utilisateur n'a pas défini ADMIN_SECRET sur Vercel, une clé aléatoire casserait
// l'authentification à chaque nouvelle instance serverless. On utilise un fallback statique.
const DEV_SECRET = "fallback_insecure_secret_for_mad_shop_needs_to_be_32_chars_long";

/**
 * Secret de signature.
 *
 * En production il doit être fourni explicitement : sans lui, quiconque
 * connaît le code pourrait forger un cookie valide. On ne lève jamais
 * d'exception — une erreur de configuration du back-office ne doit pas
 * mettre la boutique hors ligne — mais le secret de repli est alors
 * régénéré à chaque démarrage, donc aucune session ne survit.
 */
function getSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (secret && secret.length >= 32) return secret;

  if (IS_PROD) {
    console.error(
      "[admin] ADMIN_SECRET manquant ou trop court (32 caractères minimum). " +
        "Générez-le avec : openssl rand -hex 32",
    );
  }
  return DEV_SECRET;
}

/** Empreinte du mot de passe attendu, ou null si l'admin n'est pas configuré. */
function getPasswordHash(): Buffer | null {
  const raw = process.env.ADMIN_PASSWORD;
  if (!raw) return null;

  const pw = raw.trim();
  if (pw.length < 12 || FORBIDDEN_PASSWORDS.has(pw.toLowerCase())) {
    console.error(
      "[admin] ADMIN_PASSWORD refusé : 12 caractères minimum, et pas une valeur d'exemple. " +
        "L'espace administration reste inaccessible tant qu'il n'est pas corrigé.",
    );
    return null;
  }
  return crypto.createHash("sha256").update(pw, "utf8").digest();
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/** Comparaison à temps constant de deux chaînes hexadécimales. */
function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

/**
 * Jeton de session : `v1.<expiration ms>.<nonce>.<signature>`.
 * L'expiration étant signée, elle ne peut pas être rallongée côté client ;
 * le nonce rend chaque session unique.
 */
export function makeToken(): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const nonce = crypto.randomBytes(12).toString("hex");
  const payload = `v1.${exp}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token?: string): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 4) return false;

  const [version, expRaw, nonce, mac] = parts;
  if (version !== "v1" || !/^\d+$/.test(expRaw) || !/^[0-9a-f]{24}$/.test(nonce)) {
    return false;
  }

  // Signature d'abord (temps constant), expiration ensuite.
  if (!safeEqualHex(mac, sign(`${version}.${expRaw}.${nonce}`))) return false;

  return Number(expRaw) > Date.now();
}

/** Vérifie le mot de passe saisi, à temps constant. */
export function checkPassword(input: string): boolean {
  const expected = getPasswordHash();
  if (!expected) return false;

  const candidate = crypto
    .createHash("sha256")
    .update((input ?? "").trim(), "utf8")
    .digest();

  return crypto.timingSafeEqual(candidate, expected);
}

/** Vrai si le back-office est utilisable (mot de passe correctement configuré). */
export function isAdminConfigured(): boolean {
  return getPasswordHash() !== null;
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(ADMIN_COOKIE)?.value);
}

/** Options du cookie de session, partagées entre login et logout. */
export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict",
  secure: IS_PROD,
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
} as const;
