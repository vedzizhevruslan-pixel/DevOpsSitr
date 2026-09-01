import { useGameStore } from '../../stores/playerStore';
import { TOPICS } from '../../data/topics';
import { TOPIC_ORDER } from '../../data/topics';

export function ErrorBayView() {
  const mistakes = useGameStore((s) => s.mistakes);
  const finalReviewCompleted = useGameStore((s) => s.finalReviewCompleted);
  const startFinalReview = useGameStore((s) => s.startFinalReview);
  const setScreen = useGameStore((s) => s.setScreen);
  const topicProgress = useGameStore((s) => s.topicProgress);

  const allTopicsDone = TOPIC_ORDER.every(
    (id) =>
      topicProgress[id]?.masteryScore >= 70 &&
      (topicProgress[id]?.quizAttempts.length ?? 0) > 0,
  );

  const byTopic = TOPICS.map((t) => {
    const topicMistakes = mistakes.filter((m) => m.topicId === t.id);
    const unresolved = topicMistakes.filter((m) => !m.resolved);
    const resolved = topicMistakes.filter((m) => m.resolved);
    return { topic: t, total: topicMistakes.length, unresolved: unresolved.length, resolved: resolved.length };
  });

  const totalUnresolved = mistakes.filter((m) => !m.resolved).length;

  if (!allTopicsDone) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">💀</div>
        <h2 className="text-2xl font-bold text-amber-100 mb-4">Капитанский обзор ошибок</h2>
        <p className="text-blue-300">Сначала пройди все 7 островов, чтобы попасть в финальную бухту.</p>
        <button onClick={() => setScreen('map')} className="mt-6 text-amber-400">← На карту</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">💀</div>
        <h2 className="text-2xl font-bold text-amber-100 mb-2">Капитанский обзор ошибок</h2>
        <p className="text-blue-300/80">
          Все пробоины корабля. Исправь слабые места, чтобы открыть путь к сокровищам.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {byTopic.map(({ topic, total, unresolved, resolved }) => (
          <div
            key={topic.id}
            className="flex items-center justify-between p-4 bg-[#1a3050]/60 border border-blue-800/30 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{topic.icon}</span>
              <span className="text-blue-100">{topic.nameRu}</span>
            </div>
            <div className="text-sm">
              {total === 0 ? (
                <span className="text-green-400">Без ошибок ✓</span>
              ) : (
                <span>
                  <span className="text-orange-400">{unresolved} открытых</span>
                  {resolved > 0 && <span className="text-green-400 ml-2">/ {resolved} исправлено</span>}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {finalReviewCompleted ? (
        <div className="text-center p-6 bg-green-900/30 border border-green-600 rounded-xl">
          <div className="text-3xl mb-2">✓</div>
          <p className="text-green-200 font-semibold">Все пробоины корабля устранены!</p>
          <p className="text-green-300/80 text-sm mt-2">Путь к сокровищам открыт.</p>
          <button
            onClick={() => setScreen('treasure')}
            className="mt-4 px-6 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white"
          >
            К острову оффера →
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-blue-300 mb-4">
            {totalUnresolved > 0
              ? `${totalUnresolved} вопросов требуют повторения`
              : 'Пройди финальный review для подтверждения знаний'}
          </p>
          <button
            onClick={startFinalReview}
            className="px-8 py-3 bg-gradient-to-r from-red-700 to-orange-600 rounded-lg font-bold text-white"
          >
            Начать финальный обзор
          </button>
        </div>
      )}
    </div>
  );
}
