const CACHE_NAME = 'guru-dashboard-v1';

// Install: cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        '/',
        '/index.html',
        '/favicon.png',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
      ])
    )
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first strategy
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (!url.startsWith('http')) return;

  // Skip Vite dev server requests (HMR, source files) — they must not be cached
  if (
    url.includes('/@vite') ||
    url.includes('/@fs') ||
    url.includes('node_modules') ||
    url.includes('.tsx') ||
    url.includes('.ts?') ||
    url.includes('.jsx') ||
    url.includes('?t=') ||
    url.includes('__vite')
  ) {
    return;
  }

  // Only cache navigation and static asset requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache valid responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
