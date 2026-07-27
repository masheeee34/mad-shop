"use client";

import { useState } from "react";
import { Mail, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/compte/demande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus("sent");
        return;
      }
      setError(data.error ?? "Envoi impossible. Réessayez.");
      setStatus("error");
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="card flex flex-col items-center gap-3 p-8 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-it-green/15 text-it-green">
          <Check className="size-6" />
        </span>
        <p className="font-semibold text-cream">Lien envoyé</p>
        <p className="text-sm leading-relaxed text-muted">
          Si une commande est associée à <strong className="text-cream">{email}</strong>,
          vous recevez un lien de connexion d&apos;ici quelques instants. Pensez à
          vérifier vos indésirables.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => setStatus("idle")}
        >
          Utiliser une autre adresse
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <div>
        <label
          htmlFor="account-email"
          className="mb-1.5 block text-xs uppercase tracking-widest text-faint"
        >
          Adresse email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input
            id="account-email"
            type="email"
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre.email@exemple.com"
            className="w-full rounded-xl border border-line bg-elevated py-3 pl-10 pr-3 text-sm text-cream placeholder:text-faint focus:border-gold/60 focus:outline-none"
          />
        </div>
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-it-red">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" full className="w-full" disabled={status === "loading"}>
        {status === "loading" ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Envoi…
          </>
        ) : (
          "Recevoir mon lien de connexion"
        )}
      </Button>

      <p className="text-center text-xs text-faint">
        Aucun mot de passe n&apos;est créé ni stocké.
      </p>
    </form>
  );
}
