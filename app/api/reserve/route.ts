import { NextResponse } from "next/server";
import { z } from "zod";
import {
  resend,
  FROM_EMAIL,
  SHOP_EMAIL,
  emailShell,
  emailRow,
  emailText,
  emailButton,
} from "@/lib/email";
import { getProduct } from "@/lib/data/catalog";
import { escapeHtml, escapeHtmlMultiline, sanitizeHeader } from "@/lib/sanitize";
import { enforceRateLimit } from "@/lib/rate-limit";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://madshop.fr";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
  productSlug: z.string().min(1).max(120),
});

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "reserve", 5, 10 * 60_000);
  if (limited) return limited;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }
  const { name, email, phone, message, productSlug } = parsed.data;

  // Le nom du produit vient du catalogue, jamais du client : il apparaît
  // dans le sujet des emails et ne doit pas être contrôlable de l'extérieur.
  const product = await getProduct(productSlug);
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  }
  const productName = product.name;

  if (!resend) {
    console.info("[reserve] mode démo — réservation non transmise");
    return NextResponse.json({ ok: true, demo: true });
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: SHOP_EMAIL,
      replyTo: email,
      subject: sanitizeHeader(`Réservation — ${productName}`),
      html: emailShell(
        "Nouvelle réservation",
        emailRow("Produit", escapeHtml(productName)) +
          emailRow("Client", escapeHtml(name)) +
          emailRow("Email", escapeHtml(email)) +
          emailRow("Téléphone", escapeHtml(phone || "—")) +
          emailRow("Message", escapeHtmlMultiline(message || "—")),
      ),
    });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: sanitizeHeader(`Votre réservation MAD Shop — ${productName}`),
      html: emailShell(
        "Réservation bien reçue",
        emailText(`Bonjour ${escapeHtml(name)},`) +
          emailText(
            `Nous avons enregistré votre réservation pour <strong style="color:#c6a46a">${escapeHtml(
              productName,
            )}</strong>. Notre équipe vous recontacte sous 24 h ouvrées pour finaliser.`,
          ) +
          emailButton(`${SITE_URL}/produit/${encodeURIComponent(productSlug)}`, "Revoir le produit"),
      ),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reserve]", err);
    return NextResponse.json({ error: "Envoi impossible." }, { status: 500 });
  }
}
