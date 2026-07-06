import {
  FREE_SPIN_MULTIPLIER,
  FREE_SPINS_AWARD,
  LINE_COUNT,
  PAYLINES,
  PAYTABLE,
  SCATTER_PAY,
  type LineWin,
  type SpinResult,
  type SymbolId,
} from './types.js';

const PAYING_SYMBOLS: SymbolId[] = [
  'coin', 'anchor', 'compass', 'parrot', 'map', 'captain', 'ship', 'wild',
];

function matchesSymbol(symbol: SymbolId, target: SymbolId): boolean {
  if (symbol === 'scatter' || target === 'scatter') return false;
  if (symbol === 'wild' || target === 'wild') return true;
  return symbol === target;
}

function evaluateLine(grid: SymbolId[][], lineIndex: number, betPerLine: number): LineWin | null {
  const pattern = PAYLINES[lineIndex];
  const lineSymbols = pattern.map((row, reel) => grid[row][reel]);

  let matchSymbol: SymbolId | null = null;
  let count = 0;

  for (const sym of lineSymbols) {
    if (sym === 'scatter') break;

    if (matchSymbol === null) {
      if (sym === 'wild') {
        count++;
        continue;
      }
      matchSymbol = sym;
      count++;
    } else if (matchesSymbol(sym, matchSymbol) || sym === 'wild') {
      count++;
    } else {
      break;
    }
  }

  if (count < 3) {
    // Check if wilds alone count (wild paytable)
    const wildCount = lineSymbols.filter((s) => s === 'wild').length;
    if (wildCount >= 3) {
      const pays = PAYTABLE.wild;
      const idx = wildCount - 3;
      return {
        lineIndex,
        symbol: 'wild',
        count: wildCount,
        payout: betPerLine * pays[idx],
      };
    }
    return null;
  }

  // Resolve leading wilds to best paying symbol
  if (matchSymbol === null) matchSymbol = 'wild';

  const pays = PAYTABLE[matchSymbol];
  const idx = Math.min(count - 3, 2);
  const payout = betPerLine * pays[idx];

  if (payout <= 0) return null;

  return { lineIndex, symbol: matchSymbol, count, payout };
}

export function evaluateGrid(
  grid: SymbolId[][],
  betPerLine: number,
  freeSpinMultiplier = 1
): Omit<SpinResult, 'grid' | 'freeSpinsAwarded' | 'isBonusBuy'> {
  const lineWins: LineWin[] = [];

  for (let i = 0; i < LINE_COUNT; i++) {
    const win = evaluateLine(grid, i, betPerLine);
    if (win) {
      lineWins.push({
        ...win,
        payout: win.payout * freeSpinMultiplier,
      });
    }
  }

  let scatterCount = 0;
  for (let row = 0; row < 3; row++) {
    for (let reel = 0; reel < 5; reel++) {
      if (grid[row][reel] === 'scatter') scatterCount++;
    }
  }

  const totalBet = betPerLine * LINE_COUNT;
  let scatterPayout = 0;
  if (scatterCount >= 3) {
    scatterPayout = totalBet * (SCATTER_PAY[scatterCount] ?? SCATTER_PAY[5]);
  }
  scatterPayout *= freeSpinMultiplier;

  const linePayout = lineWins.reduce((sum, w) => sum + w.payout, 0);
  const totalWin = linePayout + scatterPayout;

  return { lineWins, scatterCount, scatterPayout, linePayout, totalWin };
}

export function getFreeSpinsAwarded(scatterCount: number): number {
  if (scatterCount >= 5) return FREE_SPINS_AWARD + 5;
  if (scatterCount >= 4) return FREE_SPINS_AWARD + 2;
  if (scatterCount >= 3) return FREE_SPINS_AWARD;
  return 0;
}

export function getFreeSpinMultiplier(): number {
  return FREE_SPIN_MULTIPLIER;
}
