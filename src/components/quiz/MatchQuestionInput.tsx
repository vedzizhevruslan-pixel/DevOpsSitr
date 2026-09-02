import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  left: string[];
  right: string[];
  correct: Record<string, string>;
  onSubmit: (matches: Record<string, string>) => void;
  disabled?: boolean;
}

export function MatchQuestionInput({ left, right, onSubmit, disabled }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});

  const handleRight = (r: string) => {
    if (!selectedLeft || disabled) return;
    setMatches({ ...matches, [selectedLeft]: r });
    setSelectedLeft(null);
  };

  const pairedRight = new Set(Object.values(matches));

  return (
    <div className="mb-6">
      <p className="text-xs text-blue-400 mb-3">Соедините соответствия</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {left.map((l) => (
            <button
              key={l}
              type="button"
              disabled={disabled || !!matches[l]}
              onClick={() => setSelectedLeft(l)}
              className={`w-full p-3 rounded-lg text-sm text-left ${
                matches[l]
                  ? 'bg-green-900/30 border border-green-600 text-green-200'
                  : selectedLeft === l
                    ? 'bg-amber-700/40 border border-amber-500'
                    : 'bg-blue-900/30 border border-blue-700/30'
              }`}
            >
              {l}
              {matches[l] && <span className="block text-xs text-green-400 mt-1">→ {matches[l]}</span>}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {right.map((r) => (
            <button
              key={r}
              type="button"
              disabled={disabled || pairedRight.has(r) || !selectedLeft}
              onClick={() => handleRight(r)}
              className={`w-full p-3 rounded-lg text-sm text-left ${
                pairedRight.has(r)
                  ? 'opacity-40 bg-blue-900/20'
                  : 'bg-blue-900/30 border border-blue-700/30 hover:bg-blue-800/40'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onSubmit(matches)}
        disabled={disabled || Object.keys(matches).length < left.length}
        className="w-full py-3 mt-4 bg-gradient-to-r from-purple-600 to-blue-600 disabled:opacity-40 rounded-lg font-bold text-white"
      >
        Ответить
      </motion.button>
    </div>
  );
}
