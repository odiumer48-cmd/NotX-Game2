const ANSI_COLORS: Record<number, string> = {
  30: '#000', 31: '#df382c', 32: '#38b44a', 33: '#efb73e',
  34: '#19b6ee', 35: '#e95420', 36: '#0ff', 37: '#eee',
  90: '#666', 91: '#ff4444', 92: '#44ff44', 93: '#ffff44',
  94: '#4444ff', 95: '#ff44ff', 96: '#44ffff', 97: '#fff'
};

export function ansiToHtml(str: string): string {
  let result = str.replace(/\x1b\[(\d+)m/g, (_, code: string) => {
    const c = parseInt(code);
    const color = ANSI_COLORS[c];
    if (!color) return '</span>';
    return `<span style="color:${color}">`;
  });
  // Close any open spans at end
  const openCount = (result.match(/<span/g) || []).length;
  const closeCount = (result.match(/<\/span>/g) || []).length;
  for (let i = 0; i < openCount - closeCount; i++) {
    result += '</span>';
  }
  return result;
}

export function stripAnsi(str: string): string {
  return str.replace(/\x1b\[\d+m/g, '');
}

export function colorText(text: string, color: string): string {
  const codeMap: Record<string, number> = {
    black: 30, red: 31, green: 32, yellow: 33,
    blue: 34, magenta: 35, cyan: 36, white: 37,
    brightRed: 91, brightGreen: 92, brightYellow: 93,
    brightBlue: 94, brightMagenta: 95, brightCyan: 96
  };
  const code = codeMap[color] || 37;
  return `\x1b[${code}m${text}\x1b[0m`;
}
