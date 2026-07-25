/**
 * Helpers d'assainissement pour tout contenu fourni par un visiteur et
 * réinjecté ailleurs (emails HTML, en-têtes SMTP, flux XML).
 */

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Échappe une chaîne destinée à un contexte HTML.
 * Indispensable pour les emails : sans cela, un visiteur peut injecter du
 * balisage (liens de phishing, images traçantes) dans les messages reçus.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) => HTML_ENTITIES[c]);
}

/** Échappe puis convertit les sauts de ligne en `<br>` (corps de message). */
export function escapeHtmlMultiline(value: unknown): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

/**
 * Nettoie une valeur destinée à un en-tête d'email (sujet, nom d'expéditeur).
 * Retire les retours chariot, qui permettraient d'injecter des en-têtes
 * supplémentaires (Bcc, Reply-To…).
 */
export function sanitizeHeader(value: unknown, maxLength = 180): string {
  return String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Échappe une chaîne destinée à un document XML (flux produits). */
export function escapeXml(value: unknown): string {
  return escapeHtml(value);
}
