import "server-only";
import crypto from "node:crypto";
import {
  subscriptionsForEmail,
  queuePushMessage,
  removePushSubscriptions,
  type PushMessage,
} from "@/lib/data/push";

/**
 * Notifications push (Web Push, protocole VAPID).
 *
 * Le push part **sans contenu chiffré** : c'est le service worker qui vient
 * lire le texte à afficher sur `/api/push/message`. Ce choix évite toute la
 * cryptographie de chiffrement de charge utile (ECDH + HKDF + AES-GCM) et la
 * dépendance qui va avec — une erreur y serait silencieuse, et une
 * notification qui n'arrive pas ne se voit pas. Ici, seule la signature VAPID
 * est nécessaire, et elle tient dans `node:crypto`.
 *
 * Clés : `npm run vapid` (scripts/generate-vapid-keys.js), puis
 * NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT.
 */

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const SUBJECT = process.env.VAPID_SUBJECT ?? "";

/** Vrai si le push est configuré. Sans cela, tout le module est inerte. */
export function isPushConfigured(): boolean {
  return Boolean(PUBLIC_KEY && PRIVATE_KEY && SUBJECT);
}

const b64url = (buf: Buffer) => buf.toString("base64url");

/** Identifiant public d'un abonnement : l'endpoint n'en sort jamais. */
export function pushSubscriptionId(endpoint: string): string {
  return crypto.createHash("sha256").update(endpoint).digest("hex").slice(0, 32);
}

/**
 * Reconstruit la clé privée au format JWK.
 * La clé publique VAPID est un point non compressé de 65 octets
 * (`0x04 || x(32) || y(32)`) : x et y s'en extraient directement.
 */
function privateKeyObject(): crypto.KeyObject {
  const pub = Buffer.from(PUBLIC_KEY, "base64url");
  if (pub.length !== 65 || pub[0] !== 0x04) {
    throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY invalide (65 octets attendus).");
  }

  const d = Buffer.from(PRIVATE_KEY, "base64url");
  if (d.length !== 32) {
    throw new Error("VAPID_PRIVATE_KEY invalide (32 octets attendus).");
  }

  return crypto.createPrivateKey({
    format: "jwk",
    key: {
      kty: "EC",
      crv: "P-256",
      x: b64url(pub.subarray(1, 33)),
      y: b64url(pub.subarray(33, 65)),
      d: b64url(d),
    },
  });
}

/** Validité du jeton VAPID. La spécification plafonne à 24 h. */
const JWT_TTL_S = 12 * 60 * 60;

function vapidToken(audience: string): string {
  const header = b64url(Buffer.from(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = b64url(
    Buffer.from(
      JSON.stringify({
        aud: audience,
        exp: Math.floor(Date.now() / 1000) + JWT_TTL_S,
        sub: SUBJECT,
      }),
    ),
  );

  // `ieee-p1363` produit la signature brute r||s attendue par JOSE ;
  // le format DER par défaut serait refusé par les serveurs de push.
  const signature = crypto.sign(
    "sha256",
    Buffer.from(`${header}.${payload}`),
    { key: privateKeyObject(), dsaEncoding: "ieee-p1363" },
  );

  return `${header}.${payload}.${b64url(signature)}`;
}

type SendResult = "sent" | "gone" | "failed";

/** Réveille un navigateur. Renvoie `gone` si l'abonnement a été révoqué. */
async function sendPush(endpoint: string): Promise<SendResult> {
  let audience: string;
  try {
    audience = new URL(endpoint).origin;
  } catch {
    return "gone";
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `vapid t=${vapidToken(audience)}, k=${PUBLIC_KEY}`,
        TTL: "86400",
        "Content-Length": "0",
      },
    });

    // 404/410 : le navigateur a désinscrit ce point de terminaison.
    if (res.status === 404 || res.status === 410) return "gone";
    if (!res.ok) {
      console.error("[push] envoi refusé", res.status, await res.text().catch(() => ""));
      return "failed";
    }
    return "sent";
  } catch (err) {
    console.error("[push] envoi", err);
    return "failed";
  }
}

/**
 * Notifie par push tous les appareils rattachés à une adresse.
 *
 * Volontairement silencieuse : une notification est un complément à l'email,
 * jamais une raison de faire échouer l'action qui l'a déclenchée.
 */
export async function notifyByPush(
  email: string,
  message: Omit<PushMessage, "at">,
): Promise<number> {
  if (!isPushConfigured() || !email) return 0;

  const records = await subscriptionsForEmail(email);
  if (records.length === 0) return 0;

  // Le texte est déposé avant le réveil : sans cela, le service worker
  // s'éveillerait avant que le message ne soit lisible.
  await queuePushMessage(
    records.map((r) => r.id),
    message,
  );

  const gone: string[] = [];
  let sent = 0;

  for (const record of records) {
    const result = await sendPush(record.endpoint);
    if (result === "gone") gone.push(record.id);
    else if (result === "sent") sent += 1;
  }

  await removePushSubscriptions(gone);
  return sent;
}
