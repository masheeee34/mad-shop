import { NextResponse } from "next/server";
import { z } from "zod";
import { priceCart } from "@/lib/checkout";
import { enforceRateLimit } from "@/lib/rate-limit";

/**
 * Détail chiffré d'un panier, sans rien créer côté Stripe.
 *
 * Le portefeuille (Apple Pay, Google Pay) doit afficher son récapitulatif au
 * moment précis du clic, sans attendre le réseau. Le composant récupère donc
 * ce détail à l'avance et le garde en mémoire ; le montant réellement débité
 * est recalculé par le serveur au moment de payer, et la transaction est
 * refusée s'il a changé entre-temps.
 */
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
});

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "express-quote", 60, 5 * 60_000);
  if (limited) return limited;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Panier invalide." }, { status: 400 });
  }

  const priced = await priceCart(parsed.data.items, parsed.data.promoCode);
  if (!priced.ok) {
    return NextResponse.json({ error: priced.error }, { status: priced.status });
  }

  const { lines, subtotalCents, discountCents, shippingCents, totalCents, freeShipping } =
    priced.cart;

  return NextResponse.json(
    {
      lines: lines.map((l) => ({
        name: l.name,
        quantity: l.quantity,
        amount: l.unitCents * l.quantity,
      })),
      subtotalCents,
      discountCents,
      shippingCents,
      totalCents,
      freeShipping,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
