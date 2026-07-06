export type SymbolId =
  | 'coin'
  | 'anchor'
  | 'compass'
  | 'parrot'
  | 'map'
  | 'captain'
  | 'ship'
  | 'wild'
  | 'scatter';

export interface SymbolInfo {
  id: SymbolId;
  name: string;
  emoji: string;
  tier: 'low' | 'mid' | 'high' | 'special';
}

export interface LineWin {
  lineIndex: number;
  symbol: SymbolId;
  count: number;
  payout: number;
}

export interface SpinResponse {
  grid: SymbolId[][];
  lineWins: LineWin[];
  scatterCount: number;
  scatterPayout: number;
  linePayout: number;
  totalWin: number;
  freeSpinsAwarded: number;
  freeSpinsRemaining: number;
  freeSpinSessionId: string | null;
  freeSpinSessionTotalWin: number;
  balance: number;
  bet: number;
  isFreeSpin: boolean;
  isBonusBuy: boolean;
}

export interface SlotConfig {
  symbols: SymbolInfo[];
  paytable: Record<SymbolId, [number, number, number]>;
  paylines: number[][];
  lineCount: number;
  scatterPay: Record<number, number>;
  freeSpinsAward: number;
  freeSpinMultiplier: number;
  bonusBuyCostMultiplier: number;
  targetRtp: number;
  minBetPerLine: number;
  maxBetPerLine: number;
  betPresets: number[];
}

export interface FreeSpinSession {
  id: string;
  betPerLine: number;
  remaining: number;
  totalWin: number;
}

export type GameState = 'idle' | 'spinning' | 'showing_win' | 'free_spins_intro';
