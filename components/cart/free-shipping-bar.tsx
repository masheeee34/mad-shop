"use client";

import { motion } from "motion/react";
import { Truck, PartyPopper } from "lucide-react";
import { useCart, selectSubtotal } from "@/lib/store/cart";
import { FREE_SHIPPING_CENTS } from "@/lib/config";
import { formatPrice } from "@/lib/utils";

/** Barre de progression vers la livraison offerte (dès 60 €). */
export function FreeShippingBar() {
  const subtotal = useCart(selectSubtotal);
  const remaining = Math.max(0, FREE_SHIPPING_CENTS - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_CENTS) * 100);
  const unlocked = remaining === 0;

  return (
    <div className="rounded-xl border border-line bg-elevated/50 p-3.5">
      <p className="flex items-center gap-2 text-sm">
        {unlocked ? (
          <>
            <PartyPopper className="size-4 text-it-green" />
            <span className="text-cream">Livraison offerte débloquée !</span>
          </>
        ) : (
          <>
            <Truck className="size-4 text-gold" />
            <span className="text-muted">
              Plus que{" "}
              <span className="font-semibold text-cream">{formatPrice(remaining)}</span> pour la
              livraison offerte
            </span>
          </>
        )}
      </p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-line-strong">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold-bright"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
