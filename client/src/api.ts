import type { SlotConfig, SpinResponse } from './types';

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

  getConfig: () => request<SlotConfig>('/slot/config'),

  getSession: () =>
    request<{ session: { id: string; remaining: number; totalWin: number } | null }>(
      '/slot/session'
    ),

  spin: (betPerLine: number, sessionId?: string) =>
    request<SpinResponse>('/slot/spin', {
      method: 'POST',
      body: JSON.stringify({ betPerLine, sessionId }),
    }),

  bonusBuy: (betPerLine: number) =>
    request<SpinResponse>('/slot/bonus-buy', {
      method: 'POST',
      body: JSON.stringify({ betPerLine }),
    }),
};
