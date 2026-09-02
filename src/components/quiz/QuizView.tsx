import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../stores/playerStore';
import { checkAnswer, formatAnswer, getEffectiveQuestionType } from '../../engines/quizEngine';
import { isInterviewSourceQuestion } from '../../data/questions';
import { MultipleChoiceInput } from './MultipleChoiceInput';
import { OrderQuestionInput } from './OrderQuestionInput';
import { MatchQuestionInput } from './MatchQuestionInput';
import type { Question } from '../../types';

export function QuizView() {
  const quizSession = useGameStore((s) => s.quizSession);
  const answerQuiz = useGameStore((s) => s.answerQuiz);
  const nextQuizQuestion = useGameStore((s) => s.nextQuizQuestion);
  const finishQuiz = useGameStore((s) => s.finishQuiz);
  const setScreen = useGameStore((s) => s.setScreen);

  const [selected, setSelected] = useState<string | string[] | boolean | Record<string, string> | null>(null);
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    question: Question;
    selected: string | string[] | boolean | Record<string, string>;
  } | null>(null);

  if (!quizSession) {
    return (
      <div className="p-8 text-center">
        <p className="text-blue-300">Нет активного квиза</p>
        <button onClick={() => setScreen('map')} className="mt-4 text-amber-400">
          ← На карту
        </button>
      </div>
    );
  }

  const { questions, currentIndex, answers, mode } = quizSession;
  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const effectiveType = getEffectiveQuestionType(question);

  const submitAnswer = (answer: string | string[] | boolean | Record<string, string>) => {
    const correct = checkAnswer(question, answer);
    answerQuiz(answer);
    setLastResult({ correct, question, selected: answer });
    setShowFeedback(true);
  };

  const handleSingleSubmit = () => {
    if (selected === null) return;
    submitAnswer(selected);
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  const modeLabel =
    mode === 'storm'
      ? 'Storm Challenge'
      : mode === 'final-review'
        ? 'Финальный обзор ошибок'
        : mode === 'captain-exam'
          ? "Captain's Interview"
          : 'Контрольный квиз';

  return (
    <div className="h-full flex flex-col p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-cyan-400 font-display">{modeLabel}</span>
        <span className="text-sm text-amber-400">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="h-2 bg-blue-950 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-amber-500"
          animate={{ width: `${progress}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!showFeedback ? (
          <motion.div key={`q-${question.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-[#0d1f3c]/80 border border-cyan-800/30 rounded-xl p-6 mb-6 backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs text-cyan-500 uppercase tracking-wide">
                  {question.difficulty} · {question.skillTag}
                </span>
                {isInterviewSourceQuestion(question) && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/50 border border-amber-600/40 text-amber-300">
                    🎯 Вопрос с собеседования
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-parchment mt-2 mb-4">{question.question}</h3>
              {(question.configSnippet || effectiveType === 'config') && (
                <pre className="bg-black/60 p-4 rounded-lg text-sm text-green-400 mb-4 overflow-x-auto font-mono border border-green-900/40">
                  {question.configSnippet || question.options?.join('\n')}
                </pre>
              )}
            </div>

            {effectiveType === 'truefalse' ? (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setSelected(val)}
                    className={`p-6 rounded-xl text-center font-semibold transition-all ${
                      selected === val
                        ? 'bg-amber-700/50 border-2 border-amber-400 text-amber-100'
                        : 'bg-blue-900/40 border border-blue-700/40 hover:border-cyan-500/50'
                    }`}
                  >
                    {val ? 'Верно' : 'Неверно'}
                  </button>
                ))}
                <button
                  onClick={handleSingleSubmit}
                  disabled={selected === null}
                  className="col-span-2 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 disabled:opacity-40 rounded-lg font-bold text-white"
                >
                  Ответить
                </button>
              </div>
            ) : effectiveType === 'multiple' ? (
              <MultipleChoiceInput
                options={question.options ?? []}
                selected={multiSelected}
                onChange={setMultiSelected}
                onSubmit={() => submitAnswer(multiSelected)}
              />
            ) : effectiveType === 'order' ? (
              <OrderQuestionInput question={question} onSubmit={submitAnswer} />
            ) : effectiveType === 'match' && question.matchLeft && question.matchRight ? (
              <MatchQuestionInput
                left={question.matchLeft}
                right={question.matchRight}
                correct={question.correctAnswer as Record<string, string>}
                onSubmit={submitAnswer}
              />
            ) : (
              <>
                <div className="space-y-2 mb-6">
                  {question.options?.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelected(opt)}
                      className={`w-full p-4 rounded-lg text-left transition-all ${
                        selected === opt
                          ? 'bg-amber-700/40 border border-amber-500 text-amber-100'
                          : 'bg-blue-900/30 border border-blue-700/30 text-blue-200 hover:bg-blue-800/40'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSingleSubmit}
                  disabled={selected === null}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 disabled:opacity-40 rounded-lg font-bold text-white"
                >
                  Ответить
                </button>
              </>
            )}
          </motion.div>
        ) : (
          lastResult && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-xl p-6 border ${
                lastResult.correct
                  ? 'bg-emerald-900/30 border-emerald-600'
                  : 'bg-red-950/50 border-red-600'
              }`}
            >
              {lastResult.correct ? (
                <>
                  <div className="text-xl font-bold text-emerald-300 mb-2">Верно! +10 XP</div>
                  <p className="text-blue-100/90 text-sm mb-4">{lastResult.question.explanation}</p>
                </>
              ) : (
                <>
                  <div className="text-xl font-bold text-red-400 mb-4 font-display">ПРОБОИНА В КОРАБЛЕ</div>
                  <div className="space-y-2 mb-4 text-sm">
                    <div>
                      <span className="text-red-400">Твой ответ: </span>
                      <span className="text-red-200">{formatAnswer(lastResult.selected)}</span>
                    </div>
                    <div>
                      <span className="text-emerald-400">Правильный: </span>
                      <span className="text-emerald-200">{formatAnswer(lastResult.question.correctAnswer)}</span>
                    </div>
                    <div>
                      <span className="text-amber-400 font-semibold">Почему: </span>
                      <span className="text-blue-100/90">{lastResult.question.explanation}</span>
                    </div>
                    {lastResult.question.remember && (
                      <div>
                        <span className="text-amber-400 font-semibold">Запомни: </span>
                        <span className="text-blue-200/80">{lastResult.question.remember}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
              {lastResult.correct && mode === 'final-review' && (
                <p className="text-emerald-300 text-sm mb-4">Пробоина устранена +20 XP</p>
              )}
              <button
                onClick={() => {
                  setShowFeedback(false);
                  setSelected(null);
                  setMultiSelected([]);
                  setLastResult(null);
                  if (isLast) finishQuiz();
                  else nextQuizQuestion();
                }}
                className="w-full py-3 bg-cyan-700 hover:bg-cyan-600 rounded-lg font-semibold text-white"
              >
                {isLast ? 'Завершить' : 'Понятно →'}
              </button>
            </motion.div>
          )
        )}
      </AnimatePresence>

      <div className="mt-4 text-center text-xs text-blue-500">
        Правильно: {answers.filter((a) => a.correct).length} / {answers.length}
      </div>
    </div>
  );
}
