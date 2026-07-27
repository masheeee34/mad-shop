/**
 * Service Worker neutralisé (auto-désinscription).
 *
 * L'ancien Service Worker mettait des pages en cache et interceptait les
 * navigations. Après chaque redéploiement, il servait des pages périmées qui
 * référençaient des fichiers JS disparus, provoquant les écrans
 * « This page couldn't load » (Chrome) et « Une petite interruption »
 * (error boundary de l'app), ainsi que des retours arrière cassés.
 *
 * Ce fichier ne met plus rien en cache et n'intercepte plus aucune requête :
 * il se contente de purger les anciens caches et de se désinscrire. Les
 * navigateurs qui l'avaient encore actif se nettoient donc tout seuls au
 * prochain chargement. Le site fonctionne parfaitement sans Service Worker,
 * servi par le CDN.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Purge tout ce que les anciennes versions avaient mis en cache.
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));

      // Se désinscrit définitivement.
      await self.registration.unregister();

      // Recharge les onglets ouverts pour repartir sur une base saine.
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })(),
  );
});

// Aucun gestionnaire `fetch` : toutes les requêtes passent directement au
// réseau, comme si aucun Service Worker n'était présent.
