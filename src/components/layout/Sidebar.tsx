import { Anchor, BarChart3, BookOpen, Compass, Map, Settings, Skull, Trophy, Users } from 'lucide-react';
import type { Screen } from '../../types';
import { useGameStore } from '../../stores/playerStore';

const NAV_ITEMS: { id: Screen; label: string; icon: typeof Map }[] = [
  { id: 'map', label: 'Карта путешествия', icon: Compass },
  { id: 'lesson', label: 'Уроки', icon: BookOpen },
  { id: 'mistakes', label: 'Мои ошибки', icon: Skull },
  { id: 'stats', label: 'Прогресс', icon: BarChart3 },
  { id: 'achievements', label: 'Достижения', icon: Trophy },
  { id: 'quests', label: 'Квесты', icon: Anchor },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export function Sidebar() {
  const currentScreen = useGameStore((s) => s.currentScreen);
  const setScreen = useGameStore((s) => s.setScreen);
  const xp = useGameStore((s) => s.xp);
  const coins = useGameStore((s) => s.coins);
  const tickets = useGameStore((s) => s.tickets);
  const streak = useGameStore((s) => s.streak);

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-[#0d1f3c]/90 border-r border-amber-900/30 backdrop-blur-sm">
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setScreen(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              currentScreen === id
                ? 'bg-amber-700/40 text-amber-100 border border-amber-600/50'
                : 'text-blue-200/70 hover:bg-blue-900/30 hover:text-blue-100'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-amber-900/30">
        <div className="bg-[#1a3050]/80 rounded-lg p-3 space-y-2 text-xs">
          <div className="flex justify-between text-amber-200">
            <span>🪙 {coins.toLocaleString()}</span>
            <span>🎫 {tickets}</span>
          </div>
          <div className="text-orange-400">🔥 {streak} дней</div>
          <div className="text-blue-300">{xp.toLocaleString()} XP</div>
        </div>
        <button className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-xs text-amber-300/70 hover:text-amber-200">
          <Users size={14} />
          Мой прогресс
        </button>
      </div>
    </aside>
  );
}
