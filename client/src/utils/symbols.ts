import type { SymbolId, SymbolInfo } from '../types';

export const SYMBOL_EMOJI: Record<SymbolId, string> = {
  coin: '🪙',
  anchor: '⚓',
  compass: '🧭',
  parrot: '🦜',
  map: '🗺️',
  captain: '🏴‍☠️',
  ship: '⛵',
  wild: '🐙',
  scatter: '💎',
};

export function getSymbolEmoji(id: SymbolId, symbols?: SymbolInfo[]): string {
  return symbols?.find((s) => s.id === id)?.emoji ?? SYMBOL_EMOJI[id];
}

export function formatMoney(amount: number): string {
  return `€${amount.toFixed(2)}`;
}
