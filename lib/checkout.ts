import "server-only";
import crypto from "node:crypto";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { getProduct } from "@/lib/data/catalog";
import { validatePromo } from "@/lib/data/promos";
import {
  FREE_SHIPPING_CENTS,
  SHIPPING_CENTS,
  SHIPPING_COUNTRIES,
  SITE_URL,
} from "@/lib/config";

/**
 * Construction d'une session de paiement Stripe.
 *
 * Partagée par le passage en caisse classique et par le lien de reprise
 * envoyé après un panier abandonné : les deux doivent appliquer exactement
 * les mêmes règles de prix, de stock et de livraison.
 */

export type CheckoutItem = { slug: string; quantity: number };

/* -------------------------------------------------------------------------- */
/*  Lien de reprise de panier                                                  */
/* -------------------------------------------------------------------------- */

/** Validité du lien envoyé dans l'email de relance. */
const RECOVERY_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

const DEV_SECRET = crypto.randomBytes(32).toString("hex");

function recoverySecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.ADMIN_SECRET;
  return secret && secret.length >= 32 ? secret : DEV_SECRET;
}

function signRecovery(payload: string): string {
  return crypto.createHmac("sha256", recoverySecret()).update(payload).digest("hex");
}

/**
 * Jeton de reprise : `r1.<session>.<expiration>.<signature>`.
 * Il ne contient aucune donnée personnelle — juste la référence de la session
 * abandonnée, dont le contenu est relu côté serveur.
 */
export function makeRecoveryToken(sessionId: string): string {
  const exp = Date.now() + RECOVERY_TTL_MS;
  const payload = `r1.${sessionId}.${exp}`;
  return `${payload}.${signRecovery(payload)}`;
}

export function readRecoveryToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 4) return null;

  const [version, sessionId, exp, mac] = parts;
  if (version !== "r1" || !/^\d+$/.test(exp)) return null;

  const expected = signRecovery(`${version}.${sessionId}.${exp}`);
  if (mac.length !== expected.length) return null;

  try {
    if (!crypto.timingSafeEqual(Buffer.from(mac, "hex"), Buffer.from(expected, "hex"))) {
      return null;
    }
  } catch {
    return null;
  }

  return Number(exp) > Date.now() ? sessionId : null;
}

export type CheckoutResult =
  | { ok: true; url: string | null }
  | { ok: false; status: number; error: string };

/**
 * Coupon déterministe : un identifiant par code promo, réutilisé d'une
 * commande à l'autre plutôt que recréé à chaque passage en caisse.
 */
async function getOrCreateCoupon(
  client: Stripe,
  promo: { code: string; type: "percent" | "amount"; value: number },
): Promise<string> {
  const id = `mad-${promo.code.toLowerCase()}-${promo.type}-${promo.value}`;
  try {
    const existing = await client.coupons.retrieve(id);
    if (!existing.deleted) return existing.id;
  } catch {
    /* coupon inexistant : on le crée ci-dessous */
  }

  const created = await client.coupons.create({
    id,
    duration: "once",
    name: `Code ${promo.code}`,
    ...(promo.type === "percent"
      ? { percent_off: promo.value }
      : { amount_off: promo.value, currency: "eur" }),
  });
  return created.id;
}

export async function createCheckoutSession({
  items,
  promoCode,
  origin = SITE_URL,
  customerEmail,
  metadata = {},
}: {
  items: CheckoutItem[];
  promoCode?: string;
  origin?: string;
  /** Pré-remplit l'email : indispensable pour identifier un panier abandonné. */
  customerEmail?: string;
  metadata?: Record<string, string>;
}): Promise<CheckoutResult> {
  if (!stripe) {
    return { ok: true, url: null };
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const cartForMetadata: [string, number][] = [];
  let subtotalCents = 0;

  // Fusionne les doublons pour que le contrôle de stock porte sur la
  // quantité totale demandée, et non sur chaque ligne isolément.
  const merged = new Map<string, number>();
  for (const { slug, quantity } of items) {
    merged.set(slug, (merged.get(slug) ?? 0) + quantity);
  }

  for (const [slug, quantity] of merged) {
    const product = await getProduct(slug);
    if (!product) {
      return { ok: false, status: 400, error: "Produit introuvable." };
    }

    const stock = product.stockQuantity ?? (product.inStock ? 10 : 0);
    if (!product.inStock || stock <= 0) {
      return {
        ok: false,
        status: 409,
        error: `« ${product.name} » est en rupture de stock.`,
      };
    }
    if (quantity > stock) {
      return {
        ok: false,
        status: 409,
        error: `Stock insuffisant pour « ${product.name} » : ${stock} disponible(s).`,
      };
    }

    subtotalCents += product.priceCents * quantity;
    cartForMetadata.push([slug, quantity]);

    // Vignette affichée dans le tunnel Stripe (omise si le produit n'a pas
    // encore de visuel : Stripe rejette une URL invalide).
    const cover = product.images[0]?.trim();
    const imageUrl = cover
      ? /^https?:\/\//.test(cover)
        ? cover
        : `${origin}${cover.startsWith("/") ? "" : "/products/"}${cover}`
      : undefined;

    line_items.push({
      quantity,
      price_data: {
        currency: "eur",
        unit_amount: product.priceCents,
        product_data: {
          name: product.name,
          description: product.shortDescription,
          ...(imageUrl ? { images: [imageUrl] } : {}),
        },
      },
    });
  }

  if (line_items.length === 0) {
    return { ok: false, status: 400, error: "Aucun produit valide dans le panier." };
  }

  const promo = promoCode ? await validatePromo(promoCode) : null;

  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
  if (promo) {
    try {
      discounts = [{ coupon: await getOrCreateCoupon(stripe, promo) }];
    } catch (err) {
      // Un code promo défaillant ne doit pas empêcher la commande.
      console.error("[checkout] coupon", err);
    }
  }

  /**
   * Un seul mode de livraison est proposé, celui auquel le panier a droit :
   * offrir les deux permettrait de choisir « offerte » sans atteindre le seuil.
   */
  const freeShipping = subtotalCents >= FREE_SHIPPING_CENTS;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      discounts,
      locale: "fr",
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      billing_address_collection: "auto",
      shipping_address_collection: {
        // SHIPPING_COUNTRIES est figé (`as const`) : Stripe attend un tableau
        // mutable de codes ISO issus de sa propre énumération.
        allowed_countries: [
          ...SHIPPING_COUNTRIES,
        ] as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
      },
      phone_number_collection: { enabled: true },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: freeShipping ? 0 : SHIPPING_CENTS,
              currency: "eur",
            },
            display_name: freeShipping
              ? "Livraison offerte (24-48 h)"
              : "Livraison standard (24-48 h)",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 1 },
              maximum: { unit: "business_day", value: 2 },
            },
          },
        },
      ],
      allow_promotion_codes: promo ? undefined : false,
      // Le panier validé côté serveur voyage avec la session : le webhook
      // s'en sert pour décrémenter les stocks et pour la relance.
      metadata: {
        ...metadata,
        cart: JSON.stringify(cartForMetadata).slice(0, 490),
        ...(promo ? { promo: promo.code } : {}),
      },
      success_url: `${origin}/commande/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/panier`,
    });

    return { ok: true, url: session.url };
  } catch (err) {
    console.error("[checkout]", err);
    return { ok: false, status: 500, error: "Erreur lors du paiement." };
  }
}
