import type { SymbolId } from '../types/index.js';

export const TARGET_RTP = 0.96;
export const LINE_COUNT = 20;
export const REEL_COUNT = 5;
export const ROW_COUNT = 3;
export const SCATTER_BONUS_TRIGGER = 4;
export const BONUS_BUY_MULTIPLIER = 100;
export const BONUS_PICKS = 10;
export const BONUS_CHEST_COUNT = 15;
export const DEMO_BALANCE = 10000;

export const BET_OPTIONS = [0.2, 0.5, 1, 2, 5, 10, 25];

/**
 * 20 paylines on 5×3 grid.
 * Row index: 0=top, 1=middle, 2=bottom.
 */
export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 0, 0],
  [2, 2, 1, 2, 2],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 1, 1, 1, 0],
  [2, 1, 1, 1, 2],
  [1, 0, 1, 0, 1],
  [1, 2, 1, 2, 1],
  [0, 1, 0, 1, 0],
  [2, 1, 2, 1, 2],
  [1, 1, 0, 1, 1],
  [1, 1, 2, 1, 1],
  [0, 2, 0, 2, 0],
  [2, 0, 2, 0, 2],
  [0, 2, 2, 2, 0],
];

/** Payout multipliers of TOTAL bet for 3/4/5 of a kind on a payline */
export const PAYTABLE: Record<SymbolId, [number, number, number]> = {
  crown: [5, 20, 100],
  trident: [3, 10, 50],
  chest: [2, 5, 25],
  pearl: [1.5, 4, 15],
  anchor: [0.5, 1.5, 5],
  compass: [0.4, 1.2, 4],
  map: [0.3, 1, 3],
  coin: [0.2, 0.8, 2.5],
  wild: [2, 8, 40],
  scatter: [0, 0, 0],
};

/** Scatter pays (total bet multiplier) — 3=small, 4=triggers bonus + pay */
export const SCATTER_PAY: Record<number, number> = {
  3: 2,
  4: 5,
  5: 25,
};

/**
 * Weighted reel strips — medium-high volatility.
 * Tuned for ~96% base-game RTP via symbol frequency distribution.
 */
export const BASE_REEL_STRIPS: SymbolId[][] = [
  [
    'coin', 'map', 'compass', 'anchor', 'coin', 'map', 'pearl', 'compass',
    'anchor', 'coin', 'map', 'compass', 'chest', 'anchor', 'coin', 'map',
    'trident', 'compass', 'anchor', 'coin', 'map', 'pearl', 'compass', 'scatter',
    'anchor', 'coin', 'map', 'compass', 'chest', 'anchor', 'coin', 'wild',
  ],
  [
    'map', 'coin', 'compass', 'anchor', 'map', 'coin', 'pearl', 'anchor',
    'compass', 'coin', 'map', 'anchor', 'chest', 'compass', 'coin', 'map',
    'trident', 'anchor', 'compass', 'coin', 'map', 'pearl', 'anchor', 'scatter',
    'compass', 'coin', 'map', 'chest', 'anchor', 'compass', 'coin', 'wild',
  ],
  [
    'compass', 'anchor', 'coin', 'map', 'pearl', 'compass', 'anchor', 'coin',
    'map', 'crown', 'compass', 'anchor', 'chest', 'coin', 'trident', 'map',
    'pearl', 'compass', 'anchor', 'coin', 'scatter', 'map', 'compass', 'anchor',
    'chest', 'coin', 'wild', 'map', 'compass', 'pearl', 'anchor', 'coin',
  ],
  [
    'anchor', 'compass', 'map', 'coin', 'pearl', 'anchor', 'chest', 'compass',
    'map', 'trident', 'coin', 'anchor', 'pearl', 'compass', 'crown', 'map',
    'anchor', 'coin', 'scatter', 'compass', 'map', 'chest', 'anchor', 'pearl',
    'compass', 'wild', 'map', 'coin', 'anchor', 'trident', 'compass', 'map',
  ],
  [
    'map', 'anchor', 'compass', 'coin', 'pearl', 'map', 'chest', 'anchor',
    'compass', 'trident', 'coin', 'map', 'crown', 'anchor', 'pearl', 'compass',
    'map', 'scatter', 'anchor', 'chest', 'coin', 'compass', 'pearl', 'map',
    'anchor', 'wild', 'compass', 'coin', 'trident', 'map', 'anchor', 'pearl',
  ],
];

export const RAGE_THRESHOLDS = [3, 6, 10];
export const RAGE_MULTIPLIERS = [2, 5, 10];
