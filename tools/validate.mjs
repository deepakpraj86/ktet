// Validates data/blueprint.json and the question banks data/test1..5.json.
// Usage: node tools/validate.mjs [--only N]
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TEST_COUNT = 5;
const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();
const filled = (s) => typeof s === 'string' && s.trim().length > 0;

export function validateBlueprint(blueprint) {
  const errors = [];
  const topicIds = new Set();
  for (const part of blueprint.parts) {
    const sum = part.topics.reduce((a, t) => a + t.perTest, 0);
    if (sum !== part.perTest) errors.push(`blueprint: part ${part.id} topics sum to ${sum}, expected ${part.perTest}`);
    for (const t of part.topics) {
      if (topicIds.has(t.id)) errors.push(`blueprint: duplicate topic id ${t.id}`);
      topicIds.add(t.id);
    }
  }
  return errors;
}

// tests: { [testId]: Question[] }. Validates whichever tests are given.
export function validateBank(blueprint, tests) {
  const errors = [];
  const partById = new Map(blueprint.parts.map((p) => [p.id, p]));
  const topicOwner = new Map();
  for (const p of blueprint.parts) for (const t of p.topics) topicOwner.set(t.id, p.id);
  const expectedTotal = blueprint.parts.reduce((a, p) => a + p.perTest, 0);
  const ids = new Set();
  const texts = new Map();

  for (const [testId, questions] of Object.entries(tests)) {
    if (questions.length !== expectedTotal) {
      errors.push(`${testId}: has ${questions.length} questions, expected ${expectedTotal}`);
    }
    const partCount = new Map();
    const topicCount = new Map();
    for (const q of questions) {
      const label = `${testId} ${q.id}`;
      if (ids.has(q.id)) errors.push(`${label}: duplicate id`);
      ids.add(q.id);

      const key = norm(q.text ?? '');
      if (texts.has(key)) errors.push(`${label}: duplicate question text (also ${texts.get(key)})`);
      else texts.set(key, label);

      if (!filled(q.text)) errors.push(`${label}: missing question text`);
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        errors.push(`${label}: needs exactly 4 options`);
      } else if (!q.options.every(filled)) {
        errors.push(`${label}: has an empty option`);
      }
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) {
        errors.push(`${label}: answer must be an integer 0-3`);
      }
      if (!filled(q.explanation)) errors.push(`${label}: missing explanation`);

      if (!partById.has(q.part)) errors.push(`${label}: unknown part ${q.part}`);
      if (!topicOwner.has(q.topic)) errors.push(`${label}: unknown topic ${q.topic}`);
      else if (partById.has(q.part) && topicOwner.get(q.topic) !== q.part) {
        errors.push(`${label}: topic ${q.topic} does not belong to part ${q.part}`);
      }
      partCount.set(q.part, (partCount.get(q.part) ?? 0) + 1);
      topicCount.set(q.topic, (topicCount.get(q.topic) ?? 0) + 1);
    }
    for (const p of blueprint.parts) {
      const got = partCount.get(p.id) ?? 0;
      if (got !== p.perTest) errors.push(`${testId}: part ${p.id} has ${got} questions, expected ${p.perTest}`);
      for (const t of p.topics) {
        const n = topicCount.get(t.id) ?? 0;
        if (n !== t.perTest) errors.push(`${testId}: topic ${t.id} has ${n} questions, expected ${t.perTest}`);
      }
    }
  }
  return errors;
}

// Loads blueprint.json and test files from dir. `only` limits to one test number.
export function validateFiles(dir, only) {
  const blueprint = JSON.parse(readFileSync(join(dir, 'blueprint.json'), 'utf8'));
  const errors = validateBlueprint(blueprint);
  const numbers = only ? [only] : Array.from({ length: TEST_COUNT }, (_, i) => i + 1);
  const tests = {};
  for (const n of numbers) {
    const file = join(dir, `test${n}.json`);
    if (!existsSync(file)) { errors.push(`data/test${n}.json is missing`); continue; }
    try { tests[`t${n}`] = JSON.parse(readFileSync(file, 'utf8')); }
    catch (e) { errors.push(`data/test${n}.json is not valid JSON: ${e.message}`); }
  }
  return [...errors, ...validateBank(blueprint, tests)];
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  const i = process.argv.indexOf('--only');
  const only = i > -1 ? Number(process.argv[i + 1]) : undefined;
  const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
  const errors = validateFiles(dataDir, only);
  if (errors.length) {
    console.error(errors.join('\n'));
    console.error(`\n${errors.length} problem(s)`);
    process.exit(1);
  }
  console.log(only ? `test${only} OK` : `all ${TEST_COUNT} tests OK`);
}
