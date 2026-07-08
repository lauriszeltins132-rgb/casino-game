import type { SymbolId } from '../types';

/** Raster asset paths — files optional; SVG placeholders used when missing */
export const GAME_ASSETS = {
  background: '/assets/background.webp',
  backgroundFallback: '/assets/background.png',
  reelFrame: '/assets/reel-frame.webp',
  reelFrameFallback: '/assets/reel-frame.png',
  heroKraken: '/assets/hero-kraken.webp',
  heroKrakenFallback: '/assets/hero-kraken.png',
} as const;

export const SYMBOL_ASSETS: Record<SymbolId, string> = {
  rope: '/assets/symbols/rope.webp',
  barnacle: '/assets/symbols/barnacle.webp',
  anchor_chain: '/assets/symbols/anchor_chain.webp',
  wheel: '/assets/symbols/wheel.webp',
  compass: '/assets/symbols/compass.webp',
  spyglass: '/assets/symbols/spyglass.webp',
  map: '/assets/symbols/map.webp',
  bell: '/assets/symbols/bell.webp',
  skull: '/assets/symbols/skull.webp',
  crown: '/assets/symbols/crown.webp',
  chest: '/assets/symbols/chest.webp',
  wild: '/assets/symbols/wild.webp',
  scatter: '/assets/symbols/scatter.webp',
};

/** PNG fallbacks if WebP not exported */
export const SYMBOL_ASSETS_PNG: Record<SymbolId, string> = {
  rope: '/assets/symbols/rope.png',
  barnacle: '/assets/symbols/barnacle.png',
  anchor_chain: '/assets/symbols/anchor_chain.png',
  wheel: '/assets/symbols/wheel.png',
  compass: '/assets/symbols/compass.png',
  spyglass: '/assets/symbols/spyglass.png',
  map: '/assets/symbols/map.png',
  bell: '/assets/symbols/bell.png',
  skull: '/assets/symbols/skull.png',
  crown: '/assets/symbols/crown.png',
  chest: '/assets/symbols/chest.png',
  wild: '/assets/symbols/wild.png',
  scatter: '/assets/symbols/scatter.png',
};

export function symbolAssetSources(id: SymbolId): string[] {
  return [SYMBOL_ASSETS[id], SYMBOL_ASSETS_PNG[id]];
}
