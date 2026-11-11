import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseBank } from '../tools/build-bank.mjs';

const blueprint = {
  parts: [
    { id: 'pa', perTest: 3, topics: [{ id: 'a1', perTest: 2 }, { id: 'a2', perTest: 1 }] },
    { id: 'pb', perTest: 1, topics: [{ id: 'b1', perTest: 1 }] }
  ]
};
const src = `
# a comment
## b1
Which is B? ||| p ||| q ||| r ||| s ||| D ||| Because s.

## a2
Second part question ||| 1 ||| 2 ||| 3 ||| 4 ||| A ||| One.
## a1
First ||| a ||| b ||| c ||| d ||| B ||| Two.
Another ||| a ||| b ||| c ||| d ||| C ||| Three.
`;

test('questions are ordered by the blueprint and get ids, part, topic and numeric answers', () => {
  const qs = parseBank(src, blueprint, 2);
  assert.deepEqual(qs.map((q) => q.topic), ['a1', 'a1', 'a2', 'b1']);
  assert.deepEqual(qs.map((q) => q.id), ['t2-pa-001', 't2-pa-002', 't2-pa-003', 't2-pb-001']);
  assert.deepEqual(qs.map((q) => q.answer), [1, 2, 0, 3]);
  assert.equal(qs[0].part, 'pa');
  assert.deepEqual(qs[3].options, ['p', 'q', 'r', 's']);
  assert.equal(qs[3].explanation, 'Because s.');
});

test('an unknown topic header is an error that names the line', () => {
  assert.throws(() => parseBank('## zz\nQ ||| a ||| b ||| c ||| d ||| A ||| e', blueprint, 1), /line 1.*zz/);
});

test('a question before any topic header is an error', () => {
  assert.throws(() => parseBank('Q ||| a ||| b ||| c ||| d ||| A ||| e', blueprint, 1), /line 1.*topic/);
});

test('the wrong number of fields is an error that names the line', () => {
  assert.throws(() => parseBank('## a1\nQ ||| a ||| b ||| c ||| A ||| e', blueprint, 1), /line 2.*7 fields/);
});

test('an answer letter outside A-D is an error', () => {
  assert.throws(() => parseBank('## a1\nQ ||| a ||| b ||| c ||| d ||| E ||| e', blueprint, 1), /line 2.*answer/);
});

import { balanceAnswers } from '../tools/build-bank.mjs';

const mk = (i, options, answer) => ({ id: `q${i}`, part: 'pa', topic: 'a1', text: `Q${i}`, options, answer, explanation: 'e' });

test('balanceAnswers spreads correct answers evenly and keeps the correct option text', () => {
  const qs = Array.from({ length: 8 }, (_, i) => mk(i, [`ok${i}`, `x${i}`, `y${i}`, `z${i}`], 0));
  const out = balanceAnswers(qs, 7);
  const counts = [0, 0, 0, 0];
  out.forEach((q, i) => {
    counts[q.answer] += 1;
    assert.equal(q.options[q.answer], `ok${i}`);
    assert.deepEqual([...q.options].sort(), [`ok${i}`, `x${i}`, `y${i}`, `z${i}`].sort());
  });
  assert.deepEqual(counts, [2, 2, 2, 2]);
});

test('questions whose options are all numeric are left exactly as authored', () => {
  const numeric = mk(1, ['15 cm', '30 cm', '45 cm', '7.5 cm'], 1);
  const out = balanceAnswers([numeric, mk(2, ['a', 'b', 'c', 'd'], 0)], 3);
  assert.deepEqual(out[0], numeric);
});

test('balanceAnswers is deterministic for a given seed and does not mutate its input', () => {
  const qs = Array.from({ length: 6 }, (_, i) => mk(i, ['a', 'b', 'c', 'd'].map((s) => `${s}${i}`), 0));
  const snapshot = JSON.stringify(qs);
  assert.deepEqual(balanceAnswers(qs, 5), balanceAnswers(qs, 5));
  assert.equal(JSON.stringify(qs), snapshot);
});
