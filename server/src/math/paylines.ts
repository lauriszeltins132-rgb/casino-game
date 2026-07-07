import {
  LINE_COUNT,
  PAYLINES,
  PAYTABLE,
  SCATTER_PAY,
  SCATTER_BONUS_TRIGGER,
} from './config.js';
import type { LineWin, SymbolId } from '../types/index.js';

const PAYING: SymbolId[] = [
  'crown', 'trident', 'chest', 'pearl', 'anchor', 'compass', 'map', 'coin', 'wild',
];

function isWild(s: SymbolId): boolean {
  return s === 'wild';
}

function canSubstitute(sym: SymbolId, target: SymbolId): boolean {
  if (sym === 'scatter' || target === 'scatter') return false;
  if (isWild(sym) || isWild(target)) return true;
  return sym === target;
}

function evaluateLine(
  grid: SymbolId[][],
  lineIndex: number,
  totalBet: number
): LineWin | null {
  const pattern = PAYLINES[lineIndex];
  const symbols = pattern.map((row, reel) => grid[row][reel]);

  let matchSym: SymbolId | null = null;
  let count = 0;

  for (const sym of symbols) {
    if (sym === 'scatter') break;

    if (matchSym === null) {
      if (isWild(sym)) {
        count++;
        continue;
      }
      matchSym = sym;
      count++;
    } else if (canSubstitute(sym, matchSym) || isWild(sym)) {
      count++;
    } else {
      break;
    }
  }

  if (count < 3) {
    const wilds = symbols.filter(isWild).length;
    if (wilds >= 3) {
      const mult = PAYTABLE.wild[wilds - 3];
      return {
        lineIndex,
        symbol: 'wild',
        count: wilds,
        multiplier: mult,
        payout: totalBet * mult,
      };
    }
    return null;
  }

  if (matchSym === null) matchSym = 'wild';
  const mult = PAYTABLE[matchSym][count - 3];
  if (mult <= 0) return null;

  return {
    lineIndex,
    symbol: matchSym,
    count,
    multiplier: mult,
    payout: totalBet * mult,
  };
}

export function evaluateGrid(grid: SymbolId[][], totalBet: number) {
  const lineWins: LineWin[] = [];

  for (let i = 0; i < LINE_COUNT; i++) {
    const win = evaluateLine(grid, i, totalBet);
    if (win) lineWins.push(win);
  }

  let scatterCount = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 5; c++) {
      if (grid[r][c] === 'scatter') scatterCount++;
    }
  }

  let scatterPayout = 0;
  if (scatterCount >= 3) {
    scatterPayout = totalBet * (SCATTER_PAY[scatterCount] ?? SCATTER_PAY[5]);
  }

  const linePayout = lineWins.reduce((s, w) => s + w.payout, 0);
  const totalWin = linePayout + scatterPayout;
  const bonusTriggered = scatterCount >= SCATTER_BONUS_TRIGGER;

  return { lineWins, scatterCount, scatterPayout, linePayout, totalWin, bonusTriggered };
}
