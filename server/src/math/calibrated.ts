/**
 * Calibrated math constants — synced with tools/kraken_sim.py
 *
 * Measured (Monte Carlo, 2–4M spins × 3 runs):
 *   RTP:           ~95.97% (target 96.00%)
 *   Hit frequency: 27–29%
 *   FS trigger:    ~1 in 230 spins
 *   Max win:       1,525x → 4,612x (grows with sample — tail is rare)
 *
 * Paytable: original design ratios × 75 (early runs were ~20% RTP at 1×).
 * Scatter: thinned to 1 copy per reel (was 3–4).
 */

import type { SymbolId } from '../types/index.js';

export const CALIBRATION_NOTE = {
  source: 'tools/kraken_sim.py',
  targetRtp: 0.96,
  measuredRtp: 0.9597,
  measuredHitFrequency: '27–29%',
  measuredFsTrigger: '~1 in 230',
  measuredMaxWin: '1,525x → 4,612x (grows with sample size)',
  measuredRuns: [
    { spins: 2_000_000, rtp: 0.9635, hitFrequency: 0.263, fsTrigger: 232, maxWin: 1525 },
    { spins: 3_000_000, rtp: 0.957, hitFrequency: 0.289, fsTrigger: 229, maxWin: 2702 },
    { spins: 4_000_000, rtp: 0.9587, hitFrequency: 0.27, fsTrigger: 227, maxWin: 4612 },
  ],
  orbDropChance: 0.12,
  paytableScaleFactor: 75,
  certificationNote:
    'Design calibration only. GLI/iTech/BMM require 50–100M+ spins and bonus-buy parity tests.',
  caveats: [
    'Bonus-buy tiers (75x / 150x / 400x) need separate simulation for RTP parity vs natural trigger.',
    'kraken_sim.py is a design/calibration tool, not the production RNG.',
    'Production spins must use a certified server-side RNG with this same reel/paytable logic.',
  ],
};

/** Per LINE bet multipliers for 3/4/5 of a kind (design × 75) */
export const CALIBRATED_PAYTABLE: Record<SymbolId, [number, number, number]> = {
  rope: [15, 37.5, 112.5],
  barnacle: [15, 45, 150],
  anchor_chain: [18.75, 56.25, 187.5],
  wheel: [22.5, 75, 225],
  compass: [30, 112.5, 375],
  spyglass: [37.5, 150, 525],
  map: [56.25, 225, 750],
  bell: [75, 300, 900],
  skull: [150, 600, 1875],
  crown: [225, 900, 3000],
  chest: [375, 1500, 5625],
  wild: [0, 0, 7500],
  scatter: [0, 0, 0],
};

function buildReel1(): SymbolId[] {
  return [
    ...Array(8).fill('rope' as SymbolId),
    ...Array(7).fill('barnacle' as SymbolId),
    ...Array(6).fill('anchor_chain' as SymbolId),
    ...Array(6).fill('wheel' as SymbolId),
    ...Array(5).fill('compass' as SymbolId),
    ...Array(4).fill('spyglass' as SymbolId),
    ...Array(4).fill('map' as SymbolId),
    ...Array(3).fill('bell' as SymbolId),
    'skull', 'crown', 'scatter',
  ];
}

function buildMidReel(): SymbolId[] {
  return [
    ...Array(7).fill('rope' as SymbolId),
    ...Array(6).fill('barnacle' as SymbolId),
    ...Array(5).fill('anchor_chain' as SymbolId),
    ...Array(5).fill('wheel' as SymbolId),
    ...Array(4).fill('compass' as SymbolId),
    ...Array(4).fill('spyglass' as SymbolId),
    ...Array(3).fill('map' as SymbolId),
    ...Array(3).fill('bell' as SymbolId),
    'skull', 'skull', 'crown', 'chest', 'wild', 'wild', 'scatter',
  ];
}

function buildReel5(): SymbolId[] {
  return [
    ...Array(8).fill('rope' as SymbolId),
    ...Array(7).fill('barnacle' as SymbolId),
    ...Array(6).fill('anchor_chain' as SymbolId),
    ...Array(5).fill('wheel' as SymbolId),
    ...Array(3).fill('compass' as SymbolId),
    ...Array(2).fill('spyglass' as SymbolId),
    ...Array(2).fill('map' as SymbolId),
    'bell', 'skull', 'crown', 'chest', 'scatter',
  ];
}

export const CALIBRATED_BASE_STRIPS: SymbolId[][] = [
  buildReel1(),
  buildMidReel(),
  buildMidReel(),
  buildMidReel(),
  buildReel5(),
];
