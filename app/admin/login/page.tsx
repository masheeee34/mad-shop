"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const password = new FormData(e.currentTarget).get("password");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const d = await res.json();
        setError(d.error ?? "Connexion refusée.");
        setStatus("error");
      }
    } catch {
      setError("Erreur, réessayez.");
      setStatus("error");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Logo variant="full" className="h-16" />
          <p className="text-xs uppercase tracking-[0.3em] text-faint">Espace administration</p>
        </div>
        <form onSubmit={onSubmit} className="card space-y-4 p-7">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest text-faint">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
              <input
                name="password"
                type="password"
                required
                autoFocus
                className="w-full rounded-xl border border-line bg-elevated py-2.5 pl-10 pr-3 text-sm text-cream focus:border-gold/50 focus:outline-none"
              />
            </div>
          </div>
          {status === "error" && <p className="text-sm text-it-red">{error}</p>}
          <Button type="submit" size="lg" full className="w-full" disabled={status === "loading"}>
            {status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Connexion…
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-faint">
          Défini par la variable <code>ADMIN_PASSWORD</code>.
        </p>
      </div>
    </div>
  );
}
