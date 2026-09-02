import { linuxQuestions } from './linux';
import { networksQuestions } from './networks';
import { ansibleQuestions } from './ansible';
import { terraformQuestions } from './terraform';
import { dockerQuestions } from './docker';
import { kubernetesQuestions } from './kubernetes';
import { gitlabCicdQuestions } from './gitlab-cicd';
import { ALL_INTERVIEW_QUESTIONS } from './interview';
import type { Question, TopicId } from '../../types';
import { INTERVIEW_SOURCE } from './interview/helpers';

export const ALL_QUESTIONS: Question[] = [
  ...linuxQuestions,
  ...networksQuestions,
  ...ansibleQuestions,
  ...terraformQuestions,
  ...dockerQuestions,
  ...kubernetesQuestions,
  ...gitlabCicdQuestions,
  ...ALL_INTERVIEW_QUESTIONS,
];

export function getQuestionsByTopic(topicId: TopicId): Question[] {
  return ALL_QUESTIONS.filter((q) => q.topicId === topicId);
}

export function getQuestionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id);
}

export function getQuestionsBySkillTag(skillTag: string): Question[] {
  return ALL_QUESTIONS.filter((q) => q.skillTag === skillTag);
}

export function getInterviewQuestions(): Question[] {
  return ALL_QUESTIONS.filter((q) => q.source === INTERVIEW_SOURCE);
}

export function isInterviewSourceQuestion(q: Question): boolean {
  return q.source === INTERVIEW_SOURCE;
}

export const INTERVIEW_QUESTION_COUNT = ALL_INTERVIEW_QUESTIONS.length;
