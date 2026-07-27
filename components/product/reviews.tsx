"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Star, Check, Loader2, BadgeCheck } from "lucide-react";
import { RatingStars } from "@/components/product/rating-stars";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Review, Rating } from "@/lib/types/data-types";

/** Droit d'écriture du visiteur, déterminé côté serveur. */
export type ReviewAccess =
  | { state: "loading" }
  | { state: "anonymous" }
  | { state: "not-purchased" }
  | { state: "already-reviewed" }
  | { state: "allowed"; suggestedName: string };

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
  const [access, setAccess] = useState<ReviewAccess>({ state: "loading" });

  // La page produit est générée statiquement : le droit d'écriture dépend du
  // cookie de session et se récupère donc après affichage.
  useEffect(() => {
    let cancelled = false;

    fetch(`/api/reviews/access?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data: ReviewAccess) => {
        if (!cancelled) setAccess(data);
      })
      .catch(() => {
        if (!cancelled) setAccess({ state: "anonymous" });
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const count = reviews.length;
  const average =
    count > 0 ? reviews.reduce((n, r) => n + r.rating, 0) / count : rating.average;
  const verifiedCount = reviews.filter((r) => r.verified).length;

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
              {count > 0
                ? `${count} avis${verifiedCount > 0 ? ` · ${verifiedCount} achat(s) vérifié(s)` : ""}`
                : "Aucun avis pour le moment"}
            </p>
          </div>
        </div>

        {access.state === "allowed" && (
          <Button variant="outline" size="md" onClick={() => setOpen((v) => !v)}>
            {open ? "Fermer" : "Donner mon avis"}
          </Button>
        )}
      </div>

      <ReviewGate access={access} />

      <AnimatePresence>
        {open && access.state === "allowed" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <ReviewForm
              slug={slug}
              suggestedName={access.suggestedName}
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
          <p className="text-muted">
            Aucun avis publié pour l&apos;instant sur ce produit.
          </p>
        )}
        {reviews.map((r) => (
          <article key={r.id} className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-elevated font-display text-sm font-bold text-gold">
                  {r.author.charAt(0).toUpperCase()}
                </span>
                <div>
                  <span className="block font-medium">{r.author}</span>
                  {r.verified && (
                    <span className="flex items-center gap-1 text-xs text-it-green">
                      <BadgeCheck className="size-3.5" /> Achat vérifié
                    </span>
                  )}
                </div>
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
            {r.adminReply && (
              <div className="mt-4 rounded-md border-l-2 border-gold bg-elevated px-4 py-3">
                <p className="text-xs font-medium text-gold uppercase tracking-wider mb-1">
                  Réponse de MAD SHOP
                </p>
                <p className="text-sm text-cream">{r.adminReply}</p>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

/** Explique pourquoi le formulaire n'est pas proposé. */
function ReviewGate({ access }: { access: ReviewAccess }) {
  // Rien tant que le statut est inconnu : afficher « connectez-vous » puis le
  // remplacer une demi-seconde plus tard serait déroutant.
  if (access.state === "allowed" || access.state === "loading") return null;

  const message =
    access.state === "anonymous" ? (
      <>
        Les avis sont réservés aux acheteurs.{" "}
        <Link href="/compte/connexion" className="link-underline text-cream">
          Connectez-vous
        </Link>{" "}
        pour donner le vôtre.
      </>
    ) : access.state === "already-reviewed" ? (
      <>Merci, vous avez déjà partagé votre avis sur ce produit.</>
    ) : (
      <>
        Seuls les clients ayant commandé ce produit peuvent publier un avis.
        C&apos;est ce qui garantit que chaque note affichée est réelle.
      </>
    );

  return (
    <p className="mt-5 rounded-xl border border-line bg-elevated/40 px-4 py-3 text-sm text-muted">
      {message}
    </p>
  );
}

function ReviewForm({
  slug,
  suggestedName,
  onAdded,
}: {
  slug: string;
  suggestedName: string;
  onAdded: (r: Review) => void;
}) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "pending">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, slug, rating }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.review) {
        onAdded(json.review);
        return;
      }
      if (res.ok && json.pending) {
        setStatus("pending");
        return;
      }
      setError(json.error ?? "Envoi impossible. Réessayez.");
      setStatus("error");
    } catch {
      setError("Connexion impossible. Réessayez dans un instant.");
      setStatus("error");
    }
  }

  if (status === "pending") {
    return (
      <div className="card mt-6 flex flex-col items-center gap-3 p-8 text-center">
        <Check className="size-8 text-it-green" />
        <p className="text-sm text-cream">Merci, votre avis a bien été envoyé.</p>
        <p className="text-sm text-muted">
          Il sera publié après vérification par notre équipe.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-6">
      <fieldset>
        <legend className="mb-2 block text-xs uppercase tracking-widest text-faint">
          Votre note
        </legend>
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
      </fieldset>

      <input
        name="author"
        required
        maxLength={80}
        defaultValue={suggestedName}
        aria-label="Votre prénom"
        placeholder="Votre prénom"
        className="w-full rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none sm:max-w-xs"
      />

      <textarea
        name="comment"
        aria-label="Votre avis"
        required
        rows={3}
        maxLength={1000}
        placeholder="Ce qui vous a plu, ce qui pourrait être mieux…"
        className="w-full rounded-xl border border-line bg-elevated px-4 py-3 text-sm text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none"
      />

      {status === "error" && (
        <p role="alert" className="text-sm text-it-red">
          {error}
        </p>
      )}

      {/* Champ leurre : invisible pour un humain, rempli par les robots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] size-0 opacity-0"
      />

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
