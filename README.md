# Kraken's Treasure

A portfolio-quality casino slot demo — 5×3 reels, 20 paylines, Kraken's Lair bonus, bonus buy, and server-side ~96% RTP math.

## Quick Start

```bash
npm install
npm run dev
```

- **Client:** http://localhost:5173
- **Server:** http://localhost:3001

Demo balance: **$10,000**

## Game Features

| Feature | Details |
|---------|---------|
| Grid | 5 reels × 3 rows |
| Paylines | 20 fixed lines |
| Bets | $0.20 · $0.50 · $1 · $2 · $5 · $10 · $25 |
| RTP | ~96% (server-side reel strips) |
| Volatility | Medium-high |
| Wild | Kraken Tentacle (substitutes all except scatter) |
| Scatter | Kraken Eye — 3 = small pay, 4+ = Kraken's Lair bonus |
| Bonus Buy | 100× bet — instant bonus trigger |
| Auto Spin | 50 spins |

## Kraken's Lair Bonus

- 15 treasure chests, 10 picks
- Outcomes: gold coins, multipliers (×2–×10), extra picks, ancient relics, jackpot chests
- **Kraken Rage meter** — fill it for ×2 / ×5 / ×10 prize multipliers
- Collect 3+ relics for extra bonus at end

## Project Structure

```
client/src/
  assets/symbols/     SVG casino symbol illustrations
  audio/              Sound manager (placeholder hooks)
  components/         HUD, ReelGrid, Controls, Bonus, Paytable, WinEffects
  gameLogic/          API client, helpers
  types/              TypeScript definitions
  styles/             Global + app styles

server/src/
  math/               Reel strips, paylines, config
  rng/                Provably-fair RNG (server seed hash + nonce)
  gameLogic/          SlotEngine — spins, bonus, balance
  types/              Server types
```

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/slot/config` | Paytable, lines, bet options |
| `POST /api/slot/spin` | Spin `{ bet }` |
| `POST /api/slot/bonus-buy` | Buy bonus `{ bet }` |
| `POST /api/bonus/pick` | Pick chest `{ bonusId, chestIndex }` |
| `GET /api/slot/fair` | Provably fair state (seed hash, nonce) |

## Provably Fair (Placeholder)

Server generates `serverSeed`, exposes `sha256(serverSeed)` before spins. Each outcome uses `hash(serverSeed:clientSeed:nonce)`. Backend verification not wired yet — structure is in place.

## Sound

Audio hooks in `client/src/audio/AudioManager.ts`. Drop MP3 files in `client/public/audio/` to enable.
