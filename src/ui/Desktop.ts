import { state } from '../core/State';
import { openWindow, focusWindow } from './Window';

const SAVE_KEY = 'linuxdev_icons_v4';
const DRAG_THRESHOLD = 4;
const GRID_SIZE = 10;

export function setupDesktop(): void {
  loadPositions();

  document.querySelectorAll('.desktop-icon').forEach(el => {
    el.addEventListener('mousedown', onDown);
    el.addEventListener('touchstart', onDown as any, { passive: false });
  });

  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove as any, { passive: false });
  document.addEventListener('mouseup', onUp);
  document.addEventListener('touchend', onUp as any);
  document.addEventListener('touchcancel', onUp as any);
}

let dragEl: HTMLElement | null = null;
let dragOffsetX = 0, dragOffsetY = 0, startMouseX = 0, startMouseY = 0, hasDragged = false;

function getPoint(e: MouseEvent | TouchEvent): MouseEvent | Touch {
  return (e as TouchEvent).touches?.length ? (e as TouchEvent).touches[0] : e as MouseEvent;
}

function onDown(e: MouseEvent | TouchEvent): void {
  if ((e as MouseEvent).button !== undefined && (e as MouseEvent).button !== 0) return;
  const el = e.currentTarget as HTMLElement;
  const p = getPoint(e);
  const rect = el.getBoundingClientRect();

  dragEl = el;
  dragOffsetX = (p as MouseEvent).clientX - rect.left;
  dragOffsetY = (p as MouseEvent).clientY - rect.top;
  startMouseX = (p as MouseEvent).clientX;
  startMouseY = (p as MouseEvent).clientY;
  hasDragged = false;
  if ((e as TouchEvent).type === 'touchstart') e.preventDefault();
}

function onMove(e: MouseEvent | TouchEvent): void {
  if (!dragEl) return;
  const p = getPoint(e);
  const movedX = Math.abs((p as MouseEvent).clientX - startMouseX);
  const movedY = Math.abs((p as MouseEvent).clientY - startMouseY);

  if (!hasDragged && (movedX > DRAG_THRESHOLD || movedY > DRAG_THRESHOLD)) {
    hasDragged = true;
    dragEl.classList.add('dragging');
    (window as any)._iconDragging = true;
  }
  if (!hasDragged) return;

  const desk = document.getElementById('desktop');
  if (!desk) return;
  const deskRect = desk.getBoundingClientRect();
  const maxX = desk.clientWidth - dragEl.offsetWidth;
  const maxY = desk.clientHeight - dragEl.offsetHeight;

  let nx = (p as MouseEvent).clientX - deskRect.left - dragOffsetX;
  let ny = (p as MouseEvent).clientY - deskRect.top - dragOffsetY;

  nx = Math.max(0, Math.min(nx, maxX));
  ny = Math.max(0, Math.min(ny, maxY));
  nx = Math.round(nx / GRID_SIZE) * GRID_SIZE;
  ny = Math.round(ny / GRID_SIZE) * GRID_SIZE;

  dragEl.style.left = nx + 'px';
  dragEl.style.top = ny + 'px';
  if ((e as TouchEvent).type === 'touchmove') e.preventDefault();
}

function onUp(_e: MouseEvent | TouchEvent): void {
  if (!dragEl) return;
  const el = dragEl;
  el.classList.remove('dragging');
  if (hasDragged) {
    savePositions();
    requestAnimationFrame(() => requestAnimationFrame(() => (window as any)._iconDragging = false));
  }
  dragEl = null;
  hasDragged = false;
}

function loadPositions(): void {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    Object.entries(saved).forEach(([id, pos]) => {
      const el = document.getElementById(id);
      const p = pos as { x: number; y: number };
      if (el && typeof p.x === 'number' && typeof p.y === 'number') {
        el.style.left = p.x + 'px';
        el.style.top = p.y + 'px';
      }
    });
  } catch { /* ignore */ }
}

function savePositions(): void {
  const pos: Record<string, { x: number; y: number }> = {};
  document.querySelectorAll('.desktop-icon').forEach(el => {
    const htmlEl = el as HTMLElement;
    pos[htmlEl.id] = {
      x: parseFloat(htmlEl.style.left) || 0,
      y: parseFloat(htmlEl.style.top) || 0
    };
  });
  localStorage.setItem(SAVE_KEY, JSON.stringify(pos));
}

export function iconOpen(name: string): void {
  if ((window as any)._iconDragging) return;
  openWindow(name);
  focusWindow(name);
}
