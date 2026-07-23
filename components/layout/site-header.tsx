"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CartButton } from "@/components/cart/cart-button";
import { WishlistNav } from "@/components/layout/wishlist-nav";
import { SearchDialog } from "@/components/search/search-dialog";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Accueil" },
  { href: "/boutique", label: "Boutique" },
  { href: "/suivi", label: "Suivi" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ferme le menu mobile à chaque changement de route.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-500",
        scrolled
          ? "border-b border-line bg-ink/85 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="shell flex h-16 items-center justify-between py-2">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3" aria-label="MAD Shop — accueil">
          <Logo variant="full" className="h-10 text-cream" />
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-muted sm:block lg:block">
            La qualité
            <br />à petit prix
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "link-underline text-sm uppercase tracking-widest transition-colors",
                  active ? "text-gold-bright" : "text-cream/80 hover:text-cream",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <SearchDialog />
          {/* Favoris + Panier : visibles sur desktop seulement (sur mobile = bottom nav) */}
          <span className="hidden lg:flex lg:items-center lg:gap-1">
            <WishlistNav />
            <CartButton />
          </span>
          {/* Panier visible sur tablette (md) mais pas lg → bottom nav sur mobile */}
          <span className="flex items-center gap-1 lg:hidden">
            <CartButton />
          </span>
          {/* Burger menu — uniquement sur md (tablette sans bottom nav complet) */}
          <button
            className="grid size-11 place-items-center rounded-full text-cream md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile slide-down */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line bg-ink/95 backdrop-blur-xl md:hidden"
          >
            <div className="shell flex flex-col gap-1 py-3">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-xl px-3 py-3.5 text-base uppercase tracking-wide transition",
                      active
                        ? "bg-elevated text-gold-bright"
                        : "text-cream/90 hover:bg-elevated hover:text-gold-bright",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
