import { state } from '../core/State';
import { DIFFICULTY } from '../core/Config';
import { clamp } from '../utils/dom';

// Market price multipliers that fluctuate over time
let priceHistory: Record<string, number[]> = {};

export function initMarket(): void {
  priceHistory = {
    hw: [], sw: [], net: [], def: [], proxy: []
  };
}

export function tickMarket(): void {
  const cfg = DIFFICULTY[state.diff];
  const hour = state.gameTime.getHours();

  // Determine time of day
  const isNight = hour >= 22 || hour < 6;
  state.timeOfDay = isNight ? 'night' : 'day';

  // Random walk for prices
  const keys = Object.keys(state.marketPrices);
  const prices = { ...state.marketPrices };

  keys.forEach(k => {
    const change = (Math.random() - 0.5) * 0.2; // +/- 10%
    prices[k] = clamp(Math.round(prices[k] * (1 + change)), 50, 2000);
    if (!priceHistory[k]) priceHistory[k] = [];
    priceHistory[k].push(prices[k]);
    if (priceHistory[k].length > 48) priceHistory[k].shift();
  });

  // Night bonuses for DarkNet
  if (isNight) {
    state.marketPrices = prices;
    state.marketTrend = 1.2;
  } else {
    state.marketPrices = prices;
    state.marketTrend = 0.9;
  }
}

export function getPrice(item: string): number {
  return state.marketPrices[item] || 0;
}

export function getPriceHistory(item: string): number[] {
  return priceHistory[item] || [];
}

export function getMarketTrend(): string {
  const t = state.marketTrend;
  if (t > 1.1) return '\uD83D\uDCC8 Растёт';
  if (t < 0.9) return '\uD83D\uDCC9 Падает';
  return '\u2796 Стабильно';
}

export function getTimeOfDayLabel(): string {
  return state.timeOfDay === 'night' ? '\uD83C\uDF19 Ночь' : '\u2600\uFE0F День';
}
