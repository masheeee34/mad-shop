"use client";

import { useState } from "react";
import { Tag, X, Check, Loader2 } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";

/** Champ code promo (validation via /api/promo, appliqué au store). */
export function PromoInput() {
  const promo = useCart((s) => s.promo);
  const applyPromo = useCart((s) => s.applyPromo);
  const clearPromo = useCart((s) => s.clearPromo);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) {
        applyPromo(data.promo);
        setCode("");
        setStatus("idle");
      } else {
        setError(data.error ?? "Code invalide.");
        setStatus("error");
      }
    } catch {
      setError("Erreur, réessayez.");
      setStatus("error");
    }
  }

  if (promo) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-it-green/30 bg-it-green/10 px-4 py-3">
        <span className="flex items-center gap-2 text-sm text-cream">
          <Check className="size-4 text-it-green" />
          <span className="font-medium">{promo.code}</span>
          <span className="text-muted">
            {promo.type === "percent" ? `−${promo.value}%` : `−${formatPrice(promo.value)}`}
          </span>
        </span>
        <button
          onClick={clearPromo}
          className="text-faint transition hover:text-it-red"
          aria-label="Retirer le code"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={apply} className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Code promo"
            className="w-full rounded-xl border border-line bg-elevated py-2.5 pl-9 pr-3 text-sm uppercase text-cream placeholder:normal-case placeholder:text-faint focus:border-gold/50 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading" || !code.trim()}
          className="rounded-xl border border-line-strong px-4 text-sm font-medium text-cream transition hover:border-gold/60 hover:text-gold-bright disabled:opacity-40"
        >
          {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : "Appliquer"}
        </button>
      </div>
      {status === "error" && <p className="text-xs text-it-red">{error}</p>}
    </form>
  );
}
