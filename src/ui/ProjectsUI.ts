import { state } from '../core/State';
import { Project } from '../core/Types';
import { updateList } from '../utils/dom';
import { log } from './TerminalUI';

export function renderProjects(): void {
  const el = document.getElementById('projects-content');
  if (!el) return;
  if (state.projects.length === 0) {
    el.innerHTML = '<p style="color:var(--text-dim);text-align:center;margin-top:40px;">Нет проектов. Начните через терминал: develop game --name=MyGame</p>';
    return;
  }

  el.innerHTML = '';
  updateList(el, state.projects, renderProject, p => String(p.id));
}

function renderProject(p: Project): HTMLElement {
  const div = document.createElement('div');
  div.className = 'list-item' + (p.failed ? ' danger' : p.completed ? ' success' : '');
  const pct = p.completed ? 100 : Math.floor((p.progress / p.code.length) * 100);

  const tagClass = p.type === 'virus' ? 'tag-red' : p.type === 'antivirus' ? 'tag-blue' : 'tag-green';
  const statusText = p.completed ? 'Готов к загрузке' : p.failed ? 'Провален' : `${pct}%`;

  div.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <b>${p.name}</b>
      <span class="tag ${tagClass}">${p.type}</span>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
      <small style="color:var(--text-dim);">${statusText}</small>
      ${p.completed && !p.uploaded ? `<button class="btn btn-small upload-btn" data-id="${p.id}">Сдать (+$${p.reward})</button>` : ''}
      ${p.isAV && p.completed && !p.uploaded ? `<button class="btn btn-small btn-green av-btn" data-id="${p.id}">На склад</button>` : ''}
    </div>
  `;

  div.querySelector('.upload-btn')?.addEventListener('click', () => uploadProject(p.id));
  div.querySelector('.av-btn')?.addEventListener('click', () => finishAVProject(p.id));
  return div;
}

function uploadProject(id: number): void {
  const proj = state.projects.find(p => p.id === id);
  if (!proj || !proj.completed || proj.uploaded) return;
  proj.uploaded = true;
  state.money += proj.reward;
  state.totalEarned += proj.reward;
  state.fbi = Math.min(100, state.fbi + proj.fbiRisk);
  state.reputation = Math.min(100, state.reputation + (proj.type === 'virus' ? -3 : 8));
  log(`\uD83D\uDCE6 "${proj.name}" сдан! +$${proj.reward}`, 'success');
  if (proj.fbiRisk > 5) log(`\uD83D\uDE94 Внимание FBI +${proj.fbiRisk}%`, 'danger');
  state.activeTask = null;
  renderProjects();
}

function finishAVProject(id: number): void {
  const proj = state.projects.find(p => p.id === id);
  if (!proj || !proj.isAV || proj.uploaded) return;
  proj.uploaded = true;
  state.antivirusStock++;
  state.reputation = Math.min(100, state.reputation + 5);
  log(`\uD83D\uDEE1\uFE0F Антивирус "${proj.name}" добавлен на склад!`, 'success');
  renderProjects();
}
