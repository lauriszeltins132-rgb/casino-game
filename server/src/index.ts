import express from 'express';
import cors from 'cors';
import {
  bonusBuy,
  getBalance,
  getBonus,
  getConfig,
  getProvablyFair,
  pickBonusChest,
  resetDemo,
  setBalance,
  setClientSeed,
  spin,
} from './gameLogic/SlotEngine.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', game: "Kraken's Treasure" });
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
    const { clientSeed } = req.body;
    setClientSeed(String(clientSeed));
    res.json(getProvablyFair());
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post('/api/slot/spin', (req, res) => {
  try {
    const { bet } = req.body;
    const result = spin(Number(bet));
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.post('/api/slot/bonus-buy', (req, res) => {
  try {
    const { bet } = req.body;
    const result = bonusBuy(Number(bet));
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.get('/api/bonus/:id', (req, res) => {
  const bonus = getBonus(req.params.id);
  if (!bonus) {
    res.status(404).json({ error: 'Bonus not found' });
    return;
  }
  res.json(bonus);
});

app.post('/api/bonus/pick', (req, res) => {
  try {
    const { bonusId, chestIndex } = req.body;
    const result = pickBonusChest(bonusId, Number(chestIndex));
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`Kraken's Treasure server on port ${PORT}`);
});
