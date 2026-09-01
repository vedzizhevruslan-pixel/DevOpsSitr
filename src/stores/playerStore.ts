import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PlayerState,
  TopicId,
  TopicProgress,
  Screen,
  QuizSession,
  DailyQuest,
} from '../types';
import { GAME_CONFIG } from '../config/gameConfig';
import { TOPIC_ORDER } from '../data/topics';
import { waypointToProgress } from '../config/mapConfig';
import { calculateMastery, getIslandStatus } from '../engines/masteryEngine';
import {
  adjustStormMeter,
  findWeakestTopic,
  shouldTriggerStorm,
  getWeakSkillTags,
  getStormTargetProgress,
} from '../engines/stormEngine';
import {
  checkAnswer,
  calculateQuizScore,
  selectQuizQuestions,
  selectStormQuestions,
  selectFinalReviewQuestions,
} from '../engines/quizEngine';
import { checkAchievements, allTopicsCompleted } from '../data/achievements';
import { getLessons, getPractice } from '../data/lessons';
import { getTopicById } from '../data/topics';

function createInitialTopicProgress(topicId: TopicId): TopicProgress {
  return {
    topicId,
    masteryScore: 0,
    chaptersCompleted: [],
    practiceCompleted: [],
    quizAttempts: [],
    bestQuizScore: 0,
    lastQuizScore: 0,
    status: topicId === 'linux' ? 'available' : 'locked',
    firstAttemptAccuracy: [],
  };
}

function createInitialState(): PlayerState {
  const topicProgress = {} as Record<TopicId, TopicProgress>;
  for (const id of TOPIC_ORDER) {
    topicProgress[id] = createInitialTopicProgress(id);
  }
  return {
    version: GAME_CONFIG.version,
    captainName: GAME_CONFIG.captainNameDefault,
    xp: 0,
    coins: 0,
    tickets: 8,
    stormMeter: 0,
    currentTopicId: 'linux',
    shipPosition: 0,
    shipProgress: 0,
    preStormProgress: null,
    shipAnimating: false,
    topicProgress,
    mistakes: [],
    achievements: [],
    streak: 0,
    lastActiveDate: '',
    dailyQuest: null,
    soundEnabled: false,
    finalReviewCompleted: false,
    treasureUnlocked: false,
    legendaryMode: false,
    correctStreak: 0,
    bestCorrectStreak: 0,
    totalCorrect: 0,
    totalWrong: 0,
    stormActive: false,
    stormTargetTopicId: null,
    stormChallengeActive: false,
    lastStormTriggeredAt: null,
    spacedReviewQueue: [],
  };
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function updateStreak(state: PlayerState): number {
  const t = today();
  if (state.lastActiveDate === t) return state.streak;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const y = yesterday.toISOString().split('T')[0];
  if (state.lastActiveDate === y) return state.streak + 1;
  return 1;
}

function generateDailyQuest(): DailyQuest {
  const types: DailyQuest['type'][] = ['chapter', 'questions', 'fix_mistakes', 'weak_skill'];
  const type = types[Math.floor(Math.random() * types.length)];
  const titles: Record<DailyQuest['type'], string> = {
    chapter: 'Пройди одну главу',
    questions: 'Ответь на 5 вопросов',
    fix_mistakes: 'Исправь две старые ошибки',
    weak_skill: 'Повтори слабый навык',
  };
  const targets: Record<DailyQuest['type'], number> = {
    chapter: 1,
    questions: 5,
    fix_mistakes: 2,
    weak_skill: 1,
  };
  return {
    id: `quest-${Date.now()}`,
    title: titles[type],
    titleRu: titles[type],
    type,
    target: targets[type],
    progress: 0,
    reward: GAME_CONFIG.xp.dailyQuest,
    completed: false,
    date: today(),
  };
}

function formatSelectedAnswer(selected: string | string[] | boolean | Record<string, string>): string {
  if (typeof selected === 'boolean') return selected ? 'true' : 'false';
  if (Array.isArray(selected)) return selected.join(', ');
  if (typeof selected === 'object') return JSON.stringify(selected);
  return String(selected);
}

interface AppStore extends PlayerState {
  currentScreen: Screen;
  quizSession: QuizSession | null;
  pdfMeta: import('../types').PdfOfferMeta | null;
  xpAnimation: number | null;
  achievementPopup: string | null;
  stormOverlay: boolean;
  stormAnimPhase: 'idle' | 'entering' | 'active' | 'returning';

  setScreen: (screen: Screen) => void;
  setCaptainName: (name: string) => void;
  completeChapter: (topicId: TopicId, chapterId: string) => void;
  completePractice: (topicId: TopicId, practiceId: string) => void;
  startQuiz: (topicId: TopicId, mode?: QuizSession['mode']) => void;
  answerQuiz: (selected: string | string[] | boolean | Record<string, string>) => void;
  nextQuizQuestion: () => void;
  finishQuiz: () => void;
  startStormChallenge: () => void;
  startFinalReview: () => void;
  resolveMistake: (questionId: string) => void;
  triggerStorm: () => void;
  completeStormChallenge: (passed: boolean) => void;
  animateShipTo: (targetProgress: number, onComplete?: () => void) => void;
  setPdfMeta: (meta: import('../types').PdfOfferMeta | null) => void;
  checkTreasureUnlock: () => void;
  unlockTreasure: () => void;
  resetProgress: () => void;
  getCurrentMission: () => { topicId: TopicId; action: string; progress: string };
  getUnresolvedMistakeCount: () => number;
}

export const useGameStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),
      currentScreen: 'map',
      quizSession: null,
      pdfMeta: null,
      xpAnimation: null,
      achievementPopup: null,
      stormOverlay: false,
      stormAnimPhase: 'idle',

      setScreen: (screen) => set({ currentScreen: screen }),

      setCaptainName: (name) => set({ captainName: name }),

      getUnresolvedMistakeCount: () => get().mistakes.filter((m) => !m.resolved).length,

      animateShipTo: (targetProgress, onComplete) => {
        set({ shipAnimating: true, shipProgress: targetProgress });
        setTimeout(() => {
          set({ shipAnimating: false });
          onComplete?.();
        }, GAME_CONFIG.shipSailDurationMs);
      },

      completeChapter: (topicId, chapterId) => {
        const state = get();
        const progress = { ...state.topicProgress[topicId] };
        if (progress.chaptersCompleted.includes(chapterId)) return;
        progress.chaptersCompleted = [...progress.chaptersCompleted, chapterId];
        progress.masteryScore = calculateMastery(progress, state.mistakes);
        progress.status = getIslandStatus(progress, true);

        let xpGain = GAME_CONFIG.xp.chapter;
        const newCoins = state.coins + 10;

        let dailyQuest = state.dailyQuest;
        if (!dailyQuest || dailyQuest.date !== today()) dailyQuest = generateDailyQuest();
        if (dailyQuest.type === 'chapter') {
          dailyQuest = { ...dailyQuest, progress: dailyQuest.progress + 1 };
          if (dailyQuest.progress >= dailyQuest.target && !dailyQuest.completed) {
            dailyQuest.completed = true;
            xpGain += dailyQuest.reward;
          }
        }

        const topicProgress = { ...state.topicProgress, [topicId]: progress };
        const newState = { ...state, xp: state.xp + xpGain, topicProgress, dailyQuest };
        const newAchievements = checkAchievements(newState);
        set({
          xp: state.xp + xpGain,
          coins: newCoins,
          topicProgress,
          dailyQuest,
          lastActiveDate: today(),
          streak: updateStreak(state),
          xpAnimation: xpGain,
          achievements: [...state.achievements, ...newAchievements],
          achievementPopup: newAchievements[0] || null,
        });
      },

      completePractice: (topicId, practiceId) => {
        const state = get();
        const progress = { ...state.topicProgress[topicId] };
        if (progress.practiceCompleted.includes(practiceId)) return;
        progress.practiceCompleted = [...progress.practiceCompleted, practiceId];
        progress.masteryScore = calculateMastery(progress, state.mistakes);
        const xpGain = GAME_CONFIG.xp.practice;
        set({
          topicProgress: { ...state.topicProgress, [topicId]: progress },
          xp: state.xp + xpGain,
          coins: state.coins + 25,
          xpAnimation: xpGain,
          lastActiveDate: today(),
          streak: updateStreak(state),
        });
      },

      startQuiz: (topicId, mode = 'topic') => {
        const state = get();
        let questions;
        if (mode === 'storm') {
          questions = selectStormQuestions(getWeakSkillTags(state.mistakes, state.topicProgress));
        } else if (mode === 'final-review') {
          const unresolved = state.mistakes.filter((m) => !m.resolved);
          if (unresolved.length === 0) {
            set({ finalReviewCompleted: true, currentScreen: 'error-bay' });
            return;
          }
          questions = selectFinalReviewQuestions(
            unresolved.map((m) => ({ questionId: m.questionId, wrongCount: m.wrongCount })),
          );
        } else {
          const recentIds = state.topicProgress[topicId].quizAttempts
            .flatMap((a) => a.questionIds)
            .slice(-20);
          questions = selectQuizQuestions(topicId, GAME_CONFIG.quizQuestionsPerAttempt, recentIds);
        }
        set({
          quizSession: {
            topicId: mode === 'final-review' ? state.currentTopicId : topicId,
            questions,
            currentIndex: 0,
            answers: [],
            mode,
          },
          currentScreen: 'quiz',
        });
      },

      answerQuiz: (selected) => {
        const state = get();
        const session = state.quizSession;
        if (!session) return;
        const question = session.questions[session.currentIndex];
        const correct = checkAnswer(question, selected);
        const priorAnswers = session.answers.filter((a) => a.questionId === question.id);
        const isFirstAttempt = priorAnswers.length === 0;
        const attemptCount = priorAnswers.length + 1;

        const answers = [
          ...session.answers,
          { questionId: question.id, selected, correct, firstAttempt: isFirstAttempt, attemptCount },
        ];

        let xpGain = correct && isFirstAttempt ? GAME_CONFIG.xp.correctAnswer : correct ? 2 : 0;
        let stormDelta = 0;
        let mistakes = [...state.mistakes];
        let correctStreak = state.correctStreak;
        let totalCorrect = state.totalCorrect;
        let totalWrong = state.totalWrong;

        if (correct) {
          if (isFirstAttempt) correctStreak++;
          totalCorrect++;
          if (session.mode === 'final-review') {
            const idx = mistakes.findIndex((m) => m.questionId === question.id && !m.resolved);
            if (idx >= 0) {
              mistakes = mistakes.map((m, i) =>
                i === idx
                  ? {
                      ...m,
                      resolved: true,
                      correctAfterMistakeCount: m.correctAfterMistakeCount + 1,
                      reviewAttempts: m.reviewAttempts + 1,
                    }
                  : m,
              );
              xpGain += GAME_CONFIG.xp.fixMistake;
              stormDelta += GAME_CONFIG.storm.successfulReview;
            }
          }
        } else {
          correctStreak = 0;
          totalWrong++;
          stormDelta += GAME_CONFIG.storm.wrongAnswer;
          const existingIdx = mistakes.findIndex((m) => m.questionId === question.id);
          if (existingIdx >= 0) {
            const existing = mistakes[existingIdx];
            mistakes = mistakes.map((m, i) =>
              i === existingIdx
                ? {
                    ...m,
                    wrongCount: m.wrongCount + 1,
                    selectedAnswer: formatSelectedAnswer(selected),
                    lastMistakeAt: new Date().toISOString(),
                    reviewAttempts: m.reviewAttempts + 1,
                    resolved: false,
                  }
                : m,
            );
            if (!existing.resolved) stormDelta += GAME_CONFIG.storm.repeatWrongSkill;
          } else {
            mistakes.push({
              questionId: question.id,
              topicId: question.topicId,
              skillTag: question.skillTag,
              question: question.question,
              selectedAnswer: formatSelectedAnswer(selected),
              correctAnswer: formatSelectedAnswer(question.correctAnswer),
              explanation: question.explanation,
              wrongCount: 1,
              correctAfterMistakeCount: 0,
              reviewAttempts: 0,
              firstMistakeAt: new Date().toISOString(),
              lastMistakeAt: new Date().toISOString(),
              resolved: false,
            });
          }
        }

        const bestCorrectStreak = Math.max(state.bestCorrectStreak, correctStreak);
        const stormMeter = adjustStormMeter(state.stormMeter, stormDelta);

        set({
          quizSession: { ...session, answers },
          xp: state.xp + xpGain,
          xpAnimation: xpGain > 0 ? xpGain : null,
          mistakes,
          correctStreak,
          bestCorrectStreak,
          totalCorrect,
          totalWrong,
          stormMeter,
          lastActiveDate: today(),
          streak: updateStreak(state),
        });
      },

      nextQuizQuestion: () => {
        const session = get().quizSession;
        if (!session || session.currentIndex >= session.questions.length - 1) return;
        set({ quizSession: { ...session, currentIndex: session.currentIndex + 1 } });
      },

      finishQuiz: () => {
        const state = get();
        const session = state.quizSession;
        if (!session) return;

        const { score, total, percent } = calculateQuizScore(session.answers);
        const topicId = session.topicId;

        if (session.mode === 'topic') {
          const progress = { ...state.topicProgress[topicId] };
          const firstAccuracies = session.answers
            .filter((a) => a.firstAttempt)
            .map((a) => (a.correct ? 100 : 0));
          progress.firstAttemptAccuracy = [...progress.firstAttemptAccuracy, ...firstAccuracies];
          progress.quizAttempts = [
            ...progress.quizAttempts,
            {
              id: `attempt-${Date.now()}`,
              date: new Date().toISOString(),
              score,
              total,
              questionIds: session.questions.map((q) => q.id),
            },
          ];
          progress.lastQuizScore = percent;
          progress.bestQuizScore = Math.max(progress.bestQuizScore, percent);
          progress.masteryScore = calculateMastery(progress, state.mistakes);
          progress.status = getIslandStatus(progress, true);

          let stormDelta = 0;
          if (percent >= 100) stormDelta = GAME_CONFIG.storm.perfectQuiz;
          else if (percent < 70) stormDelta = GAME_CONFIG.storm.quizBelow70;
          else if (percent < 80) stormDelta = GAME_CONFIG.storm.quiz70to79;

          const xpGain = percent >= 100 ? GAME_CONFIG.xp.perfectQuiz : percent >= 70 ? 50 : 20;
          const stormMeter = adjustStormMeter(state.stormMeter, stormDelta);
          const topicProgress = { ...state.topicProgress, [topicId]: progress };
          const idx = TOPIC_ORDER.indexOf(topicId);
          const nextTopic = TOPIC_ORDER[idx + 1];
          let shipProgress = state.shipProgress;
          let currentTopicId = state.currentTopicId;

          if (percent >= GAME_CONFIG.unlockNextIslandMastery && nextTopic) {
            const nextProgress = { ...topicProgress[nextTopic] };
            if (nextProgress.status === 'locked') {
              nextProgress.status = 'available';
              topicProgress[nextTopic] = nextProgress;
            }
            const targetProgress = waypointToProgress(idx + 1);
            if (targetProgress > shipProgress) {
              shipProgress = targetProgress;
              currentTopicId = nextTopic;
            }
          }

          const newState = {
            ...state,
            xp: state.xp + xpGain,
            topicProgress,
            stormMeter,
            shipProgress,
            shipPosition: idx + 1,
            currentTopicId,
          };
          const newAchievements = checkAchievements(newState);

          set({
            quizSession: null,
            currentScreen: 'map',
            xp: state.xp + xpGain,
            topicProgress,
            stormMeter,
            shipProgress,
            shipPosition: idx + 1,
            currentTopicId,
            shipAnimating: true,
            xpAnimation: xpGain,
            achievements: [...state.achievements, ...newAchievements],
            achievementPopup: newAchievements[0] || null,
          });

          setTimeout(() => set({ shipAnimating: false }), GAME_CONFIG.shipSailDurationMs);

          if (shouldTriggerStorm({ ...state, stormMeter })) {
            setTimeout(() => get().triggerStorm(), GAME_CONFIG.shipSailDurationMs + 500);
          }
        } else if (session.mode === 'storm') {
          get().completeStormChallenge(percent >= 80);
        } else if (session.mode === 'final-review') {
          const unresolved = get().mistakes.filter((m) => !m.resolved).length;
          if (unresolved === 0) {
            set({
              finalReviewCompleted: true,
              xp: state.xp + GAME_CONFIG.xp.finalReview,
              quizSession: null,
              currentScreen: 'error-bay',
              xpAnimation: GAME_CONFIG.xp.finalReview,
            });
          } else {
            set({ quizSession: null, currentScreen: 'error-bay' });
          }
        } else {
          set({ quizSession: null, currentScreen: 'map' });
        }
      },

      startStormChallenge: () => {
        set({ stormChallengeActive: true, stormOverlay: false });
        get().startQuiz(get().stormTargetTopicId || 'linux', 'storm');
        set({ currentScreen: 'storm-challenge' });
      },

      startFinalReview: () => {
        get().startQuiz('linux', 'final-review');
        set({ currentScreen: 'final-review' });
      },

      resolveMistake: (questionId) => {
        set({
          mistakes: get().mistakes.map((m) =>
            m.questionId === questionId ? { ...m, resolved: true, reviewAttempts: m.reviewAttempts + 1 } : m,
          ),
        });
      },

      triggerStorm: () => {
        const state = get();
        if (!shouldTriggerStorm(state)) return;
        const weakest = findWeakestTopic(state.topicProgress, state.mistakes);
        if (!weakest) return;

        const targetProgress = getStormTargetProgress(weakest);
        set({
          stormActive: true,
          stormTargetTopicId: weakest,
          stormOverlay: true,
          stormAnimPhase: 'entering',
          preStormProgress: state.shipProgress,
          lastStormTriggeredAt: Date.now(),
          currentTopicId: weakest,
        });

        get().animateShipTo(targetProgress, () => {
          set({ stormAnimPhase: 'active', stormOverlay: true });
        });
      },

      completeStormChallenge: (passed) => {
        const state = get();
        if (passed) {
          const restoreProgress = state.preStormProgress ?? state.shipProgress;
          set({
            stormActive: false,
            stormChallengeActive: false,
            stormMeter: adjustStormMeter(state.stormMeter, GAME_CONFIG.storm.stormChallengePass),
            stormAnimPhase: 'returning',
            xp: state.xp + GAME_CONFIG.xp.stormChallenge,
            quizSession: null,
            currentScreen: 'map',
            xpAnimation: GAME_CONFIG.xp.stormChallenge,
            achievements: state.achievements.includes('storm-master-earned')
              ? state.achievements
              : [...state.achievements, 'storm-master-earned'],
          });
          get().animateShipTo(restoreProgress, () => {
            set({ preStormProgress: null, stormAnimPhase: 'idle', stormOverlay: false });
          });
        } else {
          const target = state.stormTargetTopicId;
          if (target) {
            const progress = { ...state.topicProgress[target], status: 'needs_repair' as const };
            set({
              topicProgress: { ...state.topicProgress, [target]: progress },
              stormChallengeActive: false,
              stormActive: false,
              stormOverlay: false,
              stormAnimPhase: 'idle',
              quizSession: null,
              currentScreen: 'lesson',
            });
          }
        }
      },

      setPdfMeta: (meta) => set({ pdfMeta: meta }),

      checkTreasureUnlock: () => {
        const state = get();
        const allDone = allTopicsCompleted(state);
        const noMistakes = state.mistakes.filter((m) => !m.resolved).length === 0;
        if (allDone && state.finalReviewCompleted && noMistakes && state.pdfMeta && !state.treasureUnlocked) {
          get().unlockTreasure();
        }
      },

      unlockTreasure: () => {
        const state = get();
        set({
          treasureUnlocked: true,
          legendaryMode: true,
          achievements: state.achievements.includes('legendary')
            ? state.achievements
            : [...state.achievements, 'legendary'],
          achievementPopup: 'legendary',
        });
      },

      resetProgress: () => {
        set({
          ...createInitialState(),
          currentScreen: 'map',
          quizSession: null,
          pdfMeta: null,
          stormAnimPhase: 'idle',
        });
      },

      getCurrentMission: () => {
        const state = get();
        const topicId = state.currentTopicId;
        const progress = state.topicProgress[topicId];
        const lessons = getLessons(topicId);
        const practice = getPractice(topicId);
        const topic = getTopicById(topicId);

        const nextChapter = lessons.find((l) => !progress.chaptersCompleted.includes(l.id));
        if (nextChapter) {
          return {
            topicId,
            action: `Изучи главу: ${nextChapter.title}`,
            progress: `Главы ${progress.chaptersCompleted.length}/${lessons.length}`,
          };
        }
        const nextPractice = practice.find((p) => !progress.practiceCompleted.includes(p.id));
        if (nextPractice) {
          return {
            topicId,
            action: `Практика: ${nextPractice.title}`,
            progress: `Практика ${progress.practiceCompleted.length}/${practice.length}`,
          };
        }
        if (progress.quizAttempts.length === 0 || progress.lastQuizScore < 70) {
          return {
            topicId,
            action: 'Пройди контрольный квиз',
            progress: `Mastery ${progress.masteryScore}%`,
          };
        }
        return {
          topicId,
          action: `${topic?.nameRu} освоен! Плыви дальше.`,
          progress: `Mastery ${progress.masteryScore}%`,
        };
      },
    }),
    {
      name: 'devops-pirate-voyage-save',
      version: GAME_CONFIG.version,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as PlayerState & Record<string, unknown>;
        if (version < 2) {
          const sp = typeof state.shipPosition === 'number' ? state.shipPosition : 0;
          state.shipProgress = waypointToProgress(sp);
          state.preStormProgress = null;
          state.shipAnimating = false;
          state.lastStormTriggeredAt = null;
          state.mistakes = (state.mistakes ?? []).map((m) => ({
            ...m,
            reviewAttempts: (m as { reviewAttempts?: number }).reviewAttempts ?? 0,
          }));
        }
        state.version = GAME_CONFIG.version;
        return state;
      },
      partialize: (state) => {
        const {
          currentScreen: _,
          quizSession: __,
          xpAnimation: ___,
          achievementPopup: ____,
          stormOverlay: _____,
          stormAnimPhase: ______,
          ...rest
        } = state;
        return rest as unknown as PlayerState & Record<string, unknown>;
      },
    },
  ),
);
