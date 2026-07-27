import "server-only";
import { readJSON, writeJSON } from "./store";
import { defaultProducts, type Product } from "@/lib/products";

const FILE = "catalog.json";

/** Tous les produits (source runtime, seedée depuis le code au 1er accès). */
export async function getProducts(): Promise<Product[]> {
  const products = await readJSON<Product[]>(FILE, defaultProducts);
  if (!Array.isArray(products) || products.length === 0) return defaultProducts;
  
  const valid = products.filter((p): p is Product => Boolean(p && typeof p === "object" && typeof p.slug === "string"));
  if (valid.length === 0) return defaultProducts;

  return valid.map((p) => ({
    ...p,
    images: Array.isArray(p.images)
      ? p.images
          .map((img) => (typeof img === "string" && img.startsWith("data:image") ? "hero.jpg" : img))
          .filter((img): img is string => typeof img === "string" && img.length > 0)
      : ["hero.jpg"],
  }));
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

/**
 * Suggestions affichées sous une fiche : d'abord le même rayon, puis le reste
 * du catalogue pour toujours remplir la rangée.
 */
export async function getRelated(slug: string, limit = 3): Promise<Product[]> {
  const products = await getProducts();
  const current = products.find((p) => p.slug === slug);
  const others = products.filter((p) => p.slug !== slug);
  if (!current) return others.slice(0, limit);

  const sameCategory = others.filter((p) => p.category === current.category);
  const rest = others.filter((p) => p.category !== current.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

/** Remplace tout le catalogue (admin). */
export async function saveProducts(products: Product[]): Promise<void> {
  await writeJSON(FILE, products);
}

/** Crée ou met à jour un produit par slug (admin). */
export async function upsertProduct(product: Product): Promise<void> {
  const products = await getProducts();
  const idx = products.findIndex((p) => p.slug === product.slug);
  if (idx >= 0) products[idx] = product;
  else products.push(product);
  await saveProducts(products);
}

/**
 * Décrémente le stock après un paiement confirmé.
 * Un produit qui tombe à zéro passe automatiquement en rupture, ce qui le
 * retire de la vente sans intervention manuelle.
 */
export async function decrementStock(
  entries: { slug: string; quantity: number }[],
): Promise<void> {
  if (entries.length === 0) return;

  const products = await getProducts();
  let changed = false;

  for (const { slug, quantity } of entries) {
    const product = products.find((p) => p.slug === slug);
    if (!product) continue;

    const current = product.stockQuantity ?? (product.inStock ? 10 : 0);
    const next = Math.max(0, current - quantity);
    product.stockQuantity = next;
    product.inStock = next > 0;
    changed = true;
  }

  if (changed) await saveProducts(products);
}

export async function deleteProduct(slug: string): Promise<void> {
  const products = await getProducts();
  await saveProducts(products.filter((p) => p.slug !== slug));
}
