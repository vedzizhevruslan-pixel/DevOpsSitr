import type { Question, TopicId } from '../types';
import { GAME_CONFIG } from '../config/gameConfig';
import { getQuestionsByTopic, ALL_QUESTIONS } from '../data/questions';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function selectQuizQuestions(
  topicId: TopicId,
  count = GAME_CONFIG.quizQuestionsPerAttempt,
  excludeIds: string[] = [],
  priorityIds: string[] = [],
): Question[] {
  const pool = getQuestionsByTopic(topicId).filter((q) => !excludeIds.includes(q.id));
  const priority = pool.filter((q) => priorityIds.includes(q.id));
  const rest = pool.filter((q) => !priorityIds.includes(q.id));
  const selected: Question[] = [];

  for (const q of shuffle(priority)) {
    if (selected.length >= count) break;
    selected.push(q);
  }
  for (const q of shuffle(rest)) {
    if (selected.length >= count) break;
    if (!selected.find((s) => s.id === q.id)) selected.push(q);
  }
  return selected.slice(0, count);
}

export function selectStormQuestions(
  weakSkillTags: string[],
  count = GAME_CONFIG.stormChallengeQuestions,
): Question[] {
  const pool = ALL_QUESTIONS.filter((q) => weakSkillTags.includes(q.skillTag));
  return shuffle(pool.length > 0 ? pool : ALL_QUESTIONS).slice(0, count);
}

export function selectFinalReviewQuestions(
  mistakeQuestionIds: string[],
  weakTopicIds: TopicId[],
  count = GAME_CONFIG.finalReviewQuestions,
): Question[] {
  const fromMistakes = mistakeQuestionIds
    .map((id) => ALL_QUESTIONS.find((q) => q.id === id))
    .filter((q): q is Question => !!q);

  const weakPool = ALL_QUESTIONS.filter(
    (q) => weakTopicIds.includes(q.topicId) && !fromMistakes.find((m) => m.id === q.id),
  );

  const combined = [...shuffle(fromMistakes), ...shuffle(weakPool)];
  const unique: Question[] = [];
  for (const q of combined) {
    if (!unique.find((u) => u.id === q.id)) unique.push(q);
    if (unique.length >= count) break;
  }
  return unique.slice(0, count);
}

export function checkAnswer(
  question: Question,
  selected: string | string[] | boolean,
): boolean {
  const correct = question.correctAnswer;
  if (typeof correct === 'boolean') {
    return selected === correct;
  }
  if (Array.isArray(correct)) {
    if (!Array.isArray(selected)) return false;
    const sortedC = [...correct].sort();
    const sortedS = [...selected].sort();
    return JSON.stringify(sortedC) === JSON.stringify(sortedS);
  }
  if (Array.isArray(selected)) {
    return selected.length === 1 && selected[0] === correct;
  }
  return String(selected).trim() === String(correct).trim();
}

export function formatAnswer(answer: string | string[] | boolean): string {
  if (typeof answer === 'boolean') return answer ? 'True' : 'False';
  if (Array.isArray(answer)) return answer.join(' → ');
  return String(answer);
}

export function calculateQuizScore(
  answers: Array<{ correct: boolean }>,
): { score: number; total: number; percent: number } {
  const total = answers.length;
  const score = answers.filter((a) => a.correct).length;
  return { score, total, percent: total > 0 ? Math.round((score / total) * 100) : 0 };
}

export function shuffleOptions(options: string[]): string[] {
  return shuffle(options);
}
