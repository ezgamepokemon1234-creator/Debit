// ATA v47 — Service Worker v15 — NO CACHE (debug mode)
const CACHE_VERSION = 'ata-v47-v15';

self.addEventListener('install', e => {
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Всегда загружать с сети, не кэшировать
self.addEventListener('fetch', e => {
    e.respondWith(
        fetch(e.request, { cache: 'no-cache' }).catch(() =>
            caches.match(e.request)
        )
    );
});
