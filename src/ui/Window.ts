import { state } from '../core/State';

let zIndex = 200;
let drag: { id: string; dx: number; dy: number } | null = null;

export function openWindow(name: string): void {
  if ((window as any)._iconDragging) return;
  const win = document.getElementById('win-' + name);
  if (!win) return;

  win.classList.add('active', 'opening', 'focused');
  setTimeout(() => win.classList.remove('opening'), 200);
  win.style.zIndex = String(++zIndex);
  state.wins = { ...state.wins, [name]: true };

  state.dispatchEvent(new CustomEvent('window-open', { detail: name }));
  focusWindow(name);
}

export function closeWindow(name: string): void {
  const win = document.getElementById('win-' + name);
  if (win) win.classList.remove('active', 'focused');
  state.wins = { ...state.wins, [name]: false };
}

export function minWindow(name: string): void {
  const win = document.getElementById('win-' + name);
  if (win) win.classList.remove('active');
}

export function focusWindow(name: string): void {
  const win = document.getElementById('win-' + name);
  if (!win) return;
  if (!win.classList.contains('active')) win.classList.add('active');
  win.style.zIndex = String(++zIndex);
  document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
  win.classList.add('focused');
}

export function startDrag(e: MouseEvent, id: string): void {
  const win = document.getElementById(id);
  if (!win) return;
  drag = { id, dx: e.clientX - win.offsetLeft, dy: e.clientY - win.offsetTop };
  focusWindow(id.replace('win-', ''));
}

export function setupDragListeners(): void {
  document.addEventListener('mousemove', e => {
    if (!drag) return;
    const win = document.getElementById(drag.id);
    if (win) {
      win.style.left = (e.clientX - drag.dx) + 'px';
      win.style.top = (e.clientY - drag.dy) + 'px';
    }
  });
  document.addEventListener('mouseup', () => drag = null);

  // Debounced resize
  let resizeTimer: ReturnType<typeof setTimeout>;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.querySelectorAll('.window').forEach(w => {
        const el = w as HTMLElement;
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth) el.style.left = Math.max(0, window.innerWidth - rect.width) + 'px';
        if (rect.bottom > window.innerHeight) el.style.top = Math.max(0, window.innerHeight - rect.height) + 'px';
      });
    }, 250);
  });
}

export function clampWindowsToViewport(): void {
  document.querySelectorAll('.window').forEach(w => {
    const el = w as HTMLElement;
    if (!el.classList.contains('active')) return;
    const rect = el.getBoundingClientRect();
    if (rect.left < 0) el.style.left = '0px';
    if (rect.top < 28) el.style.top = '28px';
    if (rect.right > window.innerWidth) el.style.left = Math.max(0, window.innerWidth - rect.width) + 'px';
    if (rect.bottom > window.innerHeight - 44) el.style.top = Math.max(28, window.innerHeight - 44 - rect.height) + 'px';
  });
}
