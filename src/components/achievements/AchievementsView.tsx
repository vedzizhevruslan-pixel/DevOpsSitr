import { ACHIEVEMENTS } from '../../data/achievements';
import { useGameStore } from '../../stores/playerStore';

export function AchievementsView() {
  const earned = useGameStore((s) => s.achievements);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-amber-100 mb-6">Достижения</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((ach) => {
          const isEarned = earned.includes(ach.id) || earned.includes('storm-master-earned') && ach.id === 'storm-master';
          return (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border text-center transition-all ${
                isEarned
                  ? 'bg-amber-900/30 border-amber-600/50'
                  : 'bg-blue-900/20 border-blue-800/30 opacity-50 grayscale'
              }`}
            >
              <div className="text-3xl mb-2">{ach.icon}</div>
              <div className="font-semibold text-amber-100 text-sm">{ach.titleRu}</div>
              <div className="text-xs text-blue-400 mt-1">{ach.descriptionRu}</div>
              {isEarned && <div className="text-green-400 text-xs mt-2">✓ Получено</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
