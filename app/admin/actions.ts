"use server";

import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/admin-auth";
import {
  getProduct,
  upsertProduct,
  deleteProduct,
} from "@/lib/data/catalog";
import type { Product } from "@/lib/products";
import {
  setOrderStatus,
  setOrderTracking,
  ORDER_STATUSES,
  type OrderStatus,
} from "@/lib/data/orders";
import { isCarrierId } from "@/lib/carriers";
import { setReviewApproved, deleteReview } from "@/lib/data/reviews";
import { getPromos, savePromos, type Promo } from "@/lib/data/promos";
import { clearNotifications } from "@/lib/data/notifications";
import { notifyOrderStatus, notifyRestock } from "@/lib/notifications";

async function guard() {
  if (!(await isAuthed())) throw new Error("Non autorisé");
}

function euros(v: FormDataEntryValue | null): number {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}
function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ---------------- Produits ---------------- */

export async function saveProductAction(formData: FormData) {
  await guard();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const providedSlug = String(formData.get("slug") ?? "").trim();
  const slug = providedSlug || slugify(name);
  const existing = await getProduct(slug);

  const images = String(formData.get("images") ?? "")
    .split("|||")
    .map((s) => s.trim())
    .filter(Boolean);

  const compare = euros(formData.get("compareAtEuros"));
  const rawStock = formData.get("stockQuantity");
  const stockQuantity = rawStock !== null && rawStock !== "" ? Math.max(0, parseInt(String(rawStock), 10)) : (formData.get("inStock") === "on" ? 10 : 0);
  const inStock = stockQuantity > 0 && formData.get("inStock") === "on";

  const product: Product = {
    slug,
    name,
    tagline: String(formData.get("tagline") ?? existing?.tagline ?? ""),
    category: (String(formData.get("category")) as Product["category"]) || "Audio",
    priceCents: euros(formData.get("priceEuros")),
    compareAtCents: compare > 0 ? compare : undefined,
    badge: String(formData.get("badge") ?? "").trim() || undefined,
    shortDescription: String(formData.get("shortDescription") ?? ""),
    description:
      existing?.description ?? [String(formData.get("shortDescription") ?? "")],
    features: existing?.features ?? [],
    highlights: String(formData.get("highlights") ?? existing?.highlights?.join(", ") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    images: images.length ? images : existing?.images ?? [`${slug}-1.jpg`],
    inStock,
    stockQuantity,
  };

  await upsertProduct(product);
  revalidatePaths(slug);
}

export async function deleteProductAction(formData: FormData) {
  await guard();
  const slug = String(formData.get("slug") ?? "");
  if (slug) {
    await deleteProduct(slug);
    revalidatePaths(slug);
  }
}

function revalidatePaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/boutique");
  revalidatePath("/admin/produits");
  if (slug) revalidatePath(`/produit/${slug}`);
}

/* ---------------- Commandes ---------------- */

/**
 * Statut et colis sont enregistrés ensemble.
 *
 * Le suivi est écrit en premier : l'email « votre commande est expédiée » part
 * ainsi avec le lien de suivi dedans, plutôt que de laisser le client le
 * réclamer dans un second temps.
 */
export async function updateOrderStatusAction(formData: FormData) {
  await guard();
  const number = String(formData.get("number") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!number || !(ORDER_STATUSES as readonly string[]).includes(status)) return;

  const rawCarrier = String(formData.get("carrier") ?? "");
  const carrier = isCarrierId(rawCarrier) ? rawCarrier : "autre";
  const trackingNumber = String(formData.get("trackingNumber") ?? "").slice(0, 60);

  const trackingChanged = await setOrderTracking(number, carrier, trackingNumber);
  const updated = await setOrderStatus(number, status as OrderStatus);

  // `null` si le statut n'a pas bougé : on n'envoie alors aucun email, sauf
  // si le colis vient d'être renseigné sur une commande déjà expédiée.
  const notify = updated ?? (trackingChanged?.status === "expediee" ? trackingChanged : null);
  if (notify) await notifyOrderStatus(notify);

  revalidatePath("/admin/commandes");
  revalidatePath("/admin");
  revalidatePath("/suivi");
}

/* ---------------- Alertes de réapprovisionnement ---------------- */

/**
 * Prévient tous les visiteurs inscrits qu'un produit est revenu en stock,
 * puis vide la file d'attente. Bloqué tant que le produit reste indisponible :
 * envoyer une alerte sur une fiche en rupture ne ferait que perdre le client.
 */
export async function notifyRestockAction(formData: FormData) {
  await guard();
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;

  const product = await getProduct(slug);
  if (!product) return;

  const stock = product.stockQuantity ?? (product.inStock ? 10 : 0);
  if (!product.inStock || stock <= 0) return;

  const { sent } = await notifyRestock(product);
  if (sent > 0) await clearNotifications(slug);

  revalidatePath("/admin/alertes");
  revalidatePath("/admin");
}

/** Retire une file d'attente sans envoyer d'email (produit abandonné). */
export async function dismissRestockAction(formData: FormData) {
  await guard();
  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;

  await clearNotifications(slug);
  revalidatePath("/admin/alertes");
  revalidatePath("/admin");
}

/* ---------------- Avis ---------------- */

export async function approveReviewAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") ?? "");
  const approved = formData.get("approved") === "true";
  if (id) {
    await setReviewApproved(id, approved);
    revalidatePath("/admin/avis");
  }
}

export async function deleteReviewAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await deleteReview(id);
    revalidatePath("/admin/avis");
  }
}

/* ---------------- Promos ---------------- */

export async function savePromoAction(formData: FormData) {
  await guard();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return;

  const promos = await getPromos();
  const next: Promo = {
    code,
    type: (String(formData.get("type")) as Promo["type"]) || "percent",
    value:
      String(formData.get("type")) === "amount"
        ? euros(formData.get("value"))
        : parseInt(String(formData.get("value")) || "0", 10),
    active: formData.get("active") === "on",
    label: String(formData.get("label") ?? "").trim() || undefined,
  };

  const idx = promos.findIndex((p) => p.code === code);
  if (idx >= 0) promos[idx] = next;
  else promos.push(next);

  await savePromos(promos);
  revalidatePath("/admin/promos");
}

export async function deletePromoAction(formData: FormData) {
  await guard();
  const code = String(formData.get("code") ?? "").toUpperCase();
  const promos = await getPromos();
  await savePromos(promos.filter((p) => p.code !== code));
  revalidatePath("/admin/promos");
}
