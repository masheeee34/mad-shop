/**
 * Service Worker MAD Shop
 * Stratégie : cache-first pour les assets statiques,
 * network-first pour les pages et l'API.
 * Offre une expérience offline de base.
 */

const CACHE_NAME = "mad-shop-v1";
const STATIC_ASSETS = [
  "/",
  "/boutique",
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Installation : on pré-cache les assets clés
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

// Activation : on nettoie les anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch : stratégie hybride
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore les requêtes non-GET et cross-origin
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Network-first pour l'API et les routes dynamiques
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({ error: "offline" }), {
        headers: { "Content-Type": "application/json" },
      })),
    );
    return;
  }

  // Stale-while-revalidate pour les assets Next.js (_next/static)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request).then((res) => {
            cache.put(request, res.clone());
            return res;
          });
          return cached || networkFetch;
        }),
      ),
    );
    return;
  }

  // Network-first avec fallback offline pour les pages HTML
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches
          .match("/offline")
          .then((r) => r || caches.match("/")),
      ),
    );
    return;
  }
});
