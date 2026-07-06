import express from 'express';
import cors from 'cors';
import {
  bonusBuy,
  getActiveFreeSpinSession,
  getBalance,
  getConfig,
  setBalance,
  spin,
  spinFreeSession,
} from './slot/engine.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', game: 'Pirate\'s Bounty Slot' });
});

app.get('/api/balance', (_req, res) => {
  res.json({ balance: getBalance() });
});

app.post('/api/balance/demo', (_req, res) => {
  setBalance(1000);
  res.json({ balance: getBalance() });
});

app.get('/api/slot/config', (_req, res) => {
  res.json(getConfig());
});

app.get('/api/slot/session', (_req, res) => {
  const session = getActiveFreeSpinSession();
  res.json({ session });
});

app.post('/api/slot/spin', (req, res) => {
  try {
    const { betPerLine, sessionId } = req.body as {
      betPerLine: number;
      sessionId?: string;
    };

    const result = sessionId
      ? spinFreeSession(sessionId)
      : spin(Number(betPerLine));

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post('/api/slot/bonus-buy', (req, res) => {
  try {
    const { betPerLine } = req.body as { betPerLine: number };
    const result = bonusBuy(Number(betPerLine));
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`Pirate's Bounty slot server running on port ${PORT}`);
});
