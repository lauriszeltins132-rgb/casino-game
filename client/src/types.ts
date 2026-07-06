export type RiskMode = 'low' | 'medium' | 'high';

export type ChestContent = 'treasure' | 'curse' | 'golden_key';

export type RoundStatus =
  | 'active'
  | 'cashed_out'
  | 'lost'
  | 'bonus_pending'
  | 'bonus_active'
  | 'completed';

export type WinTier = 'nice' | 'big' | 'epic';

export type BonusChestResult = 'small_boost' | 'big_boost' | 'curse';

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

export type GamePhase =
  | 'idle'
  | 'playing'
  | 'opening'
  | 'bonus_choice'
  | 'bonus_pick'
  | 'won'
  | 'lost';
