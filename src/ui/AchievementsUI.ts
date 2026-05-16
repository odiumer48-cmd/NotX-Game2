import { state } from '../core/State';
import { Achievement } from '../core/Types';

export function renderAchievements(): void {
  const el = document.getElementById('achievements-content');
  if (!el) return;

  const achievements = Object.values(state.achievements);
  const unlocked = achievements.filter(a => a.unlocked).length;

  let html = '<h3 style="margin-bottom:10px;color:var(--accent);">\uD83C\uDFC6 Достижения</h3>';
  html += '<div class="ach-grid">';

  achievements.forEach(a => {
    html += `
      <div class="ach-card ${a.unlocked ? 'unlocked' : ''}">
        <div class="ach-icon">${a.icon}</div>
        <div class="ach-title">${a.title}</div>
        <div class="ach-desc">${a.desc}</div>
      </div>
    `;
  });

  html += '</div>';
  html += `<div style="margin-top:12px;font-size:12px;color:var(--text-dim);">Разблокировано: ${unlocked} / ${achievements.length}</div>`;
  el.innerHTML = html;
}
