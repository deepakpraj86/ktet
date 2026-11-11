// Pure time helpers. The deadline is an absolute timestamp so a refresh or a closed tab cannot reset it.
export function remainingMs(deadline, now) {
  return Math.max(0, deadline - now);
}

// mm:ss, partial seconds rounded up so the clock never shows 00:00 before time is really up.
export function formatClock(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
