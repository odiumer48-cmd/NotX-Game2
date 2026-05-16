import { state } from '../core/State';
import { fmtTime } from '../utils/dom';
import { getFBIWarning } from '../game/FBISystem';
import { getTimeOfDayLabel } from '../game/Market';

export function updateTopBar(): void {
  const statsEl = document.getElementById('top-stats');
  const fbiEl = document.getElementById('top-fbi');
  const timeEl = document.getElementById('top-time');
  const diffEl = document.getElementById('top-diff');
  const hintEl = document.getElementById('tb-hint');

  if (statsEl) {
    let text = `\uD83D\uDCB0 $${state.money} | \u2B50 ${state.reputation}`;
    if (state.lockout?.active) {
      const remaining = Math.ceil((state.lockout.endTime - Date.now()) / 1000);
      text += ` | \uD83D\uDD12 ${remaining}\u0441`;
    }
    statsEl.textContent = text;
  }

  if (fbiEl) {
    const color = state.fbi > 80 ? 'var(--danger)' : state.fbi > 50 ? 'var(--warning)' : 'var(--success)';
    fbiEl.textContent = `\uD83D\uDE94 FBI: ${Math.floor(state.fbi)}%`;
    fbiEl.style.color = color;
  }

  if (timeEl) timeEl.textContent = fmtTime(state.gameTime);

  if (diffEl) {
    const labels: Record<string, string> = { easy: '\uD83D\uDD37', normal: '\uD83D\uDD38', hard: '\uD83D\uDD39' };
    diffEl.textContent = `${labels[state.diff] || ''} ${state.diff}`;
  }

  if (hintEl) {
    hintEl.textContent = state.fbi >= 80 ? '\u26A0\uFE0F FBI ВНИМАНИЕ!' : '';
  }
}
