import type { DifficultyConfig, LangConfig, TechNode, PortService, Wallpaper } from './Types';

export const DIFFICULTY: Record<string, DifficultyConfig> = {
  easy: {
    label: '\uD83D\uDD37 Легкий',
    codeMult: 0.5,
    hostSecMult: 0.6,
    deadlineMult: 1.5,
    rewardMult: 1.3,
    fbiMult: 0.5,
    startMoney: 500,
    autoProgress: 0.12,
    name: 'Легкий',
    showNextChars: 3,
    autoSaveInterval: 60000,
    fbiGrowthRate: 0.5,
    hasCodeErrors: false,
    hostRegenInterval: 0,
    permadeath: false,
  },
  normal: {
    label: '\uD83D\uDD38 Средний',
    codeMult: 1.0,
    hostSecMult: 1.0,
    deadlineMult: 1.0,
    rewardMult: 1.0,
    fbiMult: 1.0,
    startMoney: 300,
    autoProgress: 0.05,
    name: 'Средний',
    showNextChars: 0,
    autoSaveInterval: 30000,
    fbiGrowthRate: 1.0,
    hasCodeErrors: false,
    hostRegenInterval: 0,
    permadeath: false,
  },
  hard: {
    label: '\uD83D\uDD39 Сложный',
    codeMult: 1.8,
    hostSecMult: 1.4,
    deadlineMult: 0.7,
    rewardMult: 0.8,
    fbiMult: 1.8,
    startMoney: 150,
    autoProgress: 0.02,
    name: 'Сложный',
    showNextChars: 0,
    autoSaveInterval: 0,
    fbiGrowthRate: 1.8,
    hasCodeErrors: true,
    hostRegenInterval: 600000,
    permadeath: true,
  }
};

export const LANGS: Record<string, LangConfig> = {
  python: { name: 'Python', speed: 1.0, reward: 1.0 },
  cpp: { name: 'C++', speed: 1.3, reward: 1.2 },
  js: { name: 'JavaScript', speed: 1.1, reward: 1.1 },
  rust: { name: 'Rust', speed: 1.5, reward: 1.4 },
  go: { name: 'Go', speed: 1.2, reward: 1.15 },
  java: { name: 'Java', speed: 0.9, reward: 1.0 },
};

export const PORT_SERVICES: Record<number, PortService> = {
  21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS',
  80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS', 445: 'SMB',
  3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL', 5900: 'VNC',
  8080: 'HTTP-Proxy', 9200: 'Elastic'
};

export const WALLPAPERS: Wallpaper[] = [
  { name: 'Ubuntu Dark', bg: 'linear-gradient(135deg, #772953 0%, #2c001e 50%, #1a1a2e 100%)' },
  { name: 'Midnight', bg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { name: 'Matrix', bg: 'linear-gradient(135deg, #000000 0%, #003300 50%, #001a00 100%)' },
  { name: 'Cyberpunk', bg: 'linear-gradient(135deg, #2a0a1a 0%, #4a004a 50%, #001a3a 100%)' },
  { name: 'Ocean', bg: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  { name: 'Sunset', bg: 'linear-gradient(135deg, #2c1a1a 0%, #5c2a2a 50%, #8c3a3a 100%)' },
  { name: 'Forest', bg: 'linear-gradient(135deg, #0a1a0a 0%, #1a3a1a 50%, #0a2a0a 100%)' },
  { name: 'Neon City', bg: 'linear-gradient(135deg, #1a0a2a 0%, #3a0a5a 50%, #1a0a4a 100%)' },
  { name: 'Redline', bg: 'linear-gradient(135deg, #2a0a0a 0%, #4a0a0a 50%, #3a0000 100%)' },
  { name: 'Iceberg', bg: 'linear-gradient(135deg, #0a1a2a 0%, #1a3a4a 50%, #0a2a3a 100%)' },
  { name: 'Galaxy', bg: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a2a 100%)' },
  { name: 'Phosphor', bg: 'linear-gradient(135deg, #0a2a0a 0%, #1a3a1a 50%, #0a1a0a 100%)' },
];

export const TECH_TREE: TechNode[] = [
  { id: 'asm', name: 'Assembler', requires: [], cost: 100, unlocked: false, desc: 'Базовое понимание железа', effect: 'hw+1, скорость кодинга +5%', branch: 'systems' },
  { id: 'c_lang', name: 'C', requires: ['asm'], cost: 250, unlocked: false, desc: 'Классика системного программирования', effect: 'открывает системные заказы', branch: 'systems' },
  { id: 'rust', name: 'Rust', requires: ['c_lang'], cost: 500, unlocked: false, desc: 'Безопасное системное программирование', effect: 'скорость кодинга +20%, защита +10%', branch: 'systems' },
  { id: 'html_css', name: 'HTML/CSS', requires: [], cost: 100, unlocked: false, desc: 'Основы веба', effect: 'открывает web-заказы', branch: 'web' },
  { id: 'js_web', name: 'JavaScript', requires: ['html_css'], cost: 250, unlocked: false, desc: 'Интерактивный веб', effect: 'web награды +15%', branch: 'web' },
  { id: 'react', name: 'React', requires: ['js_web'], cost: 400, unlocked: false, desc: 'Современный фронтенд', effect: 'web награды +25%, скорость +10%', branch: 'web' },
  { id: 'python', name: 'Python', requires: [], cost: 100, unlocked: false, desc: 'Универсальный язык', effect: 'открывает ML-заказы', branch: 'ml' },
  { id: 'ml', name: 'ML Basics', requires: ['python'], cost: 400, unlocked: false, desc: 'Машинное обучение', effect: 'ML заказы, награды +30%', branch: 'ml' },
  { id: 'deep_learning', name: 'Deep Learning', requires: ['ml'], cost: 800, unlocked: false, desc: 'Глубокое обучение', effect: 'ML награды +50%, открывает нейро-заказы', branch: 'ml' },
  { id: 'networking', name: 'Networking', requires: [], cost: 150, unlocked: false, desc: 'Основы сетей', effect: 'net+1, лучшее сканирование', branch: 'security' },
  { id: 'crypto', name: 'Cryptography', requires: ['networking'], cost: 350, unlocked: false, desc: 'Шифрование и защита', effect: 'защита +20%, -FBI риск', branch: 'security' },
  { id: 'exploit_dev', name: 'Exploit Dev', requires: ['networking'], cost: 500, unlocked: false, desc: 'Разработка эксплойтов', effect: 'шанс взлома +15%, новые порты', branch: 'security' },
];

export const COMPANIES = [
  'E-Corp', 'GlobalTech', 'Cyberdyne', 'OmniCorp', 'Nexus',
  'GovNet', 'BankSys', 'ShadowNet', 'PhantomSys', 'MiliBase',
  'DataVault', 'CloudNine', 'Googie', 'MetaForge'
];

export const HOST_NAMES = [
  'E-Corp', 'GlobalTech', 'Cyberdyne', 'OmniCorp', 'Nexus',
  'GovNet', 'BankSys', 'DarkHost', 'ShadowNet', 'PhantomSys',
  'MiliBase', 'DataVault', 'CloudNine'
];

export const FORTUNES = [
  'Смысл жизни \u2014 в коде.',
  'Если это работает \u2014 не трогай.',
  'Есть два способа писать программы: с комментариями и для себя через месяц.',
  'sudo rm -rf / \u2014 последнее, что ты сделаешь.',
  'Баг \u2014 это просто фича без документации.',
  'Кофе \u2014 основной ингредиент хорошего кода.',
  'Работает на моей машине\u2122',
  'grep -r \'TODO\' /home/neo \u2014 список дел на ближайший год.',
  'ФБР уже в пути. Но код важнее.',
  'Переписывать на Rust \u2014 не всегда ответ.'
];
