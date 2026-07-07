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

export function getWinningLinePaths(
  lineWins: LineWin[],
  paylines: number[][],
  cellW: number,
  cellH: number,
  gap: number
): string[] {
  return lineWins.map((win) => {
    const pattern = paylines[win.lineIndex];
    const points: string[] = [];
    for (let reel = 0; reel < win.count; reel++) {
      const row = pattern[reel];
      const x = reel * (cellW + gap) + cellW / 2;
      const y = row * (cellH + gap) + cellH / 2;
      points.push(`${points.length === 0 ? 'M' : 'L'}${x},${y}`);
    }
    return points.join(' ');
  });
}

export function formatMoney(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
