export type SymbolId =
  | 'rope'
  | 'barnacle'
  | 'anchor_chain'
  | 'wheel'
  | 'compass'
  | 'spyglass'
  | 'map'
  | 'bell'
  | 'skull'
  | 'crown'
  | 'chest'
  | 'wild'
  | 'scatter';

export type BonusBuyTier = 'awaken' | 'fury' | 'leviathan';

export type GameMode = 'base' | 'freespin';

export interface SymbolDef {
  id: SymbolId;
  name: string;
  tier: 'low' | 'mid' | 'high' | 'special';
}

export interface LineWin {
  lineIndex: number;
  symbol: SymbolId;
  count: number;
  multiplier: number;
  payout: number;
}

export interface InkOrb {
  row: number;
  col: number;
  value: number;
}

export interface FreeSpinState {
  sessionId: string;
  remaining: number;
  totalAwarded: number;
  sessionWin: number;
  retriggered: number;
}

export interface SpinResult {
  grid: SymbolId[][];
  lineWins: LineWin[];
  scatterCount: number;
  scatterPayout: number;
  linePayout: number;
  inkOrbs: InkOrb[];
  orbMultiplier: number;
  totalWin: number;
  balance: number;
  bet: number;
  lineBet: number;
  freeSpinsAwarded: number;
  freeSpinState: FreeSpinState | null;
  isFreeSpin: boolean;
  anticipation: boolean;
  mode: GameMode;
  nonce: number;
  serverSeedHash: string;
  clientSeed: string;
}

export interface GameConfig {
  paylines: number[][];
  lineCount: number;
  symbols: SymbolDef[];
  paytable: Record<SymbolId, [number, number, number]>;
  scatterAwards: Record<number, { spins: number; payMultiplier: number }>;
  bonusBuyTiers: {
    id: BonusBuyTier;
    name: string;
    costMultiplier: number;
    spins: number;
    seededOrbs: number;
    description: string;
  }[];
  targetRtp: number;
  hitFrequency: string;
  fsTriggerRate?: string;
  volatility: string;
  betOptions: number[];
  demoBalance: number;
  maxFreeSpins: number;
  maxWinMultiplier: number;
}

export interface ProvablyFairState {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
}

export interface AutoplayConfig {
  spinCount: number;
  lossLimit: number;
  winLimit: number;
}
