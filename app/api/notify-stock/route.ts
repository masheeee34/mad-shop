import { NextResponse } from "next/server";
import { z } from "zod";
import { addNotification } from "@/lib/data/notifications";
import { getProduct } from "@/lib/data/catalog";
import { resend, FROM_EMAIL, SHOP_EMAIL, emailShell, emailRow } from "@/lib/email";
import { escapeHtml, sanitizeHeader } from "@/lib/sanitize";
import { enforceRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  productSlug: z.string().min(1).max(120),
  email: z.string().email("Adresse email invalide."),
});

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "notify-stock", 5, 10 * 60_000);
  if (limited) return limited;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Champs invalides." },
      { status: 400 },
    );
  }

  const { productSlug, email } = parsed.data;

  const product = await getProduct(productSlug);
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  }

  try {
    await addNotification(productSlug, product.name, email);
  } catch (err) {
    console.error("[notify-stock]", err);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }

  if (resend) {
    // Notification interne : ne doit jamais faire échouer la demande client.
    await resend.emails
      .send({
        from: FROM_EMAIL,
        to: SHOP_EMAIL,
        subject: sanitizeHeader(`Alerte stock demandée — ${product.name}`),
        html: emailShell(
          "Demande de réapprovisionnement",
          emailRow("Produit", escapeHtml(product.name)) +
            emailRow("Email client", escapeHtml(email)),
        ),
      })
      .catch((e) => console.error("[notify-stock] email", e));
  }

  return NextResponse.json({
    success: true,
    message: "Votre demande d'alerte a bien été enregistrée.",
  });
}
