"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  slug: string;
  name: string;
  priceCents: number;
  image: string;
  quantity: number;
};

export type AppliedPromo = {
  code: string;
  type: "percent" | "amount";
  value: number;
  label?: string;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  promo: AppliedPromo | null;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  applyPromo: (promo: AppliedPromo) => void;
  clearPromo: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      promo: null,
      add: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.slug === item.slug);
          if (existing) {
            return {
              isOpen: true,
              items: state.items.map((i) =>
                i.slug === item.slug
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return { isOpen: true, items: [...state.items, { ...item, quantity }] };
        }),
      remove: (slug) =>
        set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),
      setQuantity: (slug, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.slug === slug ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [], promo: null }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      applyPromo: (promo) => set({ promo }),
      clearPromo: () => set({ promo: null }),
    }),
    {
      name: "madshop-cart",
      // On ne persiste que le contenu du panier et le promo, pas l'état du tiroir.
      partialize: (state) => ({ items: state.items, promo: state.promo }),
    },
  ),
);

/** Sélecteurs dérivés (à utiliser dans les composants). */
export const selectCount = (s: CartState) =>
  s.items.reduce((n, i) => n + i.quantity, 0);

export const selectSubtotal = (s: CartState) =>
  s.items.reduce((n, i) => n + i.priceCents * i.quantity, 0);

export const selectDiscount = (s: CartState) => {
  const subtotal = selectSubtotal(s);
  if (!s.promo) return 0;
  if (s.promo.type === "percent") return Math.round((subtotal * s.promo.value) / 100);
  return Math.min(s.promo.value, subtotal);
};

export const selectTotal = (s: CartState) =>
  Math.max(0, selectSubtotal(s) - selectDiscount(s));
