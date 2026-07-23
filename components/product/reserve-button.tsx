"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarClock, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReserveButton({
  productName,
  productSlug,
}: {
  productName: string;
  productSlug: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, productName, productSlug }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <Button variant="outline" size="lg" onClick={() => setOpen(true)} className="w-full">
        <CalendarClock className="size-4" /> Réserver ce produit
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-0 z-50 grid place-items-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="card w-full max-w-md p-7"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-1 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase tracking-wide">
                      Réserver
                    </h3>
                    <p className="mt-1 text-sm text-muted">{productName}</p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="grid size-8 place-items-center rounded-full text-muted hover:text-cream"
                    aria-label="Fermer"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {status === "done" ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <span className="grid size-14 place-items-center rounded-full bg-it-green/15 text-it-green">
                      <Check className="size-7" />
                    </span>
                    <p className="font-semibold">Réservation enregistrée !</p>
                    <p className="text-sm text-muted">
                      On vous recontacte très vite pour finaliser. Merci de votre confiance.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                      Fermer
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="mt-4 space-y-3">
                    <Field name="name" label="Nom complet" type="text" required />
                    <Field name="email" label="Email" type="email" required />
                    <Field name="phone" label="Téléphone" type="tel" />
                    <div>
                      <label className="mb-1.5 block text-xs uppercase tracking-widest text-faint">
                        Message (optionnel)
                      </label>
                      <textarea
                        name="message"
                        rows={2}
                        className="w-full rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none"
                        placeholder="Une question, une préférence…"
                      />
                    </div>
                    {status === "error" && (
                      <p className="text-sm text-it-red">
                        Une erreur est survenue. Réessayez ou passez par la page Contact.
                      </p>
                    )}
                    <Button type="submit" size="lg" full className="w-full" disabled={status === "loading"}>
                      {status === "loading" ? (
                        <>
                          <Loader2 className="size-4 animate-spin" /> Envoi…
                        </>
                      ) : (
                        "Confirmer la réservation"
                      )}
                    </Button>
                    <p className="text-center text-xs text-faint">
                      Sans engagement · aucun paiement à cette étape
                    </p>
                  </form>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Field({
  name,
  label,
  type,
  required,
}: {
  name: string;
  label: string;
  type: string;
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
        required={required}
        className="w-full rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none"
      />
    </div>
  );
}
