import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Star,
  Tag,
  Bell,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { getProducts } from "@/lib/data/catalog";
import { allOrders, STATUS_LABELS } from "@/lib/data/orders";
import { allReviews } from "@/lib/data/reviews";
import { getPromos } from "@/lib/data/promos";
import { getNotifications } from "@/lib/data/notifications";
import { getAbandonedCarts } from "@/lib/data/abandoned";
import { formatPrice } from "@/lib/utils";

import { getSettings } from "@/lib/data/settings";
import { TestModeToggle } from "./test-mode-toggle";

export const dynamic = "force-dynamic";

/** En dessous de ce seuil, il faut réapprovisionner avant la rupture. */
const LOW_STOCK_THRESHOLD = 5;

export default async function AdminDashboard() {
  const [products, orders, reviews, promos, notifications, abandoned, settings] =
    await Promise.all([
      getProducts(),
      allOrders(),
      allReviews(),
      getPromos(),
      getNotifications(),
      getAbandonedCarts(),
      getSettings(),
    ]);

  const paidOrders = orders.filter((o) => o.status !== "annulee");
  const revenue = paidOrders.reduce((n, o) => n + o.totalCents, 0);
  const averageBasket = paidOrders.length
    ? Math.round(revenue / paidOrders.length)
    : 0;

  const pendingReviews = reviews.filter((r) => !r.approved).length;
  const toShip = orders.filter((o) => o.status === "en_preparation").length;

  /**
   * Paniers laissés en plan. Le taux de récupération mesure ce que rapporte
   * réellement l'email de relance — c'est le seul chiffre qui dit s'il vaut la
   * peine d'être gardé.
   */
  const openCarts = abandoned.filter((c) => !c.recoveredAt);
  const recovered = abandoned.filter((c) => c.recoveredAt).length;
  const recoveryRate = abandoned.length
    ? Math.round((recovered / abandoned.length) * 100)
    : 0;
  const lostValue = openCarts.reduce((n, c) => n + c.totalCents, 0);

  /**
   * Produits qui vont manquer. Une rupture non anticipée coûte deux fois :
   * la vente perdue, et le budget publicitaire dépensé pour l'amener.
   */
  const lowStock = products
    .map((p) => ({
      ...p,
      stock: p.stockQuantity ?? (p.inStock ? 10 : 0),
    }))
    .filter((p) => p.stock <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock);

  const cards = [
    {
      label: "Produits",
      value: products.length,
      sub: lowStock.length ? `${lowStock.length} en stock faible` : undefined,
      icon: Package,
      href: "/admin/produits",
    },
    {
      label: "Commandes",
      value: orders.length,
      sub: toShip ? `${toShip} à expédier` : undefined,
      icon: ShoppingCart,
      href: "/admin/commandes",
    },
    {
      label: "Alertes de stock",
      value: notifications.length,
      sub: notifications.length ? "clients à prévenir" : undefined,
      icon: Bell,
      href: "/admin/alertes",
    },
    {
      label: "Avis",
      value: reviews.length,
      sub: pendingReviews ? `${pendingReviews} à modérer` : undefined,
      icon: Star,
      href: "/admin/avis",
    },
    {
      label: "Codes promo",
      value: promos.length,
      icon: Tag,
      href: "/admin/promos",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display text-3xl md:text-4xl">Tableau de bord</h1>
        <p className="mt-2 text-muted">Vue d&apos;ensemble de votre boutique.</p>
      </div>

      <TestModeToggle initialMode={settings.testMode} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <p className="text-sm text-muted">Chiffre d&apos;affaires (hors annulées)</p>
          <p className="mt-1 font-display text-4xl font-bold text-gold-bright">
            {formatPrice(revenue)}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-muted">Panier moyen</p>
          <p className="mt-1 font-display text-4xl font-bold text-cream">
            {formatPrice(averageBasket)}
          </p>
          <p className="mt-1 text-xs text-faint">
            Sur {paidOrders.length} commande(s) valide(s)
          </p>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Package className="size-5 text-gold" />
            <h2 className="font-display text-xl font-semibold">Stocks à surveiller</h2>
          </div>
          <div className="card divide-y divide-line">
            {lowStock.map((p) => (
              <Link
                key={p.slug}
                href="/admin/produits"
                className="flex items-center justify-between gap-4 p-4 transition hover:bg-elevated/40"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className="text-xs text-faint">{p.category}</span>
                </span>
                <span
                  className={
                    p.stock === 0
                      ? "shrink-0 text-sm font-semibold text-it-red"
                      : "shrink-0 text-sm font-semibold text-gold"
                  }
                >
                  {p.stock === 0 ? "Rupture" : `${p.stock} restant(s)`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {abandoned.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <ShoppingBag className="size-5 text-gold" />
            <h2 className="font-display text-xl font-semibold">Paniers abandonnés</h2>
          </div>

          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <div className="card p-5">
              <p className="text-sm text-muted">En attente</p>
              <p className="mt-1 font-display text-3xl font-bold">{openCarts.length}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-muted">Montant en jeu</p>
              <p className="mt-1 font-display text-3xl font-bold text-gold-bright">
                {formatPrice(lostValue)}
              </p>
            </div>
            <div className="card p-5">
              <p className="text-sm text-muted">Récupérés après relance</p>
              <p className="mt-1 font-display text-3xl font-bold">
                {recovered}
                <span className="ml-2 text-base font-medium text-muted">
                  ({recoveryRate} %)
                </span>
              </p>
            </div>
          </div>

          <div className="card divide-y divide-line">
            {abandoned.slice(0, 5).map((cart) => (
              <div
                key={cart.sessionId}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{cart.email}</p>
                  <p className="text-xs text-faint">
                    {new Date(cart.createdAt).toLocaleDateString("fr-FR")} ·{" "}
                    {cart.items.reduce((n, i) => n + i.quantity, 0)} article(s)
                  </p>
                </div>
                <span className="text-xs text-muted">
                  {cart.recoveredAt
                    ? "Commande finalisée"
                    : cart.remindedAt
                      ? "Relance envoyée"
                      : "Relance en attente"}
                </span>
                <span className="font-semibold text-gold">
                  {formatPrice(cart.totalCents)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Dernières commandes</h2>
          <Link
            href="/admin/commandes"
            className="link-underline text-sm text-muted hover:text-cream"
          >
            Tout voir
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-muted">Aucune commande pour l&apos;instant.</p>
        ) : (
          <div className="card divide-y divide-line">
            {orders.slice(0, 5).map((o) => (
              <div key={o.number} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{o.number}</p>
                  <p className="truncate text-xs text-faint">{o.email}</p>
                </div>
                <span className="shrink-0 text-sm text-muted">{STATUS_LABELS[o.status]}</span>
                <span className="shrink-0 font-semibold text-gold">
                  {formatPrice(o.totalCents)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
