import type { Metadata } from "next";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import {
  BRAND_NAME,
  FREE_SHIPPING_CENTS,
  SHIPPING_CENTS,
  RETURN_WINDOW_DAYS,
} from "@/lib/config";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: `Conditions générales de vente de ${BRAND_NAME} : commande, prix, livraison, droit de rétractation et garanties légales.`,
  alternates: { canonical: "/cgv" },
};

/**
 * Conditions générales de vente.
 *
 * Obligatoires pour toute vente en ligne à des particuliers en France, et
 * réclamées par Stripe comme par Google Merchant Center lors de la validation
 * d'un compte marchand. Les montants et délais sont lus dans la configuration
 * de la boutique : impossible qu'ils contredisent ce qui est affiché en caisse.
 *
 * Seule l'identité de l'entreprise reste à compléter — elle ne peut pas être
 * déduite du code (voir aussi `app/mentions-legales/page.tsx`).
 */
const sections: { h: string; p: string[] }[] = [
  {
    h: "1. Objet et identité du vendeur",
    p: [
      `Les présentes conditions régissent les ventes conclues sur ${BRAND_NAME}. ` +
        "Toute commande implique leur acceptation sans réserve.",
      "Raison sociale, forme juridique, capital, SIRET, numéro de TVA intracommunautaire et adresse du siège : à compléter avant la mise en ligne.",
    ],
  },
  {
    h: "2. Produits",
    p: [
      "Les produits proposés sont neufs et décrits avec la plus grande exactitude possible. Les photographies sont contractuelles quant à la nature du produit, mais des différences mineures de teinte ou de finition peuvent subsister.",
      "Une offre n'est valable que dans la limite des stocks disponibles. Si un produit devient indisponible après la commande, vous en êtes informé et intégralement remboursé.",
    ],
  },
  {
    h: "3. Prix",
    p: [
      "Les prix sont indiqués en euros, toutes taxes comprises, hors frais de livraison. Le montant total dû, frais de port inclus, est affiché avant la validation définitive de la commande.",
      `Les frais de livraison standard s'élèvent à ${formatPrice(SHIPPING_CENTS)} et sont offerts à partir de ${formatPrice(FREE_SHIPPING_CENTS)} d'achat.`,
      "Nous nous réservons le droit de modifier nos prix à tout moment ; les produits sont facturés au tarif en vigueur au moment de la commande.",
    ],
  },
  {
    h: "4. Commande",
    p: [
      "La vente est conclue lorsque le paiement est accepté. Un email de confirmation reprenant le détail de la commande vous est alors adressé.",
      "Nous pouvons refuser ou annuler une commande en cas de litige de paiement antérieur, de commande manifestement anormale ou de soupçon de fraude.",
    ],
  },
  {
    h: "5. Paiement",
    p: [
      "Le paiement s'effectue en ligne par carte bancaire, Apple Pay ou Google Pay. Les transactions sont traitées par Stripe Payments Europe Ltd.",
      "Aucune donnée bancaire ne transite par nos serveurs ni n'y est conservée.",
    ],
  },
  {
    h: "6. Livraison",
    p: [
      "Les commandes sont préparées sous 24 heures ouvrées, puis livrées sous 24 à 48 heures en France métropolitaine et en Europe continentale, aux adresses des pays desservis indiqués lors du paiement.",
      "En cas de retard de livraison, contactez-nous : nous relançons le transporteur et, à défaut de livraison dans un délai raisonnable, vous remboursons.",
      "Les risques sont transférés à la réception du colis. Signalez toute avarie visible au transporteur au moment de la livraison, puis prévenez-nous.",
    ],
  },
  {
    h: "7. Droit de rétractation",
    p: [
      `Conformément aux articles L221-18 et suivants du code de la consommation, vous disposez de ${RETURN_WINDOW_DAYS} jours à compter de la réception pour vous rétracter, sans avoir à vous justifier.`,
      "Il vous suffit de nous en informer depuis la page Contact. Le produit doit être renvoyé complet et dans un état permettant sa revente. Les frais de retour sont à notre charge.",
      "Le remboursement intervient au plus tard 14 jours après la reprise du produit, par le même moyen de paiement que celui utilisé lors de la commande.",
    ],
  },
  {
    h: "8. Garanties légales",
    p: [
      "Tous les produits bénéficient de la garantie légale de conformité (articles L217-3 et suivants du code de la consommation) pendant 2 ans, ainsi que de la garantie contre les vices cachés (articles 1641 et suivants du code civil).",
      "Ces garanties s'appliquent indépendamment de toute garantie commerciale et sans frais pour vous.",
    ],
  },
  {
    h: "9. Données personnelles",
    p: [
      "Les données collectées servent exclusivement au traitement des commandes et à la relation client. Le détail des traitements et l'exercice de vos droits figurent dans les mentions légales.",
    ],
  },
  {
    h: "10. Litiges",
    p: [
      "Ces conditions sont soumises au droit français. En cas de différend, une solution amiable sera recherchée en priorité.",
      "Conformément à l'article L612-1 du code de la consommation, vous pouvez recourir gratuitement à un médiateur de la consommation, ou saisir la plateforme européenne de règlement en ligne des litiges.",
    ],
  },
];

export default function CGVPage() {
  return (
    <div className="shell max-w-3xl pt-32 pb-10 md:pt-40">
      <span className="gold-rule" />
      <h1 className="display mt-3 text-4xl md:text-5xl">
        Conditions générales de vente
      </h1>
      <p className="mt-4 text-muted">
        Les règles qui encadrent chaque commande passée sur {BRAND_NAME}. Pour
        le détail des délais et des retours, voir aussi{" "}
        <Link href="/livraison" className="link-underline text-cream">
          Livraison &amp; retours
        </Link>
        .
      </p>

      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-xl font-semibold text-gold-bright">
              {s.h}
            </h2>
            {s.p.map((paragraph) => (
              <p key={paragraph} className="mt-2 leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
