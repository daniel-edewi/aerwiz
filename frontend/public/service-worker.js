const CACHE_NAME = 'aerwiz-v1';
const STATIC_ASSETS = [
  '/',
  '/static/js/main.chunk.js',
  '/static/js/vendors.chunk.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/aerwiz-favicon-01.svg',
  '/apple-touch-icon.png',
  '/logo192.png',
  '/logo512.png',
  '/og-image.png'
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })))
        .catch(err => console.log('[SW] Cache addAll error:', err));
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first for API, cache first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API calls — always go to network
  if (url.hostname.includes('api.aerwiz') || url.hostname.includes('railway') || url.hostname.includes('amadeus')) return;

  // Skip chrome-extension and non-http
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    // Network first strategy
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(request).then(cached => {
          if (cached) return cached;
          // For navigation requests, return the app shell
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Push notifications (future use)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Aerwiz', {
      body: data.body || 'You have a new notification',
      icon: '/apple-touch-icon.png',
      badge: '/aerwiz-favicon-01.svg',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
});
