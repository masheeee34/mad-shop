"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Star,
  Tag,
  Bell,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/alertes", label: "Alertes de stock", icon: Bell },
  { href: "/admin/avis", label: "Avis", icon: Star },
  { href: "/admin/promos", label: "Codes promo", icon: Tag },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition",
              active
                ? "bg-elevated text-gold-bright"
                : "text-muted hover:bg-elevated/60 hover:text-cream",
            )}
          >
            <Icon className="size-4" /> {label}
          </Link>
        );
      })}
      <div className="my-2 border-t border-line" />
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-muted transition hover:bg-elevated/60 hover:text-cream"
      >
        <ExternalLink className="size-4" /> Voir la boutique
      </Link>
      <button
        onClick={logout}
        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm text-muted transition hover:bg-elevated/60 hover:text-it-red"
      >
        <LogOut className="size-4" /> Déconnexion
      </button>
    </nav>
  );
}
