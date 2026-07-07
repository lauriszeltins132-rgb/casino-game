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

## Math Note

96% RTP is a **design target** requiring Monte Carlo validation (millions of spins) and independent certification (GLI/iTech/BMM) before real-money launch.

## Structure

```
client/src/   components, assets/symbols (SVG), gameLogic, audio, PixiJS scene
server/src/   math, rng, gameLogic/SlotEngine
```
