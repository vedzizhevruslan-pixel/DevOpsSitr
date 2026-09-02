import { useGameStore } from '../../stores/playerStore';
import { TOPIC_ORDER } from '../../data/topics';

const TOPIC_LABELS: Record<string, string> = {
  linux: 'Linux',
  networks: 'Networks',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  'gitlab-cicd': 'GitLab CI/CD',
  terraform: 'Terraform',
  ansible: 'Ansible',
  'captain-exam': 'Cross-topic',
};

export function CaptainExamView() {
  const quizSession = useGameStore((s) => s.quizSession);
  const captainExamLastResult = useGameStore((s) => s.captainExamLastResult);
  const captainExamBestScore = useGameStore((s) => s.captainExamBestScore);
  const captainExamPassed = useGameStore((s) => s.captainExamPassed);
  const topicProgress = useGameStore((s) => s.topicProgress);
  const startCaptainExam = useGameStore((s) => s.startCaptainExam);
  const setScreen = useGameStore((s) => s.setScreen);

  const allTopicsDone = TOPIC_ORDER.every(
    (id) =>
      (topicProgress[id]?.masteryScore ?? 0) >= 70 &&
      (topicProgress[id]?.quizAttempts.length ?? 0) > 0,
  );

  if (quizSession?.mode === 'captain-exam') {
    return null;
  }

  if (captainExamLastResult) {
    const r = captainExamLastResult;
    return (
      <div className="h-full overflow-auto p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-display font-bold text-amber-200 mb-2">
          CAPTAIN&apos;S INTERVIEW
        </h2>
        <div className="text-4xl font-bold text-cyan-300 mb-1">
          {r.score} / {r.total}
        </div>
        <div className="text-lg text-amber-300 mb-6">Accuracy: {r.percent}%</div>

        <div className="space-y-2 mb-6">
          {Object.entries(r.byTopic).map(([topic, stats]) => (
            <div key={topic} className="flex justify-between text-sm bg-black/30 rounded-lg px-4 py-2">
              <span className="text-parchment">{TOPIC_LABELS[topic] ?? topic}</span>
              <span className="text-cyan-300">
                {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>

        {r.weakSkills.length > 0 && (
          <div className="mb-6 p-4 bg-orange-950/30 border border-orange-700/40 rounded-xl">
            <div className="text-orange-300 font-semibold mb-2">Слабые места:</div>
            <div className="flex flex-wrap gap-2">
              {r.weakSkills.map((s) => (
                <span key={s} className="text-xs px-2 py-1 bg-orange-900/40 rounded text-orange-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {captainExamPassed && (
          <p className="text-emerald-400 mb-4">Штормовая готовность подтверждена! (≥80%)</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={startCaptainExam}
            className="px-6 py-3 bg-gradient-to-r from-amber-700 to-amber-500 rounded-lg font-bold text-amber-950"
          >
            Повторить экзамен
          </button>
          <button type="button" onClick={() => setScreen('error-bay')} className="px-4 py-3 text-cyan-400">
            ← Назад
          </button>
        </div>
        {captainExamBestScore > 0 && (
          <p className="text-xs text-blue-400/70 mt-4">Лучший результат: {captainExamBestScore}%</p>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-lg text-center">
        <h2 className="text-3xl font-display font-bold text-amber-200 mb-3">
          Собеседование с капитаном
        </h2>
        <p className="text-cyan-300/80 mb-2">CAPTAIN&apos;S INTERVIEW</p>
        <p className="text-parchment/80 text-sm mb-6">
          15 вопросов из реальных DevOps-собеседований: Linux, Networks, Docker, Kubernetes, CI/CD и
          cross-topic. Минимум 3 вопроса по вашим слабым skillTag.
        </p>

        {!allTopicsDone ? (
          <p className="text-orange-400 mb-4">Сначала пройди все 7 технических островов.</p>
        ) : (
          <button
            type="button"
            onClick={startCaptainExam}
            className="px-8 py-3 bg-gradient-to-r from-amber-700 to-yellow-500 rounded-lg font-bold text-amber-950"
          >
            Начать экзамен
          </button>
        )}

        <button type="button" onClick={() => setScreen('error-bay')} className="block mx-auto mt-6 text-cyan-400 text-sm">
          ← Бухта ошибок
        </button>
      </div>
    </div>
  );
}
