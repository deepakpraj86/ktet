// Offline support. Bump the number in CACHE when you change this file's ASSETS list;
// every other cache is deleted on activate. Cached files are also refreshed in the
// background on each visit, so a redeploy reaches returning users on their next load.
const CACHE = 'ktet-v1';
const ASSETS = [
  './',
  'index.html',
  'test.html',
  'result.html',
  'css/app.css',
  'js/data.js',
  'js/dom.js',
  'js/home.js',
  'js/quiz.js',
  'js/result.js',
  'js/runner.js',
  'js/scoring.js',
  'js/store.js',
  'js/sw-register.js',
  'js/timer.js',
  'data/blueprint.json',
  'data/test1.json',
  'data/test2.json',
  'data/test3.json',
  'data/test4.json',
  'data/test5.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      const refresh = fetch(request).then((response) => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      }).catch(() => cached);
      return cached || refresh;
    })
  );
});
