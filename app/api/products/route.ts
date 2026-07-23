import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data/catalog";

/** Liste allégée pour la recherche instantanée du header. */
export async function GET() {
  const products = await getProducts();
  const slim = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    priceCents: p.priceCents,
    image: p.images[0],
    shortDescription: p.shortDescription,
  }));
  return NextResponse.json({ products: slim });
}
