import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAuthed } from "@/lib/admin-auth";
import { z } from "zod";
import { createCheckoutSession, priceCart } from "@/lib/checkout";
import { currentCustomer } from "@/lib/customer-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/config";
import { getSettings } from "@/lib/data/settings";
import { fulfillOrder, itemsFromCart } from "@/lib/orders/fulfill";

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
  try {
    const limited = enforceRateLimit(req, "checkout", 15, 5 * 60_000);
    if (limited) return limited;

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Panier invalide." }, { status: 400 });
    }

    const customerEmail = (await currentCustomer()) ?? undefined;
    const origin = resolveOrigin(req);

    // --- MODE TEST (Bypass Stripe) ---
    const settings = await getSettings();
    const store = await cookies();
    const isTestMode = settings.testMode || (store.get("test_mode")?.value === "1" && await isAuthed());

    if (isTestMode) {
      const priced = await priceCart(parsed.data.items, parsed.data.promoCode, origin);
      if (!priced.ok) {
        return NextResponse.json({ error: priced.error }, { status: priced.status });
      }
      
      const { totalCents, cartForMetadata } = priced.cart;
      const cart = cartForMetadata.map(([slug, quantity]) => ({ slug, quantity }));
      const items = await itemsFromCart(cart);
      const sessionId = `test_${globalThis.crypto.randomUUID()}`;
      const email = customerEmail || process.env.EMAIL_TO || "test@madshop.fr";
      
      await fulfillOrder({
        reference: sessionId,
        email,
        name: "Client Test (Mode Bypass)",
        totalCents,
        items,
        cart,
      });
      
      return NextResponse.json({ url: `${origin}/commande/succes?session_id=${sessionId}` });
    }
    // ---------------------------------

    const result = await createCheckoutSession({
      items: parsed.data.items,
      promoCode: parsed.data.promoCode,
      origin,
      customerEmail,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    if (result.clientSecret === null) {
      return NextResponse.json(
        { clientSecret: null, error: "Paiement en ligne bientôt disponible." },
        { status: 200 },
      );
    }

    return NextResponse.json({ clientSecret: result.clientSecret });
  } catch (err: any) {
    console.error("[checkout route error]", err);
    return NextResponse.json(
      { error: "Fatal error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}

