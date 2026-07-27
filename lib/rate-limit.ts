import "server-only";

/**
 * Limitation de débit en mémoire (fenêtre glissante par compteur fixe).
 *
 * Le site tourne en process Node unique (`output: "standalone"`), donc un
 * compteur en mémoire suffit et n'ajoute aucune dépendance. Si un jour la
 * boutique passe sur plusieurs instances, remplacer `hits` par Redis :
 * la signature de `rateLimit()` reste identique.
 */

type Bucket = { count: number; resetAt: number };

const hits = new Map<string, Bucket>();

/** Purge périodique pour éviter que la Map ne grossisse indéfiniment. */
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of hits) {
    if (bucket.resetAt <= now) hits.delete(key);
  }
}

/**
 * Adresse IP de l'appelant, derrière le reverse proxy de l'hébergeur.
 * On prend la première entrée de `x-forwarded-for` (le client d'origine).
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export type RateLimitResult = {
  ok: boolean;
  /** Secondes avant de pouvoir réessayer (0 si autorisé). */
  retryAfter: number;
  remaining: number;
};

/**
 * Autorise `limit` requêtes par `windowMs` pour une clé donnée.
 * @param scope identifiant de la route (ex: "login", "contact")
 */
export function rateLimit(
  scope: string,
  identifier: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const key = `${scope}:${identifier}`;
  const bucket = hits.get(key);

  if (!bucket || bucket.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0, remaining: limit - 1 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
      remaining: 0,
    };
  }

  return { ok: true, retryAfter: 0, remaining: limit - bucket.count };
}

/**
 * Raccourci pour les routes API : renvoie une réponse 429 prête à l'emploi,
 * ou `null` si la requête est autorisée.
 *
 * ```ts
 * const limited = enforceRateLimit(req, "contact", 5, 60_000);
 * if (limited) return limited;
 * ```
 */
export function enforceRateLimit(
  req: Request,
  scope: string,
  limit: number,
  windowMs: number,
): Response | null {
  const result = rateLimit(scope, clientIp(req), limit, windowMs);
  if (result.ok) return null;

  return Response.json(
    { error: "Trop de tentatives. Merci de réessayer dans un instant." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter),
        "Cache-Control": "no-store",
      },
    },
  );
}

/** Remet un compteur à zéro (ex: après une authentification réussie). */
export function resetRateLimit(scope: string, identifier: string) {
  hits.delete(`${scope}:${identifier}`);
}
