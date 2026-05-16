import { state } from '../core/State';
import { TECH_TREE } from '../core/Config';
import { TechNode } from '../core/Types';

export function initTechTree(): void {
  if (Object.keys(state.techs).length === 0) {
    const tree: Record<string, TechNode> = {};
    TECH_TREE.forEach(t => {
      tree[t.id] = { ...t };
    });
    state.techs = tree;
  }
}

export function unlockTech(techId: string): boolean {
  const tree = state.techs;
  const tech = tree[techId];
  if (!tech || tech.unlocked) return false;
  if (state.money < tech.cost) return false;

  // Check prerequisites
  for (const req of tech.requires) {
    if (!tree[req]?.unlocked) return false;
  }

  state.money -= tech.cost;
  tech.unlocked = true;
  state.techs = { ...tree };
  return true;
}

export function getUnlockedTechs(): string[] {
  return Object.values(state.techs).filter(t => t.unlocked).map(t => t.id);
}

export function getAvailableTechs(): TechNode[] {
  const tree = state.techs;
  return Object.values(tree).filter(t => {
    if (t.unlocked) return false;
    return t.requires.every(req => tree[req]?.unlocked);
  });
}

export function hasTech(techId: string): boolean {
  return !!state.techs[techId]?.unlocked;
}

export function applyTechEffects(techId: string): string {
  const tech = state.techs[techId];
  if (!tech) return '';

  const effects: string[] = [];
  if (tech.effect.includes('hw+')) {
    state.hw += 1;
    effects.push('Железо +1');
  }
  if (tech.effect.includes('net+')) {
    state.net += 1;
    effects.push('Сеть +1');
  }
  if (tech.effect.includes('защита')) {
    state.sw += 1;
    effects.push('Софт +1');
  }

  return effects.join(', ');
}
