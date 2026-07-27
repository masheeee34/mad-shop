"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CartBottomSheet } from "@/components/cart/cart-bottom-sheet";
import { HelpWidget } from "@/components/support/help-widget";

/**
 * Habillage de la boutique (header, footer, panier, aide, navigation basse).
 * Masqué sur les routes /admin, qui ont leur propre mise en page.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return (
      <main id="contenu" className="min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      {/*
        pt-9 compense la hauteur du bandeau d'annonces : chaque page conserve
        ainsi son propre espacement sous le header sans avoir à le recalculer.
        pb-… laisse la place à la navigation basse sur mobile.
      */}
      <main
        id="contenu"
        className="flex-1 pt-9 pb-[calc(var(--bottom-nav-h)+var(--sab))] lg:pb-0"
      >
        {children}
      </main>
      <SiteFooter />
      <CartBottomSheet />
      <BottomNav />
      <HelpWidget />
    </>
  );
}
