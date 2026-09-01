export const GAME_CONFIG = {
  version: 1,
  quizQuestionsPerAttempt: 10,
  stormChallengeQuestions: 5,
  finalReviewQuestions: 15,
  unlockNextIslandMastery: 70,
  weakMasteryThreshold: 80,
  stormTriggerThreshold: 100,
  maxPdfSizeMb: 10,
  captainNameDefault: 'Капитан Dev',

  xp: {
    chapter: 10,
    practice: 25,
    correctAnswer: 10,
    perfectQuiz: 100,
    fixMistake: 20,
    stormChallenge: 75,
    finalReview: 200,
    dailyQuest: 50,
    repeatMultiplier: 0.2,
  },

  storm: {
    wrongAnswer: 15,
    repeatWrongSkill: 10,
    quizBelow70: 25,
    quiz70to79: 10,
    perfectQuiz: -20,
    successfulReview: -15,
    stormChallengePass: -30,
  },

  mastery: {
    quizWeight: 0.5,
    practiceWeight: 0.2,
    errorPenalty: 0.15,
    firstAttemptWeight: 0.15,
  },

  levels: [
    { xp: 0, title: 'Cabin Boy', titleRu: 'Юнга' },
    { xp: 500, title: 'Sailor', titleRu: 'Матрос' },
    { xp: 1200, title: 'Navigator', titleRu: 'Штурман' },
    { xp: 2500, title: 'Bosun', titleRu: 'Боцман' },
    { xp: 4000, title: 'Container Captain', titleRu: 'Капитан контейнеров' },
    { xp: 6000, title: 'DevOps Corsair', titleRu: 'DevOps Корсар' },
    { xp: 9000, title: 'DevOps Captain', titleRu: 'DevOps Капитан' },
    { xp: 12000, title: 'Legendary Admiral', titleRu: 'Легендарный DevOps Адмирал' },
  ],

  islandPositions: [
    { x: 8, y: 55 },
    { x: 20, y: 35 },
    { x: 32, y: 55 },
    { x: 44, y: 30 },
    { x: 56, y: 50 },
    { x: 68, y: 35 },
    { x: 80, y: 55 },
    { x: 90, y: 40 },
    { x: 96, y: 25 },
  ],
} as const;

export function getLevel(xp: number) {
  type LevelEntry = (typeof GAME_CONFIG.levels)[number];
  const levels = GAME_CONFIG.levels;
  let current: LevelEntry = levels[0];
  let currentIdx = 0;
  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i].xp) {
      current = levels[i];
      currentIdx = i;
    }
  }
  const next = levels[currentIdx + 1];
  return {
    current,
    next,
    progress: next
      ? ((xp - current.xp) / (next.xp - current.xp)) * 100
      : 100,
  };
}

export function getMasteryStatus(score: number): import('../types').MasteryStatus {
  if (score >= 90) return 'mastered';
  if (score >= 80) return 'good';
  if (score >= 70) return 'unstable';
  if (score >= 50) return 'needs_review';
  return 'weak';
}

export function getMasteryLabel(status: import('../types').MasteryStatus): string {
  const labels: Record<import('../types').MasteryStatus, string> = {
    weak: '🔴 Слабое знание',
    needs_review: '🟠 Требуется повторение',
    unstable: '🟡 Нестабильное знание',
    good: '🟢 Хорошо',
    mastered: '🏆 Освоено',
  };
  return labels[status];
}
