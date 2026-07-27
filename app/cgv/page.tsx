import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
  description: `Conditions générales de vente de ${BRAND_NAME} : commande, prix, livraison, droit de rétractation et garanties légales.`,
  alternates: { canonical: "/cgv" },
};

export default function CGVPage() {
  return (
    <div className="shell py-16 md:py-24 max-w-4xl mx-auto">
      <h1 className="display text-4xl md:text-5xl mb-12">Conditions Générales de Vente (CGV)</h1>

      <div className="prose prose-invert max-w-none prose-h2:font-display prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-muted prose-p:leading-relaxed prose-li:text-muted">
        
        <h2>1. Objet</h2>
        <p>
          Les présentes Conditions Générales de Vente régissent les commandes passées sur le
          site MAD SHOP. Toute commande implique leur acceptation.
        </p>

        <h2>2. Produits</h2>
        <p>
          Les produits sont sélectionnés et testés avant expédition. Les photographies sont les
          plus fidèles possibles mais restent non contractuelles. De légères différences de
          couleur, finition ou emballage ne constituent pas un défaut.
        </p>

        <h2>3. Prix et paiement</h2>
        <p>
          Les prix sont affichés en euros. Le paiement est sécurisé. La commande est validée
          uniquement après confirmation du paiement.
        </p>

        <h2>4. Livraison</h2>
        <p>
          France : 24 à 72 heures ouvrées (hors week-ends et jours fériés). Europe : délais
          variables selon le pays. Monde : expédition vers de nombreuses destinations. Une
          livraison express en main propre en Île-de-France peut être proposée sous 24 h à partir
          de 150 € d'achat, selon disponibilité.
        </p>

        <h2>5. Retards</h2>
        <p>
          Les délais sont indicatifs. MAD SHOP ne peut être tenu responsable des retards
          imputables au transporteur, aux douanes, aux intempéries, aux grèves ou à tout cas
          de force majeure. Ces retards n'ouvrent pas automatiquement droit à un
          remboursement, sous réserve des dispositions légales applicables.
        </p>

        <h2>6. Vérification du colis</h2>
        <p>
          Le client doit vérifier le colis dès sa réception. Toute anomalie (produit endommagé,
          incomplet ou non conforme) doit être signalée dans un délai maximal de 48 heures
          avec des photographies du colis et du produit. Passé ce délai, les réclamations
          pourront être refusées sauf obligation légale contraire.
        </p>

        <h2>7. Retours</h2>
        <p>
          Les produits retournés doivent être complets, propres, correctement protégés,
          accompagnés de leurs accessoires et, lorsque cela est possible, de leur emballage
          d'origine. Les retours incomplets ou dégradés pourront donner lieu à une réduction ou
          à un refus de remboursement dans les limites prévues par la loi.
        </p>

        <h2>8. Remboursement</h2>
        <p>
          Le remboursement est effectué dans un délai maximal de 14 jours après réception et
          contrôle du produit retourné. MAD SHOP peut différer le remboursement jusqu'à la
          réception effective du retour ou d'une preuve d'expédition.
        </p>

        <h2>9. Responsabilité</h2>
        <p>
          MAD SHOP ne saurait être responsable des dommages liés à une mauvaise utilisation,
          à une modification, à un démontage ou à une utilisation non conforme des produits. Le
          client est responsable de l'exactitude de son adresse de livraison.
        </p>

        <h2>10. Colis non réclamés</h2>
        <p>
          Les colis retournés pour adresse erronée, absence ou non-réclamation pourront être
          réexpédiés après règlement des nouveaux frais d'expédition.
        </p>

        <h2>11. Fraude</h2>
        <p>
          Toute tentative de fraude, contestation abusive ou utilisation détournée du service
          pourra entraîner l'annulation de la commande et toute mesure autorisée par la loi.
        </p>

        <h2>12. Données personnelles</h2>
        <p>
          Les données sont utilisées uniquement pour le traitement des commandes et la
          relation client conformément à la réglementation applicable.
        </p>

        <h2>13. Droit applicable</h2>
        <p>
          Les présentes CGV sont régies par le droit français. Une solution amiable sera
          privilégiée avant toute procédure judiciaire.
        </p>
      </div>
    </div>
  );
}
