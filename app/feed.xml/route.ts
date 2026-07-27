import { getProducts } from "@/lib/data/catalog";
import { getProductRating } from "@/lib/data/reviews";
import { escapeXml } from "@/lib/sanitize";
import { productImageUrl } from "@/lib/seo";
import {
  BRAND_NAME,
  BRAND_TAGLINE,
  SITE_URL,
  SHIPPING_CENTS,
  FREE_SHIPPING_CENTS,
  SHIPPING_COUNTRIES,
} from "@/lib/config";

export const revalidate = 3600;

/** Correspondance catégorie interne → taxonomie Google Shopping. */
const GOOGLE_CATEGORY: Record<string, string> = {
  Audio: "Électronique > Audio > Casques et écouteurs",
  Sécurité: "Électronique > Vidéo > Caméras de surveillance",
  Connecté: "Électronique > Électronique grand public",
};

const euros = (cents: number) => `${(cents / 100).toFixed(2)} EUR`;

/**
 * Flux produits RSS 2.0 avec l'espace de noms Google (`g:`).
 * Consommé par Google Merchant Center (Shopping, Performance Max) et par
 * Meta Catalog (Advantage+, retargeting dynamique).
 * URL à déclarer : https://votre-domaine/feed.xml
 */
export async function GET() {
  const products = await getProducts();

  const items = await Promise.all(
    products.map(async (p) => {
      const url = `${SITE_URL}/produit/${p.slug}`;
      const stock = p.stockQuantity ?? (p.inStock ? 10 : 0);
      const available = p.inStock && stock > 0;
      const rating = await getProductRating(p.slug);

      /**
       * Sémantique Merchant Center : `price` est le prix barré, `sale_price`
       * le prix effectivement payé. L'ancien flux renvoyait le même montant
       * dans les deux champs, ce qui annulait l'affichage de la promotion.
       */
      const onSale = Boolean(p.compareAtCents && p.compareAtCents > p.priceCents);

      const extraImages = p.images
        .slice(1, 11)
        .map((img) => `\n      <g:additional_image_link>${escapeXml(productImageUrl(img))}</g:additional_image_link>`)
        .join("");

      const shipping = SHIPPING_COUNTRIES.map(
        (country) => `
      <g:shipping>
        <g:country>${country}</g:country>
        <g:service>Standard (24-48 h)</g:service>
        <g:price>${euros(SHIPPING_CENTS)}</g:price>
      </g:shipping>`,
      ).join("");

      return `
    <item>
      <g:id>${escapeXml(p.slug)}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(`${p.shortDescription} ${p.description[0] ?? ""}`.trim().slice(0, 5000))}</g:description>
      <g:link>${escapeXml(url)}</g:link>
      <g:image_link>${escapeXml(productImageUrl(p.images[0]))}</g:image_link>${extraImages}
      <g:availability>${available ? "in_stock" : "out_of_stock"}</g:availability>
      <g:quantity_to_sell_on_facebook>${stock}</g:quantity_to_sell_on_facebook>
      <g:price>${euros(onSale ? p.compareAtCents! : p.priceCents)}</g:price>${
        onSale ? `\n      <g:sale_price>${euros(p.priceCents)}</g:sale_price>` : ""
      }
      <g:brand>${escapeXml(BRAND_NAME)}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:mpn>${escapeXml(p.slug)}</g:mpn>
      <g:google_product_category>${escapeXml(GOOGLE_CATEGORY[p.category] ?? "Électronique")}</g:google_product_category>
      <g:product_type>${escapeXml(p.category)}</g:product_type>
      <g:custom_label_0>${escapeXml(p.badge ?? "Catalogue")}</g:custom_label_0>
      <g:custom_label_1>${available ? "disponible" : "rupture"}</g:custom_label_1>${
        rating.count > 0
          ? `\n      <g:product_review_count>${rating.count}</g:product_review_count>\n      <g:product_review_average>${rating.average.toFixed(1)}</g:product_review_average>`
          : ""
      }${shipping}
      <g:free_shipping_threshold>
        <g:country>FR</g:country>
        <g:price_threshold>${euros(FREE_SHIPPING_CENTS)}</g:price_threshold>
      </g:free_shipping_threshold>
    </item>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(BRAND_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(`${BRAND_TAGLINE} — audio, sécurité et objets connectés.`)}</description>${items.join("")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
