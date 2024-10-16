// sw.js

const CACHE_NAME = 'whatsgo-cache-v1';
const urlsToCache = [
    'index.html',
    'manifest.json',
    'styles.css',
    'icon-192x192.png',
    'icon-512x512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto e recursos armazenados.');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
