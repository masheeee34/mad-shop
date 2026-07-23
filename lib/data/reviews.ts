import "server-only";
import { readJSON, writeJSON, makeId } from "./store";

const FILE = "reviews.json";

export type Review = {
  id: string;
  slug: string; // produit
  author: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string;
  approved: boolean;
};

export type Rating = { average: number; count: number };

async function all(): Promise<Review[]> {
  return readJSON<Review[]>(FILE, []);
}

/** Avis approuvés d'un produit (les plus récents d'abord). */
export async function getReviews(slug: string): Promise<Review[]> {
  const reviews = await all();
  return reviews
    .filter((r) => r.slug === slug && r.approved)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getProductRating(slug: string): Promise<Rating> {
  const reviews = await getReviews(slug);
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((n, r) => n + r.rating, 0);
  return { average: sum / reviews.length, count: reviews.length };
}

export async function addReview(input: {
  slug: string;
  author: string;
  rating: number;
  comment: string;
}): Promise<Review> {
  const reviews = await all();
  const review: Review = {
    id: makeId("R-"),
    slug: input.slug,
    author: input.author.slice(0, 80),
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    comment: input.comment.slice(0, 1000),
    createdAt: new Date().toISOString(),
    // Auto-approuvé pour l'affichage immédiat ; modérable en admin.
    approved: true,
  };
  reviews.push(review);
  await writeJSON(FILE, reviews);
  return review;
}

/* --- Admin --- */
export async function allReviews(): Promise<Review[]> {
  return (await all()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
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
