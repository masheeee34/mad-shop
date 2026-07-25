"use client";

/**
 * Gestion du consentement (RGPD / ePrivacy).
 *
 * Aucun cookie publicitaire n'est déposé avant un choix explicite du visiteur.
 * Le choix est relayé au Consent Mode v2 de Google — obligatoire depuis mars
 * 2024 pour continuer à mesurer les conversions Google Ads dans l'EEE — ainsi
 * qu'au mode de consentement limité de Meta.
 */

export type ConsentChoice = "granted" | "denied";

export const CONSENT_KEY = "mad-consent";

/** Durée de validité d'un choix avant nouvelle demande (13 mois, CNIL). */
const CONSENT_TTL_MS = 13 * 30 * 24 * 60 * 60 * 1000;

type StoredConsent = { choice: ConsentChoice; at: number };

export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredConsent;
    if (stored.choice !== "granted" && stored.choice !== "denied") return null;
    if (Date.now() - stored.at > CONSENT_TTL_MS) return null;
    return stored.choice;
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredConsent = { choice, at: Date.now() };
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
  } catch {
    /* stockage indisponible (navigation privée) : le choix vaut pour la session */
  }
  applyConsent(choice);
}

/** Propage le choix aux différentes régies. */
function applyConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;

  window.gtag?.("consent", "update", {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  });

  // Meta : `revoke` bascule le pixel en mode consentement limité.
  window.fbq?.("consent", choice === "granted" ? "grant" : "revoke");
}
