import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducts, getProduct, getRelated } from "@/lib/data/catalog";
import { getProductRating, getReviews } from "@/lib/data/reviews";
import { formatPrice } from "@/lib/utils";
import { ProductReviews } from "@/components/product/reviews";
import { RatingStars } from "@/components/product/rating-stars";
import { ProductGallery } from "@/components/product/product-gallery";
import { BuyPanelWrapper } from "@/components/product/buy-panel-wrapper";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/motion/reveal";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [`/products/${product.images[0]}`],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [related, reviews, rating] = await Promise.all([
    getRelated(slug),
    getReviews(slug),
    getProductRating(slug),
  ]);

  const discount = product.compareAtCents
    ? Math.round((1 - product.priceCents / product.compareAtCents) * 100)
    : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    category: product.category,
    image: `/products/${product.images[0]}`,
    brand: { "@type": "Brand", name: "MAD Shop" },
    ...(rating.count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating.average.toFixed(1),
        reviewCount: rating.count,
      },
    }),
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: (product.priceCents / 100).toFixed(2),
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    /* pb-[calc(var(--bottom-nav-h)+var(--sab)+4rem)] sur mobile pour
       laisser de la place à la MobileBuyBar et à la bottom nav */
    <div className="pt-20 pb-8 lg:pt-28 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Fil d'ariane */}
      <div className="shell">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-faint">
          <Link href="/" className="transition hover:text-muted">Accueil</Link>
          <span>/</span>
          <Link href="/boutique" className="transition hover:text-muted">Boutique</Link>
          <span>/</span>
          <span className="text-muted">{product.category}</span>
        </nav>
      </div>

      {/* ===== Présentation produit ===== */}
      <section className="shell mt-4 grid items-start gap-8 lg:mt-6 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div className="lg:py-4">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">{product.category}</p>
          <h1 className="display mt-3 text-3xl leading-[0.98] sm:text-4xl md:text-5xl lg:text-6xl">
            {product.name}
          </h1>

          {rating.count > 0 && (
            <a
              href="#avis"
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted transition hover:text-cream"
            >
              <RatingStars value={rating.average} />
              <span>
                {rating.average.toFixed(1)} · {rating.count} avis
              </span>
            </a>
          )}

          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{product.tagline}</p>

          <div className="mt-6 flex items-baseline gap-4">
            <span className="font-display text-3xl font-semibold text-cream sm:text-4xl">
              {formatPrice(product.priceCents)}
            </span>
            {product.compareAtCents && (
              <>
                <span className="text-lg text-faint line-through">
                  {formatPrice(product.compareAtCents)}
                </span>
                <span className="text-sm font-medium text-it-green">−{discount}%</span>
              </>
            )}
          </div>

          {/* BuyPanelWrapper — gère le ref pour MobileBuyBar */}
          <div className="mt-6">
            <BuyPanelWrapper product={product} />
          </div>

          <p className="mt-5 text-sm leading-relaxed text-faint">
            Livraison 24-48h en France & Europe · Satisfait ou remboursé sous
            14 jours · Paiement 100% sécurisé
          </p>

          <div className="mt-8 space-y-4 border-t border-line pt-7 text-[15px] leading-relaxed text-muted">
            {product.description.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Caractéristiques ===== */}
      {product.features.length > 0 && (
        <section className="shell mt-20 border-t border-line pt-14 md:mt-28">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.3em] text-gold">Caractéristiques</p>
              <h2 className="display mt-4 text-2xl md:text-4xl">Pensé dans le détail.</h2>
            </Reveal>
            <div>
              {product.features.map((f) => (
                <div
                  key={f.title}
                  className="flex flex-col gap-1 border-t border-line py-5 md:flex-row md:gap-12"
                >
                  <h3 className="font-display text-base font-semibold md:w-56 md:shrink-0 md:text-lg">
                    {f.title}
                  </h3>
                  <p className="text-muted">{f.detail}</p>
                </div>
              ))}
              <div className="border-t border-line" />
            </div>
          </div>
        </section>
      )}

      {/* ===== Avis ===== */}
      <section id="avis" className="shell mt-20 scroll-mt-24 border-t border-line pt-14 md:mt-28">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Ils ont testé</p>
          <h2 className="display mt-4 text-2xl md:text-4xl">Avis clients</h2>
        </Reveal>
        <ProductReviews slug={product.slug} initialReviews={reviews} rating={rating} />
      </section>

      {/* ===== Suggestions ===== */}
      {related.length > 0 && (
        <section className="shell mt-20 border-t border-line pt-14 md:mt-28">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">À découvrir aussi</p>
            <h2 className="display mt-4 text-2xl md:text-4xl">Complétez la sélection</h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
