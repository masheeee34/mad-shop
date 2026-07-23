import { cn } from "@/lib/utils";

/**
 * Logo MAD en filigrane géant, décoratif, très basse opacité.
 * Donne une signature "marque" en arrière-plan sans nuire à la lisibilité.
 */
export function LogoWatermark({
  className,
  opacity = 0.04,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute select-none", className)}
      style={{
        backgroundImage: "url(/brand/logo.png)",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        opacity,
      }}
    />
  );
}
