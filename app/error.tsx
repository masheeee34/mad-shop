"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { RotateCcw, Home } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MAD Shop] Client error caught:", error);
  }, [error]);

  return (
    <div className="shell flex min-h-[70vh] flex-col items-center justify-center pt-24 pb-16 text-center">
      <div className="card max-w-md p-8 sm:p-10 border border-line bg-charcoal shadow-2xl">
        <span className="tricolore mx-auto block max-w-[120px]" />
        <h2 className="display mt-6 text-2xl font-bold sm:text-3xl">
          Une petite interruption est survenue
        </h2>
        <p className="mt-3 text-sm text-muted">
          La page n'a pas pu être affichée temporairement. Veuillez rafraîchir ou revenir à l'accueil.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
          <Button onClick={() => reset()} size="md" variant="primary">
            <RotateCcw className="size-4" /> Réessayer
          </Button>
          <ButtonLink href="/" size="md" variant="outline">
            <Home className="size-4" /> Accueil
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
