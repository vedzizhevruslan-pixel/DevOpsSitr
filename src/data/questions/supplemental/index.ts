import { linuxSupplementalQuestions } from './linux-supplemental';
import { networksSupplementalQuestions } from './networks-supplemental';
import { ansibleSupplementalQuestions } from './ansible-supplemental';
import { terraformSupplementalQuestions } from './terraform-supplemental';
import { dockerSupplementalQuestions } from './docker-supplemental';
import { kubernetesSupplementalQuestions } from './kubernetes-supplemental';
import { gitlabSupplementalQuestions } from './gitlab-supplemental';

export { SUPPLEMENTAL_SOURCE } from './helpers';

export const ALL_SUPPLEMENTAL_QUESTIONS = [
  ...linuxSupplementalQuestions,
  ...networksSupplementalQuestions,
  ...ansibleSupplementalQuestions,
  ...terraformSupplementalQuestions,
  ...dockerSupplementalQuestions,
  ...kubernetesSupplementalQuestions,
  ...gitlabSupplementalQuestions,
];

export const SUPPLEMENTAL_QUESTION_COUNT = ALL_SUPPLEMENTAL_QUESTIONS.length;
