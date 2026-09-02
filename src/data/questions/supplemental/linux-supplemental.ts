import { pq } from './helpers';

export const linuxSupplementalQuestions = [
  pq(
    'LINUX-15',
    'linux',
    'process-diagnostics',
    'multiple',
    'hard',
    'У процесса PID 4321 резко выросло потребление CPU. Какие инструменты и команды помогут понять: что делает процесс, какие syscalls выполняет, какие файлы и сетевые соединения держит открытыми?',
    [
      'top / htop — загрузка и команда процесса',
      'ps -p 4321 -o pid,cmd,etime,%cpu,%mem',
      'pidstat -p 4321 1 — per-process CPU',
      'strace -p 4321 — системные вызовы',
      'lsof -p 4321 — открытые файлы и сокеты',
      'ss -tp | grep 4321 — TCP-соединения процесса',
      'cat /proc/4321/status — детали процесса из procfs',
      'df -h — использование диска',
    ],
    ['top / htop — загрузка и команда процесса', 'ps -p 4321 -o pid,cmd,etime,%cpu,%mem', 'pidstat -p 4321 1 — per-process CPU', 'strace -p 4321 — системные вызовы', 'lsof -p 4321 — открытые файлы и сокеты', 'ss -tp | grep 4321 — TCP-соединения процесса', 'cat /proc/4321/status — детали процесса из procfs'],
    'top/htop и ps показывают что за процесс и сколько CPU. pidstat — детальная CPU-статистика. strace — syscalls в реальном времени. lsof и ss — открытые FD и сетевые соединения. /proc/PID — низкоуровневые данные ядра. df -h не помогает диагностировать процесс.',
  ),
  pq(
    'LINUX-16',
    'linux',
    'systemd',
    'scenario',
    'medium',
    'После перезагрузки сервера nginx.service в состоянии failed. Выберите правильную последовательность диагностики через systemd:',
    [
      'systemctl restart nginx → systemctl enable nginx → journalctl -u nginx',
      'systemctl status nginx → journalctl -u nginx -b → systemctl is-enabled nginx → исправить причину → systemctl restart nginx → systemctl enable nginx',
      'journalctl -xe → rm /etc/nginx/nginx.conf → systemctl start nginx',
      'killall nginx → systemctl daemon-reload → reboot',
    ],
    'systemctl status nginx → journalctl -u nginx -b → systemctl is-enabled nginx → исправить причину → systemctl restart nginx → systemctl enable nginx',
    'Сначала status — текущее состояние и последние строки лога. journalctl -u nginx -b — полные логи с текущей загрузки. is-enabled проверяет автозапуск. После исправления конфига/зависимостей — restart и enable для автозапуска при следующей перезагрузке.',
  ),
];
