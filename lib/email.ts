import { Resend } from "resend";

/** Client Resend, ou null si non configuré (mode démo). */
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/** Adresse expéditeur vérifiée sur Resend (ex: "MAD Shop <contact@madshop.fr>"). */
export const FROM_EMAIL = process.env.EMAIL_FROM ?? "MAD Shop <onboarding@resend.dev>";

/** Boîte interne qui reçoit commandes / réservations / messages. */
export const SHOP_EMAIL = process.env.EMAIL_TO ?? "contact@madshop.fr";

/** Petit gabarit HTML sombre, aux couleurs MAD Shop. */
export function emailShell(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#0b0b0c;font-family:Arial,Helvetica,sans-serif;color:#f4f1ea;padding:32px">
    <div style="max-width:520px;margin:0 auto;background:#141416;border:1px solid rgba(244,241,234,.1);border-radius:18px;overflow:hidden">
      <div style="padding:28px 32px;border-bottom:1px solid rgba(244,241,234,.1)">
        <span style="font-size:22px;font-weight:800;letter-spacing:-1px">MAD <span style="color:#c6a46a">SHOP</span></span>
        <div style="height:3px;width:60px;margin-top:6px;background:linear-gradient(90deg,#1f9b52 0 33%,#f4f1ea 33% 66%,#d23f42 66%)"></div>
      </div>
      <div style="padding:32px">
        <h1 style="margin:0 0 16px;font-size:20px">${title}</h1>
        ${body}
      </div>
      <div style="padding:20px 32px;border-top:1px solid rgba(244,241,234,.1);font-size:12px;color:#6f6a63">
        MAD Shop — La qualité à petit prix.
      </div>
    </div>
  </body></html>`;
}
