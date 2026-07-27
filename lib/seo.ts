import type { Product } from "@/lib/products";
import type { Review, Rating } from "@/lib/types/data-types";
import {
  BRAND_NAME,
  BRAND_TAGLINE,
  SITE_URL,
  FREE_SHIPPING_CENTS,
  SHIPPING_CENTS,
  RETURN_WINDOW_DAYS,
  SHIPPING_COUNTRIES,
} from "@/lib/config";

/**
 * Données structurées schema.org.
 *
 * Elles alimentent les résultats enrichis Google (prix, étoiles, stock,
 * frais de port) et les annonces Shopping gratuites. Les URL d'images doivent
 * impérativement être absolues : Google rejette silencieusement les chemins
 * relatifs, ce qui faisait perdre l'affichage enrichi.
 */

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

export function productImageUrl(file?: string): string {
  if (!file) return `${SITE_URL}/brand/logo.png`;
  if (/^https?:\/\//.test(file)) return file;
  return absoluteUrl(file.startsWith("/") ? file : `/products/${file}`);
}

/** Identité de l'entreprise — à placer une seule fois, dans le layout racine. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    slogan: BRAND_TAGLINE,
    description:
      "Audio, sécurité et objets connectés sélectionnés, testés et approuvés. Livraison 24-48 h en France et en Europe.",
    areaServed: SHIPPING_COUNTRIES.map((code) => ({ "@type": "Country", name: code })),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["fr"],
      url: `${SITE_URL}/contact`,
    },
  };
}

/** Déclare le moteur de recherche interne à Google (sitelinks searchbox). */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: BRAND_NAME,
    inLanguage: "fr-FR",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/boutique?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: absoluteUrl(step.path),
    })),
  };
}

/**
 * Fiche produit complète : prix, disponibilité, frais de port et politique de
 * retour. Ces trois derniers blocs sont ceux qui font gagner le badge
 * « livraison gratuite » et « retours gratuits » dans les résultats Shopping.
 */
export function productJsonLd(
  product: Product,
  rating: Rating,
  reviews: Review[] = [],
) {
  const url = `${SITE_URL}/produit/${product.slug}`;
  const price = (product.priceCents / 100).toFixed(2);
  const stock = product.stockQuantity ?? (product.inStock ? 10 : 0);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.shortDescription,
    category: product.category,
    sku: product.slug,
    mpn: product.slug,
    image: product.images.map(productImageUrl),
    brand: { "@type": "Brand", name: BRAND_NAME },
    url,
    ...(rating.count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating.average.toFixed(1),
        reviewCount: rating.count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(reviews.length > 0 && {
      review: reviews.slice(0, 10).map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.author },
        datePublished: r.createdAt.slice(0, 10),
        reviewBody: r.comment,
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
      })),
    }),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      price,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.inStock && stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@id": `${SITE_URL}/#organization` },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: (SHIPPING_CENTS / 100).toFixed(2),
          currency: "EUR",
        },
        shippingDestination: SHIPPING_COUNTRIES.map((code) => ({
          "@type": "DefinedRegion",
          addressCountry: code,
        })),
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
        },
        // Seuil de franco de port, reconnu par Google Merchant Center.
        freeShippingThreshold: {
          "@type": "DeliveryChargeSpecification",
          appliesToDeliveryMethod: "https://purl.org/goodrelations/v1#DeliveryModeMail",
          eligibleTransactionVolume: {
            "@type": "PriceSpecification",
            minPrice: (FREE_SHIPPING_CENTS / 100).toFixed(2),
            priceCurrency: "EUR",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: [...SHIPPING_COUNTRIES],
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: RETURN_WINDOW_DAYS,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };
}

/** Questions fréquentes de la page livraison — éligibles au bloc FAQ enrichi. */
export function faqJsonLd(entries: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: e.answer },
    })),
  };
}

/** Sérialise un bloc JSON-LD en neutralisant toute fermeture de balise. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
