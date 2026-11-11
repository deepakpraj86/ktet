// Shared loading helpers. All paths are relative so the site works under /<repo>/ on GitHub Pages.
import { createStore } from './store.js';

export const TEST_NUMBERS = [1, 2, 3, 4, 5];
export const testId = (n) => `t${n}`;

export function getStore() {
  let storage = null;
  try { storage = window.localStorage; } catch { /* blocked: createStore falls back to memory */ }
  return createStore(storage);
}

export async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  return res.json();
}

export const loadBlueprint = () => fetchJson('data/blueprint.json');
export const loadTest = (n) => fetchJson(`data/test${n}.json`);

export function testNumberFromUrl() {
  const n = Number(new URLSearchParams(location.search).get('id'));
  return Number.isInteger(n) && n >= 1 && n <= TEST_NUMBERS.length ? n : null;
}

export function showFatal(message) {
  const box = document.getElementById('app');
  box.textContent = '';
  const p = document.createElement('p');
  p.className = 'error';
  p.setAttribute('role', 'alert');
  p.textContent = `${message} If you opened this file directly from disk, serve the folder with a local web server instead (see README).`;
  box.append(p);
}

export const pct = (correct, total) => (total ? Math.round((correct / total) * 100) : 0);
