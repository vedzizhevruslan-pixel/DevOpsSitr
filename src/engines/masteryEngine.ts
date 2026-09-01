import type { TopicId, TopicProgress, MistakeRecord, IslandStatus } from '../types';
import { GAME_CONFIG } from '../config/gameConfig';
import { getPractice } from '../data/lessons';

export function calculateMastery(
  progress: TopicProgress,
  mistakes: MistakeRecord[],
): number {
  const topicMistakes = mistakes.filter((m) => m.topicId === progress.topicId);
  const quizWeight = GAME_CONFIG.mastery.quizWeight;
  const practiceWeight = GAME_CONFIG.mastery.practiceWeight;

  const quizScore = progress.lastQuizScore || progress.bestQuizScore || 0;
  const practiceTotal = progress.practiceCompleted.length;
  const practiceMax = Math.max(1, getPractice(progress.topicId).length);
  const practiceScore = Math.min(100, (practiceTotal / practiceMax) * 100);

  const chapterTotal = progress.chaptersCompleted.length;
  const chapterScore = Math.min(100, chapterTotal * 15);

  let base =
    quizScore * quizWeight +
    practiceScore * practiceWeight +
    chapterScore * (1 - quizWeight - practiceWeight);

  const errorPenalty = topicMistakes.reduce((sum, m) => {
    return sum + (m.resolved ? 2 : 5) * m.wrongCount;
  }, 0);
  base = Math.max(0, base - errorPenalty * GAME_CONFIG.mastery.errorPenalty);

  if (progress.firstAttemptAccuracy.length > 0) {
    const avgFirst =
      progress.firstAttemptAccuracy.reduce((a, b) => a + b, 0) /
      progress.firstAttemptAccuracy.length;
    base = base * 0.85 + avgFirst * 0.15;
  }

  return Math.round(Math.min(100, Math.max(0, base)));
}

export function getIslandStatus(
  progress: TopicProgress,
  isUnlocked: boolean,
): IslandStatus {
  if (!isUnlocked) return 'locked';
  if (progress.status === 'needs_repair') return 'needs_repair';
  if (progress.masteryScore >= 90) return 'mastered';
  if (progress.masteryScore >= 70 && progress.quizAttempts.length > 0) return 'completed';
  if (progress.masteryScore > 0 && progress.masteryScore < 50) return 'weak';
  if (
    progress.chaptersCompleted.length > 0 ||
    progress.practiceCompleted.length > 0 ||
    progress.quizAttempts.length > 0
  ) {
    return 'in_progress';
  }
  if (isUnlocked) return 'available';
  return 'locked';
}

export function isTopicUnlocked(
  topicId: TopicId,
  topicProgress: Record<TopicId, TopicProgress>,
  topicOrder: TopicId[],
): boolean {
  const idx = topicOrder.indexOf(topicId);
  if (idx === 0) return true;
  const prev = topicOrder[idx - 1];
  const prevProgress = topicProgress[prev];
  return (
    prevProgress &&
    prevProgress.masteryScore >= GAME_CONFIG.unlockNextIslandMastery &&
    prevProgress.quizAttempts.length > 0
  );
}
