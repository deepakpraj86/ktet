// DOM-free state machine for one test attempt.
export function createSession({ questions, progress, now, durationMs }) {
  const n = questions.length;
  const clamp = (i) => Math.max(0, Math.min(n - 1, i));

  const answers = Array.from({ length: n }, (_, i) => progress?.answers?.[i] ?? null);
  const flagged = new Set((progress?.flagged ?? []).filter((i) => Number.isInteger(i) && i >= 0 && i < n));
  let current = clamp(progress?.current ?? 0);
  const startedAt = progress?.startedAt ?? now;
  const deadline = progress?.deadline ?? now + durationMs;

  return {
    get answers() { return answers.slice(); },
    get current() { return current; },
    get deadline() { return deadline; },
    answer(i, optionIndex) { answers[i] = optionIndex; },
    toggleFlag(i) { if (!flagged.delete(i)) flagged.add(i); },
    goTo(i) { current = clamp(i); },
    status(i) {
      if (flagged.has(i)) return 'flagged';
      return answers[i] === null ? 'unanswered' : 'answered';
    },
    expired(at) { return at >= deadline; },
    unansweredCount() { return answers.filter((a) => a === null).length; },
    snapshot() {
      return { answers: answers.slice(), flagged: [...flagged].sort((a, b) => a - b), current, startedAt, deadline };
    }
  };
}
