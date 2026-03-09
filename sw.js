const CACHE = 'debit-v2';
const FILES = [
  './',
  './index.html',
  './pwa-calculator.html',
  './manifest.json',
  './icon_1024x1024.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
