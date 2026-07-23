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
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const products = await getProducts();
  const active = categories.find((c) => c === cat);
  const list = active ? products.filter((p) => p.category === active) : products;

  const filters = [{ label: "Tout", value: undefined }, ...categories.map((c) => ({ label: c, value: c }))];

  return (
    <div className="shell pt-32 pb-10 md:pt-40">
      <Reveal>
        <span className="gold-rule" />
        <h1 className="display mt-3 text-4xl md:text-6xl">La boutique</h1>
        <p className="mt-4 max-w-xl text-muted">
          Chaque produit est sélectionné, testé et approuvé. La qualité à petit
          prix, livrée partout en France et en Europe.
        </p>
      </Reveal>

      <div className="mt-10 flex flex-wrap gap-2">
        {filters.map((f) => {
          const isActive = f.value === active || (!f.value && !active);
          return (
            <Link
              key={f.label}
              href={f.value ? `/boutique?cat=${encodeURIComponent(f.value)}` : "/boutique"}
              className={cn(
                "rounded-full border px-5 py-2 text-sm transition-all duration-300",
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

      <ProductSearch products={list} />
    </div>
  );
}
