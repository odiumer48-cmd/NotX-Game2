import { useEffect } from 'react';
import { initApp } from './App';

function App() {
  useEffect(() => {
    initApp();
  }, []);

  return (
    <div>
      {/* Title Screen */}
      <div id="title-screen" style={{ display: 'none' }}>
        <div className="title-logo">🐧 LINUX DEV OS</div>
        <div className="title-sub">Хакерский симулятор разработчика v3.0</div>
        <div style={{ marginBottom: '12px', color: 'var(--text-dim)', fontSize: '13px' }}>Выберите сложность:</div>
        <div className="difficulty-select">
          <div className="diff-btn" data-diff="easy" onClick={() => selectDiff('easy')}>
            <span className="diff-label">🟢 Легкий</span>
            <span className="diff-desc">Подсказки ×3<br/>Автосейв каждую мин<br/>FBI ×0.5</span>
          </div>
          <div className="diff-btn selected" data-diff="normal" onClick={() => selectDiff('normal')}>
            <span className="diff-label">🟡 Средний</span>
            <span className="diff-desc">Стандартный код<br/>Автосейв 30с<br/>Баланс</span>
          </div>
          <div className="diff-btn" data-diff="hard" onClick={() => selectDiff('hard')}>
            <span className="diff-label">🔴 Сложный</span>
            <span className="diff-desc">Код с ошибками<br/>Перманентная смерть<br/>Хосты регенерируются</span>
          </div>
        </div>
        <div className="title-actions">
          <button className="title-btn" onClick={startGame}>▶ Новая игра</button>
          <button className="title-btn secondary" onClick={loadGameFromTitle}>📂 Загрузить</button>
        </div>
      </div>

      {/* Desktop Layer */}
      <div id="desktop-layer">
        <div id="top-bar">
          <div className="left">
            <span style={{ fontWeight: 'bold' }}>🐧 Linux Dev OS</span>
            <span id="top-stats">💰 $300 | ⭐ 50</span>
          </div>
          <div className="right">
            <span id="top-diff">🟡 Средний</span>
            <span id="top-fbi">🚔 FBI: 0%</span>
            <span id="wifi-status" style={{ color: '#66ffcc', fontSize: '12px' }}>📶 Online</span>
            <span id="top-time" style={{ fontWeight: 'bold' }}>09:00</span>
          </div>
        </div>

        <div id="desktop">
          {/* Icons rendered by Desktop.ts */}
        </div>

        <div id="taskbar">
          <button id="start-btn" className="taskbar-btn" style={{ background: 'var(--accent)', fontWeight: 'bold' }}>🐧</button>
          <div id="taskbar-apps" style={{ display: 'flex', gap: '4px' }}></div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: 'var(--text-dim)' }}>
            <span id="tb-hint" style={{ color: 'var(--warning)' }}></span>
          </div>
        </div>

        <div id="start-menu" aria-hidden="true">
          <div className="start-menu-title"><span>🐧 Linux Dev OS</span><span className="start-menu-sub">Меню</span></div>
          <button className="start-menu-item" onClick={() => menuOpen('terminal')}>🖥️ Терминал</button>
          <button className="start-menu-item" onClick={() => menuOpen('browser')}>🌐 Googie</button>
          <button className="start-menu-item" onClick={() => menuOpen('mail')}>📧 Почта</button>
          <button className="start-menu-item" onClick={() => menuOpen('projects')}>📁 Проекты</button>
          <button className="start-menu-item" onClick={() => menuOpen('store')}>🛒 Магазин</button>
          <button className="start-menu-item" onClick={() => menuOpen('darknet')}>💀 DarkNet</button>
          <button className="start-menu-item" onClick={() => menuOpen('antivirus')}>🛡️ Антивирус</button>
          <button className="start-menu-item" onClick={() => menuOpen('files')}>📂 Файлы</button>
          <button className="start-menu-item" onClick={() => menuOpen('achievements')}>🏆 Достижения</button>
          <button className="start-menu-item" onClick={() => menuOpen('settings')}>⚙️ Настройки</button>
          <div className="start-menu-section">
            <div className="start-menu-mini">
              <button className="btn btn-secondary" onClick={() => { import('./game/SaveManager').then(m => m.saveGame()); hideMenu(); }}>💾 Сохранить</button>
              <button className="btn btn-secondary" onClick={() => { import('./game/SaveManager').then(m => m.loadGame()); hideMenu(); }}>📂 Загрузить</button>
              <button className="btn btn-red" onClick={() => { if (confirm('Перезапустить?')) location.reload(); }}>🔄 Рестарт</button>
            </div>
          </div>
        </div>

        {/* Windows */}
        {renderWindows()}
      </div>

      {/* Overlay */}
      <div id="overlay">
        <div className="dialog" id="dialog-box">
          <h3 id="dialog-title"></h3>
          <p id="dialog-text"></p>
          <div className="dialog-buttons" id="dialog-buttons"></div>
        </div>
      </div>

      {/* Notifications */}
      <div id="notifications"></div>
    </div>
  );
}

function renderWindows() {
  const windows = [
    { id: 'terminal', title: '🖥️ Терминал', icon: '🖥️', content: terminalContent },
    { id: 'browser', title: '🌐 Googie Browser', content: browserContent },
    { id: 'mail', title: '📧 Почта', contentId: 'mail-content' },
    { id: 'projects', title: '📁 Проекты', contentId: 'projects-content' },
    { id: 'store', title: '🛒 Магазин', contentId: 'store-content' },
    { id: 'darknet', title: '💀 DarkNet Scanner', contentId: 'darknet-content' },
    { id: 'antivirus', title: '🛡️ Antivirus Lab', contentId: 'antivirus-content' },
    { id: 'settings', title: '⚙️ Параметры системы', content: settingsContent },
    { id: 'files', title: '📂 Файловый менеджер', content: filesContent },
    { id: 'editor', title: '📝 Текстовый редактор', content: editorContent },
    { id: 'achievements', title: '🏆 Достижения', contentId: 'achievements-content' },
  ];

  return windows.map(w => (
    <div key={w.id} className="window" id={`win-${w.id}`} style={{ width: '600px', height: '420px', top: '60px', left: '40px' }}>
      <div className="window-titlebar" onMouseDown={(e) => startDrag(e, `win-${w.id}`)}>
        <span className="window-title">{w.title}</span>
        <button className="window-btn btn-min" onClick={() => minWindow(w.id)}>−</button>
        <button className="window-btn btn-close" onClick={() => closeWindow(w.id)}>×</button>
      </div>
      <div className="window-content" id={w.contentId} dangerouslySetInnerHTML={{ __html: w.content || '' }} />
    </div>
  ));
}

// Window control functions (re-exported)
function closeWindow(name: string) {
  import('./ui/Window').then(m => m.closeWindow(name));
}
function minWindow(name: string) {
  import('./ui/Window').then(m => m.minWindow(name));
}
function startDrag(e: React.MouseEvent, id: string) {
  import('./ui/Window').then(m => m.startDrag(e.nativeEvent, id));
}
function menuOpen(name: string) {
  import('./ui/Taskbar').then(m => m.menuOpen(name));
}
function hideMenu() {
  import('./ui/Taskbar').then(m => {
    const menu = document.getElementById('start-menu');
    const btn = document.getElementById('start-btn');
    menu?.classList.remove('active');
    menu?.setAttribute('aria-hidden', 'true');
    btn?.classList.remove('open');
  });
}

// Title screen functions
function selectDiff(d: string) {
  document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`.diff-btn[data-diff="${d}"]`)?.classList.add('selected');
  import('./ui/TitleScreen').then(m => m.selectDiff(d));
}
function startGame() {
  import('./ui/TitleScreen').then(m => m.startGame());
}
function loadGameFromTitle() {
  import('./ui/TitleScreen').then(m => m.loadGameFromTitle());
}

// Window contents
const terminalContent = `
  <div class="term-output" id="term-out">Добро пожаловать в Linux Dev OS v3.0
Введите help для справки.
Совет: откройте Googie или Почту для заказов.</div>
  <div class="hint-box" id="term-hint"></div>
  <div class="term-input-line">
    <span class="term-prompt" id="term-prompt">neo@dev:~$</span>
    <input type="text" class="term-input" id="term-in" autocomplete="off" spellcheck="false">
  </div>
`;

const browserContent = `
  <div class="browser-toolbar">
    <span>🔒</span>
    <input type="text" value="googie.com/freelance" readonly>
    <button class="btn btn-small" onclick="import('./ui/BrowserUI').then(m => m.renderBrowser())">🔄</button>
  </div>
  <div class="browser-page" id="browser-content"></div>
`;

const filesContent = `
  <div class="fm-toolbar">
    <button class="btn btn-small fm-up">⬆️</button>
    <button class="btn btn-small fm-new-folder">📁</button>
    <button class="btn btn-small fm-new-file">📄</button>
    <button class="btn btn-small btn-red fm-delete">🗑️</button>
    <div class="fm-breadcrumb" id="fm-path">/home</div>
  </div>
  <div class="fm-list" id="fm-list"></div>
`;

const editorContent = `
  <div class="editor-toolbar">
    <span class="editor-filename" id="editor-filename">Без названия</span>
    <button class="btn btn-small editor-save">💾 Сохранить</button>
    <button class="btn btn-small btn-secondary editor-close">Закрыть</button>
  </div>
  <textarea class="editor-area" id="editor-area" spellcheck="false"></textarea>
`;

const settingsContent = `
  <div class="settings-tabs">
    <div class="settings-tab active" id="tab-sys">🔧 Система</div>
    <div class="settings-tab" id="tab-personal">🎨 Персонализация</div>
    <div class="settings-tab" id="tab-sound">🔊 Звук</div>
    <div class="settings-tab" id="tab-save">💾 Сохранения</div>
  </div>
  <div class="settings-section active" id="section-sys">
    <h3 style="margin-bottom:12px;color:var(--accent);">Системные настройки</h3>
    <label><input type="checkbox" id="set-hints" checked> Показывать подсказки кода</label>
    <label><input type="checkbox" id="set-sound"> Звуковые уведомления</label>
    <div><button class="btn save-game">💾 Сохранить</button></div>
    <div><button class="btn btn-secondary load-game">📂 Загрузить</button></div>
    <div><button class="btn btn-secondary reset-game">🗑️ Сброс</button></div>
  </div>
  <div class="settings-section" id="section-personal">
    <h3 style="color:var(--accent);">🎨 Фон рабочего стола</h3>
    <div class="wallpaper-grid" id="wallpaper-grid"></div>
    <label><input type="checkbox" id="set-anim-bg"> Анимированный фон</label>
  </div>
  <div class="settings-section" id="section-sound">
    <h3 style="color:var(--accent);">🔊 Настройки звука</h3>
    <div class="volume-row">
      <span>🔇</span>
      <input type="range" class="volume-slider" id="volume-slider" min="0" max="100" value="70">
      <span class="volume-value" id="volume-value">70%</span>
      <span>🔊</span>
    </div>
    <button class="btn btn-small" id="snd-theme-classic">🎹 Классика</button>
    <button class="btn btn-small" id="snd-theme-retro">📟 Ретро</button>
    <button class="btn btn-small" id="snd-theme-cyber">🤖 Киберпанк</button>
    <button class="sound-test-btn">▶ Тестовый звук</button>
  </div>
  <div class="settings-section" id="section-save">
    <h3 style="color:var(--accent);">💾 Сохранения</h3>
    <button class="btn export-save">📥 Экспорт JSON</button>
    <button class="btn btn-secondary import-save">📤 Импорт JSON</button>
    <button class="btn btn-secondary share-save">🔗 Поделиться (URL)</button>
    <p style="font-size:11px;color:var(--text-dim);margin-top:8px;">
      Версия сохранения: 3<br>
      Автосейв: каждые 30 сек (Normal)<br>
      Перед закрытием вкладки
    </p>
  </div>
`;

export default App;
