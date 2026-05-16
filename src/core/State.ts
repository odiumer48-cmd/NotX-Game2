import { GameStateData } from './Types';

function createDefaultState(): GameStateData {
  return {
    saveVersion: 3,
    money: 300,
    reputation: 50,
    whiteHatRep: 50,
    blackHatRep: 0,
    fbi: 0,
    gameTime: new Date(2026, 4, 9, 9, 0),
    hw: 1, sw: 1, net: 1,
    lang: 'python',
    techs: {},
    projects: [],
    messages: [],
    hosts: [],
    activeTask: null,
    hackTask: null,
    nextMsgId: 1,
    nextProjId: 1,
    nextHostId: 1,
    nextVirusId: 1,
    showHints: true,
    sound: false,
    soundVolume: 70,
    soundTheme: 'classic',
    wallpaper: 0,
    gameOver: false,
    eventTimer: 0,
    wins: {
      terminal: false, browser: false, mail: false, projects: false,
      store: false, darknet: false, antivirus: false, settings: false,
      files: false, achievements: false, editor: false
    },
    diff: 'normal',
    antivirusStock: 0,
    antivirusSold: 0,
    totalEarned: 0,
    fs: { type: 'dir', children: {} },
    achievements: {},
    exploitLogs: [],
    lockout: { active: false, endTime: 0, count: 0 },
    marketPrices: { hw: 200, sw: 300, net: 250, def: 150, proxy: 500 },
    marketTrend: 1,
    timeOfDay: 'day',
    companies: {},
    virusWeapons: [],
    proxyChain: { level: 0, active: false, fbiReduction: 0 },
    hasCodeErrors: false,
  };
}

class GameState extends EventTarget {
  private _data: GameStateData;

  constructor() {
    super();
    this._data = createDefaultState();
  }

  get<K extends keyof GameStateData>(key: K): GameStateData[K] {
    return this._data[key];
  }

  set<K extends keyof GameStateData>(key: K, val: GameStateData[K]): void {
    const old = this._data[key];
    this._data[key] = val;
    this.dispatchEvent(new CustomEvent('change', { detail: { key: String(key), old, val } }));
  }

  patch(obj: Partial<GameStateData>): void {
    Object.entries(obj).forEach(([k, v]) => this.set(k as keyof GameStateData, v as any));
  }

  getAll(): GameStateData { return this._data; }

  setAll(data: GameStateData): void {
    this._data = data;
    this.dispatchEvent(new CustomEvent('change', { detail: { key: 'all' } }));
  }

  // Direct property access
  get money() { return this._data.money; }
  set money(v) { this._data.money = v; }
  get reputation() { return this._data.reputation; }
  set reputation(v) { this._data.reputation = v; }
  get fbi() { return this._data.fbi; }
  set fbi(v) { this._data.fbi = v; }
  get gameTime() { return this._data.gameTime; }
  set gameTime(v) { this._data.gameTime = v; }
  get hw() { return this._data.hw; }
  set hw(v) { this._data.hw = v; }
  get sw() { return this._data.sw; }
  set sw(v) { this._data.sw = v; }
  get net() { return this._data.net; }
  set net(v) { this._data.net = v; }
  get lang() { return this._data.lang; }
  set lang(v) { this._data.lang = v; }
  get techs() { return this._data.techs; }
  set techs(v) { this._data.techs = v; }
  get projects() { return this._data.projects; }
  set projects(v) { this._data.projects = v; }
  get hosts() { return this._data.hosts; }
  set hosts(v) { this._data.hosts = v; }
  get messages() { return this._data.messages; }
  set messages(v) { this._data.messages = v; }
  get activeTask() { return this._data.activeTask; }
  set activeTask(v) { this._data.activeTask = v; }
  get hackTask() { return this._data.hackTask; }
  set hackTask(v) { this._data.hackTask = v; }
  get gameOver() { return this._data.gameOver; }
  set gameOver(v) { this._data.gameOver = v; }
  get diff() { return this._data.diff; }
  set diff(v) { this._data.diff = v; }
  get wins() { return this._data.wins; }
  set wins(v) { this._data.wins = v; }
  get achievements() { return this._data.achievements; }
  set achievements(v) { this._data.achievements = v; }
  get exploitLogs() { return this._data.exploitLogs; }
  set exploitLogs(v) { this._data.exploitLogs = v; }
  get lockout() { return this._data.lockout; }
  set lockout(v) { this._data.lockout = v; }
  get marketPrices() { return this._data.marketPrices; }
  set marketPrices(v) { this._data.marketPrices = v; }
  get marketTrend() { return this._data.marketTrend; }
  set marketTrend(v) { this._data.marketTrend = v; }
  get timeOfDay() { return this._data.timeOfDay; }
  set timeOfDay(v) { this._data.timeOfDay = v; }
  get companies() { return this._data.companies; }
  set companies(v) { this._data.companies = v; }
  get virusWeapons() { return this._data.virusWeapons; }
  set virusWeapons(v) { this._data.virusWeapons = v; }
  get proxyChain() { return this._data.proxyChain; }
  set proxyChain(v) { this._data.proxyChain = v; }
  get fs() { return this._data.fs; }
  set fs(v) { this._data.fs = v; }
  get whiteHatRep() { return this._data.whiteHatRep; }
  set whiteHatRep(v) { this._data.whiteHatRep = v; }
  get blackHatRep() { return this._data.blackHatRep; }
  set blackHatRep(v) { this._data.blackHatRep = v; }
  get showHints() { return this._data.showHints; }
  set showHints(v) { this._data.showHints = v; }
  get sound() { return this._data.sound; }
  set sound(v) { this._data.sound = v; }
  get soundVolume() { return this._data.soundVolume; }
  set soundVolume(v) { this._data.soundVolume = v; }
  get soundTheme() { return this._data.soundTheme; }
  set soundTheme(v) { this._data.soundTheme = v; }
  get wallpaper() { return this._data.wallpaper; }
  set wallpaper(v) { this._data.wallpaper = v; }
  get antivirusStock() { return this._data.antivirusStock; }
  set antivirusStock(v) { this._data.antivirusStock = v; }
  get antivirusSold() { return this._data.antivirusSold; }
  set antivirusSold(v) { this._data.antivirusSold = v; }
  get totalEarned() { return this._data.totalEarned; }
  set totalEarned(v) { this._data.totalEarned = v; }
  get nextMsgId() { return this._data.nextMsgId; }
  set nextMsgId(v) { this._data.nextMsgId = v; }
  get nextProjId() { return this._data.nextProjId; }
  set nextProjId(v) { this._data.nextProjId = v; }
  get nextHostId() { return this._data.nextHostId; }
  set nextHostId(v) { this._data.nextHostId = v; }
  get nextVirusId() { return this._data.nextVirusId; }
  set nextVirusId(v) { this._data.nextVirusId = v; }
  get hasCodeErrors() { return this._data.hasCodeErrors; }
  set hasCodeErrors(v) { this._data.hasCodeErrors = v; }
  get eventTimer() { return this._data.eventTimer; }
  set eventTimer(v) { this._data.eventTimer = v; }
}

export const state = new GameState();
