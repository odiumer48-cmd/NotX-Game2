import { state } from '../core/State';
import { ansiToHtml } from '../utils/ansi';

let termOut: HTMLElement | null = null;
let termIn: HTMLInputElement | null = null;
let termHint: HTMLElement | null = null;
let termPrompt: HTMLElement | null = null;

export type LogType = 'info' | 'success' | 'warning' | 'danger' | 'system';
const LOG_COLORS: Record<LogType, string> = {
  info: '#d4d4d4', success: '#38b44a', warning: '#efb73e', danger: '#df382c', system: '#19b6ee'
};

// Terminal history
const history: string[] = [];
let historyIndex = -1;

// Autocomplete
let autocompleteIndex = 0;
let autocompleteMatches: string[] = [];

const COMMANDS = [
  'help', 'status', 'clear', 'exit', 'poweroff', 'reboot',
  'develop', 'upload', 'cancel', 'cancelhack', 'nmap', 'exploit',
  'loot', 'connect', 'scan', 'buy', 'invest', 'store', 'mail',
  'projects', 'darknet', 'antivirus', 'browser', 'save', 'load',
  'sell', 'matrix', 'cowsay', 'fortune', 'date', 'whoami',
  'uptime', 'neofetch', 'techtree', 'market', 'deploy', 'proxy',
  'virus', 'rm'
];

export function initTerminalUI(): void {
  termOut = document.getElementById('term-out');
  termIn = document.getElementById('term-in') as HTMLInputElement;
  termHint = document.getElementById('term-hint');
  termPrompt = document.getElementById('term-prompt');

  if (termIn) {
    termIn.addEventListener('keydown', handleKeydown);
    termIn.addEventListener('input', handleInput);
  }
}

function handleKeydown(e: KeyboardEvent): void {
  if (state.gameOver) return;

  // History navigation
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex < history.length - 1) {
      historyIndex++;
      if (termIn) termIn.value = history[history.length - 1 - historyIndex];
    }
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      if (termIn) termIn.value = history[history.length - 1 - historyIndex];
    } else if (historyIndex === 0) {
      historyIndex = -1;
      if (termIn) termIn.value = '';
    }
    return;
  }

  // Autocomplete
  if (e.key === 'Tab') {
    e.preventDefault();
    handleAutocomplete();
    return;
  }

  // Enter
  if (e.key === 'Enter') {
    historyIndex = -1;
    autocompleteMatches = [];

    if (state.hackTask) {
      if (state.hackTask.progress >= state.hackTask.code.length) {
        // Enter to confirm hack
        const h = state.hosts.find(x => x.id === state.hackTask!.hostId);
        const chance = state.hackTask.chance;
        const roll = Math.random() * 100;
        log(`\u26A1 Запуск эксплойта... Ролл: ${Math.floor(roll)} vs ${Math.floor(chance)}%`, 'system');
        finishHack(roll < chance);
        return;
      }
      e.preventDefault();
      return;
    }

    const val = termIn?.value.trim() || '';
    if (termIn) termIn.value = '';
    if (val) {
      history.push(val);
      if (history.length > 50) history.shift();
      log(`neo@dev:~$ ${val}`, 'system');
      import('../commands').then(m => m.execCmd(val));
    }
    return;
  }

  // Handle hack task typing
  if (state.hackTask) {
    if (e.key === 'Backspace') {
      if (state.hackTask.progress > 0) state.hackTask.progress--;
      updateHint();
      e.preventDefault();
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const task = state.hackTask;
      if (task.progress < task.code.length) {
        const expected = task.code[task.progress];
        if (e.key === expected) {
          task.progress++;
          updateHint();
          if (task.progress === task.code.length) {
            log('\u26A1 Эксплойт завершён! Нажмите Enter для запуска.', 'success');
          }
        } else {
          log(`\u274C Ошибка: ожидался '${expected}', введён '${e.key}'`, 'warning');
        }
        e.preventDefault();
      }
    }
    return;
  }

  // Active project typing
  if (state.activeTask) {
    if (e.key === 'Backspace') {
      if (state.activeTask.progress > 0) state.activeTask.progress--;
      updateHint();
      e.preventDefault();
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const task = state.activeTask;
      if (task.progress < task.code.length) {
        const expected = task.code[task.progress];
        if (e.key === expected) {
          task.progress++;
          updateHint();
          if (task.progress === task.code.length) {
            log('\u2705 Код завершён! Нажмите Enter для сдачи проекта.', 'success');
          }
        } else {
          log(`\u274C Ошибка: ожидался '${expected}', введён '${e.key}'`, 'warning');
        }
        e.preventDefault();
      }
    }
  }
}

function handleInput(): void {
  autocompleteMatches = [];
  autocompleteIndex = 0;
}

function handleAutocomplete(): void {
  if (!termIn) return;
  const val = termIn.value;
  const args = val.split(/\s+/);
  const prefix = args[args.length - 1] || '';

  if (autocompleteMatches.length === 0) {
    // Build matches
    const matches: string[] = [];

    if (args.length <= 1) {
      // Command completion
      COMMANDS.forEach(c => { if (c.startsWith(prefix)) matches.push(c); });
    }

    // IP completion from hosts
    state.hosts.forEach(h => {
      if (h.ip.startsWith(prefix)) matches.push(h.ip);
      if (h.name.toLowerCase().startsWith(prefix.toLowerCase())) matches.push(h.name);
    });

    // Tech tree
    Object.values(state.techs).forEach(t => {
      if (t.id.startsWith(prefix)) matches.push(t.id);
    });

    autocompleteMatches = [...new Set(matches)];
    autocompleteIndex = 0;
  }

  if (autocompleteMatches.length === 0) return;

  const match = autocompleteMatches[autocompleteIndex % autocompleteMatches.length];
  autocompleteIndex++;

  args[args.length - 1] = match;
  termIn.value = args.join(' ');
  // Keep cursor at end
  setTimeout(() => {
    if (termIn) termIn.selectionStart = termIn.selectionEnd = termIn.value.length;
  }, 0);
}

function finishHack(success: boolean): void {
  if (!state.hackTask) return;
  const task = state.hackTask;
  const h = state.hosts.find(x => x.id === task.hostId);

  if (success) {
    h && (h.owned = true);
    const loot = h?.money || 0;
    state.money += loot;
    state.reputation = Math.min(100, state.reputation + 4);
    log(`\uD83C\uDF89 Взлом успешен! ${h?.name} под контролем.`, 'success');
    log(`   \uD83D\uDCB0 Добыча: $${loot}`, 'success');
    state.exploitLogs = [{ date: new Date(state.gameTime), host: h?.name || '', ip: h?.ip || '', success: true, loot }, ...state.exploitLogs].slice(0, 20);
  } else {
    log('\u274C Взлом провален. Система защиты сработала.', 'danger');
    if (h) {
      h.traceLevel += Math.floor(Math.random() * 15) + 5;
      state.fbi = Math.min(100, state.fbi + 3 + (h.traceLevel > 50 ? 5 : 0));
    }
    state.exploitLogs = [{ date: new Date(state.gameTime), host: h?.name || '', ip: h?.ip || '', success: false, traceLevel: h?.traceLevel }, ...state.exploitLogs].slice(0, 20);
  }

  state.hackTask = null;
  if (termPrompt) termPrompt.textContent = 'neo@dev:~$';
  updateHint();
  state.dispatchEvent(new CustomEvent('hack-complete', { detail: { success } }));
}

export function log(text: string, type: LogType = 'info'): void {
  if (!termOut) return;
  const div = document.createElement('div');
  // Parse ANSI codes
  if (text.includes('\x1b[')) {
    div.innerHTML = ansiToHtml(text);
  } else {
    div.textContent = text;
  }
  div.style.color = LOG_COLORS[type] || LOG_COLORS.info;
  termOut.appendChild(div);
  termOut.scrollTop = termOut.scrollHeight;
}

export function setPrompt(text: string): void {
  if (termPrompt) termPrompt.textContent = text;
}

export function updateHint(): void {
  if (!termHint) return;
  const task = state.hackTask || state.activeTask;
  if (!state.showHints || !task) {
    termHint.classList.remove('show');
    return;
  }
  if (task.progress >= task.code.length) {
    termHint.classList.remove('show');
    return;
  }
  const before = task.code.substring(0, task.progress);
  const ch = task.code[task.progress];
  const after = task.code.substring(task.progress + 1);
  const label = state.hackTask ? 'Эксплойт' : 'Подсказка';
  termHint.innerHTML = `${label}: <code style="background:rgba(0,0,0,0.5);padding:2px 6px;border-radius:4px;">${before}<span style="background:var(--warning);color:#000;padding:0 3px;border-radius:2px;">${ch}</span>${after}</code>`;
  termHint.classList.add('show');
}

export function clearTerminal(): void {
  if (termOut) termOut.innerHTML = '';
}

export function focusTerminal(): void {
  setTimeout(() => termIn?.focus(), 50);
}
