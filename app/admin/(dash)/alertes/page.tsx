import { Bell, Mail, Check, X } from "lucide-react";
import { getNotifications } from "@/lib/data/notifications";
import { getProducts } from "@/lib/data/catalog";
import { notifyRestockAction, dismissRestockAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Alertes de stock",
  robots: { index: false, follow: false },
};

/**
 * File d'attente des visiteurs à prévenir en cas de réapprovisionnement.
 *
 * C'est l'audience la plus qualifiée de la boutique : chaque inscrit a
 * demandé un produit précis, en rupture, et a laissé son email pour l'obtenir.
 * Un bouton envoie l'alerte à tout le groupe dès que le stock est remis.
 */
export default async function AdminAlertesPage() {
  const [notifications, products] = await Promise.all([
    getNotifications(),
    getProducts(),
  ]);

  // Regroupement par produit, du plus demandé au moins demandé.
  const grouped = new Map<string, { name: string; emails: string[]; latest: string }>();
  for (const n of notifications) {
    const entry = grouped.get(n.productSlug);
    if (entry) {
      if (!entry.emails.includes(n.email)) entry.emails.push(n.email);
      if (n.createdAt > entry.latest) entry.latest = n.createdAt;
    } else {
      grouped.set(n.productSlug, {
        name: n.productName,
        emails: [n.email],
        latest: n.createdAt,
      });
    }
  }

  const groups = [...grouped.entries()]
    .map(([slug, data]) => {
      const product = products.find((p) => p.slug === slug);
      const stock = product?.stockQuantity ?? (product?.inStock ? 10 : 0);
      return {
        slug,
        ...data,
        exists: Boolean(product),
        backInStock: Boolean(product?.inStock) && stock > 0,
        stock,
      };
    })
    .sort((a, b) => b.emails.length - a.emails.length);

  const totalEmails = groups.reduce((n, g) => n + g.emails.length, 0);

  return (
    <div>
      <h1 className="display text-3xl md:text-4xl">Alertes de stock</h1>
      <p className="mt-2 text-muted">
        {totalEmails === 0
          ? "Personne n'attend de réapprovisionnement pour le moment."
          : `${totalEmails} personne(s) en attente sur ${groups.length} produit(s).`}
      </p>

      {groups.length === 0 ? (
        <div className="card mt-10 flex flex-col items-center gap-3 p-12 text-center">
          <Bell className="size-8 text-faint" />
          <p className="text-muted">
            Les demandes apparaîtront ici dès qu&apos;un visiteur s&apos;inscrira
            sur une fiche en rupture de stock.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {groups.map((group) => (
            <div key={group.slug} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold">{group.name}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                    <Mail className="size-4 shrink-0 text-gold" />
                    {group.emails.length} inscrit(s) · dernière demande le{" "}
                    {new Date(group.latest).toLocaleDateString("fr-FR")}
                  </p>

                  {group.backInStock ? (
                    <p className="mt-2 flex items-center gap-2 text-sm text-it-green">
                      <Check className="size-4 shrink-0" />
                      De nouveau en stock ({group.stock}) — prêt à être annoncé
                    </p>
                  ) : (
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                      <X className="size-4 shrink-0 text-faint" />
                      {group.exists
                        ? "Toujours en rupture — remettez du stock pour pouvoir prévenir"
                        : "Produit supprimé du catalogue"}
                    </p>
                  )}

                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs uppercase tracking-widest text-faint">
                      Voir les adresses
                    </summary>
                    <ul className="mt-2 space-y-1 text-sm text-muted">
                      {group.emails.map((email) => (
                        <li key={email}>{email}</li>
                      ))}
                    </ul>
                  </details>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <form action={notifyRestockAction}>
                    <input type="hidden" name="slug" value={group.slug} />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!group.backInStock}
                      full
                      className="w-full"
                    >
                      Prévenir les {group.emails.length} inscrit(s)
                    </Button>
                  </form>
                  <form action={dismissRestockAction}>
                    <input type="hidden" name="slug" value={group.slug} />
                    <Button type="submit" size="sm" variant="outline" full className="w-full">
                      Effacer la liste
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
