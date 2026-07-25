import type { Metadata } from "next";
import { Truck, RotateCcw, Clock, Globe } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { faqJsonLd, jsonLdScript } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";
import {
  FREE_SHIPPING_CENTS,
  SHIPPING_CENTS,
  RETURN_WINDOW_DAYS,
} from "@/lib/config";

export const metadata: Metadata = {
  title: "Livraison & retours",
  description: `Livraison 24-48 h en France et en Europe, offerte dès ${formatPrice(
    FREE_SHIPPING_CENTS,
  )}. Retour et remboursement sous ${RETURN_WINDOW_DAYS} jours.`,
  alternates: { canonical: "/livraison" },
};

const blocks = [
  {
    icon: Clock,
    title: "Délais",
    text: "Préparation sous 24 h ouvrées. Livraison estimée entre 24 et 48 h après expédition.",
  },
  {
    icon: Globe,
    title: "Zones livrées",
    text: "France métropolitaine, Belgique, Luxembourg, Suisse, Allemagne, Espagne, Italie, Pays-Bas et Portugal.",
  },
  {
    icon: Truck,
    title: "Frais de port",
    text: `${formatPrice(SHIPPING_CENTS)} en livraison standard, offerts dès ${formatPrice(FREE_SHIPPING_CENTS)} d'achat.`,
  },
  {
    icon: RotateCcw,
    title: "Retours",
    text: `${RETURN_WINDOW_DAYS} jours pour changer d'avis, sans justification. Produit non utilisé, retour à notre charge.`,
  },
];

/**
 * Ces questions/réponses alimentent aussi le bloc FAQ enrichi de Google :
 * elles occupent davantage de place dans les résultats et répondent aux
 * objections avant même le clic.
 */
const faq = [
  {
    question: "Quel est le délai de livraison ?",
    answer:
      "Votre commande est préparée sous 24 h ouvrées, puis livrée en 24 à 48 h en France comme en Europe.",
  },
  {
    question: "La livraison est-elle offerte ?",
    answer: `Oui, dès ${formatPrice(FREE_SHIPPING_CENTS)} d'achat. En dessous de ce montant, la livraison standard coûte ${formatPrice(SHIPPING_CENTS)}.`,
  },
  {
    question: "Comment suivre ma commande ?",
    answer:
      "Un numéro de suivi vous est envoyé par email dès la confirmation du paiement. Saisissez-le sur la page Suivi avec l'email de commande.",
  },
  {
    question: "Puis-je retourner un article ?",
    answer: `Oui. Vous disposez de ${RETURN_WINDOW_DAYS} jours après réception pour nous le retourner, sans avoir à vous justifier. Les frais de retour sont à notre charge et le remboursement intervient sous 14 jours.`,
  },
  {
    question: "Le paiement est-il sécurisé ?",
    answer:
      "Le paiement est intégralement traité par Stripe. Nous ne voyons ni ne stockons aucune donnée bancaire. Carte, Apple Pay et Google Pay sont acceptés.",
  },
];

export default function LivraisonPage() {
  return (
    <div className="shell pt-32 pb-10 md:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd(faq)) }}
      />

      <Reveal>
        <span className="gold-rule" />
        <h1 className="display mt-3 text-4xl md:text-5xl">Livraison & retours</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Une commande doit arriver vite, et repartir aussi facilement si elle ne
          convient pas. Voici nos conditions, sans petits caractères.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {blocks.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 0.06}>
            <div className="card h-full p-7">
              <span className="grid size-11 place-items-center rounded-full border border-line text-gold">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <section className="mt-20 border-t border-line pt-14">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Questions fréquentes</p>
          <h2 className="display mt-4 text-2xl md:text-4xl">Tout savoir avant de commander</h2>
        </Reveal>

        <div className="mt-8 divide-y divide-line border-y border-line">
          {faq.map((item, i) => (
            <Reveal key={item.question} delay={i * 0.04}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-base font-semibold marker:content-none sm:text-lg">
                  {item.question}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-gold transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                  {item.answer}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
