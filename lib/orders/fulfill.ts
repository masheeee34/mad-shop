import "server-only";
import { revalidatePath } from "next/cache";
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
import type { Order } from "@/lib/types/data-types";
import { markRecoveredByEmail } from "@/lib/data/abandoned";
import { decrementStock, getProduct } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/utils";
import { escapeHtml, sanitizeHeader } from "@/lib/sanitize";
import { SITE_URL } from "@/lib/config";

export type CartEntry = { slug: string; quantity: number };

/** Libellés de commande reconstitués depuis le catalogue. */
export async function itemsFromCart(cart: CartEntry[]): Promise<OrderItem[]> {
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
 * Partagée par le tunnel classique, le paiement express et le Mode Test.
 */
export async function fulfillOrder({
  reference,
  email,
  name,
  totalCents,
  items,
  cart,
  address,
  stripeInfo,
}: {
  /** Identifiant Stripe : `cs_…` ou `pi_…`. Sert de clé d'idempotence. */
  reference: string;
  email: string;
  name: string;
  totalCents: number;
  items: OrderItem[];
  cart: CartEntry[];
  address?: Order["address"];
  stripeInfo?: Order["stripeInfo"];
}): Promise<void> {
  // Idempotence : on ne recrée pas si la commande existe déjà
  if (await findOrderBySession(reference)) return;

  const order = await createOrder({
    email,
    name,
    totalCents,
    items,
    sessionId: reference,
    address,
    stripeInfo,
  });

  const total = formatPrice(totalCents);

  if (email) await markRecoveredByEmail(email);

  if (cart.length > 0) {
    try {
      await decrementStock(cart);
      revalidatePath("/");
      revalidatePath("/boutique");
      for (const { slug } of cart) revalidatePath(`/produit/${slug}`);
    } catch (err) {
      console.error("[fulfill] stock", err);
    }
  }

  if (!resend || !email) return;

  const itemsHtml = items
    .map(
      (i) =>
        `<li style="color:#a29c92;margin-bottom:4px">${i.quantity} × ${escapeHtml(i.name)}</li>`,
    )
    .join("");

  const addressHtml = address ? `
    <div style="margin: 16px 0; padding: 16px; background: rgba(255,255,255,0.05); border-radius: 8px;">
      <p style="margin:0 0 4px; color:#f4f1ea; font-weight:bold;">Adresse de livraison</p>
      <p style="margin:0; color:#a29c92; line-height:1.4">
        ${escapeHtml(address.line1)}<br>
        ${address.line2 ? escapeHtml(address.line2) + "<br>" : ""}
        ${escapeHtml(address.postal_code)} ${escapeHtml(address.city)}<br>
        ${escapeHtml(address.country)}
      </p>
    </div>
  ` : "";

  const paymentHtml = stripeInfo ? emailRow("Référence paiement", stripeInfo.id) : "";

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
          addressHtml +
          paymentHtml +
          `<ul style="padding-left:18px;margin:16px 0">${itemsHtml}</ul>` +
          emailText("Suivez son acheminement à tout moment avec ce numéro.") +
          emailButton(`${SITE_URL}/suivi`, "Suivre ma commande"),
      ),
    })
    .catch((e) => console.error("[fulfill] email client", e));

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
          paymentHtml +
          addressHtml +
          `<ul style="padding-left:18px;margin:16px 0">${itemsHtml}</ul>`,
      ),
    })
    .catch((e) => console.error("[fulfill] email interne", e));
}
