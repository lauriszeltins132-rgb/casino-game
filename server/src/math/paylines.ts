import {
  LINE_COUNT,
  PAYLINES,
  PAYTABLE,
  SCATTER_AWARDS,
  RETRIGGER_SCATTER_MIN,
  RETRIGGER_SPINS,
} from './config.js';
import type { LineWin, SymbolId } from '../types/index.js';

const PAYING: SymbolId[] = [
  'rope', 'barnacle', 'anchor_chain', 'wheel', 'compass', 'spyglass',
  'map', 'bell', 'skull', 'crown', 'chest', 'wild',
];

function isWild(s: SymbolId): boolean {
  return s === 'wild';
}

function canMatch(a: SymbolId, b: SymbolId): boolean {
  if (a === 'scatter' || b === 'scatter') return false;
  if (isWild(a) || isWild(b)) return true;
  return a === b;
}

function evaluateLine(
  grid: SymbolId[][],
  lineIndex: number,
  lineBet: number
): LineWin | null {
  const pattern = PAYLINES[lineIndex];
  const symbols = pattern.map((row, reel) => grid[row][reel]);

  let matchSym: SymbolId | null = null;
  let count = 0;

  for (const sym of symbols) {
    if (sym === 'scatter') break;
    if (matchSym === null) {
      if (isWild(sym)) { count++; continue; }
      matchSym = sym;
      count++;
    } else if (canMatch(sym, matchSym) || isWild(sym)) {
      count++;
    } else break;
  }

  if (count < 3) {
    const wilds = symbols.filter(isWild).length;
    if (wilds >= 5) {
      const mult = PAYTABLE.wild[2];
      return { lineIndex, symbol: 'wild', count: 5, multiplier: mult, payout: lineBet * mult };
    }
    if (wilds >= 3) {
      const mult = PAYTABLE.wild[wilds - 3];
      if (mult > 0) {
        return { lineIndex, symbol: 'wild', count: wilds, multiplier: mult, payout: lineBet * mult };
      }
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
    payout: lineBet * mult,
  };
}

export function countScatters(grid: SymbolId[][]): number {
  let n = 0;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 5; c++)
      if (grid[r][c] === 'scatter') n++;
  return n;
}

export function countScattersInFirstReels(grid: SymbolId[][], reelCount: number): number {
  let n = 0;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < reelCount; c++)
      if (grid[r][c] === 'scatter') n++;
  return n;
}

export function evaluateGrid(grid: SymbolId[][], totalBet: number) {
  const lineBet = totalBet / LINE_COUNT;
  const lineWins: LineWin[] = [];

  for (let i = 0; i < LINE_COUNT; i++) {
    const win = evaluateLine(grid, i, lineBet);
    if (win) lineWins.push(win);
  }

  const scatterCount = countScatters(grid);
  let scatterPayout = 0;
  if (scatterCount >= 3) {
    const award = SCATTER_AWARDS[scatterCount] ?? SCATTER_AWARDS[5];
    scatterPayout = totalBet * award.payMultiplier;
  }

  const linePayout = lineWins.reduce((s, w) => s + w.payout, 0);
  const baseWin = linePayout + scatterPayout;
  const anticipation = countScattersInFirstReels(grid, 3) >= 2;

  return {
    lineWins,
    scatterCount,
    scatterPayout,
    linePayout,
    baseWin,
    lineBet,
    anticipation,
    freeSpinsAwarded:
      scatterCount >= 3
        ? (SCATTER_AWARDS[scatterCount] ?? SCATTER_AWARDS[5]).spins
        : 0,
    retriggerSpins:
      scatterCount >= RETRIGGER_SCATTER_MIN ? RETRIGGER_SPINS : 0,
  };
}

export function hasLineWin(lineWins: LineWin[]): boolean {
  return lineWins.length > 0;
}
