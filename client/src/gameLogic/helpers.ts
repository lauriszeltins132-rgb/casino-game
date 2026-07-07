import type { LineWin } from '../types';

export function getWinningCells(lineWins: LineWin[], paylines: number[][]): Set<string> {
  const cells = new Set<string>();
  for (const win of lineWins) {
    const pattern = paylines[win.lineIndex];
    if (!pattern) continue;
    for (let reel = 0; reel < win.count; reel++) {
      cells.add(`${pattern[reel]}-${reel}`);
    }
  }
  return cells;
}

export function formatMoney(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
