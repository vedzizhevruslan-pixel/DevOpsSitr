import type { TopicId, MistakeRecord, TopicProgress, PlayerState } from '../types';
import { GAME_CONFIG } from '../config/gameConfig';
import { TOPIC_ORDER } from '../data/topics';
import { getWeakestSkillTags } from './skillEngine';
import { getWaypointIndex } from '../config/mapConfig';
import { waypointToProgress } from '../config/mapConfig';

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
      topicMistakes.length * 8 -
      mistakes.filter((m) => m.topicId === id).reduce((s, m) => s + m.wrongCount, 0) * 3;

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
  return getWeakestSkillTags(mistakes, topicProgress, 12);
}

export function canTriggerStorm(state: PlayerState): boolean {
  if (state.stormActive || state.stormChallengeActive) return false;
  if (state.stormMeter < GAME_CONFIG.stormTriggerThreshold) return false;
  if (state.lastStormTriggeredAt) {
    const elapsed = Date.now() - state.lastStormTriggeredAt;
    if (elapsed < GAME_CONFIG.stormCooldownMs) return false;
  }
  return true;
}

export function shouldTriggerStorm(state: PlayerState): boolean {
  return canTriggerStorm(state);
}

export function getStormTargetProgress(topicId: TopicId): number {
  const idx = getWaypointIndex(topicId);
  return waypointToProgress(idx >= 0 ? idx : 0);
}

export function getStormMessage(topicId: TopicId): string {
  const names: Record<TopicId, string> = {
    linux: 'Linux Terminal Cave',
    networks: 'Network Lighthouse',
    ansible: 'Automation Fleet Base',
    terraform: 'Infrastructure Island',
    docker: 'Container Port',
    kubernetes: 'Orchestration Archipelago',
    'gitlab-cicd': 'Automation Shipyard',
    'captain-exam': 'Open Waters',
  };
  return `Капитан! ${names[topicId] || topicId} стал нашим слабым местом. Шторм относит корабль назад!`;
}
