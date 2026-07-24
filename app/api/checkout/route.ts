import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { getProduct } from "@/lib/data/catalog";
import { validatePromo } from "@/lib/data/promos";

const schema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1),
  promoCode: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Panier invalide." }, { status: 400 });
  }

  if (!stripe) {
    // Mode démo : pas de clé Stripe => on l'indique proprement au client.
    return NextResponse.json(
      { url: null, error: "Paiement en ligne bientôt disponible." },
      { status: 200 },
    );
  }

  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  // On reconstruit les prix côté serveur depuis le catalogue (jamais le client).
  const line_items = [];
  for (const { slug, quantity } of parsed.data.items) {
    const product = await getProduct(slug);
    const stock = product?.stockQuantity ?? (product?.inStock ? 10 : 0);
    if (!product || !product.inStock || stock <= 0) {
      return NextResponse.json(
        { error: `Le produit "${product?.name ?? slug}" est en rupture de stock.` },
        { status: 400 },
      );
    }
    if (quantity > stock) {
      return NextResponse.json(
        { error: `Stock insuffisant pour "${product.name}" (${stock} disponible(s)).` },
        { status: 400 },
      );
    }
    line_items.push({
      quantity,
      price_data: {
        currency: "eur",
        unit_amount: product.priceCents,
        product_data: {
          name: product.name,
          description: product.shortDescription,
        },
      },
    });
  }

  if (line_items.length === 0) {
    return NextResponse.json({ error: "Aucun produit valide dans le panier." }, { status: 400 });
  }

  // Code promo (optionnel) : on crée un coupon Stripe à la volée si valide.
  let discounts: { coupon: string }[] | undefined;
  const promo = parsed.data.promoCode
    ? await validatePromo(parsed.data.promoCode)
    : null;
  if (promo) {
    const coupon = await stripe.coupons.create(
      promo.type === "percent"
        ? { percent_off: promo.value, duration: "once", name: `Code ${promo.code}` }
        : {
            amount_off: promo.value,
            currency: "eur",
            duration: "once",
            name: `Code ${promo.code}`,
          },
    );
    discounts = [{ coupon: coupon.id }];
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      discounts,
      locale: "fr",
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: ["FR", "BE", "LU", "CH", "DE", "ES", "IT", "NL", "PT"],
      },
      phone_number_collection: { enabled: true },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 490, currency: "eur" },
            display_name: "Livraison standard (24-48h)",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 1 },
              maximum: { unit: "business_day", value: 2 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "eur" },
            display_name: "Livraison offerte dès 60 €",
          },
        },
      ],
      success_url: `${origin}/commande/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/panier`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: "Erreur lors du paiement." }, { status: 500 });
  }
}
