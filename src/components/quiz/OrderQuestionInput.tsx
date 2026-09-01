import { useState } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import type { Question } from '../../types';
import { getOrderItems } from '../../engines/quizEngine';

interface Props {
  question: Question;
  onSubmit: (answer: string[]) => void;
  disabled?: boolean;
}

export function OrderQuestionInput({ question, onSubmit, disabled }: Props) {
  const [items, setItems] = useState(() => getOrderItems(question));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setItems(next);
  };

  return (
    <div className="space-y-2 mb-6">
      <p className="text-xs text-blue-400 mb-2">Расположите элементы в правильном порядке</p>
      {items.map((item, i) => (
        <div
          key={`${item}-${i}`}
          className="flex items-center gap-2 p-3 rounded-lg bg-blue-900/40 border border-blue-700/40"
        >
          <GripVertical size={16} className="text-blue-500 shrink-0" />
          <span className="flex-1 text-blue-100 text-sm">{item}</span>
          <button
            type="button"
            disabled={disabled || i === 0}
            onClick={() => move(i, i - 1)}
            className="p-1 text-blue-400 hover:text-amber-300 disabled:opacity-30"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            disabled={disabled || i === items.length - 1}
            onClick={() => move(i, i + 1)}
            className="p-1 text-blue-400 hover:text-amber-300 disabled:opacity-30"
          >
            <ChevronDown size={16} />
          </button>
        </div>
      ))}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onSubmit(items)}
        disabled={disabled}
        className="w-full py-3 mt-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-bold text-white"
      >
        Ответить
      </motion.button>
    </div>
  );
}
