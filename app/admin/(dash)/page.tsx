import Link from "next/link";
import { Package, ShoppingCart, Star, Tag, ArrowRight } from "lucide-react";
import { getProducts } from "@/lib/data/catalog";
import { allOrders, STATUS_LABELS } from "@/lib/data/orders";
import { allReviews } from "@/lib/data/reviews";
import { getPromos } from "@/lib/data/promos";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [products, orders, reviews, promos] = await Promise.all([
    getProducts(),
    allOrders(),
    allReviews(),
    getPromos(),
  ]);

  const revenue = orders
    .filter((o) => o.status !== "annulee")
    .reduce((n, o) => n + o.totalCents, 0);
  const pendingReviews = reviews.filter((r) => !r.approved).length;

  const cards = [
    { label: "Produits", value: products.length, icon: Package, href: "/admin/produits" },
    { label: "Commandes", value: orders.length, icon: ShoppingCart, href: "/admin/commandes" },
    { label: "Avis", value: reviews.length, sub: pendingReviews ? `${pendingReviews} à modérer` : undefined, icon: Star, href: "/admin/avis" },
    { label: "Codes promo", value: promos.length, icon: Tag, href: "/admin/promos" },
  ];

  return (
    <div>
      <h1 className="display text-3xl md:text-4xl">Tableau de bord</h1>
      <p className="mt-2 text-muted">Vue d'ensemble de votre boutique MAD Shop.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, sub, icon: Icon, href }) => (
          <Link key={label} href={href} className="card group p-6 transition hover:border-gold/30">
            <div className="flex items-center justify-between">
              <Icon className="size-5 text-gold" />
              <ArrowRight className="size-4 text-faint transition group-hover:text-gold" />
            </div>
            <p className="mt-4 font-display text-3xl font-bold">{value}</p>
            <p className="text-sm text-muted">{label}</p>
            {sub && <p className="mt-1 text-xs text-gold">{sub}</p>}
          </Link>
        ))}
      </div>

      <div className="mt-6 card p-6">
        <p className="text-sm text-muted">Chiffre d'affaires (hors annulées)</p>
        <p className="mt-1 font-display text-4xl font-bold text-gold-bright">
          {formatPrice(revenue)}
        </p>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Dernières commandes</h2>
          <Link href="/admin/commandes" className="text-sm text-muted link-underline hover:text-cream">
            Tout voir
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-muted">Aucune commande pour l'instant.</p>
        ) : (
          <div className="card divide-y divide-line">
            {orders.slice(0, 5).map((o) => (
              <div key={o.number} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{o.number}</p>
                  <p className="text-xs text-faint">{o.email}</p>
                </div>
                <span className="text-sm text-muted">{STATUS_LABELS[o.status]}</span>
                <span className="font-semibold text-gold">{formatPrice(o.totalCents)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
