import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Espace client sans mot de passe (lien magique).
 *
 * Le client saisit son email, reçoit un lien signé valable 15 minutes, et
 * l'ouverture du lien ouvre la session. Aucun mot de passe n'est créé, donc
 * aucun mot de passe à stocker, à hacher, à réinitialiser — ni à se faire
 * voler. C'est aussi le parcours le plus court : une boutique ne doit pas
 * demander à un acheteur d'inventer un énième mot de passe.
 */

export const CUSTOMER_COOKIE = "mad_client";

/** Durée de validité du lien envoyé par email. */
const LINK_TTL_MS = 15 * 60 * 1000;

/** Durée de la session ouverte depuis le lien. */
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

const IS_PROD = process.env.NODE_ENV === "production";

/** Secret de repli, régénéré à chaque démarrage (développement uniquement). */
const DEV_SECRET = crypto.randomBytes(32).toString("hex");

function getSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.ADMIN_SECRET;
  if (secret && secret.length >= 32) return secret;

  if (IS_PROD) {
    console.error(
      "[compte] AUTH_SECRET manquant ou trop court (32 caractères minimum). " +
        "Générez-le avec : openssl rand -hex 32",
    );
  }
  return DEV_SECRET;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Encodage sûr pour une URL et pour un cookie. */
const encode = (value: string) => Buffer.from(value, "utf8").toString("base64url");
const decode = (value: string) => Buffer.from(value, "base64url").toString("utf8");

/* -------------------------------------------------------------------------- */
/*  Lien magique                                                               */
/* -------------------------------------------------------------------------- */

/** Jeton à usage unique dans le temps : `l1.<email>.<exp>.<nonce>.<signature>`. */
export function makeLoginToken(email: string): string {
  const exp = Date.now() + LINK_TTL_MS;
  const nonce = crypto.randomBytes(9).toString("hex");
  const payload = `l1.${encode(normalizeEmail(email))}.${exp}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

/** Renvoie l'email si le lien est valide et non expiré, sinon `null`. */
export function readLoginToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 5) return null;

  const [version, rawEmail, exp, nonce, mac] = parts;
  if (version !== "l1" || !/^\d+$/.test(exp) || !/^[0-9a-f]{18}$/.test(nonce)) {
    return null;
  }
  if (!safeEqualHex(mac, sign(`${version}.${rawEmail}.${exp}.${nonce}`))) return null;
  if (Number(exp) <= Date.now()) return null;

  try {
    return decode(rawEmail);
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Session                                                                    */
/* -------------------------------------------------------------------------- */

/** Cookie de session : `s1.<email>.<exp>.<nonce>.<signature>`. */
export function makeSessionToken(email: string): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const nonce = crypto.randomBytes(9).toString("hex");
  const payload = `s1.${encode(normalizeEmail(email))}.${exp}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token?: string): string | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 5) return null;

  const [version, rawEmail, exp, nonce, mac] = parts;
  if (version !== "s1" || !/^\d+$/.test(exp) || !/^[0-9a-f]{18}$/.test(nonce)) {
    return null;
  }
  if (!safeEqualHex(mac, sign(`${version}.${rawEmail}.${exp}.${nonce}`))) return null;
  if (Number(exp) <= Date.now()) return null;

  try {
    return decode(rawEmail);
  } catch {
    return null;
  }
}

/** Email du client connecté, ou `null`. */
export async function currentCustomer(): Promise<string | null> {
  const store = await cookies();
  return readSessionToken(store.get(CUSTOMER_COOKIE)?.value);
}

export const CUSTOMER_COOKIE_OPTIONS = {
  httpOnly: true,
  // `lax` et non `strict` : la session doit survivre à l'arrivée depuis le
  // lien cliqué dans un client mail, qui est une navigation cross-site.
  sameSite: "lax",
  secure: IS_PROD,
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
} as const;
