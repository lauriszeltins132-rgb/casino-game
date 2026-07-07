import express from 'express';
import cors from 'cors';
import {
  bonusBuy,
  getBalance,
  getConfig,
  getProvablyFair,
  resetDemo,
  setClientSeed,
  spin,
} from './gameLogic/SlotEngine.js';
import type { BonusBuyTier } from './types/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

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

app.listen(PORT, () => {
  console.log(`Kraken's Lair server on port ${PORT}`);
});
