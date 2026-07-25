import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import {
  resend,
  FROM_EMAIL,
  SHOP_EMAIL,
  emailShell,
  emailRow,
  emailText,
  emailButton,
} from "@/lib/email";
import { createOrder, findOrderBySession, type OrderItem } from "@/lib/data/orders";
import { recordAbandonedCart, markRecoveredByEmail } from "@/lib/data/abandoned";
import { notifyAbandonedCart } from "@/lib/notifications";
import { decrementStock } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/utils";
import { escapeHtml, sanitizeHeader } from "@/lib/sanitize";
import { SITE_URL } from "@/lib/config";

/** Le corps brut est nécessaire à la vérification de signature. */
export const dynamic = "force-dynamic";

/** Relit le panier validé au moment du paiement (metadata de la session). */
function parseCart(session: Stripe.Checkout.Session): { slug: string; quantity: number }[] {
  const raw = session.metadata?.cart;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is [string, number] =>
          Array.isArray(entry) &&
          typeof entry[0] === "string" &&
          Number.isInteger(entry[1]),
      )
      .map(([slug, quantity]) => ({ slug, quantity }));
  } catch {
    return [];
  }
}

/**
 * Enregistre un panier abandonné, puis lance la relance.
 *
 * Stripe fait expirer une session 24 h après sa création : l'email part donc
 * naturellement le lendemain de l'abandon, sans avoir besoin d'un planificateur
 * sur l'hébergement.
 */
async function handleExpiredSession(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email ?? session.customer_email ?? "";
  const items = parseCart(session);

  // Sans adresse ni contenu, il n'y a rien à relancer.
  if (!email || items.length === 0) return;

  // Le client a peut-être terminé sa commande dans une autre session.
  if (await findOrderBySession(session.id)) return;

  const cart = await recordAbandonedCart({
    sessionId: session.id,
    email: email.toLowerCase(),
    items,
    totalCents: session.amount_total ?? 0,
  });

  // `null` si la session avait déjà été enregistrée (webhook rejoué).
  if (cart) await notifyAbandonedCart(cart);
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");

  if (!stripe || !secret) {
    console.warn("[webhook] Stripe non configuré — événement ignoré.");
    return NextResponse.json({ received: true, skipped: true });
  }
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("[webhook] signature invalide", err);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  // Session ouverte puis jamais réglée : c'est un panier abandonné.
  if (event.type === "checkout.session.expired") {
    await handleExpiredSession(event.data.object as Stripe.Checkout.Session);
    return NextResponse.json({ received: true });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Un paiement non abouti (session expirée, virement en attente) ne doit
  // ni créer de commande ni entamer le stock.
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, ignored: "unpaid" });
  }

  // Idempotence : Stripe rejoue le webhook tant qu'il n'a pas reçu de 2xx.
  const alreadyHandled = await findOrderBySession(session.id);
  if (alreadyHandled) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const email = session.customer_details?.email ?? "";
  const name = session.customer_details?.name ?? "";
  const totalCents = session.amount_total ?? 0;
  const total = formatPrice(totalCents);

  let items: OrderItem[] = [];
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
    });
    items = lineItems.data.map((li) => ({
      name: li.description ?? "Article",
      quantity: li.quantity ?? 1,
    }));
  } catch (err) {
    console.error("[webhook] line items", err);
  }

  const order = await createOrder({
    email,
    name,
    totalCents,
    items,
    sessionId: session.id,
  });

  // Le client a fini par acheter : on arrête de le relancer, y compris pour
  // un panier abandonné antérieur qu'il aurait recomposé de zéro.
  if (email) await markRecoveredByEmail(email);

  // Décrémente le stock réel une fois le paiement encaissé.
  const cart = parseCart(session);
  if (cart.length > 0) {
    try {
      await decrementStock(cart);
      revalidatePath("/");
      revalidatePath("/boutique");
      for (const { slug } of cart) revalidatePath(`/produit/${slug}`);
    } catch (err) {
      console.error("[webhook] stock", err);
    }
  }

  if (resend && email) {
    const itemsHtml = items
      .map(
        (i) =>
          `<li style="color:#a29c92;margin-bottom:4px">${i.quantity} × ${escapeHtml(i.name)}</li>`,
      )
      .join("");

    await resend.emails
      .send({
        from: FROM_EMAIL,
        to: email,
        subject: sanitizeHeader(`Commande ${order.number} confirmée`),
        html: emailShell(
          "Merci pour votre commande",
          emailText(`Bonjour ${escapeHtml(name || "")},`) +
            emailText(
              `Votre commande <strong style="color:#c6a46a">${order.number}</strong>, d'un montant de <strong style="color:#c6a46a">${total}</strong>, est en préparation. Expédition sous 24 à 48 h ouvrées.`,
            ) +
            `<ul style="padding-left:18px;margin:16px 0">${itemsHtml}</ul>` +
            emailText("Suivez son acheminement à tout moment avec ce numéro.") +
            emailButton(`${SITE_URL}/suivi`, "Suivre ma commande"),
        ),
      })
      .catch((e) => console.error("[webhook] email client", e));

    await resend.emails
      .send({
        from: FROM_EMAIL,
        to: SHOP_EMAIL,
        subject: sanitizeHeader(`Nouvelle commande ${order.number} — ${total}`),
        html: emailShell(
          "Nouvelle commande",
          emailRow("Numéro", order.number) +
            emailRow("Client", `${escapeHtml(name)} (${escapeHtml(email)})`) +
            emailRow("Montant", total) +
            `<ul style="padding-left:18px;margin:16px 0">${itemsHtml}</ul>`,
        ),
      })
      .catch((e) => console.error("[webhook] email interne", e));
  }

  return NextResponse.json({ received: true });
}
