import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MAP_WAYPOINTS } from '../../config/mapConfig';
import { pirateAssets } from '../../config/assetManifest';
import { TOPIC_ORDER } from '../../data/topics';
import { isTopicUnlocked } from '../../engines/masteryEngine';
import { getStormVisualLevel, getStormMessage } from '../../engines/stormEngine';
import { getPositionOnRoute } from '../../engines/routeEngine';
import { useGameStore } from '../../stores/playerStore';
import { AssetImage, preloadAssets } from '../ui/AssetImage';
import { RouteLayer } from './RouteLayer';
import { IslandNode, getIslandStatusForTopic } from './IslandNode';
import { ShipSprite } from './ShipSprite';
import { CurrentMissionPanel } from './CurrentMissionPanel';
import type { TopicId } from '../../types';

function StormEffects({ level }: { level: ReturnType<typeof getStormVisualLevel> }) {
  if (level === 'calm') return null;
  return (
    <>
      <div
        className={`absolute inset-0 pointer-events-none ${
          level === 'hurricane' ? 'bg-black/50' : level === 'storm' ? 'bg-black/35' : 'bg-black/15'
        }`}
      />
      {level !== 'clouds' && (
        <AssetImage
          src={pirateAssets.storm}
          alt="Storm"
          className="absolute top-[8%] left-[40%] w-32 h-32 opacity-70 lightning-flash pointer-events-none"
          fallback={<span className="absolute top-[8%] left-[40%] text-6xl lightning-flash">⛈️</span>}
        />
      )}
      {level === 'hurricane' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-8 bg-cyan-200/20 animate-pulse"
              style={{ left: `${(i * 5) % 100}%`, top: `${(i * 7) % 40}%`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}
    </>
  );
}

export function VoyageMap() {
  const topicProgress = useGameStore((s) => s.topicProgress);
  const shipProgress = useGameStore((s) => s.shipProgress);
  const shipAnimating = useGameStore((s) => s.shipAnimating);
  const stormMeter = useGameStore((s) => s.stormMeter);
  const stormActive = useGameStore((s) => s.stormActive);
  const stormOverlay = useGameStore((s) => s.stormOverlay);
  const stormTargetTopicId = useGameStore((s) => s.stormTargetTopicId);
  const preStormProgress = useGameStore((s) => s.preStormProgress);
  const mistakes = useGameStore((s) => s.mistakes);
  const finalReviewCompleted = useGameStore((s) => s.finalReviewCompleted);
  const treasureUnlocked = useGameStore((s) => s.treasureUnlocked);
  const setScreen = useGameStore((s) => s.setScreen);
  const startStormChallenge = useGameStore((s) => s.startStormChallenge);

  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    preloadAssets([
      pirateAssets.ocean,
      pirateAssets.ship,
      ...Object.values(pirateAssets.islands),
    ]);
    const t = setTimeout(() => setMapReady(true), 400);
    return () => clearTimeout(t);
  }, []);

  const stormLevel = getStormVisualLevel(stormMeter);
  const allTopicsDone = TOPIC_ORDER.every(
    (id) =>
      (topicProgress[id]?.masteryScore ?? 0) >= 70 &&
      (topicProgress[id]?.quizAttempts.length ?? 0) > 0,
  );

  const handleIslandClick = (topicId?: TopicId, special?: 'error-bay' | 'treasure') => {
    if (special === 'error-bay') {
      setScreen('error-bay');
      return;
    }
    if (special === 'treasure') {
      setScreen('treasure');
      return;
    }
    if (topicId) {
      useGameStore.setState({ currentTopicId: topicId });
      setScreen('lesson');
    }
  };

  if (!mapReady) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a1628]">
        <div className="text-center">
          <div className="text-cyan-400 animate-pulse mb-2">Разворачиваем карту...</div>
          <div className="w-48 h-1 bg-blue-950 rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-cyan-500"
              animate={{ width: ['0%', '100%'] }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>
    );
  }

  const stormRetreatLine =
    stormActive && stormTargetTopicId && preStormProgress !== null
      ? (() => {
          const from = getPositionOnRoute(preStormProgress);
          const to = getPositionOnRoute(shipProgress);
          return (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-15" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(239,68,68,0.6)"
                strokeWidth="0.4"
                strokeDasharray="1 0.8"
              />
            </svg>
          );
        })()
      : null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0">
        <AssetImage
          src={pirateAssets.ocean}
          alt="Ocean"
          className="w-full h-full object-cover"
          fallback={null}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/30 via-transparent to-[#0a1628]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.45)_100%)]" />
      </div>

      <RouteLayer shipProgress={shipProgress} />
      {stormRetreatLine}

      {MAP_WAYPOINTS.map((waypoint) => {
        if (waypoint.id === 'error-bay') {
          const locked = !allTopicsDone;
          const topicMistakes = mistakes;
          return (
            <IslandNode
              key={waypoint.id}
              waypoint={waypoint}
              status={locked ? 'locked' : finalReviewCompleted ? 'completed' : 'available'}
              mastery={0}
              mistakesCount={topicMistakes.filter((m) => !m.resolved).length}
              resolvedCount={topicMistakes.filter((m) => m.resolved).length}
              onClick={() => !locked && handleIslandClick(undefined, 'error-bay')}
              isCurrent={false}
            />
          );
        }
        if (waypoint.id === 'treasure') {
          const locked = !allTopicsDone || !finalReviewCompleted;
          return (
            <IslandNode
              key={waypoint.id}
              waypoint={waypoint}
              status={treasureUnlocked ? 'mastered' : locked ? 'locked' : 'available'}
              mastery={treasureUnlocked ? 100 : 0}
              mistakesCount={0}
              resolvedCount={0}
              onClick={() => handleIslandClick(undefined, 'treasure')}
              isCurrent={false}
            />
          );
        }

        const topicId = waypoint.topicId!;
        const progress = topicProgress[topicId];
        const unlocked = isTopicUnlocked(topicId, topicProgress, TOPIC_ORDER);
        const status = getIslandStatusForTopic(topicId, progress, unlocked);
        const topicMistakes = mistakes.filter((m) => m.topicId === topicId);

        return (
          <IslandNode
            key={waypoint.id}
            waypoint={waypoint}
            status={status}
            mastery={progress.masteryScore}
            mistakesCount={topicMistakes.length}
            resolvedCount={topicMistakes.filter((m) => m.resolved).length}
            onClick={() => unlocked && handleIslandClick(topicId)}
            isCurrent={useGameStore.getState().currentTopicId === topicId}
          />
        );
      })}

      <ShipSprite progress={shipProgress} animating={shipAnimating} />
      <StormEffects level={stormLevel} />
      <CurrentMissionPanel />

      <AnimatePresence>
        {stormOverlay && stormTargetTopicId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center p-8 max-w-md mx-4 bg-red-950/80 border-2 border-red-600/60 rounded-2xl shadow-2xl"
            >
              <AssetImage
                src={pirateAssets.storm}
                alt="Storm"
                className="w-24 h-24 mx-auto mb-4 lightning-flash"
                fallback={<span className="text-6xl lightning-flash block mb-4">⛈️</span>}
              />
              <h2 className="text-2xl font-display font-bold text-red-200 mb-3 tracking-wide">
                ШТОРМ НЕЗНАНИЯ
              </h2>
              <p className="text-red-100/90 mb-6">{getStormMessage(stormTargetTopicId)}</p>
              <button
                type="button"
                onClick={startStormChallenge}
                className="px-8 py-3 bg-red-700 hover:bg-red-600 rounded-lg font-bold text-white"
              >
                Пройти Storm Challenge
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
