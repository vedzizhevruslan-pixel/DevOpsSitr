import type { Achievement, PlayerState } from '../types';
import { TOPIC_ORDER } from '../data/topics';

export interface AchievementDef extends Achievement {
  check: (s: PlayerState) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-voyage', title: 'First Voyage', titleRu: 'Первый выход в море', description: 'Complete first chapter', descriptionRu: 'Завершена первая глава', icon: '⛵', check: (s) => Object.values(s.topicProgress).some((t) => t.chaptersCompleted.length > 0) },
  { id: 'no-leaks', title: 'No Leaks', titleRu: 'Без единой пробоины', description: '10 correct in a row', descriptionRu: '10 правильных отряд', icon: '🛡️', check: (s) => s.bestCorrectStreak >= 10 },
  { id: 'linux-corsair', title: 'Linux Corsair', titleRu: 'Linux Corsair', description: 'Linux ≥90%', descriptionRu: 'Linux ≥90%', icon: '🐧', check: (s) => (s.topicProgress.linux?.masteryScore ?? 0) >= 90 },
  { id: 'network-nav', title: 'Network Navigator', titleRu: 'Network Navigator', description: 'Networks ≥90%', descriptionRu: 'Сети ≥90%', icon: '🗼', check: (s) => (s.topicProgress.networks?.masteryScore ?? 0) >= 90 },
  { id: 'fleet-auto', title: 'Fleet Automator', titleRu: 'Автоматизатор флота', description: 'Ansible ≥90%', descriptionRu: 'Ansible ≥90%', icon: '⚙️', check: (s) => (s.topicProgress.ansible?.masteryScore ?? 0) >= 90 },
  { id: 'infra-arch', title: 'Infrastructure Architect', titleRu: 'Архитектор островов', description: 'Terraform ≥90%', descriptionRu: 'Terraform ≥90%', icon: '🏗️', check: (s) => (s.topicProgress.terraform?.masteryScore ?? 0) >= 90 },
  { id: 'container-corsair', title: 'Container Corsair', titleRu: 'Контейнерный корсар', description: 'Docker ≥90%', descriptionRu: 'Docker ≥90%', icon: '🐳', check: (s) => (s.topicProgress.docker?.masteryScore ?? 0) >= 90 },
  { id: 'k8s-admiral', title: 'K8s Admiral', titleRu: 'Адмирал Kubernetes', description: 'K8s ≥90%', descriptionRu: 'Kubernetes ≥90%', icon: '☸️', check: (s) => (s.topicProgress.kubernetes?.masteryScore ?? 0) >= 90 },
  { id: 'cicd-captain', title: 'CI/CD Captain', titleRu: 'Капитан Pipeline', description: 'GitLab CI/CD ≥90%', descriptionRu: 'GitLab CI/CD ≥90%', icon: '🦊', check: (s) => (s.topicProgress['gitlab-cicd']?.masteryScore ?? 0) >= 90 },
  { id: 'storm-master', title: 'Storm Master', titleRu: 'Повелитель шторма', description: 'Pass Storm Challenge', descriptionRu: 'Успешный Storm Challenge', icon: '⛈️', check: (s) => s.achievements.includes('storm-master-earned') },
  { id: 'mistakes-fixed', title: 'Mistakes Are Experience', titleRu: 'Ошибка — это опыт', description: 'Fix 25 mistakes', descriptionRu: 'Исправить 25 ошибок', icon: '🔧', check: (s) => s.mistakes.filter((m) => m.resolved).length >= 25 },
  { id: 'legendary', title: 'Legendary DevOps Pirate', titleRu: 'Легендарный DevOps-пират', description: 'Complete entire voyage', descriptionRu: 'Освоить весь маршрут', icon: '🏴‍☠️', check: (s) => s.treasureUnlocked },
];

export function checkAchievements(state: PlayerState): string[] {
  const earned: string[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (!state.achievements.includes(ach.id) && ach.check(state)) {
      earned.push(ach.id);
    }
  }
  return earned;
}

export function allTopicsCompleted(state: PlayerState): boolean {
  return TOPIC_ORDER.every((id) => {
    const p = state.topicProgress[id];
    return p && p.masteryScore >= 70 && p.quizAttempts.length > 0;
  });
}
