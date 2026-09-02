import { motion } from 'framer-motion';
import { Lock, Check, Star, AlertTriangle } from 'lucide-react';
import type { IslandStatus, TopicId } from '../../types';
import { pirateAssets } from '../../config/assetManifest';
import { MAP_Z, type MapWaypoint } from '../../config/mapConfig';
import { AssetImage } from '../ui/AssetImage';
import { useMapDebug } from './mapDebugStore';

interface IslandNodeProps {
  waypoint: MapWaypoint;
  status: IslandStatus;
  mastery: number;
  mistakesCount: number;
  resolvedCount: number;
  onClick: () => void;
  isCurrent: boolean;
}

export function IslandNode({
  waypoint,
  status,
  mastery,
  mistakesCount,
  resolvedCount,
  onClick,
  isCurrent,
}: IslandNodeProps) {
  const assetSrc = pirateAssets.islands[waypoint.assetKey];
  const size = waypoint.baseSize * waypoint.scale;
  const locked = status === 'locked';
  const showBounds = useMapDebug((s) => s.showAssetBounds);

  const filter =
    locked
      ? 'saturate(0.45) brightness(0.72)'
      : status === 'weak' || status === 'needs_repair'
        ? 'saturate(1.05) brightness(1.02)'
        : undefined;

  return (
    <div
      className="absolute"
      style={{
        left: `${waypoint.x}%`,
        top: `${waypoint.y}%`,
        width: size,
        zIndex: isCurrent ? MAP_Z.islandLabels : MAP_Z.islands,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <motion.button
        type="button"
        className={`relative group text-left bg-transparent border-0 p-0 cursor-pointer disabled:cursor-not-allowed appearance-none w-full ${
          showBounds ? 'outline outline-1 outline-fuchsia-400/80' : ''
        }`}
        style={{
          outline: 'none',
          boxShadow: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        onClick={onClick}
        disabled={locked}
        whileHover={locked ? {} : { y: -5, scale: 1.03 }}
        whileTap={locked ? {} : { scale: 0.98 }}
      >
      <div
        className="relative mx-auto"
        style={{ width: size, height: size * 0.78 }}
      >
        {/* Soft glow for current island — not a rectangle frame */}
        {isCurrent && (
          <>
            <div
              className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-[78%] h-[42%] rounded-[50%] bg-amber-400/25 blur-xl pointer-events-none animate-pulse"
              aria-hidden
            />
            <div
              className="absolute left-1/2 bottom-[8%] -translate-x-1/2 w-[55%] h-3 rounded-full bg-amber-300/35 blur-md pointer-events-none"
              aria-hidden
            />
          </>
        )}

        <AssetImage
          src={assetSrc}
          alt={waypoint.labelRu}
          className="w-full h-full object-contain drop-shadow-xl relative z-[1]"
          style={{ filter }}
          fallback={<span className="text-4xl">🏝️</span>}
        />

        {locked && (
          <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 z-[2] flex items-center justify-center w-8 h-8 rounded-full bg-black/50 border border-white/25 shadow-md backdrop-blur-[1px]">
            <Lock className="text-white/90" size={15} />
          </div>
        )}

        {isCurrent && !locked && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-[3] px-2 py-0.5 rounded-full bg-amber-400 text-[9px] font-bold tracking-wide text-[#1a1008] shadow-md whitespace-nowrap">
            ТЕКУЩАЯ
          </div>
        )}

        {status === 'mastered' && (
          <Star className="absolute -top-1 -right-1 text-amber-400 fill-amber-400 z-[2]" size={16} />
        )}
        {(status === 'completed' || status === 'mastered') && (
          <Check
            className="absolute bottom-1 right-1 text-emerald-300 bg-black/45 rounded-full p-0.5 z-[2]"
            size={14}
          />
        )}
        {(status === 'weak' || status === 'needs_repair') && (
          <AlertTriangle
            className="absolute -top-1 left-1/2 -translate-x-1/2 text-orange-400 z-[2]"
            size={14}
          />
        )}

        {/* Pulsing route marker under island when current */}
        {isCurrent && (
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)] animate-pulse z-[2]" />
        )}
      </div>

      <div className="pointer-events-none text-center mt-1 px-1 min-w-0">
        <div
          className={`inline-block max-w-full text-[11px] font-display font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
            locked
              ? 'text-cyan-100/70'
              : 'text-parchment bg-black/35'
          }`}
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
        >
          {waypoint.labelRu}
        </div>
        {mastery > 0 && !locked && (
          <div className="text-[10px] text-cyan-200/90">{mastery}% Mastery</div>
        )}
        {mistakesCount > 0 && !locked && (
          <div className="text-[9px] text-orange-300">
            {resolvedCount}/{mistakesCount} исправлено
          </div>
        )}
      </div>
      </motion.button>
    </div>
  );
}

export function getIslandStatusForTopic(
  _topicId: TopicId,
  progress: {
    masteryScore: number;
    quizAttempts: { length: number };
    chaptersCompleted: { length: number };
    status: IslandStatus;
  },
  unlocked: boolean,
): IslandStatus {
  if (!unlocked) return 'locked';
  if (progress.status === 'needs_repair') return 'needs_repair';
  if (progress.masteryScore >= 90) return 'mastered';
  if (progress.masteryScore >= 70 && progress.quizAttempts.length > 0) return 'completed';
  if (progress.masteryScore > 0 && progress.masteryScore < 50) return 'weak';
  if (progress.chaptersCompleted.length > 0 || progress.quizAttempts.length > 0) return 'in_progress';
  return unlocked ? 'available' : 'locked';
}
