import { state } from '../core/State';
import { Message } from '../core/Types';
import { updateList } from '../utils/dom';
import { showDialog, closeDialog } from './Dialog';
import { log } from './TerminalUI';

export function renderMail(): void {
  const el = document.getElementById('mail-content');
  if (!el) return;
  if (state.messages.length === 0) {
    el.innerHTML = '<p style="color:var(--text-dim);text-align:center;margin-top:40px;">Нет сообщений.</p>';
    return;
  }

  el.innerHTML = '';
  updateList(el, state.messages, renderMessage, m => String(m.id));
}

function renderMessage(msg: Message): HTMLElement {
  const div = document.createElement('div');
  div.className = 'list-item' + (msg.read ? '' : ' unread');
  div.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <b>${msg.from}</b>
      <span class="tag tag-green">$${msg.reward}</span>
    </div>
    <div style="color:var(--text-dim);font-size:12px;margin-top:2px;">${msg.subject}</div>
  `;
  div.addEventListener('click', () => openMessage(msg));
  return div;
}

function openMessage(msg: Message): void {
  msg.read = true;
  renderMail();
  showDialog(msg.subject, `<b>От:</b> ${msg.from}<br><b>Награда:</b> $${msg.reward}<br><b>Дедлайн:</b> ${msg.deadlineHours}ч<br><br>${msg.body}`, [
    { text: 'Принять', action: () => { acceptMsg(msg.id); closeDialog(); }, primary: true },
    { text: 'Закрыть', action: closeDialog }
  ]);
}

function acceptMsg(id: number): void {
  const msg = state.messages.find(m => m.id === id && !m.accepted);
  if (!msg) return;
  msg.accepted = true;
  const name = `${msg.type}_${msg.from}_${Date.now() % 1000}`;
  log(`Заказ принят! Создайте проект: develop ${msg.type} --name=${name}`, 'success');
  renderMail();
}
