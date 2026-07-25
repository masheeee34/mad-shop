import { NextResponse } from "next/server";
import { getProduct } from "@/lib/data/catalog";
import { hasPurchased } from "@/lib/data/orders";
import { hasReviewed } from "@/lib/data/reviews";
import { currentCustomer } from "@/lib/customer-auth";
import { enforceRateLimit } from "@/lib/rate-limit";

/**
 * Droit d'écriture d'un avis pour le visiteur courant.
 *
 * Cette information dépend du cookie de session : la calculer dans la page
 * produit la rendrait dynamique et ferait perdre la génération statique de
 * tout le catalogue. Elle est donc récupérée à part, après affichage.
 */
export async function GET(req: Request) {
  const limited = enforceRateLimit(req, "reviews-access", 60, 5 * 60_000);
  if (limited) return limited;

  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ state: "anonymous" });

  const email = await currentCustomer();
  if (!email) return NextResponse.json({ state: "anonymous" });

  const product = await getProduct(slug);
  if (!product) return NextResponse.json({ state: "not-purchased" });

  if (await hasReviewed(slug, email)) {
    return NextResponse.json({ state: "already-reviewed" });
  }
  if (!(await hasPurchased(email, product.name))) {
    return NextResponse.json({ state: "not-purchased" });
  }

  // Prénom proposé par défaut, dérivé de l'adresse : purement cosmétique,
  // et modifiable par le client avant publication.
  const local = email.split("@")[0]?.replace(/[._-]+/g, " ").trim() ?? "";
  const suggestedName = local
    ? local.charAt(0).toUpperCase() + local.slice(1)
    : "";

  return NextResponse.json({ state: "allowed", suggestedName });
}
