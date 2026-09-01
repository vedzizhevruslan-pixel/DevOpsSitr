import { motion } from 'framer-motion';
import type { IslandStatus } from '../../types';
import { TOPICS, SPECIAL_LOCATIONS } from '../../data/topics';
import { getMasteryStatus, getMasteryLabel } from '../../config/gameConfig';
import { useGameStore } from '../../stores/playerStore';
import { isTopicUnlocked } from '../../engines/masteryEngine';
import { TOPIC_ORDER } from '../../data/topics';
import { getStormVisualLevel } from '../../engines/stormEngine';
import { getStormMessage } from '../../engines/stormEngine';

function IslandNode({
  x,
  y,
  label,
  icon,
  status,
  mastery,
  order,
  onClick,
  color,
}: {
  x: number;
  y: number;
  label: string;
  icon: string;
  status: IslandStatus;
  mastery: number;
  order: number;
  onClick: () => void;
  color: string;
}) {
  const statusStyles: Record<IslandStatus, string> = {
    locked: 'opacity-40 grayscale',
    available: 'ring-2 ring-blue-400/50',
    in_progress: 'ring-2 ring-yellow-400/60 animate-pulse',
    completed: 'ring-2 ring-green-500/60',
    weak: 'ring-2 ring-orange-500/70',
    mastered: 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/30',
    needs_repair: 'ring-2 ring-red-500 animate-pulse',
  };

  return (
    <motion.button
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 group ${statusStyles[status]}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      disabled={status === 'locked'}
    >
      <div
        className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex flex-col items-center justify-center border-2 border-white/20 shadow-xl transition-all"
        style={{ background: `linear-gradient(135deg, ${color}88, ${color}44)` }}
      >
        <span className="text-2xl md:text-3xl">{icon}</span>
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-900 border border-blue-400 text-xs flex items-center justify-center font-bold">
          {order}
        </span>
        {status === 'completed' || status === 'mastered' ? (
          <span className="absolute -bottom-1 -right-1 text-green-400 text-lg">✓</span>
        ) : null}
        {status === 'weak' || status === 'needs_repair' ? (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">⛈️</span>
        ) : null}
        {status === 'mastered' ? (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">⭐</span>
        ) : null}
      </div>
      <div className="mt-1 text-center">
        <div className="text-xs font-semibold text-white drop-shadow-lg whitespace-nowrap">{label}</div>
        {mastery > 0 && (
          <div className="text-[10px] text-blue-200">{mastery}%</div>
        )}
      </div>
    </motion.button>
  );
}

function Ship({ x, y }: { x: number; y: number }) {
  return (
    <motion.div
      className="absolute ship-float z-20 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -80%)' }}
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <div className="text-4xl md:text-5xl filter drop-shadow-lg" title="Твой корабль">
        🚢
      </div>
      <div className="flex gap-0.5 justify-center -mt-1">
        <span className="text-xs">📦</span>
        <span className="text-xs">📦</span>
        <span className="text-xs">📦</span>
      </div>
    </motion.div>
  );
}

export function VoyageMap() {
  const topicProgress = useGameStore((s) => s.topicProgress);
  const shipPosition = useGameStore((s) => s.shipPosition);
  const stormMeter = useGameStore((s) => s.stormMeter);
  const stormActive = useGameStore((s) => s.stormActive);
  const stormTargetTopicId = useGameStore((s) => s.stormTargetTopicId);
  const finalReviewCompleted = useGameStore((s) => s.finalReviewCompleted);
  const treasureUnlocked = useGameStore((s) => s.treasureUnlocked);
  const setScreen = useGameStore((s) => s.setScreen);
  const currentTopicId = useGameStore((s) => s.currentTopicId);
  const startStormChallenge = useGameStore((s) => s.startStormChallenge);
  const getCurrentMission = useGameStore((s) => s.getCurrentMission);

  const positions = [
    { x: 8, y: 58 },
    { x: 20, y: 38 },
    { x: 32, y: 58 },
    { x: 44, y: 32 },
    { x: 56, y: 52 },
    { x: 68, y: 36 },
    { x: 80, y: 56 },
    { x: 90, y: 42 },
    { x: 96, y: 28 },
  ];

  const shipPos = positions[Math.min(shipPosition, positions.length - 1)];
  const stormLevel = getStormVisualLevel(stormMeter);
  const mission = getCurrentMission();
  const currentTopic = TOPICS.find((t) => t.id === currentTopicId);

  const allTopicsDone = TOPIC_ORDER.every(
    (id) => topicProgress[id]?.masteryScore >= 70 && (topicProgress[id]?.quizAttempts.length ?? 0) > 0,
  );

  return (
    <div className="h-full flex">
      <div className="flex-1 relative overflow-hidden">
        {/* Ocean background */}
        <div
          className={`absolute inset-0 transition-all duration-1000 ${
            stormLevel === 'hurricane'
              ? 'bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3e] to-[#0d2847]'
              : stormLevel === 'storm'
                ? 'bg-gradient-to-b from-[#1a1a2e] via-[#0d2847] to-[#1a4a7a]'
                : 'bg-gradient-to-b from-[#0d2847] via-[#1a4a7a] to-[#0d3a6a]'
          }`}
        >
          {/* Waves */}
          <div className="absolute inset-0 opacity-30 wave-bg">
            <svg className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <pattern id="waves" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
                  <path d="M0 10 Q25 0 50 10 T100 10" fill="none" stroke="rgba(100,200,255,0.3)" strokeWidth="2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#waves)" />
            </svg>
          </div>

          {/* Storm clouds */}
          {stormMeter >= 20 && (
            <div className={`absolute top-4 left-1/3 text-6xl opacity-${stormMeter >= 75 ? '80' : '40'} ${stormMeter >= 75 ? 'lightning-flash' : ''}`}>
              ⛈️
            </div>
          )}
          {stormMeter >= 50 && (
            <div className="absolute top-8 right-1/4 text-4xl opacity-50">🌩️</div>
          )}

          {/* Path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d={`M ${positions.map((p) => `${p.x}% ${p.y}%`).join(' L ')}`}
              fill="none"
              stroke="rgba(100,200,255,0.4)"
              strokeWidth="3"
              strokeDasharray="8 6"
            />
            {stormActive && stormTargetTopicId && (
              <path
                d={`M ${shipPos.x}% ${shipPos.y}% L ${positions[TOPIC_ORDER.indexOf(stormTargetTopicId)]?.x}% ${positions[TOPIC_ORDER.indexOf(stormTargetTopicId)]?.y}%`}
                fill="none"
                stroke="rgba(255,50,50,0.6)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            )}
          </svg>

          {/* Islands */}
          {TOPICS.map((topic, i) => {
            const progress = topicProgress[topic.id];
            const unlocked = isTopicUnlocked(topic.id, topicProgress, TOPIC_ORDER);
            const pos = positions[i];
            return (
              <IslandNode
                key={topic.id}
                x={pos.x}
                y={pos.y}
                label={topic.nameRu}
                icon={topic.icon}
                status={progress.status === 'locked' && unlocked ? 'available' : progress.status}
                mastery={progress.masteryScore}
                order={topic.order}
                color={topic.color}
                onClick={() => {
                  useGameStore.setState({ currentTopicId: topic.id });
                  setScreen('lesson');
                }}
              />
            );
          })}

          {/* Error Bay */}
          <IslandNode
            x={positions[7].x}
            y={positions[7].y}
            label={SPECIAL_LOCATIONS.errorBay.nameRu}
            icon={SPECIAL_LOCATIONS.errorBay.icon}
            status={allTopicsDone ? 'available' : 'locked'}
            mastery={0}
            order={8}
            color="#4a3728"
            onClick={() => setScreen('error-bay')}
          />

          {/* Treasure Island */}
          <IslandNode
            x={positions[8].x}
            y={positions[8].y}
            label={SPECIAL_LOCATIONS.treasure.nameRu}
            icon={treasureUnlocked ? '💎' : '🔒'}
            status={treasureUnlocked ? 'mastered' : allTopicsDone && finalReviewCompleted ? 'available' : 'locked'}
            mastery={treasureUnlocked ? 100 : 0}
            order={9}
            color="#b8860b"
            onClick={() => setScreen('treasure')}
          />

          <Ship x={shipPos.x} y={shipPos.y} />
        </div>

        {/* Storm overlay */}
        {stormActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center z-30"
          >
            <div className="text-center p-8 bg-red-900/80 rounded-2xl border border-red-500 max-w-md">
              <div className="text-5xl mb-4 lightning-flash">⛈️</div>
              <h2 className="text-2xl font-bold text-red-200 mb-2">ШТОРМ НЕЗНАНИЯ!</h2>
              <p className="text-red-100 mb-6">
                {stormTargetTopicId && getStormMessage(stormTargetTopicId)}
              </p>
              <button
                onClick={startStormChallenge}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-white"
              >
                Пройти Storm Challenge
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Right panel - Current mission */}
      <div className="w-72 shrink-0 bg-[#0d1f3c]/95 border-l border-amber-900/30 p-4 flex flex-col">
        <h3 className="text-amber-200 font-bold mb-1">
          {currentTopic?.order}. {currentTopic?.nameRu}
        </h3>
        <p className="text-sm text-blue-300/80 mb-4">{currentTopic?.descriptionRu}</p>

        <div className="mb-4">
          <div className="text-xs text-blue-400 mb-1">Mastery Level</div>
          <div className="h-3 bg-blue-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
              style={{ width: `${topicProgress[currentTopicId]?.masteryScore ?? 0}%` }}
            />
          </div>
          <div className="text-right text-sm text-blue-300 mt-1">
            {topicProgress[currentTopicId]?.masteryScore ?? 0}%
          </div>
          <div className="text-xs text-blue-400 mt-1">
            {getMasteryLabel(getMasteryStatus(topicProgress[currentTopicId]?.masteryScore ?? 0))}
          </div>
        </div>

        <div className="bg-[#1a3050]/60 rounded-lg p-3 mb-4 border border-blue-800/30">
          <div className="text-xs text-amber-400 font-semibold mb-2">Текущая миссия</div>
          <div className="text-sm text-blue-100 mb-1">{mission.progress}</div>
          <div className="text-xs text-blue-300/80">{mission.action}</div>
        </div>

        <div className="text-xs text-blue-400 mb-4">
          Рекомендуемый XP: {currentTopic?.recommendedXp}
        </div>

        <button
          onClick={() => setScreen('lesson')}
          className="mt-auto w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-lg font-bold text-white shadow-lg transition-all"
        >
          Продолжить урок →
        </button>
      </div>
    </div>
  );
}
