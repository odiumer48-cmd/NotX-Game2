import { DIFFICULTY, WALLPAPERS } from '../core/Config';
import { state } from '../core/State';
import { log } from './TerminalUI';

let selectedDiff: string = 'normal';
let onStartCallback: (() => void) | null = null;

export function showTitleScreen(onStart: () => void): void {
  onStartCallback = onStart;
  const ts = document.getElementById('title-screen');
  if (ts) {
    ts.style.display = 'flex';
    ts.classList.remove('hidden');
  }

  document.getElementById('desktop-layer')?.classList.remove('active');
}

export function hideTitleScreen(): void {
  const ts = document.getElementById('title-screen');
  if (ts) ts.classList.add('hidden');
  setTimeout(() => {
    if (ts) ts.style.display = 'none';
    document.getElementById('desktop-layer')?.classList.add('active');
  }, 600);
}

export function selectDiff(d: string): void {
  selectedDiff = d;
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`.diff-btn[data-diff="${d}"]`)?.classList.add('selected');
}

export function startGame(): void {
  const cfg = DIFFICULTY[selectedDiff];
  state.money = cfg.startMoney;
  state.diff = selectedDiff as 'easy' | 'normal' | 'hard';
  state.hasCodeErrors = cfg.hasCodeErrors;
  state.reputation = 50;
  state.fbi = 0;
  state.gameTime = new Date(2026, 4, 9, 9, 0);
  state.projects = [];
  state.messages = [];
  state.hosts = [];
  state.activeTask = null;
  state.hackTask = null;
  state.virusWeapons = [];
  state.proxyChain = { level: 0, active: false, fbiReduction: 0 };
  state.gameOver = false;
  state.totalEarned = 0;
  state.antivirusStock = 0;
  state.antivirusSold = 0;

  hideTitleScreen();
  onStartCallback?.();
  log(`\uD83C\uDFAE Игра начата! Сложность: ${cfg.name}`, 'success');
}

export function loadGameFromTitle(): void {
  import('../game/SaveManager').then(m => {
    if (m.loadGame()) {
      hideTitleScreen();
      onStartCallback?.();
    } else {
      alert('Нет сохранения!');
    }
  });
}

export function getSelectedDiff(): string {
  return selectedDiff;
}
