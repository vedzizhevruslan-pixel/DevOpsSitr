import { motion } from 'framer-motion';

interface Props {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function MultipleChoiceInput({ options, selected, onChange, onSubmit, disabled }: Props) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="space-y-2 mb-6">
      <p className="text-xs text-blue-400 mb-2">Выберите все правильные варианты</p>
      {options.map((opt) => {
        const checked = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => toggle(opt)}
            className={`w-full p-4 rounded-lg text-left transition-all flex items-center gap-3 ${
              checked
                ? 'bg-amber-700/40 border border-amber-500 text-amber-100'
                : 'bg-blue-900/30 border border-blue-700/30 text-blue-200 hover:bg-blue-800/40'
            }`}
          >
            <span
              className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                checked ? 'bg-amber-500 border-amber-400' : 'border-blue-500'
              }`}
            >
              {checked && <span className="text-xs text-amber-950">✓</span>}
            </span>
            {opt}
          </button>
        );
      })}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onSubmit}
        disabled={disabled || selected.length === 0}
        className="w-full py-3 mt-4 bg-gradient-to-r from-purple-600 to-blue-600 disabled:opacity-40 rounded-lg font-bold text-white"
      >
        Ответить
      </motion.button>
    </div>
  );
}
