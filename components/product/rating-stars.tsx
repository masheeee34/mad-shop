import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Affiche une note en étoiles (supporte les demi via le remplissage). */
export function RatingStars({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const dim = size === "md" ? "size-5" : "size-4";
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i - 0.25;
        const half = !filled && value >= i - 0.75;
        return (
          <span key={i} className="relative">
            <Star className={cn(dim, "text-line-strong")} />
            {(filled || half) && (
              <Star
                className={cn(dim, "absolute inset-0 fill-gold text-gold")}
                style={half ? { clipPath: "inset(0 50% 0 0)" } : undefined}
              />
            )}
          </span>
        );
      })}
    </span>
  );
}
