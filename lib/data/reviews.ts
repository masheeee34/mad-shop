import "server-only";
import { readJSON, writeJSON, makeId } from "./store";

const FILE = "reviews.json";

/**
 * Publication immédiate des nouveaux avis. Passez REVIEWS_MODERATION=manual
 * pour les mettre en attente de validation dans le back-office — recommandé
 * dès que la boutique reçoit du trafic publicitaire.
 */
const AUTO_APPROVE = process.env.REVIEWS_MODERATION !== "manual";

/** Avis tel qu'il est exposé au navigateur : sans donnée personnelle. */
export type Review = {
  id: string;
  slug: string; // produit
  author: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string;
  approved: boolean;
  /** L'auteur a une commande contenant ce produit. */
  verified: boolean;
  adminReply?: string;
};

/** Avis tel qu'il est stocké : l'email sert à empêcher les doublons. */
type StoredReview = Review & { email?: string };

export type Rating = { average: number; count: number };

async function all(): Promise<StoredReview[]> {
  const stored = await readJSON<StoredReview[]>(FILE, []);
  if (!Array.isArray(stored)) return [];
  // Les avis créés avant l'introduction de la vérification n'ont pas le champ.
  return stored.filter(Boolean).map((r) => ({ ...r, verified: r?.verified ?? false }));
}

/** Retire l'email avant tout envoi vers le client. */
function toPublic({ email: _email, ...review }: StoredReview): Review {
  return review;
}

/** Avis approuvés d'un produit (les plus récents d'abord). */
export async function getReviews(slug: string): Promise<Review[]> {
  const reviews = await all();
  return reviews
    .filter((r) => r.slug === slug && r.approved)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map(toPublic);
}

export async function getProductRating(slug: string): Promise<Rating> {
  const reviews = await getReviews(slug);
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((n, r) => n + r.rating, 0);
  return { average: sum / reviews.length, count: reviews.length };
}

/** Vrai si ce client a déjà donné son avis sur ce produit. */
export async function hasReviewed(slug: string, email: string): Promise<boolean> {
  const wanted = email.trim().toLowerCase();
  const reviews = await all();
  return reviews.some((r) => r.slug === slug && r.email === wanted);
}

export async function addReview(input: {
  slug: string;
  author: string;
  rating: number;
  comment: string;
  email?: string;
  verified: boolean;
}): Promise<Review> {
  const reviews = await all();
  const review: StoredReview = {
    id: makeId("R-"),
    slug: input.slug,
    author: input.author.slice(0, 80),
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    comment: input.comment.slice(0, 1000),
    createdAt: new Date().toISOString(),
    approved: AUTO_APPROVE,
    verified: input.verified,
    email: input.email?.trim().toLowerCase(),
  };
  reviews.push(review);
  await writeJSON(FILE, reviews);
  return toPublic(review);
}

/* --- Admin --- */
export async function allReviews(): Promise<Review[]> {
  return (await all())
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map(toPublic);
}

export async function setReviewApproved(id: string, approved: boolean) {
  const reviews = await all();
  const r = reviews.find((x) => x.id === id);
  if (r) {
    r.approved = approved;
    await writeJSON(FILE, reviews);
  }
}

export async function deleteReview(id: string) {
  const reviews = await all();
  await writeJSON(
    FILE,
    reviews.filter((r) => r.id !== id),
  );
}

export async function replyToReview(id: string, reply: string) {
  const reviews = await all();
  const r = reviews.find((x) => x.id === id);
  if (r) {
    r.adminReply = reply;
    await writeJSON(FILE, reviews);
  }
}
