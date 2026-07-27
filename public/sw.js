/**
 * Service Worker MAD Shop
 * Stratégie : cache-first pour les assets statiques,
 * network-first pour les pages et l'API.
 * Offre une expérience offline de base.
 */

const CACHE_NAME = "mad-shop-v5";
const STATIC_ASSETS = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Installation : on pré-cache uniquement les assets statiques stricts (PAS de pages HTML)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

// Activation : purge TOTALE de tous les anciens caches de pages qui provoquaient le plantage de redirection
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((k) => caches.delete(k))
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch : stratégie hybride
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore les requêtes non-GET, cross-origin et les assets de build Next.js (_next/)
  // Laisser Next.js gérer ses propres hashes de build sans interférence du Service Worker
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/_next/")
  ) {
    return;
  }

  // Network-first pour l'API
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({ error: "offline" }), {
        headers: { "Content-Type": "application/json" },
      })),
    );
    return;
  }

  // IMPORTANT : on n'intercepte JAMAIS les navigations de pages.
  //
  // Laisser le navigateur les gérer nativement :
  //  - préserve le bfcache (retour/avant instantané) ;
  //  - évite l'erreur « This page couldn't load » : le site redirige
  //    madshop.fr → www.madshop.fr, et une réponse « redirigée » renvoyée par
  //    le Service Worker est refusée par Chrome pour une navigation.
  // (On abandonne le repli hors-ligne pour les pages : le prix à payer était
  //  un plantage du retour arrière pour tout visiteur ayant le SW actif.)
});

/* ============================================================
   Notifications push
   ============================================================ */

/**
 * Le serveur envoie un push sans contenu : il ne transporte aucune donnée
 * personnelle et n'impose aucun chiffrement de charge utile. Le texte est
 * récupéré ici, à partir de l'empreinte de notre propre endpoint.
 */
const FALLBACK_NOTIFICATION = {
  title: "MAD Shop",
  body: "Vous avez une nouvelle information sur votre commande.",
  url: "/compte",
};

async function endpointFingerprint(endpoint) {
  const bytes = new TextEncoder().encode(endpoint);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

async function resolveNotification() {
  try {
    const subscription = await self.registration.pushManager.getSubscription();
    if (!subscription) return FALLBACK_NOTIFICATION;

    const id = await endpointFingerprint(subscription.endpoint);
    const res = await fetch(`/api/push/message?id=${id}`, { cache: "no-store" });
    if (!res.ok) return FALLBACK_NOTIFICATION;

    const data = await res.json();
    if (!data || !data.found || !data.title) return FALLBACK_NOTIFICATION;

    return {
      title: data.title,
      body: data.body || FALLBACK_NOTIFICATION.body,
      url: data.url || FALLBACK_NOTIFICATION.url,
    };
  } catch (e) {
    return FALLBACK_NOTIFICATION;
  }
}

self.addEventListener("push", (event) => {
  // Une notification doit être affichée dans tous les cas : à défaut, le
  // navigateur en affiche une générique du type « ce site s'est exécuté en
  // arrière-plan », bien pire que la nôtre.
  event.waitUntil(
    resolveNotification().then((n) =>
      self.registration.showNotification(n.title, {
        body: n.body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        data: { url: n.url },
        tag: "mad-shop",
        renotify: true,
      }),
    ),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";

  // Réutilise un onglet déjà ouvert sur la boutique plutôt que d'en empiler
  // un nouveau à chaque notification.
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (new URL(client.url).origin === self.location.origin && "focus" in client) {
            return client.navigate(target).then((c) => (c || client).focus());
          }
        }
        return self.clients.openWindow(target);
      }),
  );
});
