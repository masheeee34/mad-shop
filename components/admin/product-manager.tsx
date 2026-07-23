"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/lib/products";
import { categories } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { saveProductAction, deleteProductAction } from "@/app/admin/actions";

export function ProductManager({ products }: { products: Product[] }) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  const openNew = () => {
    setEditing(null);
    setCreating(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setCreating(true);
  };
  const close = () => setCreating(false);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="display text-3xl md:text-4xl">Produits</h1>
          <p className="mt-2 text-muted">{products.length} produit(s) au catalogue.</p>
        </div>
        <Button size="md" onClick={openNew}>
          <Plus className="size-4" /> Ajouter
        </Button>
      </div>

      <div className="card divide-y divide-line">
        {products.map((p) => (
          <div key={p.slug} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate font-medium">{p.name}</p>
              <p className="text-xs text-faint">
                {p.category} · {formatPrice(p.priceCents)} · {p.inStock ? "En stock" : "Rupture"}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => openEdit(p)}
                className="grid size-9 place-items-center rounded-lg border border-line text-muted transition hover:border-gold/50 hover:text-cream"
                aria-label="Modifier"
              >
                <Pencil className="size-4" />
              </button>
              <form action={deleteProductAction}>
                <input type="hidden" name="slug" value={p.slug} />
                <button
                  type="submit"
                  className="grid size-9 place-items-center rounded-lg border border-line text-muted transition hover:border-it-red/50 hover:text-it-red"
                  aria-label="Supprimer"
                >
                  <Trash2 className="size-4" />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {creating && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />
            <motion.div
              className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.96, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 16 }}
                className="card my-8 w-full max-w-lg p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold">
                    {editing ? "Modifier le produit" : "Nouveau produit"}
                  </h2>
                  <button onClick={close} className="text-muted hover:text-cream" aria-label="Fermer">
                    <X className="size-5" />
                  </button>
                </div>

                <form action={saveProductAction} onSubmit={() => setTimeout(close, 100)} className="space-y-3">
                  {editing && <input type="hidden" name="slug" value={editing.slug} />}
                  <Field name="name" label="Nom" defaultValue={editing?.name} required />
                  <Field name="tagline" label="Accroche" defaultValue={editing?.tagline} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Catégorie</Label>
                      <select
                        name="category"
                        defaultValue={editing?.category ?? "Audio"}
                        className="w-full rounded-xl border border-line bg-elevated px-3 py-2.5 text-sm text-cream focus:border-gold/50 focus:outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-end gap-2 pb-2.5">
                      <input
                        type="checkbox"
                        name="inStock"
                        defaultChecked={editing?.inStock ?? true}
                        className="size-4 accent-[color:var(--color-gold)]"
                      />
                      <span className="text-sm text-muted">En stock</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      name="priceEuros"
                      label="Prix (€)"
                      type="number"
                      step="0.01"
                      defaultValue={editing ? (editing.priceCents / 100).toString() : ""}
                      required
                    />
                    <Field
                      name="compareAtEuros"
                      label="Prix barré (€)"
                      type="number"
                      step="0.01"
                      defaultValue={editing?.compareAtCents ? (editing.compareAtCents / 100).toString() : ""}
                    />
                  </div>
                  <Field name="badge" label="Badge (ex: Best-seller)" defaultValue={editing?.badge} />
                  <Field
                    name="shortDescription"
                    label="Description courte"
                    defaultValue={editing?.shortDescription}
                  />
                  <Field
                    name="highlights"
                    label="Points forts (séparés par des virgules)"
                    defaultValue={editing?.highlights?.join(", ")}
                  />
                  <Field
                    name="images"
                    label="Images (noms de fichiers, séparés par des virgules)"
                    defaultValue={editing?.images?.join(", ")}
                    placeholder="mon-produit-1.jpg, mon-produit-2.jpg"
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" size="md" onClick={close}>
                      Annuler
                    </Button>
                    <Button type="submit" size="md">
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs uppercase tracking-widest text-faint">{children}</label>;
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  step,
  required,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  step?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-elevated px-3 py-2.5 text-sm text-cream placeholder:text-faint focus:border-gold/50 focus:outline-none"
      />
    </div>
  );
}
