import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data/catalog";

/**
 * Liste allégée, pour la recherche instantanée, le menu Boutique et les
 * suggestions du panier.
 *
 * Volontairement incomplète : ni promotion, ni description longue, ni
 * quantité exacte en stock. Une page qui affiche une carte produit complète
 * doit lire le catalogue côté serveur, sinon elle annonce des ruptures qui
 * n'existent pas.
 *
 * `available` suffit en revanche pour ne jamais proposer un produit qui sera
 * refusé au moment de payer.
 */
export async function GET() {
  const products = await getProducts();
  const slim = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    priceCents: p.priceCents,
    image: p.images[0],
    shortDescription: p.shortDescription,
    available: p.inStock && (p.stockQuantity ?? 1) > 0,
  }));
  return NextResponse.json({ products: slim });
}
