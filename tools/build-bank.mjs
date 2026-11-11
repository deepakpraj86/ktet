// Builds data/testN.json from the compact authoring file bank-src/testN.txt.
// Usage: node tools/build-bank.mjs N
//
// Source format (blank lines and lines starting with a single # are ignored):
//   ## topic-id
//   question ||| option A ||| option B ||| option C ||| option D ||| correct letter ||| one-line explanation
// The letter marks the correct option as authored; the builder then rebalances positions (see balanceAnswers).
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SEP = '|||';
const LETTERS = 'ABCD';

export function parseBank(text, blueprint, testNumber) {
  const owner = new Map();
  const order = [];
  for (const p of blueprint.parts) for (const t of p.topics) { owner.set(t.id, p.id); order.push(t.id); }

  let topic = null;
  const found = [];
  text.split(/\r?\n/).forEach((raw, idx) => {
    const line = raw.trim();
    const where = `line ${idx + 1}`;
    if (!line || (line.startsWith('#') && !line.startsWith('##'))) return;
    if (line.startsWith('##')) {
      topic = line.slice(2).trim();
      if (!owner.has(topic)) throw new Error(`${where}: unknown topic "${topic}"`);
      return;
    }
    if (topic === null) throw new Error(`${where}: question appears before any topic header`);
    const f = line.split(SEP).map((s) => s.trim());
    if (f.length !== 7) throw new Error(`${where}: expected 7 fields separated by ${SEP}, got ${f.length}`);
    const answer = LETTERS.indexOf(f[5]);
    if (f[5].length !== 1 || answer < 0) throw new Error(`${where}: answer must be one of A, B, C, D (got "${f[5]}")`);
    found.push({ topic, part: owner.get(topic), text: f[0], options: f.slice(1, 5), answer, explanation: f[6] });
  });

  found.sort((a, b) => order.indexOf(a.topic) - order.indexOf(b.topic)); // stable: keeps authoring order within a topic
  const perPart = {};
  return found.map((q) => {
    const n = (perPart[q.part] = (perPart[q.part] ?? 0) + 1);
    return { id: `t${testNumber}-${q.part}-${String(n).padStart(3, '0')}`, part: q.part, topic: q.topic,
      text: q.text, options: q.options, answer: q.answer, explanation: q.explanation };
  });
}

// Authors tend to put the correct answer in the middle. This rebalances the position of the
// correct option across A-D, deterministically per seed. Questions whose options all start with a
// digit (numbers, units) keep their authored order, since numeric options are conventionally sorted.
export function balanceAnswers(questions, seed) {
  let a = (seed * 2654435761) >>> 0;
  const rand = () => { // mulberry32
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const isNumeric = (q) => q.options.every((o) => /^[\d.+\-/]/.test(o.trim()));
  const counts = [0, 0, 0, 0];
  questions.filter(isNumeric).forEach((q) => { counts[q.answer] += 1; });
  return questions.map((q) => {
    if (isNumeric(q)) return q;
    const min = Math.min(...counts);
    const slots = counts.map((c, i) => (c === min ? i : -1)).filter((i) => i >= 0);
    const target = slots[Math.floor(rand() * slots.length)];
    const correct = q.options[q.answer];
    const others = q.options.filter((_, i) => i !== q.answer);
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    const options = [...others.slice(0, target), correct, ...others.slice(target)];
    counts[target] += 1;
    return { ...q, options, answer: target };
  });
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  const n = Number(process.argv[2]);
  if (!Number.isInteger(n) || n < 1 || n > 5) { console.error('usage: node tools/build-bank.mjs N (1-5)'); process.exit(2); }
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const blueprint = JSON.parse(readFileSync(join(root, 'data', 'blueprint.json'), 'utf8'));
  const questions = balanceAnswers(parseBank(readFileSync(join(root, 'bank-src', `test${n}.txt`), 'utf8'), blueprint, n), n);
  writeFileSync(join(root, 'data', `test${n}.json`), JSON.stringify(questions, null, 1) + '\n');
  const dist = [0, 0, 0, 0];
  questions.forEach((q) => { dist[q.answer] += 1; });
  console.log(`test${n}.json: ${questions.length} questions; correct answers A/B/C/D = ${dist.join('/')}`);
}
