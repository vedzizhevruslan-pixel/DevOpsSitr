import type { LessonChapter, PracticeExercise, TopicId } from '../../types';

export const linuxLessons: LessonChapter[] = [
  {
    id: 'linux-ch1',
    title: 'Пиратский терминал',
    duration: '5 мин',
    content: 'Linux — фундамент DevOps. Каждый капитан начинает с терминала. Shell принимает команды и передаёт их ядру ОС. Bash — стандартный shell на большинстве дистрибутивов.',
    commands: ['bash', 'echo $SHELL', 'whoami'],
    tips: ['Используй Tab для автодополнения', 'history покажет прошлые команды'],
  },
  {
    id: 'linux-ch2',
    title: 'Навигация по палубе',
    duration: '6 мин',
    content: 'Файловая система Linux — дерево директорий от корня /. pwd показывает текущую позицию, cd меняет директорию, ls — содержимое.',
    commands: ['pwd', 'cd /var/log', 'ls -la', 'cd ..', 'cd ~'],
    tips: ['ls -la показывает скрытые файлы и права', '~ — домашняя директория'],
    mistakes: ['cd /etс — опечатка вместо /etc'],
  },
  {
    id: 'linux-ch3',
    title: 'Поиск сокровищ',
    duration: '7 мин',
    content: 'find ищет файлы по имени и атрибутам. grep ищет текст внутри файлов. locate быстрее, но использует кэш.',
    commands: ['find /var -name "*.log"', 'grep "error" /var/log/syslog', 'grep -r "pattern" /etc/'],
    tips: ['grep -i — без учёта регистра', 'find . -mtime -7 — файлы за 7 дней'],
  },
  {
    id: 'linux-ch4',
    title: 'Права доступа',
    duration: '6 мин',
    content: 'Каждый файл имеет владельца, группу и права rwx. chmod меняет права, chown — владельца. umask задаёт права по умолчанию.',
    commands: ['ls -l', 'chmod 755 script.sh', 'chmod +x script.sh', 'chown user:group file'],
    tips: ['755 = rwxr-xr-x', 'Никогда не chmod 777 на проде'],
    mistakes: ['chmod 777 «для надёжности» — security risk'],
  },
  {
    id: 'linux-ch5',
    title: 'Управление процессами',
    duration: '7 мин',
    content: 'ps показывает процессы, top/htop — интерактивный мониторинг. kill отправляет сигналы. SIGTERM (15) — graceful, SIGKILL (9) — принудительно.',
    commands: ['ps aux', 'top', 'kill PID', 'kill -9 PID', 'pgrep nginx'],
    tips: ['kill -9 — last resort', 'systemctl для сервисов'],
  },
  {
    id: 'linux-ch6',
    title: 'Диагностика ресурсов',
    duration: '8 мин',
    content: 'Методология USE (Utilization, Saturation, Errors). CPU: top, mpstat. Память: free -h. Диски: iostat, df. Сеть: ss, netstat.',
    commands: ['free -h', 'df -h', 'iostat -xz 1', 'ss -tlnp', 'uptime'],
    tips: ['wa в top — iowait, проблемы с диском', 'Available важнее Free'],
    mistakes: ['Смотреть только CPU, игнорируя iowait'],
  },
];

export const linuxPractice: PracticeExercise[] = [
  {
    id: 'linux-p1', title: 'Просмотр файлов', description: 'Выбери команду для списка файлов',
    type: 'terminal', prompt: '$ ___', options: ['ls', 'cd', 'pwd', 'cat'],
    correctAnswer: 'ls', explanation: 'ls показывает содержимое директории.', skillTag: 'navigation',
  },
  {
    id: 'linux-p2', title: 'Текущая директория', description: 'Где я нахожусь?',
    type: 'terminal', prompt: '$ ___', options: ['pwd', 'ls', 'whoami', 'where'],
    correctAnswer: 'pwd', explanation: 'pwd (print working directory) показывает текущий путь.', skillTag: 'navigation',
  },
  {
    id: 'linux-p3', title: 'Поиск текста', description: 'Найти строку "error" в логе',
    type: 'terminal', prompt: '$ ___ error /var/log/app.log', options: ['grep', 'find', 'locate', 'which'],
    correctAnswer: 'grep', explanation: 'grep ищет паттерн в файле.', skillTag: 'search',
  },
  {
    id: 'linux-p4', title: 'Права доступа', description: 'Сделать скрипт исполняемым',
    type: 'terminal', prompt: '$ ___ +x deploy.sh', options: ['chmod', 'chown', 'chgrp', 'umask'],
    correctAnswer: 'chmod', explanation: 'chmod +x добавляет право на выполнение.', skillTag: 'permissions',
  },
  {
    id: 'linux-p5', title: 'Остановка процесса', description: 'Завершить процесс по PID 1234',
    type: 'terminal', prompt: '$ ___ 1234', options: ['kill', 'stop', 'end', 'halt'],
    correctAnswer: 'kill', explanation: 'kill отправляет сигнал процессу.', skillTag: 'processes',
  },
];

type LessonMap = Record<TopicId, LessonChapter[]>;
type PracticeMap = Record<TopicId, PracticeExercise[]>;

function makeGenericLessons(topicId: TopicId, chapters: Omit<LessonChapter, 'id'>[]): LessonChapter[] {
  return chapters.map((ch, i) => ({ ...ch, id: `${topicId}-ch${i + 1}` }));
}

export const LESSONS: LessonMap = {
  linux: linuxLessons,
  networks: makeGenericLessons('networks', [
    { title: 'IP и подсети', duration: '6 мин', content: 'IP-адрес идентифицирует хост в сети. Маска подсети определяет network и host части. CIDR /24 = 255.255.255.0.', commands: ['ip addr', 'ip route'], tips: ['/24 = 254 хоста'] },
    { title: 'TCP и UDP', duration: '5 мин', content: 'TCP — надёжный с подтверждением. UDP — быстрый без гарантий. HTTP/HTTPS работают поверх TCP.', tips: ['DNS использует UDP, HTTP — TCP'] },
    { title: 'DNS', duration: '6 мин', content: 'DNS переводит имена в IP. A — IPv4, AAAA — IPv6, CNAME — алиас, MX — почта.', commands: ['dig example.com', 'nslookup example.com'] },
    { title: 'Диагностика сети', duration: '7 мин', content: 'ping — доступность. traceroute — маршрут. ss/netstat — соединения. tcpdump — захват пакетов.', commands: ['ping -c 4 host', 'traceroute host', 'ss -tlnp'] },
    { title: 'Балансировка и HA', duration: '7 мин', content: 'L4 — TCP/UDP. L7 — HTTP. KeepAlived + VIP для HA. HAProxy алгоритмы: roundrobin, leastconn.' },
  ]),
  ansible: makeGenericLessons('ansible', [
    { title: 'Основы Ansible', duration: '6 мин', content: 'Ansible — agentless автоматизация через SSH. Inventory, Playbook, Modules, Tasks.', commands: ['ansible all -m ping'] },
    { title: 'Playbook структура', duration: '7 мин', content: 'YAML: hosts, tasks, handlers. Идемпотентность — повторный запуск безопасен.', tips: ['ansible-playbook --check для dry-run'] },
    { title: 'Modules и Roles', duration: '7 мин', content: 'apt, copy, template, service — основные modules. Roles — переиспользуемая структура.', commands: ['ansible-galaxy init myrole'] },
    { title: 'Variables и Templates', duration: '6 мин', content: 'vars, vars_files, -e для extra vars. Jinja2 templates для конфигов.', tips: ['ansible-vault для секретов'] },
    { title: 'Best Practices', duration: '5 мин', content: 'Roles, tags, check mode, become для sudo. Ansible Galaxy для community roles.' },
  ]),
  terraform: makeGenericLessons('terraform', [
    { title: 'IaC и Terraform', duration: '6 мин', content: 'Terraform — декларативный IaC. HCL описывает желаемое состояние. init → plan → apply.', commands: ['terraform init', 'terraform plan', 'terraform apply'] },
    { title: 'Resources и Providers', duration: '7 мин', content: 'resource создаёт объект. provider подключает API. data source читает существующие данные.' },
    { title: 'State и Backend', duration: '7 мин', content: 'State хранит маппинг кода к реальным ID. Remote backend для командной работы.', tips: ['Никогда local state в production'] },
    { title: 'Variables и Modules', duration: '6 мин', content: 'variable для параметров. output для экспорта. modules — переиспользование.', commands: ['terraform fmt', 'terraform validate'] },
    { title: 'Plan vs Apply', duration: '6 мин', content: 'plan показывает +create, ~update, -destroy. apply применяет. destroy удаляет всё.' },
  ]),
  docker: makeGenericLessons('docker', [
    { title: 'Контейнеры vs VM', duration: '6 мин', content: 'Контейнеры используют namespaces и cgroups. Общее ядро, быстрый старт, меньше overhead.', tips: ['Image — шаблон, Container — экземпляр'] },
    { title: 'Dockerfile', duration: '7 мин', content: 'FROM, RUN, COPY, CMD, ENTRYPOINT, EXPOSE. Multi-stage для минимального image.', commands: ['docker build -t myapp .', 'docker run -d -p 8080:80 myapp'] },
    { title: 'Управление контейнерами', duration: '7 мин', content: 'docker ps, logs, exec, stop, rm. Volumes для персистентности. Networks для связи.', commands: ['docker ps -a', 'docker logs', 'docker exec -it'] },
    { title: 'Docker Compose', duration: '6 мин', content: 'compose.yml — multi-container apps. services, networks, volumes.', commands: ['docker compose up -d', 'docker compose down'] },
    { title: 'Security и Optimization', duration: '6 мин', content: 'Non-root USER, scan CVE, .dockerignore, multi-stage, Alpine base.' },
  ]),
  kubernetes: makeGenericLessons('kubernetes', [
    { title: 'Архитектура K8s', duration: '7 мин', content: 'Control Plane: apiserver, etcd, scheduler, controller-manager. Workers: kubelet, kube-proxy, runtime.', tips: ['Backup etcd = backup кластера'] },
    { title: 'Pods и Workloads', duration: '7 мин', content: 'Pod — минимальная единица. Deployment, StatefulSet, DaemonSet — контроллеры.', commands: ['kubectl get pods', 'kubectl describe pod'] },
    { title: 'Services и Ingress', duration: '7 мин', content: 'ClusterIP — internal. NodePort, LoadBalancer — external. Ingress — L7 routing.', commands: ['kubectl get svc', 'kubectl get ingress'] },
    { title: 'Config и Storage', duration: '6 мин', content: 'ConfigMap, Secret, PVC. Namespace для изоляции.', commands: ['kubectl get configmap', 'kubectl get pvc'] },
    { title: 'Probes и Scaling', duration: '7 мин', content: 'Liveness, Readiness, Startup probes. HPA для автомасштабирования.', commands: ['kubectl scale deployment --replicas=5'] },
  ]),
  'gitlab-cicd': makeGenericLessons('gitlab-cicd', [
    { title: 'GitLab CI основы', duration: '6 мин', content: '.gitlab-ci.yml в корне репо. stages, jobs, runners. Pipeline = stages → jobs.', tips: ['Jobs в одном stage — параллельно'] },
    { title: 'Pipeline структура', duration: '7 мин', content: 'Lint → Test → Build → Deploy. artifacts, cache, variables.', commands: ['gitlab-runner register'] },
    { title: 'Advanced CI', duration: '7 мин', content: 'rules, needs (DAG), parallel, extends, include. environments для deploy tracking.' },
    { title: 'Security и Registry', duration: '6 мин', content: 'Trivy scan, Container Registry, masked variables. Protected branches.' },
    { title: 'GitOps и CD', duration: '6 мин', content: 'Helm deploy, ArgoCD GitOps. Manual jobs для production approval.' },
  ]),
  'captain-exam': [],
};

export const PRACTICE: PracticeMap = {
  linux: linuxPractice,
  networks: [
    { id: 'net-p1', title: 'Подсеть', description: 'Определи gateway', type: 'network', prompt: 'IP: 10.0.1.50/24. Gateway?', options: ['10.0.1.0', '10.0.1.1', '10.0.1.255'], correctAnswer: '10.0.1.1', explanation: 'Обычно .1 — gateway.', skillTag: 'subnetting' },
    { id: 'net-p2', title: 'Протокол', description: 'HTTP использует', type: 'network', prompt: 'HTTP работает поверх:', options: ['UDP', 'TCP', 'ICMP'], correctAnswer: 'TCP', explanation: 'HTTP — TCP протокол.', skillTag: 'protocols' },
    { id: 'net-p3', title: 'DNS', description: 'Тип записи', type: 'network', prompt: 'CNAME создаёт:', options: ['IP адрес', 'Алиас на hostname', 'MX запись'], correctAnswer: 'Алиас на hostname', explanation: 'CNAME — canonical name alias.', skillTag: 'dns' },
    { id: 'net-p4', title: 'Порт', description: 'HTTPS порт', type: 'network', prompt: 'HTTPS порт:', options: ['80', '443', '22'], correctAnswer: '443', explanation: 'HTTPS = 443.', skillTag: 'ports' },
  ],
  ansible: [
    { id: 'ans-p1', title: 'Inventory', description: 'Что такое inventory', type: 'yaml', prompt: 'Inventory — это:', options: ['Список хостов', 'Playbook', 'Module'], correctAnswer: 'Список хостов', explanation: 'Inventory = managed hosts.', skillTag: 'inventory' },
    { id: 'ans-p2', title: 'Module', description: 'Установка пакета', type: 'yaml', prompt: 'Module для apt на Ubuntu:', options: ['yum', 'apt', 'dnf'], correctAnswer: 'apt', explanation: 'apt для Debian/Ubuntu.', skillTag: 'modules' },
    { id: 'ans-p3', title: 'Handler', description: 'Когда запускается', type: 'yaml', prompt: 'Handler запускается при:', options: ['notify после изменения', 'Всегда', 'Никогда'], correctAnswer: 'notify после изменения', explanation: 'Handlers — по событию.', skillTag: 'handlers' },
    { id: 'ans-p4', title: 'YAML', description: 'Формат playbook', type: 'yaml', prompt: 'Playbook формат:', options: ['JSON', 'YAML', 'XML'], correctAnswer: 'YAML', explanation: 'Ansible = YAML.', skillTag: 'playbook' },
  ],
  terraform: [
    { id: 'tf-p1', title: 'Workflow', description: 'Порядок команд', type: 'hcl', prompt: 'Первый шаг:', options: ['apply', 'init', 'destroy'], correctAnswer: 'init', explanation: 'init загружает providers.', skillTag: 'workflow' },
    { id: 'tf-p2', title: 'Plan', description: 'Что показывает plan', type: 'hcl', prompt: 'terraform plan:', options: ['Применяет изменения', 'Показывает план изменений', 'Удаляет state'], correctAnswer: 'Показывает план изменений', explanation: 'plan = dry-run preview.', skillTag: 'plan' },
    { id: 'tf-p3', title: 'State', description: 'Назначение state', type: 'hcl', prompt: 'State хранит:', options: ['Код HCL', 'Маппинг ресурсов к ID', 'Логи'], correctAnswer: 'Маппинг ресурсов к ID', explanation: 'State = реальные ID.', skillTag: 'state' },
    { id: 'tf-p4', title: 'Resource', description: 'Создание ресурса', type: 'hcl', prompt: 'resource блок:', options: ['Создаёт инфраструктуру', 'Только переменную', 'Output'], correctAnswer: 'Создаёт инфраструктуру', explanation: 'resource = create.', skillTag: 'resources' },
  ],
  docker: [
    { id: 'dock-p1', title: 'Dockerfile порядок', description: 'Расположи команды', type: 'dockerfile', prompt: 'Первая команда Dockerfile:', options: ['CMD', 'FROM', 'RUN'], correctAnswer: 'FROM', explanation: 'FROM — базовый image.', skillTag: 'dockerfile' },
    { id: 'dock-p2', title: 'Run vs Start', description: 'Создать контейнер', type: 'quiz', prompt: 'Новый контейнер:', options: ['docker start', 'docker run', 'docker exec'], correctAnswer: 'docker run', explanation: 'run = create + start.', skillTag: 'commands' },
    { id: 'dock-p3', title: 'Volume', description: 'Персистентность', type: 'quiz', prompt: 'Данные вне lifecycle:', options: ['Volume', 'EXPOSE', 'CMD'], correctAnswer: 'Volume', explanation: 'Volumes persist data.', skillTag: 'volumes' },
    { id: 'dock-p4', title: 'Logs', description: 'Просмотр логов', type: 'quiz', prompt: 'Логи контейнера:', options: ['docker ps', 'docker logs', 'docker top'], correctAnswer: 'docker logs', explanation: 'docker logs container.', skillTag: 'commands' },
  ],
  kubernetes: [
    { id: 'k8s-p1', title: 'Иерархия', description: 'Порядок объектов', type: 'k8s', prompt: 'Минимальная единица:', options: ['Deployment', 'Pod', 'Service'], correctAnswer: 'Pod', explanation: 'Pod = smallest unit.', skillTag: 'pods' },
    { id: 'k8s-p2', title: 'Service', description: 'Внутренний доступ', type: 'k8s', prompt: 'Internal only service:', options: ['NodePort', 'ClusterIP', 'LoadBalancer'], correctAnswer: 'ClusterIP', explanation: 'ClusterIP = internal.', skillTag: 'services' },
    { id: 'k8s-p3', title: 'Probe', description: 'Перезапуск', type: 'k8s', prompt: 'Restart при failure:', options: ['Readiness', 'Liveness', 'Startup'], correctAnswer: 'Liveness', explanation: 'Liveness → restart.', skillTag: 'probes' },
    { id: 'k8s-p4', title: 'Scale', description: 'Масштабирование', type: 'k8s', prompt: '2 → 5 replicas:', options: ['kubectl scale', 'kubectl delete', 'kubectl logs'], correctAnswer: 'kubectl scale', explanation: 'kubectl scale deployment.', skillTag: 'scaling' },
  ],
  'gitlab-cicd': [
    { id: 'gl-p1', title: 'Stages', description: 'Параллельность', type: 'pipeline', prompt: 'Jobs в одном stage:', options: ['Последовательно', 'Параллельно', 'Random'], correctAnswer: 'Параллельно', explanation: 'Same stage = parallel.', skillTag: 'stages' },
    { id: 'gl-p2', title: 'Artifacts', description: 'Передача файлов', type: 'pipeline', prompt: 'Artifacts для:', options: ['Кэша deps', 'Передачи между jobs', 'Secrets'], correctAnswer: 'Передачи между jobs', explanation: 'Artifacts = file transfer.', skillTag: 'artifacts' },
    { id: 'gl-p3', title: 'Runner', description: 'Выполнение jobs', type: 'pipeline', prompt: 'Runner:', options: ['Git server', 'Выполняет jobs', 'Registry'], correctAnswer: 'Выполняет jobs', explanation: 'Runner executes jobs.', skillTag: 'runners' },
    { id: 'gl-p4', title: 'Manual', description: 'Ручной запуск', type: 'pipeline', prompt: 'when: manual:', options: ['Автозапуск', 'Ручной запуск', 'Skip'], correctAnswer: 'Ручной запуск', explanation: 'manual = click Play.', skillTag: 'manual' },
  ],
  'captain-exam': [],
};

export function getLessons(topicId: TopicId): LessonChapter[] {
  return LESSONS[topicId] || [];
}

export function getPractice(topicId: TopicId): PracticeExercise[] {
  return PRACTICE[topicId] || [];
}
