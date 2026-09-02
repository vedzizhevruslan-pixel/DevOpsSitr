import { useGameStore } from '../../stores/playerStore';
import { TOPICS } from '../../data/topics';
import { getLevel } from '../../config/gameConfig';

export function StatsView() {
  const state = useGameStore();
  const level = getLevel(state.xp);
  const topicProgress = state.topicProgress;

  const avgMastery = Math.round(
    TOPICS.reduce((sum, t) => sum + (topicProgress[t.id]?.masteryScore ?? 0), 0) / TOPICS.length,
  );

  const best = TOPICS.reduce(
    (best, t) => {
      const score = topicProgress[t.id]?.masteryScore ?? 0;
      return score > best.score ? { name: t.nameRu, score } : best;
    },
    { name: '—', score: 0 },
  );

  const worst = TOPICS.reduce(
    (worst, t) => {
      const score = topicProgress[t.id]?.masteryScore ?? 0;
      if (score === 0) return worst;
      return score < worst.score ? { name: t.nameRu, score } : worst;
    },
    { name: '—', score: 100 },
  );

  const completedTopics = TOPICS.filter(
    (t) => (topicProgress[t.id]?.masteryScore ?? 0) >= 70,
  ).length;

  const stats = [
    { label: 'Общий прогресс', value: `${Math.round((completedTopics / 7) * 100)}%` },
    { label: 'Средний Mastery', value: `${avgMastery}%` },
    { label: 'XP', value: state.xp.toLocaleString() },
    { label: 'Звание', value: level.current.titleRu },
    { label: 'Правильных ответов', value: state.totalCorrect.toString() },
    { label: 'Ошибок', value: state.totalWrong.toString() },
    { label: 'Исправлено ошибок', value: state.mistakes.filter((m) => m.resolved).length.toString() },
    { label: 'Серия', value: `${state.streak} дней` },
    { label: 'Лучший раздел', value: `${best.name} ${best.score}%` },
    { label: 'Слабый раздел', value: worst.score < 100 ? `${worst.name} ${worst.score}%` : '—' },
    { label: 'Storm Meter', value: `${state.stormMeter}%` },
    { label: 'Монеты', value: state.coins.toLocaleString() },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-amber-100 mb-6">Статистика капитана</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="bg-[#1a3050]/60 border border-blue-800/30 rounded-xl p-4"
          >
            <div className="text-xs text-blue-400 mb-1">{label}</div>
            <div className="text-lg font-bold text-amber-100">{value}</div>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-amber-200 mt-8 mb-4">Mastery по темам</h3>
      <div className="space-y-3">
        {TOPICS.map((t) => {
          const score = topicProgress[t.id]?.masteryScore ?? 0;
          return (
            <div key={t.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-200">
                  {t.icon} {t.nameRu}
                </span>
                <span className="text-amber-300">{score}%</span>
              </div>
              <div className="h-2 bg-blue-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
