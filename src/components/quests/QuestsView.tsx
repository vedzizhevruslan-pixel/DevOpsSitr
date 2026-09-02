import { useGameStore } from '../../stores/playerStore';

export function QuestsView() {
  const dailyQuest = useGameStore((s) => s.dailyQuest);
  const streak = useGameStore((s) => s.streak);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-amber-100 mb-6">Приказы капитана</h2>

      <div className="bg-orange-900/20 border border-orange-600/30 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-orange-300 mb-2">
          <span>🔥</span>
          <span className="font-semibold">Серия обучения: {streak} дней подряд</span>
        </div>
        <p className="text-sm text-orange-200/70">
          Заходи каждый день, проходи урок или квиз, чтобы поддерживать серию.
        </p>
      </div>

      {dailyQuest ? (
        <div className="bg-[#1a3050]/60 border border-amber-700/30 rounded-xl p-6">
          <div className="text-xs text-amber-400 mb-1">Приказ на сегодня</div>
          <h3 className="text-lg font-bold text-amber-100 mb-4">{dailyQuest.titleRu}</h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-blue-300 mb-1">
              <span>Прогресс</span>
              <span>
                {dailyQuest.progress}/{dailyQuest.target}
              </span>
            </div>
            <div className="h-2 bg-blue-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${Math.min(100, (dailyQuest.progress / dailyQuest.target) * 100)}%` }}
              />
            </div>
          </div>
          <div className="text-sm text-amber-300">
            Награда: +{dailyQuest.reward} XP
            {dailyQuest.completed && <span className="text-green-400 ml-2">✓ Выполнено</span>}
          </div>
        </div>
      ) : (
        <p className="text-blue-400">Начни урок, чтобы получить ежедневный квест!</p>
      )}
    </div>
  );
}

export function LegendaryView() {
  const setScreen = useGameStore((s) => s.setScreen);
  const startQuiz = useGameStore((s) => s.startQuiz);
  const setScreenFn = useGameStore((s) => s.setScreen);

  return (
    <div className="p-6 max-w-2xl mx-auto text-center">
      <div className="text-6xl mb-4">🏴‍☠️</div>
      <h2 className="text-2xl font-bold text-amber-200 mb-4">Legendary Voyage</h2>
      <p className="text-blue-300 mb-8">
        Путешествие завершено! Тренируйся, повторяй слабые темы и готовься к собеседованиям.
      </p>
      <div className="grid gap-4">
        <button
          onClick={() => setScreenFn('mistakes')}
          className="p-4 bg-[#1a3050]/60 border border-blue-700 rounded-xl text-blue-200 hover:bg-blue-800/40"
        >
          🔧 Повторить ошибки
        </button>
        <button
          onClick={() => {
            startQuiz('linux', 'legendary');
          }}
          className="p-4 bg-[#1a3050]/60 border border-purple-700 rounded-xl text-purple-200 hover:bg-purple-800/40"
        >
          ⚔️ DevOps Challenge
        </button>
        <button
          onClick={() => setScreen('stats')}
          className="p-4 bg-[#1a3050]/60 border border-amber-700 rounded-xl text-amber-200 hover:bg-amber-800/40"
        >
          📊 История прогресса
        </button>
      </div>
    </div>
  );
}
