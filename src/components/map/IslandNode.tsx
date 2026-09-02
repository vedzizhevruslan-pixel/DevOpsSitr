import { motion } from 'framer-motion';
import { Lock, Check, Star, AlertTriangle } from 'lucide-react';
import type { IslandStatus, TopicId } from '../../types';
import { pirateAssets } from '../../config/assetManifest';
import { AssetImage } from '../ui/AssetImage';
import type { MapWaypoint } from '../../config/mapConfig';

interface IslandNodeProps {
  waypoint: MapWaypoint;
  status: IslandStatus;
  mastery: number;
  mistakesCount: number;
  resolvedCount: number;
  onClick: () => void;
  isCurrent: boolean;
}

const STATUS_STYLES: Record<IslandStatus, string> = {
  locked: 'opacity-50 saturate-50',
  available: '',
  in_progress: 'ring-2 ring-cyan-400/60',
  completed: 'ring-2 ring-emerald-500/50',
  weak: 'ring-2 ring-orange-500/70',
  mastered: 'ring-2 ring-amber-400/80 shadow-lg shadow-amber-500/20',
  needs_repair: 'ring-2 ring-red-500 animate-pulse',
};

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
  const size = 110 * waypoint.scale;
  const locked = status === 'locked';

  return (
    <motion.button
      type="button"
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 group text-left ${STATUS_STYLES[status]}`}
      style={{ left: `${waypoint.x}%`, top: `${waypoint.y}%`, width: size, zIndex: isCurrent ? 15 : 10 }}
      onClick={onClick}
      disabled={locked}
      whileHover={locked ? {} : { y: -6, scale: 1.03 }}
      whileTap={locked ? {} : { scale: 0.97 }}
    >
      <div className="relative mx-auto" style={{ width: size, height: size * 0.75 }}>
        <AssetImage
          src={assetSrc}
          alt={waypoint.labelRu}
          className="w-full h-full object-contain drop-shadow-xl"
          fallback={<span className="text-4xl">🏝️</span>}
        />
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
            <Lock className="text-white/80" size={24} />
          </div>
        )}
        {status === 'mastered' && (
          <Star className="absolute -top-2 -right-2 text-amber-400 fill-amber-400" size={18} />
        )}
        {(status === 'completed' || status === 'mastered') && (
          <Check className="absolute -bottom-1 -right-1 text-emerald-400 bg-black/50 rounded-full p-0.5" size={16} />
        )}
        {(status === 'weak' || status === 'needs_repair') && (
          <AlertTriangle className="absolute -top-2 left-1/2 -translate-x-1/2 text-orange-400" size={16} />
        )}
        {isCurrent && status === 'in_progress' && (
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/60 animate-pulse" />
        )}
      </div>

      <div className="mt-1 text-center min-w-[90px]">
        <div
          className={`text-[11px] font-display font-bold uppercase tracking-wide ${
            locked ? 'text-blue-400/50' : 'text-parchment drop-shadow-md'
          }`}
        >
          {waypoint.labelRu}
        </div>
        {mastery > 0 && (
          <div className="text-[10px] text-cyan-300/90">{mastery}% Mastery</div>
        )}
        {mistakesCount > 0 && (
          <div className="text-[9px] text-orange-300">
            {resolvedCount}/{mistakesCount} исправлено
          </div>
        )}
      </div>

      <div className="absolute left-full ml-2 top-0 w-44 p-2 rounded-lg bg-[#0d1f3c]/95 border border-cyan-800/40 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-30 hidden lg:block">
        <div className="text-xs font-bold text-amber-200">{waypoint.labelRu}</div>
        {mastery > 0 && (
          <div className="h-1.5 bg-blue-950 rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-cyan-500" style={{ width: `${mastery}%` }} />
          </div>
        )}
      </div>
    </motion.button>
  );
}

export function getIslandStatusForTopic(
  _topicId: TopicId,
  progress: { masteryScore: number; quizAttempts: { length: number }; chaptersCompleted: { length: number }; status: IslandStatus },
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
