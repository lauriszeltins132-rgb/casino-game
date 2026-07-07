import type { ProvablyFairState } from '../types/index.js';
import { advanceNonce, fairRandomInt } from '../rng/provablyFair.js';
import { BASE_REEL_STRIPS, REEL_COUNT, ROW_COUNT } from './config.js';
import type { SymbolId } from '../types/index.js';

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
    const symbols = [
      strip[(stop - 1 + strip.length) % strip.length],
      strip[stop],
      strip[(stop + 1) % strip.length],
    ];

    for (let row = 0; row < ROW_COUNT; row++) {
      grid[row][reel] = symbols[row];
    }
  }

  return { grid, nonce: lastNonce };
}

/** Bonus buy: guarantee 4 scatters on reels 1, 2, 4, 5 middle row */
export function generateBonusBuyGrid(pf: ProvablyFairState): { grid: SymbolId[][]; nonce: number } {
  const { grid, nonce } = spinReels(pf);
  const scatterReels = [0, 1, 3, 4];
  for (const reel of scatterReels) {
    grid[1][reel] = 'scatter';
  }
  return { grid, nonce };
}
