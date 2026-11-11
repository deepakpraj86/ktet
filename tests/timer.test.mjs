import { test } from 'node:test';
import assert from 'node:assert/strict';
import { remainingMs, formatClock } from '../js/timer.js';

test('remainingMs counts down to the deadline', () => {
  assert.equal(remainingMs(1000, 400), 600);
});

test('remainingMs never goes negative', () => {
  assert.equal(remainingMs(1000, 2000), 0);
});

test('formatClock shows minutes and seconds, rounding partial seconds up', () => {
  assert.equal(formatClock(100 * 60 * 1000), '100:00');
  assert.equal(formatClock(61_001), '01:02');
  assert.equal(formatClock(0), '00:00');
});
