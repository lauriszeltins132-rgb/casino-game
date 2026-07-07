export type SymbolId =
  | 'crown'
  | 'trident'
  | 'chest'
  | 'pearl'
  | 'anchor'
  | 'compass'
  | 'map'
  | 'coin'
  | 'wild'
  | 'scatter';

export type BonusChestOutcome =
  | 'gold_coins'
  | 'multiplier_x2'
  | 'multiplier_x3'
  | 'multiplier_x5'
  | 'multiplier_x10'
  | 'kraken_rage'
  | 'ancient_relic'
  | 'jackpot';

export interface SymbolDef {
  id: SymbolId;
  name: string;
  tier: 'high' | 'mid' | 'low' | 'special';
}

export interface LineWin {
  lineIndex: number;
  symbol: SymbolId;
  count: number;
  multiplier: number;
  payout: number;
}

export interface SpinResult {
  grid: SymbolId[][];
  lineWins: LineWin[];
  scatterCount: number;
  scatterPayout: number;
  linePayout: number;
  totalWin: number;
  bonusTriggered: boolean;
  balance: number;
  bet: number;
  nonce: number;
  serverSeedHash: string;
  clientSeed: string;
  bonusId?: string;
}

export interface BonusChest {
  index: number;
  picked: boolean;
  outcome?: BonusChestOutcome;
  payout?: number;
}

export interface BonusState {
  id: string;
  bet: number;
  chests: BonusChest[];
  picksRemaining: number;
  totalPicks: number;
  rageMeter: number;
  rageLevel: number;
  rageMultiplier: number;
  relicsCollected: number;
  totalWin: number;
  activeMultiplier: number;
  completed: boolean;
}

export interface BonusPickResult {
  bonus: BonusState;
  outcome: BonusChestOutcome;
  payout: number;
  balance: number;
  rageLevelUp: boolean;
  extraPicks: number;
}

export interface GameConfig {
  paylines: number[][];
  lineCount: number;
  reelCount: number;
  rowCount: number;
  symbols: SymbolDef[];
  paytable: Record<SymbolId, [number, number, number]>;
  scatterPay: Record<number, number>;
  scatterBonusTrigger: number;
  bonusBuyMultiplier: number;
  targetRtp: number;
  volatility: string;
  betOptions: number[];
  demoBalance: number;
  bonusPicks: number;
  bonusChestCount: number;
}

export type GamePhase =
  | 'idle'
  | 'spinning'
  | 'showing_win'
  | 'bonus_intro'
  | 'bonus_active'
  | 'bonus_complete';
