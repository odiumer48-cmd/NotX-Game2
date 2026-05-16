import { state } from '../core/State';
import { DIFFICULTY } from '../core/Config';
import { compressToBase64, decompressFromBase64 } from '../utils/lz-string';
import { log } from '../ui/TerminalUI';

const SAVE_KEY = 'linuxdev_save_v3';
let autoSaveTimer: ReturnType<typeof setInterval> | null = null;

export function startAutoSave(): void {
  stopAutoSave();
  const interval = DIFFICULTY[state.diff]?.autoSaveInterval || 30000;
  if (interval > 0) {
    autoSaveTimer = setInterval(() => saveGame(true), interval);
  }
}

export function stopAutoSave(): void {
  if (autoSaveTimer) { clearInterval(autoSaveTimer); autoSaveTimer = null; }
}

export function saveGame(silent = false): void {
  const data = serializeState();
  const json = JSON.stringify(data);
  localStorage.setItem(SAVE_KEY, json);

  // Also keep a backup
  localStorage.setItem(SAVE_KEY + '_backup', json);

  if (!silent) log('\uD83D\uDCBE Сохранено!', 'success');
}

export function loadGame(): boolean {
  let raw = localStorage.getItem(SAVE_KEY);
  if (!raw) raw = localStorage.getItem(SAVE_KEY + '_backup');
  if (!raw) { log('Нет сохранения.', 'warning'); return false; }

  try {
    const data = JSON.parse(raw, reviver);
    deserializeState(data);
    log('\uD83D\uDCC2 Загружено!', 'success');
    return true;
  } catch (e) {
    log('Ошибка загрузки сохранения.', 'danger');
    return false;
  }
}

export function exportSave(): string {
  const data = serializeState();
  return JSON.stringify(data);
}

export function exportSaveCompressed(): string {
  const data = exportSave();
  return compressToBase64(data);
}

export function importSave(json: string): boolean {
  try {
    const data = JSON.parse(json, reviver);
    deserializeState(data);
    log('\uD83D\uDCE4 Импорт сохранения успешен!', 'success');
    return true;
  } catch (e) {
    log('Ошибка импорта сохранения.', 'danger');
    return false;
  }
}

export function importSaveCompressed(b64: string): boolean {
  try {
    const json = decompressFromBase64(b64);
    return importSave(json);
  } catch (e) {
    log('Ошибка декомпрессии сохранения.', 'danger');
    return false;
  }
}

export function shareSaveViaURL(): string {
  const compressed = exportSaveCompressed();
  return `${window.location.origin}${window.location.pathname}#save=${compressed}`;
}

export function checkURLSave(): boolean {
  const hash = window.location.hash;
  if (hash.startsWith('#save=')) {
    const compressed = hash.slice(6);
    if (importSaveCompressed(compressed)) {
      window.history.replaceState(null, '', window.location.pathname);
      return true;
    }
  }
  return false;
}

function serializeState(): any {
  const s = state.getAll();
  return {
    ...s,
    gameTime: s.gameTime.toISOString(),
    projects: s.projects.map(p => ({
      ...p,
      deadline: p.deadline?.toISOString() || null
    })),
    messages: s.messages.map(m => ({
      ...m,
      date: m.date.toISOString()
    })),
    exploitLogs: s.exploitLogs.map(l => ({
      ...l,
      date: l.date.toISOString()
    })),
    activeTask: s.activeTask ? s.activeTask.id : null,
    hackTask: s.hackTask || null,
  };
}

function deserializeState(data: any): void {
  const rev = JSON.parse(JSON.stringify(data), reviver);

  // Restore Date objects
  if (typeof rev.gameTime === 'string') rev.gameTime = new Date(rev.gameTime);
  if (rev.projects) {
    rev.projects.forEach((p: any) => {
      if (p.deadline) p.deadline = new Date(p.deadline);
    });
  }
  if (rev.messages) {
    rev.messages.forEach((m: any) => { if (m.date) m.date = new Date(m.date); });
  }
  if (rev.exploitLogs) {
    rev.exploitLogs.forEach((l: any) => { if (l.date) l.date = new Date(l.date); });
  }

  // Restore activeTask reference
  if (rev.activeTask && typeof rev.activeTask === 'number') {
    rev.activeTask = rev.projects.find((p: any) => p.id === rev.activeTask) || null;
  }

  // Migrate old saves
  if (!rev.saveVersion) rev.saveVersion = 1;
  if (rev.saveVersion < 2) {
    rev.marketPrices = { hw: 200, sw: 300, net: 250, def: 150, proxy: 500 };
    rev.marketTrend = 1;
    rev.timeOfDay = 'day';
    rev.companies = {};
  }
  if (rev.saveVersion < 3) {
    rev.virusWeapons = rev.virusWeapons || [];
    rev.proxyChain = rev.proxyChain || { level: 0, active: false, fbiReduction: 0 };
    rev.whiteHatRep = rev.whiteHatRep || rev.reputation;
    rev.blackHatRep = rev.blackHatRep || 0;
  }
  rev.saveVersion = 3;

  // Apply difficulty
  const diffKey = rev.diff || 'normal';
  if (DIFFICULTY[diffKey]) {
    state.diff = diffKey;
  }

  state.setAll(rev);
}

function reviver(_key: string, value: any): any {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value);
  }
  return value;
}
