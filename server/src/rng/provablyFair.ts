import { createHash, randomBytes } from 'crypto';
import type { ProvablyFairState } from '../types/index.js';

export function generateServerSeed(): string {
  return randomBytes(32).toString('hex');
}

export function hashServerSeed(seed: string): string {
  return createHash('sha256').update(seed).digest('hex');
}

export function createProvablyFairState(clientSeed?: string): ProvablyFairState {
  const serverSeed = generateServerSeed();
  return {
    serverSeed,
    serverSeedHash: hashServerSeed(serverSeed),
    clientSeed: clientSeed ?? 'demo-client-seed',
    nonce: 0,
  };
}

/**
 * Deterministic RNG from provably-fair seeds.
 * Production: client verifies hash(serverSeed) === serverSeedHash before reveal.
 */
export function fairRandom(pf: ProvablyFairState): { value: number; nonce: number } {
  const nonce = pf.nonce + 1;
  const hash = createHash('sha256')
    .update(`${pf.serverSeed}:${pf.clientSeed}:${nonce}`)
    .digest('hex');
  const value = parseInt(hash.slice(0, 8), 16) / 0x100000000;
  return { value, nonce };
}

export function fairRandomInt(pf: ProvablyFairState, max: number): { value: number; nonce: number } {
  const r = fairRandom(pf);
  return { value: Math.floor(r.value * max), nonce: r.nonce };
}

export function advanceNonce(pf: ProvablyFairState, nonce: number): void {
  pf.nonce = nonce;
}
