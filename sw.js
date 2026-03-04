const CACHE_VERSION = 'v7';
const CACHE_NAME = 'lucy-vocab-' + CACHE_VERSION;

const ASSETS = [
  './',
  './index.html',
  './index-v2.html',
  './apple-touch-icon.png',
  './favicon.png',
  './manifest.json'
];

// Install: cache assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
  // Notify all open tabs to reload
  self.clients.matchAll().then(clients => {
    clients.forEach(client => client.postMessage({ type: 'UPDATE_AVAILABLE' }));
  });
});

// Fetch: network-first, fall back to cache
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Cache the fresh response
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
