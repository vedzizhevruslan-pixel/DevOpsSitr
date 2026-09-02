import type { MistakeRecord, TopicProgress, TopicId } from '../types';
import { ALL_QUESTIONS } from '../data/questions';

export interface SkillStats {
  skillTag: string;
  topicId: TopicId;
  totalAttempts: number;
  wrongCount: number;
  unresolvedCount: number;
  weakness: number;
}

export function computeSkillWeakness(
  mistakes: MistakeRecord[],
  topicProgress: Record<TopicId, TopicProgress>,
): SkillStats[] {
  const stats = new Map<string, SkillStats>();

  for (const q of ALL_QUESTIONS) {
    if (!stats.has(q.skillTag)) {
      stats.set(q.skillTag, {
        skillTag: q.skillTag,
        topicId: q.topicId,
        totalAttempts: 0,
        wrongCount: 0,
        unresolvedCount: 0,
        weakness: 0,
      });
    }
  }

  for (const m of mistakes) {
    const s = stats.get(m.skillTag);
    if (!s) continue;
    s.wrongCount += m.wrongCount;
    if (!m.resolved) s.unresolvedCount += 1;
    const daysSince = (Date.now() - new Date(m.lastMistakeAt).getTime()) / 86400000;
    const recency = Math.max(0, 1 - daysSince / 14);
    s.weakness +=
      m.wrongCount * 2 +
      (m.resolved ? 0 : 5) +
      recency * 3;
  }

  for (const [topicId, progress] of Object.entries(topicProgress) as [TopicId, TopicProgress][]) {
    if (progress.masteryScore < 80) {
      const topicMistakes = mistakes.filter((m) => m.topicId === topicId && !m.resolved);
      for (const tag of new Set(ALL_QUESTIONS.filter((q) => q.topicId === topicId).map((q) => q.skillTag))) {
        const s = stats.get(tag);
        if (s) s.weakness += (100 - progress.masteryScore) / 20;
      }
      if (topicMistakes.length === 0) {
        const first = ALL_QUESTIONS.find((q) => q.topicId === topicId);
        if (first) {
          const s = stats.get(first.skillTag);
          if (s) s.weakness += 2;
        }
      }
    }
  }

  return [...stats.values()]
    .filter((s) => s.weakness > 0 || s.unresolvedCount > 0)
    .sort((a, b) => b.weakness - a.weakness);
}

export function getWeakestSkillTags(mistakes: MistakeRecord[], topicProgress: Record<TopicId, TopicProgress>, limit = 10): string[] {
  return computeSkillWeakness(mistakes, topicProgress)
    .slice(0, limit)
    .map((s) => s.skillTag);
}
