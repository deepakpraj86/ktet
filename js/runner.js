import { h, clear } from './dom.js';
import { createSession } from './quiz.js';
import { remainingMs, formatClock } from './timer.js';
import { scoreAttempt } from './scoring.js';
import { getStore, loadBlueprint, loadTest, testId, testNumberFromUrl, showFatal } from './data.js';

const LETTERS = ['A', 'B', 'C', 'D'];
const app = document.getElementById('app');
const clockEl = document.getElementById('clock');
const store = getStore();
let session, questions, partNames, id, number, timerHandle;

function save() { store.saveProgress(id, session.snapshot()); }

function submit(auto) {
  clearInterval(timerHandle);
  const answers = session.answers;
  const score = scoreAttempt(questions, answers);
  store.recordAttempt({
    testId: id, finishedAt: Date.now(), total: score.total, max: score.max,
    byPart: score.byPart, byTopic: score.byTopic, answers
  });
  store.clearProgress(id);
  location.replace(`result.html?id=${number}${auto ? '&auto=1' : ''}`);
}

function trySubmit() {
  const left = session.unansweredCount();
  const text = left
    ? `You have ${left} unanswered question${left === 1 ? '' : 's'}. Submit the test now?`
    : 'Submit the test now?';
  if (window.confirm(text)) submit(false);
}

function tick() {
  const now = Date.now();
  if (session.expired(now)) { submit(true); return; }
  const ms = remainingMs(session.deadline, now);
  clockEl.textContent = formatClock(ms);
  clockEl.classList.toggle('low', ms < 5 * 60 * 1000);
}

function palette() {
  return h('nav', { class: 'palette', 'aria-label': 'Question palette' },
    questions.map((_, i) => h('button', {
      type: 'button',
      class: `cell ${session.status(i)}${i === session.current ? ' current' : ''}`,
      'aria-label': `Question ${i + 1}, ${session.status(i)}`,
      'aria-current': i === session.current ? 'true' : false,
      onclick: () => { session.goTo(i); save(); render(); }
    }, i + 1)));
}

function render() {
  const i = session.current;
  const q = questions[i];
  const chosen = session.answers[i];
  const go = (to) => () => { session.goTo(to); save(); render(); };
  clear(app).append(
    h('section', { class: 'question' },
      h('p', { class: 'where' }, `Question ${i + 1} of ${questions.length} · ${partNames[q.part] ?? ''}`),
      h('h2', { class: 'qtext', id: 'qtext', tabindex: '-1' }, q.text),
      h('div', { role: 'radiogroup', 'aria-labelledby': 'qtext', class: 'options' },
        q.options.map((opt, k) => h('label', { class: `option${chosen === k ? ' picked' : ''}` },
          h('input', {
            type: 'radio', name: 'opt', value: k, checked: chosen === k,
            onchange: () => { session.answer(i, k); save(); render(); }
          }),
          h('span', { class: 'letter' }, LETTERS[k]),
          h('span', {}, opt)))),
      h('div', { class: 'nav' },
        h('button', { type: 'button', onclick: go(i - 1), disabled: i === 0 }, 'Previous'),
        h('button', { type: 'button', onclick: () => { session.answer(i, null); save(); render(); }, disabled: chosen === null }, 'Clear'),
        h('button', { type: 'button', onclick: () => { session.toggleFlag(i); save(); render(); } },
          session.status(i) === 'flagged' ? 'Unflag' : 'Flag for review'),
        h('button', { type: 'button', class: 'primary', onclick: go(i + 1), disabled: i === questions.length - 1 }, 'Next'))),
    h('aside', {}, h('h3', {}, 'Questions'),
      h('p', { class: 'legend' }, 'Green answered · amber flagged · white unanswered'),
      palette()));
}

async function start() {
  number = testNumberFromUrl();
  if (!number) { showFatal('Unknown test.'); return; }
  id = testId(number);
  try {
    const [blueprint, qs] = await Promise.all([loadBlueprint(), loadTest(number)]);
    questions = qs;
    partNames = Object.fromEntries(blueprint.parts.map((p) => [p.id, p.name]));
    session = createSession({
      questions, progress: store.loadProgress(id), now: Date.now(),
      durationMs: blueprint.durationMinutes * 60 * 1000
    });
  } catch (e) { showFatal(e.message); return; }
  document.getElementById('test-title').textContent = `Mock test ${number}`;
  if (!store.persistent) {
    app.before(h('p', { class: 'warning', role: 'status' }, 'Storage is blocked in this browser: your progress will not survive a refresh.'));
  }
  if (session.expired(Date.now())) { submit(true); return; }
  save();
  document.getElementById('submit').addEventListener('click', trySubmit);
  render();
  tick();
  timerHandle = setInterval(tick, 1000);
}

start();
