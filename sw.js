const CACHE_NAME = 'snail-game-v5';
const ASSETS = ['./snail-game.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Don't cache Firebase or external requests
  if (url.hostname.includes('firebase') || url.hostname.includes('gstatic')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Network first — always try to get fresh version, fall back to cache
  e.respondWith(
    fetch(e.request).then(response => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      return response;
    }).catch(() => caches.match(e.request))
  );
});
