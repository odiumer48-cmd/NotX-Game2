export function runBootSequence(onComplete: () => void): void {
  const existing = document.getElementById('boot-screen');
  if (existing) existing.remove();

  const boot = document.createElement('div');
  boot.id = 'boot-screen';
  boot.style.cssText = `
    position:fixed;inset:0;background:#000;z-index:999999;
    color:#0f0;font-family:var(--font-mono);font-size:12px;
    padding:40px;overflow:hidden;line-height:1.6;
  `;
  document.body.appendChild(boot);

  const lines = [
    'BIOS POST...',
    '  CPU: Quantum Core i9 @ 5.15GHz',
    '  RAM: 65536 MB OK',
    '  GPU: Neural Engine X1',
    '  Storage: NVMe 4TB... OK',
    '  Network: 10GbE... OK',
    '',
    'Booting Linux Dev OS Kernel 5.15.0-dev-os...',
    '[ OK ] Loading kernel modules',
    '[ OK ] Mounting root filesystem',
    '[ OK ] Starting systemd',
    '[ OK ] NetworkManager started',
    '[ OK ] SSH daemon started',
    '[ OK ] Firewall initialized',
    '[ OK ] Starting X11 display server',
    '[ OK ] Loading desktop environment',
    '',
    'Initializing userspace...',
    '[ OK ] Terminal ready',
    '[ OK ] DarkNet module loaded',
    '[ OK ] Market sync complete',
    '[ OK ] All systems operational',
    '',
    'Welcome to Linux Dev OS v3.0'
  ];

  let i = 0;
  function nextLine() {
    if (i < lines.length) {
      const div = document.createElement('div');
      div.textContent = lines[i];
      div.style.opacity = '0';
      boot.appendChild(div);
      requestAnimationFrame(() => { div.style.opacity = '1'; });
      i++;
      setTimeout(nextLine, 80 + Math.random() * 120);
    } else {
      setTimeout(() => {
        boot.style.transition = 'opacity 0.5s';
        boot.style.opacity = '0';
        setTimeout(() => {
          boot.remove();
          onComplete();
        }, 500);
      }, 400);
    }
  }
  nextLine();
}
