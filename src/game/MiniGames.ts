export interface MiniGameResult {
  success: boolean;
  score: number;
  message: string;
}

// SSH Brute Force - guess 4-digit PIN
export class BruteForceGame {
  private target: number;
  private attempts: number;
  private maxAttempts: number;

  constructor() {
    this.target = Math.floor(Math.random() * 9999);
    this.attempts = 0;
    this.maxAttempts = 10;
  }

  guess(n: number): MiniGameResult {
    this.attempts++;
    if (n === this.target) {
      return { success: true, score: Math.max(10, 100 - this.attempts * 8), message: `PIN взломан за ${this.attempts} попыток!` };
    }
    if (this.attempts >= this.maxAttempts) {
      return { success: false, score: 0, message: `Попытки исчерпаны. PIN был: ${String(this.target).padStart(4, '0')}` };
    }
    const hint = n < this.target ? 'больше' : 'меньше';
    return { success: false, score: 0, message: `PIN ${String(n).padStart(4, '0')} — нужно ${hint} (${this.attempts}/${this.maxAttempts})` };
  }

  getState(): string {
    return `Попытка ${this.attempts}/${this.maxAttempts}`;
  }
}

// HTTP SQL Injection - build correct payload
export class SQLInjectionGame {
  private stage: number;
  private readonly stages = [
    { parts: ["' UNION", ' SELECT ', 'password ', ' FROM users--'], correct: [0, 1, 2, 3] },
    { parts: ['1 OR 1=1', ' UNION ALL ', "SELECT * FROM 'admin'--"], correct: [0, 1, 2] },
    { parts: ["admin'--", "' OR '1'='1"], correct: [1] }
  ];

  constructor() {
    this.stage = 0;
  }

  getCurrentStage(): { parts: string[]; correct: number[] } {
    return this.stages[this.stage];
  }

  selectPart(indices: number[]): MiniGameResult {
    const stage = this.stages[this.stage];
    const correct = JSON.stringify(indices) === JSON.stringify(stage.correct);
    if (correct) {
      this.stage++;
      if (this.stage >= this.stages.length) {
        return { success: true, score: 80 + Math.floor(Math.random() * 20), message: 'SQL Injection успешна! База данных взломана.' };
      }
      return { success: false, score: 0, message: `Стадия ${this.stage + 1}/${this.stages.length}...` };
    }
    return { success: false, score: 0, message: 'Неверный payload! Попробуйте другую комбинацию.' };
  }
}

// SMB EternalBlue - timing game
export class EternalBlueGame {
  private position: number;
  private direction: number;
  private running: boolean;

  constructor() {
    this.position = 0;
    this.direction = 1;
    this.running = true;
  }

  tick(): void {
    if (!this.running) return;
    this.position += this.direction * 3;
    if (this.position >= 100 || this.position <= 0) this.direction *= -1;
  }

  getPosition(): { pos: number; inZone: boolean } {
    const inZone = this.position >= 40 && this.position <= 60;
    return { pos: this.position, inZone };
  }

  hit(): MiniGameResult {
    this.running = false;
    const { inZone } = this.getPosition();
    if (inZone) {
      return { success: true, score: 70 + Math.floor(Math.random() * 30), message: 'EternalBlue: точное попадание в зелёную зону!' };
    }
    return { success: false, score: 0, message: `EternalBlue: промах (${this.position}%). Нужно было 40-60%.` };
  }
}

// MySQL Password - dictionary attack
export class DictionaryAttackGame {
  private words: string[];
  private target: string;
  private attempts: number;

  constructor() {
    const dict = ['password123', 'admin2024', 'qwerty', 'letmein', 'rootpass'];
    this.words = [...dict].sort(() => Math.random() - 0.5);
    this.target = dict[Math.floor(Math.random() * dict.length)];
    this.attempts = 0;
  }

  getWords(): string[] {
    return this.words;
  }

  guess(word: string): MiniGameResult {
    this.attempts++;
    if (word === this.target) {
      return { success: true, score: Math.max(20, 100 - this.attempts * 30), message: `Пароль найден: "${word}" за ${this.attempts} попытки!` };
    }
    if (this.attempts >= 2) {
      return { success: false, score: 0, message: `Попытки исчерпаны. Пароль был: "${this.target}"` };
    }
    return { success: false, score: 0, message: `Неверно. Осталось ${2 - this.attempts} попытка.` };
  }
}

export const MINIGAMES = {
  ssh: BruteForceGame,
  http: SQLInjectionGame,
  smb: EternalBlueGame,
  mysql: DictionaryAttackGame,
};

export function getMinigameForPort(port: number): string | null {
  const map: Record<number, string> = {
    22: 'ssh', 80: 'http', 445: 'smb', 3306: 'mysql'
  };
  return map[port] || null;
}

export function getServiceName(port: number): string {
  const services: Record<number, string> = {
    21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS',
    80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS', 445: 'SMB',
    3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL', 5900: 'VNC',
    8080: 'HTTP-Proxy', 9200: 'Elastic'
  };
  return services[port] || 'Unknown';
}
