const CACHE_VERSION = 5;
const CACHE_NAME = `lucy-vocab-v${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './',
  'index.html',
  'manifest.json',
  'css/base.css',
  'css/themes.css',
  'css/home.css',
  'css/grid.css',
  'css/progress.css',
  'css/practice.css',
  'css/overlays.css',
  'js/app.js',
  'js/state.js',
  'js/mastery.js',
  'js/audio.js',
  'js/session.js',
  'js/engagement.js',
  'js/animations.js',
  'js/data/words.js',
  'js/data/sentences.js',
  'js/data/badges.js',
  'js/data/themes.js',
  'js/modes/mode-registry.js',
  'js/modes/flashcard.js',
  'js/modes/match.js',
  'js/modes/context.js',
  'js/modes/pairs.js',
  'js/modes/writing.js',
  'js/ui/home.js',
  'js/ui/grid.js',
  'js/ui/progress.js',
  'js/ui/nav.js',
  'js/ui/overlays.js',
  'assets/sadie.js',
  'assets/apple-touch-icon.png',
  'assets/favicon.png',
  'assets/icon-1024.png'
];

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
