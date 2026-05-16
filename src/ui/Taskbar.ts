import { state } from '../core/State';
import { openWindow, focusWindow, minWindow } from './Window';

const APPS = [
  { id: 'terminal', icon: '\uD83D\uDDA5\uFE0F', label: 'Терминал' },
  { id: 'browser', icon: '\uD83C\uDF10', label: 'Googie' },
  { id: 'mail', icon: '\uD83D\uDCE7', label: 'Почта' },
  { id: 'projects', icon: '\uD83D\uDCC1', label: 'Проекты' },
  { id: 'store', icon: '\uD83D\uDED2', label: 'Магазин' },
  { id: 'darknet', icon: '\uD83D\uDC80', label: 'DarkNet' },
  { id: 'antivirus', icon: '\uD83D\uDEE1\uFE0F', label: 'Антивирус' },
  { id: 'files', icon: '\uD83D\uDCC2', label: 'Файлы' },
  { id: 'achievements', icon: '\uD83C\uDFC6', label: 'Ачивки' },
  { id: 'settings', icon: '\u2699\uFE0F', label: 'Настройки' },
];

export function updateTaskbar(): void {
  const bar = document.getElementById('taskbar-apps');
  if (!bar) return;
  bar.innerHTML = '';

  APPS.forEach(a => {
    if (!state.wins[a.id as keyof typeof state.wins]) return;
    const win = document.getElementById('win-' + a.id);
    const isActive = win?.classList.contains('active');
    const btn = document.createElement('button');
    btn.className = 'taskbar-btn' + (isActive ? ' active' : '');
    btn.innerHTML = `${a.icon} <span>${a.label}</span>`;
    btn.onclick = () => {
      if (win?.classList.contains('active')) minWindow(a.id);
      else { openWindow(a.id); focusWindow(a.id); }
    };
    bar.appendChild(btn);
  });
}

export function setupStartMenu(): void {
  const menu = document.getElementById('start-menu');
  const btn = document.getElementById('start-btn');
  if (!menu || !btn) return;

  btn.onclick = toggleMenu;
  document.addEventListener('click', e => {
    if (menu.classList.contains('active') && !menu.contains(e.target as Node) && !btn.contains(e.target as Node)) {
      hideMenu();
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hideMenu(); });
}

function toggleMenu(): void {
  const menu = document.getElementById('start-menu');
  if (!menu) return;
  if (menu.classList.contains('active')) hideMenu();
  else showMenu();
}

function showMenu(): void {
  const menu = document.getElementById('start-menu');
  const btn = document.getElementById('start-btn');
  menu?.classList.add('active');
  menu?.setAttribute('aria-hidden', 'false');
  btn?.classList.add('open');
}

function hideMenu(): void {
  const menu = document.getElementById('start-menu');
  const btn = document.getElementById('start-btn');
  menu?.classList.remove('active');
  menu?.setAttribute('aria-hidden', 'true');
  btn?.classList.remove('open');
}

export function menuOpen(name: string): void {
  openWindow(name);
  focusWindow(name);
  hideMenu();
}
