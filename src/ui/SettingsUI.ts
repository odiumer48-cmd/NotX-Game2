import { state } from '../core/State';
import { WALLPAPERS } from '../core/Config';
import { setVolume, playTestSound } from '../game/AudioManager';
import { exportSave, importSave, exportSaveCompressed, shareSaveViaURL } from '../game/SaveManager';
import { log } from './TerminalUI';

export function renderSettings(): void {
  const grid = document.getElementById('wallpaper-grid');
  if (grid) renderWallpapers();
}

export function switchSettingsTab(tab: string): void {
  document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
  document.getElementById('tab-' + tab)?.classList.add('active');
  document.getElementById('section-' + tab)?.classList.add('active');
  if (tab === 'personal') renderWallpapers();
}

function renderWallpapers(): void {
  const grid = document.getElementById('wallpaper-grid');
  if (!grid) return;
  grid.innerHTML = '';
  WALLPAPERS.forEach((wp, i) => {
    const tile = document.createElement('div');
    tile.className = 'wp-tile' + (state.wallpaper === i ? ' selected' : '');
    tile.style.background = wp.bg;
    tile.innerHTML = `<div class="wp-name">${wp.name}</div>`;
    tile.addEventListener('click', () => setWallpaper(i));
    grid.appendChild(tile);
  });
}

function setWallpaper(idx: number): void {
  state.wallpaper = idx;
  const wp = WALLPAPERS[idx];
  if (wp) {
    document.body.style.background = wp.bg;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundAttachment = 'fixed';
  }
  renderWallpapers();
}

export function setSoundTheme(theme: string): void {
  state.soundTheme = theme;
  document.querySelectorAll('[id^="snd-theme-"]').forEach(b => (b as HTMLElement).style.borderColor = 'transparent');
  const active = document.getElementById('snd-theme-' + theme);
  if (active) active.style.borderColor = 'var(--accent)';
  log(`\uD83C\uDFB5 Звуковая тема: ${theme}`, 'info');
}

export function toggleAnimBg(on: boolean): void {
  if (on) {
    let hue = 0;
    const interval = setInterval(() => {
      hue = (hue + 0.3) % 360;
      document.body.style.background = `linear-gradient(${hue}deg, #772953, #2c001e, #1a1a2e)`;
    }, 50);
    (window as any)._animBgInterval = interval;
  } else {
    if ((window as any)._animBgInterval) clearInterval((window as any)._animBgInterval);
    setWallpaper(state.wallpaper);
  }
}

export function exportSaveFile(): void {
  const data = exportSave();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'save.json';
  a.click();
  URL.revokeObjectURL(url);
  log('\uD83D\uDCE4 Сохранение экспортировано.', 'success');
}

export function importSaveFile(): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      importSave(reader.result as string);
    };
    reader.readAsText(file);
  };
  input.click();
}

export function shareSave(): void {
  const url = shareSaveViaURL();
  navigator.clipboard?.writeText(url).then(() => {
    log('\uD83D\uDCCB Ссылка скопирована в буфер обмена!', 'success');
  }).catch(() => {
    log(url, 'info');
  });
}
