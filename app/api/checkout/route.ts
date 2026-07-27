import { NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession } from "@/lib/checkout";
import { currentCustomer } from "@/lib/customer-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/config";

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

/**
 * Base des URL de retour. On n'utilise l'en-tête `Origin` que s'il correspond
 * au domaine du site : sinon un tiers pourrait faire pointer les redirections
 * Stripe vers un domaine qu'il contrôle.
 */
function resolveOrigin(req: Request): string {
  const origin = req.headers.get("origin");
  if (!origin) return SITE_URL;
  try {
    if (new URL(origin).origin === new URL(SITE_URL).origin) return origin;
  } catch {
    /* en-tête malformé : on retombe sur l'URL configurée */
  }
  return SITE_URL;
}

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "checkout", 15, 5 * 60_000);
  if (limited) return limited;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Panier invalide." }, { status: 400 });
  }

  // Un client connecté n'a pas à ressaisir son adresse, et son panier
  // devient identifiable en cas d'abandon.
  const customerEmail = (await currentCustomer()) ?? undefined;

  const result = await createCheckoutSession({
    items: parsed.data.items,
    promoCode: parsed.data.promoCode,
    origin: resolveOrigin(req),
    customerEmail,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if (result.url === null) {
    return NextResponse.json(
      { url: null, error: "Paiement en ligne bientôt disponible." },
      { status: 200 },
    );
  }

  return NextResponse.json({ url: result.url });
}
