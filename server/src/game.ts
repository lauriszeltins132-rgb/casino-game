import { randomBytes } from 'crypto';
import {
  BONUS_BIG_BOOST,
  BONUS_SMALL_BOOST,
  CHEST_COUNT,
  GOLDEN_KEY_CHANCE,
  MAX_WIN_MULTIPLIER,
  MULTIPLIER_PROGRESSION,
  TARGET_RTP,
  type BonusChestResult,
  type ChestContent,
  type RiskMode,
  type RoundState,
  type WinTier,
} from './types.js';

/** Cryptographically secure random float in [0, 1). */
export function secureRandom(): number {
  const buf = randomBytes(4);
  return buf.readUInt32BE(0) / 0x100000000;
}

export function secureRandomInt(max: number): number {
  return Math.floor(secureRandom() * max);
}

/** Fisher-Yates shuffle using secure randomness. */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate chest layout server-side. Contents are never sent to client until revealed.
 * RTP is controlled via multiplier tables, golden key frequency, and bonus odds.
 */
export function generateChestLayout(riskMode: RiskMode): ChestContent[] {
  const contents: ChestContent[] = new Array(CHEST_COUNT).fill('treasure');
  contents[0] = 'curse';

  const hasGoldenKey = secureRandom() < GOLDEN_KEY_CHANCE[riskMode];
  if (hasGoldenKey) {
    const treasureSlots = contents
      .map((c, i) => (c === 'treasure' ? i : -1))
      .filter((i) => i >= 0);
    const keySlot = treasureSlots[secureRandomInt(treasureSlots.length)];
    contents[keySlot] = 'golden_key';
  }

  return shuffle(contents);
}

export function generateBonusChests(): BonusChestResult[] {
  const chests: BonusChestResult[] = ['small_boost', 'big_boost', 'curse'];
  return shuffle(chests);
}

export function getMultiplierForSafePicks(riskMode: RiskMode, safePickCount: number): number {
  const progression = MULTIPLIER_PROGRESSION[riskMode];
  const index = Math.min(safePickCount, progression.length) - 1;
  return index >= 0 ? progression[index] : 1;
}

export function capWinAmount(bet: number, multiplier: number): { multiplier: number; winAmount: number } {
  const rawWin = bet * multiplier;
  const maxWin = bet * MAX_WIN_MULTIPLIER;
  if (rawWin > maxWin) {
    return { multiplier: MAX_WIN_MULTIPLIER, winAmount: maxWin };
  }
  return { multiplier, winAmount: rawWin };
}

export function getWinTier(multiplier: number): WinTier {
  if (multiplier >= 5) return 'epic';
  if (multiplier >= 2.5) return 'big';
  return 'nice';
}

export function applyBonusResult(
  round: RoundState,
  result: BonusChestResult
): { multiplier: number; lost: boolean } {
  switch (result) {
    case 'small_boost':
      return { multiplier: round.multiplier + BONUS_SMALL_BOOST, lost: false };
    case 'big_boost':
      return { multiplier: round.multiplier + BONUS_BIG_BOOST, lost: false };
    case 'curse':
      return { multiplier: 0, lost: true };
  }
}

/**
 * RTP placeholder documentation.
 * Production would run Monte Carlo simulation to tune progression tables.
 * Current config targets ~96% via:
 * - 1 curse in 5 chests (20% instant loss on random pick if no cashout strategy)
 * - Escalating multipliers reward early cashout discipline
 * - Golden key bonus EV balanced by curse chest in bonus round
 */
export function getRtpInfo() {
  return {
    targetRtp: TARGET_RTP,
    maxWinMultiplier: MAX_WIN_MULTIPLIER,
    chestCount: CHEST_COUNT,
    note: 'RTP enforced server-side. Client cannot influence chest placement.',
  };
}
