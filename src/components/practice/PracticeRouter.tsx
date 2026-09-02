import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PracticeExercise, TopicId } from '../../types';
import { useGameStore } from '../../stores/playerStore';

interface Props {
  topicId: TopicId;
  exercises: PracticeExercise[];
  completed: string[];
  onAllDone?: () => void;
}

export function PracticeRouter({ topicId, exercises, completed, onAllDone }: Props) {
  const [idx, setIdx] = useState(0);
  const exercise = exercises[idx];
  const completePractice = useGameStore((s) => s.completePractice);

  if (!exercise) {
    return (
      <div className="text-center py-8">
        <p className="text-cyan-300 mb-4">Практика завершена!</p>
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

  const onComplete = (correct: boolean) => {
    if (correct && !completed.includes(exercise.id)) {
      completePractice(topicId, exercise.id);
    }
    if (idx < exercises.length - 1) {
      setIdx(idx + 1);
    } else if (correct && onAllDone) {
      // last exercise done — allow going to quiz after a short beat
      setTimeout(() => onAllDone(), 600);
    }
  };

  switch (topicId) {
    case 'linux':
      return <LinuxTerminalGame exercise={exercise} onComplete={onComplete} done={completed.includes(exercise.id)} />;
    case 'networks':
      return <NetworkRestoreGame exercise={exercise} onComplete={onComplete} />;
    case 'ansible':
      return <AnsibleFleetGame exercise={exercise} onComplete={onComplete} />;
    case 'terraform':
      return <TerraformBuildGame exercise={exercise} onComplete={onComplete} />;
    case 'docker':
      return <DockerPortGame exercise={exercise} onComplete={onComplete} />;
    case 'kubernetes':
      return <K8sFleetGame exercise={exercise} onComplete={onComplete} />;
    case 'gitlab-cicd':
      return <GitLabPipelineGame exercise={exercise} onComplete={onComplete} />;
    default:
      return <GenericPractice exercise={exercise} onComplete={onComplete} />;
  }
}

function LinuxTerminalGame({
  exercise,
  onComplete,
  done,
}: {
  exercise: PracticeExercise;
  onComplete: (c: boolean) => void;
  done: boolean;
}) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>(['Добро пожаловать в Пещеру Терминала...', exercise.prompt]);
  const [lit, setLit] = useState(done ? 100 : 20);

  const run = () => {
    const cmd = input.trim();
    const correct = cmd === exercise.correctAnswer || exercise.options?.includes(cmd) && cmd === exercise.correctAnswer;
    if (correct) {
      setOutput((o) => [...o, `$ ${cmd}`, '✓ Команда выполнена. Пещера освещается...']);
      setLit(100);
      setTimeout(() => onComplete(true), 800);
    } else {
      setOutput((o) => [...o, `$ ${cmd}`, '✗ Неверная команда. Попробуй снова.']);
      onComplete(false);
    }
    setInput('');
  };

  return (
    <div className="rounded-xl overflow-hidden border border-green-900/50">
      <div className="bg-black/90 p-4 font-mono text-sm min-h-[200px]" style={{ filter: `brightness(${lit}%)` }}>
        {output.map((line, i) => (
          <div key={i} className={line.startsWith('✓') ? 'text-green-400' : line.startsWith('✗') ? 'text-red-400' : 'text-green-300'}>
            {line}
          </div>
        ))}
        <div className="flex items-center mt-2">
          <span className="text-cyan-400">pirate@cave:~$</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run()}
            className="flex-1 bg-transparent border-none outline-none text-white ml-2"
            placeholder="введите команду..."
          />
        </div>
      </div>
      <div className="bg-green-950/50 p-2 flex gap-2 flex-wrap">
        {exercise.options?.map((opt) => (
          <button key={opt} type="button" onClick={() => setInput(opt)} className="text-xs px-2 py-1 bg-green-900/50 rounded text-green-300 hover:bg-green-800/50">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function NetworkRestoreGame({ exercise, onComplete }: { exercise: PracticeExercise; onComplete: (c: boolean) => void }) {
  const nodes = ['Корабль', 'Router', 'Firewall', 'DNS', 'Server'];
  const [fixed, setFixed] = useState<number | null>(null);

  const check = (i: number) => {
    const answer = exercise.correctAnswer;
    const correct = String(answer) === exercise.options?.[i] || nodes[i] === answer;
    setFixed(correct ? i : -1);
    onComplete(correct);
  };

  return (
    <div>
      <p className="text-sm text-cyan-300 mb-4">{exercise.description}</p>
      <div className="flex items-center justify-between gap-2 mb-4">
        {nodes.map((n, i) => (
          <motion.div
            key={n}
            animate={{ opacity: fixed === i ? 1 : fixed === -1 && i === 2 ? 0.5 : 1 }}
            className={`flex-1 text-center p-3 rounded-lg border ${
              fixed === i ? 'border-emerald-500 bg-emerald-900/30' : 'border-cyan-800/40 bg-blue-900/30'
            }`}
          >
            <div className="text-xs text-cyan-400">{n}</div>
            {i < nodes.length - 1 && <div className="text-cyan-600 mt-1">→</div>}
          </motion.div>
        ))}
      </div>
      <p className="text-sm mb-2">{exercise.prompt}</p>
      <div className="grid grid-cols-2 gap-2">
        {exercise.options?.map((opt) => (
          <button key={opt} type="button" onClick={() => check(exercise.options!.indexOf(opt))} className="p-3 rounded-lg bg-blue-900/40 border border-cyan-800/30 hover:border-cyan-500 text-sm">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function AnsibleFleetGame({ exercise, onComplete }: { exercise: PracticeExercise; onComplete: (c: boolean) => void }) {
  const ships = ['🚢', '🚢', '🚢'];
  const [fired, setFired] = useState(false);

  const select = (opt: string) => {
    const correct = opt === exercise.correctAnswer;
    if (correct) setFired(true);
    setTimeout(() => onComplete(correct), correct ? 600 : 0);
  };

  return (
    <div>
      <p className="text-sm text-cyan-300 mb-4">{exercise.description}</p>
      <div className="flex justify-center gap-8 mb-6">
        {ships.map((s, i) => (
          <motion.span key={i} animate={fired ? { y: [0, -5, 0] } : {}} transition={{ delay: i * 0.1 }} className="text-3xl">
            {s}
          </motion.span>
        ))}
      </div>
      <p className="mb-3">{exercise.prompt}</p>
      <div className="space-y-2">
        {exercise.options?.map((opt) => (
          <button key={opt} type="button" onClick={() => select(opt)} className="w-full p-3 rounded-lg bg-red-900/20 border border-red-800/30 text-left hover:border-red-500/50">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function TerraformBuildGame({ exercise, onComplete }: { exercise: PracticeExercise; onComplete: (c: boolean) => void }) {
  const blocks = ['Network', 'Server', 'Database', 'Storage'];
  const [placed, setPlaced] = useState<string[]>([]);

  const place = (b: string) => {
    if (placed.includes(b)) return;
    const next = [...placed, b];
    setPlaced(next);
    if (next.length >= 1) {
      const correct = String(exercise.correctAnswer) === b || (Array.isArray(exercise.correctAnswer) && exercise.correctAnswer.includes(b));
      if (exercise.options) {
        onComplete(String(exercise.correctAnswer) === b);
      } else {
        onComplete(correct);
      }
    }
  };

  return (
    <div>
      <p className="text-sm text-cyan-300 mb-4">{exercise.description}</p>
      <div className="grid grid-cols-2 gap-2 mb-4 min-h-[100px] p-4 bg-amber-950/20 border border-amber-800/30 rounded-lg">
        {placed.map((b) => (
          <motion.div key={b} initial={{ scale: 0 }} animate={{ scale: 1 }} className="p-2 bg-purple-900/40 rounded text-center text-sm">
            {b}
          </motion.div>
        ))}
      </div>
      <p className="mb-2 font-mono text-xs text-purple-300">{exercise.prompt}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {blocks.map((b) => (
          <button key={b} type="button" disabled={placed.includes(b)} onClick={() => place(b)} className="px-3 py-1 bg-purple-900/40 rounded text-sm disabled:opacity-30">
            + {b}
          </button>
        ))}
      </div>
      {exercise.options && (
        <div className="space-y-2">
          {exercise.options.map((opt) => (
            <button key={opt} type="button" onClick={() => onComplete(opt === exercise.correctAnswer)} className="w-full p-2 rounded bg-blue-900/30 text-sm text-left">
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DockerPortGame({ exercise, onComplete }: { exercise: PracticeExercise; onComplete: (c: boolean) => void }) {
  const dockerfileBlocks = ['FROM node:18', 'WORKDIR /app', 'COPY package.json .', 'RUN npm install', 'COPY . .', 'EXPOSE 3000', 'CMD ["npm","start"]'];
  const [order, setOrder] = useState([...dockerfileBlocks].sort(() => Math.random() - 0.5));

  if (exercise.id === 'dock-p1') {
    const move = (from: number, dir: -1 | 1) => {
      const to = from + dir;
      if (to < 0 || to >= order.length) return;
      const next = [...order];
      [next[from], next[to]] = [next[to], next[from]];
      setOrder(next);
    };
    const check = () => {
      const correct = order.every((v, i) => v === dockerfileBlocks[i]);
      onComplete(correct);
    };
    return (
      <div>
        <p className="text-sm text-cyan-300 mb-4">Собери Dockerfile в правильном порядке</p>
        {order.map((block, i) => (
          <div key={block} className="flex items-center gap-2 mb-1 p-2 bg-blue-950/50 rounded font-mono text-xs">
            <button type="button" onClick={() => move(i, -1)} className="text-cyan-500">↑</button>
            <button type="button" onClick={() => move(i, 1)} className="text-cyan-500">↓</button>
            <span className="text-cyan-200">{block}</span>
          </div>
        ))}
        <button type="button" onClick={check} className="mt-4 px-4 py-2 bg-cyan-700 rounded text-white text-sm">
          docker build
        </button>
      </div>
    );
  }

  return <GenericPractice exercise={exercise} onComplete={onComplete} />;
}

function K8sFleetGame({ exercise, onComplete }: { exercise: PracticeExercise; onComplete: (c: boolean) => void }) {
  const chain = ['Container', 'Pod', 'Deployment', 'Service', 'Ingress'];
  return (
    <div>
      <p className="text-sm text-cyan-300 mb-4">{exercise.description}</p>
      <div className="flex flex-col items-center gap-1 mb-4">
        {chain.map((c, i) => (
          <div key={c} className="flex flex-col items-center">
            <div className="px-4 py-2 bg-blue-900/50 border border-cyan-700/40 rounded text-sm">{c}</div>
            {i < chain.length - 1 && <div className="text-cyan-600">↓</div>}
          </div>
        ))}
      </div>
      <p className="mb-3">{exercise.prompt}</p>
      <div className="space-y-2">
        {exercise.options?.map((opt) => (
          <button key={opt} type="button" onClick={() => onComplete(opt === exercise.correctAnswer)} className="w-full p-3 rounded-lg bg-blue-900/30 text-left text-sm">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function GitLabPipelineGame({ exercise, onComplete }: { exercise: PracticeExercise; onComplete: (c: boolean) => void }) {
  const stages = ['CODE', 'BUILD', 'TEST', 'PACKAGE', 'DEPLOY'];
  const [order, setOrder] = useState([...stages]);

  if (exercise.id === 'gl-p1') {
    const move = (from: number, dir: -1 | 1) => {
      const to = from + dir;
      if (to < 0 || to >= order.length) return;
      const next = [...order];
      [next[from], next[to]] = [next[to], next[from]];
      setOrder(next);
    };
    const check = () => onComplete(order.every((v, i) => v === stages[i]));
    return (
      <div>
        <p className="text-sm text-cyan-300 mb-4">Собери pipeline на верфи</p>
        <div className="flex gap-2 mb-4 flex-wrap">
          {order.map((s, i) => (
            <div key={s} className="flex flex-col items-center">
              <div className="px-3 py-2 bg-orange-900/40 border border-orange-600/40 rounded text-xs font-bold">{s}</div>
              <div className="flex gap-1 mt-1">
                <button type="button" onClick={() => move(i, -1)} className="text-xs text-orange-400">←</button>
                <button type="button" onClick={() => move(i, 1)} className="text-xs text-orange-400">→</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={check} className="px-4 py-2 bg-orange-700 rounded text-white text-sm">Запустить pipeline</button>
      </div>
    );
  }

  return <GenericPractice exercise={exercise} onComplete={onComplete} />;
}

function GenericPractice({ exercise, onComplete }: { exercise: PracticeExercise; onComplete: (c: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const submit = () => {
    if (!selected) return;
    const correct = selected === exercise.correctAnswer;
    setFeedback(correct ? '✓ Верно!' : `✗ ${exercise.explanation}`);
    onComplete(correct);
  };

  return (
    <div>
      <p className="text-sm text-cyan-300 mb-2">{exercise.title}</p>
      <p className="mb-4">{exercise.prompt}</p>
      <div className="space-y-2">
        {exercise.options?.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setSelected(opt)}
            className={`w-full p-3 rounded-lg text-left text-sm ${
              selected === opt ? 'bg-amber-700/40 border border-amber-500' : 'bg-blue-900/30 border border-blue-700/30'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {feedback && <p className="mt-3 text-sm text-cyan-300">{feedback}</p>}
      <button type="button" onClick={submit} disabled={!selected} className="mt-4 px-4 py-2 bg-cyan-700 rounded text-white text-sm disabled:opacity-40">
        Проверить
      </button>
    </div>
  );
}
