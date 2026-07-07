import type { ProvablyFairState } from '../types/index.js';
import { advanceNonce, fairRandomInt } from '../rng/provablyFair.js';
import {
  BASE_REEL_STRIPS,
  FREE_SPIN_REEL_STRIPS,
  ORB_VALUES_PREMIUM,
  ORB_VALUES_STANDARD,
  REEL_COUNT,
  ROW_COUNT,
} from './config.js';
import type { InkOrb, SymbolId } from '../types/index.js';

export function spinReels(
  pf: ProvablyFairState,
  strips: SymbolId[][] = BASE_REEL_STRIPS
): { grid: SymbolId[][]; nonce: number } {
  const grid: SymbolId[][] = [[], [], []];
  let lastNonce = pf.nonce;

  for (let reel = 0; reel < REEL_COUNT; reel++) {
    const strip = strips[reel];
    const r = fairRandomInt(pf, strip.length);
    lastNonce = r.nonce;
    advanceNonce(pf, r.nonce);
    const stop = r.value;
    const col = [
      strip[(stop - 1 + strip.length) % strip.length],
      strip[stop],
      strip[(stop + 1) % strip.length],
    ];
    for (let row = 0; row < ROW_COUNT; row++) grid[row][reel] = col[row];
  }

  return { grid, nonce: lastNonce };
}

export function generateBonusBuyGrid(
  pf: ProvablyFairState,
  scatterCount: 3 | 4 | 5 = 3
): { grid: SymbolId[][]; nonce: number } {
  const { grid, nonce } = spinReels(pf);
  const positions: [number, number][] =
    scatterCount === 3
      ? [[0, 0], [1, 2], [2, 4]]
      : scatterCount === 4
        ? [[0, 0], [1, 1], [1, 3], [2, 4]]
        : [[0, 0], [0, 2], [1, 2], [2, 1], [2, 4]];

  for (const [row, col] of positions) grid[row][col] = 'scatter';
  return { grid, nonce };
}

function pickOrbValue(
  pf: ProvablyFairState,
  premium: boolean
): { value: number; nonce: number } {
  const table = premium ? ORB_VALUES_PREMIUM : ORB_VALUES_STANDARD;
  const total = table.reduce((s, [, w]) => s + w, 0);
  const r = fairRandomInt(pf, total);
  advanceNonce(pf, r.nonce);
  let cum = 0;
  for (const [val, weight] of table) {
    cum += weight;
    if (r.value < cum) return { value: val, nonce: r.nonce };
  }
  return { value: 2, nonce: r.nonce };
}

export function generateInkOrbs(
  pf: ProvablyFairState,
  count: number,
  premium: boolean,
  occupied: Set<string> = new Set()
): { orbs: InkOrb[]; nonce: number } {
  const orbs: InkOrb[] = [];
  let lastNonce = pf.nonce;

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    while (attempts < 20) {
      const rRow = fairRandomInt(pf, 3);
      advanceNonce(pf, rRow.nonce);
      const rCol = fairRandomInt(pf, 5);
      advanceNonce(pf, rCol.nonce);
      lastNonce = rCol.nonce;
      const key = `${rRow.value}-${rCol.value}`;
      if (!occupied.has(key)) {
        occupied.add(key);
        const { value, nonce } = pickOrbValue(pf, premium);
        lastNonce = nonce;
        orbs.push({ row: rRow.value, col: rCol.value, value });
        break;
      }
      attempts++;
    }
  }

  return { orbs, nonce: lastNonce };
}

export { FREE_SPIN_REEL_STRIPS, BASE_REEL_STRIPS };
