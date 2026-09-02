import type { PracticeExercise } from '../../types';

type ChoiceInput = {
  id: string;
  title: string;
  skillTag: string;
  type?: PracticeExercise['type'];
  scenario: string;
  objective: string;
  options: string[];
  correctAnswer: string;
  acceptedAnswers?: string[];
  hints?: string[];
  successExplanation: string;
  failureFeedback?: string;
  wrongAnswerHints?: Record<string, string>;
};

function choice(partial: ChoiceInput): PracticeExercise {
  return {
    id: partial.id,
    title: partial.title,
    skillTag: partial.skillTag,
    type: partial.type ?? 'quiz',
    interaction: 'choice',
    description: partial.scenario,
    prompt: partial.objective,
    scenario: partial.scenario,
    objective: partial.objective,
    options: partial.options,
    correctAnswer: partial.correctAnswer,
    acceptedAnswers: partial.acceptedAnswers ?? [partial.correctAnswer],
    hints: partial.hints,
    explanation: partial.successExplanation,
    successExplanation: partial.successExplanation,
    failureFeedback: partial.failureFeedback,
    wrongAnswerHints: partial.wrongAnswerHints,
  };
}

export const networksPractice: PracticeExercise[] = [
  choice({
    id: 'net-p1',
    title: 'Где сломалась сеть?',
    skillTag: 'network-diagnostics',
    type: 'network',
    scenario:
      'Пользователь не может открыть сайт. DNS resolve проходит успешно, но `nc -vz host 443` завершается timeout. Ping до хоста работает.',
    objective: 'Определи наиболее вероятную точку проблемы.',
    options: [
      'Проблема с DNS',
      'Firewall / security group блокирует TCP 443',
      'Неверный default gateway на клиенте',
      'Сервер полностью выключен',
    ],
    correctAnswer: 'Firewall / security group блокирует TCP 443',
    acceptedAnswers: ['Firewall / security group блокирует TCP 443'],
    hints: [
      'DNS и ping уже работают — L3/имя в порядке.',
      'Timeout на порту часто значит DROP, а не «сервер мёртв».',
      'Подумай про firewall / security group на 443.',
    ],
    successExplanation:
      'Ping и DNS OK → хост жив. Timeout на 443 → пакеты режутся firewall/SG/ACL или сервис не отвечает. Connection refused было бы при закрытом порте с RST.',
    failureFeedback: '✗ Это не самая вероятная причина при успешном DNS и ping, но timeout на 443.',
    wrongAnswerHints: {
      'Проблема с DNS': '✗ DNS уже успешно резолвит имя.',
      'Неверный default gateway на клиенте': '✗ Тогда не работал бы и ping до удалённого хоста.',
      'Сервер полностью выключен': '✗ Ping до хоста проходит — сервер отвечает на ICMP.',
    },
  }),
  choice({
    id: 'net-p2',
    title: 'Gateway подсети',
    skillTag: 'subnetting',
    type: 'network',
    scenario: 'Хост получил адрес `10.0.1.50/24`. Нужно указать типичный default gateway этой подсети.',
    objective: 'Выбери наиболее вероятный gateway.',
    options: ['10.0.1.0', '10.0.1.1', '10.0.1.255', '10.0.0.1'],
    correctAnswer: '10.0.1.1',
    hints: [
      'Gateway — обычно первый usable host в подсети.',
      '.0 — network address, .255 — broadcast.',
      'Чаще всего gateway = `.1`.',
    ],
    successExplanation: 'В `/24` сеть `10.0.1.0`, broadcast `10.0.1.255`, hosts `.1–.254`. Gateway почти всегда `.1`.',
    failureFeedback: '✗ Вспомни: network, broadcast и первый host — разные адреса.',
  }),
  choice({
    id: 'net-p3',
    title: 'TCP или UDP?',
    skillTag: 'protocols',
    type: 'network',
    scenario: 'Нужно передать HTTP API-запросы с гарантией доставки и порядка пакетов.',
    objective: 'Какой транспортный протокол использовать?',
    options: ['UDP', 'TCP', 'ICMP', 'ARP'],
    correctAnswer: 'TCP',
    hints: [
      'Нужна надёжная доставка и порядок.',
      'HTTP/HTTPS работают поверх одного из этих протоколов.',
      'Это connection-oriented протокол с handshake.',
    ],
    successExplanation: 'TCP — надёжный, упорядоченный, с retransmission. HTTP/HTTPS поверх TCP. UDP — для DNS/метрик/streaming без гарантий.',
    failureFeedback: '✗ Для HTTP API нужна надёжная доставка.',
  }),
  choice({
    id: 'net-p4',
    title: 'Refused vs Timeout',
    skillTag: 'ports',
    type: 'network',
    scenario:
      'Подключение к порту 5432 даёт `Connection refused`. Хост пингуется.',
    objective: 'Что это обычно означает?',
    options: [
      'Firewall DROP — пакеты теряются',
      'Хост доступен, но сервис не слушает порт (или REJECT)',
      'DNS не резолвит имя',
      'Нет маршрута до хоста',
    ],
    correctAnswer: 'Хост доступен, но сервис не слушает порт (или REJECT)',
    hints: [
      'Refused ≠ timeout.',
      'Refused — хост ответил RST.',
      'Значит порт закрыт или сервис не запущен.',
    ],
    successExplanation:
      'Connection refused = TCP RST от хоста. Timeout = нет ответа (DROP/routing). Различие критично для диагностики.',
    failureFeedback: '✗ Refused и timeout — разные симптомы.',
  }),
];

export const ansiblePractice: PracticeExercise[] = [
  choice({
    id: 'ans-p1',
    title: 'Restart только при изменении',
    skillTag: 'handlers',
    type: 'yaml',
    scenario:
      'На 20 серверах обновляется `nginx.conf`. Перезапускать nginx нужно ТОЛЬКО если конфигурация действительно изменилась.',
    objective: 'Какой механизм Ansible использовать?',
    options: [
      'Всегда `shell: systemctl restart nginx` в конце playbook',
      'notify + handlers — restart только при changed',
      'serial: 1 без handlers',
      'ignore_errors: yes',
    ],
    correctAnswer: 'notify + handlers — restart только при changed',
    hints: [
      'Нужен запуск действия только если task реально что-то изменил.',
      'В Ansible для этого есть notify.',
      'Handlers выполняются в конце play при changed.',
    ],
    successExplanation:
      'Task с `notify: Restart nginx` вызывает handler только при `changed: true`. Handler дедуплицируется и не рестартит зря.',
    failureFeedback: '✗ Нужен условный restart только после реального изменения конфига.',
  }),
  choice({
    id: 'ans-p2',
    title: 'Список серверов',
    skillTag: 'inventory',
    type: 'yaml',
    scenario: 'Playbook должен выполниться только на группе `webservers`, а не на всех хостах.',
    objective: 'Где задаётся список/группы управляемых хостов?',
    options: ['Inventory', 'Handler', 'Vault', 'Galaxy'],
    correctAnswer: 'Inventory',
    hints: [
      'Это файл или источник с хостами и группами.',
      'В play указывают `hosts: webservers`.',
      'Называется inventory.',
    ],
    successExplanation: 'Inventory описывает hosts и groups. Play выбирает цель через `hosts:`.',
    failureFeedback: '✗ Без inventory Ansible не знает, куда подключаться.',
  }),
  choice({
    id: 'ans-p3',
    title: 'Идемпотентная установка',
    skillTag: 'modules',
    type: 'yaml',
    scenario: 'Нужно установить nginx так, чтобы повторный запуск playbook не делал лишних изменений.',
    objective: 'Что предпочтительнее?',
    options: [
      'shell: apt install nginx',
      'ansible.builtin.package / apt с state=present',
      'command: apt-get install -y nginx каждый раз',
      'raw: yum install nginx',
    ],
    correctAnswer: 'ansible.builtin.package / apt с state=present',
    hints: [
      'Modules проверяют desired state.',
      'shell почти всегда `changed`.',
      'Используй package/apt module.',
    ],
    successExplanation:
      'Modules идемпотентны: если пакет уже установлен, `changed=0`. shell не проверяет состояние.',
    failureFeedback: '✗ shell/command не дают настоящей идемпотентности.',
  }),
  choice({
    id: 'ans-p4',
    title: 'Rolling update',
    skillTag: 'rolling-update',
    type: 'yaml',
    scenario: '100 серверов. Нельзя перезапускать nginx на всех сразу.',
    objective: 'Как ограничить параллельность обновления?',
    options: ['serial: 10', 'forks без контроля batches', 'any_errors_fatal только', 'gather_facts: false'],
    correctAnswer: 'serial: 10',
    hints: [
      'Нужны batch’и хостов.',
      'Директива на уровне play.',
      'Называется `serial`.',
    ],
    successExplanation: '`serial: 10` (или процент) обновляет хосты пачками — controlled rolling deployment.',
    failureFeedback: '✗ Нужен контролируемый rolling batch.',
  }),
];

export const terraformPractice: PracticeExercise[] = [
  choice({
    id: 'tf-p1',
    title: 'Читаем terraform plan',
    skillTag: 'plan',
    type: 'hcl',
    scenario:
      'Terraform Plan показывает:\n+ aws_instance.web\n~ aws_security_group.app\n- aws_instance.old',
    objective: 'Что произойдёт после `terraform apply`?',
    options: [
      'Создаст web, обновит security_group.app, удалит old',
      'Удалит все три ресурса',
      'Только создаст web',
      'Ничего не изменит',
    ],
    correctAnswer: 'Создаст web, обновит security_group.app, удалит old',
    hints: [
      '`+` означает create.',
      '`~` — update in-place.',
      '`-` — destroy.',
    ],
    successExplanation: '`+` create, `~` update, `-` destroy. Это язык terraform plan.',
    failureFeedback: '✗ Перечитай символы plan: + ~ -',
  }),
  choice({
    id: 'tf-p2',
    title: 'Первый шаг workflow',
    skillTag: 'workflow',
    type: 'hcl',
    scenario: 'Новый проект Terraform. Providers ещё не скачаны, backend не инициализирован.',
    objective: 'Какую команду запустить первой?',
    options: ['terraform apply', 'terraform init', 'terraform destroy', 'terraform output'],
    correctAnswer: 'terraform init',
    hints: [
      'Сначала нужно подготовить рабочую директорию.',
      'Скачать providers и настроить backend.',
      'Команда — `init`.',
    ],
    successExplanation: '`terraform init` загружает providers/modules и настраивает backend. Затем plan → apply.',
    failureFeedback: '✗ Без init plan/apply часто не заработают.',
  }),
  choice({
    id: 'tf-p3',
    title: 'Зачем state?',
    skillTag: 'state',
    type: 'hcl',
    scenario: 'Terraform создал EC2 `i-0abc`. Откуда он знает, какой resource в .tf соответствует этому ID?',
    objective: 'Что хранит эту связь?',
    options: ['Только файл .tf', 'terraform.tfstate', 'provider schema', 'gitignore'],
    correctAnswer: 'terraform.tfstate',
    hints: [
      'Это JSON-файл с маппингом.',
      'Без него Terraform «забывает» реальные ID.',
      'Называется state.',
    ],
    successExplanation: 'State связывает адреса ресурсов в HCL с реальными ID и атрибутами в облаке.',
    failureFeedback: '✗ .tf описывает desired state, но не хранит cloud IDs.',
  }),
  choice({
    id: 'tf-p4',
    title: 'Два apply без lock',
    skillTag: 'state-locking',
    type: 'hcl',
    scenario: 'Два инженера одновременно запускают `terraform apply` с одним remote state без locking.',
    objective: 'Какой главный риск?',
    options: [
      'Race condition и повреждение state / дубли ресурсов',
      'Terraform автоматически смержит изменения',
      'Второй apply просто подождёт вечно без ошибок',
      'Никакого риска',
    ],
    correctAnswer: 'Race condition и повреждение state / дубли ресурсов',
    hints: [
      'State — общий источник правды.',
      'Параллельные записи опасны.',
      'Для этого нужен state locking.',
    ],
    successExplanation: 'Без locking возможны concurrent writes → corrupt state, orphaned/duplicate resources. Используй DynamoDB lock / TFC.',
    failureFeedback: '✗ Concurrent apply без lock — опасная гонка.',
  }),
];

export const dockerPractice: PracticeExercise[] = [
  {
    id: 'dock-p1',
    title: 'Порядок Dockerfile и cache',
    description: 'Собери Dockerfile эффективно',
    type: 'dockerfile',
    interaction: 'order',
    skillTag: 'layer-cache',
    prompt: 'Выбери более эффективный порядок для layer cache.',
    scenario:
      'Нужно собрать Node.js image так, чтобы `npm install` не перезапускался при каждом изменении исходников.',
    objective: 'Какой вариант лучше использует Docker layer cache?',
    options: [
      'COPY package*.json → RUN npm install → COPY . .',
      'COPY . . → RUN npm install',
      'RUN npm install → COPY package*.json → COPY . .',
      'COPY . . → COPY package*.json → RUN npm install',
    ],
    correctAnswer: 'COPY package*.json → RUN npm install → COPY . .',
    acceptedAnswers: ['COPY package*.json → RUN npm install → COPY . .'],
    hints: [
      'Сначала копируй редко меняющиеся файлы.',
      '`package.json` меняется реже, чем исходники.',
      'Сначала deps, потом `COPY . .`.',
    ],
    explanation: 'Dependencies layer кэшируется.',
    successExplanation:
      'Сначала `package*.json` + `npm install` — слой кэшируется. `COPY . .` в конце не инвалидирует install при правках кода.',
    failureFeedback: '✗ Подумай, какой слой инвалидируется при изменении src/.',
  },
  choice({
    id: 'dock-p2',
    title: 'Новый контейнер',
    skillTag: 'container-management',
    type: 'quiz',
    scenario: 'Нужно создать и сразу запустить новый контейнер из image `nginx`.',
    objective: 'Какую команду использовать?',
    options: ['docker start nginx', 'docker run nginx', 'docker exec nginx', 'docker build nginx'],
    correctAnswer: 'docker run nginx',
    hints: [
      '`start` — только для уже существующего stopped container.',
      '`exec` — команда внутри running container.',
      'Создать + start = `run`.',
    ],
    successExplanation: '`docker run` = create + start. `docker start` поднимает существующий контейнер.',
    failureFeedback: '✗ Нужно создать новый контейнер, не только стартовать старый.',
  }),
  choice({
    id: 'dock-p3',
    title: 'Данные БД',
    skillTag: 'volumes',
    type: 'quiz',
    scenario: 'PostgreSQL в контейнере. Контейнер могут удалить. Данные нельзя потерять.',
    objective: 'Куда класть данные БД?',
    options: [
      'Только в writable layer контейнера',
      'Named volume / bind mount',
      'Только в image layer',
      'В ENV переменные',
    ],
    correctAnswer: 'Named volume / bind mount',
    hints: [
      'Writable layer удаляется вместе с контейнером.',
      'Нужно хранилище вне lifecycle контейнера.',
      'Volumes / bind mounts.',
    ],
    successExplanation: 'Volumes переживают удаление контейнера. Данные БД всегда на volume.',
    failureFeedback: '✗ Writable layer не переживает `docker rm`.',
  }),
  choice({
    id: 'dock-p4',
    title: 'Порт недоступен с host',
    skillTag: 'networking',
    type: 'quiz',
    scenario:
      'Внутри контейнера `curl localhost:8080` работает. С хоста `curl localhost:8080` — connection refused.',
    objective: 'Что проверить в первую очередь?',
    options: [
      'Опубликован ли порт: `-p 8080:8080`',
      'Удалить image и пересобрать без причин',
      'Сменить базовый image на Alpine',
      'Добавить EXPOSE — этого достаточно для публикации',
    ],
    correctAnswer: 'Опубликован ли порт: `-p 8080:8080`',
    hints: [
      '`EXPOSE` только документирует порт.',
      'Публикация на host — через `-p`.',
      'Проверь `docker ps` → колонка PORTS.',
    ],
    successExplanation:
      'Без `-p` порт контейнера не проброшен на host. `EXPOSE` сам по себе не публикует.',
    failureFeedback: '✗ Скорее всего нет publish порта на host.',
  }),
];

export const kubernetesPractice: PracticeExercise[] = [
  choice({
    id: 'k8s-p1',
    title: 'Service без трафика',
    skillTag: 'service-troubleshooting',
    type: 'k8s',
    scenario:
      '3 Pod’а Running. Service существует, но трафик до Pods не доходит. Endpoints пустые.',
    objective: 'Какая причина наиболее вероятна?',
    options: [
      'Service selector не совпадает с labels Pod',
      'Deployment всегда создаёт пустые Endpoints',
      'Нужно удалить namespace',
      'kubectl logs чинит Service',
    ],
    correctAnswer: 'Service selector не совпадает с labels Pod',
    hints: [
      'Service выбирает Pods по labels.',
      'Пустые Endpoints = никто не попал под selector.',
      'Сверь `spec.selector` и labels Pod.',
    ],
    successExplanation:
      'Service → selector → Pod labels → Endpoints. Mismatch = пустые endpoints = нет трафика.',
    failureFeedback: '✗ Начни с selector / labels / endpoints.',
  }),
  choice({
    id: 'k8s-p2',
    title: 'Минимальная единица',
    skillTag: 'pods',
    type: 'k8s',
    scenario: 'Нужно запустить один контейнер приложения в кластере.',
    objective: 'Какой объект — минимальная единица scheduling?',
    options: ['Deployment', 'Pod', 'Service', 'Ingress'],
    correctAnswer: 'Pod',
    hints: [
      'Deployment управляет ReplicaSet/Pods.',
      'Scheduler ставит на node именно…',
      'Ответ — Pod.',
    ],
    successExplanation: 'Pod — атомарная единица в Kubernetes. Deployment лишь управляет репликами Pod.',
    failureFeedback: '✗ Service/Ingress — про сеть, не про запуск контейнера.',
  }),
  choice({
    id: 'k8s-p3',
    title: 'Удалили Pod у Deployment',
    skillTag: 'desired-state',
    type: 'k8s',
    scenario: 'Deployment с `replicas: 3`. Ты удалил один Pod вручную.',
    objective: 'Что сделает Kubernetes?',
    options: [
      'Создаст новый Pod — вернёт desired state',
      'Уменьшит replicas до 2 навсегда',
      'Удалит Deployment',
      'Ничего не произойдёт',
    ],
    correctAnswer: 'Создаст новый Pod — вернёт desired state',
    hints: [
      'Controllers постоянно reconcile.',
      'Desired ≠ actual → controller действует.',
      'ReplicaSet создаст недостающий Pod.',
    ],
    successExplanation: 'Reconciliation loop: actual < desired → создаётся новый Pod. Ручное удаление не уменьшает replicas.',
    failureFeedback: '✗ Deployment стремится поддерживать число реплик.',
  }),
  choice({
    id: 'k8s-p4',
    title: 'Pod Pending',
    skillTag: 'troubleshooting',
    type: 'k8s',
    scenario: 'Новый Pod застрял в `Pending`. `kubectl describe` показывает scheduling events.',
    objective: 'Что проверить в первую очередь?',
    options: [
      'CPU/RAM на nodes, affinity, taints, PVC',
      'Только цвет логотипа в Dashboard',
      'docker build на ноутбуке',
      'Удалить etcd сразу',
    ],
    correctAnswer: 'CPU/RAM на nodes, affinity, taints, PVC',
    hints: [
      'Pending = ещё не scheduled.',
      'Частые причины: resources, taints, PVC.',
      'Смотри Events в describe.',
    ],
    successExplanation:
      'Pending значит scheduler не нашёл node: insufficient resources, selectors, taints/tolerations, unbound PVC.',
    failureFeedback: '✗ Pending — проблема scheduling, не runtime логов приложения.',
  }),
];

export const gitlabPractice: PracticeExercise[] = [
  choice({
    id: 'gl-p1',
    title: 'Ускорить pipeline',
    skillTag: 'stages',
    type: 'pipeline',
    scenario:
      'Pipeline слишком медленный. Jobs `test` и `lint` не зависят друг от друга, но сейчас ждут друг друга из‑за разных stage.',
    objective: 'Как сделать, чтобы они могли идти параллельно (или независимее)?',
    options: [
      'Поместить в один stage или связать через needs, убрав ложную зависимость',
      'Всегда запускать только последовательно',
      'Удалить Runner',
      'allow_failure: true на всём pipeline',
    ],
    correctAnswer: 'Поместить в один stage или связать через needs, убрав ложную зависимость',
    hints: [
      'Jobs одного stage идут параллельно.',
      '`needs:` строит DAG и может обойти порядок stage.',
      'Убери ложную зависимость test↔lint.',
    ],
    successExplanation:
      'Один stage → параллельно. Или `needs:` для DAG. Не заставляй независимые jobs ждать друг друга.',
    failureFeedback: '✗ Нужна параллельность независимых jobs.',
  }),
  choice({
    id: 'gl-p2',
    title: 'Cache vs Artifacts',
    skillTag: 'cache-artifacts',
    type: 'pipeline',
    scenario: 'Job `build` собрал бинарник. Job `deploy` должен получить этот файл.',
    objective: 'Что использовать?',
    options: ['cache', 'artifacts', 'только masked variable', 'protected branch'],
    correctAnswer: 'artifacts',
    hints: [
      'Cache ускоряет повторные installs.',
      'Передача файла между jobs — другое.',
      'Это artifacts.',
    ],
    successExplanation: 'Artifacts передают файлы между jobs/stages. Cache — для ускорения (node_modules), без гарантий handoff.',
    failureFeedback: '✗ Для передачи бинарника в deploy нужны artifacts.',
  }),
  choice({
    id: 'gl-p3',
    title: 'Production approval',
    skillTag: 'deployments',
    type: 'pipeline',
    scenario: 'Deploy в production должен ждать ручного одобрения release manager.',
    objective: 'Какой механизм?',
    options: ['when: manual', 'when: always', 'allow_failure: true', 'only: schedules'],
    correctAnswer: 'when: manual',
    hints: [
      'Job не должен стартовать сам.',
      'В UI появляется кнопка Play.',
      '`when: manual`.',
    ],
    successExplanation: '`when: manual` — human gate перед production. Часто + protected environment.',
    failureFeedback: '✗ Нужен ручной запуск job.',
  }),
  choice({
    id: 'gl-p4',
    title: 'Секреты в CI',
    skillTag: 'variables-security',
    type: 'pipeline',
    scenario: 'В pipeline нужен пароль БД. В `.gitlab-ci.yml` его писать нельзя.',
    objective: 'Как передать секрет правильно?',
    options: [
      'CI/CD Variables (masked/protected) или secret manager',
      'Захардкодить в script',
      'Закоммитить .env в репозиторий',
      'Написать пароль в названии job',
    ],
    correctAnswer: 'CI/CD Variables (masked/protected) или secret manager',
    hints: [
      'Секреты не должны жить в Git history.',
      'GitLab умеет Variables.',
      'Masked + protected для production.',
    ],
    successExplanation:
      'CI/CD Variables / Vault. Masked скрывает в логах, protected — только на protected branches.',
    failureFeedback: '✗ Пароль в yaml/git — утечка.',
  }),
];
