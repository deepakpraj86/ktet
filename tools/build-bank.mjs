// Builds data/testN.json from the compact authoring file bank-src/testN.txt.
// Usage: node tools/build-bank.mjs N
//
// Source format (blank lines and lines starting with a single # are ignored):
//   ## topic-id
//   question ||| option A ||| option B ||| option C ||| option D ||| correct letter ||| one-line explanation
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

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  const n = Number(process.argv[2]);
  if (!Number.isInteger(n) || n < 1 || n > 5) { console.error('usage: node tools/build-bank.mjs N (1-5)'); process.exit(2); }
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const blueprint = JSON.parse(readFileSync(join(root, 'data', 'blueprint.json'), 'utf8'));
  const questions = parseBank(readFileSync(join(root, 'bank-src', `test${n}.txt`), 'utf8'), blueprint, n);
  writeFileSync(join(root, 'data', `test${n}.json`), JSON.stringify(questions, null, 1) + '\n');
  const dist = [0, 0, 0, 0];
  questions.forEach((q) => { dist[q.answer] += 1; });
  console.log(`test${n}.json: ${questions.length} questions; correct answers A/B/C/D = ${dist.join('/')}`);
}
