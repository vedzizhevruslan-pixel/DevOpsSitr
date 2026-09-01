import { linuxQuestions } from './linux';
import { networksQuestions } from './networks';
import { ansibleQuestions } from './ansible';
import { terraformQuestions } from './terraform';
import { dockerQuestions } from './docker';
import { kubernetesQuestions } from './kubernetes';
import { gitlabCicdQuestions } from './gitlab-cicd';
import type { Question, TopicId } from '../../types';

export const ALL_QUESTIONS: Question[] = [
  ...linuxQuestions,
  ...networksQuestions,
  ...ansibleQuestions,
  ...terraformQuestions,
  ...dockerQuestions,
  ...kubernetesQuestions,
  ...gitlabCicdQuestions,
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
