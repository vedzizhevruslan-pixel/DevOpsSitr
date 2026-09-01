import type { TopicId, MistakeRecord, TopicProgress, PlayerState } from '../types';
import { GAME_CONFIG } from '../config/gameConfig';
import { TOPIC_ORDER } from '../data/topics';

export function adjustStormMeter(current: number, delta: number): number {
  return Math.max(0, Math.min(100, current + delta));
}

export function getStormVisualLevel(meter: number): 'calm' | 'clouds' | 'wind' | 'storm' | 'hurricane' {
  if (meter >= 100) return 'hurricane';
  if (meter >= 75) return 'storm';
  if (meter >= 50) return 'wind';
  if (meter >= 20) return 'clouds';
  return 'calm';
}

export function findWeakestTopic(
  topicProgress: Record<TopicId, TopicProgress>,
  mistakes: MistakeRecord[],
): TopicId | null {
  const completed = TOPIC_ORDER.filter((id) => {
    const p = topicProgress[id];
    return p && p.quizAttempts.length > 0;
  });
  if (completed.length === 0) return null;

  let weakest: TopicId = completed[0];
  let lowestScore = Infinity;

  for (const id of completed) {
    const p = topicProgress[id];
    const topicMistakes = mistakes.filter((m) => m.topicId === id && !m.resolved);
    const score =
      p.masteryScore -
      topicMistakes.length * 5 -
      mistakes.filter((m) => m.topicId === id).reduce((s, m) => s + m.wrongCount, 0) * 2;

    if (score < lowestScore) {
      lowestScore = score;
      weakest = id;
    }
  }
  return weakest;
}

export function getWeakSkillTags(
  mistakes: MistakeRecord[],
  topicProgress: Record<TopicId, TopicProgress>,
): string[] {
  const tagCounts: Record<string, number> = {};
  for (const m of mistakes.filter((m) => !m.resolved)) {
    tagCounts[m.skillTag] = (tagCounts[m.skillTag] || 0) + m.wrongCount;
  }
  for (const id of TOPIC_ORDER) {
    const p = topicProgress[id];
    if (p && p.masteryScore < GAME_CONFIG.weakMasteryThreshold) {
      tagCounts[id] = (tagCounts[id] || 0) + 3;
    }
  }
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);
}

export function shouldTriggerStorm(state: PlayerState): boolean {
  return state.stormMeter >= GAME_CONFIG.stormTriggerThreshold && !state.stormActive;
}

export function getStormMessage(topicId: TopicId): string {
  const messages: Record<TopicId, string> = {
    linux: 'Капитан, команда забыла основы Linux. Нас относит назад!',
    networks: 'Капитан, команда забыла основы сетей. Нас относит назад!',
    ansible: 'Капитан, автоматизация дала сбой! Возвращаемся к Ansible!',
    terraform: 'Капитан, инфраструктура рушится! Назад к Terraform!',
    docker: 'Капитан, контейнеры протекают! Возвращаемся в порт Docker!',
    kubernetes: 'Капитан, флот теряет управление! Назад к Kubernetes!',
    'gitlab-cicd': 'Капитан, pipeline сломан! Возвращаемся на верфь!',
  };
  return messages[topicId] || 'Шторм незнания бросает корабль назад!';
}
