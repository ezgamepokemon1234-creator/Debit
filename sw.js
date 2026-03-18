// ╔══════════════════════════════════════════════════════════╗
// ║  ATA v47 — OIL & GAS FIELD CALCULATOR                   ║
// ║  Service Worker — офлайн режим + кэш                     ║
// ║  Разработал: АНВАРОВ ТИМУР АКРАМОВИЧ                     ║
// ╚══════════════════════════════════════════════════════════╝

const CACHE_NAME = 'ata-v47-cache-v1';

// Файлы для кэширования при установке
const PRECACHE_URLS = [
    './',
    './index.html',
    'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js',
];

// ── INSTALL: кэшируем главный файл ──
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS.map(u => new Request(u, {cache: 'reload'}))))
            .catch(() => caches.open(CACHE_NAME).then(cache => cache.add('./')))
            .then(() => self.skipWaiting())
    );
});

// ── ACTIVATE: удаляем старые кэши ──
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// ── FETCH: стратегия кэширования ──
self.addEventListener('fetch', event => {
    const url = event.request.url;

    // Внешние API — Network first (погода, цены, геолокация)
    const isExternalApi =
        url.includes('open-meteo.com') ||
        url.includes('yahoo.com') ||
        url.includes('currency-api') ||
        url.includes('frankfurter') ||
        url.includes('bigdatacloud') ||
        url.includes('allorigins') ||
        url.includes('corsproxy') ||
        url.includes('codetabs') ||
        url.includes('geocoding-api') ||
        url.includes('nominatim') ||
        url.includes('wa.me');

    if (isExternalApi) {
        // Сеть → если упала → кэш → если нет → пусто
        event.respondWith(
            fetch(event.request)
                .then(res => {
                    if (res.ok) {
                        const clone = res.clone();
                        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    }
                    return res;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Всё остальное — Cache first (сам HTML, jsQR, иконки)
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) return cached;

                return fetch(event.request)
                    .then(res => {
                        if (res.ok && event.request.method === 'GET') {
                            const clone = res.clone();
                            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                        }
                        return res;
                    })
                    .catch(() => {
                        // Полный офлайн — возвращаем страницу из кэша
                        if (event.request.mode === 'navigate') {
                            return caches.match('./') || caches.match('./index.html');
                        }
                    });
            })
    );
});
