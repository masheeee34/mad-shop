"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  clear: () => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) =>
        set((state) => ({
          slugs: state.slugs.includes(slug)
            ? state.slugs.filter((s) => s !== slug)
            : [slug, ...state.slugs],
        })),
      has: (slug) => get().slugs.includes(slug),
      clear: () => set({ slugs: [] }),
    }),
    { name: "madshop-wishlist" },
  ),
);

export const selectWishlistCount = (s: WishlistState) => s.slugs.length;
