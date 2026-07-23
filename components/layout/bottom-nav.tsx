"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Search, Heart, Store } from "lucide-react";
import { useCart, selectCount } from "@/lib/store/cart";
import { useWishlist, selectWishlistCount } from "@/lib/store/wishlist";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";

/**
 * Barre de navigation inférieure mobile — standard industrie 2026.
 * Visible uniquement sur < lg, masquée sur desktop.
 * Zone pouce : toutes les destinations primaires à portée du pouce.
 */

const navItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/boutique", label: "Boutique", icon: Store },
  { href: "/favoris", label: "Favoris", icon: Heart, badge: "wishlist" },
  { href: "/panier", label: "Panier", icon: ShoppingBag, badge: "cart" },
];

export function BottomNav() {
  const pathname = usePathname();
  const openCart = useCart((s) => s.open);
  const cartCount = useCart(selectCount);
  const wishlistCount = useWishlist(selectWishlistCount);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Masquer sur les routes admin
  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav
      className="bottom-nav lg:hidden"
      aria-label="Navigation principale"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href || (href === "/boutique" && pathname?.startsWith("/boutique"));
          const isCart = badge === "cart";
          const count = badge === "cart" ? cartCount : badge === "wishlist" ? wishlistCount : 0;

          const content = (
            <span className="relative flex flex-col items-center gap-0.5">
              <span className="relative">
                <Icon
                  className={cn(
                    "size-5 transition-colors duration-200",
                    isActive ? "text-gold-bright" : "text-muted",
                  )}
                />
                <AnimatePresence>
                  {mounted && count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className={cn(
                        "absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full px-0.5 text-[9px] font-bold",
                        badge === "cart" ? "bg-gold text-ink" : "bg-it-red text-cream",
                      )}
                    >
                      {count > 9 ? "9+" : count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium tracking-wide transition-colors duration-200",
                  isActive ? "text-gold-bright" : "text-faint",
                )}
              >
                {label}
              </span>
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-2 h-0.5 w-6 rounded-full bg-gold-bright"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </span>
          );

          if (isCart) {
            return (
              <button
                key={href}
                onClick={() => { hapticLight(); openCart(); }}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center py-2",
                  "min-h-[56px] transition-opacity active:opacity-60",
                )}
                aria-label={label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              onClick={() => hapticLight()}
              className={cn(
                "flex flex-1 flex-col items-center justify-center py-2",
                "min-h-[56px] transition-opacity active:opacity-60",
              )}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
