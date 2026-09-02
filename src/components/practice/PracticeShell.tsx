import { useEffect, useState } from 'react';
import type { PracticeExercise } from '../../types';
import { getObjective, getScenario } from './practiceUtils';

interface Props {
  exercise: PracticeExercise;
  index: number;
  total: number;
  completedBefore: number;
  hintsUsed: number;
  onRevealHint: () => void;
  children: React.ReactNode;
  statusPanel?: React.ReactNode;
}

export function PracticeShell({
  exercise,
  index,
  total,
  completedBefore,
  hintsUsed,
  onRevealHint,
  children,
  statusPanel,
}: Props) {
  const hints = exercise.hints ?? [];
  const revealed = Math.min(hintsUsed, hints.length);
  const canRevealMore = revealed < hints.length;
  const showAnswerUnlock = revealed >= hints.length && hints.length > 0;
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setShowAnswer(false);
  }, [exercise.id]);

  const answerPreview =
    exercise.acceptedAnswers?.[0] ??
    (Array.isArray(exercise.correctAnswer)
      ? String(exercise.correctAnswer[0])
      : String(exercise.correctAnswer));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-amber-300/90 font-semibold tracking-wide">
          Задание {index + 1} из {total}
        </div>
        <div className="flex gap-1.5" aria-label={`Прогресс: ${completedBefore} из ${total}`}>
          {Array.from({ length: total }).map((_, i) => {
            const filled = i < completedBefore;
            const current = i === index;
            return (
              <span
                key={i}
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  filled
                    ? 'bg-emerald-400'
                    : current
                      ? 'bg-amber-400 ring-2 ring-amber-400/40'
                      : 'bg-slate-700 border border-slate-600'
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-amber-600/40 bg-gradient-to-br from-amber-950/50 to-blue-950/40 p-5">
        <div className="text-xs uppercase tracking-widest text-amber-500/80 mb-2">
          Задание {index + 1} из {total}
        </div>
        <h3 className="text-xl font-bold text-amber-100 mb-3">🧭 {exercise.title}</h3>
        <p className="text-blue-100/90 leading-relaxed mb-3">{getScenario(exercise)}</p>
        <p className="text-cyan-200 font-medium leading-relaxed mb-4">{getObjective(exercise)}</p>

        <div className="flex flex-wrap items-center gap-2">
          {canRevealMore && (
            <button
              type="button"
              onClick={onRevealHint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-amber-800/40 border border-amber-600/50 text-amber-100 hover:bg-amber-700/50"
            >
              💡 Подсказка
              <span className="text-xs opacity-70">
                {revealed}/{hints.length}
              </span>
            </button>
          )}
          {showAnswerUnlock && !showAnswer && (
            <button
              type="button"
              onClick={() => setShowAnswer(true)}
              className="text-sm px-3 py-1.5 rounded-lg border border-blue-700/50 text-blue-300 hover:bg-blue-900/40"
            >
              Показать ответ
            </button>
          )}
        </div>

        {revealed > 0 && (
          <div className="mt-4 space-y-2">
            {hints.slice(0, revealed).map((hint, i) => (
              <div
                key={i}
                className="text-sm rounded-lg bg-black/30 border border-amber-800/30 px-3 py-2 text-amber-100/90"
              >
                <span className="text-amber-400 font-semibold">
                  💡 Подсказка {i + 1} из {hints.length}
                </span>
                <p className="mt-1 text-blue-100/85">{hint}</p>
              </div>
            ))}
          </div>
        )}

        {showAnswer && (
          <div className="mt-3 text-sm rounded-lg bg-emerald-950/40 border border-emerald-700/40 px-3 py-2 text-emerald-200">
            Ответ: <code className="font-mono text-emerald-100">{answerPreview}</code>
          </div>
        )}
      </div>

      {statusPanel}
      <div>{children}</div>
    </div>
  );
}
