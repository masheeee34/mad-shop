"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Logo MAD SHOP.
 * Utilise /public/brand/logo.png (version blanche, fond transparent conseillé)
 * dès qu'il existe. Sinon, repli automatique sur une reconstruction typo + tricolore.
 *
 * `variant="full"` = cercle + MAD + tricolore + SHOP.
 * `variant="mark"` = version compacte (MAD + tricolore).
 */
export function Logo({
  variant = "full",
  className,
}: {
  variant?: "full" | "mark";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <span className={cn("relative inline-flex items-center justify-center shrink-0", className)}>
        <img
          src="/newlogo.jpg"
          alt="MAD Shop"
          className="h-full w-auto max-h-16 object-contain rounded-md"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return <TypographicLogo variant={variant} className={className} />;
}

/** Repli : logo reconstruit en typo (aucun fichier requis). */
function TypographicLogo({
  variant,
  className,
}: {
  variant: "full" | "mark";
  className?: string;
}) {
  const Inner = (
    <span className="flex flex-col items-center leading-none">
      <span
        className="font-display font-bold tracking-tight"
        style={{ fontSize: "1.9em", letterSpacing: "-0.04em" }}
      >
        MAD
      </span>
      <span
        className="tricolore my-[0.12em]"
        style={{ width: "1.9em", height: "2px", borderRadius: "1px" }}
        aria-hidden
      />
      {variant === "full" && (
        <span
          className="text-cream/90"
          style={{ fontSize: "0.52em", letterSpacing: "0.55em", paddingLeft: "0.55em" }}
        >
          SHOP
        </span>
      )}
    </span>
  );

  if (variant === "mark") {
    return (
      <span className={cn("inline-flex text-cream", className)} aria-label="MAD Shop">
        {Inner}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-grid place-items-center rounded-full border-2 border-cream/85 text-cream aspect-square",
        className,
      )}
      aria-label="MAD Shop"
      style={{ padding: "0.9em" }}
    >
      {Inner}
    </span>
  );
}
