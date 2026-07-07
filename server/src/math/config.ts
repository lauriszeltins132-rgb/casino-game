import type { SymbolId } from '../types/index.js';

export const TARGET_RTP = 0.96;
export const HIT_FREQUENCY = '24–27%';
export const LINE_COUNT = 20;
export const REEL_COUNT = 5;
export const ROW_COUNT = 3;
export const DEMO_BALANCE = 10000;
export const MAX_FREE_SPINS = 50;
export const MAX_WIN_MULTIPLIER = 10000;

export const BET_OPTIONS = [0.2, 0.5, 1, 2, 5, 10, 25];

export const BONUS_BUY_TIERS = [
  {
    id: 'awaken' as const,
    name: 'Awaken the Depths',
    costMultiplier: 75,
    spins: 10,
    seededOrbs: 0,
    orbWeightTier: 'standard' as const,
    description: '10 Free Spins with standard Ink Orb drops',
  },
  {
    id: 'fury' as const,
    name: "Kraken's Fury",
    costMultiplier: 150,
    spins: 12,
    seededOrbs: 1,
    orbWeightTier: 'standard' as const,
    description: '12 Free Spins with 1 Ink Orb pre-seeded on spin 1',
  },
  {
    id: 'leviathan' as const,
    name: 'Ancient Leviathan',
    costMultiplier: 400,
    spins: 15,
    seededOrbs: 2,
    orbWeightTier: 'premium' as const,
    description: '15 Free Spins with 2 Ink Orbs pre-seeded, premium orb values',
  },
];

export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0], [2, 1, 0, 1, 2], [0, 0, 1, 0, 0],
  [2, 2, 1, 2, 2], [1, 0, 0, 0, 1], [1, 2, 2, 2, 1],
  [0, 1, 1, 1, 0], [2, 1, 1, 1, 2], [1, 0, 1, 0, 1],
  [1, 2, 1, 2, 1], [0, 1, 0, 1, 0], [2, 1, 2, 1, 2],
  [1, 1, 0, 1, 1], [1, 1, 2, 1, 1], [0, 2, 0, 2, 0],
  [2, 0, 2, 0, 2], [0, 2, 2, 2, 0],
];

/** Multipliers of LINE bet for 3/4/5 of a kind */
export const PAYTABLE: Record<SymbolId, [number, number, number]> = {
  rope: [0.2, 0.5, 1.5],
  barnacle: [0.2, 0.6, 2],
  anchor_chain: [0.25, 0.75, 2.5],
  wheel: [0.3, 1, 3],
  compass: [0.4, 1.5, 5],
  spyglass: [0.5, 2, 7],
  map: [0.75, 3, 10],
  bell: [1, 4, 12],
  skull: [2, 8, 25],
  crown: [3, 12, 40],
  chest: [5, 20, 75],
  wild: [0, 0, 100],
  scatter: [0, 0, 0],
};

export const SCATTER_AWARDS: Record<number, { spins: number; payMultiplier: number }> = {
  3: { spins: 10, payMultiplier: 3 },
  4: { spins: 12, payMultiplier: 5 },
  5: { spins: 15, payMultiplier: 25 },
};

export const RETRIGGER_SCATTER_MIN = 2;
export const RETRIGGER_SPINS = 5;

const LOW: SymbolId[] = ['rope', 'barnacle', 'anchor_chain', 'wheel'];
const MID: SymbolId[] = ['compass', 'spyglass', 'map', 'bell'];
const HIGH: SymbolId[] = ['skull', 'crown', 'chest'];

function strip(symbols: SymbolId[]): SymbolId[] {
  return symbols;
}

/** Reel 1 (index 0): no wild. High symbols thinned. */
export const REEL_1 = strip([
  ...Array(8).fill('rope' as SymbolId),
  ...Array(7).fill('barnacle' as SymbolId),
  ...Array(6).fill('anchor_chain' as SymbolId),
  ...Array(6).fill('wheel' as SymbolId),
  ...Array(5).fill('compass' as SymbolId),
  ...Array(4).fill('spyglass' as SymbolId),
  ...Array(4).fill('map' as SymbolId),
  ...Array(3).fill('bell' as SymbolId),
  'skull', 'crown', 'scatter',
]);

/** Reels 2-4: wild allowed */
function midReel(extraScatter = 1): SymbolId[] {
  return strip([
    ...Array(7).fill('rope'),
    ...Array(6).fill('barnacle'),
    ...Array(5).fill('anchor_chain'),
    ...Array(5).fill('wheel'),
    ...Array(4).fill('compass'),
    ...Array(4).fill('spyglass'),
    ...Array(3).fill('map'),
    ...Array(3).fill('bell'),
    'skull', 'skull', 'crown', 'chest',
    'wild', 'wild',
    ...Array(extraScatter).fill('scatter' as SymbolId),
  ]);
}

/** Reel 5: no wild. Mid symbols thinned */
export const REEL_5 = strip([
  ...Array(8).fill('rope'),
  ...Array(7).fill('barnacle'),
  ...Array(6).fill('anchor_chain'),
  ...Array(5).fill('wheel'),
  ...Array(3).fill('compass'),
  ...Array(2).fill('spyglass'),
  ...Array(2).fill('map'),
  'bell', 'skull', 'crown', 'chest', 'scatter',
]);

export const BASE_REEL_STRIPS: SymbolId[][] = [
  REEL_1,
  midReel(1),
  midReel(1),
  midReel(1),
  REEL_5,
];

/** Free spin strips — slightly elevated mid/high frequency */
export const FREE_SPIN_REEL_STRIPS: SymbolId[][] = [
  strip([...Array(6).fill('rope'), ...Array(5).fill('barnacle'), ...Array(4).fill('wheel'),
    ...Array(4).fill('compass'), ...Array(3).fill('spyglass'), ...Array(3).fill('map'),
    'bell', 'skull', 'crown', 'chest', 'scatter']),
  strip([...Array(5).fill('rope'), ...Array(4).fill('barnacle'), ...Array(4).fill('wheel'),
    ...Array(4).fill('compass'), ...Array(4).fill('spyglass'), ...Array(3).fill('map'),
    'bell', 'bell', 'skull', 'crown', 'chest', 'wild', 'wild', 'scatter']),
  strip([...Array(5).fill('rope'), ...Array(4).fill('barnacle'), ...Array(3).fill('wheel'),
    ...Array(4).fill('compass'), ...Array(4).fill('spyglass'), ...Array(4).fill('map'),
    'bell', 'skull', 'crown', 'chest', 'wild', 'wild', 'scatter']),
  strip([...Array(5).fill('rope'), ...Array(4).fill('barnacle'), ...Array(3).fill('wheel'),
    ...Array(4).fill('compass'), ...Array(4).fill('spyglass'), ...Array(3).fill('map'),
    'bell', 'skull', 'crown', 'chest', 'wild', 'wild', 'scatter']),
  strip([...Array(6).fill('rope'), ...Array(5).fill('barnacle'), ...Array(4).fill('wheel'),
    ...Array(3).fill('compass'), ...Array(3).fill('spyglass'), 'map', 'bell',
    'skull', 'crown', 'chest', 'scatter']),
];

export const ORB_VALUES_STANDARD: [number, number][] = [
  [2, 40], [3, 30], [5, 20], [10, 9], [50, 1],
];

export const ORB_VALUES_PREMIUM: [number, number][] = [
  [2, 20], [3, 25], [5, 25], [10, 20], [50, 10],
];
