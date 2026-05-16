import { playNotification } from '../game/AudioManager';

export function pushNotification(title: string, text: string): void {
  const wrap = document.getElementById('notifications');
  if (!wrap) return;

  const n = document.createElement('div');
  n.className = 'notification-toast';
  n.innerHTML = `<b>${title}</b><div style="margin-top:4px;color:#bbb;">${text}</div>`;
  wrap.appendChild(n);

  playNotification();
  setTimeout(() => n.remove(), 4000);
}
