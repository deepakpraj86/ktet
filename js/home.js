import { h, clear } from './dom.js';
import { getStore, loadBlueprint, TEST_NUMBERS, testId, showFatal } from './data.js';

const store = getStore();
const list = document.getElementById('tests');
const message = document.getElementById('tools-message');

function card(n, blueprint) {
  const id = testId(n);
  const attempts = store.getAttempts(id);
  const last = attempts.at(-1);
  const best = attempts.reduce((m, a) => Math.max(m, a.total), 0);
  const inProgress = store.loadProgress(id) !== null;
  const max = blueprint.parts.reduce((a, p) => a + p.perTest, 0);
  return h('article', { class: 'card' },
    h('h2', {}, `Mock test ${n}`),
    h('p', { class: 'meta' }, `${max} questions · ${blueprint.durationMinutes} minutes`),
    h('dl', { class: 'scores' },
      h('div', {}, h('dt', {}, 'Last'), h('dd', {}, last ? `${last.total}/${last.max}` : '–')),
      h('div', {}, h('dt', {}, 'Best'), h('dd', {}, attempts.length ? `${best}/${max}` : '–')),
      h('div', {}, h('dt', {}, 'Attempts'), h('dd', {}, attempts.length))),
    h('div', { class: 'actions' },
      h('a', { class: 'button primary', href: `test.html?id=${n}` }, inProgress ? 'Resume' : 'Start'),
      last && h('a', { class: 'button', href: `result.html?id=${n}` }, 'Last result')));
}

async function render() {
  try {
    const blueprint = await loadBlueprint();
    clear(list).append(...TEST_NUMBERS.map((n) => card(n, blueprint)));
  } catch (e) {
    showFatal(e.message);
  }
}

document.getElementById('storage-warning').hidden = store.persistent;

document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([store.exportAll()], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: 'ktet-progress.json' });
  document.body.append(a); a.click(); a.remove();
  message.textContent = 'Progress file downloaded.';
});

document.getElementById('import').addEventListener('change', async (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  const res = store.importAll(await file.text());
  message.textContent = res.ok ? `Imported ${res.imported} attempt(s).` : res.error;
  ev.target.value = '';
  if (res.ok) render();
});

render();
