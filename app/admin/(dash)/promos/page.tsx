import { getPromos } from "@/lib/data/promos";
import { savePromoAction, deletePromoAction } from "@/app/admin/actions";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const promos = await getPromos();

  return (
    <div>
      <h1 className="display text-3xl md:text-4xl">Codes promo</h1>
      <p className="mt-2 text-muted">Créez et gérez vos réductions.</p>

      {/* Ajout / mise à jour */}
      <form action={savePromoAction} className="card mt-8 grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div className="lg:col-span-1">
          <Label>Code</Label>
          <input
            name="code"
            required
            placeholder="BIENVENUE10"
            className="w-full rounded-xl border border-line bg-elevated px-3 py-2.5 text-sm uppercase text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none"
          />
        </div>
        <div>
          <Label>Type</Label>
          <select
            name="type"
            className="w-full rounded-xl border border-line bg-elevated px-3 py-2.5 text-sm text-cream focus:border-gold/50 focus:outline-none"
          >
            <option value="percent">Pourcentage (%)</option>
            <option value="amount">Montant (€)</option>
          </select>
        </div>
        <div>
          <Label>Valeur</Label>
          <input
            name="value"
            type="number"
            step="0.01"
            required
            placeholder="10"
            className="w-full rounded-xl border border-line bg-elevated px-3 py-2.5 text-sm text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none"
          />
        </div>
        <div>
          <Label>Libellé</Label>
          <input
            name="label"
            placeholder="Offre de bienvenue"
            className="w-full rounded-xl border border-line bg-elevated px-3 py-2.5 text-sm text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 pb-1">
            <input type="checkbox" name="active" defaultChecked className="size-4 accent-[color:var(--color-gold)]" />
            <span className="text-sm text-muted">Actif</span>
          </label>
          <Button type="submit" size="md">Enregistrer</Button>
        </div>
      </form>

      <p className="mt-3 text-xs text-faint">
        Astuce : réutilisez un code existant pour le mettre à jour. Pour un pourcentage, saisissez « 10 » (=10%). Pour un montant, « 5 » (=5 €).
      </p>

      {/* Liste */}
      <div className="mt-6 card divide-y divide-line">
        {promos.length === 0 ? (
          <p className="p-5 text-muted">Aucun code promo.</p>
        ) : (
          promos.map((p) => (
            <div key={p.code} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-display text-lg font-bold tracking-wide">{p.code}</p>
                <p className="text-sm text-muted">
                  {p.type === "percent" ? `−${p.value}%` : `−${formatPrice(p.value)}`}
                  {p.label ? ` · ${p.label}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs ${
                    p.active ? "bg-it-green/15 text-it-green" : "bg-elevated text-faint"
                  }`}
                >
                  {p.active ? "Actif" : "Inactif"}
                </span>
                <form action={deletePromoAction}>
                  <input type="hidden" name="code" value={p.code} />
                  <Button type="submit" size="sm" variant="ghost" className="text-it-red">
                    Supprimer
                  </Button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs uppercase tracking-widest text-faint">{children}</label>;
}
