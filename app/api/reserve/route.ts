import { NextResponse } from "next/server";
import { z } from "zod";
import { resend, FROM_EMAIL, SHOP_EMAIL, emailShell } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
  productName: z.string().min(1),
  productSlug: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }
  const { name, email, phone, message, productName } = parsed.data;

  if (!resend) {
    // Mode démo : pas d'envoi, mais on considère la réservation prise en compte.
    console.info("[reserve] (démo)", parsed.data);
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: SHOP_EMAIL,
      replyTo: email,
      subject: `📌 Réservation — ${productName}`,
      html: emailShell(
        "Nouvelle réservation",
        `<p style="color:#a29c92">Produit : <strong style="color:#c6a46a">${productName}</strong></p>
         <p style="color:#a29c92">Client : ${name}</p>
         <p style="color:#a29c92">Email : ${email}</p>
         <p style="color:#a29c92">Téléphone : ${phone || "—"}</p>
         <p style="color:#a29c92">Message : ${message || "—"}</p>`,
      ),
    });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Votre réservation MAD Shop — ${productName}`,
      html: emailShell(
        "Réservation bien reçue !",
        `<p style="color:#a29c92;line-height:1.6">Bonjour ${name},</p>
         <p style="color:#a29c92;line-height:1.6">Nous avons bien enregistré votre réservation pour
         <strong style="color:#c6a46a">${productName}</strong>. Notre équipe vous recontacte très vite pour finaliser.</p>
         <p style="color:#a29c92;line-height:1.6">Merci de votre confiance ❤️</p>`,
      ),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reserve]", err);
    return NextResponse.json({ error: "Envoi impossible." }, { status: 500 });
  }
}
