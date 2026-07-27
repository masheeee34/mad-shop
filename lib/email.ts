import { Resend } from "resend";

/** Client Resend, ou null si non configuré (mode démo). */
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/** Adresse expéditeur vérifiée sur Resend (ex: "MAD Shop <contact@madshop.fr>"). */
export const FROM_EMAIL = process.env.EMAIL_FROM ?? "MAD Shop <onboarding@resend.dev>";

/** Boîte interne qui reçoit commandes / réservations / messages. */
export const SHOP_EMAIL = process.env.EMAIL_TO ?? "contact@madshop.fr";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://madshop.fr";

/**
 * Gabarit HTML des emails transactionnels.
 *
 * `title` et `body` doivent déjà être échappés par l'appelant lorsqu'ils
 * contiennent de la saisie visiteur — voir `escapeHtml` dans lib/sanitize.ts.
 */
export function emailShell(title: string, body: string) {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="dark light">
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#0b0b0c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif;color:#f4f1ea;padding:32px 16px">
    <div style="max-width:560px;margin:0 auto;background:#141416;border:1px solid rgba(244,241,234,.1);border-radius:18px;overflow:hidden">
      <div style="padding:28px 32px;border-bottom:1px solid rgba(244,241,234,.1)">
        <img src="${SITE_URL}/newlogo.jpg" alt="MAD Shop" style="height:48px;width:auto;display:block;border-radius:6px;" />
      </div>
      <div style="padding:32px">
        <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3">${title}</h1>
        ${body}
      </div>
      <div style="padding:20px 32px;border-top:1px solid rgba(244,241,234,.1);font-size:12px;color:#6f6a63">
        <a href="${SITE_URL}" style="color:#6f6a63;text-decoration:none">MAD Shop</a> — La qualité à petit prix.
      </div>
    </div>
  </body>
</html>`;
}

/** Ligne « libellé : valeur » standardisée pour le corps des emails. */
export function emailRow(label: string, value: string) {
  return `<p style="margin:0 0 8px;color:#a29c92;line-height:1.6">
    <strong style="color:#f4f1ea">${label} :</strong> ${value}
  </p>`;
}

/** Paragraphe de texte courant. */
export function emailText(html: string) {
  return `<p style="margin:0 0 12px;color:#a29c92;line-height:1.6">${html}</p>`;
}

/** Bouton d'appel à l'action (compatible clients mail). */
export function emailButton(href: string, label: string) {
  return `<p style="margin:24px 0 0">
    <a href="${href}" style="display:inline-block;background:#c6a46a;color:#0b0b0c;text-decoration:none;font-weight:700;padding:12px 24px;border-radius:999px">${label}</a>
  </p>`;
}
