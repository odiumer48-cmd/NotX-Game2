import { state } from '../core/State';
import { Achievement } from '../core/Types';
import { log } from '../ui/TerminalUI';

export function createAchievements(): Record<string, Achievement> {
  return {
    first_project: { id: 'first_project', title: 'Hello World', desc: 'Завершить первый проект', icon: '\uD83D\uDC4B', unlocked: false },
    first_hack: { id: 'first_hack', title: 'Script Kiddie', desc: 'Взломать первый хост', icon: '\uD83D\uDCBB', unlocked: false },
    rich: { id: 'rich', title: 'Капиталист', desc: 'Заработать $1000', icon: '\uD83D\uDCB0', unlocked: false },
    ghost: { id: 'ghost', title: 'Призрак', desc: 'Сбросить FBI до 0%', icon: '\uD83D\uDC7B', unlocked: false },
    av_king: { id: 'av_king', title: 'Антивирусный магнат', desc: 'Продать 10 антивирусов', icon: '\uD83D\uDEE1\uFE0F', unlocked: false },
    bankrupt: { id: 'bankrupt', title: 'Банкрот', desc: 'Деньги упали ниже $0', icon: '\uD83D\uDCC9', unlocked: false },
    collector: { id: 'collector', title: 'Коллекционер', desc: 'Написать 5 файлов', icon: '\uD83D\uDCC2', unlocked: false },
    hacker_pro: { id: 'hacker_pro', title: 'Hackerman', desc: 'Взломать 5 хостов', icon: '\uD83D\uDD76\uFE0F', unlocked: false },
    reputation: { id: 'reputation', title: 'Легенда', desc: 'Достичь 100 репутации', icon: '\u2B50', unlocked: false },
    double_life: { id: 'double_life', title: 'Двойная жизнь', desc: 'white-hat 80+ и black-hat 50+', icon: '\uD83C\uDFAD', unlocked: false },
    virus_master: { id: 'virus_master', title: 'Вирусмейкер', desc: 'Развернуть 3 вируса', icon: '\uD83E\uDDA0', unlocked: false },
    tech_guru: { id: 'tech_guru', title: 'Техно-гуру', desc: 'Изучить 8 технологий', icon: '\uD83E\uDD13', unlocked: false },
    proxy_chain: { id: 'proxy_chain', title: 'Призрак в сети', desc: 'Активировать прокси-цепь', icon: '\uD83D\uDD17', unlocked: false },
    no_trace: { id: 'no_trace', title: 'Нулевой след', desc: 'Взломать хост без сканирования', icon: '\uD83C\uDF2B\uFE0F', unlocked: false },
  };
}

export function unlockAchievement(id: string): void {
  const a = state.achievements[id];
  if (a && !a.unlocked) {
    a.unlocked = true;
    log(`\uD83C\uDFC6 Достижение разблокировано: ${a.title}!`, 'success');
    pushNotification('Достижение', `${a.title} \u2014 ${a.desc}`);
    state.dispatchEvent(new CustomEvent('achievement', { detail: a }));
  }
}

export function checkAchievements(): void {
  if (!state?.achievements) return;
  const completedProjects = state.projects.filter(p => p.uploaded).length;
  const ownedHosts = state.hosts.filter(h => h.owned).length;

  if (completedProjects >= 1) unlockAchievement('first_project');
  if (ownedHosts >= 1) unlockAchievement('first_hack');
  if (state.totalEarned >= 1000) unlockAchievement('rich');
  if (state.fbi <= 0 && state.gameTime.getHours() > 0) unlockAchievement('ghost');
  if (state.antivirusSold >= 10) unlockAchievement('av_king');
  if (state.money < 0) unlockAchievement('bankrupt');
  if (ownedHosts >= 5) unlockAchievement('hacker_pro');
  if (state.reputation >= 100) unlockAchievement('reputation');
  if (state.whiteHatRep >= 80 && state.blackHatRep >= 50) unlockAchievement('double_life');
  if (getActiveVirusCount() >= 3) unlockAchievement('virus_master');
  if (Object.values(state.techs).filter(t => t.unlocked).length >= 8) unlockAchievement('tech_guru');
  if (state.proxyChain.active) unlockAchievement('proxy_chain');
}

function getActiveVirusCount(): number {
  return state.virusWeapons?.filter(v => v.deployed).length || 0;
}

function pushNotification(title: string, text: string): void {
  const wrap = document.getElementById('notifications');
  if (!wrap) return;
  const n = document.createElement('div');
  n.className = 'notification-toast';
  n.innerHTML = `<b>${title}</b><div style="margin-top:4px;color:#bbb;">${text}</div>`;
  wrap.appendChild(n);
  setTimeout(() => n.remove(), 4000);
}


