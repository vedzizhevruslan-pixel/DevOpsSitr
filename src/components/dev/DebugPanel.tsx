import { useState } from 'react';
import { useGameStore } from '../../stores/playerStore';
import { TOPIC_ORDER } from '../../data/topics';
import { waypointToProgress } from '../../config/mapConfig';
import type { TopicId } from '../../types';
import { useMapDebug } from '../map/mapDebugStore';
import { getLessons, getPractice } from '../../data/lessons';

export function DebugPanel() {
  const [open, setOpen] = useState(false);
  if (!import.meta.env.DEV) return null;

  const state = useGameStore();
  const showAssetBounds = useMapDebug((s) => s.showAssetBounds);
  const toggleAssetBounds = useMapDebug((s) => s.toggleAssetBounds);

  const actions = {
    setXp: (xp: number) => useGameStore.setState({ xp }),
    setMastery: (topicId: TopicId, score: number) => {
      const tp = { ...state.topicProgress[topicId], masteryScore: score };
      useGameStore.setState({ topicProgress: { ...state.topicProgress, [topicId]: tp } });
    },
    triggerStorm: () => useGameStore.getState().triggerStorm(),
    jumpToIsland: (idx: number) => {
      const topicId = TOPIC_ORDER[idx];
      if (topicId) {
        useGameStore.setState({
          currentTopicId: topicId,
          shipProgress: waypointToProgress(idx),
          shipPosition: idx,
        });
      }
    },
    completeTopic: (topicId: TopicId) => {
      const p = {
        ...state.topicProgress[topicId],
        masteryScore: 85,
        lastQuizScore: 85,
        bestQuizScore: 85,
        status: 'completed' as const,
        quizAttempts: [{ id: 'debug', date: new Date().toISOString(), score: 8, total: 10, questionIds: [] }],
        chaptersCompleted: getLessons(topicId).map((c) => c.id),
        practiceCompleted: getPractice(topicId).map((p) => p.id),
      };
      useGameStore.setState({ topicProgress: { ...state.topicProgress, [topicId]: p } });
    },
    addFakeMistake: () => {
      useGameStore.setState({
        mistakes: [
          ...state.mistakes,
          {
            questionId: `debug-${Date.now()}`,
            topicId: 'linux',
            skillTag: 'diagnostics',
            question: 'Debug mistake question',
            selectedAnswer: 'wrong',
            correctAnswer: 'right',
            explanation: 'Debug',
            wrongCount: 1,
            correctAfterMistakeCount: 0,
            reviewAttempts: 0,
            firstMistakeAt: new Date().toISOString(),
            lastMistakeAt: new Date().toISOString(),
            resolved: false,
          },
        ],
      });
    },
    openErrorBay: () => useGameStore.setState({ currentScreen: 'error-bay' }),
    unlockPrereqs: () => {
      TOPIC_ORDER.forEach((id) => actions.completeTopic(id));
      useGameStore.setState({ finalReviewCompleted: true, shipProgress: 1 });
    },
    reset: () => useGameStore.getState().resetProgress(),
  };

  return (
    <>
      {/* Closed state: only a compact button — no panel remnant */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 left-4 z-[100] px-2 py-1 bg-purple-900/80 border border-purple-500 rounded text-xs text-purple-200 shadow-lg"
      >
        {open ? '✕ DEBUG' : 'DEBUG'}
      </button>

      {open && (
        <div className="fixed bottom-12 left-4 z-[100] w-64 max-h-[70vh] overflow-y-auto bg-black/95 border border-purple-500 rounded-lg p-3 text-xs space-y-2 shadow-2xl">
          <div className="font-bold text-purple-300">Dev Panel</div>
          <label className="flex items-center gap-2 text-purple-100 cursor-pointer py-1">
            <input type="checkbox" checked={showAssetBounds} onChange={toggleAssetBounds} />
            Show Asset Bounds
          </label>
          <button type="button" className="block w-full text-left hover:text-amber-300" onClick={() => actions.setXp(4000)}>
            Set XP 4000
          </button>
          <button
            type="button"
            className="block w-full text-left hover:text-amber-300"
            onClick={() => actions.setMastery('networks', 45)}
          >
            Networks Mastery 45%
          </button>
          <button type="button" className="block w-full text-left hover:text-amber-300" onClick={() => actions.triggerStorm()}>
            Trigger Storm
          </button>
          <button type="button" className="block w-full text-left hover:text-amber-300" onClick={() => actions.jumpToIsland(4)}>
            Jump to Docker
          </button>
          <button type="button" className="block w-full text-left hover:text-amber-300" onClick={() => actions.completeTopic('linux')}>
            Complete Linux
          </button>
          <button type="button" className="block w-full text-left hover:text-amber-300" onClick={actions.addFakeMistake}>
            Add Fake Mistake
          </button>
          <button type="button" className="block w-full text-left hover:text-amber-300" onClick={actions.openErrorBay}>
            Open Error Bay
          </button>
          <button type="button" className="block w-full text-left hover:text-amber-300" onClick={actions.unlockPrereqs}>
            Unlock Treasure prereqs
          </button>
          <button type="button" className="block w-full text-left text-red-400" onClick={actions.reset}>
            Reset
          </button>
        </div>
      )}
    </>
  );
}
