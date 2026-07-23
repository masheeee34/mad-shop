"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CartBottomSheet } from "@/components/cart/cart-bottom-sheet";
import { ChatWidget } from "@/components/chat/chat-widget";

/**
 * Habillage de la boutique (header, footer, panier, chat, bottom nav).
 * Masqué sur les routes /admin, qui ont leur propre mise en page.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      {/* Padding bottom sur mobile pour laisser la place à la bottom nav */}
      <main className="flex-1 pb-[calc(var(--bottom-nav-h)+var(--sab))] lg:pb-0">
        {children}
      </main>
      <SiteFooter />
      <CartBottomSheet />
      <BottomNav />
      <ChatWidget />
    </>
  );
}
