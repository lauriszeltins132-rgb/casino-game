# Kraken's Lair

Premium 5×3, 20-payline casino slot demo — deep-sea horror atmosphere, Kraken's Fury free spins with Ink Orbs, and three-tier bonus buy.

## Run

```bash
npm install
npm run dev
```

Client: http://localhost:5173 · API: http://localhost:3001 · Demo balance: **$10,000**

## Features

- **20 paylines** · per-line-bet paytable · ~96% RTP target (medium-high vol)
- **PixiJS WebGL** parallax ocean (ships, tentacles, bubbles, lightning)
- **Anticipation hold** when 2+ scatters on reels 1–3
- **Kraken's Fury** free spins — Ink Orbs (2x–50x) multiply winning spins
- **Bonus Buy** — Awaken (75x) · Fury (150x) · Leviathan (400x)
- **Autoplay** with spin count, loss limit, win limit
- **Payline trace** animation · odometer win counter · reality check at 15 min
- **Provably-fair** RNG structure (server seed hash + nonce)

## Symbols

Low: Rope Coil, Barnacle, Anchor Chain, Ship's Wheel  
Mid: Brass Compass, Spyglass, Treasure Map, Ship's Bell  
High: Golden Idol Skull, Sunken Crown, Treasure Chest  
Wild: Kraken's Eye (reels 2–4) · Scatter: The Kraken

## Math & Calibration

**Target RTP:** 96.00% · **Measured:** ~95.97% (Monte Carlo, `tools/kraken_sim.py`)

| Run | Spins | RTP | Hit freq | FS trigger | Max win |
|-----|-------|-----|----------|------------|---------|
| 1 | 2M | 96.35% | 26.3% | 1/232 | 1,525× |
| 2 | 3M | 95.70% | 28.9% | 1/229 | 2,702× |
| 3 | 4M | 95.87% | 27.0% | 1/227 | 4,612× |

Paytable values are **design ratios × 75** (calibrated in `tools/kraken_sim.py` and `server/src/math/calibrated.ts`). Scatter thinned to **1 copy per reel**. Do not use numbers from the first math-model doc.

```bash
python3 tools/kraken_sim.py   # base-game + bonus-buy RTP pass
curl http://localhost:3001/api/slot/calibration
```

**Caveats (pre-certification):**
- Design calibration only — GLI/iTech/BMM require 50–100M+ spins
- Bonus-buy tiers (75× / 150× / 400×) need separate RTP parity simulation
- `kraken_sim.py` is a calibration tool; production uses certified server-side RNG with the same math

## Structure

```
client/src/   components, assets/symbols (SVG), gameLogic, audio, PixiJS scene
server/src/   math, rng, gameLogic/SlotEngine
```
