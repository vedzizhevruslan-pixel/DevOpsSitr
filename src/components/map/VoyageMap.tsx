import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MAP_LAYOUT, MAP_WAYPOINTS, MAP_Z } from '../../config/mapConfig';
import { pirateAssets, getAllAssetUrls } from '../../config/assetManifest';
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
import { MapDecorations } from './MapDecorations';
import type { TopicId } from '../../types';

function StormEffects({ level }: { level: ReturnType<typeof getStormVisualLevel> }) {
  if (level === 'calm') return null;
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: MAP_Z.weather }}>
      <div
        className={`absolute inset-0 ${
          level === 'hurricane' ? 'bg-black/45' : level === 'storm' ? 'bg-black/30' : 'bg-black/12'
        }`}
      />
      {level !== 'clouds' && (
        <AssetImage
          src={pirateAssets.storm}
          alt="Storm"
          className="absolute top-[10%] left-[42%] w-28 h-28 opacity-70 lightning-flash"
          fallback={<span className="absolute top-[10%] left-[42%] text-5xl lightning-flash">⛈️</span>}
        />
      )}
    </div>
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
  const currentTopicId = useGameStore((s) => s.currentTopicId);

  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    preloadAssets(getAllAssetUrls());
    const t = setTimeout(() => setMapReady(true), 500);
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

  const { inset } = MAP_LAYOUT;

  const stormRetreatLine =
    stormActive && stormTargetTopicId && preStormProgress !== null
      ? (() => {
          const from = getPositionOnRoute(preStormProgress);
          const to = getPositionOnRoute(shipProgress);
          return (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: MAP_Z.route }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(239,68,68,0.55)"
                strokeWidth="0.45"
                strokeDasharray="1 0.8"
              />
            </svg>
          );
        })()
      : null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Full-bleed ocean */}
      <div className="absolute inset-0" style={{ zIndex: MAP_Z.ocean }}>
        <AssetImage
          src={pirateAssets.ocean}
          alt="Ocean"
          className="w-full h-full object-cover scale-105 wave-bg"
          fallback={null}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/25 via-transparent to-[#0a1628]/45" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.32)_100%)]" />
        {/* Soft top fade — hides any baked horizon fragments / edge artifacts */}
        <div className="absolute inset-x-0 top-0 h-[7%] bg-gradient-to-b from-[#0a1628]/55 to-transparent pointer-events-none" />
      </div>

      {/* Playfield — safe area, keeps islands/route/ship clear of mission panel & edges */}
      <div
        className="absolute"
        style={{
          top: `${inset.top}%`,
          left: `${inset.left}%`,
          right: `${inset.right}%`,
          bottom: `${inset.bottom}%`,
          zIndex: MAP_Z.atmosphere,
        }}
      >
        <MapDecorations />
        <RouteLayer shipProgress={shipProgress} />
        {stormRetreatLine}

        {MAP_WAYPOINTS.map((waypoint) => {
          if (waypoint.id === 'error-bay') {
            const locked = !allTopicsDone;
            return (
              <IslandNode
                key={waypoint.id}
                waypoint={waypoint}
                status={locked ? 'locked' : finalReviewCompleted ? 'completed' : 'available'}
                mastery={0}
                mistakesCount={mistakes.filter((m) => !m.resolved).length}
                resolvedCount={mistakes.filter((m) => m.resolved).length}
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
              isCurrent={currentTopicId === topicId}
            />
          );
        })}

        <ShipSprite progress={shipProgress} animating={shipAnimating} />
        <StormEffects level={stormLevel} />
      </div>

      <CurrentMissionPanel />

      <AnimatePresence>
        {stormOverlay && stormTargetTopicId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            style={{ zIndex: MAP_Z.modal }}
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
