import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const sw = readFileSync(join(root, 'sw.js'), 'utf8');
const assets = [...sw.match(/ASSETS\s*=\s*\[([\s\S]*?)\]/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
const filesIn = (dir) => readdirSync(join(root, dir)).map((f) => `${dir}/${f}`);

test('every html, css, js and data file is in the precache list', () => {
  const real = ['index.html', 'test.html', 'result.html', ...filesIn('css'), ...filesIn('js'), ...filesIn('data')];
  for (const f of real) assert.ok(assets.includes(f), `${f} missing from ASSETS`);
});

test('the five test files and the blueprint are precached even before they exist', () => {
  for (const f of ['data/blueprint.json', ...[1, 2, 3, 4, 5].map((n) => `data/test${n}.json`)]) {
    assert.ok(assets.includes(f), `${f} missing from ASSETS`);
  }
});

test('the cache is versioned and the activate handler deletes every other cache', () => {
  assert.match(sw, /const CACHE = 'ktet-v\d+'/);
  assert.match(sw, /addEventListener\('activate'/);
  assert.match(sw, /caches\.keys\(\)/);
  assert.match(sw, /key !== CACHE/);
  assert.match(sw, /caches\.delete\(/);
});

test('cached files are refreshed in the background so a redeploy reaches returning users', () => {
  assert.match(sw, /addEventListener\('fetch'/);
  assert.match(sw, /cache\.put\(/);
});

test('every page registers the service worker', () => {
  for (const page of ['index.html', 'test.html', 'result.html']) {
    assert.match(readFileSync(join(root, page), 'utf8'), /js\/sw-register\.js/, page);
  }
});
