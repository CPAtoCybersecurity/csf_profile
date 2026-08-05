/* eslint-disable no-restricted-globals */
/*
 * Offline-first service worker for the CSF Profile Assessment PWA.
 *
 * Strategy, by request class (same-origin GET only — everything else,
 * including POSTs and /api/, passes through untouched):
 *  - Navigations: network-first with the cached app shell as offline
 *    fallback, so a deploy is picked up on the next online visit and the
 *    app still opens with no connection.
 *  - /static/ build output: cache-first. These files are content-hashed,
 *    so a cached copy is never stale.
 *  - Everything else (the CSV datasets, icons, manifest): stale-while-
 *    revalidate. Served from cache for speed and offline, refreshed in
 *    the background so installed users keep receiving dataset updates.
 *
 * The build script appends a fingerprint comment to this file so its
 * bytes change whenever the bundle changes; the browser's byte-diff
 * update check then re-installs the worker and re-runs the precache.
 */

const CACHE_NAME = 'csf-profile-v1';
const APP_SHELL = [
  '.',
  'index.html',
  'manifest.json',
  'logo192.png',
  'logo512.png',
  'tblProfile_Demo.csv',
  'Confluence-Requirements.csv',
  'scoring_legend.csv'
];

/*
 * Chrome refuses to serve a redirected response for a navigation, and
 * static hosts commonly redirect /index.html -> /. Re-wrap before caching
 * so the offline shell is always servable.
 */
async function withoutRedirect(response) {
  if (!response.redirected) return response;
  const body = await response.blob();
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}

function isHtml(response) {
  return (response.headers.get('content-type') || '').includes('text/html');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        APP_SHELL.map(async (url) => {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`precache failed: ${url} ${response.status}`);
          await cache.put(url, await withoutRedirect(response));
        })
      );
      // Precache the content-hashed build assets listed in the CRA
      // asset manifest; tolerate its absence (e.g. `npm start` dev server).
      try {
        const response = await fetch('asset-manifest.json');
        if (response.ok) {
          const manifest = await response.json();
          const files = Object.values(manifest.files || {}).filter((path) =>
            /\.(js|css)$/.test(path)
          );
          await cache.addAll(files);
        }
      } catch (err) {
        // Offline or missing manifest — runtime caching will fill the gap.
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Live server state (AI backend status) must never be cached or intercepted.
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(
              (async () => {
                const cache = await caches.open(CACHE_NAME);
                await cache.put('index.html', await withoutRedirect(copy));
              })().catch(() => {})
            );
          }
          return response;
        } catch (err) {
          const cached = await caches.match('index.html');
          if (cached) return cached;
          throw err;
        }
      })()
    );
    return;
  }

  if (url.pathname.includes('/static/')) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {})
          );
        }
        return response;
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      const refresh = (async () => {
        const response = await fetch(request);
        // An SPA-fallback HTML page for a non-navigation URL is junk
        // (e.g. a 200-with-index.html for a missing path) — never cache it.
        if (response.ok && response.type === 'basic' && !isHtml(response)) {
          const copy = response.clone();
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, await withoutRedirect(copy));
        }
        return response;
      })();
      if (cached) {
        event.waitUntil(refresh.catch(() => {}));
        return cached;
      }
      return refresh;
    })()
  );
});
