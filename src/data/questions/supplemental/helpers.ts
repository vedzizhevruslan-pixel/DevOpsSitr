import type { Question, TopicId } from '../../../types';

export const SUPPLEMENTAL_SOURCE = 'devops-pirate-voyage' as const;

export function pq(
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
    source: SUPPLEMENTAL_SOURCE,
    ...extras,
  };
}
