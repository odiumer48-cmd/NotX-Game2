export function showDialog(title: string, html: string, buttons: { text: string; action: () => void; primary?: boolean }[]): void {
  const overlay = document.getElementById('overlay');
  const titleEl = document.getElementById('dialog-title');
  const textEl = document.getElementById('dialog-text');
  const buttonsEl = document.getElementById('dialog-buttons');
  if (!overlay || !titleEl || !textEl || !buttonsEl) return;

  titleEl.textContent = title;
  textEl.innerHTML = html;
  buttonsEl.innerHTML = '';

  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'btn' + (!b.primary ? ' btn-secondary' : '');
    btn.textContent = b.text;
    btn.onclick = b.action;
    buttonsEl.appendChild(btn);
  });

  overlay.classList.add('active');
}

export function closeDialog(): void {
  document.getElementById('overlay')?.classList.remove('active');
}

export function showConfirm(title: string, text: string, onYes: () => void): void {
  showDialog(title, text, [
    { text: 'Да', action: () => { onYes(); closeDialog(); }, primary: true },
    { text: 'Нет', action: closeDialog }
  ]);
}
