export type TopicId =
  | 'linux'
  | 'networks'
  | 'ansible'
  | 'terraform'
  | 'docker'
  | 'kubernetes'
  | 'gitlab-cicd';

export type QuestionType =
  | 'single'
  | 'multiple'
  | 'truefalse'
  | 'command'
  | 'order'
  | 'match'
  | 'scenario'
  | 'config';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type IslandStatus =
  | 'locked'
  | 'available'
  | 'in_progress'
  | 'completed'
  | 'weak'
  | 'mastered'
  | 'needs_repair';

export type MasteryStatus =
  | 'weak'
  | 'needs_review'
  | 'unstable'
  | 'good'
  | 'mastered';

export interface Question {
  id: string;
  topicId: TopicId;
  skillTag: string;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  options?: string[];
  correctAnswer: string | string[] | boolean;
  explanation: string;
  remember?: string;
  configSnippet?: string;
}

export interface LessonChapter {
  id: string;
  title: string;
  duration: string;
  content: string;
  commands?: string[];
  tips?: string[];
  mistakes?: string[];
}

export interface PracticeExercise {
  id: string;
  title: string;
  description: string;
  type: 'terminal' | 'network' | 'yaml' | 'hcl' | 'dockerfile' | 'k8s' | 'pipeline' | 'quiz';
  prompt: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  skillTag: string;
}

export interface Topic {
  id: TopicId;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  order: number;
  badge: string;
  badgeRu: string;
  icon: string;
  color: string;
  recommendedXp: number;
  unlockMastery: number;
}

export interface MistakeRecord {
  questionId: string;
  topicId: TopicId;
  skillTag: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string;
  wrongCount: number;
  correctAfterMistakeCount: number;
  firstMistakeAt: string;
  lastMistakeAt: string;
  resolved: boolean;
}

export interface TopicProgress {
  topicId: TopicId;
  masteryScore: number;
  chaptersCompleted: string[];
  practiceCompleted: string[];
  quizAttempts: QuizAttempt[];
  bestQuizScore: number;
  lastQuizScore: number;
  status: IslandStatus;
  firstAttemptAccuracy: number[];
}

export interface QuizAttempt {
  id: string;
  date: string;
  score: number;
  total: number;
  questionIds: string[];
}

export interface Achievement {
  id: string;
  title: string;
  titleRu: string;
  description: string;
  descriptionRu: string;
  icon: string;
}

export interface Level {
  xp: number;
  title: string;
  titleRu: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  titleRu: string;
  type: 'chapter' | 'questions' | 'fix_mistakes' | 'weak_skill';
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  date: string;
}

export interface PdfOfferMeta {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  type: string;
}

export interface PlayerState {
  version: number;
  captainName: string;
  xp: number;
  coins: number;
  tickets: number;
  stormMeter: number;
  currentTopicId: TopicId;
  shipPosition: number;
  topicProgress: Record<TopicId, TopicProgress>;
  mistakes: MistakeRecord[];
  achievements: string[];
  streak: number;
  lastActiveDate: string;
  dailyQuest: DailyQuest | null;
  soundEnabled: boolean;
  finalReviewCompleted: boolean;
  treasureUnlocked: boolean;
  legendaryMode: boolean;
  correctStreak: number;
  bestCorrectStreak: number;
  totalCorrect: number;
  totalWrong: number;
  stormActive: boolean;
  stormTargetTopicId: TopicId | null;
  stormChallengeActive: boolean;
  spacedReviewQueue: string[];
}

export type Screen =
  | 'map'
  | 'lesson'
  | 'practice'
  | 'quiz'
  | 'mistakes'
  | 'stats'
  | 'settings'
  | 'error-bay'
  | 'final-review'
  | 'treasure'
  | 'storm-challenge'
  | 'legendary'
  | 'achievements'
  | 'quests';

export interface QuizSession {
  topicId: TopicId;
  questions: Question[];
  currentIndex: number;
  answers: Array<{
    questionId: string;
    selected: string | string[] | boolean;
    correct: boolean;
    firstAttempt: boolean;
  }>;
  mode: 'topic' | 'storm' | 'final-review' | 'spaced' | 'legendary';
}
