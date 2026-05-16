import { state } from '../core/State';
import { DIFFICULTY, LANGS, FORTUNES, HOST_NAMES } from '../core/Config';
import { Project, Host } from '../core/Types';
import { log } from '../ui/TerminalUI';
import { openWindow } from '../ui/Window';
import { showDialog } from '../ui/Dialog';
import { pushNotification } from '../ui/Notifications';
import { isFBILocked, getFBILockRemaining } from '../game/FBISystem';
import { unlockTech, getAvailableTechs, hasTech, applyTechEffects } from '../game/TechTree';
import { getMarketTrend } from '../game/Market';
import { createVirus, deployVirus } from '../game/VirusSystem';
import { saveGame, loadGame } from '../game/SaveManager';
import { fmtTime } from '../utils/dom';
import { renderAntivirus } from '../ui/AntivirusUI';
import { renderProjects } from '../ui/ProjectsUI';
import { renderDarkNet } from '../ui/DarkNetUI';

export function execCmd(input: string): void {
  const args = input.trim().split(/\s+/);
  const cmd = args[0].toLowerCase();
  const rest = input.slice(cmd.length).trim();

  switch (cmd) {
    case 'help': cmdHelp(); break;
    case 'status': cmdStatus(); break;
    case 'clear': document.getElementById('term-out') && (document.getElementById('term-out')!.innerHTML = ''); break;
    case 'exit': location.reload(); break;
    case 'poweroff': log('System shutdown...', 'system'); setTimeout(() => location.reload(), 800); break;
    case 'reboot': log('Rebooting...', 'warning'); setTimeout(() => location.reload(), 1200); break;
    case 'develop': cmdDevelop(rest); break;
    case 'upload': cmdUpload(args[1]); break;
    case 'cancel': cmdCancel(); break;
    case 'cancelhack': cmdCancelHack(); break;
    case 'nmap': cmdNmap(args[1]); break;
    case 'exploit': cmdExploit(rest); break;
    case 'loot': cmdLoot(args[1]); break;
    case 'connect': cmdConnect(args[1]); break;
    case 'scan': cmdScan(); break;
    case 'buy': cmdBuy(rest); break;
    case 'sell': cmdSell(rest); break;
    case 'invest': cmdInvest(args[1], args[2]); break;
    case 'store': case 'browser': case 'mail': case 'projects': case 'darknet': case 'antivirus':
    case 'files': case 'achievements': case 'settings':
      openWindow(cmd); break;
    case 'save': saveGame(); break;
    case 'load': loadGame(); break;
    case 'matrix': cmdMatrix(); break;
    case 'cowsay': cmdCowsay(rest); break;
    case 'fortune': cmdFortune(); break;
    case 'date': log(`Системное время: ${state.gameTime.toLocaleString('ru-RU')}`, 'info'); break;
    case 'whoami': cmdWhoami(); break;
    case 'uptime': log(`Время в игре: ${fmtTime(state.gameTime)}`, 'info'); break;
    case 'neofetch': cmdNeofetch(); break;
    case 'techtree': cmdTechTree(); break;
    case 'market': cmdMarket(); break;
    case 'deploy': cmdDeploy(rest); break;
    case 'proxy': toggleProxy(); break;
    case 'virus': cmdVirus(rest); break;
    case 'sudo': cmdSudo(rest); break;
    default: log(`Неизвестная команда: ${cmd}. Введите help для справки.`, 'warning');
  }
}

function cmdHelp(): void {
  log(`\uD83D\uDDA5\uFE0F Доступные команды:
  help                    \u2014 справка
  status                  \u2014 статус персонажа
  neofetch                \u2014 системная информация
  whoami                  \u2014 кто ты
  date                    \u2014 системное время
  uptime                  \u2014 время в игре
  matrix                  \u2014 пасхалка
  cowsay <текст>          \u2014 корова говорит
  fortune                 \u2014 мудрость дня
  reboot / poweroff       \u2014 перезагрузка/выключение
  develop <тип> --name=... --lang=...
     типы: game, virus, antivirus, web
  upload <id>             \u2014 сдать проект
  cancel / cancelhack     \u2014 отменить проект/взлом
  nmap <ip>               \u2014 сканировать хост
  exploit <ip> [порт]     \u2014 взломать хост
  loot <ip>               \u2014 забрать данные
  connect <ip>            \u2014 подключиться
  scan                    \u2014 показать сеть
  buy <item>              \u2014 купить (hw, sw, net, def, proxy)
  sell <кол-во>           \u2014 продать антивирус
  invest <name> <$$>      \u2014 инвестировать
  techtree                \u2014 дерево технологий
  market                  \u2014 рыночные цены
  deploy <virus_id>       \u2014 развернуть вирус
  proxy                   \u2014 переключить прокси
  virus create <тип> <имя> \u2014 создать вирус
  store, browser, mail... \u2014 открыть окно
  save, load              \u2014 сохранить/загрузить`, 'info');
}

function cmdStatus(): void {
  log(`\uD83D\uDCB0 $${state.money} | \u2B50 ${state.reputation} | \uD83D\uDD50 ${fmtTime(state.gameTime)}`);
  log(`\uD83D\uDE94 FBI: ${Math.floor(state.fbi)}% | \uD83D\uDEE1\uFE0F Защита: ${state.sw * 15}%`);
  log(`\uD83D\uDDA5\uFE0F HW:${state.hw} \uD83D\uDCBE SW:${state.sw} \uD83C\uDF10 NET:${state.net}`);
  log(`\uD83D\uDEE1\uFE0F Антивирусов: ${state.antivirusStock} | Продано: ${state.antivirusSold}`);
  log(`\uD83D\uDCB9 Рынок: ${getMarketTrend()}`);
  if (state.proxyChain.active) log(`\uD83D\uDD17 Прокси: ур.${state.proxyChain.level} (-${state.proxyChain.fbiReduction}% FBI)`, 'success');
  if (state.activeTask) log(`\uD83D\uDCDD Проект: ${state.activeTask.name} (${state.activeTask.progress}/${state.activeTask.code.length})`);
  if (state.hackTask) log(`\u26A1 Взлом: ${state.hackTask.hostName} (${state.hackTask.progress}/${state.hackTask.code.length})`);
  if (isFBILocked()) log(`\uD83D\uDD12 Блокировка FBI: ${getFBILockRemaining()}с`, 'danger');
}

function cmdDevelop(argsStr: string): void {
  if (state.activeTask) { log('Уже есть активный проект. Используйте cancel.', 'warning'); return; }
  const parts = argsStr.split(/\s+/);
  const type = parts[0];
  if (!['game', 'virus', 'antivirus', 'web'].includes(type)) { log('Типы: game, virus, antivirus, web', 'warning'); return; }

  let name = type + '_' + Math.floor(Math.random() * 1000);
  let lang: string = state.lang;
  parts.slice(1).forEach(arg => {
    if (arg.startsWith('--name=')) name = arg.split('=')[1];
    if (arg.startsWith('--lang=')) lang = arg.split('=')[1];
  });
  if (!LANGS[lang]) lang = 'python';

  const cfg = DIFFICULTY[state.diff];
  const code = generateCode(type, name, lang, cfg.codeMult);
  const l = LANGS[lang];
  const reward = Math.floor(code.length * 15 * l.reward * cfg.rewardMult * (1 + Math.random() * 0.3));

  const proj: Project = {
    id: state.nextProjId++,
    type: type as any, name, lang: lang as any,
    code, progress: 0,
    completed: false, failed: false, uploaded: false,
    reward,
    deadline: new Date(state.gameTime.getTime() + (6 + Math.floor(Math.random() * 4)) * 3600000 * cfg.deadlineMult),
    fbiRisk: Math.floor((type === 'virus' ? 12 : type === 'antivirus' ? 2 : 5) * cfg.fbiMult),
    isAV: type === 'antivirus',
  };

  state.projects = [...state.projects, proj];
  state.activeTask = proj;
  log(`\uD83D\uDCDD Проект "${name}" [${type}] начат. Язык: ${l.name}. Длина: ${code.length} симв. Награда: $${reward}`, 'success');
}

function generateCode(type: string, name: string, _lang: string, mult: number): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  let code = '';
  if (type === 'virus') code = `malware_${base}_payload_exec`;
  else if (type === 'antivirus') code = `antivirus_${base}_scan_quarantine`;
  else if (type === 'web') code = `react_${base}_component_render`;
  else code = `game_${base}_engine_init_loop`;

  const targetLen = Math.max(15, Math.floor(code.length * mult));
  while (code.length < targetLen) {
    code += '_' + Math.random().toString(36).substring(2, 5);
  }
  return code.substring(0, targetLen);
}

function cmdUpload(idStr: string): void {
  const id = parseInt(idStr);
  const proj = state.projects.find(p => p.id === id);
  if (!proj) { log('Проект не найден.', 'warning'); return; }
  if (!proj.completed) { log('Сначала завершите код.', 'warning'); return; }
  if (proj.uploaded) { log('Уже сдан.', 'warning'); return; }
  proj.uploaded = true;
  state.money += proj.reward;
  state.totalEarned += proj.reward;
  state.fbi = Math.min(100, state.fbi + proj.fbiRisk);
  state.reputation = Math.min(100, state.reputation + (proj.type === 'virus' ? -3 : 8));
  if (proj.type === 'virus') state.blackHatRep += 5;
  else state.whiteHatRep += 3;
  log(`\uD83D\uDCE6 "${proj.name}" сдан! +$${proj.reward}`, 'success');
  if (proj.fbiRisk > 5) log(`\uD83D\uDE94 FBI +${proj.fbiRisk}%`, 'danger');
  state.activeTask = null;
  renderProjects();
}

function cmdCancel(): void {
  if (!state.activeTask) { log('Нет активного проекта.', 'warning'); return; }
  state.activeTask = null;
  log('Проект отменён.', 'warning');
}

function cmdCancelHack(): void {
  if (!state.hackTask) { log('Нет активного взлома.', 'warning'); return; }
  state.hackTask = null;
  log('Взлом отменён.', 'warning');
}

function cmdNmap(ip: string): void {
  if (isFBILocked()) return;
  if (!ip) { log('Использование: nmap <ip>', 'warning'); return; }
  const h = state.hosts.find(x => x.ip === ip);
  if (!h) { log('Хост не найден.', 'warning'); return; }
  h.scanned = true;
  h.traceLevel += Math.floor(Math.random() * 6) + 2;

  // Write to known_hosts
  try {
    const sshNode = (state.fs as any).children?.home?.children?.['.ssh'];
    if (sshNode?.children?.['known_hosts']?.type === 'file') {
      sshNode.children['known_hosts'].content += `\n${h.ip} ${h.name} ports:${h.ports.join(',')}`;
    }
  } catch { /* ignore */ }

  log(`\uD83D\uDD0D ${ip} \u2014 ${h.name}`, 'info');
  log(`   Защита: ${h.security}% | Порты: ${h.ports.map(p => p + '(' + p + ')').join(', ')}`);
  log(`   \uD83D\uDCA1 Порт ${h.vulnPort} выглядит уязвимым`);
  state.fbi = Math.min(100, state.fbi + 1.5);
  renderDarkNet();
}

function cmdExploit(args: string): void {
  if (isFBILocked()) return;
  if (!args) { log('Использование: exploit <ip> [порт]', 'warning'); return; }
  const parts = args.split(' ');
  const ip = parts[0];
  const port = parts[1] ? parseInt(parts[1]) : null;
  const h = state.hosts.find(x => x.ip === ip);
  if (!h) { log('Хост не найден.', 'warning'); return; }
  if (h.owned) { log('Уже взломан.', 'warning'); return; }

  let chance = 30 + state.sw * 8 + state.net * 4 - h.security;
  if (port && port === h.vulnPort) { chance += 25; log(`\uD83C\uDFAF Уязвимый порт ${port}!`, 'info'); }
  else if (port) { chance -= 10; }
  if (!h.scanned) chance -= 15;
  chance = Math.max(5, Math.min(95, chance));

  const code = generateHackCode(h.name);
  state.hackTask = {
    hostId: h.id, hostName: h.name,
    code, progress: 0, chance,
    targetPort: port,
    minigameType: port ? String(port) : null,
  };

  log(`\u26A1 Взлом ${h.name} (${h.ip})... Шанс: ${Math.floor(chance)}%`);
  log(`\u2328\uFE0F Введите код (${code.length} симв):`);
  // Update prompt
  const prompt = document.getElementById('term-prompt');
  if (prompt) prompt.textContent = `exploit@${h.name}:~#`;
}

function generateHackCode(hostName: string): string {
  const base = hostName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  let code = `exploit_${base}_inject_payload`;
  const mult = DIFFICULTY[state.diff].codeMult;
  const targetLen = Math.max(20, Math.floor(code.length * mult * 0.8));
  while (code.length < targetLen) {
    code += '_' + Math.random().toString(36).substring(2, 5);
  }
  return code.substring(0, targetLen);
}

function cmdLoot(ip: string): void {
  if (!ip) { log('Использование: loot <ip>', 'warning'); return; }
  const h = state.hosts.find(x => x.ip === ip);
  if (!h) { log('Хост не найден.', 'warning'); return; }
  if (!h.owned) { log('Сначала взломайте.', 'warning'); return; }
  if (h.looted) { log('Уже забрано.', 'warning'); return; }
  h.looted = true;
  const reward = h.data * 60;
  state.money += reward;
  state.reputation = Math.min(100, state.reputation + 2);
  log(`\uD83D\uDCC1 Данные с ${h.name} проданы за $${reward}`, 'success');
}

function cmdConnect(ip: string): void {
  const h = state.hosts.find(x => x.ip === ip);
  if (!h) { log('Хост не найден.', 'warning'); return; }
  if (!h.owned) { log('Сначала взломайте.', 'warning'); return; }
  log(`Подключён к ${h.name} как root.`, 'success');
}

function cmdScan(): void {
  if (isFBILocked()) return;
  log('\uD83D\uDC80 DarkNet хосты:', 'info');
  state.hosts.forEach(h => {
    const status = h.owned ? '\u2705 ROOT' : h.scanned ? '\uD83D\uDD0D Сканирован' : '\uD83D\uDD12 Неизвестен';
    log(`  ${status} ${h.ip} \u2014 ${h.name} (защита ${h.security}%)`);
  });
  openWindow('darknet');
}

function cmdBuy(item: string): void {
  const prices: Record<string, number> = { hw: 200, sw: 300, net: 250, def: 150, proxy: 500 };
  const names: Record<string, string> = { hw: 'железо', sw: 'софт', net: 'сеть', def: 'защиту', proxy: 'прокси-цепь' };
  if (!prices[item]) { log('Товары: hw, sw, net, def, proxy', 'info'); return; }
  if (state.money < prices[item]) { log('Недостаточно средств.', 'warning'); return; }
  state.money -= prices[item];
  switch (item) {
    case 'hw': state.hw++; break;
    case 'sw': state.sw++; break;
    case 'net': state.net++; break;
    case 'def': state.reputation = Math.min(100, state.reputation + 5); state.fbi = Math.max(0, state.fbi - 5); break;
    case 'proxy': state.proxyChain.level++; state.proxyChain.active = true; state.proxyChain.fbiReduction = state.proxyChain.level * 10; break;
  }
  log(`\u2B06\uFE0F Куплено ${names[item]}!`, 'success');
}

function cmdSell(amount: string): void {
  const n = parseInt(amount) || 1;
  if (n <= 0) return;
  if (state.antivirusStock < n) { log('Недостаточно антивирусов!', 'warning'); return; }
  const price = n >= 5 ? 70 : 80;
  const total = n * price;
  state.antivirusStock -= n;
  state.antivirusSold += n;
  state.money += total;
  state.reputation = Math.min(100, state.reputation + n);
  log(`\uD83D\uDCB0 Продано ${n} антивирусов за $${total}`, 'success');
  renderAntivirus();
}

function cmdInvest(name: string, amount: string): void {
  if (!name || !amount) { log('Использование: invest <название> <сумма>', 'warning'); return; }
  const sum = parseInt(amount);
  if (!sum || sum <= 0) return;
  if (state.money < sum) { log('Недостаточно средств.', 'warning'); return; }
  state.money -= sum;
  log(`\uD83D\uDCC8 Вложено $${sum} в ${name}.`, 'success');
}

function cmdTechTree(): void {
  const available = getAvailableTechs();
  const unlocked = Object.values(state.techs).filter(t => t.unlocked);

  log('\uD83C\uDF33 Дерево технологий:', 'system');
  log(`  Изучено: ${unlocked.length} / ${Object.keys(state.techs).length}`);

  if (unlocked.length > 0) {
    log('\n  \u2705 Изученные:', 'success');
    unlocked.forEach(t => log(`     ${t.name}: ${t.desc}`));
  }

  if (available.length > 0) {
    log('\n  \uD83D\uDD32 Доступные:', 'info');
    available.forEach(t => log(`     ${t.name} [${t.branch}] \u2014 $${t.cost}: ${t.desc}`));
    log('\n  Купить: buy-tech <id>', 'system');
  }
}

function cmdMarket(): void {
  log('\uD83D\uDCB9 Рынок:', 'system');
  Object.entries(state.marketPrices).forEach(([k, v]) => {
    log(`  ${k}: $${v}`);
  });
  log(`  Тренд: ${getMarketTrend()}`);
  log(`  Время: ${state.timeOfDay === 'night' ? '\uD83C\uDF19 Ночь' : '\u2600\uFE0F День'}`);
}

function cmdDeploy(rest: string): void {
  const id = parseInt(rest);
  if (isNaN(id)) { log('Использование: deploy <virus_id>', 'warning'); return; }
  const v = state.virusWeapons.find(x => x.id === id && !x.deployed);
  if (!v) { log('Вирус не найден.', 'warning'); return; }
  v.deployed = true;
  log(`\uD83E\uDDA0 Вирус "${v.name}" развёрнут! +$${v.income}/тик`, 'success');
}

function toggleProxy(): void {
  state.proxyChain.active = !state.proxyChain.active;
  log(state.proxyChain.active ? `\uD83D\uDD17 Прокси активирован! -${state.proxyChain.fbiReduction}% FBI` : '\uD83D\uDD17 Прокси деактивирован.', 'info');
}

function cmdVirus(rest: string): void {
  const parts = rest.split(' ');
  if (parts[0] === 'create' && parts.length >= 3) {
    const type = parts[1] as 'botnet' | 'miner' | 'stealer';
    const name = parts.slice(2).join(' ');
    const v = createVirus(name, type);
    if (v) log(`\uD83E\uDDA0 Вирус "${name}" создан! ID: ${v.id}`, 'success');
  } else {
    log('Использование: virus create <botnet|miner|stealer> <имя>', 'info');
    state.virusWeapons.forEach(v => {
      log(`  [${v.id}] ${v.name} (${v.type}) ${v.deployed ? '\u2705' : '\u2B1C'} \u2014 доход: $${v.income}`, v.deployed ? 'success' : 'info');
    });
  }
}

function cmdSudo(rest: string): void {
  if (rest === 'rm -rf /') {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:#f00;z-index:999999;display:flex;align-items:center;justify-content:center;color:white;font-size:48px;font-weight:bold;';
    overlay.textContent = 'KERNEL PANIC';
    document.body.appendChild(overlay);
    setTimeout(() => { overlay.remove(); log('\uD83D\uDEA8 Система защитилась от rm -rf /', 'danger'); }, 2000);
  } else {
    log('Permission denied. Нужны root-права.', 'danger');
  }
}

// Fun commands
function cmdMatrix(): void {
  const chars = '0123456789ABCDEF@#$%&*\u30A2\u30A4\u30A6\u30A8\u30AA';
  for (let i = 0; i < 20; i++) {
    let line = '';
    for (let j = 0; j < 50; j++) line += chars[Math.floor(Math.random() * chars.length)];
    log(line, 'success');
  }
  log('Wake up, Neo...', 'info');
}

function cmdCowsay(text: string): void {
  const msg = text || 'Му!';
  const cow = `
    ${'\u2500'.repeat(msg.length + 2)}
   < ${msg} >
    ${'\u2500'.repeat(msg.length + 2)}
         \\\   ^__^
          \\\  (oo)\\_______
             (__)\\       )\\/\\
                 ||----w |
                 ||     ||`;
  log(cow, 'info');
}

function cmdFortune(): void {
  const f = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  log('\uD83E\uDD60 ' + f, 'success');
}

function cmdWhoami(): void {
  log('neo (developer, hacker, coffee addict)', 'info');
  log(`  Денег: $${state.money} | Репутация: ${state.reputation} | FBI: ${Math.floor(state.fbi)}%`, 'info');
}

function cmdNeofetch(): void {
  log('\uD83D\uDC0D OS: Linux Dev OS 3.0', 'info');
  log('\uD83D\uDCBB Host: Quantum Workstation', 'info');
  log('\uD83E\uDDE0 Kernel: 5.15.0-dev-os', 'info');
  log('\uD83C\uDFAE DE: Custom Wayland', 'info');
  log(`\uD83D\uDCB0 Money: $${state.money}`, 'info');
  log(`\u2B50 Reputation: ${state.reputation}`, 'info');
  log(`\uD83D\uDE94 FBI Risk: ${Math.floor(state.fbi)}%`, 'info');
}
