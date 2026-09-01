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
import { calculateMastery, getIslandStatus } from '../engines/masteryEngine';
import {
  adjustStormMeter,
  findWeakestTopic,
  shouldTriggerStorm,
  getWeakSkillTags,
} from '../engines/stormEngine';
import { checkAnswer, calculateQuizScore, selectQuizQuestions, selectStormQuestions, selectFinalReviewQuestions } from '../engines/quizEngine';
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

interface AppStore extends PlayerState {
  currentScreen: Screen;
  quizSession: QuizSession | null;
  pdfMeta: import('../types').PdfOfferMeta | null;
  xpAnimation: number | null;
  achievementPopup: string | null;
  stormOverlay: boolean;

  setScreen: (screen: Screen) => void;
  setCaptainName: (name: string) => void;
  completeChapter: (topicId: TopicId, chapterId: string) => void;
  completePractice: (topicId: TopicId, practiceId: string) => void;
  startQuiz: (topicId: TopicId, mode?: QuizSession['mode']) => void;
  answerQuiz: (selected: string | string[] | boolean) => void;
  nextQuizQuestion: () => void;
  finishQuiz: () => void;
  startStormChallenge: () => void;
  startFinalReview: () => void;
  resolveMistake: (questionId: string) => void;
  triggerStorm: () => void;
  completeStormChallenge: (passed: boolean) => void;
  setPdfMeta: (meta: import('../types').PdfOfferMeta | null) => void;
  checkTreasureUnlock: () => void;
  unlockTreasure: () => void;
  resetProgress: (includePdf?: boolean) => void;
  getCurrentMission: () => { topicId: TopicId; action: string; progress: string };
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

      setScreen: (screen) => set({ currentScreen: screen }),

      setCaptainName: (name) => set({ captainName: name }),

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
        if (!dailyQuest || dailyQuest.date !== today()) {
          dailyQuest = generateDailyQuest();
        }
        if (dailyQuest.type === 'chapter') {
          dailyQuest = { ...dailyQuest, progress: dailyQuest.progress + 1 };
          if (dailyQuest.progress >= dailyQuest.target && !dailyQuest.completed) {
            dailyQuest.completed = true;
            xpGain += dailyQuest.reward;
          }
        }

        const topicProgress = { ...state.topicProgress, [topicId]: progress };
        const newState = {
          ...state,
          xp: state.xp + xpGain,
          coins: newCoins,
          topicProgress,
          dailyQuest,
          lastActiveDate: today(),
          streak: updateStreak(state),
        };
        const newAchievements = checkAchievements(newState);
        set({
          xp: newState.xp,
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
          const tags = getWeakSkillTags(state.mistakes, state.topicProgress);
          questions = selectStormQuestions(tags);
        } else if (mode === 'final-review') {
          const weakTopics = TOPIC_ORDER.filter(
            (id) => (state.topicProgress[id]?.masteryScore ?? 0) < 80,
          );
          questions = selectFinalReviewQuestions(
            state.mistakes.filter((m) => !m.resolved).map((m) => m.questionId),
            weakTopics,
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
        const isFirstAttempt = !session.answers.find((a) => a.questionId === question.id);

        const answers = [
          ...session.answers,
          { questionId: question.id, selected, correct, firstAttempt: isFirstAttempt },
        ];

        let xpGain = correct ? GAME_CONFIG.xp.correctAnswer : 0;
        let stormDelta = 0;
        let mistakes = [...state.mistakes];
        let correctStreak = state.correctStreak;
        let totalCorrect = state.totalCorrect;
        let totalWrong = state.totalWrong;

        if (correct) {
          correctStreak++;
          totalCorrect++;
          if (session.mode === 'final-review') {
            const existing = mistakes.find((m) => m.questionId === question.id);
            if (existing && !existing.resolved) {
              mistakes = mistakes.map((m) =>
                m.questionId === question.id
                  ? { ...m, resolved: true, correctAfterMistakeCount: m.correctAfterMistakeCount + 1 }
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
          const existing = mistakes.find((m) => m.questionId === question.id);
          if (existing) {
            mistakes = mistakes.map((m) =>
              m.questionId === question.id
                ? {
                    ...m,
                    wrongCount: m.wrongCount + 1,
                    selectedAnswer: String(selected),
                    lastMistakeAt: new Date().toISOString(),
                  }
                : m,
            );
            stormDelta += GAME_CONFIG.storm.repeatWrongSkill;
          } else {
            mistakes.push({
              questionId: question.id,
              topicId: question.topicId,
              skillTag: question.skillTag,
              question: question.question,
              selectedAnswer: String(selected),
              correctAnswer: Array.isArray(question.correctAnswer)
                ? question.correctAnswer.join(', ')
                : String(question.correctAnswer),
              explanation: question.explanation,
              wrongCount: 1,
              correctAfterMistakeCount: 0,
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
        const state = get();
        const session = state.quizSession;
        if (!session) return;
        if (session.currentIndex < session.questions.length - 1) {
          set({ quizSession: { ...session, currentIndex: session.currentIndex + 1 } });
        }
      },

      finishQuiz: () => {
        const state = get();
        const session = state.quizSession;
        if (!session) return;

        const { score, total, percent } = calculateQuizScore(session.answers);
        const topicId = session.topicId;
        const progress = { ...state.topicProgress[topicId] };

        if (session.mode === 'topic') {
          const firstAccuracies = session.answers
            .filter((a) => a.firstAttempt)
            .map((a) => (a.correct ? 100 : 0));
          progress.firstAttemptAccuracy = [
            ...progress.firstAttemptAccuracy,
            ...firstAccuracies,
          ];
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

          let xpGain = percent >= 100 ? GAME_CONFIG.xp.perfectQuiz : percent >= 70 ? 50 : 20;
          const stormMeter = adjustStormMeter(state.stormMeter, stormDelta);

          const topicProgress = { ...state.topicProgress, [topicId]: progress };
          const idx = TOPIC_ORDER.indexOf(topicId);
          const nextTopic = TOPIC_ORDER[idx + 1];
          let shipPosition = state.shipPosition;
          let currentTopicId = state.currentTopicId;

          if (percent >= GAME_CONFIG.unlockNextIslandMastery && nextTopic) {
            const nextProgress = { ...topicProgress[nextTopic] };
            if (nextProgress.status === 'locked') {
              nextProgress.status = 'available';
              topicProgress[nextTopic] = nextProgress;
            }
            if (idx >= shipPosition) {
              shipPosition = idx + 1;
              currentTopicId = nextTopic;
            }
          }

          const badge = getTopicById(topicId)?.badgeRu;
          const newState = {
            ...state,
            xp: state.xp + xpGain,
            topicProgress,
            stormMeter,
            shipPosition,
            currentTopicId,
          };
          const newAchievements = checkAchievements(newState);

          set({
            quizSession: null,
            currentScreen: 'map',
            xp: state.xp + xpGain,
            topicProgress,
            stormMeter,
            shipPosition,
            currentTopicId,
            xpAnimation: xpGain,
            achievements: [...state.achievements, ...newAchievements, ...(badge ? [] : [])],
            achievementPopup: newAchievements[0] || null,
          });

          if (shouldTriggerStorm({ ...state, stormMeter })) {
            setTimeout(() => get().triggerStorm(), 1500);
          }
        } else if (session.mode === 'storm') {
          get().completeStormChallenge(percent >= 80);
        } else if (session.mode === 'final-review') {
          const unresolved = state.mistakes.filter((m) => !m.resolved).length;
          const sessionResolved = session.answers.filter((a) => a.correct).length;
          if (unresolved - sessionResolved <= 0 || percent >= 80) {
            set({
              finalReviewCompleted: true,
              xp: state.xp + GAME_CONFIG.xp.finalReview,
              quizSession: null,
              currentScreen: 'map',
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
        get().startQuiz(get().stormTargetTopicId || 'linux', 'storm');
        set({ stormChallengeActive: true, currentScreen: 'storm-challenge' });
      },

      startFinalReview: () => {
        get().startQuiz('linux', 'final-review');
        set({ currentScreen: 'final-review' });
      },

      resolveMistake: (questionId) => {
        const state = get();
        set({
          mistakes: state.mistakes.map((m) =>
            m.questionId === questionId ? { ...m, resolved: true } : m,
          ),
        });
      },

      triggerStorm: () => {
        const state = get();
        const weakest = findWeakestTopic(state.topicProgress, state.mistakes);
        if (!weakest) return;
        set({
          stormActive: true,
          stormTargetTopicId: weakest,
          stormOverlay: true,
          currentTopicId: weakest,
        });
        setTimeout(() => set({ stormOverlay: false }), 4000);
      },

      completeStormChallenge: (passed) => {
        const state = get();
        if (passed) {
          set({
            stormActive: false,
            stormChallengeActive: false,
            stormMeter: adjustStormMeter(state.stormMeter, GAME_CONFIG.storm.stormChallengePass),
            xp: state.xp + GAME_CONFIG.xp.stormChallenge,
            quizSession: null,
            currentScreen: 'map',
            xpAnimation: GAME_CONFIG.xp.stormChallenge,
            achievements: state.achievements.includes('storm-master-earned')
              ? state.achievements
              : [...state.achievements, 'storm-master-earned'],
          });
        } else {
          const target = state.stormTargetTopicId;
          if (target) {
            const progress = { ...state.topicProgress[target], status: 'needs_repair' as const };
            set({
              topicProgress: { ...state.topicProgress, [target]: progress },
              stormChallengeActive: false,
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
        const canUnlock =
          allDone && state.finalReviewCompleted && state.pdfMeta && !state.treasureUnlocked;
        if (canUnlock) {
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
      partialize: (state) => {
        const {
          currentScreen: _,
          quizSession: __,
          xpAnimation: ___,
          achievementPopup: ____,
          stormOverlay: _____,
          ...rest
        } = state;
        return rest as PlayerState & { pdfMeta: typeof state.pdfMeta };
      },
    },
  ),
);
