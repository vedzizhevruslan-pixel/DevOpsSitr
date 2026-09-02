import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../../stores/playerStore';
import { TOPICS } from '../../data/topics';
import type { TopicId } from '../../types';

type Filter = 'all' | 'unresolved' | 'resolved' | TopicId;
type Sort = 'worst' | 'recent' | 'oldest' | 'frequent';

export function MistakesView() {
  const mistakes = useGameStore((s) => s.mistakes);
  const setScreen = useGameStore((s) => s.setScreen);
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('worst');

  const filtered = useMemo(() => {
    let list = [...mistakes];
    if (filter === 'unresolved') list = list.filter((m) => !m.resolved);
    else if (filter === 'resolved') list = list.filter((m) => m.resolved);
    else if (filter !== 'all') list = list.filter((m) => m.topicId === filter);

    switch (sort) {
      case 'worst':
        list.sort((a, b) => b.wrongCount - a.wrongCount);
        break;
      case 'recent':
        list.sort((a, b) => new Date(b.lastMistakeAt).getTime() - new Date(a.lastMistakeAt).getTime());
        break;
      case 'oldest':
        list.sort((a, b) => new Date(a.firstMistakeAt).getTime() - new Date(b.firstMistakeAt).getTime());
        break;
      case 'frequent':
        list.sort((a, b) => b.wrongCount - a.wrongCount);
        break;
    }
    return list;
  }, [mistakes, filter, sort]);

  const stats = useMemo(() => {
    const byTopic: Record<string, number> = {};
    for (const m of mistakes.filter((m) => !m.resolved)) {
      byTopic[m.topicId] = (byTopic[m.topicId] || 0) + 1;
    }
    return byTopic;
  }, [mistakes]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => setScreen('map')} className="flex items-center gap-2 text-blue-300 hover:text-blue-100 mb-4 text-sm">
        <ArrowLeft size={16} /> Назад
      </button>

      <h2 className="text-2xl font-bold text-amber-100 mb-2">Мои ошибки</h2>
      <p className="text-blue-300/80 mb-6">
        Всего: {mistakes.length} · Исправлено: {mistakes.filter((m) => m.resolved).length} ·
        Открыто: {mistakes.filter((m) => !m.resolved).length}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', 'unresolved', 'resolved'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-sm ${
              filter === f ? 'bg-amber-700/50 text-amber-100' : 'bg-blue-900/30 text-blue-300'
            }`}
          >
            {f === 'all' ? 'Все' : f === 'unresolved' ? 'Не исправлены' : 'Исправлены'}
          </button>
        ))}
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-3 py-1 rounded text-sm ${
              filter === t.id ? 'bg-amber-700/50 text-amber-100' : 'bg-blue-900/30 text-blue-300'
            }`}
          >
            {t.nameRu} {stats[t.id] ? `(${stats[t.id]})` : ''}
          </button>
        ))}
      </div>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as Sort)}
        className="mb-6 bg-blue-900/50 border border-blue-700 rounded px-3 py-1 text-sm text-blue-200"
      >
        <option value="worst">Самые проблемные</option>
        <option value="recent">Последние</option>
        <option value="oldest">Старые</option>
        <option value="frequent">Чаще всего ошибаюсь</option>
      </select>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-blue-400 text-center py-12">Нет ошибок по выбранному фильтру 🎉</p>
        ) : (
          filtered.map((m) => (
            <div
              key={`${m.questionId}-${m.firstMistakeAt}`}
              className={`p-4 rounded-lg border ${
                m.resolved
                  ? 'bg-green-900/20 border-green-700/50'
                  : 'bg-orange-900/20 border-orange-600/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-blue-400">
                  {TOPICS.find((t) => t.id === m.topicId)?.nameRu} · {m.skillTag}
                </span>
                <span className={`text-xs ${m.resolved ? 'text-green-400' : 'text-orange-400'}`}>
                  {m.resolved ? '✓ Исправлено' : `× ${m.wrongCount}`}
                </span>
              </div>
              <p className="text-blue-100 mb-2">{m.question}</p>
              <div className="text-sm space-y-1">
                <div className="text-red-300/80">Ваш ответ: {m.selectedAnswer}</div>
                <div className="text-green-300/80">Правильно: {m.correctAnswer}</div>
                <div className="text-blue-300/60 text-xs mt-2">{m.explanation}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
