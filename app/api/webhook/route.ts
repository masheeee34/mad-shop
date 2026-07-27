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
import { decrementStock, getProduct } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/utils";
import { escapeHtml, sanitizeHeader } from "@/lib/sanitize";
import { SITE_URL } from "@/lib/config";

/** Le corps brut est nécessaire à la vérification de signature. */
export const dynamic = "force-dynamic";

type CartEntry = { slug: string; quantity: number };

/**
 * Relit le panier validé au moment du paiement.
 * Les deux parcours l'écrivent au même format : session Checkout pour le
 * tunnel classique, intention de paiement pour le tunnel express.
 */
function parseCart(source: { metadata?: Stripe.Metadata | null }): CartEntry[] {
  const raw = source.metadata?.cart;
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

import { itemsFromCart, fulfillOrder, type CartEntry } from "@/lib/orders/fulfill";

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

  /**
   * Paiement express (Apple Pay / Google Pay) : il n'y a pas de session
   * Checkout, seulement une intention de paiement.
   *
   * Le marqueur `express` est indispensable : une session Checkout produit
   * elle aussi un `payment_intent.succeeded`, et sans ce filtre chaque
   * commande classique serait enregistrée deux fois.
   */
  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    if (intent.metadata?.express !== "1") {
      return NextResponse.json({ received: true, ignored: "not-express" });
    }

    const cart = parseCart(intent);
    const email = intent.metadata?.customer_email ?? intent.receipt_email ?? "";
    const name = intent.metadata?.customer_name ?? intent.shipping?.name ?? "";

    await fulfillOrder({
      reference: intent.id,
      email,
      name,
      totalCents: intent.amount_received || intent.amount,
      // Une intention n'a pas de lignes : les libellés sont relus au
      // catalogue à partir du panier validé au moment du paiement.
      items: await itemsFromCart(cart),
      cart,
    });

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

  await fulfillOrder({
    reference: session.id,
    email: session.customer_details?.email ?? "",
    name: session.customer_details?.name ?? "",
    totalCents: session.amount_total ?? 0,
    items,
    cart: parseCart(session),
  });

  return NextResponse.json({ received: true });
}
