# Pirate's Bounty — Slot Game

A pirate-themed 5-reel, 10-line video slot with real spins, bet sizing, free spins, and bonus buy. Server-side math targets ~96% RTP.

## Quick Start

```bash
npm install
npm run dev
```

- **Client:** http://localhost:5173
- **Server API:** http://localhost:3001

## Features

- **5×3 reel grid** with 10 fixed paylines
- **Spin button** with staggered reel-stop animations
- **Bet per line** presets + / − adjust (€0.10 – €10.00 per line)
- **Total bet** = bet per line × 10 lines
- **Free spins** — 3+ scatters award 10 free spins (2× multiplier)
- **Bonus buy** — pay 100× total bet to instantly trigger free spins
- **Server-side RTP** (~96% target) with weighted reel strips
- **Pirate theme** — coins, anchors, captains, ships, kraken wilds, diamond scatters

## Symbols & Pays (per line bet)

| Symbol | 3 | 4 | 5 |
|--------|---|---|---|
| 🪙⚓🧭 (low) | 0.4–0.5× | 0.8–1× | 2–2.5× |
| 🦜🗺️ (mid) | 0.8–1× | 2–2.5× | 4–5× |
| 🏴‍☠️⛵ (high) | 1.5–2× | 4–5× | 10–12× |
| 🐙 Wild | 3× | 8× | 20× |
| 💎 Scatter | 2× total bet (3) / 10× (4) / 50× (5) + free spins |

## Architecture

```
client/   React + Vite — reel animations, bet controls, bonus buy UI
server/   Express — reel strips, payline evaluation, RTP logic, sessions
```

All outcomes are determined server-side. The client only displays results.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/slot/config` | Paytable, lines, bet limits |
| POST | `/api/slot/spin` | Spin reels `{ betPerLine, sessionId? }` |
| POST | `/api/slot/bonus-buy` | Buy free spins `{ betPerLine }` |

Demo balance: €1000 — reset via `POST /api/balance/demo`
