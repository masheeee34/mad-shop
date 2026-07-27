/**
 * Transporteurs et liens de suivi.
 *
 * Un numéro de colis sans lien cliquable ne sert à personne : le client
 * devrait retrouver seul le bon site, puis y recopier son numéro. Chaque
 * transporteur expose une URL de suivi directe — c'est elle qui transforme le
 * numéro en un vrai suivi, et qui supprime l'essentiel des « où est ma
 * commande ? » adressés au service client.
 */

export const CARRIERS = {
  colissimo: {
    label: "Colissimo",
    url: (n: string) =>
      `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(n)}`,
  },
  chronopost: {
    label: "Chronopost",
    url: (n: string) =>
      `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${encodeURIComponent(n)}`,
  },
  mondialrelay: {
    label: "Mondial Relay",
    url: (n: string) =>
      `https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=${encodeURIComponent(n)}`,
  },
  dpd: {
    label: "DPD",
    url: (n: string) => `https://www.dpd.fr/trace/${encodeURIComponent(n)}`,
  },
  gls: {
    label: "GLS",
    url: (n: string) =>
      `https://gls-group.com/FR/fr/suivi-colis?match=${encodeURIComponent(n)}`,
  },
  colisprive: {
    label: "Colis Privé",
    url: (n: string) =>
      `https://www.colisprive.fr/moncolis/pages/detailColis.aspx?numColis=${encodeURIComponent(n)}`,
  },
  ups: {
    label: "UPS",
    url: (n: string) =>
      `https://www.ups.com/track?loc=fr_FR&tracknum=${encodeURIComponent(n)}`,
  },
  dhl: {
    label: "DHL",
    url: (n: string) =>
      `https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=${encodeURIComponent(n)}`,
  },
  /** Transporteur sans page de suivi publique : le numéro reste affiché. */
  autre: { label: "Autre transporteur", url: () => null },
} as const;

export type CarrierId = keyof typeof CARRIERS;

export const CARRIER_IDS = Object.keys(CARRIERS) as CarrierId[];

export function isCarrierId(value: string): value is CarrierId {
  return value in CARRIERS;
}

export function carrierLabel(id?: string): string | null {
  return id && isCarrierId(id) ? CARRIERS[id].label : null;
}

/** URL de suivi chez le transporteur, ou `null` s'il n'en propose pas. */
export function trackingUrl(id?: string, number?: string): string | null {
  if (!id || !number || !isCarrierId(id)) return null;

  // « autre » n'attend aucun argument : on ramène les deux formes à une seule
  // signature plutôt que d'appeler une union de fonctions.
  const build = CARRIERS[id].url as (n: string) => string | null;
  return build(number);
}
