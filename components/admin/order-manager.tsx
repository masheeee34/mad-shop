"use client";

import { useState } from "react";
import { ExternalLink, Search, PackageCheck, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/data/orders";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/data/orders";
import { CARRIERS, CARRIER_IDS, trackingUrl } from "@/lib/carriers";
import { formatPrice } from "@/lib/utils";
import { updateOrderStatusAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

const STATUS_ICONS: Record<OrderStatus, typeof Clock> = {
  en_preparation: Clock,
  expediee: Truck,
  livree: CheckCircle2,
  annulee: XCircle,
};

const STATUS_BADGE_STYLES: Record<OrderStatus, string> = {
  en_preparation: "bg-gold/10 text-gold border-gold/30",
  expediee: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  livree: "bg-it-green/10 text-it-green border-it-green/30",
  annulee: "bg-it-red/10 text-it-red border-it-red/30",
};

export function OrderManager({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = orders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchesQuery =
      !q ||
      o.number.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      (o.name && o.name.toLowerCase().includes(q)) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-3xl md:text-4xl">Suivi des Commandes</h1>
          <p className="mt-1 text-muted">
            {orders.length} commande(s) enregistrée(s) · Gérez les statuts et numéros de suivi.
          </p>
        </div>
      </div>

      {/* Barre de recherche et filtres de statut */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (N° commande, client, email, colis)..."
            className="w-full rounded-xl border border-line bg-elevated py-2.5 pl-10 pr-4 text-sm text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none"
          />
        </div>

        {/* Filtre rapide par statut */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              statusFilter === "all"
                ? "bg-gold text-ink"
                : "bg-elevated text-muted hover:text-cream"
            }`}
          >
            Toutes ({orders.length})
          </button>
          {ORDER_STATUSES.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  statusFilter === st
                    ? "bg-gold text-ink"
                    : "bg-elevated text-muted hover:text-cream"
                }`}
              >
                {STATUS_LABELS[st]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          <PackageCheck className="mx-auto size-10 text-faint mb-3" />
          <p className="font-medium">Aucune commande ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => {
            const Icon = STATUS_ICONS[o.status];
            const badgeClass = STATUS_BADGE_STYLES[o.status];
            return (
              <div key={o.number} className="card p-6 transition hover:border-line-strong">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  {/* Informations Commande & Client */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-display text-xl font-bold tracking-tight text-cream">
                        {o.number}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}
                      >
                        <Icon className="size-3.5" />
                        {STATUS_LABELS[o.status]}
                      </span>
                      <span className="text-xs text-faint ml-auto sm:ml-0">
                        {new Date(o.createdAt).toLocaleString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="text-sm text-muted">
                      <p className="font-medium text-cream">
                        {o.name || "Client"} <span className="text-faint font-normal">({o.email})</span>
                      </p>
                    </div>

                    {/* Liste des articles commandés */}
                    <div className="rounded-xl border border-line/60 bg-elevated/40 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-faint mb-1.5">
                        Articles commandés
                      </p>
                      <ul className="space-y-1 text-sm text-cream">
                        {o.items.map((it, i) => (
                          <li key={i} className="flex justify-between items-center text-xs sm:text-sm">
                            <span>
                              <span className="font-semibold text-gold">{it.quantity}×</span> {it.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Panneau de mise à jour Statut & Suivi */}
                  <div className="lg:w-72 shrink-0 border-t border-line pt-4 lg:border-t-0 lg:pt-0 lg:pl-6 lg:border-l flex flex-col justify-between">
                    <div className="mb-2 flex items-baseline justify-between lg:justify-end gap-2">
                      <span className="text-xs text-faint">Total payé :</span>
                      <span className="font-display text-xl font-bold text-gold">
                        {formatPrice(o.totalCents)}
                      </span>
                    </div>

                    <form action={updateOrderStatusAction} className="space-y-2.5 mt-2">
                      <input type="hidden" name="number" value={o.number} />

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-faint mb-1">
                          Changer le statut
                        </label>
                        <select
                          name="status"
                          defaultValue={o.status}
                          aria-label={`Statut de ${o.number}`}
                          className="w-full rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-cream focus:border-gold/50 focus:outline-none"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-faint mb-1">
                          Transporteur
                        </label>
                        <select
                          name="carrier"
                          defaultValue={o.carrier ?? "colissimo"}
                          aria-label={`Transporteur de ${o.number}`}
                          className="w-full rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-cream focus:border-gold/50 focus:outline-none"
                        >
                          {CARRIER_IDS.map((id) => (
                            <option key={id} value={id}>
                              {CARRIERS[id].label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-faint mb-1">
                          Numéro de colis
                        </label>
                        <input
                          name="trackingNumber"
                          defaultValue={o.trackingNumber ?? ""}
                          maxLength={60}
                          placeholder="Ex : 8V1234567890"
                          aria-label={`Numéro de colis de ${o.number}`}
                          className="w-full rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none"
                        />
                      </div>

                      <Button type="submit" size="sm" full className="w-full mt-3">
                        Enregistrer les modifications
                      </Button>
                    </form>

                    {trackingUrl(o.carrier, o.trackingNumber) && (
                      <a
                        href={trackingUrl(o.carrier, o.trackingNumber) ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-gold transition hover:bg-elevated hover:text-gold-bright"
                      >
                        <ExternalLink className="size-3.5" /> Voir la page de suivi colis
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
