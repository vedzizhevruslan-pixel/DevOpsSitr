import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/playerStore';
import { formatAnswer } from '../../engines/quizEngine';
import type { Question } from '../../types';

export function QuizView() {
  const quizSession = useGameStore((s) => s.quizSession);
  const answerQuiz = useGameStore((s) => s.answerQuiz);
  const nextQuizQuestion = useGameStore((s) => s.nextQuizQuestion);
  const finishQuiz = useGameStore((s) => s.finishQuiz);
  const setScreen = useGameStore((s) => s.setScreen);

  const [selected, setSelected] = useState<string | string[] | boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastResult, setLastResult] = useState<{ correct: boolean; question: Question; selected: string | string[] | boolean } | null>(null);

  if (!quizSession) {
    return (
      <div className="p-8 text-center">
        <p className="text-blue-300">Нет активного квиза</p>
        <button onClick={() => setScreen('map')} className="mt-4 text-amber-400">← На карту</button>
      </div>
    );
  }

  const { questions, currentIndex, answers, mode } = quizSession;
  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleSubmit = () => {
    if (selected === null) return;
    answerQuiz(selected);
    const correct = JSON.stringify(selected) === JSON.stringify(question.correctAnswer) ||
      (typeof question.correctAnswer === 'boolean' && selected === question.correctAnswer) ||
      (typeof question.correctAnswer === 'string' && selected === question.correctAnswer);
    setLastResult({ correct, question, selected });
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setSelected(null);
    setLastResult(null);
    if (isLast) {
      finishQuiz();
    } else {
      nextQuizQuestion();
    }
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="h-full flex flex-col p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-blue-400">
          {mode === 'storm' ? '⛈️ Storm Challenge' : mode === 'final-review' ? '🔧 Финальный обзор' : '📝 Контрольный квиз'}
        </span>
        <span className="text-sm text-amber-400">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="h-2 bg-blue-950 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
          animate={{ width: `${progress}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!showFeedback ? (
          <motion.div key="question" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-[#1a3050]/60 border border-blue-800/30 rounded-xl p-6 mb-6">
              <span className="text-xs text-blue-400 uppercase">{question.difficulty} · {question.skillTag}</span>
              <h3 className="text-lg font-semibold text-amber-100 mt-2 mb-4">{question.question}</h3>
              {question.configSnippet && (
                <pre className="bg-black/50 p-4 rounded-lg text-sm text-green-400 mb-4 overflow-x-auto">
                  {question.configSnippet}
                </pre>
              )}
            </div>

            <div className="space-y-2 mb-6">
              {question.type === 'truefalse' ? (
                [true, false].map((val) => (
                  <button
                    key={String(val)}
                    onClick={() => setSelected(val)}
                    className={`w-full p-4 rounded-lg text-left transition-all ${
                      selected === val
                        ? 'bg-amber-700/40 border border-amber-500'
                        : 'bg-blue-900/30 border border-blue-700/30 hover:bg-blue-800/40'
                    }`}
                  >
                    {val ? 'True / Верно' : 'False / Неверно'}
                  </button>
                ))
              ) : (
                question.options?.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelected(opt)}
                    className={`w-full p-4 rounded-lg text-left transition-all ${
                      selected === opt
                        ? 'bg-amber-700/40 border border-amber-500 text-amber-100'
                        : 'bg-blue-900/30 border border-blue-700/30 text-blue-200 hover:bg-blue-800/40'
                    }`}
                  >
                    {opt}
                  </button>
                ))
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={selected === null}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 disabled:opacity-40 rounded-lg font-bold text-white"
            >
              Ответить
            </button>
          </motion.div>
        ) : lastResult && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-6 border ${
              lastResult.correct
                ? 'bg-green-900/30 border-green-600'
                : 'bg-red-900/30 border-red-600'
            }`}
          >
            <div className="text-2xl mb-4">{lastResult.correct ? '✅' : '❌'}</div>
            {!lastResult.correct && (
              <div className="space-y-2 mb-4 text-sm">
                <div>
                  <span className="text-red-400">Ваш ответ: </span>
                  <span className="text-red-200">{formatAnswer(lastResult.selected)}</span>
                </div>
                <div>
                  <span className="text-green-400">Правильный ответ: </span>
                  <span className="text-green-200">{formatAnswer(lastResult.question.correctAnswer)}</span>
                </div>
              </div>
            )}
            <div className="mb-2">
              <div className="text-xs text-amber-400 font-semibold">Почему</div>
              <p className="text-blue-100/90">{lastResult.question.explanation}</p>
            </div>
            {lastResult.question.remember && (
              <div className="mb-4">
                <div className="text-xs text-amber-400 font-semibold">Что запомнить</div>
                <p className="text-blue-200/80 text-sm">{lastResult.question.remember}</p>
              </div>
            )}
            {lastResult.correct && mode === 'final-review' && (
              <p className="text-green-300 text-sm mb-4">Пробоина устранена +20 XP</p>
            )}
            <button
              onClick={handleNext}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold text-white"
            >
              {isLast ? 'Завершить' : 'Понятно →'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 text-center text-xs text-blue-500">
        Правильно: {answers.filter((a) => a.correct).length} / {answers.length}
      </div>
    </div>
  );
}
