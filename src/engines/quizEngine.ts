import type { Question, TopicId } from '../types';
import { GAME_CONFIG } from '../config/gameConfig';
import {
  getQuestionsByTopic,
  ALL_QUESTIONS,
  isInterviewSourceQuestion,
} from '../data/questions';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickFromPool(
  pool: Question[],
  count: number,
  selected: Question[],
  preferHard = false,
): void {
  const sorted = preferHard
    ? [...pool].sort((a, b) => {
        const order = { hard: 0, medium: 1, easy: 2 };
        return order[a.difficulty] - order[b.difficulty];
      })
    : shuffle(pool);
  for (const q of sorted) {
    if (selected.length >= count) break;
    if (!selected.find((s) => s.id === q.id)) selected.push(q);
  }
}

export function getEffectiveQuestionType(question: Question): Question['type'] {
  if (question.type === 'command' || question.type === 'scenario') return 'single';
  if (question.type === 'config') return 'config';
  return question.type;
}

export function isOrderQuestion(question: Question): boolean {
  return question.type === 'order';
}

export function isMultipleQuestion(question: Question): boolean {
  return question.type === 'multiple';
}

export function selectQuizQuestions(
  topicId: TopicId,
  count = GAME_CONFIG.quizQuestionsPerAttempt,
  excludeIds: string[] = [],
  priorityIds: string[] = [],
  attemptNumber = 0,
): Question[] {
  const pool = getQuestionsByTopic(topicId).filter((q) => !excludeIds.includes(q.id));
  const priority = pool.filter((q) => priorityIds.includes(q.id));
  const interviewPool = pool.filter(isInterviewSourceQuestion);
  const regularPool = pool.filter((q) => !isInterviewSourceQuestion(q));
  const selected: Question[] = [];
  const preferHard = attemptNumber >= 2;

  for (const q of shuffle(priority)) {
    if (selected.length >= count) break;
    selected.push(q);
  }

  const interviewTarget = Math.min(
    Math.floor(count * (attemptNumber >= 1 ? 0.35 : 0.2)),
    interviewPool.length,
  );
  pickFromPool(interviewPool, interviewTarget, selected, preferHard);

  const remaining = count - selected.length;
  pickFromPool(regularPool, remaining, selected, preferHard);
  pickFromPool(pool, count, selected, preferHard);

  return selected.slice(0, count);
}

export function selectStormQuestions(
  weakSkillTags: string[],
  count = GAME_CONFIG.stormChallengeQuestions,
): Question[] {
  const skillPool = ALL_QUESTIONS.filter((q) => weakSkillTags.includes(q.skillTag));
  const interviewSkill = skillPool.filter(isInterviewSourceQuestion);
  const selected: Question[] = [];

  pickFromPool(interviewSkill.length >= 2 ? interviewSkill : skillPool, Math.min(3, count), selected, true);
  pickFromPool(skillPool, count, selected, true);

  if (selected.length < count) {
    pickFromPool(ALL_QUESTIONS, count, selected);
  }

  return shuffle(selected).slice(0, count);
}

export function selectFinalReviewQuestions(
  unresolvedMistakes: { questionId: string; wrongCount: number }[],
  count = GAME_CONFIG.finalReviewBatchSize,
): Question[] {
  const sorted = [...unresolvedMistakes].sort((a, b) => b.wrongCount - a.wrongCount);
  const questions: Question[] = [];
  for (const m of sorted) {
    const q = ALL_QUESTIONS.find((x) => x.id === m.questionId);
    if (q && !questions.find((x) => x.id === q.id)) questions.push(q);
    if (questions.length >= count) break;
  }
  return questions;
}

export interface CaptainExamSlot {
  topicId: TopicId;
  count: number;
  interviewOnly?: boolean;
}

const CAPTAIN_EXAM_SLOTS: CaptainExamSlot[] = [
  { topicId: 'linux', count: 3 },
  { topicId: 'networks', count: 2 },
  { topicId: 'docker', count: 2 },
  { topicId: 'kubernetes', count: 3 },
  { topicId: 'gitlab-cicd', count: 2 },
  { topicId: 'terraform', count: 1, interviewOnly: true },
  { topicId: 'ansible', count: 1, interviewOnly: false },
  { topicId: 'captain-exam', count: 1, interviewOnly: true },
];

export function selectCaptainExamQuestions(
  weakSkillTags: string[],
  recentIds: string[] = [],
): Question[] {
  const selected: Question[] = [];
  const usedIds = new Set(recentIds);

  const weakQuestions = shuffle(
    ALL_QUESTIONS.filter(
      (q) => weakSkillTags.includes(q.skillTag) && !usedIds.has(q.id),
    ),
  );
  for (const q of weakQuestions) {
    if (selected.length >= 3) break;
    if (!selected.find((s) => s.id === q.id)) {
      selected.push(q);
      usedIds.add(q.id);
    }
  }

  for (const slot of CAPTAIN_EXAM_SLOTS) {
    let pool = getQuestionsByTopic(slot.topicId).filter((q) => !usedIds.has(q.id));
    if (slot.interviewOnly) {
      pool = pool.filter(isInterviewSourceQuestion);
    } else if (slot.topicId === 'ansible') {
      pool = pool.filter((q) => !isInterviewSourceQuestion(q));
    }
    if (pool.length === 0) {
      pool = getQuestionsByTopic(slot.topicId).filter((q) => !usedIds.has(q.id));
    }
    const picked = shuffle(pool).slice(0, slot.count);
    for (const q of picked) {
      if (!selected.find((s) => s.id === q.id)) {
        selected.push(q);
        usedIds.add(q.id);
      }
    }
  }

  return shuffle(selected).slice(0, GAME_CONFIG.captainExamQuestions);
}

function arraysEqualOrdered(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v.trim() === b[i].trim());
}

function arraysEqualUnordered(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].map((s) => s.trim()).sort();
  const sortedB = [...b].map((s) => s.trim()).sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

export function checkAnswer(
  question: Question,
  selected: string | string[] | boolean | Record<string, string>,
): boolean {
  const correct = question.correctAnswer;

  if (typeof correct === 'boolean') {
    return selected === correct;
  }

  if (question.type === 'match' && typeof selected === 'object' && !Array.isArray(selected)) {
    const matchCorrect = correct as unknown as Record<string, string>;
    const keys = Object.keys(matchCorrect);
    return keys.every((k) => (selected as Record<string, string>)[k] === matchCorrect[k]);
  }

  if (Array.isArray(correct)) {
    if (!Array.isArray(selected)) return false;
    if (question.type === 'order') {
      return arraysEqualOrdered(selected as string[], correct);
    }
    return arraysEqualUnordered(selected as string[], correct);
  }

  if (Array.isArray(selected)) {
    return selected.length === 1 && selected[0].trim() === String(correct).trim();
  }

  return String(selected).trim() === String(correct).trim();
}

export function formatAnswer(answer: string | string[] | boolean | Record<string, string>): string {
  if (typeof answer === 'boolean') return answer ? 'Верно' : 'Неверно';
  if (Array.isArray(answer)) return answer.join(' → ');
  if (typeof answer === 'object') {
    return Object.entries(answer)
      .map(([k, v]) => `${k} → ${v}`)
      .join('; ');
  }
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

export function getOrderItems(question: Question): string[] {
  if (question.type !== 'order' || !question.options) return [];
  return shuffleOptions([...question.options]);
}

export function getInterviewMasteryWeight(question: Question): number {
  return question.interviewWeight ?? (isInterviewSourceQuestion(question) ? 1.25 : 1);
}
