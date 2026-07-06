import { v4 as uuidv4 } from 'uuid';
import {
  BASE_REEL_STRIPS,
  FREE_SPIN_REEL_STRIPS,
  generateBonusBuyGrid,
  spinReels,
} from './reels.js';
import { evaluateGrid, getFreeSpinMultiplier, getFreeSpinsAwarded } from './paylines.js';
import {
  BONUS_BUY_COST_MULTIPLIER,
  LINE_COUNT,
  PAYLINES,
  PAYTABLE,
  SCATTER_PAY,
  SYMBOLS,
  TARGET_RTP,
  FREE_SPINS_AWARD,
  FREE_SPIN_MULTIPLIER,
  type FreeSpinSession,
  type SlotConfig,
  type SpinResponse,
  type SymbolId,
} from './types.js';

let playerBalance = 1000;
const freeSpinSessions = new Map<string, FreeSpinSession>();

const MIN_BET_PER_LINE = 0.1;
const MAX_BET_PER_LINE = 10;
const BET_PRESETS = [0.1, 0.2, 0.5, 1, 2, 5, 10];

export function getBalance(): number {
  return playerBalance;
}

export function setBalance(amount: number): void {
  playerBalance = amount;
}

export function getConfig(): SlotConfig {
  return {
    symbols: Object.values(SYMBOLS),
    paytable: PAYTABLE,
    paylines: PAYLINES,
    lineCount: LINE_COUNT,
    scatterPay: SCATTER_PAY,
    freeSpinsAward: FREE_SPINS_AWARD,
    freeSpinMultiplier: FREE_SPIN_MULTIPLIER,
    bonusBuyCostMultiplier: BONUS_BUY_COST_MULTIPLIER,
    targetRtp: TARGET_RTP,
    minBetPerLine: MIN_BET_PER_LINE,
    maxBetPerLine: MAX_BET_PER_LINE,
    betPresets: BET_PRESETS,
  };
}

function validateBet(betPerLine: number): void {
  if (betPerLine < MIN_BET_PER_LINE || betPerLine > MAX_BET_PER_LINE) {
    throw new Error(`Bet per line must be between €${MIN_BET_PER_LINE} and €${MAX_BET_PER_LINE}`);
  }
}

function buildResponse(
  grid: SymbolId[][],
  betPerLine: number,
  totalWin: number,
  lineWins: SpinResponse['lineWins'],
  scatterCount: number,
  scatterPayout: number,
  linePayout: number,
  freeSpinsAwarded: number,
  isFreeSpin: boolean,
  freeSpinSession: FreeSpinSession | null,
  isBonusBuy: boolean
): SpinResponse {
  const activeSession =
    freeSpinSession && freeSpinSession.remaining > 0 ? freeSpinSession : null;

  return {
    grid,
    lineWins,
    scatterCount,
    scatterPayout,
    linePayout,
    totalWin,
    freeSpinsAwarded,
    freeSpinsRemaining: activeSession?.remaining ?? 0,
    freeSpinSessionId: activeSession?.id ?? null,
    freeSpinSessionTotalWin: freeSpinSession?.totalWin ?? 0,
    balance: playerBalance,
    bet: isFreeSpin ? 0 : betPerLine * LINE_COUNT,
    isFreeSpin,
    isBonusBuy,
  };
}

export function spin(betPerLine: number, sessionId?: string): SpinResponse {
  validateBet(betPerLine);

  let session = sessionId ? freeSpinSessions.get(sessionId) ?? null : null;
  const isFreeSpin = session !== null && session.remaining > 0;

  if (!isFreeSpin) {
    const totalBet = betPerLine * LINE_COUNT;
    if (totalBet > playerBalance) throw new Error('Insufficient balance');
    playerBalance -= totalBet;
  } else {
    betPerLine = session!.betPerLine;
    session!.remaining -= 1;
  }

  const strips = isFreeSpin ? FREE_SPIN_REEL_STRIPS : BASE_REEL_STRIPS;
  const grid = spinReels(strips);
  const multiplier = isFreeSpin ? getFreeSpinMultiplier() : 1;
  const result = evaluateGrid(grid, betPerLine, multiplier);

  playerBalance += result.totalWin;

  let freeSpinsAwarded = 0;
  if (!isFreeSpin && result.scatterCount >= 3) {
    freeSpinsAwarded = getFreeSpinsAwarded(result.scatterCount);
    const newSession: FreeSpinSession = {
      id: uuidv4(),
      betPerLine,
      remaining: freeSpinsAwarded,
      totalWin: 0,
    };
    freeSpinSessions.set(newSession.id, newSession);
    session = newSession;
  } else if (isFreeSpin && session) {
    session.totalWin += result.totalWin;
    if (result.scatterCount >= 3) {
      const extra = getFreeSpinsAwarded(result.scatterCount);
      session.remaining += extra;
      freeSpinsAwarded = extra;
    }
    if (session.remaining <= 0) {
      freeSpinSessions.delete(session.id);
    }
  }

  return buildResponse(
    grid,
    betPerLine,
    result.totalWin,
    result.lineWins,
    result.scatterCount,
    result.scatterPayout,
    result.linePayout,
    freeSpinsAwarded,
    isFreeSpin,
    session,
    false
  );
}

export function bonusBuy(betPerLine: number): SpinResponse {
  validateBet(betPerLine);

  const totalBet = betPerLine * LINE_COUNT;
  const cost = totalBet * BONUS_BUY_COST_MULTIPLIER;

  if (cost > playerBalance) throw new Error('Insufficient balance for bonus buy');

  playerBalance -= cost;

  const grid = generateBonusBuyGrid(BASE_REEL_STRIPS);
  const result = evaluateGrid(grid, betPerLine, 1);

  playerBalance += result.totalWin;

  const freeSpinsAwarded = getFreeSpinsAwarded(result.scatterCount);
  const session: FreeSpinSession = {
    id: uuidv4(),
    betPerLine,
    remaining: freeSpinsAwarded,
    totalWin: 0,
  };
  freeSpinSessions.set(session.id, session);

  return buildResponse(
    grid,
    betPerLine,
    result.totalWin,
    result.lineWins,
    result.scatterCount,
    result.scatterPayout,
    result.linePayout,
    freeSpinsAwarded,
    false,
    session,
    true
  );
}

export function spinFreeSession(sessionId: string): SpinResponse {
  const session = freeSpinSessions.get(sessionId);
  if (!session || session.remaining <= 0) {
    throw new Error('No active free spin session');
  }
  return spin(session.betPerLine, sessionId);
}

export function getActiveFreeSpinSession(): FreeSpinSession | null {
  for (const session of freeSpinSessions.values()) {
    if (session.remaining > 0) return session;
  }
  return null;
}
