import { CloudLightning, Flame, Star } from 'lucide-react';
import { getLevel } from '../../config/gameConfig';
import { useGameStore } from '../../stores/playerStore';
import { getStormVisualLevel } from '../../engines/stormEngine';
import { TOPIC_ORDER } from '../../data/topics';

function getOverallMastery(topicProgress: ReturnType<typeof useGameStore.getState>['topicProgress']): number {
  const scores = TOPIC_ORDER.map((id) => topicProgress[id]?.masteryScore ?? 0);
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function Header() {
  const captainName = useGameStore((s) => s.captainName);
  const xp = useGameStore((s) => s.xp);
  const streak = useGameStore((s) => s.streak);
  const stormMeter = useGameStore((s) => s.stormMeter);
  const coins = useGameStore((s) => s.coins);
  const achievements = useGameStore((s) => s.achievements);
  const topicProgress = useGameStore((s) => s.topicProgress);

  const level = getLevel(xp);
  const overallMastery = getOverallMastery(topicProgress);
  const stormLevel = getStormVisualLevel(stormMeter);

  return (
    <header className="shrink-0 bg-gradient-to-r from-[#0d1f3c] via-[#0a1628] to-[#0d1f3c] border-b border-amber-800/25 px-5 py-2.5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden lg:block text-xs text-cyan-400/70 uppercase tracking-widest font-display">
            DevOps Pirate Voyage
          </div>
        </div>

        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="hidden sm:flex items-center gap-3 text-xs text-blue-300/80">
            <span className="flex items-center gap-1 text-orange-400" title="Серия">
              <Flame size={14} /> {streak}
            </span>
            <span className="flex items-center gap-1 text-amber-300/90" title="Монеты">
              🪙 {coins}
            </span>
            <span className="flex items-center gap-1 text-yellow-400/90" title="Достижения">
              <Star size={14} /> {achievements.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-cyan-300/70">Mastery</span>
            <span className="text-cyan-200 font-semibold">{overallMastery}%</span>
          </div>

          <div
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border ${
              stormLevel === 'hurricane'
                ? 'border-red-500/50 bg-red-950/40 text-red-300 animate-pulse'
                : stormLevel === 'storm'
                  ? 'border-purple-500/40 bg-purple-950/30 text-purple-300'
                  : 'border-blue-800/30 bg-blue-950/20 text-blue-300'
            }`}
            title="Storm Meter"
          >
            <CloudLightning size={14} />
            <span className="font-medium">Storm {stormMeter}%</span>
          </div>

          <div className="flex items-center gap-3 bg-[#071428]/70 rounded-xl px-3 py-1.5 border border-amber-700/25 min-w-[200px]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center text-base border border-amber-500/60 shrink-0">
              🏴‍☠️
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-amber-100 text-sm truncate">{captainName}</div>
              <div className="text-[11px] text-cyan-300/80">
                {level.current.titleRu}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 h-1.5 bg-blue-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
                    style={{ width: `${level.progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-amber-300/70 whitespace-nowrap">
                  {xp.toLocaleString()}
                  {level.next ? ` / ${level.next.xp.toLocaleString()}` : ''} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
