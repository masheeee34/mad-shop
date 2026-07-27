import { NextResponse } from "next/server";
import { z } from "zod";
import { makeLoginToken, normalizeEmail } from "@/lib/customer-auth";
import { resend, FROM_EMAIL, emailShell, emailText, emailButton } from "@/lib/email";
import { sanitizeHeader } from "@/lib/sanitize";
import { enforceRateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/config";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  // Le lien part par email : on plafonne pour éviter d'en faire un outil
  // d'envoi de messages non sollicités vers des tiers.
  const limited = enforceRateLimit(req, "compte-demande", 5, 15 * 60_000);
  if (limited) return limited;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const url = `${SITE_URL}/api/compte/connexion?token=${encodeURIComponent(
    makeLoginToken(email),
  )}`;

  if (!resend) {
    console.info("[compte] mode démo — lien de connexion :", url);
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: sanitizeHeader("Votre lien de connexion MAD Shop"),
      html: emailShell(
        "Votre lien de connexion",
        emailText(
          "Cliquez sur le bouton ci-dessous pour accéder à votre espace client. " +
            "Ce lien est valable 15 minutes, après quoi il expire.",
        ) +
          emailButton(url, "Accéder à mon compte") +
          emailText(
            "<span style=\"font-size:12px;color:#6f6a63\">Vous n'êtes pas à l'origine de cette demande ? " +
              "Ignorez simplement cet email, aucun compte n'a été créé.</span>",
          ),
      ),
    });
  } catch (err) {
    console.error("[compte] envoi du lien", err);
    return NextResponse.json({ error: "Envoi impossible." }, { status: 500 });
  }

  // Réponse identique quoi qu'il arrive : on ne révèle jamais si une adresse
  // correspond à un client existant.
  return NextResponse.json({ ok: true });
}
