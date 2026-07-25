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

/** Libellés de commande reconstitués depuis le catalogue. */
async function itemsFromCart(cart: CartEntry[]): Promise<OrderItem[]> {
  const items: OrderItem[] = [];
  for (const { slug, quantity } of cart) {
    const product = await getProduct(slug);
    items.push({ name: product?.name ?? slug, quantity });
  }
  return items;
}

/**
 * Enregistre la commande et déclenche tout ce qui en découle : stock, fin des
 * relances, emails.
 *
 * Partagée par le tunnel classique et le paiement express — une commande doit
 * être traitée exactement de la même façon quel que soit le moyen par lequel
 * elle est arrivée.
 */
async function fulfillOrder({
  reference,
  email,
  name,
  totalCents,
  items,
  cart,
}: {
  /** Identifiant Stripe : `cs_…` ou `pi_…`. Sert de clé d'idempotence. */
  reference: string;
  email: string;
  name: string;
  totalCents: number;
  items: OrderItem[];
  cart: CartEntry[];
}): Promise<void> {
  // Idempotence : Stripe rejoue le webhook tant qu'il n'a pas reçu de 2xx.
  if (await findOrderBySession(reference)) return;

  const order = await createOrder({
    email,
    name,
    totalCents,
    items,
    sessionId: reference,
  });

  const total = formatPrice(totalCents);

  // Le client a fini par acheter : on arrête de le relancer, y compris pour
  // un panier abandonné antérieur qu'il aurait recomposé de zéro.
  if (email) await markRecoveredByEmail(email);

  // Décrémente le stock réel une fois le paiement encaissé.
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

  if (!resend || !email) return;

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
