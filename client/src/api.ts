import type {
  BonusChoiceResult,
  CashoutResult,
  PickResult,
  RiskMode,
  RoundPublicView,
} from './types';

const API = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export const api = {
  getBalance: () => request<{ balance: number }>('/balance'),

  resetDemoBalance: () =>
    request<{ balance: number }>('/balance/demo', { method: 'POST' }),

  startRound: (bet: number, riskMode: RiskMode) =>
    request<RoundPublicView>('/round/start', {
      method: 'POST',
      body: JSON.stringify({ bet, riskMode }),
    }),

  pickChest: (roundId: string, chestIndex: number) =>
    request<PickResult>('/round/pick', {
      method: 'POST',
      body: JSON.stringify({ roundId, chestIndex }),
    }),

  cashOut: (roundId: string) =>
    request<CashoutResult>('/round/cashout', {
      method: 'POST',
      body: JSON.stringify({ roundId }),
    }),

  acceptBonus: (roundId: string) =>
    request<RoundPublicView>('/bonus/accept', {
      method: 'POST',
      body: JSON.stringify({ roundId }),
    }),

  declineBonus: (roundId: string) =>
    request<CashoutResult>('/bonus/decline', {
      method: 'POST',
      body: JSON.stringify({ roundId }),
    }),

  pickBonusChest: (roundId: string, chestIndex: number) =>
    request<BonusChoiceResult>('/bonus/pick', {
      method: 'POST',
      body: JSON.stringify({ roundId, chestIndex }),
    }),

  revealRemaining: (roundId: string) =>
    request<{ chests: RoundPublicView['chests'] }>('/round/reveal', {
      method: 'POST',
      body: JSON.stringify({ roundId }),
    }),
};
