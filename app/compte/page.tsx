import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ArrowRight } from "lucide-react";
import { currentCustomer } from "@/lib/customer-auth";
import { ordersByEmail, STATUS_LABELS, type OrderStatus } from "@/lib/data/orders";
import { formatPrice } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { LogoutButton } from "@/components/account/logout-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
};

/** Couleur du statut : le client doit le lire d'un coup d'œil. */
const STATUS_STYLE: Record<OrderStatus, string> = {
  en_preparation: "border-gold/40 bg-gold/10 text-gold-bright",
  expediee: "border-gold/40 bg-gold/10 text-gold-bright",
  livree: "border-it-green/40 bg-it-green/10 text-it-green",
  annulee: "border-it-red/40 bg-it-red/10 text-it-red",
};

export default async function AccountPage() {
  const email = await currentCustomer();
  if (!email) redirect("/compte/connexion");

  const orders = await ordersByEmail(email);
  const spent = orders
    .filter((o) => o.status !== "annulee")
    .reduce((n, o) => n + o.totalCents, 0);

  return (
    <div className="shell pt-28 pb-16 md:pt-36">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="gold-rule" />
          <h1 className="display mt-3 text-3xl md:text-5xl">Mon compte</h1>
          <p className="mt-3 text-sm text-muted">
            Connecté avec <span className="text-cream">{email}</span>
          </p>
        </div>
        <LogoutButton />
      </div>

      {orders.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="card p-6">
            <p className="text-sm text-muted">Commandes passées</p>
            <p className="mt-1 font-display text-3xl font-bold">{orders.length}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-muted">Total dépensé</p>
            <p className="mt-1 font-display text-3xl font-bold text-gold-bright">
              {formatPrice(spent)}
            </p>
          </div>
        </div>
      )}

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold uppercase tracking-tight">
          Historique
        </h2>

        {orders.length === 0 ? (
          <div className="card mt-5 flex flex-col items-center gap-4 p-12 text-center">
            <Package className="size-8 text-faint" />
            <p className="text-muted">
              Aucune commande n&apos;est encore associée à cette adresse.
            </p>
            <ButtonLink href="/boutique" size="lg">
              Découvrir la boutique <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {orders.map((order) => (
              <article key={order.number} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold">{order.number}</p>
                    <p className="mt-0.5 text-xs text-faint">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-muted">
                      {order.items.map((item, i) => (
                        <li key={i}>
                          {item.quantity} × {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLE[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                    <span className="font-semibold text-gold">
                      {formatPrice(order.totalCents)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <p className="mt-10 text-sm text-muted">
        Une question sur une commande ?{" "}
        <Link href="/contact" className="link-underline text-cream">
          Écrivez-nous
        </Link>
        , nous répondons sous 24 h ouvrées.
      </p>
    </div>
  );
}
