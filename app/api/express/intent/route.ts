import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { priceCart } from "@/lib/checkout";
import { currentCustomer } from "@/lib/customer-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { SHIPPING_COUNTRIES } from "@/lib/config";

/**
 * Intention de paiement pour le tunnel express (Apple Pay / Google Pay).
 *
 * Créée seulement au moment de valider, une fois l'adresse connue : une
 * intention par ouverture du portefeuille encombrerait le tableau de bord
 * Stripe d'abandons sans intérêt.
 *
 * Le montant n'est jamais celui annoncé par le client : il est entièrement
 * recalculé ici à partir des seuls identifiants produits, par la même
 * fonction que le tunnel classique.
 */
const addressSchema = z.object({
  line1: z.string().max(200).optional(),
  line2: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
  state: z.string().max(120).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().length(2).optional(),
});

const schema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().min(1).max(120),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(20),
  promoCode: z.string().max(40).optional(),
  /** Montant affiché par le portefeuille, pour détecter tout écart. */
  expectedTotalCents: z.number().int().min(0),
  email: z.string().email().max(200).optional(),
  name: z.string().max(200).optional(),
  phone: z.string().max(40).optional(),
  shipping: addressSchema.optional(),
});

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "express-intent", 15, 5 * 60_000);
  if (limited) return limited;

  if (!stripe) {
    return NextResponse.json(
      { error: "Paiement en ligne indisponible." },
      { status: 503 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Panier invalide." }, { status: 400 });
  }

  const { items, promoCode, expectedTotalCents, email, name, phone, shipping } =
    parsed.data;

  const priced = await priceCart(items, promoCode);
  if (!priced.ok) {
    return NextResponse.json({ error: priced.error }, { status: priced.status });
  }

  const { totalCents, cartForMetadata, promo } = priced.cart;

  /**
   * Un écart signifie que le catalogue a bougé entre l'ouverture de la fiche
   * et la validation. Débiter un montant que le client n'a pas vu s'afficher
   * est le pire scénario possible : on refuse et on le renvoie au panier.
   */
  if (totalCents !== expectedTotalCents) {
    return NextResponse.json(
      {
        error:
          "Le montant a changé depuis l'affichage de cette page. Vérifiez votre panier.",
      },
      { status: 409 },
    );
  }

  if (
    shipping?.country &&
    !(SHIPPING_COUNTRIES as readonly string[]).includes(shipping.country.toUpperCase())
  ) {
    return NextResponse.json(
      { error: "Nous ne livrons pas encore dans ce pays." },
      { status: 400 },
    );
  }

  // Un client connecté reste rattaché à son compte même s'il paie via un
  // portefeuille associé à une autre adresse.
  const sessionEmail = (await currentCustomer()) ?? undefined;

  try {
    const intent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      ...(email ? { receipt_email: email } : {}),
      ...(shipping?.line1
        ? {
            shipping: {
              name: name || email || "Client",
              ...(phone ? { phone } : {}),
              address: {
                line1: shipping.line1,
                ...(shipping.line2 ? { line2: shipping.line2 } : {}),
                ...(shipping.city ? { city: shipping.city } : {}),
                ...(shipping.state ? { state: shipping.state } : {}),
                ...(shipping.postal_code ? { postal_code: shipping.postal_code } : {}),
                ...(shipping.country ? { country: shipping.country.toUpperCase() } : {}),
              },
            },
          }
        : {}),
      metadata: {
        // Même format que les sessions Checkout : le webhook relit le panier
        // validé de la même manière, quel que soit le parcours.
        cart: JSON.stringify(cartForMetadata).slice(0, 490),
        express: "1",
        ...(promo ? { promo: promo.code } : {}),
        ...(email ? { customer_email: email } : {}),
        ...(name ? { customer_name: name.slice(0, 120) } : {}),
        ...(sessionEmail ? { account_email: sessionEmail } : {}),
      },
    });

    return NextResponse.json({
      clientSecret: intent.client_secret,
      totalCents,
    });
  } catch (err) {
    console.error("[express] intention", err);
    return NextResponse.json({ error: "Erreur lors du paiement." }, { status: 500 });
  }
}
