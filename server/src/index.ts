import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  bonusBuy,
  getBalance,
  getConfig,
  getProvablyFair,
  resetDemo,
  setClientSeed,
  spin,
} from './gameLogic/SlotEngine.js';
import {
  BONUS_BUY_TIERS,
  CALIBRATION_NOTE,
  MEASURED_RTP,
  PAYTABLE,
  TARGET_RTP,
} from './math/config.js';
import type { BonusBuyTier } from './types/index.js';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../client/dist');

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', game: "Kraken's Lair" });
});

app.get('/api/balance', (_req, res) => {
  res.json({ balance: getBalance() });
});

app.post('/api/balance/demo', (_req, res) => {
  resetDemo();
  res.json({ balance: getBalance() });
});

app.get('/api/slot/config', (_req, res) => {
  res.json(getConfig());
});

app.get('/api/slot/calibration', (_req, res) => {
  res.json({
    game: "Kraken's Lair",
    targetRtp: TARGET_RTP,
    measuredRtp: MEASURED_RTP,
    calibration: CALIBRATION_NOTE,
    paytable: PAYTABLE,
    paytableNote:
      'Per-line-bet multipliers for 3/4/5 of a kind. Design ratios × 75 — use these values, not the first math-model doc.',
    bonusBuyTiers: BONUS_BUY_TIERS.map((t) => ({
      id: t.id,
      name: t.name,
      costMultiplier: t.costMultiplier,
      spins: t.spins,
      seededOrbs: t.seededOrbs,
      simulationStatus: 'pending — run tools/kraken_sim.py bonus-buy pass before certification',
    })),
    simulator: 'tools/kraken_sim.py',
  });
});

app.get('/api/slot/fair', (_req, res) => {
  res.json(getProvablyFair());
});

app.post('/api/slot/client-seed', (req, res) => {
  try {
    setClientSeed(String(req.body.clientSeed));
    res.json(getProvablyFair());
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post('/api/slot/spin', (req, res) => {
  try {
    const { bet, sessionId } = req.body;
    res.json(spin(Number(bet), sessionId));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post('/api/slot/bonus-buy', (req, res) => {
  try {
    const { bet, tier } = req.body as { bet: number; tier: BonusBuyTier };
    res.json(bonusBuy(Number(bet), tier));
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Kraken's Lair server on port ${PORT}`);
  console.log(`Game UI: http://localhost:${PORT}`);
});
