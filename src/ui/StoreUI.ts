import { state } from '../core/State';
import { getPrice, getMarketTrend } from '../game/Market';
import { log } from './TerminalUI';

const ITEMS = [
  { id: 'hw', icon: '\uD83D\uDDA5\uFE0F', name: 'Улучшить железо', level: () => state.hw },
  { id: 'sw', icon: '\uD83D\uDCBE', name: 'Улучшить софт', level: () => state.sw },
  { id: 'net', icon: '\uD83C\uDF10', name: 'Улучшить сеть', level: () => state.net },
  { id: 'def', icon: '\uD83D\uDEE1\uFE0F', name: 'Антивирус', level: () => 0 },
  { id: 'proxy', icon: '\uD83D\uDD17', name: 'Прокси-цепь', level: () => state.proxyChain.level },
];

export function renderStore(): void {
  const el = document.getElementById('store-content');
  if (!el) return;

  let html = '<h3 style="margin-bottom:10px;color:var(--accent);">\uD83D\uDED2 Магазин улучшений</h3>';
  html += `<div style="font-size:12px;color:var(--text-dim);margin-bottom:10px;">\uD83D\uDCC8 ${getMarketTrend()}</div>`;

  ITEMS.forEach(item => {
    const price = getPrice(item.id);
    const level = item.level();
    const canAfford = state.money >= price;
    html += `
      <div class="list-item" style="display:flex;justify-content:space-between;align-items:center;">
        <span>${item.icon} ${item.name} (ур.${level}) \u2014 $${price}</span>
        <button class="btn buy-btn" data-item="${item.id}" ${!canAfford ? 'disabled' : ''}>$${price}</button>
      </div>
    `;
  });

  html += `<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border);font-size:12px;color:var(--text-dim);">\uD83D\uDCB0 Баланс: <b style="color:var(--text);">$${state.money}</b></div>`;
  el.innerHTML = html;

  el.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = (btn as HTMLElement).dataset.item || '';
      buyItem(itemId);
    });
  });
}

function buyItem(itemId: string): void {
  const price = getPrice(itemId);
  if (state.money < price) { log('Недостаточно средств.', 'warning'); return; }

  state.money -= price;

  switch (itemId) {
    case 'hw': state.hw++; log('\u2B06\uFE0F Железо улучшено!', 'success'); break;
    case 'sw': state.sw++; log('\u2B06\uFE0F Софт улучшен!', 'success'); break;
    case 'net': state.net++; log('\u2B06\uFE0F Сеть улучшена!', 'success'); break;
    case 'def': state.reputation = Math.min(100, state.reputation + 5); state.fbi = Math.max(0, state.fbi - 5); log('\uD83D\uDEE1\uFE0F Защита +5, FBI -5', 'success'); break;
    case 'proxy':
      state.proxyChain.level++;
      state.proxyChain.active = true;
      state.proxyChain.fbiReduction = state.proxyChain.level * 10;
      log('\uD83D\uDD17 Прокси-цепь активирована! FBI замедлен.', 'success');
      break;
  }

  renderStore();
}
