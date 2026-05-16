/**
 * Smart list updater - only adds/removes/patches changed items
 */
export function updateList<T>(
  container: HTMLElement,
  items: T[],
  renderFn: (item: T, index: number) => HTMLElement,
  keyFn: (item: T, index: number) => string = (_, i) => String(i)
): void {
  const existing = Array.from(container.children) as HTMLElement[];
  const map = new Map(existing.map(el => [el.dataset.key || '', el]));

  items.forEach((item, i) => {
    const key = keyFn(item, i);
    let el = map.get(key);
    if (!el) {
      el = renderFn(item, i);
      el.dataset.key = key;
      container.appendChild(el);
    } else {
      map.delete(key);
    }
  });

  map.forEach(el => el.remove());
}

/**
 * Sanitize HTML - prevent XSS
 */
export function sanitize(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * HTML template literal with auto-escaping
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((acc, str, i) =>
    acc + str + (values[i] ? String(values[i]).replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''), '');
}

/**
 * Patch element text content without destroying innerHTML
 */
export function patchText(el: HTMLElement | null, selector: string, text: string): void {
  if (!el) return;
  const target = selector ? el.querySelector(selector) : el;
  if (target) target.textContent = text;
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * Format time HH:MM
 */
export function fmtTime(d: Date): string {
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

/**
 * Generate random IP
 */
export function randomIP(): string {
  return `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}
