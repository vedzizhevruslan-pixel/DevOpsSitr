import { linuxInterviewQuestions } from './linux-interview';
import { networksInterviewQuestions } from './networks-interview';
import { terraformInterviewQuestions } from './terraform-interview';
import { dockerInterviewQuestions } from './docker-interview';
import { kubernetesInterviewQuestions } from './kubernetes-interview';
import { gitlabInterviewQuestions } from './gitlab-interview';
import { captainExamInterviewQuestions } from './captain-exam-interview';
import type { Question, TopicId } from '../../../types';
import { INTERVIEW_SOURCE } from './helpers';

export const ALL_INTERVIEW_QUESTIONS: Question[] = [
  ...linuxInterviewQuestions,
  ...networksInterviewQuestions,
  ...terraformInterviewQuestions,
  ...dockerInterviewQuestions,
  ...kubernetesInterviewQuestions,
  ...gitlabInterviewQuestions,
  ...captainExamInterviewQuestions,
];

export function getInterviewQuestionsByTopic(topicId: TopicId): Question[] {
  return ALL_INTERVIEW_QUESTIONS.filter((q) => q.topicId === topicId);
}

export function getCaptainExamPool(): Question[] {
  return captainExamInterviewQuestions;
}

export { INTERVIEW_SOURCE };
