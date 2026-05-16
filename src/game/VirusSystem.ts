import { state } from '../core/State';
import { DIFFICULTY } from '../core/Config';
import { VirusWeapon } from '../core/Types';
import { log } from '../ui/TerminalUI';

export function createVirus(name: string, type: VirusWeapon['type']): VirusWeapon | null {
  const costs = { botnet: 200, miner: 350, stealer: 500 };
  if (state.money < costs[type]) { log('Недостаточно средств для разработки вируса.', 'warning'); return null; }

  state.money -= costs[type];
  const virus: VirusWeapon = {
    id: state.nextVirusId++,
    name,
    type,
    deployed: false,
    income: type === 'miner' ? 15 : type === 'stealer' ? 25 : 10,
    fbiRisk: type === 'stealer' ? 8 : type === 'miner' ? 5 : 3,
  };
  state.virusWeapons = [...state.virusWeapons, virus];
  return virus;
}

export function deployVirus(virusId: number): boolean {
  const v = state.virusWeapons.find(x => x.id === virusId && !x.deployed);
  if (!v) { log('Вирус не найден или уже развёрнут.', 'warning'); return false; }

  v.deployed = true;
  state.virusWeapons = [...state.virusWeapons];
  log(`\uD83E\uDDA0 Вирус "${v.name}" развёрнут! Пассивный доход +$${v.income}/тик, риск ФБР +${v.fbiRisk}%`, 'success');
  return true;
}

export function tickViruses(): void {
  const active = state.virusWeapons.filter(v => v.deployed);
  if (active.length === 0) return;

  const cfg = DIFFICULTY[state.diff];
  let totalIncome = 0;
  let totalRisk = 0;

  active.forEach(v => {
    totalIncome += v.income;
    totalRisk += v.fbiRisk;
  });

  // Only generate income sometimes
  if (Math.random() < 0.15) {
    state.money += totalIncome;
    state.totalEarned += totalIncome;
  }

  // FBI risk increase
  if (Math.random() < 0.08) {
    state.fbi = Math.min(100, state.fbi + totalRisk * cfg.fbiMult);
  }
}

export function getActiveViruses(): VirusWeapon[] {
  return state.virusWeapons.filter(v => v.deployed);
}

export function getUndeployedViruses(): VirusWeapon[] {
  return state.virusWeapons.filter(v => !v.deployed);
}
