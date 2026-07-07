import { v4 as uuidv4 } from 'uuid';
import {
  advanceNonce,
  createProvablyFairState,
  fairRandomInt,
} from '../rng/provablyFair.js';
import type { ProvablyFairState } from '../types/index.js';
import { generateBonusBuyGrid, spinReels } from '../math/reels.js';
import { evaluateGrid } from '../math/paylines.js';
import {
  BONUS_BUY_MULTIPLIER,
  BONUS_CHEST_COUNT,
  BONUS_PICKS,
  BET_OPTIONS,
  DEMO_BALANCE,
  LINE_COUNT,
  PAYLINES,
  PAYTABLE,
  SCATTER_BONUS_TRIGGER,
  SCATTER_PAY,
  TARGET_RTP,
  RAGE_MULTIPLIERS,
  RAGE_THRESHOLDS,
} from '../math/config.js';
import type {
  BonusChestOutcome,
  BonusPickResult,
  BonusState,
  GameConfig,
  SpinResult,
  SymbolId,
} from '../types/index.js';

let balance = DEMO_BALANCE;
let pfState: ProvablyFairState = createProvablyFairState();
const activeBonuses = new Map<string, BonusState>();

const CHEST_OUTCOME_WEIGHTS: [BonusChestOutcome, number][] = [
  ['gold_coins', 35],
  ['multiplier_x2', 18],
  ['multiplier_x3', 12],
  ['multiplier_x5', 6],
  ['kraken_rage', 10],
  ['ancient_relic', 12],
  ['multiplier_x10', 3],
  ['jackpot', 4],
];

function weightedOutcome(pf: ProvablyFairState): { outcome: BonusChestOutcome; nonce: number } {
  const total = CHEST_OUTCOME_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  const r = fairRandomInt(pf, total);
  advanceNonce(pf, r.nonce);
  let cumulative = 0;
  for (const [outcome, weight] of CHEST_OUTCOME_WEIGHTS) {
    cumulative += weight;
    if (r.value < cumulative) return { outcome, nonce: r.nonce };
  }
  return { outcome: 'gold_coins', nonce: r.nonce };
}

function shuffleIndices(pf: ProvablyFairState, count: number): number[] {
  const arr = Array.from({ length: count }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const r = fairRandomInt(pf, i + 1);
    advanceNonce(pf, r.nonce);
    [arr[i], arr[r.value]] = [arr[r.value], arr[i]];
  }
  return arr;
}

function createBonus(bet: number): BonusState {
  const outcomes: BonusChestOutcome[] = [];
  for (let i = 0; i < BONUS_CHEST_COUNT; i++) {
    const { outcome, nonce } = weightedOutcome(pfState);
    outcomes.push(outcome);
  }

  const shuffled = shuffleIndices(pfState, BONUS_CHEST_COUNT);
  const chests = shuffled.map((originalIndex, displayIndex) => ({
    index: displayIndex,
    picked: false,
    outcome: outcomes[originalIndex],
  }));

  return {
    id: uuidv4(),
    bet,
    chests,
    picksRemaining: BONUS_PICKS,
    totalPicks: BONUS_PICKS,
    rageMeter: 0,
    rageLevel: 0,
    rageMultiplier: 1,
    relicsCollected: 0,
    totalWin: 0,
    activeMultiplier: 1,
    completed: false,
  };
}

function getRageLevel(meter: number): number {
  if (meter >= RAGE_THRESHOLDS[2]) return 3;
  if (meter >= RAGE_THRESHOLDS[1]) return 2;
  if (meter >= RAGE_THRESHOLDS[0]) return 1;
  return 0;
}

function fairBonusValue(pf: ProvablyFairState, min: number, max: number): number {
  const r = fairRandomInt(pf, max - min + 1);
  advanceNonce(pf, r.nonce);
  return min + r.value;
}

function resolveChestPayoutFair(
  outcome: BonusChestOutcome,
  bet: number,
  rageMultiplier: number,
  activeMultiplier: number,
  pf: ProvablyFairState
): { payout: number; extraPicks: number; newActiveMultiplier: number; relics: number; nonce: number } {
  const mult = rageMultiplier * activeMultiplier;
  let lastNonce = pf.nonce;

  switch (outcome) {
    case 'gold_coins': {
      const v = fairBonusValue(pf, 50, 300) / 100;
      lastNonce = pf.nonce;
      return { payout: bet * v * mult, extraPicks: 0, newActiveMultiplier: activeMultiplier, relics: 0, nonce: lastNonce };
    }
    case 'multiplier_x2':
      return { payout: bet * 1 * mult, extraPicks: 0, newActiveMultiplier: activeMultiplier * 2, relics: 0, nonce: pf.nonce };
    case 'multiplier_x3':
      return { payout: bet * 2 * mult, extraPicks: 0, newActiveMultiplier: activeMultiplier * 3, relics: 0, nonce: pf.nonce };
    case 'multiplier_x5':
      return { payout: bet * 4 * mult, extraPicks: 0, newActiveMultiplier: activeMultiplier * 5, relics: 0, nonce: pf.nonce };
    case 'multiplier_x10':
      return { payout: bet * 8 * mult, extraPicks: 0, newActiveMultiplier: activeMultiplier * 10, relics: 0, nonce: pf.nonce };
    case 'kraken_rage':
      return { payout: bet * 0.5 * mult, extraPicks: 2, newActiveMultiplier: activeMultiplier, relics: 0, nonce: pf.nonce };
    case 'ancient_relic':
      return { payout: bet * 1.5 * mult, extraPicks: 0, newActiveMultiplier: activeMultiplier, relics: 1, nonce: pf.nonce };
    case 'jackpot': {
      const v = fairBonusValue(pf, 20, 100);
      lastNonce = pf.nonce;
      return { payout: bet * v * mult, extraPicks: 0, newActiveMultiplier: activeMultiplier, relics: 0, nonce: lastNonce };
    }
  }
}

export function getBalance(): number {
  return balance;
}

export function setBalance(amount: number): void {
  balance = amount;
}

export function resetDemo(): void {
  balance = DEMO_BALANCE;
  pfState = createProvablyFairState();
  activeBonuses.clear();
}

export function getConfig(): GameConfig {
  return {
    paylines: PAYLINES,
    lineCount: LINE_COUNT,
    reelCount: 5,
    rowCount: 3,
    symbols: [
      { id: 'crown', name: 'Kraken Crown', tier: 'high' },
      { id: 'trident', name: 'Ancient Trident', tier: 'high' },
      { id: 'chest', name: 'Treasure Chest', tier: 'high' },
      { id: 'pearl', name: 'Diamond Pearl', tier: 'high' },
      { id: 'anchor', name: 'Silver Anchor', tier: 'low' },
      { id: 'compass', name: 'Pirate Compass', tier: 'low' },
      { id: 'map', name: 'Ancient Map', tier: 'low' },
      { id: 'coin', name: 'Golden Coin', tier: 'low' },
      { id: 'wild', name: 'Kraken Tentacle', tier: 'special' },
      { id: 'scatter', name: 'Kraken Eye', tier: 'special' },
    ],
    paytable: PAYTABLE,
    scatterPay: SCATTER_PAY,
    scatterBonusTrigger: SCATTER_BONUS_TRIGGER,
    bonusBuyMultiplier: BONUS_BUY_MULTIPLIER,
    targetRtp: TARGET_RTP,
    volatility: 'medium-high',
    betOptions: BET_OPTIONS,
    demoBalance: DEMO_BALANCE,
    bonusPicks: BONUS_PICKS,
    bonusChestCount: BONUS_CHEST_COUNT,
  };
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

function buildSpinResult(
  grid: SymbolId[][],
  bet: number,
  nonce: number,
  bonusId?: string
): SpinResult & { bonusId?: string } {
  const eval_ = evaluateGrid(grid, bet);
  balance += eval_.totalWin;

  let bonusIdOut = bonusId;
  if (eval_.bonusTriggered && !bonusId) {
    const bonus = createBonus(bet);
    activeBonuses.set(bonus.id, bonus);
    bonusIdOut = bonus.id;
  }

  return {
    grid,
    lineWins: eval_.lineWins,
    scatterCount: eval_.scatterCount,
    scatterPayout: eval_.scatterPayout,
    linePayout: eval_.linePayout,
    totalWin: eval_.totalWin,
    bonusTriggered: eval_.bonusTriggered,
    balance,
    bet,
    nonce,
    serverSeedHash: pfState.serverSeedHash,
    clientSeed: pfState.clientSeed,
    bonusId: bonusIdOut,
  };
}

export function spin(bet: number): SpinResult & { bonusId?: string } {
  if (!BET_OPTIONS.includes(bet)) throw new Error('Invalid bet amount');
  if (bet > balance) throw new Error('Insufficient balance');

  balance -= bet;
  const { grid, nonce } = spinReels(pfState);
  return buildSpinResult(grid, bet, nonce);
}

export function bonusBuy(bet: number): SpinResult & { bonusId?: string } {
  if (!BET_OPTIONS.includes(bet)) throw new Error('Invalid bet amount');
  const cost = bet * BONUS_BUY_MULTIPLIER;
  if (cost > balance) throw new Error('Insufficient balance for bonus buy');

  balance -= cost;
  const { grid, nonce } = generateBonusBuyGrid(pfState);
  return buildSpinResult(grid, bet, nonce);
}

export function getBonus(id: string): BonusState | undefined {
  return activeBonuses.get(id);
}

export function pickBonusChest(bonusId: string, chestIndex: number): BonusPickResult {
  const bonus = activeBonuses.get(bonusId);
  if (!bonus) throw new Error('Bonus not found');
  if (bonus.completed) throw new Error('Bonus already completed');
  if (bonus.picksRemaining <= 0) throw new Error('No picks remaining');
  if (chestIndex < 0 || chestIndex >= bonus.chests.length) throw new Error('Invalid chest');
  const chest = bonus.chests[chestIndex];
  if (chest.picked) throw new Error('Chest already picked');

  chest.picked = true;
  bonus.picksRemaining -= 1;
  bonus.rageMeter += 1;

  const prevLevel = bonus.rageLevel;
  bonus.rageLevel = getRageLevel(bonus.rageMeter);
  bonus.rageMultiplier = bonus.rageLevel > 0 ? RAGE_MULTIPLIERS[bonus.rageLevel - 1] : 1;

  const outcome = chest.outcome!;
  const resolved = resolveChestPayoutFair(
    outcome,
    bonus.bet,
    bonus.rageMultiplier,
    bonus.activeMultiplier,
    pfState
  );

  bonus.activeMultiplier = resolved.newActiveMultiplier;
  bonus.relicsCollected += resolved.relics;
  bonus.picksRemaining += resolved.extraPicks;
  chest.payout = resolved.payout;
  bonus.totalWin += resolved.payout;
  balance += resolved.payout;

  if (bonus.picksRemaining <= 0) {
    bonus.completed = true;
    // Relic collection bonus
    if (bonus.relicsCollected >= 3) {
      const relicBonus = bonus.bet * 10 * bonus.relicsCollected;
      bonus.totalWin += relicBonus;
      balance += relicBonus;
    }
  }

  return {
    bonus: { ...bonus, chests: bonus.chests.map((c) => ({ ...c })) },
    outcome,
    payout: resolved.payout,
    balance,
    rageLevelUp: bonus.rageLevel > prevLevel,
    extraPicks: resolved.extraPicks,
  };
}

// resolveChestPayoutFair used instead of resolveChestPayout
