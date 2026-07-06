export type RiskMode = 'low' | 'medium' | 'high';

export type ChestContent = 'treasure' | 'curse' | 'golden_key';

export type RoundStatus = 'active' | 'cashed_out' | 'lost' | 'bonus_pending' | 'bonus_active' | 'completed';

export type BonusChestResult = 'small_boost' | 'big_boost' | 'curse';

export interface RoundState {
  id: string;
  bet: number;
  riskMode: RiskMode;
  chestContents: ChestContent[];
  openedIndices: number[];
  safePickCount: number;
  multiplier: number;
  status: RoundStatus;
  goldenKeyFound: boolean;
  bonusChests?: BonusChestResult[];
  bonusPicked?: boolean;
  createdAt: number;
}

export interface PublicChest {
  index: number;
  opened: boolean;
  content?: ChestContent;
}

export interface RoundPublicView {
  roundId: string;
  bet: number;
  riskMode: RiskMode;
  multiplier: number;
  potentialWin: number;
  safePickCount: number;
  chests: PublicChest[];
  status: RoundStatus;
  canCashOut: boolean;
  canPick: boolean;
  balance: number;
}

export interface PickResult {
  round: RoundPublicView;
  pickedContent: ChestContent;
  roundEnded: boolean;
  winAmount?: number;
  winTier?: WinTier;
  showBonusChoice?: boolean;
}

export interface CashoutResult {
  round: RoundPublicView;
  winAmount: number;
  winTier: WinTier;
}

export interface BonusChoiceResult {
  round: RoundPublicView;
  result: BonusChestResult;
  multiplierDelta: number;
  roundEnded: boolean;
  winAmount?: number;
  winTier?: WinTier;
}

export type WinTier = 'nice' | 'big' | 'epic';

export const TARGET_RTP = 0.96;
export const MAX_WIN_MULTIPLIER = 500;
export const CHEST_COUNT = 5;

export const MULTIPLIER_PROGRESSION: Record<RiskMode, number[]> = {
  low: [1.15, 1.45, 1.95, 2.8, 5.0],
  medium: [1.25, 1.7, 2.5, 4.5, 10.0],
  high: [1.4, 2.1, 3.5, 7.0, 15.0],
};

export const GOLDEN_KEY_CHANCE: Record<RiskMode, number> = {
  low: 0.06,
  medium: 0.08,
  high: 0.1,
};

export const BONUS_SMALL_BOOST = 0.35;
export const BONUS_BIG_BOOST = 1.2;
