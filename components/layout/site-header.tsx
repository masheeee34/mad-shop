"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CartButton } from "@/components/cart/cart-button";
import { WishlistNav } from "@/components/layout/wishlist-nav";
import { SearchDialog } from "@/components/search/search-dialog";
import { MegaMenu } from "@/components/layout/mega-menu";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { categories } from "@/lib/products";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/boutique", label: "Boutique", mega: true },
  { href: "/a-propos", label: "Notre démarche" },
  { href: "/contact", label: "Contact" },
];

/** Laisse le temps de traverser l'espace vide entre le lien et le panneau. */
const CLOSE_DELAY_MS = 140;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ferme tout à chaque changement de route.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setMenuOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  // Le menu mobile occupe tout l'écran : on gèle le défilement derrière lui.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Échap referme le panneau desktop.
  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMegaOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [megaOpen]);

  function openMega() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  }

  function scheduleCloseMega() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), CLOSE_DELAY_MS);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <AnnouncementBar />

      <div
        className={cn(
          "relative border-b transition-colors duration-500",
          scrolled || megaOpen
            ? "border-line bg-ink/90 backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
        onMouseLeave={scheduleCloseMega}
      >
        <div className="shell flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
            aria-label="MAD Shop — accueil"
          >
            <Logo variant="full" className="h-9 text-cream" />
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));

              if (item.mega) {
                return (
                  <div key={item.href} onMouseEnter={openMega}>
                    <Link
                      href={item.href}
                      aria-expanded={megaOpen}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] uppercase tracking-[0.14em] transition-colors",
                        active || megaOpen
                          ? "text-gold-bright"
                          : "text-cream/75 hover:text-cream",
                      )}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "size-3.5 transition-transform duration-300",
                          megaOpen && "rotate-180",
                        )}
                      />
                    </Link>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={scheduleCloseMega}
                  className={cn(
                    "rounded-full px-4 py-2 text-[13px] uppercase tracking-[0.14em] transition-colors",
                    active ? "text-gold-bright" : "text-cream/75 hover:text-cream",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1">
            <SearchDialog />
            <span className="hidden lg:flex lg:items-center lg:gap-1">
              <WishlistNav />
            </span>
            <CartButton />
            <button
              className="grid size-11 place-items-center rounded-full text-cream transition-opacity active:opacity-60 md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {megaOpen && (
            <div onMouseEnter={openMega}>
              <MegaMenu onNavigate={() => setMegaOpen(false)} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Menu mobile plein écran */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-[calc(2.25rem+4rem)] z-30 overflow-y-auto bg-ink md:hidden"
          >
            <div className="shell flex flex-col py-6">
              {[
                { href: "/", label: "Accueil" },
                ...nav,
              ].map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.04 * index,
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "block border-b border-line py-5 font-display text-2xl font-bold uppercase tracking-tight transition-colors",
                      pathname === item.href ? "text-gold-bright" : "text-cream",
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8"
              >
                <p className="text-[11px] uppercase tracking-[0.3em] text-faint">
                  Rayons
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category}
                      href={`/boutique?cat=${encodeURIComponent(category)}`}
                      className="rounded-full border border-line px-5 py-2.5 text-sm text-muted transition-colors hover:border-gold/50 hover:text-cream"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
