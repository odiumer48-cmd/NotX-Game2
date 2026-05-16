import { state } from '../core/State';
import { DIFFICULTY } from '../core/Config';
import { log } from '../ui/TerminalUI';

export function updateFBI(): void {
  const cfg = DIFFICULTY[state.diff];

  // Base decay
  if (state.fbi > 0) {
    const decay = state.proxyChain.active ? 0.06 : 0.03;
    state.fbi = Math.max(0, state.fbi - decay);
  }

  // Proxy chain reduction
  if (state.proxyChain.active) {
    state.fbi = Math.max(0, state.fbi - state.proxyChain.fbiReduction * 0.01);
  }

  // Cap
  if (state.fbi >= 100) {
    state.fbi = 100;
    triggerFBIRaid();
  }
}

function triggerFBIRaid(): void {
  if (state.gameOver) return;
  const penalty = Math.floor(state.money * 0.3);
  state.money -= penalty;
  state.reputation = Math.max(0, state.reputation - 20);
  state.fbi = 30; // Reset but stay high
  log(`\uD83D\uDEA8 FBI RAID! Конфисковано $${penalty}. Репутация -20!`, 'danger');

  // Lockout
  state.lockout = {
    active: true,
    endTime: Date.now() + 60000,
    count: (state.lockout?.count || 0) + 1
  };
}

export function increaseFBI(amount: number): void {
  const cfg = DIFFICULTY[state.diff];
  state.fbi = Math.min(100, state.fbi + amount * cfg.fbiMult);
}

export function isFBILocked(): boolean {
  if (!state.lockout?.active) return false;
  if (Date.now() >= state.lockout.endTime) {
    state.lockout.active = false;
    return false;
  }
  return true;
}

export function getFBILockRemaining(): number {
  if (!state.lockout?.active) return 0;
  return Math.ceil((state.lockout.endTime - Date.now()) / 1000);
}

export function getFBIWarning(): string {
  const f = state.fbi;
  if (f > 80) return '\uD83D\uDD34 КРИТИЧЕСКИ';
  if (f > 60) return '\uD83D\uDFE0 Высокий';
  if (f > 40) return '\uD83D\uDFE1 Средний';
  if (f > 20) return '\uD83D\uDFE2 Низкий';
  return '\uD83D\uDFE2 Безопасно';
}
