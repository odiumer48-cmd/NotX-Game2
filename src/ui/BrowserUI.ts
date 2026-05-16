import { state } from '../core/State';
import { DIFFICULTY } from '../core/Config';
import { openWindow } from './Window';
import { updateList } from '../utils/dom';

const LISTINGS = [
  { title: 'Антивирус для банка', type: 'antivirus', pay: 350, from: 'BankSys' },
  { title: 'Landing page', type: 'web', pay: 200, from: 'GlobalTech' },
  { title: 'Мобильная игра', type: 'game', pay: 280, from: 'Nexus' },
  { title: 'Корпоративный пентест', type: 'virus', pay: 400, from: 'ShadowNet' },
  { title: 'Защита серверов', type: 'antivirus', pay: 300, from: 'E-Corp' },
  { title: 'Веб-приложение', type: 'web', pay: 220, from: 'OmniCorp' },
];

export function renderBrowser(): void {
  const el = document.getElementById('browser-content');
  if (!el) return;

  const cfg = DIFFICULTY[state.diff];
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gap = '8px';

  LISTINGS.forEach((l, idx) => {
    const div = document.createElement('div');
    div.style.cssText = 'background:white;border:1px solid #ddd;border-radius:6px;padding:12px;';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;"><b style="color:#333;">${l.title}</b><span style="color:#ea4335;font-weight:bold;">$${Math.floor(l.pay * cfg.rewardMult)}</span></div>
      <div style="color:#666;font-size:12px;margin-top:4px;">Заказчик: ${l.from} | Тип: ${l.type}</div>
      <button class="btn" style="margin-top:8px;background:#4285f4;" data-idx="${idx}">\uD83D\uDCCB Взять заказ</button>
    `;
    div.querySelector('button')?.addEventListener('click', () => takeJob(idx));
    grid.appendChild(div);
  });

  el.innerHTML = '<h2 style="color:#ea4335;margin-bottom:6px;">Googie Freelance</h2><p style="color:#666;margin-bottom:12px;font-size:13px;">Биржа заказов. Выбирайте и начинайте прямо здесь!</p>';
  el.appendChild(grid);
}

function takeJob(idx: number): void {
  const l = LISTINGS[idx];
  const cfg = DIFFICULTY[state.diff];
  const msg = {
    id: state.nextMsgId++,
    from: l.from,
    subject: l.title,
    body: `Заказ из Googie Freelance: ${l.title}. Срок: ${Math.floor(6 * cfg.deadlineMult)}ч.`,
    type: l.type as 'game' | 'virus' | 'antivirus' | 'web',
    reward: Math.floor(l.pay * cfg.rewardMult),
    deadlineHours: Math.floor(6 * cfg.deadlineMult),
    date: new Date(state.gameTime),
    read: false,
    accepted: false,
  };
  state.messages = [...state.messages, msg];
  import('./TerminalUI').then(m => m.log(`\uD83D\uDCCB Заказ "${l.title}" добавлен в Почту!`, 'success'));
  renderBrowser();
  openWindow('mail');
}
