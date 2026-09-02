import type { Question, TopicId } from '../../../types';

export const INTERVIEW_SOURCE = 'devops-interview-guide' as const;
export const INTERVIEW_WEIGHT = 1.25;

export function iq(
  id: string,
  topicId: TopicId,
  skillTag: string,
  type: Question['type'],
  difficulty: Question['difficulty'],
  question: string,
  options: string[],
  correctAnswer: string | string[] | boolean | Record<string, string>,
  explanation: string,
  extras?: Partial<Question>,
): Question {
  return {
    id,
    topicId,
    skillTag,
    type,
    difficulty,
    question,
    options,
    correctAnswer,
    explanation,
    source: INTERVIEW_SOURCE,
    interviewWeight: INTERVIEW_WEIGHT,
    ...extras,
  };
}

export function isInterviewQuestion(q: Question): boolean {
  return q.source === INTERVIEW_SOURCE;
}
