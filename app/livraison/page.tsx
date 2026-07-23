import type { Metadata } from "next";
import { Truck, RotateCcw, Clock, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Livraison & retours",
  description:
    "Livraison 24-48h en France et en Europe, offerte dès 60 €. Retours et remboursement sous 14 jours.",
};

const blocks = [
  { icon: Clock, title: "Délais", text: "Préparation sous 24h, livraison estimée en 24 à 48h ouvrées après expédition." },
  { icon: Globe, title: "Zones", text: "France métropolitaine et Europe (Belgique, Suisse, Allemagne, Espagne, Italie, Pays-Bas, Portugal…)." },
  { icon: Truck, title: "Frais", text: "4,90 € en livraison standard. Offerte dès 60 € d'achat." },
  { icon: RotateCcw, title: "Retours", text: "Satisfait ou remboursé : 14 jours pour changer d'avis, produit non utilisé." },
];

export default function LivraisonPage() {
  return (
    <div className="shell pt-32 pb-10 md:pt-40">
      <span className="gold-rule" />
      <h1 className="display mt-3 text-4xl md:text-5xl">Livraison & retours</h1>
      <p className="mt-4 max-w-2xl text-muted">
        On veut que votre commande arrive vite et bien. Voici tout ce qu'il faut
        savoir avant de commander.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {blocks.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-7">
            <span className="grid size-11 place-items-center rounded-full border border-line text-gold">
              <Icon className="size-5" />
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
