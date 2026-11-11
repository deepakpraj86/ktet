import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSession } from '../js/quiz.js';

const questions = Array.from({ length: 4 }, (_, i) => ({ id: `q${i}`, part: 'pa', topic: 'a1', answer: 0 }));
const DURATION = 60_000;
const fresh = (now = 1000) => createSession({ questions, progress: null, now, durationMs: DURATION });

test('a new session starts on question 0 with a deadline one duration away', () => {
  const s = fresh(1000);
  const snap = s.snapshot();
  assert.equal(snap.current, 0);
  assert.equal(snap.startedAt, 1000);
  assert.equal(snap.deadline, 61_000);
  assert.deepEqual(snap.answers, [null, null, null, null]);
});

test('answering and flagging change the palette status', () => {
  const s = fresh();
  assert.equal(s.status(0), 'unanswered');
  s.answer(0, 2);
  assert.equal(s.status(0), 'answered');
  s.toggleFlag(0);
  assert.equal(s.status(0), 'flagged');
  s.toggleFlag(0);
  assert.equal(s.status(0), 'answered');
});

test('a snapshot fed back restores answers, flags, position and the same deadline', () => {
  const s = fresh(1000);
  s.answer(1, 3); s.toggleFlag(2); s.goTo(3);
  const restored = createSession({ questions, progress: s.snapshot(), now: 5000, durationMs: DURATION });
  assert.deepEqual(restored.snapshot(), s.snapshot());
  assert.equal(restored.snapshot().deadline, 61_000);
  assert.equal(restored.status(2), 'flagged');
});

test('progress whose deadline has passed reports expired', () => {
  const s = fresh(1000);
  const restored = createSession({ questions, progress: s.snapshot(), now: 61_000, durationMs: DURATION });
  assert.equal(restored.expired(61_000), true);
  assert.equal(restored.expired(60_999), false);
});

test('unansweredCount counts null answers, and clearing an answer makes it unanswered again', () => {
  const s = fresh();
  s.answer(0, 1); s.answer(1, 2);
  assert.equal(s.unansweredCount(), 2);
  s.answer(1, null);
  assert.equal(s.unansweredCount(), 3);
  assert.equal(s.status(1), 'unanswered');
});

test('goTo clamps to the valid range', () => {
  const s = fresh();
  s.goTo(99); assert.equal(s.snapshot().current, 3);
  s.goTo(-5); assert.equal(s.snapshot().current, 0);
});

test('saved progress from a different length of paper is padded or trimmed to the questions', () => {
  const stale = { answers: [1], flagged: [9], current: 7, startedAt: 1, deadline: 99_999 };
  const s = createSession({ questions, progress: stale, now: 2, durationMs: DURATION });
  const snap = s.snapshot();
  assert.equal(snap.answers.length, 4);
  assert.deepEqual(snap.flagged, []);
  assert.equal(snap.current, 3);
});
