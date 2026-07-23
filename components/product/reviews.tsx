"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star, Check, Loader2 } from "lucide-react";
import { RatingStars } from "@/components/product/rating-stars";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Review, Rating } from "@/lib/data/reviews";

export function ProductReviews({
  slug,
  initialReviews,
  rating,
}: {
  slug: string;
  initialReviews: Review[];
  rating: Rating;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [open, setOpen] = useState(false);

  const count = reviews.length;
  const average =
    count > 0 ? reviews.reduce((n, r) => n + r.rating, 0) / count : rating.average;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="font-display text-4xl font-bold text-gold-bright">
            {count > 0 ? average.toFixed(1) : "—"}
          </span>
          <div>
            <RatingStars value={average} size="md" />
            <p className="mt-1 text-sm text-muted">
              {count > 0 ? `${count} avis vérifié${count > 1 ? "s" : ""}` : "Aucun avis pour le moment"}
            </p>
          </div>
        </div>
        <Button variant="outline" size="md" onClick={() => setOpen((v) => !v)}>
          {open ? "Fermer" : "Donner mon avis"}
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ReviewForm
              slug={slug}
              onAdded={(r) => {
                setReviews((list) => [r, ...list]);
                setOpen(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 space-y-4">
        {reviews.length === 0 && (
          <p className="text-muted">Soyez le premier à donner votre avis sur ce produit.</p>
        )}
        {reviews.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-elevated font-display text-sm font-bold text-gold">
                  {r.author.charAt(0).toUpperCase()}
                </span>
                <span className="font-medium">{r.author}</span>
              </div>
              <RatingStars value={r.rating} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{r.comment}</p>
            <p className="mt-2 text-xs text-faint">
              {new Date(r.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewForm({
  slug,
  onAdded,
}: {
  slug: string;
  onAdded: (r: Review) => void;
}) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, slug, rating }),
      });
      const json = await res.json();
      if (res.ok && json.review) onAdded(json.review);
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-6">
      <div>
        <label className="mb-2 block text-xs uppercase tracking-widest text-faint">Votre note</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${i} étoile${i > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  "size-7 transition",
                  (hover || rating) >= i ? "fill-gold text-gold" : "text-line-strong",
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          name="author"
          required
          maxLength={80}
          placeholder="Votre prénom"
          className="rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none"
        />
      </div>
      <textarea
        name="comment"
        required
        rows={3}
        maxLength={1000}
        placeholder="Partagez votre expérience…"
        className="w-full rounded-xl border border-line bg-elevated px-4 py-3 text-sm text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none"
      />
      {status === "error" && (
        <p className="text-sm text-it-red">Envoi impossible. Réessayez.</p>
      )}
      <Button type="submit" size="md" disabled={status === "loading"}>
        {status === "loading" ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Envoi…
          </>
        ) : (
          <>
            <Check className="size-4" /> Publier mon avis
          </>
        )}
      </Button>
    </form>
  );
}
