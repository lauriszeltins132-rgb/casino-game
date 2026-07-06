import { v4 as uuidv4 } from 'uuid';
import {
  capWinAmount,
  generateBonusChests,
  generateChestLayout,
  getMultiplierForSafePicks,
  getWinTier,
  applyBonusResult,
} from './game.js';
import type {
  BonusChoiceResult,
  CashoutResult,
  PickResult,
  PublicChest,
  RiskMode,
  RoundPublicView,
  RoundState,
} from './types.js';

const rounds = new Map<string, RoundState>();
let playerBalance = 1000;

const ROUND_TTL_MS = 30 * 60 * 1000;

function cleanupExpiredRounds(): void {
  const now = Date.now();
  for (const [id, round] of rounds) {
    if (now - round.createdAt > ROUND_TTL_MS) {
      rounds.delete(id);
    }
  }
}

function toPublicChests(round: RoundState): PublicChest[] {
  return round.chestContents.map((_, index) => ({
    index,
    opened: round.openedIndices.includes(index),
    content: round.openedIndices.includes(index) ? round.chestContents[index] : undefined,
  }));
}

function toPublicView(round: RoundState): RoundPublicView {
  const { winAmount: potentialWin } = capWinAmount(round.bet, round.multiplier);
  const canCashOut =
    round.status === 'active' && round.safePickCount > 0 && round.multiplier > 0;
  const canPick = round.status === 'active';

  return {
    roundId: round.id,
    bet: round.bet,
    riskMode: round.riskMode,
    multiplier: round.multiplier,
    potentialWin,
    safePickCount: round.safePickCount,
    chests: toPublicChests(round),
    status: round.status,
    canCashOut,
    canPick,
    balance: playerBalance,
  };
}

export function getBalance(): number {
  return playerBalance;
}

export function setBalance(amount: number): void {
  playerBalance = amount;
}

export function startRound(bet: number, riskMode: RiskMode): RoundPublicView {
  cleanupExpiredRounds();

  if (bet <= 0) throw new Error('Bet must be positive');
  if (bet > playerBalance) throw new Error('Insufficient balance');

  playerBalance -= bet;

  const round: RoundState = {
    id: uuidv4(),
    bet,
    riskMode,
    chestContents: generateChestLayout(riskMode),
    openedIndices: [],
    safePickCount: 0,
    multiplier: 1,
    status: 'active',
    goldenKeyFound: false,
    createdAt: Date.now(),
  };

  rounds.set(round.id, round);
  return toPublicView(round);
}

export function pickChest(roundId: string, chestIndex: number): PickResult {
  const round = rounds.get(roundId);
  if (!round) throw new Error('Round not found');
  if (round.status !== 'active') throw new Error('Round is not active');
  if (chestIndex < 0 || chestIndex >= round.chestContents.length) {
    throw new Error('Invalid chest index');
  }
  if (round.openedIndices.includes(chestIndex)) {
    throw new Error('Chest already opened');
  }

  round.openedIndices.push(chestIndex);
  const content = round.chestContents[chestIndex];

  if (content === 'curse') {
    round.status = 'lost';
    round.multiplier = 0;
    return {
      round: toPublicView(round),
      pickedContent: content,
      roundEnded: true,
      winAmount: 0,
    };
  }

  if (content === 'golden_key') {
    round.goldenKeyFound = true;
    round.safePickCount += 1;
    round.multiplier = getMultiplierForSafePicks(round.riskMode, round.safePickCount);
    round.status = 'bonus_pending';
    round.bonusChests = generateBonusChests();

    return {
      round: toPublicView(round),
      pickedContent: content,
      roundEnded: false,
      showBonusChoice: true,
    };
  }

  // treasure
  round.safePickCount += 1;
  round.multiplier = getMultiplierForSafePicks(round.riskMode, round.safePickCount);

  const allSafeOpened = round.openedIndices.length === round.chestContents.length - 1;
  const remainingUnopened = round.chestContents.filter(
    (_, i) => !round.openedIndices.includes(i)
  );
  const onlyCurseRemains =
    remainingUnopened.length === 1 && remainingUnopened[0] === 'curse';

  if (allSafeOpened || onlyCurseRemains) {
    const { winAmount } = capWinAmount(round.bet, round.multiplier);
    playerBalance += winAmount;
    round.status = 'completed';
    return {
      round: toPublicView(round),
      pickedContent: content,
      roundEnded: true,
      winAmount,
      winTier: getWinTier(round.multiplier),
    };
  }

  return {
    round: toPublicView(round),
    pickedContent: content,
    roundEnded: false,
  };
}

export function cashOut(roundId: string): CashoutResult {
  const round = rounds.get(roundId);
  if (!round) throw new Error('Round not found');
  if (round.status !== 'active' && round.status !== 'bonus_pending') {
    throw new Error('Cannot cash out in current state');
  }
  if (round.safePickCount === 0) throw new Error('Must open at least one safe chest');

  const { winAmount } = capWinAmount(round.bet, round.multiplier);
  playerBalance += winAmount;
  round.status = 'cashed_out';

  return {
    round: toPublicView(round),
    winAmount,
    winTier: getWinTier(round.multiplier),
  };
}

export function acceptBonus(roundId: string): RoundPublicView {
  const round = rounds.get(roundId);
  if (!round) throw new Error('Round not found');
  if (round.status !== 'bonus_pending') throw new Error('No bonus pending');

  round.status = 'bonus_active';
  return toPublicView(round);
}

export function declineBonus(roundId: string): CashoutResult {
  const round = rounds.get(roundId);
  if (!round) throw new Error('Round not found');
  if (round.status !== 'bonus_pending') throw new Error('No bonus pending');

  return cashOut(roundId);
}

export function pickBonusChest(roundId: string, chestIndex: number): BonusChoiceResult {
  const round = rounds.get(roundId);
  if (!round) throw new Error('Round not found');
  if (round.status !== 'bonus_active') throw new Error('Bonus not active');
  if (!round.bonusChests) throw new Error('No bonus chests');
  if (chestIndex < 0 || chestIndex >= 3) throw new Error('Invalid bonus chest');
  if (round.bonusPicked) throw new Error('Bonus already picked');

  round.bonusPicked = true;
  const result = round.bonusChests[chestIndex];
  const { multiplier, lost } = applyBonusResult(round, result);

  if (lost) {
    round.status = 'lost';
    round.multiplier = 0;
    return {
      round: toPublicView(round),
      result,
      multiplierDelta: 0,
      roundEnded: true,
      winAmount: 0,
    };
  }

  round.multiplier = multiplier;
  round.status = 'active';

  const remainingUnopened = round.chestContents.filter(
    (_, i) => !round.openedIndices.includes(i)
  );
  const onlyCurseRemains =
    remainingUnopened.length === 1 && remainingUnopened[0] === 'curse';

  if (onlyCurseRemains) {
    const { winAmount } = capWinAmount(round.bet, round.multiplier);
    playerBalance += winAmount;
    round.status = 'completed';
    return {
      round: toPublicView(round),
      result,
      multiplierDelta: result === 'small_boost' ? 0.35 : 1.2,
      roundEnded: true,
      winAmount,
      winTier: getWinTier(round.multiplier),
    };
  }

  return {
    round: toPublicView(round),
    result,
    multiplierDelta: result === 'small_boost' ? 0.35 : 1.2,
    roundEnded: false,
  };
}

export function revealRemaining(roundId: string): PublicChest[] {
  const round = rounds.get(roundId);
  if (!round) throw new Error('Round not found');
  return toPublicChests(round).map((c) => ({
    ...c,
    opened: true,
    content: round.chestContents[c.index],
  }));
}
