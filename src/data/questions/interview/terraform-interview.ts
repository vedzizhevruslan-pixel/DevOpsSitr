import { iq } from './helpers';

export const terraformInterviewQuestions = [
  iq(
    'TERRAFORM-01',
    'terraform',
    'iac-concepts',
    'single',
    'medium',
    'Terraform vs Python для управления облачными ресурсами — когда что выбрать?',
    [
      'Terraform — declarative IaC, state, plan/apply, drift detection; Python — imperative automation и сложная логика',
      'Python всегда лучше Terraform',
      'Terraform не поддерживает модули',
      'Terraform только для on-premise',
    ],
    'Terraform — declarative IaC, state, plan/apply, drift detection; Python — imperative automation и сложная логика',
    'Terraform: декларативный подход, единый state, plan preview, idempotency, modules, remote state. Python (boto3, SDK): гибкая логика, но сложнее drift и idempotency. Часто используют вместе: Terraform — infra, Python — glue/scripts.',
    { remember: 'Связанные концепции: plan/apply, state, drift, modules, Terragrunt, remote state.' },
  ),
];
