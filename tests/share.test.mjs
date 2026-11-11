import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeAnswers, decodeAnswers } from '../js/share.js';

test('answers round-trip through the URL hash form, including unanswered ones', () => {
  const answers = [0, 3, null, 2, null, 1];
  const text = encodeAnswers(answers);
  assert.equal(text, '0,3,,2,,1');
  assert.deepEqual(decodeAnswers(text, 6), answers);
});

test('all unanswered round-trips', () => {
  const answers = Array(4).fill(null);
  assert.deepEqual(decodeAnswers(encodeAnswers(answers), 4), answers);
});

test('a hash with the wrong number of answers is rejected', () => {
  assert.equal(decodeAnswers('0,1,2', 4), null);
  assert.equal(decodeAnswers('0,1,2,3,0', 4), null);
});

test('values outside 0-3 or that are not numbers are rejected', () => {
  assert.equal(decodeAnswers('0,1,2,4', 4), null);
  assert.equal(decodeAnswers('0,1,2,-1', 4), null);
  assert.equal(decodeAnswers('0,1,x,3', 4), null);
  assert.equal(decodeAnswers('0,1,2.5,3', 4), null);
});

test('missing or empty input is rejected rather than read as all unanswered', () => {
  assert.equal(decodeAnswers(null, 4), null);
  assert.equal(decodeAnswers(undefined, 4), null);
  assert.equal(decodeAnswers('', 4), null);
});
