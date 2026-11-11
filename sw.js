// Offline support. Bump the number in CACHE when you change this file's ASSETS list;
// every other cache is deleted on activate. Cached files are served immediately and refreshed
// in the background (bypassing the HTTP cache), so a redeploy reaches returning users on the
// visit after next. Entries are keyed by URL without the query string, so test.html?id=3 and
// test.html share one entry and both get refreshed.
const CACHE = 'ktet-v2';
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
  'js/share.js',
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
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' })))).then(() => self.skipWaiting()));
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
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  url.search = '';
  const key = url.href;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(key);
      const refresh = fetch(request, { cache: 'no-cache' }).then((response) => {
        if (response.ok) cache.put(key, response.clone());
        return response;
      }).catch(() => cached);
      return cached || refresh;
    })
  );
});
