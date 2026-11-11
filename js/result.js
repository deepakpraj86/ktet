import { h, clear } from './dom.js';
import { scoreAttempt } from './scoring.js';
import { getStore, loadBlueprint, loadTest, testId, testNumberFromUrl, showFatal, pct } from './data.js';

const LETTERS = ['A', 'B', 'C', 'D'];
const app = document.getElementById('app');

function breakdown(title, rows) {
  return h('section', {},
    h('h2', {}, title),
    h('table', {},
      h('thead', {}, h('tr', {}, h('th', {}, 'Section'), h('th', {}, 'Correct'), h('th', {}, '%'))),
      h('tbody', {}, rows.map((r) => h('tr', { class: r.pct < 50 ? 'weak' : '' },
        h('td', {}, r.name), h('td', {}, `${r.correct}/${r.total}`), h('td', {}, `${r.pct}%`))))));
}

function reviewItem(q, i, pq) {
  const status = pq.chosen === null ? 'skipped' : pq.isCorrect ? 'right' : 'wrong';
  return h('article', { class: `review ${status}` },
    h('h3', {}, `${i + 1}. ${q.text}`),
    h('ul', { class: 'review-options' }, q.options.map((opt, k) => h('li', {
      class: [k === q.answer ? 'correct' : '', k === pq.chosen && !pq.isCorrect ? 'chosen-wrong' : ''].join(' ').trim()
    }, `${LETTERS[k]}. ${opt}`,
      k === q.answer ? h('span', { class: 'tag' }, ' (correct answer)') : null,
      k === pq.chosen ? h('span', { class: 'tag' }, ' (your answer)') : null))),
    pq.chosen === null ? h('p', { class: 'tag' }, 'You did not answer this question.') : null,
    h('p', { class: 'explain' }, q.explanation));
}

async function start() {
  const number = testNumberFromUrl();
  if (!number) { showFatal('Unknown test.'); return; }
  const attempt = getStore().getAttempts(testId(number)).at(-1);
  if (!attempt) {
    clear(app).append(h('p', {}, 'No attempt recorded for this test yet. ', h('a', { href: `test.html?id=${number}` }, 'Start it')));
    return;
  }
  let blueprint, questions;
  try { [blueprint, questions] = await Promise.all([loadBlueprint(), loadTest(number)]); }
  catch (e) { showFatal(e.message); return; }

  const score = scoreAttempt(questions, attempt.answers);
  const partRows = blueprint.parts.map((p) => {
    const b = score.byPart[p.id] ?? { correct: 0, total: 0 };
    return { name: p.name, ...b, pct: pct(b.correct, b.total) };
  });
  const topicName = Object.fromEntries(blueprint.parts.flatMap((p) => p.topics.map((t) => [t.id, t.name])));
  const topicRows = Object.entries(score.byTopic)
    .map(([topicId, b]) => ({ name: topicName[topicId] ?? topicId, ...b, pct: pct(b.correct, b.total) }))
    .sort((a, b) => a.pct - b.pct);

  document.getElementById('title').textContent = `Mock test ${number}: ${score.total} / ${score.max}`;
  const onlyWrong = h('input', { type: 'checkbox', id: 'only-wrong' });
  const reviewBox = h('div', { class: 'reviews' });
  const draw = () => clear(reviewBox).append(...questions
    .map((q, i) => ({ q, i, pq: score.perQuestion[i] }))
    .filter(({ pq }) => !onlyWrong.checked || !pq.isCorrect)
    .map(({ q, i, pq }) => reviewItem(q, i, pq)));
  onlyWrong.addEventListener('change', draw);
  draw();

  clear(app).append(
    h('p', { class: 'big' }, `${pct(score.total, score.max)}% correct`),
    h('p', {}, new Date(attempt.finishedAt).toLocaleString()),
    breakdown('By part', partRows),
    breakdown('By topic, weakest first (under 50% highlighted)', topicRows),
    h('section', {}, h('h2', {}, 'Review'),
      h('label', {}, onlyWrong, ' Show only questions I got wrong or skipped'), reviewBox),
    h('p', {}, h('a', { class: 'button primary', href: `test.html?id=${number}` }, 'Try this test again')));
}

start();
