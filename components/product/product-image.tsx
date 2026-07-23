"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Affiche /public/products/<file>.
 * Si le fichier n'existe pas encore, bascule sur un placeholder
 * brandé (dégradé charbon + doré + initiale). Dépose la vraie photo
 * sous le même nom pour la voir apparaître automatiquement.
 */
export function ProductImage({
  file,
  alt,
  label,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: {
  file: string;
  alt: string;
  label?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <Placeholder label={label ?? alt} className={className} />;
  }

  return (
    <Image
      src={`/products/${file}`}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}

function Placeholder({ label, className }: { label: string; className?: string }) {
  const initial = label.trim().charAt(0).toUpperCase();
  return (
    <div
      className={cn(
        "absolute inset-0 grid place-items-center overflow-hidden",
        className,
      )}
      style={{
        background:
          "radial-gradient(120% 120% at 30% 15%, #232326 0%, #141416 55%, #0d0d0e 100%)",
      }}
      role="img"
      aria-label={label}
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
      <div className="flex flex-col items-center gap-3 text-center px-6">
        <span className="font-display text-6xl font-bold text-gold/80">{initial}</span>
        <span className="tricolore" style={{ width: 44, borderRadius: 2 }} />
        <span className="text-[11px] uppercase tracking-[0.25em] text-faint">
          Photo à venir
        </span>
      </div>
    </div>
  );
}
