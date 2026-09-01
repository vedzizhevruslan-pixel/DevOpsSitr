import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Gamepad2, ClipboardCheck } from 'lucide-react';
import { useGameStore } from '../../stores/playerStore';
import { getLessons, getPractice } from '../../data/lessons';
import { getTopicById } from '../../data/topics';
import { PracticeView } from './PracticeView';

type Tab = 'theory' | 'practice' | 'quiz';

export function LessonView() {
  const currentTopicId = useGameStore((s) => s.currentTopicId);
  const topicProgress = useGameStore((s) => s.topicProgress);
  const completeChapter = useGameStore((s) => s.completeChapter);
  const startQuiz = useGameStore((s) => s.startQuiz);
  const setScreen = useGameStore((s) => s.setScreen);

  const [tab, setTab] = useState<Tab>('theory');
  const [chapterIndex, setChapterIndex] = useState(0);

  const topic = getTopicById(currentTopicId);
  const lessons = getLessons(currentTopicId);
  const practice = getPractice(currentTopicId);
  const progress = topicProgress[currentTopicId];
  const currentChapter = lessons[chapterIndex];

  if (!topic) return null;

  const allChaptersDone = lessons.every((l) => progress.chaptersCompleted.includes(l.id));
  const allPracticeDone = practice.every((p) => progress.practiceCompleted.includes(p.id));

  return (
    <div className="h-full flex flex-col p-6 max-w-4xl mx-auto">
      <button
        onClick={() => setScreen('map')}
        className="flex items-center gap-2 text-blue-300 hover:text-blue-100 mb-4 text-sm"
      >
        <ArrowLeft size={16} /> Назад к карте
      </button>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{topic.icon}</span>
        <div>
          <h2 className="text-2xl font-bold text-amber-100">{topic.nameRu}</h2>
          <p className="text-blue-300/80">{topic.descriptionRu}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'theory' as Tab, label: 'Теория', icon: BookOpen, count: `${progress.chaptersCompleted.length}/${lessons.length}` },
          { id: 'practice' as Tab, label: 'Практика', icon: Gamepad2, count: `${progress.practiceCompleted.length}/${practice.length}` },
          { id: 'quiz' as Tab, label: 'Квиз', icon: ClipboardCheck, count: progress.quizAttempts.length > 0 ? `${progress.lastQuizScore}%` : '—' },
        ].map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
              tab === id
                ? 'bg-amber-700/50 text-amber-100 border border-amber-600/50'
                : 'bg-blue-900/30 text-blue-300 hover:bg-blue-800/40'
            }`}
          >
            <Icon size={16} />
            {label}
            <span className="text-xs opacity-70">({count})</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'theory' && currentChapter && (
          <motion.div
            key={currentChapter.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            <div className="bg-gradient-to-br from-amber-100/10 to-amber-900/10 border border-amber-700/30 rounded-xl p-6 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-amber-400">
                    Глава {chapterIndex + 1}/{lessons.length} · {currentChapter.duration}
                  </span>
                  <h3 className="text-xl font-bold text-amber-100 mt-1">{currentChapter.title}</h3>
                </div>
                {progress.chaptersCompleted.includes(currentChapter.id) && (
                  <span className="text-green-400 text-sm">✓ Пройдено</span>
                )}
              </div>
              <p className="text-blue-100/90 leading-relaxed mb-4">{currentChapter.content}</p>
              {currentChapter.commands && (
                <div className="bg-black/40 rounded-lg p-4 mb-4 font-mono text-sm">
                  {currentChapter.commands.map((cmd) => (
                    <div key={cmd} className="text-green-400">
                      <span className="text-blue-400">$ </span>
                      {cmd}
                    </div>
                  ))}
                </div>
              )}
              {currentChapter.tips && (
                <div className="mb-4">
                  <div className="text-xs text-amber-400 font-semibold mb-2">💡 Важно</div>
                  <ul className="text-sm text-blue-200/80 space-y-1">
                    {currentChapter.tips.map((tip) => (
                      <li key={tip}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
              {currentChapter.mistakes && (
                <div>
                  <div className="text-xs text-red-400 font-semibold mb-2">⚠️ Типичные ошибки</div>
                  <ul className="text-sm text-red-200/70 space-y-1">
                    {currentChapter.mistakes.map((m) => (
                      <li key={m}>• {m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setChapterIndex(Math.max(0, chapterIndex - 1))}
                disabled={chapterIndex === 0}
                className="px-4 py-2 text-blue-300 disabled:opacity-30"
              >
                ← Назад
              </button>
              <button
                onClick={() => {
                  completeChapter(currentTopicId, currentChapter.id);
                  if (chapterIndex < lessons.length - 1) {
                    setChapterIndex(chapterIndex + 1);
                  }
                }}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold text-white"
              >
                {progress.chaptersCompleted.includes(currentChapter.id) ? 'Далее →' : 'Понятно → +10 XP'}
              </button>
            </div>
          </motion.div>
        )}

        {tab === 'practice' && (
          <motion.div key="practice" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PracticeView
              topicId={currentTopicId}
              exercises={practice}
              completed={progress.practiceCompleted}
            />
          </motion.div>
        )}

        {tab === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            {!allChaptersDone ? (
              <p className="text-blue-300">Сначала пройди все главы теории ({progress.chaptersCompleted.length}/{lessons.length})</p>
            ) : !allPracticeDone ? (
              <p className="text-blue-300">Сначала заверши практику ({progress.practiceCompleted.length}/{practice.length})</p>
            ) : (
              <div>
                <p className="text-blue-200 mb-4">
                  Контрольный тест: 10 вопросов. Нужно ≥70% для открытия следующего острова.
                </p>
                {progress.quizAttempts.length > 0 && (
                  <p className="text-sm text-blue-400 mb-4">
                    Лучший результат: {progress.bestQuizScore}% · Последний: {progress.lastQuizScore}%
                  </p>
                )}
                <button
                  onClick={() => startQuiz(currentTopicId)}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-bold text-white"
                >
                  Начать квиз
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
