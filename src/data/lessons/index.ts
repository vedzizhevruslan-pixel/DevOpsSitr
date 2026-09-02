import type { LessonChapter, PracticeExercise, TopicId } from '../../types';
import { linuxPractice } from './linuxPractice';
import {
  ansiblePractice,
  dockerPractice,
  gitlabPractice,
  kubernetesPractice,
  networksPractice,
  terraformPractice,
} from './islandPractice';

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
  networks: networksPractice,
  ansible: ansiblePractice,
  terraform: terraformPractice,
  docker: dockerPractice,
  kubernetes: kubernetesPractice,
  'gitlab-cicd': gitlabPractice,
  'captain-exam': [],
};

export function getLessons(topicId: TopicId): LessonChapter[] {
  return LESSONS[topicId] || [];
}

export function getPractice(topicId: TopicId): PracticeExercise[] {
  return PRACTICE[topicId] || [];
}
