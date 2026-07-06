export type SymbolId =
  | 'coin'
  | 'anchor'
  | 'compass'
  | 'parrot'
  | 'map'
  | 'captain'
  | 'ship'
  | 'wild'
  | 'scatter';

export interface SymbolInfo {
  id: SymbolId;
  name: string;
  emoji: string;
  tier: 'low' | 'mid' | 'high' | 'special';
}

export const SYMBOLS: Record<SymbolId, SymbolInfo> = {
  coin: { id: 'coin', name: 'Gold Coin', emoji: '🪙', tier: 'low' },
  anchor: { id: 'anchor', name: 'Anchor', emoji: '⚓', tier: 'low' },
  compass: { id: 'compass', name: 'Compass', emoji: '🧭', tier: 'low' },
  parrot: { id: 'parrot', name: 'Parrot', emoji: '🦜', tier: 'mid' },
  map: { id: 'map', name: 'Treasure Map', emoji: '🗺️', tier: 'mid' },
  captain: { id: 'captain', name: 'Captain', emoji: '🏴‍☠️', tier: 'high' },
  ship: { id: 'ship', name: 'Galleon', emoji: '⛵', tier: 'high' },
  wild: { id: 'wild', name: 'Kraken Wild', emoji: '🐙', tier: 'special' },
  scatter: { id: 'scatter', name: 'Bonus Chest', emoji: '💎', tier: 'special' },
};

/** Paytable: multiplier of line bet for 3/4/5 of a kind */
export const PAYTABLE: Record<SymbolId, [number, number, number]> = {
  coin: [0.4, 0.8, 2],
  anchor: [0.4, 0.8, 2],
  compass: [0.5, 1, 2.5],
  parrot: [0.8, 2, 4],
  map: [1, 2.5, 5],
  captain: [1.5, 4, 10],
  ship: [2, 5, 12],
  wild: [3, 8, 20],
  scatter: [0, 0, 0],
};

/** Scatter pays as multiplier of total bet (not per line) */
export const SCATTER_PAY: Record<number, number> = {
  3: 2,
  4: 10,
  5: 50,
};

export const LINE_COUNT = 10;
export const REEL_COUNT = 5;
export const ROW_COUNT = 3;
export const FREE_SPINS_AWARD = 10;
export const FREE_SPIN_MULTIPLIER = 2;
export const BONUS_BUY_COST_MULTIPLIER = 100;
export const TARGET_RTP = 0.96;

/**
 * 10 standard paylines on a 5x3 grid.
 * Each entry is row index (0=top, 1=middle, 2=bottom) per reel.
 */
export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // 1 middle
  [0, 0, 0, 0, 0], // 2 top
  [2, 2, 2, 2, 2], // 3 bottom
  [0, 1, 2, 1, 0], // 4 V
  [2, 1, 0, 1, 2], // 5 inverted V
  [0, 0, 1, 0, 0], // 6
  [2, 2, 1, 2, 2], // 7
  [1, 2, 2, 2, 1], // 8
  [1, 0, 0, 0, 1], // 9
  [0, 1, 1, 1, 0], // 10
];

export interface LineWin {
  lineIndex: number;
  symbol: SymbolId;
  count: number;
  payout: number;
}

export interface SpinResult {
  grid: SymbolId[][];
  lineWins: LineWin[];
  scatterCount: number;
  scatterPayout: number;
  linePayout: number;
  totalWin: number;
  freeSpinsAwarded: number;
  isBonusBuy: boolean;
}

export interface FreeSpinSession {
  id: string;
  betPerLine: number;
  remaining: number;
  totalWin: number;
}

export interface SpinResponse {
  grid: SymbolId[][];
  lineWins: LineWin[];
  scatterCount: number;
  scatterPayout: number;
  linePayout: number;
  totalWin: number;
  freeSpinsAwarded: number;
  freeSpinsRemaining: number;
  freeSpinSessionId: string | null;
  freeSpinSessionTotalWin: number;
  balance: number;
  bet: number;
  isFreeSpin: boolean;
  isBonusBuy: boolean;
}

export interface SlotConfig {
  symbols: SymbolInfo[];
  paytable: typeof PAYTABLE;
  paylines: number[][];
  lineCount: number;
  scatterPay: typeof SCATTER_PAY;
  freeSpinsAward: number;
  freeSpinMultiplier: number;
  bonusBuyCostMultiplier: number;
  targetRtp: number;
  minBetPerLine: number;
  maxBetPerLine: number;
  betPresets: number[];
}
