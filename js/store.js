// Progress and attempt storage. Backed by localStorage when available, otherwise by memory.
// Public methods never throw: bad or missing data reads as empty.
const PREFIX = 'ktet:';
const ATTEMPTS_KEY = `${PREFIX}attempts`;
const progressKey = (testId) => `${PREFIX}progress:${testId}`;
const EXPORT_APP = 'ktet-mock-tests';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isIntOrNull = (v) => v === null || Number.isInteger(v);

function isProgress(p) {
  return isObj(p) && Array.isArray(p.answers) && p.answers.every(isIntOrNull)
    && Array.isArray(p.flagged) && p.flagged.every(Number.isInteger)
    && Number.isInteger(p.current) && isNum(p.startedAt) && isNum(p.deadline);
}

function isAttempt(a) {
  return isObj(a) && typeof a.testId === 'string' && isNum(a.finishedAt)
    && isNum(a.total) && isNum(a.max) && isObj(a.byPart) && isObj(a.byTopic)
    && Array.isArray(a.answers) && a.answers.every(isIntOrNull);
}

export function createStore(storage) {
  const mem = new Map();
  let backend = null;
  try {
    storage.setItem(`${PREFIX}probe`, '1');
    storage.removeItem(`${PREFIX}probe`);
    backend = storage;
  } catch { /* no usable storage: stay in memory */ }

  const readRaw = (key) => {
    if (mem.has(key)) return mem.get(key);
    try { return backend ? backend.getItem(key) : null; } catch { return null; }
  };
  const writeRaw = (key, value) => {
    if (backend) {
      try { backend.setItem(key, value); mem.delete(key); return; }
      catch { backend = null; }
    }
    mem.set(key, value);
  };
  const removeRaw = (key) => {
    mem.delete(key);
    try { if (backend) backend.removeItem(key); } catch { /* ignore */ }
  };
  const readJson = (key) => {
    const raw = readRaw(key);
    if (raw == null) return null;
    try { return JSON.parse(raw); } catch { return null; }
  };
  const readAttempts = () => {
    const v = readJson(ATTEMPTS_KEY);
    return Array.isArray(v) ? v.filter(isAttempt) : [];
  };
  const attemptKey = (a) => `${a.testId}|${a.finishedAt}`;

  return {
    get persistent() { return backend !== null; },

    saveProgress(testId, progress) { writeRaw(progressKey(testId), JSON.stringify(progress)); },
    loadProgress(testId) {
      const p = readJson(progressKey(testId));
      return isProgress(p) ? p : null;
    },
    clearProgress(testId) { removeRaw(progressKey(testId)); },

    recordAttempt(attempt) {
      writeRaw(ATTEMPTS_KEY, JSON.stringify([...readAttempts(), attempt]));
    },
    getAttempts(testId) {
      return readAttempts().filter((a) => a.testId === testId).sort((x, y) => x.finishedAt - y.finishedAt);
    },

    exportAll() {
      return JSON.stringify({ app: EXPORT_APP, version: 1, attempts: readAttempts() }, null, 2);
    },
    importAll(json) {
      let data;
      try { data = JSON.parse(json); } catch { return { ok: false, imported: 0, error: 'The file is not valid JSON.' }; }
      if (!isObj(data) || data.app !== EXPORT_APP || !Array.isArray(data.attempts)) {
        return { ok: false, imported: 0, error: 'This is not a progress file exported from this app.' };
      }
      const existing = readAttempts();
      const seen = new Set(existing.map(attemptKey));
      const fresh = [];
      for (const a of data.attempts) {
        if (!isAttempt(a) || seen.has(attemptKey(a))) continue;
        seen.add(attemptKey(a));
        fresh.push(a);
      }
      if (fresh.length) writeRaw(ATTEMPTS_KEY, JSON.stringify([...existing, ...fresh]));
      return { ok: true, imported: fresh.length };
    }
  };
}
