import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../js/store.js';

const fakeStorage = (initial = {}) => {
  const m = new Map(Object.entries(initial));
  return {
    m,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); }
  };
};
const progress = () => ({ answers: [0, null, 2], flagged: [1], current: 1, startedAt: 1000, deadline: 9000 });
const attempt = (testId, finishedAt, total = 50) => ({
  testId, finishedAt, total, max: 100,
  byPart: { pa: { correct: total, total: 100 } }, byTopic: { a1: { correct: total, total: 100 } },
  answers: [0, 1, null]
});

test('saved progress loads back unchanged', () => {
  const s = createStore(fakeStorage());
  s.saveProgress('t1', progress());
  assert.deepEqual(s.loadProgress('t1'), progress());
  assert.equal(s.loadProgress('t2'), null);
});

test('clearProgress removes the saved progress', () => {
  const s = createStore(fakeStorage());
  s.saveProgress('t1', progress());
  s.clearProgress('t1');
  assert.equal(s.loadProgress('t1'), null);
});

test('attempts keep order and are isolated per test id', () => {
  const s = createStore(fakeStorage());
  s.recordAttempt(attempt('t1', 200));
  s.recordAttempt(attempt('t2', 300));
  s.recordAttempt(attempt('t1', 100));
  assert.deepEqual(s.getAttempts('t1').map((a) => a.finishedAt), [100, 200]);
  assert.equal(s.getAttempts('t2').length, 1);
  assert.deepEqual(s.getAttempts('t3'), []);
});

test('export then import into a fresh store reproduces the attempts', () => {
  const a = createStore(fakeStorage());
  a.recordAttempt(attempt('t1', 100)); a.recordAttempt(attempt('t2', 200));
  const b = createStore(fakeStorage());
  const res = b.importAll(a.exportAll());
  assert.deepEqual(res, { ok: true, imported: 2 });
  assert.deepEqual(b.getAttempts('t1'), a.getAttempts('t1'));
  assert.deepEqual(b.getAttempts('t2'), a.getAttempts('t2'));
});

test('importing the same export twice does not duplicate attempts', () => {
  const a = createStore(fakeStorage());
  a.recordAttempt(attempt('t1', 100));
  const exported = a.exportAll();
  const b = createStore(fakeStorage());
  b.importAll(exported);
  assert.deepEqual(b.importAll(exported), { ok: true, imported: 0 });
  assert.equal(b.getAttempts('t1').length, 1);
});

test('malformed imports are rejected and existing attempts are untouched', () => {
  const s = createStore(fakeStorage());
  s.recordAttempt(attempt('t1', 100));
  for (const bad of ['not json', '{"x":1}', '[]', 'null', '']) {
    const res = s.importAll(bad);
    assert.equal(res.ok, false, `input ${JSON.stringify(bad)}`);
    assert.ok(res.error);
  }
  assert.equal(s.getAttempts('t1').length, 1);
});

test('invalid attempt records inside a valid import are skipped', () => {
  const s = createStore(fakeStorage());
  const file = JSON.stringify({ app: 'ktet-mock-tests', version: 1, attempts: [attempt('t1', 100), { testId: 't1' }, 5] });
  assert.deepEqual(s.importAll(file), { ok: true, imported: 1 });
});

test('corrupt data already in storage reads as empty instead of throwing', () => {
  const s = createStore(fakeStorage({ 'ktet:progress:t1': '{oops', 'ktet:attempts': 'zzz' }));
  assert.equal(s.loadProgress('t1'), null);
  assert.deepEqual(s.getAttempts('t1'), []);
  s.recordAttempt(attempt('t1', 100));
  assert.equal(s.getAttempts('t1').length, 1);
});

test('progress with the wrong shape reads as null', () => {
  const s = createStore(fakeStorage({ 'ktet:progress:t1': JSON.stringify({ answers: 'x' }) }));
  assert.equal(s.loadProgress('t1'), null);
});

test('storage that throws on write falls back to memory and reports not persistent', () => {
  const broken = { getItem: () => null, setItem() { throw new Error('quota'); }, removeItem() {} };
  const s = createStore(broken);
  assert.equal(s.persistent, false);
  s.saveProgress('t1', progress());
  assert.deepEqual(s.loadProgress('t1'), progress());
  s.recordAttempt(attempt('t1', 100));
  assert.equal(s.getAttempts('t1').length, 1);
});

test('null storage also works in memory', () => {
  const s = createStore(null);
  assert.equal(s.persistent, false);
  s.recordAttempt(attempt('t1', 100));
  assert.equal(s.getAttempts('t1').length, 1);
});

test('a healthy storage reports persistent', () => {
  assert.equal(createStore(fakeStorage()).persistent, true);
});

test('quota failure after startup keeps data in memory and flips persistent to false', () => {
  const st = fakeStorage();
  let fail = false;
  const flaky = { ...st, setItem: (k, v) => { if (fail) throw new Error('quota'); st.setItem(k, v); } };
  const s = createStore(flaky);
  fail = true;
  s.saveProgress('t1', progress());
  assert.equal(s.persistent, false);
  assert.deepEqual(s.loadProgress('t1'), progress());
});
