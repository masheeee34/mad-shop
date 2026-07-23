import { NextResponse } from "next/server";
import { z } from "zod";
import { resend, FROM_EMAIL, SHOP_EMAIL, emailShell } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  subject: z.string().max(160).optional().or(z.literal("")),
  message: z.string().min(5).max(2000),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }
  const { name, email, subject, message } = parsed.data;

  if (!resend) {
    console.info("[contact] (démo)", parsed.data);
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: SHOP_EMAIL,
      replyTo: email,
      subject: `✉️ Contact — ${subject || "Message du site"}`,
      html: emailShell(
        "Nouveau message",
        `<p style="color:#a29c92">De : ${name} (${email})</p>
         <p style="color:#a29c92">Sujet : ${subject || "—"}</p>
         <p style="color:#a29c92;line-height:1.6">${message.replace(/\n/g, "<br>")}</p>`,
      ),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Envoi impossible." }, { status: 500 });
  }
}
