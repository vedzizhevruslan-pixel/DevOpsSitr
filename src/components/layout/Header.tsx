import { CloudLightning, Flame } from 'lucide-react';
import { getLevel } from '../../config/gameConfig';
import { useGameStore } from '../../stores/playerStore';
import { getStormVisualLevel } from '../../engines/stormEngine';

export function Header() {
  const captainName = useGameStore((s) => s.captainName);
  const xp = useGameStore((s) => s.xp);
  const streak = useGameStore((s) => s.streak);
  const stormMeter = useGameStore((s) => s.stormMeter);
  const coins = useGameStore((s) => s.coins);
  const achievements = useGameStore((s) => s.achievements);
  const topicProgress = useGameStore((s) => s.topicProgress);

  const level = getLevel(xp);
  const completedTopics = Object.values(topicProgress).filter(
    (t) => t.masteryScore >= 70 && t.quizAttempts.length > 0,
  ).length;
  const totalProgress = Math.round((completedTopics / 7) * 100);
  const stormLevel = getStormVisualLevel(stormMeter);

  return (
    <header className="shrink-0 bg-gradient-to-r from-[#1a3050] via-[#0d2847] to-[#1a3050] border-b border-amber-800/30 px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-b from-amber-100 to-amber-200 text-amber-900 px-4 py-2 rounded-lg shadow-lg border border-amber-600/50">
            <h1 className="text-lg font-bold tracking-wide">Путь DevOps-пирата</h1>
            <p className="text-xs opacity-70">Learn. Apply. Automate. Win!</p>
          </div>
          <div className="hidden md:block">
            <div className="text-xs text-blue-300 mb-1">
              Общий прогресс: {totalProgress}% ({completedTopics}/7 тем)
            </div>
            <div className="w-48 h-2 bg-blue-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-orange-400">
              <Flame size={16} /> {streak}
            </span>
            <span
              className={`flex items-center gap-1 ${
                stormLevel === 'hurricane'
                  ? 'text-red-400 animate-pulse'
                  : stormLevel === 'storm'
                    ? 'text-purple-400'
                    : 'text-blue-300'
              }`}
              title="Storm Meter"
            >
              <CloudLightning size={16} /> {stormMeter}%
            </span>
            <span className="text-amber-300">🪙 {coins}</span>
            <span className="text-yellow-400">🏆 {achievements.length}</span>
          </div>
          <div className="flex items-center gap-3 bg-[#0a1628]/60 rounded-xl px-4 py-2 border border-amber-800/20">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-lg border-2 border-amber-400">
              🏴‍☠️
            </div>
            <div>
              <div className="font-semibold text-amber-100">{captainName}</div>
              <div className="text-xs text-blue-300">
                {level.current.titleRu} · {xp.toLocaleString()}
                {level.next ? ` / ${level.next.xp.toLocaleString()} XP` : ' XP'}
              </div>
              <div className="w-24 h-1.5 bg-blue-950 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${level.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
