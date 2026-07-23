import { getProducts } from "@/lib/data/catalog";

export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://madshop.fr";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Flux produits au format RSS 2.0 / Google Shopping (namespace g:).
 * Compatible Google Merchant Center et Meta Catalog (Advantage+).
 * URL à déclarer : https://votre-domaine/feed.xml
 */
export async function GET() {
  const products = await getProducts();

  const items = products
    .map((p) => {
      const url = `${SITE}/produit/${p.slug}`;
      const image = `${SITE}/products/${p.images[0]}`;
      const price = (p.priceCents / 100).toFixed(2);
      return `
    <item>
      <g:id>${esc(p.slug)}</g:id>
      <g:title>${esc(p.name)}</g:title>
      <g:description>${esc(p.shortDescription)}</g:description>
      <g:link>${url}</g:link>
      <g:image_link>${image}</g:image_link>
      <g:availability>${p.inStock ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${price} EUR</g:price>${
        p.compareAtCents
          ? `\n      <g:sale_price>${price} EUR</g:sale_price>`
          : ""
      }
      <g:brand>MAD Shop</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>Electronics</g:google_product_category>
      <g:product_type>${esc(p.category)}</g:product_type>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>MAD Shop</title>
    <link>${SITE}</link>
    <description>La qualité à petit prix — audio, sécurité et objets connectés.</description>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
