import type { SymbolId } from '../types/index.js';
import {
  CALIBRATED_BASE_STRIPS,
  CALIBRATED_PAYTABLE,
  CALIBRATION_NOTE,
} from './calibrated.js';

export const TARGET_RTP = 0.96;
export const MEASURED_RTP = CALIBRATION_NOTE.measuredRtp;
export const HIT_FREQUENCY = CALIBRATION_NOTE.measuredHitFrequency;
export const FS_TRIGGER_RATE = CALIBRATION_NOTE.measuredFsTrigger;
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

/** Calibrated paytable — see tools/kraken_sim.py (design ratios × 75) */
export const PAYTABLE: Record<SymbolId, [number, number, number]> = CALIBRATED_PAYTABLE;

export const SCATTER_AWARDS: Record<number, { spins: number; payMultiplier: number }> = {
  3: { spins: 10, payMultiplier: 3 },
  4: { spins: 12, payMultiplier: 5 },
  5: { spins: 15, payMultiplier: 25 },
};

export const RETRIGGER_SCATTER_MIN = 2;
export const RETRIGGER_SPINS = 5;

export const BASE_REEL_STRIPS: SymbolId[][] = CALIBRATED_BASE_STRIPS;

/** Free spin strips — elevated mid/high, scatter still thinned */
export const FREE_SPIN_REEL_STRIPS: SymbolId[][] = [
  [
    ...Array(6).fill('rope' as SymbolId),
    ...Array(5).fill('barnacle' as SymbolId),
    ...Array(4).fill('wheel' as SymbolId),
    ...Array(4).fill('compass' as SymbolId),
    ...Array(3).fill('spyglass' as SymbolId),
    ...Array(3).fill('map' as SymbolId),
    'bell', 'skull', 'crown', 'chest', 'scatter',
  ],
  [
    ...Array(5).fill('rope' as SymbolId),
    ...Array(4).fill('barnacle' as SymbolId),
    ...Array(4).fill('wheel' as SymbolId),
    ...Array(4).fill('compass' as SymbolId),
    ...Array(4).fill('spyglass' as SymbolId),
    ...Array(3).fill('map' as SymbolId),
    'bell', 'bell', 'skull', 'crown', 'chest', 'wild', 'wild', 'scatter',
  ],
  [
    ...Array(5).fill('rope' as SymbolId),
    ...Array(4).fill('barnacle' as SymbolId),
    ...Array(3).fill('wheel' as SymbolId),
    ...Array(4).fill('compass' as SymbolId),
    ...Array(4).fill('spyglass' as SymbolId),
    ...Array(4).fill('map' as SymbolId),
    'bell', 'skull', 'crown', 'chest', 'wild', 'wild', 'scatter',
  ],
  [
    ...Array(5).fill('rope' as SymbolId),
    ...Array(4).fill('barnacle' as SymbolId),
    ...Array(3).fill('wheel' as SymbolId),
    ...Array(4).fill('compass' as SymbolId),
    ...Array(4).fill('spyglass' as SymbolId),
    ...Array(3).fill('map' as SymbolId),
    'bell', 'skull', 'crown', 'chest', 'wild', 'wild', 'scatter',
  ],
  [
    ...Array(6).fill('rope' as SymbolId),
    ...Array(5).fill('barnacle' as SymbolId),
    ...Array(4).fill('wheel' as SymbolId),
    ...Array(3).fill('compass' as SymbolId),
    ...Array(3).fill('spyglass' as SymbolId),
    'map', 'bell', 'skull', 'crown', 'chest', 'scatter',
  ],
];

export const ORB_DROP_CHANCE = 0.12;
export const ORB_COUNT_WEIGHTS = [60, 30, 10];

export const ORB_VALUES_STANDARD: [number, number][] = [
  [2, 40], [3, 30], [5, 20], [10, 9], [50, 1],
];

export const ORB_VALUES_PREMIUM: [number, number][] = [
  [2, 20], [3, 25], [5, 25], [10, 20], [50, 10],
];

export { CALIBRATION_NOTE };
