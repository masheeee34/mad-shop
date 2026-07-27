"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackLead } from "@/lib/analytics";

type NotifyModalProps = {
  productSlug: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Alerte de réapprovisionnement.
 * Une rupture de stock est la seule occasion où un visiteur accepte volontiers
 * de laisser son email : c'est la meilleure source d'audience de reciblage
 * du site, et elle ne coûte rien en publicité.
 */
export function NotifyModal({
  productSlug,
  productName,
  isOpen,
  onClose,
}: NotifyModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/notify-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug, email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        trackLead("alerte_stock");
      } else {
        setError(data.error ?? "Une erreur est survenue.");
      }
    } catch {
      setError("Connexion impossible. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Alerte de réapprovisionnement — ${productName}`}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line-strong bg-charcoal p-6 shadow-2xl sm:p-8"
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-muted transition-colors hover:text-cream"
                aria-label="Fermer"
              >
                <X className="size-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <span className="mb-4 grid size-12 place-items-center rounded-full border border-gold/40 bg-gold/10">
                  <Bell className="size-5 text-gold-bright" />
                </span>

                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-cream sm:text-2xl">
                  Prévenez-moi du retour
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Nous vous écrirons dès que{" "}
                  <strong className="text-cream">{productName}</strong> sera de
                  nouveau disponible. Un seul email, rien d&apos;autre.
                </p>

                {success ? (
                  <div className="mt-6 flex flex-col items-center gap-3">
                    <CheckCircle2 className="size-10 text-it-green" />
                    <p className="text-sm font-medium text-cream">
                      C&apos;est noté. Vous serez le premier averti.
                    </p>
                    <Button variant="outline" size="sm" onClick={onClose} className="mt-1">
                      Fermer
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 w-full space-y-3">
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="votre.email@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-line bg-elevated px-4 py-3 text-sm text-cream placeholder:text-faint focus:border-gold/60 focus:outline-none"
                    />

                    {error && <p className="text-left text-xs text-it-red">{error}</p>}

                    <Button type="submit" full size="lg" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" /> Inscription…
                        </>
                      ) : (
                        "Me prévenir"
                      )}
                    </Button>
                    <p className="text-xs text-faint">
                      Aucune newsletter, aucun partage de votre adresse.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
