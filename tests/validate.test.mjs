import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateBank, validateBlueprint, validateFiles } from '../tools/validate.mjs';

const blueprint = {
  durationMinutes: 10,
  parts: [
    { id: 'pa', name: 'Part A', perTest: 3, topics: [
      { id: 'a1', name: 'A1', perTest: 2 },
      { id: 'a2', name: 'A2', perTest: 1 } ] },
    { id: 'pb', name: 'Part B', perTest: 2, topics: [
      { id: 'b1', name: 'B1', perTest: 2 } ] }
  ]
};

let seq = 0;
const q = (testId, part, topic, over = {}) => ({
  id: `${testId}-${part}-${++seq}`, part, topic,
  text: `Question ${seq} text`, options: ['w', 'x', 'y', 'z'], answer: 1,
  explanation: 'Because.', ...over
});
const goodTest = (testId) => [
  q(testId, 'pa', 'a1'), q(testId, 'pa', 'a1'), q(testId, 'pa', 'a2'),
  q(testId, 'pb', 'b1'), q(testId, 'pb', 'b1')
];
const good = () => ({ t1: goodTest('t1'), t2: goodTest('t2') });
const has = (errors, fragment) =>
  assert.ok(errors.some((e) => e.includes(fragment)), `expected an error containing "${fragment}", got ${JSON.stringify(errors)}`);

test('a valid bank has no errors', () => {
  assert.deepEqual(validateBank(blueprint, good()), []);
});

test('wrong total count is reported', () => {
  const t = good(); t.t1.pop();
  has(validateBank(blueprint, t), 't1');
});

test('wrong per-part count is reported', () => {
  const t = good(); t.t1[2].part = 'pb'; t.t1[2].topic = 'b1';
  has(validateBank(blueprint, t), 'part pa');
});

test('wrong per-topic count is reported', () => {
  const t = good(); t.t1[1].topic = 'a2';
  has(validateBank(blueprint, t), 'topic a1');
});

test('three options are rejected', () => {
  const t = good(); t.t1[0].options = ['w', 'x', 'y'];
  has(validateBank(blueprint, t), t.t1[0].id);
});

test('an empty option is rejected', () => {
  const t = good(); t.t1[0].options[2] = '  ';
  has(validateBank(blueprint, t), t.t1[0].id);
});

test('answer index 4 is rejected', () => {
  const t = good(); t.t1[0].answer = 4;
  has(validateBank(blueprint, t), t.t1[0].id);
});

test('duplicate ids are rejected', () => {
  const t = good(); t.t2[0].id = t.t1[0].id;
  has(validateBank(blueprint, t), 'duplicate id');
});

test('same question text in two tests is rejected, ignoring case and spacing', () => {
  const t = good(); t.t1[0].text = 'Same  Text'; t.t2[0].text = ' same text ';
  has(validateBank(blueprint, t), 'duplicate question text');
});

test('unknown part and unknown topic are rejected', () => {
  const t = good(); t.t1[0].part = 'zz';
  has(validateBank(blueprint, t), 'unknown part');
  const u = good(); u.t1[0].topic = 'zz';
  has(validateBank(blueprint, u), 'unknown topic');
});

test('a topic that belongs to another part is rejected', () => {
  const t = good(); t.t1[0].topic = 'b1';
  has(validateBank(blueprint, t), 'does not belong');
});

test('missing explanation is rejected', () => {
  const t = good(); t.t1[0].explanation = '';
  has(validateBank(blueprint, t), t.t1[0].id);
});

test('blueprint whose topics do not sum to the part count is rejected', () => {
  const bad = structuredClone(blueprint); bad.parts[0].topics[0].perTest = 5;
  has(validateBlueprint(bad), 'pa');
  assert.deepEqual(validateBlueprint(blueprint), []);
});

test('the real blueprint is self-consistent and totals 100', async () => {
  const { readFileSync } = await import('node:fs');
  const real = JSON.parse(readFileSync(new URL('../data/blueprint.json', import.meta.url), 'utf8'));
  assert.deepEqual(validateBlueprint(real), []);
  assert.equal(real.parts.reduce((a, p) => a + p.perTest, 0), 100);
});

test('validateFiles with only=N checks just that test file', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ktet-'));
  writeFileSync(join(dir, 'blueprint.json'), JSON.stringify(blueprint));
  writeFileSync(join(dir, 'test1.json'), JSON.stringify(goodTest('t1')));
  assert.deepEqual(validateFiles(dir, 1), []);
  has(validateFiles(dir), 'test2.json');
});
