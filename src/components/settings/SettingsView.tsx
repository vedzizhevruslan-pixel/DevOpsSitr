import { useState } from 'react';
import { useGameStore } from '../../stores/playerStore';
import { deletePdfOffer } from '../../storage/pdfOfferStorage';

export function SettingsView() {
  const captainName = useGameStore((s) => s.captainName);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const setCaptainName = useGameStore((s) => s.setCaptainName);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showPdfReset, setShowPdfReset] = useState(false);
  const [name, setName] = useState(captainName);

  const handleReset = async () => {
    if (showPdfReset) {
      await deletePdfOffer();
    }
    resetProgress();
    setShowResetModal(false);
    setShowPdfReset(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-amber-100 mb-6">Настройки</h2>

      <div className="space-y-6">
        <div className="bg-[#1a3050]/60 border border-blue-800/30 rounded-xl p-4">
          <label className="text-sm text-blue-400 block mb-2">Имя капитана</label>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-blue-950/50 border border-blue-700 rounded px-3 py-2 text-blue-100"
            />
            <button
              onClick={() => setCaptainName(name)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded text-white text-sm"
            >
              Сохранить
            </button>
          </div>
        </div>

        <div className="bg-[#1a3050]/60 border border-blue-800/30 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-blue-200">Звук</div>
              <div className="text-xs text-blue-400">Плеск воды, монеты, гроза (скоро)</div>
            </div>
            <button
              className={`w-12 h-6 rounded-full transition-colors ${
                soundEnabled ? 'bg-amber-600' : 'bg-blue-900'
              }`}
              onClick={() => useGameStore.setState({ soundEnabled: !soundEnabled })}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4">
          <h3 className="text-red-300 font-semibold mb-2">Опасная зона</h3>
          <p className="text-sm text-red-200/70 mb-4">
            Сброс удалит весь прогресс, XP, ошибки и достижения.
          </p>
          <button
            onClick={() => setShowResetModal(true)}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-white text-sm"
          >
            Сбросить путешествие
          </button>
        </div>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1a3050] border border-red-600 rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-red-300 mb-4">Подтверждение сброса</h3>
            <p className="text-blue-200 mb-4">
              Все результаты обучения, XP и история ошибок будут удалены.
            </p>
            <label className="flex items-center gap-2 text-sm text-blue-300 mb-6">
              <input
                type="checkbox"
                checked={showPdfReset}
                onChange={(e) => setShowPdfReset(e.target.checked)}
              />
              Также удалить загруженный PDF оффера
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2 bg-blue-800 rounded text-blue-200"
              >
                Отмена
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 bg-red-700 rounded text-white"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
