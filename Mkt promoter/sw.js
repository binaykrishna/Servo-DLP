// BeatLog service worker — caches the app shell so it opens instantly
// and works even with a flaky connection. Visit DATA still needs a
// live connection to sync with the shared Google Sheet.

const CACHE_NAME = 'beatlog-shell-v1';
const SHELL_FILES = [
  './promoter-visit-tracker.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  // Never cache calls to the Google Apps Script backend — always go live.
  if (url.includes('script.google.com')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => cached);
    })
  );
});
