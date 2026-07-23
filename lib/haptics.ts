/**
 * Haptic feedback via Vibration API.
 * Fonctionne sur Android Chrome et certains navigateurs mobiles.
 * Silencieux sur iOS Safari (API non supportée) ou desktop.
 */

/** Tap léger — sélection d'un élément, hover actif */
export function hapticLight() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(8);
    } catch {
      // Ignoré silencieusement
    }
  }
}

/** Succès — ajout au panier, confirmation */
export function hapticSuccess() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([12, 30, 12]);
    } catch {
      // Ignoré silencieusement
    }
  }
}

/** Erreur — action invalide */
export function hapticError() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([30, 40, 30, 40, 30]);
    } catch {
      // Ignoré silencieusement
    }
  }
}

/** Pattern personnalisé */
export function haptic(pattern: number | number[] = 10) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignoré silencieusement
    }
  }
}
