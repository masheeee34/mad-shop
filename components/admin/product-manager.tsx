"use client";

import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, UploadCloud, Loader2, Image as ImageIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/lib/products";
import { categories } from "@/lib/products";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { saveProductAction, deleteProductAction } from "@/app/admin/actions";

export function ProductManager({ products }: { products: Product[] }) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setOpen(true); };
  const close = () => setOpen(false);

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
        {products.length === 0 && (
          <p className="p-6 text-center text-muted">Aucun produit. Cliquez sur Ajouter.</p>
        )}
        {products.map((p) => {
          const stock = p.stockQuantity ?? (p.inStock ? 10 : 0);
          const isAvailable = p.inStock && stock > 0;
          return (
            <div key={p.slug} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-line bg-elevated">
                  {p.images[0] ? (
                    <img
                      src={getImageUrl(p.images[0])}
                      alt={p.name}
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-faint">
                      <ImageIcon className="size-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-faint flex items-center gap-2 mt-0.5">
                    <span>{p.category}</span>
                    <span>·</span>
                    <span>{formatPrice(p.priceCents)}</span>
                    <span>·</span>
                    <span className={isAvailable ? "text-it-green font-medium" : "text-it-red font-medium"}>
                      {isAvailable ? `En stock (${stock})` : "Rupture de stock (0)"}
                    </span>
                  </p>
                </div>
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
          );
        })}
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />

            {/* Panneau latéral — toujours scrollable, bouton fixé en bas */}
            <motion.aside
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-charcoal shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* En-tête fixe */}
              <div className="flex items-center justify-between border-b border-line px-6 py-5">
                <h2 className="font-display text-lg font-bold uppercase tracking-wide">
                  {editing ? "Modifier le produit" : "Nouveau produit"}
                </h2>
                <button
                  onClick={close}
                  className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-elevated hover:text-cream"
                  aria-label="Fermer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Corps scrollable */}
              <form
                id="product-form"
                action={saveProductAction}
                onSubmit={() => setTimeout(close, 150)}
                className="flex flex-1 flex-col overflow-hidden"
              >
                {editing && <input type="hidden" name="slug" value={editing.slug} />}

                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5" data-lenis-prevent>
                  <Field name="name" label="Nom du produit" defaultValue={editing?.name} required />
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
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col justify-end pb-1">
                      <label className="flex cursor-pointer items-center gap-2.5">
                        <input
                          type="checkbox"
                          name="inStock"
                          defaultChecked={editing?.inStock ?? true}
                          className="size-4 accent-[color:var(--color-gold)]"
                        />
                        <span className="text-sm font-medium text-cream">Activer en boutique</span>
                      </label>
                      <p className="mt-1 text-xs text-faint">
                        Décocher = masqué ou indisponible
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Field
                      name="priceEuros"
                      label="Prix (€)"
                      type="number"
                      step="0.01"
                      defaultValue={editing ? (editing.priceCents / 100).toFixed(2) : ""}
                      required
                    />
                    <Field
                      name="compareAtEuros"
                      label="Prix barré (€)"
                      type="number"
                      step="0.01"
                      defaultValue={editing?.compareAtCents ? (editing.compareAtCents / 100).toFixed(2) : ""}
                    />
                    <Field
                      name="stockQuantity"
                      label="Stock disponible"
                      type="number"
                      step="1"
                      min="0"
                      defaultValue={editing?.stockQuantity !== undefined ? String(editing.stockQuantity) : (editing?.inStock === false ? "0" : "10")}
                      required
                    />
                  </div>

                  <Field name="badge" label="Badge (ex : Best-seller)" defaultValue={editing?.badge} />
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

                  {/* Upload photos */}
                  <ImageUploader initialImages={editing?.images ?? []} />
                </div>

                {/* Pied fixe — toujours visible */}
                <div className="flex gap-3 border-t border-line px-6 py-4">
                  <Button type="button" variant="outline" size="md" className="flex-1" onClick={close}>
                    Annuler
                  </Button>
                  <Button type="submit" size="md" className="flex-1">
                    Enregistrer
                  </Button>
                </div>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ImageUploader({ initialImages }: { initialImages: string[] }) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError("");

    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok && data.filename) {
          setImages((prev) => [...prev, data.filename]);
        } else {
          setError(data.error ?? "Erreur d'envoi.");
        }
      } catch {
        setError("Impossible d'envoyer l'image.");
      }
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <Label>Photos du produit</Label>
      {/* Valeur soumise avec le formulaire */}
      <input type="hidden" name="images" value={images.join(", ")} />

      {images.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div
              key={i}
              className="group relative size-16 overflow-hidden rounded-xl border border-line bg-elevated"
            >
              <img
                src={getImageUrl(img)}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute inset-0 grid place-items-center bg-black/70 opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 className="size-4 text-it-red" />
              </button>
            </div>
          ))}
        </div>
      )}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute inset-0 grid place-items-center bg-black/70 opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 className="size-4 text-it-red" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
        id="product-image-input"
      />
      <label
        htmlFor="product-image-input"
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-elevated/50 p-5 text-center transition hover:border-gold/50 hover:bg-elevated"
      >
        {uploading ? (
          <span className="flex items-center gap-2 text-sm text-gold">
            <Loader2 className="size-5 animate-spin" /> Envoi en cours…
          </span>
        ) : (
          <>
            <UploadCloud className="mb-2 size-6 text-gold" />
            <span className="text-sm font-medium text-cream">
              Cliquer pour sélectionner une ou plusieurs photos
            </span>
            <span className="mt-1 text-xs text-faint">JPG, PNG, WEBP</span>
          </>
        )}
      </label>
      {error && <p className="mt-1 text-xs text-it-red">{error}</p>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs uppercase tracking-widest text-faint">
      {children}
    </label>
  );
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
