import { NextResponse } from "next/server";
import { readRecoveryToken, createCheckoutSession } from "@/lib/checkout";
import { getAbandonedCart } from "@/lib/data/abandoned";
import { enforceRateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/config";

/**
 * Reprise d'un panier abandonné depuis l'email de relance.
 *
 * Un clic depuis la boîte mail ramène directement au paiement, panier
 * reconstitué et adresse pré-remplie. Chaque étape supplémentaire entre
 * l'email et le paiement fait perdre une partie des clients récupérés.
 */
export async function GET(req: Request) {
  const limited = enforceRateLimit(req, "panier-reprendre", 20, 15 * 60_000);
  if (limited) return limited;

  const token = new URL(req.url).searchParams.get("token");
  const sessionId = token ? readRecoveryToken(token) : null;

  if (!sessionId) {
    return NextResponse.redirect(`${SITE_URL}/panier?reprise=expiree`, 303);
  }

  const cart = await getAbandonedCart(sessionId);
  if (!cart || cart.recoveredAt) {
    return NextResponse.redirect(`${SITE_URL}/panier?reprise=introuvable`, 303);
  }

  const result = await createCheckoutSession({
    items: cart.items,
    customerEmail: cart.email,
    metadata: { recovered_from: sessionId },
  });

  if (!result.ok || !result.url) {
    // Produit épuisé entre-temps, ou paiement indisponible : on renvoie vers
    // le panier plutôt que d'afficher une erreur technique.
    return NextResponse.redirect(`${SITE_URL}/panier?reprise=indisponible`, 303);
  }

  console.info("[relance] panier repris", sessionId);

  return NextResponse.redirect(result.url, 303);
}
