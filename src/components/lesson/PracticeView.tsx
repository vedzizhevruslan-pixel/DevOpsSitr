import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PracticeExercise, TopicId } from '../../types';
import { useGameStore } from '../../stores/playerStore';

export function PracticeView({
  topicId,
  exercises,
  completed,
}: {
  topicId: TopicId;
  exercises: PracticeExercise[];
  completed: string[];
}) {
  const completePractice = useGameStore((s) => s.completePractice);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);

  const exercise = exercises[currentIdx];
  if (!exercise) return <p className="text-blue-300">Практика завершена!</p>;

  const isDone = completed.includes(exercise.id);

  const handleSubmit = () => {
    if (!selected) return;
    const correct = selected === exercise.correctAnswer;
    setFeedback({ correct, explanation: exercise.explanation });
    if (correct && !isDone) {
      completePractice(topicId, exercise.id);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setFeedback(null);
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const isTerminal = exercise.type === 'terminal';

  return (
    <div className="max-w-2xl">
      <div className="text-sm text-amber-400 mb-2">
        Упражнение {currentIdx + 1}/{exercises.length}
        {isDone && <span className="text-green-400 ml-2">✓</span>}
      </div>
      <h3 className="text-lg font-bold text-amber-100 mb-1">{exercise.title}</h3>
      <p className="text-blue-300/80 mb-4">{exercise.description}</p>

      <div
        className={`rounded-xl p-6 mb-4 ${
          isTerminal
            ? 'bg-black/80 border border-green-900/50 font-mono'
            : 'bg-[#1a3050]/60 border border-blue-800/30'
        }`}
      >
        {isTerminal ? (
          <div>
            <div className="text-green-400 text-sm mb-2">pirate@cave:~$</div>
            <div className="text-white text-lg">{exercise.prompt}</div>
          </div>
        ) : (
          <p className="text-blue-100">{exercise.prompt}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {exercise.options?.map((opt) => (
          <button
            key={opt}
            onClick={() => !feedback && setSelected(opt)}
            disabled={!!feedback}
            className={`p-3 rounded-lg text-left text-sm transition-all ${
              feedback
                ? opt === exercise.correctAnswer
                  ? 'bg-green-900/50 border border-green-500 text-green-200'
                  : selected === opt
                    ? 'bg-red-900/50 border border-red-500 text-red-200'
                    : 'bg-blue-900/20 text-blue-400/50'
                : selected === opt
                  ? 'bg-amber-700/40 border border-amber-500 text-amber-100'
                  : 'bg-blue-900/30 border border-blue-700/30 text-blue-200 hover:bg-blue-800/40'
            }`}
          >
            {isTerminal && <span className="text-green-500">$ </span>}
            {opt}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-4 ${feedback.correct ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}
          >
            <div className="font-semibold mb-2">{feedback.correct ? '✅ Верно!' : '❌ Неверно'}</div>
            {!feedback.correct && (
              <div className="text-sm mb-2">
                <div className="text-red-300">Ваш ответ: {selected}</div>
                <div className="text-green-300">Правильно: {exercise.correctAnswer}</div>
              </div>
            )}
            <p className="text-sm text-blue-200/80">{feedback.explanation}</p>
            <button
              onClick={handleNext}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm text-white"
            >
              Понятно →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!feedback && (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="px-6 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 rounded-lg font-semibold text-white"
        >
          Проверить
        </button>
      )}
    </div>
  );
}
