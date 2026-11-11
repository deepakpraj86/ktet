import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreAttempt } from '../js/scoring.js';

const questions = [
  { id: 'q1', part: 'pa', topic: 'a1', answer: 0 },
  { id: 'q2', part: 'pa', topic: 'a2', answer: 2 },
  { id: 'q3', part: 'pb', topic: 'b1', answer: 3 },
  { id: 'q4', part: 'pb', topic: 'b1', answer: 1 }
];

test('all correct gives total equal to max', () => {
  const r = scoreAttempt(questions, [0, 2, 3, 1]);
  assert.equal(r.total, 4);
  assert.equal(r.max, 4);
});

test('mixed answers are broken down by part and topic', () => {
  const r = scoreAttempt(questions, [0, 1, 3, null]);
  assert.equal(r.total, 2);
  assert.deepEqual(r.byPart, { pa: { correct: 1, total: 2 }, pb: { correct: 1, total: 2 } });
  assert.deepEqual(r.byTopic, {
    a1: { correct: 1, total: 1 }, a2: { correct: 0, total: 1 }, b1: { correct: 1, total: 2 }
  });
});

test('nothing answered scores 0 without throwing and keeps part totals', () => {
  const r = scoreAttempt(questions, [null, null, null, null]);
  assert.equal(r.total, 0);
  assert.equal(r.max, 4);
  assert.deepEqual(r.byPart, { pa: { correct: 0, total: 2 }, pb: { correct: 0, total: 2 } });
});

test('perQuestion reports null for unanswered and flags correctness', () => {
  const r = scoreAttempt(questions, [null, 2, 0, null]);
  assert.deepEqual(r.perQuestion[0], { id: 'q1', chosen: null, correct: 0, isCorrect: false });
  assert.deepEqual(r.perQuestion[1], { id: 'q2', chosen: 2, correct: 2, isCorrect: true });
  assert.equal(r.perQuestion[2].isCorrect, false);
});

test('a short answers array is treated as unanswered for the missing entries', () => {
  const r = scoreAttempt(questions, [0]);
  assert.equal(r.total, 1);
  assert.equal(r.perQuestion[3].chosen, null);
});
