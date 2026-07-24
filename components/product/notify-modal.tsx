"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type NotifyModalProps = {
  productSlug: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
};

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

  if (!isOpen) return null;

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
      } else {
        setError(data.error ?? "Une erreur est survenue.");
      }
    } catch {
      setError("Erreur de connexion, réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-charcoal p-6 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted hover:text-cream transition"
          aria-label="Fermer"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 grid size-12 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
            <Bell className="size-6 text-gold-bright" />
          </div>

          <h3 className="font-display text-xl font-bold uppercase tracking-tight text-cream sm:text-2xl">
            Soyez prévenu en priorité 🔥
          </h3>

          <p className="mt-2 text-sm text-muted">
            Inscrivez votre email pour recevoir une alerte instantanée dès le retour en stock de{" "}
            <strong className="text-gold">{productName}</strong>.
          </p>

          {success ? (
            <div className="mt-6 flex flex-col items-center gap-3 text-emerald-400">
              <CheckCircle2 className="size-10" />
              <p className="text-sm font-medium">
                C'est noté ! Vous serez prévenu dès que le produit est prêt.
              </p>
              <Button variant="outline" size="sm" onClick={onClose} className="mt-2">
                Fermer
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 w-full space-y-4">
              <div>
                <input
                  type="email"
                  required
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-line bg-elevated px-4 py-3 text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none"
                />
              </div>

              {error && <p className="text-xs text-it-red text-left">{error}</p>}

              <Button type="submit" full size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Inscription…
                  </>
                ) : (
                  "M'avertir du retour en stock"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
