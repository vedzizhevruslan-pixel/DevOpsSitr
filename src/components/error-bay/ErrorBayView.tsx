import { useGameStore } from '../../stores/playerStore';
import { TOPICS, TOPIC_ORDER } from '../../data/topics';
import { pirateAssets } from '../../config/assetManifest';
import { AssetImage } from '../ui/AssetImage';

export function ErrorBayView() {
  const mistakes = useGameStore((s) => s.mistakes);
  const finalReviewCompleted = useGameStore((s) => s.finalReviewCompleted);
  const startFinalReview = useGameStore((s) => s.startFinalReview);
  const setScreen = useGameStore((s) => s.setScreen);
  const topicProgress = useGameStore((s) => s.topicProgress);
  const getUnresolvedMistakeCount = useGameStore((s) => s.getUnresolvedMistakeCount);

  const allTopicsDone = TOPIC_ORDER.every(
    (id) =>
      (topicProgress[id]?.masteryScore ?? 0) >= 70 &&
      (topicProgress[id]?.quizAttempts.length ?? 0) > 0,
  );

  const unresolved = mistakes.filter((m) => !m.resolved);
  const byTopic = TOPICS.map((t) => ({
    topic: t,
    count: unresolved.filter((m) => m.topicId === t.id).length,
  }));

  if (!allTopicsDone) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <AssetImage src={pirateAssets.islands.errorBay} alt="Error Bay" className="w-48 h-36 mx-auto mb-4 object-contain opacity-50" fallback={<span className="text-6xl">💀</span>} />
          <h2 className="text-2xl font-display font-bold text-parchment mb-4">Капитанский обзор ошибок</h2>
          <p className="text-cyan-300/80">Сначала пройди все 7 островов.</p>
          <button type="button" onClick={() => setScreen('map')} className="mt-6 text-amber-400">← На карту</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative overflow-auto">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#1a1020] to-[#0d1f3c]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(220,50,50,0.15),transparent_60%)]" />

      <div className="relative z-10 p-8 max-w-3xl mx-auto">
        <div className="flex items-start gap-6 mb-8">
          <AssetImage src={pirateAssets.islands.errorBay} alt="Mistake Bay" className="w-40 h-32 object-contain" fallback={<span className="text-6xl">💀</span>} />
          <div>
            <h2 className="text-2xl font-display font-bold text-red-200">Бухта ошибок</h2>
            <p className="text-red-200/60 text-sm mt-1">Ремонтная бухта · финальный обзор пробоин</p>
          </div>
        </div>

        <div className="bg-black/40 border border-red-900/40 rounded-xl p-6 mb-6">
          <div className="text-red-300 font-semibold mb-4">
            Осталось пробоин: {getUnresolvedMistakeCount()}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {byTopic.map(({ topic, count }) => (
              <div
                key={topic.id}
                className={`flex justify-between p-3 rounded-lg border ${
                  count > 0 ? 'border-orange-600/50 bg-orange-950/30' : 'border-emerald-800/30 bg-emerald-950/20'
                }`}
              >
                <span className="text-sm text-parchment">{topic.nameRu}</span>
                <span className={count > 0 ? 'text-orange-400 font-bold' : 'text-emerald-400'}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {unresolved.length > 0 && (
          <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
            {unresolved.slice(0, 8).map((m) => (
              <div key={m.questionId} className="p-3 rounded-lg bg-red-950/30 border border-red-800/30 text-sm">
                <span className="text-orange-400 text-xs">{m.skillTag}</span>
                <p className="text-red-100/80 mt-1 line-clamp-2">{m.question}</p>
              </div>
            ))}
          </div>
        )}

        {finalReviewCompleted ? (
          <div className="text-center p-6 bg-emerald-900/30 border border-emerald-600 rounded-xl">
            <p className="text-emerald-200 font-semibold">Все пробоины устранены!</p>
            <p className="text-emerald-300/70 text-sm mt-2">Путь к сокровищам открыт.</p>
            <button type="button" onClick={() => setScreen('treasure')} className="mt-4 px-6 py-2 bg-amber-600 rounded-lg text-white">
              К острову оффера →
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-cyan-300 mb-4">
              {unresolved.length > 0
                ? `Исправь ${unresolved.length} ошибок. По ${Math.min(10, unresolved.length)} за заход.`
                : 'Начни финальный обзор'}
            </p>
            <button
              type="button"
              onClick={startFinalReview}
              className="px-8 py-3 bg-gradient-to-r from-red-800 to-orange-700 rounded-lg font-bold text-white"
            >
              {unresolved.length > 0 ? 'Продолжить обзор ошибок' : 'Начать финальный обзор'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
