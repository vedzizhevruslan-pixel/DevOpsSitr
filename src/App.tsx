import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from './components/layout/Layout';
import { VoyageMap } from './components/map/VoyageMap';
import { LessonView } from './components/lesson/LessonView';
import { QuizView } from './components/quiz/QuizView';
import { MistakesView } from './components/mistakes/MistakesView';
import { StatsView } from './components/stats/StatsView';
import { SettingsView } from './components/settings/SettingsView';
import { TreasureView } from './components/treasure/TreasureView';
import { ErrorBayView } from './components/error-bay/ErrorBayView';
import { AchievementsView } from './components/achievements/AchievementsView';
import { QuestsView, LegendaryView } from './components/quests/QuestsView';
import { useGameStore } from './stores/playerStore';
import { ACHIEVEMENTS } from './data/achievements';

function XpPopup() {
  const xpAnimation = useGameStore((s) => s.xpAnimation);
  if (!xpAnimation) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: -40 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => useGameStore.setState({ xpAnimation: null })}
      className="fixed top-24 right-8 z-50 text-amber-400 font-bold text-xl pointer-events-none"
    >
      +{xpAnimation} XP
    </motion.div>
  );
}

function AchievementPopup() {
  const popup = useGameStore((s) => s.achievementPopup);
  if (!popup) return null;
  const ach = ACHIEVEMENTS.find((a) => a.id === popup);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={() => useGameStore.setState({ achievementPopup: null })}
    >
      <div className="bg-gradient-to-br from-amber-900 to-amber-700 border-2 border-amber-400 rounded-2xl p-8 text-center max-w-sm mx-4">
        <div className="text-5xl mb-4">{ach?.icon || '🏆'}</div>
        <h3 className="text-xl font-bold text-amber-100 mb-2">Достижение!</h3>
        <p className="text-amber-200">{ach?.titleRu || 'Legendary DevOps Captain'}</p>
        <button className="mt-4 text-sm text-amber-300/70">Нажми чтобы закрыть</button>
      </div>
    </motion.div>
  );
}

function ScreenRouter() {
  const screen = useGameStore((s) => s.currentScreen);

  const screens: Record<string, React.ReactNode> = {
    map: <VoyageMap />,
    lesson: <LessonView />,
    practice: <LessonView />,
    quiz: <QuizView />,
    mistakes: <MistakesView />,
    stats: <StatsView />,
    settings: <SettingsView />,
    treasure: <TreasureView />,
    'error-bay': <ErrorBayView />,
    'final-review': <QuizView />,
    'storm-challenge': <QuizView />,
    achievements: <AchievementsView />,
    quests: <QuestsView />,
    legendary: <LegendaryView />,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-full"
      >
        {screens[screen] || <VoyageMap />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Layout>
      <ScreenRouter />
      <XpPopup />
      <AchievementPopup />
    </Layout>
  );
}
