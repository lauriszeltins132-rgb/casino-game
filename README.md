# Cursed Chest

A fast casino instant game where players open treasure chests, build a multiplier, and cash out before triggering the curse.

**Mines + treasure hunt + cashout tension** — pick a chest, grow your multiplier, or lose it all to the curse.

## Quick Start

```bash
npm install
npm run dev
```

- **Client:** http://localhost:5173
- **Server API:** http://localhost:3001

## Game Features (v1)

- 5 treasure chests, 1 hidden curse per round
- Escalating multiplier progression after each safe pick
- Cash out anytime after a safe chest
- Golden Key bonus vault (3 special chests)
- 3 risk modes: Low / Medium / High
- Server-side RTP logic (~96% target)
- Max win cap (500× bet)
- Premium dark ocean cave theme with animations
- Mobile-friendly layout

## Architecture

```
├── client/          React + Vite frontend
├── server/          Express API with server-side game logic
└── package.json     Monorepo root
```

All chest contents, curse placement, and multipliers are determined **server-side**. The client cannot influence outcomes or exploit patterns.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/rtp` | RTP configuration info |
| GET | `/api/balance` | Player balance |
| POST | `/api/round/start` | Start new round |
| POST | `/api/round/pick` | Pick a chest |
| POST | `/api/round/cashout` | Cash out current multiplier |
| POST | `/api/bonus/accept` | Enter Golden Key bonus |
| POST | `/api/bonus/decline` | Take win, skip bonus |
| POST | `/api/bonus/pick` | Pick bonus chest |

## Risk Modes

| Mode | Multipliers (picks 1–4) | Golden Key Chance |
|------|-------------------------|-------------------|
| Low | 1.15× → 2.8× | 6% |
| Medium | 1.25× → 4.5× | 8% |
| High | 1.4× → 7× | 10% |

## Demo

Demo balance starts at €1000. Use `POST /api/balance/demo` to reset.

## Positioning

Cursed Chest is an **instant casino game**, not a slot. Simple pick-and-reveal gameplay with cashout tension, Golden Key bonus moments, and premium treasure-themed animations.
