"use client";

import { useEffect } from "react";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useCart, selectTotal } from "@/lib/store/cart";
import { trackPurchase } from "@/lib/analytics";
import { ButtonLink } from "@/components/ui/button";

export default function SuccessPage() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    // Suivi conversion (valeur estimée depuis le panier) puis vidage.
    const total = selectTotal(useCart.getState());
    if (total > 0) trackPurchase(total);
    clear();
  }, [clear]);

  return (
    <div className="shell grid min-h-[70vh] place-items-center pt-32 pb-16 text-center">
      <div className="flex max-w-lg flex-col items-center">
        <motion.span
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="grid size-20 place-items-center rounded-full bg-it-green/15 text-it-green"
        >
          <CheckCircle2 className="size-10" />
        </motion.span>
        <h1 className="display mt-8 text-4xl md:text-5xl">Merci pour votre commande !</h1>
        <p className="mt-4 text-muted">
          Votre paiement a bien été accepté. Un email de confirmation vient de
          vous être envoyé. Votre commande est en préparation et sera expédiée
          sous 24-48h.
        </p>
        <span className="tricolore my-8 block w-40" aria-hidden />
        <div className="flex flex-wrap justify-center gap-4">
          <ButtonLink href="/boutique" size="lg">
            Continuer mes achats <ArrowRight className="size-4" />
          </ButtonLink>
          <ButtonLink href="/" variant="outline" size="lg">
            <Package className="size-4" /> Retour à l'accueil
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
