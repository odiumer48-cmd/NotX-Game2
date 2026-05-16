import { state } from '../core/State';
import { Host } from '../core/Types';
import { updateList } from '../utils/dom';
import { isFBILocked } from '../game/FBISystem';
import { getMinigameForPort, getServiceName } from '../game/MiniGames';
import { log } from './TerminalUI';

export function renderDarkNet(): void {
  const el = document.getElementById('darknet-content');
  if (!el) return;

  let html = '<h3 style="margin-bottom:10px;color:var(--accent);">\uD83D\uDC80 DarkNet Scanner</h3>';
  html += '<p style="color:var(--text-dim);font-size:12px;margin-bottom:10px;">Разведка \u2192 Сканирование \u2192 Взлом \u2192 Добыча. Не торопитесь \u2014 ФБР следит.</p>';
  html += '<div id="darknet-hosts" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;"></div>';
  html += '<div style="margin-top:12px;font-size:11px;color:var(--text-dim);">\uD83D\uDCA1 Совет: сканируйте перед взломом. Используйте уязвимый порт для +25% шанса.</div>';

  if (state.exploitLogs.length > 0) {
    html += '<div style="margin-top:14px;padding-top:10px;border-top:1px solid var(--border);">';
    html += '<h4 style="color:var(--accent);margin-bottom:6px;font-size:13px;">\uD83D\uDCDC Логи взлома</h4>';
    html += '<div style="max-height:130px;overflow-y:auto;font-size:11px;line-height:1.4;">';
    state.exploitLogs.slice(0, 10).forEach(l => {
      const color = l.success ? 'var(--success)' : 'var(--danger)';
      const icon = l.success ? '\u2705' : '\u274C';
      html += `<div style="margin-bottom:3px;color:${color};">${icon} ${l.host} (${l.ip}) \u2014 ${l.success ? '+$' + l.loot : 'trace ' + l.traceLevel + '%'}</div>`;
    });
    html += '</div></div>';
  }

  el.innerHTML = html;

  const hostsEl = el.querySelector('#darknet-hosts');
  if (hostsEl) {
    updateList(hostsEl as HTMLElement, state.hosts, renderHost, h => `host-${h.id}`);
  }
}

function renderHost(h: Host): HTMLElement {
  const div = document.createElement('div');
  div.className = 'host-card' + (h.owned ? ' owned' : '');
  if (h.traceLevel > 50) div.style.borderColor = 'var(--danger)';

  const scanColor = h.scanned ? 'var(--info)' : 'var(--text-dim)';
  const traceWarn = h.traceLevel > 30 ? `<div style="color:var(--danger);font-size:10px;">\u26A0\uFE0F Слежка ${h.traceLevel}%</div>` : '';

  div.innerHTML = `
    <div style="font-weight:bold;${h.owned ? 'color:var(--success);' : ''}">${h.name}</div>
    <div style="color:var(--text-dim);font-size:11px;">${h.ip}</div>
    <div style="margin-top:4px;font-size:11px;">\uD83D\uDD12 ${h.security}%</div>
    <div style="margin-top:4px;font-size:10px;color:${scanColor};">${h.scanned ? 'Порты: ' + h.ports.map(p => getServiceName(p)).join(',') : 'Требуется сканирование'}</div>
    ${traceWarn}
    <div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap;">
      <button class="btn btn-small nmap-btn" data-ip="${h.ip}">\uD83D\uDD0D</button>
      ${!h.owned ? `<button class="btn btn-small exploit-btn" data-ip="${h.ip}">\u26A1</button>` : ''}
      ${h.owned && !h.looted && h.data > 0 ? `<button class="btn btn-small btn-green loot-btn" data-ip="${h.ip}">\uD83D\uDCC1</button>` : ''}
    </div>
  `;

  div.querySelector('.nmap-btn')?.addEventListener('click', () => {
    import('../commands').then(m => m.execCmd(`nmap ${h.ip}`));
  });
  div.querySelector('.exploit-btn')?.addEventListener('click', () => {
    import('../commands').then(m => m.execCmd(`exploit ${h.ip}`));
  });
  div.querySelector('.loot-btn')?.addEventListener('click', () => {
    import('../commands').then(m => m.execCmd(`loot ${h.ip}`));
  });

  return div;
}
