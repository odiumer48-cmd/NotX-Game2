import { state } from '../core/State';
import { FileNode } from '../core/Types';
import { log } from './TerminalUI';
import { openWindow, focusWindow } from './Window';

let fmPath: string[] = ['home'];
let fmSelected: string | null = null;
let editorTarget: { path: string[]; name: string } | null = null;

export function renderFiles(): void {
  const el = document.getElementById('fm-list');
  const pathEl = document.getElementById('fm-path');
  if (!el) return;

  if (pathEl) pathEl.textContent = '/' + fmPath.join('/');
  el.innerHTML = '';

  const node = fsGetNode(fmPath);
  if (!node || node.type !== 'dir') return;

  Object.entries(node.children || {}).forEach(([name, item]) => {
    const div = document.createElement('div');
    div.className = 'fm-item' + (fmSelected === name ? ' selected' : '');
    div.innerHTML = `<div class="fm-icon">${item.type === 'dir' ? '\uD83D\uDCC1' : '\uD83D\uDCC4'}</div><div class="fm-name">${name}</div>`;
    div.addEventListener('click', e => { e.stopPropagation(); fmSelect(name); });
    div.addEventListener('dblclick', e => { e.stopPropagation(); fmOpen(name); });
    el.appendChild(div);
  });

  if (Object.keys(node.children || {}).length === 0) {
    el.innerHTML = '<div style="color:var(--text-dim);font-size:12px;grid-column:1/-1;text-align:center;padding:20px;">Папка пуста</div>';
  }
}

function fsGetNode(path: string[]): FileNode | null {
  let node = state.fs;
  for (const part of path) {
    if (!node || node.type !== 'dir' || !node.children?.[part]) return null;
    node = node.children[part];
  }
  return node;
}

function fsCreate(path: string[], name: string, type: 'dir' | 'file', content?: string): boolean {
  const node = fsGetNode(path);
  if (!node || node.type !== 'dir' || !node.children) return false;
  if (node.children[name]) return false;
  node.children[name] = type === 'dir' ? { type: 'dir', children: {} } : { type: 'file', content: content || '' };
  return true;
}

function fsDelete(path: string[], name: string): boolean {
  const node = fsGetNode(path);
  if (!node || node.type !== 'dir' || !node.children) return false;
  delete node.children[name];
  return true;
}

export function fmSelect(name: string): void {
  fmSelected = fmSelected === name ? null : name;
  renderFiles();
}

export function fmOpen(name: string): void {
  const item = fsGetNode([...fmPath, name]);
  if (!item) return;
  if (item.type === 'dir') {
    fmPath.push(name);
    fmSelected = null;
    renderFiles();
  } else {
    editorOpen(fmPath, name);
  }
}

export function fmUp(): void {
  if (fmPath.length > 1) {
    fmPath.pop();
    fmSelected = null;
    renderFiles();
  }
}

export function fmNewFolder(): void {
  const name = prompt('Имя папки:');
  if (!name || name.includes('/') || name.includes('\\')) return;
  if (fsCreate(fmPath, name, 'dir')) renderFiles();
  else log('Не удалось создать папку.', 'warning');
}

export function fmNewFile(): void {
  const name = prompt('Имя файла:');
  if (!name || name.includes('/') || name.includes('\\')) return;
  if (fsCreate(fmPath, name, 'file', '')) {
    renderFiles();
    editorOpen(fmPath, name);
  } else log('Не удалось создать файл.', 'warning');
}

export function fmDelete(): void {
  if (!fmSelected) { log('Выберите файл.', 'warning'); return; }
  if (!confirm(`Удалить "${fmSelected}"?`)) return;
  if (fsDelete(fmPath, fmSelected)) {
    fmSelected = null;
    renderFiles();
  }
}

function editorOpen(path: string[], name: string): void {
  const item = fsGetNode([...path, name]);
  if (!item || item.type !== 'file') return;
  editorTarget = { path: [...path], name };
  const fname = document.getElementById('editor-filename');
  const area = document.getElementById('editor-area') as HTMLTextAreaElement;
  if (fname) fname.textContent = '/' + path.join('/') + '/' + name;
  if (area) area.value = item.content || '';
  openWindow('editor');
  focusWindow('editor');
}

export function editorSave(): void {
  if (!editorTarget) return;
  const item = fsGetNode([...editorTarget.path, editorTarget.name]);
  if (item && item.type === 'file') {
    const area = document.getElementById('editor-area') as HTMLTextAreaElement;
    if (area) item.content = area.value;
    log('\uD83D\uDCBE Файл сохранён.', 'success');
  }
}

export function createDefaultFS(): FileNode {
  return {
    type: 'dir',
    children: {
      home: {
        type: 'dir',
        children: {
          documents: { type: 'dir', children: {} },
          projects: { type: 'dir', children: {} },
          notes: {
            type: 'dir',
            children: {
              'readme.txt': { type: 'file', content: 'Добро пожаловать в Linux Dev OS!\n\nСоветы:\n- Используйте терминал для разработки\n- Проверяйте почту для новых заказов\n- Не попадитесь FBI!' }
            }
          },
          '.bash_history': { type: 'file', content: 'sudo apt-get install exploit-tools\nnmap 10.42.1.1\nssh root@darkhost\nrm -rf / --no-preserve-root 2>/dev/null\nfortune | cowsay' },
          '.ssh': {
            type: 'dir',
            children: {
              'known_hosts': { type: 'file', content: '# Known hosts will appear here after nmap' }
            }
          }
        }
      },
      var: {
        type: 'dir',
        children: {
          log: {
            type: 'dir',
            children: {
              'exploits.log': { type: 'file', content: '# Exploit logs will be written here' }
            }
          }
        }
      }
    }
  };
}
