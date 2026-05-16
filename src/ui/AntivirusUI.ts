import { state } from '../core/State';
import { log } from './TerminalUI';
import { openWindow } from './Window';

export function renderAntivirus(): void {
  const el = document.getElementById('antivirus-content');
  if (!el) return;

  const income = state.antivirusStock * 5;
  el.innerHTML = `
    <h3 style="margin-bottom:10px;color:var(--info);">\uD83D\uDEE1\uFE0F Antivirus Lab</h3>
    <p style="color:var(--text-dim);font-size:12px;margin-bottom:12px;">
      Разрабатывайте антивирусы для продажи.<br>
      Каждый антивирус приносит пассивный доход.
    </p>
    <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px;margin-bottom:12px;">
      <div class="stat-row"><span>\uD83D\uDCE6 На складе:</span><b>${state.antivirusStock}</b></div>
      <div class="stat-row"><span>\uD83D\uDCB0 Продано:</span><b>${state.antivirusSold}</b></div>
      <div class="stat-row"><span>\uD83D\uDCB5 Доход/тик:</span><b>$${income}</b></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button class="btn btn-green create-av-btn">\uD83D\uDCDD Написать антивирус</button>
      <button class="btn sell-av-btn" data-amt="1">\uD83D\uDCB0 Продать 1 ($80)</button>
      <button class="btn sell-av-btn" data-amt="5">\uD83D\uDCB0 Продать 5 ($350)</button>
      <button class="btn btn-secondary sell-av-btn" data-amt="all">\uD83D\uDCB0 Продать всё ($${state.antivirusStock * 70})</button>
    </div>
  `;

  el.querySelector('.create-av-btn')?.addEventListener('click', createAntivirus);
  el.querySelectorAll('.sell-av-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const amt = (btn as HTMLElement).dataset.amt || '1';
      sellAntivirus(amt === 'all' ? state.antivirusStock : parseInt(amt));
    });
  });
}

function createAntivirus(): void {
  if (state.activeTask) { log('Сначала завершите текущий проект.', 'warning'); return; }
  const name = 'AV_Security_' + Math.floor(Math.random() * 1000);
  // Generate antivirus code task
  const code = `antivirus_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_scan_quarantine`;
  const proj = {
    id: state.nextProjId++,
    type: 'antivirus' as const,
    name,
    lang: 'python' as const,
    code,
    progress: 0,
    completed: false,
    failed: false,
    uploaded: false,
    reward: 0,
    deadline: new Date(state.gameTime.getTime() + 4 * 3600000),
    fbiRisk: 0,
    isAV: true,
  };
  state.projects = [...state.projects, proj];
  state.activeTask = proj;
  log(`\uD83D\uDEE1\uFE0F Начата разработка антивируса "${name}". Введите код!`, 'info');
  openWindow('terminal');
}

function sellAntivirus(amount: number): void {
  if (amount <= 0) return;
  if (state.antivirusStock < amount) { log('Недостаточно антивирусов!', 'warning'); return; }
  const pricePerUnit = amount >= 5 ? 70 : 80;
  const total = amount * pricePerUnit;
  state.antivirusStock -= amount;
  state.antivirusSold += amount;
  state.money += total;
  state.reputation = Math.min(100, state.reputation + amount);
  log(`\uD83D\uDCB0 Продано ${amount} антивирусов за $${total}.`, 'success');
  renderAntivirus();
}
