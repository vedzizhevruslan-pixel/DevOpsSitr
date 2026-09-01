import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/playerStore';
import { getTopicById } from '../../data/topics';
import { getMasteryStatus, getMasteryLabel } from '../../config/gameConfig';

export function CurrentMissionPanel() {
  const currentTopicId = useGameStore((s) => s.currentTopicId);
  const topicProgress = useGameStore((s) => s.topicProgress);
  const getCurrentMission = useGameStore((s) => s.getCurrentMission);
  const setScreen = useGameStore((s) => s.setScreen);

  const topic = getTopicById(currentTopicId);
  const progress = topicProgress[currentTopicId];
  const mission = getCurrentMission();

  if (!topic || !progress) return null;

  return (
    <motion.aside
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute right-4 top-4 bottom-4 w-64 z-30 flex flex-col pointer-events-auto"
    >
      <div className="bg-[#0d1f3c]/90 backdrop-blur-md border border-amber-800/30 rounded-xl p-4 flex flex-col h-full shadow-2xl">
        <div className="text-[10px] uppercase tracking-widest text-amber-500/80 mb-1">Текущая миссия</div>
        <h3 className="font-display font-bold text-parchment text-lg leading-tight">
          {topic.order}. {topic.nameRu.toUpperCase()}
        </h3>
        <p className="text-xs text-cyan-300/70 mt-1 line-clamp-2">{topic.descriptionRu}</p>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-cyan-400 mb-1">
            <span>Mastery</span>
            <span>{progress.masteryScore}%</span>
          </div>
          <div className="h-2 bg-blue-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-500"
              style={{ width: `${progress.masteryScore}%` }}
            />
          </div>
          <div className="text-[10px] text-cyan-500/80 mt-1">
            {getMasteryLabel(getMasteryStatus(progress.masteryScore))}
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-black/25 border border-cyan-900/30">
          <div className="text-xs text-blue-300">{mission.progress}</div>
          <div className="text-sm text-parchment mt-1">{mission.action}</div>
        </div>

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={() => setScreen('lesson')}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-700 to-teal-600 hover:from-cyan-600 hover:to-teal-500 rounded-lg font-semibold text-white text-sm shadow-lg transition-all"
          >
            Продолжить →
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
