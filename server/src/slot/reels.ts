import { randomBytes } from 'crypto';
import type { SymbolId } from './types.js';

export function secureRandom(): number {
  const buf = randomBytes(4);
  return buf.readUInt32BE(0) / 0x100000000;
}

export function secureRandomInt(max: number): number {
  return Math.floor(secureRandom() * max);
}

/**
 * Weighted reel strips tuned for ~96% base-game RTP.
 * Production would validate via Monte Carlo simulation (1M+ spins).
 */
export const BASE_REEL_STRIPS: SymbolId[][] = [
  // Reel 1
  [
    'coin', 'anchor', 'compass', 'coin', 'parrot', 'anchor', 'coin', 'map',
    'compass', 'coin', 'anchor', 'parrot', 'coin', 'compass', 'anchor', 'coin',
    'captain', 'coin', 'anchor', 'compass', 'parrot', 'coin', 'anchor', 'scatter',
    'coin', 'compass', 'anchor', 'map', 'coin', 'wild', 'anchor', 'coin',
  ],
  // Reel 2
  [
    'anchor', 'coin', 'compass', 'parrot', 'anchor', 'coin', 'map', 'anchor',
    'coin', 'compass', 'parrot', 'anchor', 'coin', 'captain', 'compass', 'anchor',
    'coin', 'parrot', 'anchor', 'compass', 'coin', 'scatter', 'anchor', 'coin',
    'map', 'anchor', 'coin', 'compass', 'wild', 'anchor', 'coin', 'parrot',
  ],
  // Reel 3
  [
    'compass', 'coin', 'anchor', 'parrot', 'compass', 'coin', 'map', 'anchor',
    'coin', 'captain', 'compass', 'parrot', 'coin', 'anchor', 'ship', 'compass',
    'coin', 'parrot', 'anchor', 'compass', 'scatter', 'coin', 'anchor', 'compass',
    'map', 'coin', 'wild', 'anchor', 'compass', 'parrot', 'coin', 'anchor',
  ],
  // Reel 4
  [
    'parrot', 'coin', 'anchor', 'compass', 'map', 'coin', 'anchor', 'parrot',
    'coin', 'compass', 'captain', 'anchor', 'coin', 'parrot', 'map', 'coin',
    'anchor', 'compass', 'scatter', 'coin', 'parrot', 'anchor', 'ship', 'coin',
    'compass', 'parrot', 'coin', 'wild', 'anchor', 'map', 'coin', 'parrot',
  ],
  // Reel 5
  [
    'map', 'coin', 'anchor', 'compass', 'parrot', 'coin', 'captain', 'anchor',
    'coin', 'compass', 'parrot', 'map', 'coin', 'anchor', 'compass', 'parrot',
    'coin', 'scatter', 'anchor', 'map', 'coin', 'parrot', 'ship', 'coin',
    'anchor', 'compass', 'wild', 'coin', 'parrot', 'map', 'anchor', 'coin',
  ],
];

/** Free spin reels have slightly better symbol distribution */
export const FREE_SPIN_REEL_STRIPS: SymbolId[][] = [
  [
    'coin', 'anchor', 'parrot', 'coin', 'map', 'compass', 'coin', 'captain',
    'anchor', 'parrot', 'coin', 'map', 'compass', 'coin', 'anchor', 'ship',
    'parrot', 'coin', 'map', 'compass', 'wild', 'coin', 'anchor', 'scatter',
    'parrot', 'coin', 'captain', 'anchor', 'map', 'coin', 'compass', 'parrot',
  ],
  [
    'anchor', 'parrot', 'coin', 'map', 'compass', 'coin', 'captain', 'anchor',
    'parrot', 'coin', 'map', 'compass', 'coin', 'ship', 'anchor', 'parrot',
    'coin', 'map', 'compass', 'wild', 'coin', 'scatter', 'anchor', 'parrot',
    'map', 'coin', 'captain', 'compass', 'anchor', 'parrot', 'coin', 'map',
  ],
  [
    'parrot', 'map', 'coin', 'captain', 'compass', 'coin', 'anchor', 'parrot',
    'map', 'coin', 'ship', 'compass', 'parrot', 'coin', 'captain', 'anchor',
    'map', 'coin', 'wild', 'parrot', 'compass', 'scatter', 'coin', 'captain',
    'anchor', 'map', 'coin', 'parrot', 'compass', 'ship', 'coin', 'map',
  ],
  [
    'map', 'parrot', 'coin', 'captain', 'anchor', 'compass', 'coin', 'ship',
    'parrot', 'map', 'coin', 'captain', 'compass', 'anchor', 'parrot', 'coin',
    'map', 'wild', 'coin', 'captain', 'scatter', 'parrot', 'compass', 'coin',
    'anchor', 'map', 'coin', 'ship', 'parrot', 'captain', 'compass', 'coin',
  ],
  [
    'captain', 'parrot', 'map', 'coin', 'ship', 'compass', 'coin', 'captain',
    'parrot', 'map', 'coin', 'anchor', 'captain', 'compass', 'parrot', 'coin',
    'ship', 'map', 'wild', 'coin', 'captain', 'scatter', 'parrot', 'compass',
    'map', 'coin', 'captain', 'ship', 'parrot', 'anchor', 'compass', 'coin',
  ],
];

/** Bonus buy: guaranteed 3 scatters on reels 1, 3, 5 with random other symbols */
export function generateBonusBuyGrid(strips: SymbolId[][]): SymbolId[][] {
  const grid: SymbolId[][] = [[], [], []];

  for (let reel = 0; reel < 5; reel++) {
    const strip = strips[reel];
    const stop = secureRandomInt(strip.length);
    const col = [
      strip[(stop - 1 + strip.length) % strip.length],
      strip[stop],
      strip[(stop + 1) % strip.length],
    ];

    if (reel === 0 || reel === 2 || reel === 4) {
      col[1] = 'scatter';
    }

    for (let row = 0; row < 3; row++) {
      if (!grid[row]) grid[row] = [];
      grid[row][reel] = col[row];
    }
  }

  return grid;
}

export function spinReels(strips: SymbolId[][]): SymbolId[][] {
  const grid: SymbolId[][] = [[], [], []];

  for (let reel = 0; reel < strips.length; reel++) {
    const strip = strips[reel];
    const stop = secureRandomInt(strip.length);
    const symbols = [
      strip[(stop - 1 + strip.length) % strip.length],
      strip[stop],
      strip[(stop + 1) % strip.length],
    ];
    for (let row = 0; row < 3; row++) {
      grid[row][reel] = symbols[row];
    }
  }

  return grid;
}
