// ===================== CORE TYPES =====================

export type DifficultyKey = 'easy' | 'normal' | 'hard';

export type ProjectType = 'game' | 'virus' | 'antivirus' | 'web';
export type LangKey = 'python' | 'cpp' | 'js' | 'rust' | 'go' | 'java';

export type TerminalMode = 'insert' | 'command' | 'hack';

export type PortService = 'SSH' | 'HTTP' | 'SMB' | 'MySQL' | 'FTP' | 'Telnet' | 'SMTP' | 'DNS' | 'POP3' | 'IMAP' | 'HTTPS' | 'RDP' | 'PostgreSQL' | 'VNC' | 'HTTP-Proxy' | 'Elastic';

export interface LangConfig {
  name: string;
  speed: number;
  reward: number;
}

export interface TechNode {
  id: string;
  name: string;
  requires: string[];
  cost: number;
  unlocked: boolean;
  desc: string;
  effect: string;
  branch: 'systems' | 'web' | 'ml' | 'security';
}

export interface Project {
  id: number;
  type: ProjectType;
  name: string;
  lang: LangKey;
  code: string;
  progress: number;
  completed: boolean;
  failed: boolean;
  uploaded: boolean;
  reward: number;
  deadline: Date | null;
  fbiRisk: number;
  isAV: boolean;
}

export interface Message {
  id: number;
  from: string;
  subject: string;
  body: string;
  type: ProjectType;
  reward: number;
  deadlineHours: number;
  date: Date;
  read: boolean;
  accepted: boolean;
}

export interface Host {
  id: number;
  ip: string;
  name: string;
  security: number;
  ports: number[];
  services: string[];
  owned: boolean;
  looted: boolean;
  scanned: boolean;
  vulnPort: number;
  traceLevel: number;
  money: number;
  data: number;
  reputationImpact: number;
}

export interface ExploitLog {
  date: Date;
  host: string;
  ip: string;
  success: boolean;
  loot?: number;
  data?: number;
  traceLevel?: number;
}

export interface HackTask {
  hostId: number;
  hostName: string;
  code: string;
  progress: number;
  chance: number;
  targetPort: number | null;
  minigameType: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}

export interface Wallpaper {
  name: string;
  bg: string;
}

export interface FileNode {
  type: 'dir' | 'file';
  children?: Record<string, FileNode>;
  content?: string;
}

export interface VirusWeapon {
  id: number;
  name: string;
  type: 'botnet' | 'miner' | 'stealer';
  deployed: boolean;
  income: number;
  fbiRisk: number;
}

export interface ProxyChain {
  level: number;
  active: boolean;
  fbiReduction: number;
}

export interface DifficultyConfig {
  label: string;
  codeMult: number;
  hostSecMult: number;
  deadlineMult: number;
  rewardMult: number;
  fbiMult: number;
  startMoney: number;
  autoProgress: number;
  name: string;
  showNextChars: number;
  autoSaveInterval: number;
  fbiGrowthRate: number;
  hasCodeErrors: boolean;
  hostRegenInterval: number;
  permadeath: boolean;
}

export interface WinState {
  terminal: boolean;
  browser: boolean;
  mail: boolean;
  projects: boolean;
  store: boolean;
  darknet: boolean;
  antivirus: boolean;
  settings: boolean;
  files: boolean;
  achievements: boolean;
  editor: boolean;
}

export interface GameStateData {
  saveVersion: number;
  money: number;
  reputation: number;
  whiteHatRep: number;
  blackHatRep: number;
  fbi: number;
  gameTime: Date;
  hw: number;
  sw: number;
  net: number;
  lang: LangKey;
  techs: Record<string, TechNode>;
  projects: Project[];
  messages: Message[];
  hosts: Host[];
  activeTask: Project | null;
  hackTask: HackTask | null;
  nextMsgId: number;
  nextProjId: number;
  nextHostId: number;
  showHints: boolean;
  sound: boolean;
  soundVolume: number;
  soundTheme: string;
  wallpaper: number;
  gameOver: boolean;
  eventTimer: number;
  wins: WinState;
  diff: DifficultyKey;
  antivirusStock: number;
  antivirusSold: number;
  totalEarned: number;
  fs: FileNode;
  achievements: Record<string, Achievement>;
  exploitLogs: ExploitLog[];
  lockout: { active: boolean; endTime: number; count: number };
  marketPrices: Record<string, number>;
  marketTrend: number;
  timeOfDay: 'day' | 'night';
  companies: Record<string, number>;
  virusWeapons: VirusWeapon[];
  proxyChain: ProxyChain;
  nextVirusId: number;
  // Difficulty-specific
  hasCodeErrors: boolean;
}
