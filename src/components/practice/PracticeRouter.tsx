import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { PracticeExercise, TopicId } from '../../types';
import { useGameStore } from '../../stores/playerStore';
import { PracticeShell } from './PracticeShell';
import {
  computePracticeXp,
  getFailureFeedback,
  getSuccessExplanation,
  isAcceptedAnswer,
  normalizeCommand,
} from './practiceUtils';

interface Props {
  topicId: TopicId;
  exercises: PracticeExercise[];
  completed: string[];
  onAllDone?: () => void;
}

export function PracticeRouter({ topicId, exercises, completed, onAllDone }: Props) {
  const firstIncomplete = Math.max(
    0,
    exercises.findIndex((e) => !completed.includes(e.id)),
  );
  const startIdx = firstIncomplete === -1 ? exercises.length : firstIncomplete;
  const [idx, setIdx] = useState(startIdx);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [phase, setPhase] = useState<'active' | 'success'>('active');
  const completePractice = useGameStore((s) => s.completePractice);

  useEffect(() => {
    setHintsUsed(0);
    setAttempts(0);
    setPhase('active');
  }, [idx, exercises]);

  if (idx >= exercises.length) {
    return (
      <div className="text-center py-8">
        <p className="text-cyan-300 mb-4 text-lg">✓ Практика острова завершена!</p>
        {onAllDone && (
          <button
            type="button"
            onClick={onAllDone}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold text-white"
          >
            К квизу →
          </button>
        )}
      </div>
    );
  }

  const exercise = exercises[idx];

  const finishSuccess = () => {
    if (!completed.includes(exercise.id)) {
      completePractice(topicId, exercise.id);
    }
    setPhase('success');
  };

  const goNext = () => {
    if (idx < exercises.length - 1) {
      setIdx(idx + 1);
    } else if (onAllDone) {
      onAllDone();
    } else {
      setIdx(idx + 1);
    }
  };

  const onWrong = () => {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    // gently nudge hints open after repeated mistakes
    if (nextAttempts === 2 && hintsUsed === 0 && (exercise.hints?.length ?? 0) > 0) {
      setHintsUsed(1);
    } else if (nextAttempts >= 3 && hintsUsed < 2 && (exercise.hints?.length ?? 0) > 1) {
      setHintsUsed(2);
    } else if (nextAttempts >= 4 && hintsUsed < 3 && (exercise.hints?.length ?? 0) > 2) {
      setHintsUsed(3);
    }
  };

  const revealHint = () => {
    const max = exercise.hints?.length ?? 0;
    if (hintsUsed < max) setHintsUsed(hintsUsed + 1);
  };

  const xp = computePracticeXp(hintsUsed);

  const successPanel =
    phase === 'success' ? (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-5"
      >
        <div className="text-emerald-300 font-bold text-lg mb-2">✓ Задание выполнено</div>
        <p className="text-blue-100/90 leading-relaxed mb-3 whitespace-pre-line">
          {getSuccessExplanation(exercise)}
        </p>
        <p className="text-amber-300 text-sm mb-4">+{xp} XP</p>
        <button
          type="button"
          onClick={goNext}
          className="px-5 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold text-white"
        >
          {idx < exercises.length - 1 ? 'Следующее задание →' : 'К квизу →'}
        </button>
      </motion.div>
    ) : null;

  const shell = (children: React.ReactNode, statusPanel?: React.ReactNode) => (
    <PracticeShell
      exercise={exercise}
      index={idx}
      total={exercises.length}
      completedBefore={idx}
      hintsUsed={hintsUsed}
      onRevealHint={revealHint}
      statusPanel={statusPanel ?? successPanel}
    >
      {phase === 'success' ? null : children}
    </PracticeShell>
  );

  if (topicId === 'linux' || exercise.interaction === 'terminal') {
    return shell(
      <LinuxTerminalGame
        exercise={exercise}
        disabled={phase === 'success'}
        onSuccess={finishSuccess}
        onWrong={onWrong}
      />,
    );
  }

  if (exercise.interaction === 'order' || exercise.id === 'dock-p1') {
    return shell(
      <ChoiceGame
        exercise={exercise}
        disabled={phase === 'success'}
        onSuccess={finishSuccess}
        onWrong={onWrong}
      />,
    );
  }

  // Default: scenario choice for all islands
  return shell(
    <ChoiceGame
      exercise={exercise}
      disabled={phase === 'success'}
      onSuccess={finishSuccess}
      onWrong={onWrong}
      visual={topicId}
    />,
  );
}

function LinuxTerminalGame({
  exercise,
  disabled,
  onSuccess,
  onWrong,
}: {
  exercise: PracticeExercise;
  disabled: boolean;
  onSuccess: () => void;
  onWrong: () => void;
}) {
  const [cwd, setCwd] = useState('/home/pirate');
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<string[]>(['Подключились к серверу. Введи команду ниже.']);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setInput('');
    setFeedback(null);
    setLines(['Подключились к серверу. Введи команду ниже.']);
    setCwd('/home/pirate');
  }, [exercise.id]);

  const run = () => {
    if (disabled || !input.trim()) return;
    const cmd = input.trim();
    const normalized = normalizeCommand(cmd);
    setLines((l) => [...l, `pirate@cave:${cwd}$ ${cmd}`]);

    if (isAcceptedAnswer(exercise, cmd)) {
      // side effects for educational simulator
      if (normalized.startsWith('cd ')) {
        const target = cmd.trim().split(/\s+/)[1]?.replace(/\/$/, '') || '/home/pirate';
        setCwd(target.startsWith('/') ? target : `${cwd}/${target}`);
      }
      const out = exercise.successOutput ?? [];
      if (normalized === 'pwd') {
        setLines((l) => [...l, cwd, '✓ КОМАНДА ВЫПОЛНЕНА']);
      } else {
        setLines((l) => [...l, ...out, '✓ КОМАНДА ВЫПОЛНЕНА']);
      }
      setFeedback(null);
      setInput('');
      onSuccess();
      return;
    }

    // known safe simulator responses for wrong but real commands
    if (normalized === 'pwd') {
      setLines((l) => [...l, cwd]);
    } else if (normalized === 'ls' || normalized.startsWith('ls ')) {
      setLines((l) => [...l, 'README.md  deploy.sh  logs/  src/']);
    } else if (normalized.startsWith('cd ')) {
      setLines((l) => [...l, `cd: это не та директория для текущего задания`]);
    }

    const msg = getFailureFeedback(exercise, cmd);
    setFeedback(msg);
    setLines((l) => [...l, '✗ Задание ещё не выполнено']);
    setInput('');
    onWrong();
  };

  return (
    <div className="space-y-3">
      {feedback && (
        <div className="rounded-lg border border-red-700/40 bg-red-950/30 px-4 py-3 text-sm text-red-100/90 whitespace-pre-line">
          {feedback}
        </div>
      )}
      <div className="rounded-xl overflow-hidden border border-green-900/50">
        <div className="bg-black/90 p-4 font-mono text-sm min-h-[220px]">
          {lines.map((line, i) => (
            <div
              key={`${i}-${line.slice(0, 12)}`}
              className={
                line.startsWith('✓')
                  ? 'text-green-400'
                  : line.startsWith('✗')
                    ? 'text-red-400'
                    : 'text-green-300'
              }
            >
              {line}
            </div>
          ))}
          {!disabled && (
            <div className="flex items-center mt-2">
              <span className="text-cyan-400 whitespace-nowrap">pirate@cave:{cwd}$</span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && run()}
                className="flex-1 bg-transparent border-none outline-none text-white ml-2"
                placeholder="введите команду..."
                autoFocus
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
              />
            </div>
          )}
        </div>
        {!disabled && (
          <div className="bg-green-950/40 px-3 py-2 flex justify-end">
            <button
              type="button"
              onClick={run}
              className="text-xs px-3 py-1 rounded bg-green-800/60 text-green-100 hover:bg-green-700/60"
            >
              Выполнить ↵
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ChoiceGame({
  exercise,
  disabled,
  onSuccess,
  onWrong,
  visual,
}: {
  exercise: PracticeExercise;
  disabled: boolean;
  onSuccess: () => void;
  onWrong: () => void;
  visual?: TopicId;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setSelected(null);
    setFeedback(null);
  }, [exercise.id]);

  const submit = (opt?: string) => {
    if (disabled) return;
    const value = opt ?? selected;
    if (!value) return;
    if (isAcceptedAnswer(exercise, value) || value === exercise.correctAnswer) {
      setFeedback(null);
      onSuccess();
      return;
    }
    setFeedback(getFailureFeedback(exercise, value));
    onWrong();
  };

  return (
    <div className="space-y-3">
      {visual === 'networks' && (
        <div className="flex items-center justify-between gap-1 text-center text-xs mb-2">
          {['Клиент', 'DNS ✓', 'Firewall ?', 'Сервер'].map((n) => (
            <div key={n} className="flex-1 p-2 rounded-lg bg-blue-950/50 border border-cyan-800/40 text-cyan-200">
              {n}
            </div>
          ))}
        </div>
      )}
      {visual === 'ansible' && (
        <div className="flex justify-center gap-6 text-2xl mb-2 opacity-80">🚢 🚢 🚢</div>
      )}
      {feedback && (
        <div className="rounded-lg border border-red-700/40 bg-red-950/30 px-4 py-3 text-sm text-red-100/90 whitespace-pre-line">
          {feedback}
        </div>
      )}
      <div className="space-y-2">
        {exercise.options?.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => {
              setSelected(opt);
              submit(opt);
            }}
            className={`w-full p-3 rounded-lg text-left text-sm transition-colors ${
              selected === opt
                ? 'bg-amber-700/40 border border-amber-500'
                : 'bg-blue-900/30 border border-blue-700/40 hover:border-cyan-500/50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
