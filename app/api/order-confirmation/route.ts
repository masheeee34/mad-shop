import { NextResponse } from "next/server";
import { findOrderBySession } from "@/lib/data/orders";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getProducts } from "@/lib/data/catalog";

/**
 * Détail de la commande qui vient d'être payée, pour la page de succès.
 *
 * Sert à remonter aux régies publicitaires le montant réellement encaissé
 * (port et remise compris) plutôt qu'une estimation reconstituée depuis le
 * panier : une valeur de conversion fausse fausse tout le calcul de ROAS.
 *
 * L'identifiant de session Stripe n'est connu que de l'acheteur, qui le reçoit
 * dans l'URL de retour ; aucune donnée nominative n'est renvoyée.
 */
export async function GET(req: Request) {
  const limited = enforceRateLimit(req, "order-confirmation", 20, 5 * 60_000);
  if (limited) return limited;

  // `cs_…` pour le tunnel classique, `pi_…` pour le paiement express : la
  // commande est enregistrée sous la même clé dans les deux cas.
  const params = new URL(req.url).searchParams;
  const reference = params.get("session_id") ?? params.get("payment_intent");

  if (!reference || !/^(cs|pi)_[A-Za-z0-9_]+$/.test(reference)) {
    return NextResponse.json({ found: false }, { status: 400 });
  }

  const order = await findOrderBySession(reference);
  if (!order) {
    // Le webhook Stripe n'a pas encore été traité : la page réessaiera.
    return NextResponse.json({ found: false });
  }

  const products = await getProducts();
  const itemsWithSlug = order.items.map((item) => {
    const product = products.find(
      (p) => p.name.trim().toLowerCase() === item.name.trim().toLowerCase()
    );
    return { ...item, slug: product?.slug };
  });

  return NextResponse.json(
    {
      found: true,
      order: {
        number: order.number,
        totalCents: order.totalCents,
        items: itemsWithSlug,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
