"use client";

import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, UploadCloud, Loader2, Image as ImageIcon } from "lucide-react";
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
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Miniature de l'image */}
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-elevated border border-line">
                {p.images[0] ? (
                  <img
                    src={p.images[0].startsWith("http") ? p.images[0] : `/products/${p.images[0]}`}
                    alt={p.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-faint">
                    <ImageIcon className="size-5" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate font-medium">{p.name}</p>
                <p className="text-xs text-faint">
                  {p.category} · {formatPrice(p.priceCents)} · {p.inStock ? "En stock" : "Rupture / Indisponible"}
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

                <form action={saveProductAction} onSubmit={() => setTimeout(close, 100)} className="space-y-4">
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
                    <label className="flex items-end gap-2 pb-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name="inStock"
                        defaultChecked={editing?.inStock ?? true}
                        className="size-4 accent-[color:var(--color-gold)]"
                      />
                      <span className="text-sm font-medium text-cream">En stock</span>
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

                  {/* UPLOADER DE PHOTOS EN 1 CLIC */}
                  <ImageUploader initialImages={editing?.images ?? []} />

                  <div className="flex justify-end gap-3 pt-3 border-t border-line">
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

/** Composant Uploader de Fichiers Photos interactif */
function ImageUploader({ initialImages }: { initialImages: string[] }) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (res.ok && data.filename) {
          setImages((prev) => [...prev, data.filename]);
        } else {
          setError(data.error ?? "Erreur d'envoi");
        }
      } catch {
        setError("Impossible d'envoyer l'image.");
      }
    }
    setUploading(false);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <Label>Photos du produit</Label>

      {/* Input hidden soumis avec le formulaire HTML */}
      <input type="hidden" name="images" value={images.join(", ")} />

      {/* Aperçu des miniatures chargées */}
      {images.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div key={i} className="group relative size-16 overflow-hidden rounded-xl border border-line bg-elevated">
              <img
                src={img.startsWith("http") ? img : `/products/${img}`}
                alt="Miniature"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute inset-0 grid place-items-center bg-black/70 text-it-red opacity-0 transition group-hover:opacity-100"
                title="Supprimer la photo"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Zone de sélection de fichier */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-line bg-elevated/50 p-4 text-center transition hover:border-gold/50 hover:bg-elevated"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex items-center gap-2 text-sm text-gold">
            <Loader2 className="size-5 animate-spin" /> Téléchargement en cours…
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted">
            <UploadCloud className="size-6 text-gold" />
            <span className="text-sm font-medium text-cream">
              Cliquez pour choisir une photo depuis votre PC / Téléphone
            </span>
            <span className="text-xs text-faint">JPG, PNG, WEBP acceptés</span>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-it-red">{error}</p>}
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
