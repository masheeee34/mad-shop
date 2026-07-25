/**
 * Génère la paire de clés VAPID des notifications push.
 *
 *   node scripts/generate-vapid-keys.js
 *
 * À lancer une seule fois : changer de clés invalide tous les abonnements
 * existants, et les navigateurs déjà inscrits cessent silencieusement de
 * recevoir les notifications.
 */
const crypto = require("node:crypto");

const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
});

const pub = publicKey.export({ format: "jwk" });
const priv = privateKey.export({ format: "jwk" });

const b64 = (value) => Buffer.from(value, "base64url");

// Clé publique VAPID : point non compressé `0x04 || x || y`, en base64url.
const applicationServerKey = Buffer.concat([
  Buffer.from([0x04]),
  b64(pub.x),
  b64(pub.y),
]).toString("base64url");

console.log(`
Ajoutez ces variables à votre environnement :

NEXT_PUBLIC_VAPID_PUBLIC_KEY=${applicationServerKey}
VAPID_PRIVATE_KEY=${priv.d}
VAPID_SUBJECT=mailto:contact@votredomaine.fr

VAPID_SUBJECT doit être une adresse mailto: ou une URL https: que le service
de push peut utiliser pour vous contacter en cas de problème.
`);
