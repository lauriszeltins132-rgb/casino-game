import type { BonusBuyTier, GameConfig, SpinResult } from '../types';

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
  getConfig: () => request<GameConfig>('/slot/config'),
  getBalance: () => request<{ balance: number }>('/balance'),
  resetDemo: () => request<{ balance: number }>('/balance/demo', { method: 'POST' }),
  spin: (bet: number, sessionId?: string) =>
    request<SpinResult>('/slot/spin', {
      method: 'POST',
      body: JSON.stringify({ bet, sessionId }),
    }),
  bonusBuy: (bet: number, tier: BonusBuyTier) =>
    request<SpinResult>('/slot/bonus-buy', {
      method: 'POST',
      body: JSON.stringify({ bet, tier }),
    }),
};
