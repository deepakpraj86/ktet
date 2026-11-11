import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const source = readFileSync(fileURLToPath(new URL('../sw.js', import.meta.url)), 'utf8');
const ORIGIN = 'http://site.test';

// Runs sw.js against in-memory fakes of caches/fetch so its behaviour can be tested without a browser.
function boot({ network }) {
  const listeners = {};
  const store = new Map(); // cacheName -> Map(url -> response)
  const key = (req, ignoreSearch) => {
    const u = new URL(typeof req === 'string' ? req : req.url, ORIGIN);
    return ignoreSearch ? u.origin + u.pathname : u.href;
  };
  const makeCache = (name) => {
    const m = store.get(name);
    return {
      addAll: async (urls) => { for (const u of urls) m.set(key(u, true), await network(u)); },
      match: async (req, opts = {}) => {
        const k = key(req, opts.ignoreSearch);
        for (const [mk, v] of m) if ((opts.ignoreSearch ? mk : mk) === k) return v;
        return undefined;
      },
      put: async (req, res) => { m.set(key(req, true), res); }
    };
  };
  const caches = {
    open: async (name) => { if (!store.has(name)) store.set(name, new Map()); return makeCache(name); },
    keys: async () => [...store.keys()],
    delete: async (name) => store.delete(name)
  };
  const self = {
    location: { origin: ORIGIN },
    addEventListener: (type, fn) => { listeners[type] = fn; },
    skipWaiting: async () => {},
    clients: { claim: async () => {} }
  };
  const fetchFn = (req) => network(typeof req === 'string' ? req : req.url);
  vm.runInNewContext(source, { self, caches, fetch: fetchFn, URL, Promise });
  const run = async (type, event) => {
    let pending;
    listeners[type]({ ...event, waitUntil: (p) => { pending = p; }, respondWith: (p) => { pending = p; } });
    return pending;
  };
  return { store, run, caches };
}

const res = (body) => ({ ok: true, body, clone() { return this; } });

test('install precaches every asset into the versioned cache', async () => {
  const sw = boot({ network: async (u) => res(`v1:${u}`) });
  await sw.run('install', {});
  const names = [...sw.store.keys()];
  assert.equal(names.length, 1);
  assert.match(names[0], /^ktet-v\d+$/);
  assert.ok(sw.store.get(names[0]).size > 10);
});

test('activate deletes old caches and keeps the current one', async () => {
  const sw = boot({ network: async (u) => res(u) });
  await sw.run('install', {});
  const current = [...sw.store.keys()][0];
  sw.store.set('ktet-v0', new Map());
  sw.store.set('something-else', new Map());
  await sw.run('activate', {});
  assert.deepEqual([...sw.store.keys()], [current]);
});

test('a cached file is served immediately and refreshed so the next visit sees the redeploy', async () => {
  let version = 'old';
  const sw = boot({ network: async (u) => res(`${version}:${u}`) });
  await sw.run('install', {});
  version = 'new';
  const first = await sw.run('fetch', { request: { method: 'GET', url: `${ORIGIN}/data/test1.json` } });
  assert.equal(first.body, 'old:data/test1.json');
  await new Promise((r) => setTimeout(r, 0)); // let the background refresh finish
  const second = await sw.run('fetch', { request: { method: 'GET', url: `${ORIGIN}/data/test1.json` } });
  assert.equal(second.body, `new:${ORIGIN}/data/test1.json`);
});

test('offline: a cached page still loads when the network fails, even with a query string', async () => {
  let online = true;
  const sw = boot({ network: async (u) => { if (!online) throw new Error('offline'); return res(`page:${u}`); } });
  await sw.run('install', {});
  online = false;
  const out = await sw.run('fetch', { request: { method: 'GET', url: `${ORIGIN}/test.html?id=3` } });
  assert.equal(out.body, 'page:test.html');
});

test('non-GET and cross-origin requests are left alone', async () => {
  const sw = boot({ network: async (u) => res(u) });
  await sw.run('install', {});
  const post = await sw.run('fetch', { request: { method: 'POST', url: `${ORIGIN}/index.html` } });
  const foreign = await sw.run('fetch', { request: { method: 'GET', url: 'http://other.test/x.js' } });
  assert.equal(post, undefined);
  assert.equal(foreign, undefined);
});
