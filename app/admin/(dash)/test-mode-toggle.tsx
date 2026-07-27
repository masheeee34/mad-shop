"use client";

import { useState } from "react";
import { ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function TestModeToggle({ initialMode }: { initialMode: boolean }) {
  const [testMode, setTestMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testMode: !testMode }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setTestMode(data.settings.testMode);
      } else if (res.status === 401) {
        alert("Session expirée ou ADMIN_SECRET manquant. Reconnectez-vous.");
        window.location.href = "/admin/login";
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Erreur serveur : " + (err.details || err.error || res.status));
      }
    } catch (err: any) {
      alert("Erreur réseau : " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-dashed border-2 border-it-red/50 bg-it-red/5">
      <div>
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          {testMode ? (
            <ShieldAlert className="size-5 text-it-red" />
          ) : (
            <ShieldCheck className="size-5 text-green-500" />
          )}
          Mode Test (Bypass Stripe)
        </h2>
        <p className="text-sm text-muted mt-1">
          Permet de valider une commande gratuitement sans entrer de carte bancaire. 
          <strong className="text-it-red ml-1">
            Désactive-le immédiatement après tes tests !
          </strong>
        </p>
      </div>
      
      <button
        onClick={toggle}
        disabled={loading}
        className={cn(
          "shrink-0 btn px-6 py-2 transition-all flex items-center gap-2",
          testMode 
            ? "bg-it-red text-white hover:bg-it-red/80" 
            : "bg-surface text-cream border border-line hover:border-gold"
        )}
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {testMode ? "Désactiver le Mode Test" : "Activer le Mode Test"}
      </button>
    </div>
  );
}
