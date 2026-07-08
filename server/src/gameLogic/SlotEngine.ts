import { v4 as uuidv4 } from 'uuid';
import {
  advanceNonce,
  createProvablyFairState,
  fairRandomInt,
} from '../rng/provablyFair.js';
import {
  BASE_REEL_STRIPS,
  generateBonusBuyGrid,
  generateInkOrbs,
  spinReels,
} from '../math/reels.js';
import { evaluateGrid } from '../math/paylines.js';
import {
  BONUS_BUY_TIERS,
  BET_OPTIONS,
  DEMO_BALANCE,
  LINE_COUNT,
  MAX_FREE_SPINS,
  MAX_WIN_MULTIPLIER,
  ORB_COUNT_WEIGHTS,
  ORB_DROP_CHANCE,
  PAYLINES,
  PAYTABLE,
  SCATTER_AWARDS,
  TARGET_RTP,
  HIT_FREQUENCY,
  FS_TRIGGER_RATE,
} from '../math/config.js';
import type {
  BonusBuyTier,
  FreeSpinState,
  GameConfig,
  InkOrb,
  ProvablyFairState,
  SpinResult,
  SymbolId,
} from '../types/index.js';

interface FreeSpinSession {
  id: string;
  totalBet: number;
  remaining: number;
  totalAwarded: number;
  sessionWin: number;
  orbWeightTier: 'standard' | 'premium';
  seededOrbsRemaining: InkOrb[];
  spinNumber: number;
}

let balance = DEMO_BALANCE;
let pfState: ProvablyFairState = createProvablyFairState();
const fsSessions = new Map<string, FreeSpinSession>();

export function getBalance(): number {
  return balance;
}

export function resetDemo(): void {
  balance = DEMO_BALANCE;
  pfState = createProvablyFairState();
  fsSessions.clear();
}

export function getProvablyFair() {
  return {
    serverSeedHash: pfState.serverSeedHash,
    clientSeed: pfState.clientSeed,
    nonce: pfState.nonce,
  };
}

export function setClientSeed(seed: string): void {
  pfState.clientSeed = seed;
}

export function getConfig(): GameConfig {
  return {
    paylines: PAYLINES,
    lineCount: LINE_COUNT,
    symbols: [
      { id: 'rope', name: 'Rope Coil', tier: 'low' },
      { id: 'barnacle', name: 'Barnacle Cluster', tier: 'low' },
      { id: 'anchor_chain', name: 'Anchor Chain', tier: 'low' },
      { id: 'wheel', name: "Ship's Wheel", tier: 'low' },
      { id: 'compass', name: 'Brass Compass', tier: 'mid' },
      { id: 'spyglass', name: 'Spyglass', tier: 'mid' },
      { id: 'map', name: 'Treasure Map', tier: 'mid' },
      { id: 'bell', name: "Ship's Bell", tier: 'mid' },
      { id: 'skull', name: 'Golden Idol Skull', tier: 'high' },
      { id: 'crown', name: 'Sunken Crown', tier: 'high' },
      { id: 'chest', name: 'Treasure Chest', tier: 'high' },
      { id: 'wild', name: "Kraken's Eye", tier: 'special' },
      { id: 'scatter', name: 'The Kraken', tier: 'special' },
    ],
    paytable: PAYTABLE,
    scatterAwards: SCATTER_AWARDS,
    bonusBuyTiers: BONUS_BUY_TIERS.map((t) => ({
      id: t.id,
      name: t.name,
      costMultiplier: t.costMultiplier,
      spins: t.spins,
      seededOrbs: t.seededOrbs,
      description: t.description,
    })),
    targetRtp: TARGET_RTP,
    hitFrequency: HIT_FREQUENCY,
    fsTriggerRate: FS_TRIGGER_RATE,
    volatility: 'medium-high',
    betOptions: BET_OPTIONS,
    demoBalance: DEMO_BALANCE,
    maxFreeSpins: MAX_FREE_SPINS,
    maxWinMultiplier: MAX_WIN_MULTIPLIER,
  };
}

function capWin(totalBet: number, win: number): number {
  return Math.min(win, totalBet * MAX_WIN_MULTIPLIER);
}

function toFreeSpinState(session: FreeSpinSession): FreeSpinState {
  return {
    sessionId: session.id,
    remaining: session.remaining,
    totalAwarded: session.totalAwarded,
    sessionWin: session.sessionWin,
    retriggered: 0,
  };
}

function rollOrbDrop(pf: ProvablyFairState): boolean {
  const r = fairRandomInt(pf, 1000);
  advanceNonce(pf, r.nonce);
  return r.value < ORB_DROP_CHANCE * 1000;
}

function rollOrbCount(pf: ProvablyFairState): number {
  const total = ORB_COUNT_WEIGHTS.reduce((a, b) => a + b, 0);
  const r = fairRandomInt(pf, total);
  advanceNonce(pf, r.nonce);
  let cum = 0;
  for (let i = 0; i < ORB_COUNT_WEIGHTS.length; i++) {
    cum += ORB_COUNT_WEIGHTS[i];
    if (r.value < cum) return i + 1;
  }
  return 1;
}

function applyInkOrbs(baseWin: number, orbs: InkOrb[], isFreeSpin: boolean) {
  if (!isFreeSpin || baseWin <= 0 || orbs.length === 0) {
    return { totalWin: baseWin, orbMultiplier: 1 };
  }
  const orbSum = orbs.reduce((s, o) => s + o.value, 0);
  return { totalWin: baseWin * orbSum, orbMultiplier: orbSum };
}

function buildResult(
  grid: SymbolId[][],
  totalBet: number,
  nonce: number,
  isFreeSpin: boolean,
  session: FreeSpinSession | null,
  betDeducted: number
): SpinResult {
  const eval_ = evaluateGrid(grid, totalBet);
  let inkOrbs: InkOrb[] = [];

  if (isFreeSpin && session) {
    session.spinNumber++;

    if (session.seededOrbsRemaining.length > 0 && session.spinNumber === 1) {
      inkOrbs = [...session.seededOrbsRemaining];
      session.seededOrbsRemaining = [];
    }

    if (eval_.linePayout > 0 && rollOrbDrop(pfState)) {
      const count = rollOrbCount(pfState);
      const occupied = new Set(inkOrbs.map((o) => `${o.row}-${o.col}`));
      const { orbs, nonce: n } = generateInkOrbs(
        pfState,
        count,
        session.orbWeightTier === 'premium',
        occupied
      );
      inkOrbs = [...inkOrbs, ...orbs];
      advanceNonce(pfState, n);
    }
  }

  const { totalWin: rawWin, orbMultiplier } = applyInkOrbs(
    eval_.baseWin,
    inkOrbs,
    isFreeSpin
  );
  const totalWin = capWin(totalBet, rawWin);
  balance += totalWin;

  let freeSpinsAwarded = 0;
  let freeSpinState: FreeSpinState | null = session ? toFreeSpinState(session) : null;

  if (!isFreeSpin && eval_.freeSpinsAwarded > 0) {
    freeSpinsAwarded = eval_.freeSpinsAwarded;
    const newSession: FreeSpinSession = {
      id: uuidv4(),
      totalBet,
      remaining: eval_.freeSpinsAwarded,
      totalAwarded: eval_.freeSpinsAwarded,
      sessionWin: 0,
      orbWeightTier: 'standard',
      seededOrbsRemaining: [],
      spinNumber: 0,
    };
    fsSessions.set(newSession.id, newSession);
    freeSpinState = toFreeSpinState(newSession);
  } else if (isFreeSpin && session) {
    session.sessionWin += totalWin;

    if (eval_.scatterCount >= 2) {
      const extra = Math.min(eval_.retriggerSpins, MAX_FREE_SPINS - session.totalAwarded);
      if (extra > 0) {
        session.remaining += extra;
        session.totalAwarded += extra;
        freeSpinsAwarded = extra;
      }
    }

    if (session.remaining <= 0) {
      fsSessions.delete(session.id);
      freeSpinState = null;
    } else {
      freeSpinState = toFreeSpinState(session);
    }
  }

  return {
    grid,
    lineWins: eval_.lineWins,
    scatterCount: eval_.scatterCount,
    scatterPayout: eval_.scatterPayout,
    linePayout: eval_.linePayout,
    inkOrbs,
    orbMultiplier,
    totalWin,
    balance,
    bet: betDeducted,
    lineBet: eval_.lineBet,
    freeSpinsAwarded,
    freeSpinState,
    isFreeSpin,
    anticipation: eval_.anticipation,
    mode: isFreeSpin ? 'freespin' : 'base',
    nonce,
    serverSeedHash: pfState.serverSeedHash,
    clientSeed: pfState.clientSeed,
  };
}

export function spin(totalBet: number, sessionId?: string): SpinResult {
  if (!BET_OPTIONS.includes(totalBet)) throw new Error('Invalid bet amount');

  const session = sessionId ? fsSessions.get(sessionId) ?? null : null;
  const isFreeSpin = session !== null && session.remaining > 0;
  let betDeducted = 0;

  if (!isFreeSpin) {
    if (totalBet > balance) throw new Error('Insufficient balance');
    balance -= totalBet;
    betDeducted = totalBet;
  } else {
    totalBet = session!.totalBet;
    session!.remaining -= 1;
  }

  // Free spins use the same calibrated base strips as kraken_sim.py
  const strips = BASE_REEL_STRIPS;
  const { grid, nonce } = spinReels(pfState, strips);
  return buildResult(grid, totalBet, nonce, isFreeSpin, session, betDeducted);
}

export function bonusBuy(totalBet: number, tier: BonusBuyTier): SpinResult {
  if (!BET_OPTIONS.includes(totalBet)) throw new Error('Invalid bet amount');

  const tierConfig = BONUS_BUY_TIERS.find((t) => t.id === tier);
  if (!tierConfig) throw new Error('Invalid bonus buy tier');

  const cost = totalBet * tierConfig.costMultiplier;
  if (cost > balance) throw new Error('Insufficient balance');

  balance -= cost;

  const { grid, nonce } = generateBonusBuyGrid(pfState, 3);
  const eval_ = evaluateGrid(grid, totalBet);
  const scatterPayout = totalBet * SCATTER_AWARDS[3].payMultiplier;
  const baseWin = eval_.linePayout + scatterPayout;
  balance += baseWin;

  let seededOrbs: InkOrb[] = [];
  if (tierConfig.seededOrbs > 0) {
    const { orbs, nonce: n } = generateInkOrbs(
      pfState,
      tierConfig.seededOrbs,
      tierConfig.orbWeightTier === 'premium'
    );
    seededOrbs = orbs;
    advanceNonce(pfState, n);
  }

  const session: FreeSpinSession = {
    id: uuidv4(),
    totalBet,
    remaining: tierConfig.spins,
    totalAwarded: tierConfig.spins,
    sessionWin: baseWin,
    orbWeightTier: tierConfig.orbWeightTier,
    seededOrbsRemaining: seededOrbs,
    spinNumber: 0,
  };
  fsSessions.set(session.id, session);

  return {
    grid,
    lineWins: eval_.lineWins,
    scatterCount: 3,
    scatterPayout,
    linePayout: eval_.linePayout,
    inkOrbs: [],
    orbMultiplier: 1,
    totalWin: baseWin,
    balance,
    bet: cost,
    lineBet: totalBet / LINE_COUNT,
    freeSpinsAwarded: tierConfig.spins,
    freeSpinState: toFreeSpinState(session),
    isFreeSpin: false,
    anticipation: true,
    mode: 'base',
    nonce,
    serverSeedHash: pfState.serverSeedHash,
    clientSeed: pfState.clientSeed,
  };
}
