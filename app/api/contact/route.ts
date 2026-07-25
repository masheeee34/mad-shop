import { NextResponse } from "next/server";
import { z } from "zod";
import {
  resend,
  FROM_EMAIL,
  SHOP_EMAIL,
  emailShell,
  emailRow,
  emailText,
} from "@/lib/email";
import { escapeHtml, escapeHtmlMultiline, sanitizeHeader } from "@/lib/sanitize";
import { enforceRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  subject: z.string().max(160).optional().or(z.literal("")),
  message: z.string().min(5).max(2000),
  /** Champ leurre : rempli uniquement par les robots. */
  company: z.string().max(0).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "contact", 5, 10 * 60_000);
  if (limited) return limited;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }
  const { name, email, subject, message } = parsed.data;

  if (!resend) {
    console.info("[contact] mode démo — message non envoyé");
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: SHOP_EMAIL,
      replyTo: email,
      subject: sanitizeHeader(`Contact — ${subject || "Message du site"}`),
      html: emailShell(
        "Nouveau message",
        emailRow("De", `${escapeHtml(name)} (${escapeHtml(email)})`) +
          emailRow("Sujet", escapeHtml(subject || "—")) +
          emailText(escapeHtmlMultiline(message)),
      ),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Envoi impossible." }, { status: 500 });
  }
}
