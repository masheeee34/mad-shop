import "server-only";
import {
  resend,
  FROM_EMAIL,
  emailShell,
  emailRow,
  emailText,
  emailButton,
} from "@/lib/email";
import { carrierLabel, trackingUrl } from "@/lib/carriers";
import { notifyByPush } from "@/lib/push";
import { escapeHtml, sanitizeHeader } from "@/lib/sanitize";
import { SITE_URL } from "@/lib/config";
import type { Order, OrderStatus } from "@/lib/data/orders";
import type { Product } from "@/lib/products";
import { getNotifications } from "@/lib/data/notifications";
import { markReminded, type AbandonedCart } from "@/lib/data/abandoned";
import { makeRecoveryToken } from "@/lib/checkout";
import { getProduct } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/utils";

/**
 * Emails déclenchés par la vie de la boutique, en dehors du tunnel d'achat :
 * changement de statut d'une commande et retour en stock d'un produit.
 *
 * Toutes ces fonctions sont volontairement silencieuses en cas d'échec : un
 * problème d'envoi ne doit jamais faire échouer l'action d'administration qui
 * l'a déclenché.
 */

/* -------------------------------------------------------------------------- */
/*  Suivi de commande                                                          */
/* -------------------------------------------------------------------------- */

/** Contenu de l'email selon le nouveau statut. `null` = pas de notification. */
const STATUS_EMAIL: Partial<
  Record<OrderStatus, { subject: string; title: string; body: string }>
> = {
  expediee: {
    subject: "Votre commande est en route",
    title: "Votre commande est expédiée",
    body:
      "Votre colis vient de quitter notre entrepôt. Comptez 24 à 48 h ouvrées " +
      "pour la livraison.",
  },
  livree: {
    subject: "Votre commande est livrée",
    title: "Bonne réception",
    body:
      "Votre commande est marquée comme livrée. Un souci, une question ? " +
      "Répondez simplement à cet email, une vraie personne vous lira.",
  },
  annulee: {
    subject: "Votre commande a été annulée",
    title: "Commande annulée",
    body:
      "Votre commande a été annulée. Si un paiement a été encaissé, le " +
      "remboursement est automatique et arrive sous 5 à 10 jours ouvrés.",
  },
  // « En préparation » est déjà couvert par l'email de confirmation d'achat.
};

/** Texte court de la notification push, par statut. */
const STATUS_PUSH: Partial<Record<OrderStatus, string>> = {
  expediee: "Votre colis est parti. Suivez-le en un geste.",
  livree: "Votre commande est livrée. Bonne réception !",
  annulee: "Votre commande a été annulée.",
};

/**
 * Prévient le client que sa commande a changé d'état, par notification puis
 * par email. C'est le message que les acheteurs attendent le plus après la
 * confirmation : sans lui, le service client reçoit des « où est ma
 * commande ? ».
 */
export async function notifyOrderStatus(order: Order): Promise<void> {
  const template = STATUS_EMAIL[order.status];
  if (!template || !order.email) return;

  // Le push part avant l'email : c'est lui qui arrive en quelques secondes.
  const pushBody = STATUS_PUSH[order.status];
  if (pushBody) {
    await notifyByPush(order.email, {
      title: `Commande ${order.number}`,
      body: pushBody,
      url: "/suivi",
    });
  }

  if (!resend) return;

  const itemsHtml = order.items
    .map(
      (i) =>
        `<li style="color:#a29c92;margin-bottom:4px">${i.quantity} × ${escapeHtml(i.name)}</li>`,
    )
    .join("");

  /**
   * Le numéro de colis dans l'email, et non seulement sur le site : c'est là
   * que le client le cherche, et un lien direct lui évite de retrouver le bon
   * transporteur puis d'y recopier son numéro.
   */
  const carrier = carrierLabel(order.carrier);
  const url = trackingUrl(order.carrier, order.trackingNumber);
  const trackingHtml = order.trackingNumber
    ? emailRow(
        carrier ? `Colis ${carrier}` : "N° de colis",
        `<strong style="color:#c6a46a">${escapeHtml(order.trackingNumber)}</strong>`,
      )
    : "";

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: order.email,
      subject: sanitizeHeader(`${template.subject} — ${order.number}`),
      html: emailShell(
        template.title,
        emailText(`Bonjour ${escapeHtml(order.name ?? "")},`) +
          emailText(template.body) +
          emailText(
            `Commande <strong style="color:#c6a46a">${order.number}</strong>`,
          ) +
          trackingHtml +
          `<ul style="padding-left:18px;margin:16px 0">${itemsHtml}</ul>` +
          (url
            ? emailButton(url, "Suivre mon colis")
            : emailButton(`${SITE_URL}/suivi`, "Voir le suivi")),
      ),
    });
  } catch (err) {
    console.error("[notifications] statut commande", err);
  }
}

/* -------------------------------------------------------------------------- */
/*  Retour en stock                                                            */
/* -------------------------------------------------------------------------- */

export type RestockResult = { sent: number; failed: number };

/**
 * Prévient les visiteurs inscrits qu'un produit est de nouveau disponible.
 *
 * Ces inscrits sont l'audience la plus qualifiée de la boutique : ils ont
 * demandé ce produit précis. Les emails partent en série et non en parallèle,
 * pour rester sous les limites de débit de Resend.
 */
export async function notifyRestock(product: Product): Promise<RestockResult> {
  const all = await getNotifications();

  // Une seule alerte par adresse, même en cas d'inscriptions répétées.
  const recipients = [
    ...new Set(
      all
        .filter((n) => n.productSlug === product.slug)
        .map((n) => n.email.trim().toLowerCase()),
    ),
  ];

  if (recipients.length === 0) return { sent: 0, failed: 0 };

  const path = `/produit/${encodeURIComponent(product.slug)}`;
  const url = `${SITE_URL}${path}`;

  // Un réassort part vite : la notification arrive avant l'email, et c'est
  // souvent ce qui décide de la vente.
  for (const email of recipients) {
    await notifyByPush(email, {
      title: `${product.name} est de retour`,
      body: "Le produit que vous attendiez est de nouveau disponible.",
      url: path,
    });
  }

  if (!resend) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  for (const email of recipients) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: sanitizeHeader(`${product.name} est de nouveau disponible`),
        html: emailShell(
          "De retour en stock",
          emailText(
            `Vous nous aviez demandé d'être prévenu : <strong style="color:#c6a46a">${escapeHtml(
              product.name,
            )}</strong> est de nouveau disponible.`,
          ) +
            emailText(
              "Les réassorts partent vite. Si ce produit vous intéresse toujours, c'est le moment.",
            ) +
            emailButton(url, "Voir le produit"),
        ),
      });
      sent += 1;
    } catch (err) {
      console.error("[notifications] retour en stock", err);
      failed += 1;
    }
  }

  return { sent, failed };
}

/* -------------------------------------------------------------------------- */
/*  Panier abandonné                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Relance un panier laissé en plan.
 *
 * Le lien renvoie directement vers un paiement pré-rempli : un clic depuis
 * l'email suffit à reprendre là où le client s'était arrêté. Aucun code de
 * réduction n'est offert — habituer les clients à abandonner pour obtenir une
 * remise coûte plus cher que les paniers récupérés.
 */
export async function notifyAbandonedCart(cart: AbandonedCart): Promise<boolean> {
  if (!resend || !cart.email || cart.recoveredAt || cart.remindedAt) return false;

  // Le libellé des produits est relu depuis le catalogue : il a pu changer
  // entre l'abandon et la relance.
  const lines: string[] = [];
  for (const item of cart.items) {
    const product = await getProduct(item.slug);
    if (!product) continue;
    lines.push(
      `<li style="color:#a29c92;margin-bottom:4px">${item.quantity} × ${escapeHtml(
        product.name,
      )} — ${formatPrice(product.priceCents * item.quantity)}</li>`,
    );
  }

  // Tous les produits ont disparu du catalogue : relancer n'a plus de sens.
  if (lines.length === 0) return false;

  const url = `${SITE_URL}/api/panier/reprendre?token=${encodeURIComponent(
    makeRecoveryToken(cart.sessionId),
  )}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: cart.email,
      subject: sanitizeHeader("Votre panier vous attend"),
      html: emailShell(
        "Vous avez oublié quelque chose",
        emailText(
          "Votre sélection est toujours disponible. Reprenez votre commande là où vous l'aviez laissée :",
        ) +
          `<ul style="padding-left:18px;margin:16px 0">${lines.join("")}</ul>` +
          emailButton(url, "Reprendre ma commande") +
          emailText(
            "<span style=\"font-size:12px;color:#6f6a63\">Les stocks ne sont pas réservés. " +
              "Ce lien reste valable 7 jours.</span>",
          ),
      ),
    });
  } catch (err) {
    console.error("[notifications] panier abandonné", err);
    return false;
  }

  await markReminded(cart.sessionId);
  return true;
}
