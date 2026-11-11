// Carries a finished attempt to the result page in the URL hash when browser storage is blocked.
// Answer indexes (0-3 or empty) are not personal data.
export function encodeAnswers(answers) {
  return answers.map((a) => (a === null ? '' : String(a))).join(',');
}

// Returns (number|null)[] of exactly `length` entries, or null if the text is missing or malformed.
export function decodeAnswers(text, length) {
  if (typeof text !== 'string' || text === '') return null;
  const parts = text.split(',');
  if (parts.length !== length) return null;
  const out = [];
  for (const p of parts) {
    if (p === '') { out.push(null); continue; }
    if (!/^[0-3]$/.test(p)) return null;
    out.push(Number(p));
  }
  return out;
}
