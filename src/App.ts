import { state } from './core/State';
import { DIFFICULTY, HOST_NAMES } from './core/Config';
import { PORT_SERVICES } from './core/Config';
import { initTechTree } from './game/TechTree';
import { initMarket, tickMarket } from './game/Market';
import { updateFBI } from './game/FBISystem';
import { tickViruses } from './game/VirusSystem';
import { createAchievements, checkAchievements } from './game/Achievements';
import { saveGame, startAutoSave, checkURLSave } from './game/SaveManager';
import { startDrone } from './game/AudioManager';
import { initTerminalUI, log } from './ui/TerminalUI';
import { setupDragListeners, openWindow } from './ui/Window';
import { setupDesktop } from './ui/Desktop';
import { updateTaskbar, setupStartMenu } from './ui/Taskbar';
import { updateTopBar } from './ui/TopBar';
import { renderMail } from './ui/MailUI';
import { renderProjects } from './ui/ProjectsUI';
import { renderStore } from './ui/StoreUI';
import { renderBrowser } from './ui/BrowserUI';
import { renderDarkNet } from './ui/DarkNetUI';
import { renderAntivirus } from './ui/AntivirusUI';
import { renderFiles, createDefaultFS } from './ui/FilesUI';
import { renderAchievements } from './ui/AchievementsUI';
import { renderSettings } from './ui/SettingsUI';
import { showTitleScreen } from './ui/TitleScreen';
import { runBootSequence } from './ui/BootSequence';
import { pushNotification } from './ui/Notifications';
import { showDialog } from './ui/Dialog';

let gameInterval: ReturnType<typeof setInterval> | null = null;
let eventTimer = 0;
let messageTimer = 0;

export function initApp(): void {
  // Check URL save first
  if (checkURLSave()) {
    runBootSequence(() => {
      document.getElementById('desktop-layer')?.classList.add('active');
      startGame(true);
    });
    return;
  }

  runBootSequence(() => {
    showTitleScreen(() => startGame());
  });

  // Init UI systems
  initTerminalUI();
  setupDragListeners();
  setupDesktop();
  setupStartMenu();

  // Page visibility
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (gameInterval) clearInterval(gameInterval);
    } else {
      // Catch up ticks
      tick();
      startGameLoop();
    }
  });

  // Before unload auto-save
  window.addEventListener('beforeunload', () => {
    saveGame(true);
  });
}

function startGame(skipBoot = false): void {
  if (!skipBoot) {
    initGameState();
  }

  initTechTree();
  initMarket();
  setupGameFS();
  startAutoSave();
  startDrone();

  // Subscribe to state changes
  state.addEventListener('change', (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (['money', 'reputation', 'fbi', 'gameTime', 'lockout'].includes(detail.key)) {
      updateTopBar();
    }
  });

  // Create desktop icons
  createDesktopIcons();

  // Setup renders
  updateTopBar();
  renderBrowser();
  renderMail();
  renderProjects();
  renderStore();
  renderDarkNet();
  renderAntivirus();
  renderFiles();
  renderAchievements();
  renderSettings();
  updateTaskbar();

  openWindow('terminal');
  startGameLoop();

  // Initial messages
  setTimeout(() => generateMessage(), 3000);
  setTimeout(() => generateMessage(), 8000);
  pushNotification('Linux Dev OS', 'Система загружена. Удачи, хакер!');
}

function createDesktopIcons(): void {
  const desktop = document.getElementById('desktop');
  if (!desktop) return;
  desktop.innerHTML = '';

  const icons = [
    { id: 'icon-terminal', name: 'terminal', icon: '🖥️', label: 'Терминал', x: 20, y: 20 },
    { id: 'icon-browser', name: 'browser', icon: '🌐', label: 'Googie', x: 20, y: 110 },
    { id: 'icon-mail', name: 'mail', icon: '📧', label: 'Почта', x: 20, y: 200 },
    { id: 'icon-projects', name: 'projects', icon: '📁', label: 'Проекты', x: 20, y: 290 },
    { id: 'icon-files', name: 'files', icon: '📂', label: 'Файлы', x: 120, y: 20 },
    { id: 'icon-store', name: 'store', icon: '🛒', label: 'Магазин', x: 120, y: 110 },
    { id: 'icon-darknet', name: 'darknet', icon: '💀', label: 'DarkNet', x: 120, y: 200 },
    { id: 'icon-antivirus', name: 'antivirus', icon: '🛡️', label: 'Антивирус', x: 120, y: 290 },
    { id: 'icon-settings', name: 'settings', icon: '⚙️', label: 'Настройки', x: 220, y: 20 },
    { id: 'icon-achievements', name: 'achievements', icon: '🏆', label: 'Ачивки', x: 220, y: 110 },
  ];

  icons.forEach(ic => {
    const div = document.createElement('div');
    div.id = ic.id;
    div.className = 'desktop-icon';
    div.style.left = ic.x + 'px';
    div.style.top = ic.y + 'px';
    div.innerHTML = `<div class="icon">${ic.icon}</div><div class="label">${ic.label}</div>`;
    div.addEventListener('mousedown', (e) => {
      // Let Desktop.ts handle drag
    });
    div.addEventListener('click', () => {
      if (!(window as any)._iconDragging) {
        import('./ui/Window').then(m => {
          m.openWindow(ic.name);
          m.focusWindow(ic.name);
        });
      }
    });
    desktop.appendChild(div);
  });

  // Re-initialize desktop drag for new icons
  setupDesktop();
}

function startGameLoop(): void {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(tick, 1000);
}

function initGameState(): void {
  const cfg = DIFFICULTY[state.diff];
  if (!state.money) state.money = cfg.startMoney;
  if (!state.fs || !state.fs.children) {
    state.fs = createDefaultFS();
  }
  if (!state.achievements || Object.keys(state.achievements).length === 0) {
    state.achievements = createAchievements();
  }
  if (!state.exploitLogs) state.exploitLogs = [];
  if (!state.lockout) state.lockout = { active: false, endTime: 0, count: 0 };
  if (!state.hosts || state.hosts.length === 0) generateHosts();
  if (!state.virusWeapons) state.virusWeapons = [];
  if (!state.companies) state.companies = {};
  if (!state.proxyChain) state.proxyChain = { level: 0, active: false, fbiReduction: 0 };
  if (!state.techs || Object.keys(state.techs).length === 0) initTechTree();
}

function setupGameFS(): void {
  const fs = state.fs;
  if (!fs.children) fs.children = {};
  if (!fs.children['home']) {
    fs.children['home'] = { type: 'dir', children: {} };
  }
  const home = fs.children['home'];
  if (!home.children) home.children = {};
  if (!home.children['.ssh']) {
    home.children['.ssh'] = { type: 'dir', children: { 'known_hosts': { type: 'file', content: '# Known hosts' } } };
  }
  if (!home.children['.bash_history']) {
    home.children['.bash_history'] = { type: 'file', content: 'ls -la\n./exploit_tool --target 10.0.0.1\ncat /var/log/syslog | grep ERROR\n# Подсказка: ищите уязвимости на портах 22, 80, 445, 3306' };
  }
  if (!state.fs.children['var']) {
    state.fs.children['var'] = { type: 'dir', children: { log: { type: 'dir', children: { 'exploits.log': { type: 'file', content: '# Exploit logs' } } } } };
  }
}

function generateHosts(): void {
  const allPorts = Object.keys(PORT_SERVICES).map(Number);
  const cfg = DIFFICULTY[state.diff];
  for (let i = 0; i < 14; i++) {
    const sec = Math.floor((Math.random() * 55 + 25) * cfg.hostSecMult);
    const portCount = Math.floor(Math.random() * 4) + 2;
    const shuffled = [...allPorts].sort(() => Math.random() - 0.5);
    const ports = shuffled.slice(0, portCount);
    state.hosts.push({
      id: state.nextHostId++,
      ip: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      name: HOST_NAMES[Math.floor(Math.random() * HOST_NAMES.length)] + '-' + Math.floor(Math.random() * 100),
      security: Math.min(95, sec),
      ports,
      services: ports.map(p => PORT_SERVICES[p] || 'Unknown'),
      owned: false,
      looted: false,
      scanned: false,
      vulnPort: ports[Math.floor(Math.random() * ports.length)],
      traceLevel: 0,
      money: Math.floor((100 + Math.random() * 400) * cfg.rewardMult),
      data: Math.floor(Math.random() * 3),
      reputationImpact: Math.floor(Math.random() * 10) - 5,
    });
  }
}

function tick(): void {
  if (state.gameOver) return;

  const cfg = DIFFICULTY[state.diff];
  state.gameTime = new Date(state.gameTime.getTime() + 120000);

  // Market
  tickMarket();

  // FBI
  updateFBI();

  // Viruses
  tickViruses();

  // Auto-progress inactive projects
  state.projects.forEach(p => {
    if (p.completed || p.failed) return;
    if (!state.activeTask || state.activeTask.id !== p.id) {
      p.progress = Math.min(p.code.length, p.progress + cfg.autoProgress * state.hw);
    }
    if (p.progress >= p.code.length && !p.completed) {
      p.completed = true;
      p.progress = p.code.length;
      log(`\u2705 Проект "${p.name}" завершён автоматически!`, 'success');
      renderProjects();
    }
    if (p.deadline && state.gameTime >= p.deadline && !p.completed) {
      p.failed = true;
      state.reputation = Math.max(0, state.reputation - 8);
      log(`\u274C Дедлайн "${p.name}" истёк! Репутация -8`, 'danger');
      if (state.activeTask?.id === p.id) state.activeTask = null;
      renderProjects();
    }
  });

  // Passive income
  if (state.antivirusStock > 0 && Math.random() < 0.1) {
    state.money += state.antivirusStock * 5;
  }

  // Random messages
  messageTimer++;
  if (messageTimer > 30 + Math.random() * 30) {
    messageTimer = 0;
    if (state.messages.length < 14 && Math.random() < 0.5) generateMessage();
  }

  // Random events
  eventTimer++;
  if (eventTimer > 50 + Math.random() * 40) {
    eventTimer = 0;
    const evts = [
      '\uD83D\uDD12 Фаервол заблокировал подозрительный пакет.',
      '\uD83D\uDD0D Обнаружена попытка сканирования портов.',
      '\uD83D\uDCE1 Новый 0-day опубликован на хакерских форумах.',
      '\uD83D\uDD27 Обновление системы безопасности установлено.',
    ];
    log(`[Система] ${evts[Math.floor(Math.random() * evts.length)]}`, 'info');

    // Ransomware event
    if (Math.random() < 0.05) triggerRansomware();
  }

  // Check achievements
  checkAchievements();

  // Game over
  if (state.money < -300) {
    state.gameOver = true;
    log('\uD83D\uDCB8 Вы банкрот!', 'danger');
  }

  // Regenerate hosts on hard
  if (cfg.hostRegenInterval > 0 && Math.random() < 0.001) {
    state.hosts = [];
    generateHosts();
    log('\uD83D\uDD04 DarkNet хосты регенерированы!', 'warning');
  }

  updateTopBar();
}

function generateMessage(): void {
  const companies = ['E-Corp', 'GlobalTech', 'Cyberdyne', 'OmniCorp', 'Nexus', 'GovNet'];
  const types: Array<'antivirus' | 'web' | 'game' | 'virus'> = ['antivirus', 'web', 'game'];
  if (state.reputation < 25 || state.fbi > 40) types.push('virus');
  const type = types[Math.floor(Math.random() * types.length)];
  const from = companies[Math.floor(Math.random() * companies.length)];
  const cfg = DIFFICULTY[state.diff];
  const rewards = { antivirus: 250, web: 200, game: 180, virus: 300 };
  const bodies = {
    antivirus: 'Нужен антивирус для корпоративной сети.',
    web: 'Разработать landing page для нового продукта.',
    game: 'Простая аркада для внутреннего мероприятия.',
    virus: 'Нужен тихий сборщик данных. Без вопросов.'
  };

  state.messages = [...state.messages, {
    id: state.nextMsgId++,
    from,
    subject: type === 'antivirus' ? 'Заказ на защиту' : type === 'web' ? 'Веб-разработка' : type === 'game' ? 'Игра' : 'Специальный заказ',
    body: bodies[type],
    type,
    reward: Math.floor((rewards[type] + Math.floor(Math.random() * 150)) * cfg.rewardMult),
    deadlineHours: Math.floor((5 + Math.floor(Math.random() * 5)) * cfg.deadlineMult),
    date: new Date(state.gameTime),
    read: false,
    accepted: false,
  }];

  log(`\uD83D\uDCE7 Новое письмо от ${from}`, 'info');
  renderMail();
  pushNotification('Почта', `Новое сообщение от ${from}`);
}

function triggerRansomware(): void {
  log('\uD83D\uDC51 \uD83D\uDEA8 ВНИМАНИЕ: Вирус-шифровальщик активирован!', 'danger');
  log('Все ваши файлы зашифрованы! Варианты:', 'danger');
  log('  1. Купить антивирус ($300) \u2014 buy def', 'info');
  log('  2. Заплатить выкуп ($500) \u2014 вы потеряете репутацию', 'warning');
  showDialog('Шифровальщик!', 'Ваши файлы зашифрованы!', [
    { text: 'Купить антивирус ($300)', action: () => { state.money -= 300; state.antivirusStock++; log('Антивирус куплен! Файлы восстановлены.', 'success'); }, primary: true },
    { text: 'Заплатить выкуп ($500)', action: () => { state.money -= 500; state.reputation = Math.max(0, state.reputation - 15); log('Выкуп уплачен. Позор...', 'danger'); } },
    { text: 'Игнорировать', action: () => { state.reputation = Math.max(0, state.reputation - 5); log('Некоторые файлы потеряны.', 'warning'); } },
  ]);
}
