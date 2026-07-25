import { ExternalLink } from "lucide-react";
import { allOrders, ORDER_STATUSES, STATUS_LABELS } from "@/lib/data/orders";
import { CARRIERS, CARRIER_IDS, trackingUrl } from "@/lib/carriers";
import { formatPrice } from "@/lib/utils";
import { updateOrderStatusAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await allOrders();

  return (
    <div>
      <h1 className="display text-3xl md:text-4xl">Commandes</h1>
      <p className="mt-2 text-muted">{orders.length} commande(s).</p>

      {orders.length === 0 ? (
        <p className="mt-10 text-muted">Aucune commande pour l'instant.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((o) => (
            <div key={o.number} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-bold">{o.number}</p>
                  <p className="text-sm text-muted">
                    {o.name ? `${o.name} · ` : ""}
                    {o.email}
                  </p>
                  <p className="mt-1 text-xs text-faint">
                    {new Date(o.createdAt).toLocaleString("fr-FR")}
                  </p>
                  <ul className="mt-3 text-sm text-muted">
                    {o.items.map((it, i) => (
                      <li key={i}>
                        {it.quantity} × {it.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="w-full sm:w-auto sm:text-right">
                  <p className="font-semibold text-gold">{formatPrice(o.totalCents)}</p>

                  {/* Statut et colis dans un seul formulaire : l'email
                      d'expédition part alors avec le lien de suivi. */}
                  <form
                    action={updateOrderStatusAction}
                    className="mt-3 flex flex-col gap-2 sm:items-end"
                  >
                    <input type="hidden" name="number" value={o.number} />

                    <select
                      name="status"
                      defaultValue={o.status}
                      aria-label={`Statut de la commande ${o.number}`}
                      className="w-full rounded-lg border border-line bg-elevated px-3 py-2 text-sm text-cream focus:border-gold/50 focus:outline-none sm:w-52"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>

                    <select
                      name="carrier"
                      defaultValue={o.carrier ?? "colissimo"}
                      aria-label={`Transporteur de la commande ${o.number}`}
                      className="w-full rounded-lg border border-line bg-elevated px-3 py-2 text-sm text-cream focus:border-gold/50 focus:outline-none sm:w-52"
                    >
                      {CARRIER_IDS.map((id) => (
                        <option key={id} value={id}>
                          {CARRIERS[id].label}
                        </option>
                      ))}
                    </select>

                    <input
                      name="trackingNumber"
                      defaultValue={o.trackingNumber ?? ""}
                      maxLength={60}
                      placeholder="N° de colis"
                      aria-label={`Numéro de colis de la commande ${o.number}`}
                      className="w-full rounded-lg border border-line bg-elevated px-3 py-2 text-sm text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none sm:w-52"
                    />

                    <Button type="submit" size="sm" variant="outline">
                      Mettre à jour
                    </Button>
                  </form>

                  {trackingUrl(o.carrier, o.trackingNumber) && (
                    <a
                      href={trackingUrl(o.carrier, o.trackingNumber) ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-gold-bright"
                    >
                      <ExternalLink className="size-3.5" /> Voir le suivi
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
