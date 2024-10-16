const CACHE_NAME = 'whatsgo-cache-v1';
const APP_SHELL = [
    '/',
    '/index.html',
    '/manifest.json',
    '/js/app.js',
    '/css/styles.css',
    '/icons/icon-72.png',
    '/icons/icon-96.png',
    '/icons/icon-128.png',
    '/icons/icon-144.png',
    '/icons/icon-152.png',
    '/icons/icon-192.png',
    '/icons/icon-384.png',
    '/icons/icon-512.png'
];

const OFFLINE_URL = '/offline.html';
const MAIN_URL = 'https://www.whatsgo.app.br';

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)),
            // Garantir que o service worker seja ativado imediatamente
            self.skipWaiting()
        ])
    );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // Limpar caches antigos
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))
                );
            }),
            // Garantir que o service worker controle todas as abas imediatamente
            self.clients.claim()
        ])
    );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
    // Estratégia de cache first com fallback para network
    event.respondWith(
        (async () => {
            try {
                // Tentar cache primeiro
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) return cachedResponse;

                // Se não estiver no cache, tentar network
                const networkResponse = await fetch(event.request);
                
                // Salvar no cache se for uma requisição GET bem-sucedida
                if (event.request.method === 'GET' && networkResponse.status === 200) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(event.request, networkResponse.clone());
                }

                return networkResponse;
            } catch (error) {
                // Se offline e for uma requisição de navegação
                if (event.request.mode === 'navigate') {
                    const cache = await caches.open(CACHE_NAME);
                    return cache.match(OFFLINE_URL);
                }
                throw error;
            }
        })()
    );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

// Notificações push
self.addEventListener('push', (event) => {
    if (event.data) {
        const options = {
            body: event.data.text(),
            icon: '/icons/icon-192.png',
            badge: '/icons/badge.png'
        };
        event.waitUntil(
            self.registration.showNotification('WhatsGo', options)
        );
    }
});