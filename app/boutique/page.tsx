import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/products";
import { getProducts } from "@/lib/data/catalog";
import { ProductSearch } from "@/components/product/product-search";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "Découvrez toute la sélection MAD Shop : audio, sécurité et objets connectés, testés et approuvés.",
};

export default async function BoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  // `q` est l'entrée déclarée à Google via le SearchAction du site : une
  // recherche depuis les résultats de recherche arrive directement filtrée ici.
  const { cat, q } = await searchParams;
  const products = await getProducts();
  const active = categories.find((c) => c === cat);
  const list = active ? products.filter((p) => p.category === active) : products;

  const filters = [{ label: "Tout", value: undefined }, ...categories.map((c) => ({ label: c, value: c }))];

  return (
    <div className="shell pt-24 pb-6 md:pt-32 md:pb-10 lg:pt-40">
      <Reveal>
        <span className="gold-rule" />
        <h1 className="display mt-3 text-3xl sm:text-4xl md:text-6xl">La boutique</h1>
        <p className="mt-3 max-w-xl text-sm text-muted sm:text-base">
          Chaque produit est sélectionné, testé et approuvé. La qualité à petit
          prix, livrée partout en France et en Europe.
        </p>
      </Reveal>

      {/* Filtres — scroll horizontal sur mobile (no-scrollbar) */}
      <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => {
          const isActive = f.value === active || (!f.value && !active);
          return (
            <Link
              key={f.label}
              href={f.value ? `/boutique?cat=${encodeURIComponent(f.value)}` : "/boutique"}
              className={cn(
                "shrink-0 rounded-full border px-5 py-2 text-sm transition-all duration-300",
                isActive
                  ? "border-gold bg-gold text-ink"
                  : "border-line text-muted hover:border-gold/50 hover:text-cream",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <ProductSearch products={list} initialQuery={q ?? ""} />
    </div>
  );
}
