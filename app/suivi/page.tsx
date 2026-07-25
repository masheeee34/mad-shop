"use client";

import { useState } from "react";
import {
  PackageSearch,
  Loader2,
  Check,
  Truck,
  Home,
  Clock,
  XCircle,
  ExternalLink,
  Copy,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { PushOptIn } from "@/components/support/push-optin";
import { formatPrice } from "@/lib/utils";

type TrackedOrder = {
  number: string;
  status: string;
  statusLabel: string;
  totalCents: number;
  items: { name: string; quantity: number }[];
  createdAt: string;
  trackingNumber: string | null;
  carrierLabel: string | null;
  trackingUrl: string | null;
};

const steps = [
  { key: "en_preparation", label: "En préparation", icon: Clock },
  { key: "expediee", label: "Expédiée", icon: Truck },
  { key: "livree", label: "Livrée", icon: Home },
];

export default function SuiviPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [copied, setCopied] = useState(false);
  /** Couple vérifié par la recherche : il autorise l'abonnement aux alertes. */
  const [proof, setProof] = useState<{ number: string; email: string } | null>(null);

  async function copyTracking(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible : le numéro reste sélectionnable */
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    setOrder(null);
    setProof(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.found) {
        setOrder(json.order);
        setProof({ number: String(data.number), email: String(data.email) });
        setStatus("idle");
      } else {
        setError(json.error ?? "Commande introuvable.");
        setStatus("error");
      }
    } catch {
      setError("Erreur, réessayez.");
      setStatus("error");
    }
  }

  const currentIndex = order ? steps.findIndex((s) => s.key === order.status) : -1;
  const cancelled = order?.status === "annulee";

  return (
    <div className="shell max-w-2xl pt-32 pb-10 md:pt-40">
      <span className="gold-rule" />
      <h1 className="display mt-3 text-4xl md:text-5xl">Suivi de commande</h1>
      <p className="mt-4 text-muted">
        Entrez votre numéro de commande (reçu par email, ex : MAD-XXXX) et l'email
        utilisé lors de l'achat.
      </p>

      <form onSubmit={onSubmit} className="card mt-8 space-y-4 p-6 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-faint">
              N° de commande
            </label>
            <input
              name="number"
              required
              placeholder="MAD-XXXX"
              className="w-full rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm uppercase text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-faint">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="vous@email.fr"
              className="w-full rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none"
            />
          </div>
        </div>
        {status === "error" && <p className="text-sm text-it-red">{error}</p>}
        <Button type="submit" size="lg" disabled={status === "loading"}>
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Recherche…
            </>
          ) : (
            <>
              <PackageSearch className="size-4" /> Suivre ma commande
            </>
          )}
        </Button>
      </form>

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mt-8 p-6 md:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-faint">Commande</p>
              <p className="font-display text-xl font-bold">{order.number}</p>
            </div>
            <span className="rounded-full bg-elevated px-4 py-1.5 text-sm text-gold-bright">
              {order.statusLabel}
            </span>
          </div>

          {cancelled ? (
            <div className="mt-8 flex items-center gap-3 rounded-xl border border-it-red/30 bg-it-red/10 px-4 py-4 text-it-red">
              <XCircle className="size-5" /> Cette commande a été annulée.
            </div>
          ) : (
            <div className="mt-10 flex items-center justify-between">
              {steps.map((s, i) => {
                const done = i <= currentIndex;
                const Icon = done ? Check : s.icon;
                return (
                  <div key={s.key} className="flex flex-1 flex-col items-center text-center">
                    <div className="flex w-full items-center">
                      <span className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : done ? "bg-gold" : "bg-line"}`} />
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-full border ${
                          done ? "border-gold bg-gold text-ink" : "border-line text-faint"
                        }`}
                      >
                        <Icon className="size-5" />
                      </span>
                      <span className={`h-0.5 flex-1 ${i === steps.length - 1 ? "opacity-0" : i < currentIndex ? "bg-gold" : "bg-line"}`} />
                    </div>
                    <span className={`mt-2 text-xs ${done ? "text-cream" : "text-faint"}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {order.trackingNumber && !cancelled && (
            <div className="mt-8 rounded-xl border border-gold/25 bg-gold/5 p-5">
              <p className="text-xs uppercase tracking-widest text-faint">
                Votre colis{order.carrierLabel ? ` · ${order.carrierLabel}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="font-display text-lg font-bold tracking-tight text-gold-bright">
                  {order.trackingNumber}
                </span>
                <button
                  onClick={() => copyTracking(order.trackingNumber ?? "")}
                  className="grid size-8 place-items-center rounded-full border border-line text-muted transition hover:border-gold/50 hover:text-cream"
                  aria-label="Copier le numéro de colis"
                >
                  {copied ? (
                    <Check className="size-3.5 text-it-green" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
              {order.trackingUrl ? (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-cream px-5 text-sm font-semibold text-ink transition-colors hover:bg-gold-bright"
                >
                  Suivre chez le transporteur <ExternalLink className="size-4" />
                </a>
              ) : (
                <p className="mt-3 text-sm text-muted">
                  Ce transporteur ne propose pas de suivi en ligne. Conservez ce
                  numéro, il nous permet de localiser votre colis.
                </p>
              )}
            </div>
          )}

          <div className="mt-8 border-t border-line pt-5">
            <p className="mb-2 text-xs uppercase tracking-widest text-faint">Détail</p>
            <ul className="space-y-1 text-sm text-muted">
              {order.items.map((it, i) => (
                <li key={i}>
                  {it.quantity} × {it.name}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm">
              Total : <span className="font-semibold text-gold-bright">{formatPrice(order.totalCents)}</span>
            </p>
          </div>

          {/* Le couple numéro + email vient d'être vérifié : c'est le moment
              où proposer l'alerte, et le seul où l'on peut la rattacher. */}
          {proof && !cancelled && order.status !== "livree" && (
            <div className="mt-6 border-t border-line pt-5">
              <PushOptIn orderNumber={proof.number} orderEmail={proof.email} />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
