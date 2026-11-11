// Pure scoring logic: no DOM, no storage.
// questions: Question[]; answers: (number|null)[] aligned with questions (missing entries = unanswered).
export function scoreAttempt(questions, answers) {
  const byPart = {};
  const byTopic = {};
  const perQuestion = [];
  let total = 0;
  const bump = (bucket, key, isCorrect) => {
    const b = (bucket[key] ??= { correct: 0, total: 0 });
    b.total += 1;
    if (isCorrect) b.correct += 1;
  };
  questions.forEach((q, i) => {
    const chosen = answers[i] ?? null;
    const isCorrect = chosen === q.answer;
    if (isCorrect) total += 1;
    bump(byPart, q.part, isCorrect);
    bump(byTopic, q.topic, isCorrect);
    perQuestion.push({ id: q.id, chosen, correct: q.answer, isCorrect });
  });
  return { total, max: questions.length, byPart, byTopic, perQuestion };
}
