"use client";

import { useState } from "react";
import { Mail, MapPin, Clock, Send, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("done");
        e.currentTarget.reset();
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="shell grid gap-10 pt-24 pb-8 md:pt-32 md:pb-10 lg:grid-cols-[1fr_1.3fr] lg:gap-14 lg:pt-40">
      <div>
        <span className="gold-rule" />
        <h1 className="display mt-3 text-3xl md:text-5xl">Contactez-nous</h1>
        <p className="mt-4 text-sm text-muted sm:text-base">
          Une question sur un produit, une commande ou une réservation ? Notre
          équipe vous répond avec plaisir, généralement sous 24h.
        </p>
        <ul className="mt-6 space-y-4">
          <Info icon={Mail} label="Email" value="contact@madshop.fr" />
          <Info icon={Clock} label="Horaires" value="Lun-Sam, 9h-19h" />
          <Info icon={MapPin} label="Livraison" value="France & Europe · 24-48h" />
        </ul>
        <span className="tricolore mt-8 block w-40" aria-hidden />
      </div>

      <form onSubmit={onSubmit} className="card p-5 sm:p-7 md:p-9">
        {status === "done" ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-it-green/15 text-it-green">
              <Check className="size-7" />
            </span>
            <p className="font-semibold">Message envoyé !</p>
            <p className="text-sm text-muted">Merci, nous revenons vers vous rapidement.</p>
            <Button variant="outline" size="sm" onClick={() => setStatus("idle")} type="button">
              Envoyer un autre message
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="name" label="Nom" type="text" autoComplete="name" required />
              <Field name="email" label="Email" type="email" inputMode="email" autoComplete="email" required />
            </div>
            <Field name="subject" label="Sujet" type="text" autoComplete="off" />
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-widest text-faint">
                Message <span className="text-gold">*</span>
              </label>
              <textarea
                name="message"
                rows={5}
                required
                className="w-full rounded-xl border border-line bg-elevated px-4 py-3 text-sm text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none"
                placeholder="Votre message…"
              />
            </div>
            {status === "error" && (
              <p className="text-sm text-it-red">Une erreur est survenue. Réessayez.</p>
            )}
            <Button type="submit" size="lg" disabled={status === "loading"}>
              {status === "loading" ? (
                <><Loader2 className="size-4 animate-spin" /> Envoi…</>
              ) : (
                <>Envoyer <Send className="size-4" /></>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center gap-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-gold">
        <Icon className="size-5" />
      </span>
      <span>
        <span className="block text-xs uppercase tracking-widest text-faint">{label}</span>
        <span className="block text-cream">{value}</span>
      </span>
    </li>
  );
}

function Field({
  name,
  label,
  type,
  inputMode,
  autoComplete,
  required,
}: {
  name: string;
  label: string;
  type: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-widest text-faint">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-xl border border-line bg-elevated px-4 py-3 text-sm text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none"
      />
    </div>
  );
}
