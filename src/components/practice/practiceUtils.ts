import type { PracticeExercise } from '../../types';

/** Normalize shell-ish input for comparison */
export function normalizeCommand(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/["']/g, '"')
    .toLowerCase();
}

export function getAcceptedAnswers(exercise: PracticeExercise): string[] {
  if (exercise.acceptedAnswers?.length) {
    return exercise.acceptedAnswers.map(normalizeCommand);
  }
  const ca = exercise.correctAnswer;
  if (Array.isArray(ca)) return ca.map((c) => normalizeCommand(String(c)));
  return [normalizeCommand(String(ca))];
}

export function isAcceptedAnswer(exercise: PracticeExercise, input: string): boolean {
  const normalized = normalizeCommand(input);
  return getAcceptedAnswers(exercise).some((a) => a === normalized);
}

export function getScenario(exercise: PracticeExercise): string {
  return exercise.scenario ?? exercise.description;
}

export function getObjective(exercise: PracticeExercise): string {
  return exercise.objective ?? exercise.prompt;
}

export function getSuccessExplanation(exercise: PracticeExercise): string {
  return exercise.successExplanation ?? exercise.explanation;
}

export function getFailureFeedback(exercise: PracticeExercise, input: string): string {
  const key = normalizeCommand(input);
  if (exercise.wrongAnswerHints?.[key]) return exercise.wrongAnswerHints[key];
  // try raw option match
  if (exercise.wrongAnswerHints?.[input]) return exercise.wrongAnswerHints[input];
  return (
    exercise.failureFeedback ??
    '✗ Это действие не решает текущую задачу.\n\nПодумай ещё раз, что именно требуется, или открой подсказку.'
  );
}

export function computePracticeXp(hintsUsed: number, base = 25): number {
  if (hintsUsed <= 0) return base;
  if (hintsUsed === 1) return Math.max(15, base - 3);
  if (hintsUsed === 2) return Math.max(12, base - 5);
  return Math.max(10, base - 8);
}
