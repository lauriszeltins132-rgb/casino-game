import express from 'express';
import cors from 'cors';
import {
  acceptBonus,
  cashOut,
  declineBonus,
  getBalance,
  pickBonusChest,
  pickChest,
  revealRemaining,
  setBalance,
  startRound,
} from './roundManager.js';
import { getRtpInfo } from './game.js';
import type { RiskMode } from './types.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', game: 'Cursed Chest' });
});

app.get('/api/rtp', (_req, res) => {
  res.json(getRtpInfo());
});

app.get('/api/balance', (_req, res) => {
  res.json({ balance: getBalance() });
});

app.post('/api/balance/demo', (_req, res) => {
  setBalance(1000);
  res.json({ balance: getBalance() });
});

app.post('/api/round/start', (req, res) => {
  try {
    const { bet, riskMode = 'medium' } = req.body as {
      bet: number;
      riskMode?: RiskMode;
    };

    if (!['low', 'medium', 'high'].includes(riskMode)) {
      res.status(400).json({ error: 'Invalid risk mode' });
      return;
    }

    const round = startRound(Number(bet), riskMode);
    res.json(round);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post('/api/round/pick', (req, res) => {
  try {
    const { roundId, chestIndex } = req.body;
    const result = pickChest(roundId, Number(chestIndex));
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post('/api/round/cashout', (req, res) => {
  try {
    const { roundId } = req.body;
    const result = cashOut(roundId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post('/api/bonus/accept', (req, res) => {
  try {
    const { roundId } = req.body;
    const round = acceptBonus(roundId);
    res.json(round);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post('/api/bonus/decline', (req, res) => {
  try {
    const { roundId } = req.body;
    const result = declineBonus(roundId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post('/api/bonus/pick', (req, res) => {
  try {
    const { roundId, chestIndex } = req.body;
    const result = pickBonusChest(roundId, Number(chestIndex));
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post('/api/round/reveal', (req, res) => {
  try {
    const { roundId } = req.body;
    const chests = revealRemaining(roundId);
    res.json({ chests });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`Cursed Chest server running on port ${PORT}`);
});
