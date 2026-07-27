import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales et conditions de MAD Shop.",
};

const sections = [
  {
    h: "Éditeur du site",
    p: "MAD Shop — boutique en ligne. Coordonnées complètes à compléter (raison sociale, SIRET, adresse, directeur de publication).",
  },
  {
    h: "Hébergement",
    p: "Site hébergé par Hostinger International Ltd. Coordonnées de l'hébergeur à compléter.",
  },
  {
    h: "Données personnelles",
    p: "Les informations collectées lors d'une commande ou d'un contact servent uniquement au traitement de votre demande. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression en écrivant à contact@madshop.fr.",
  },
  {
    h: "Cookies et mesure d'audience",
    p: "Seuls les cookies nécessaires au fonctionnement du site (panier, session) sont déposés d'office. Les cookies de mesure d'audience et de publicité ne le sont qu'après acceptation via le bandeau affiché à votre première visite. Un refus n'empêche ni la navigation ni la commande, et votre choix est conservé 13 mois avant de vous être redemandé. Vous pouvez le modifier à tout moment en effaçant les données du site dans votre navigateur.",
  },
  {
    h: "Paiement",
    p: "Les paiements sont traités de manière sécurisée par Stripe. MAD Shop ne stocke aucune donnée bancaire.",
  },
  {
    h: "Propriété intellectuelle",
    p: "L'ensemble des éléments du site (textes, visuels, logo) est protégé. Toute reproduction sans autorisation est interdite.",
  },
];

export default function MentionsPage() {
  return (
    <div className="shell max-w-3xl pt-32 pb-10 md:pt-40">
      <span className="gold-rule" />
      <h1 className="display mt-3 text-4xl md:text-5xl">Mentions légales</h1>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-xl font-semibold text-gold-bright">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-muted">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
