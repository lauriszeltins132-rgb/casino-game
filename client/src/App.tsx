import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';
import { Header } from './components/Header';
import { ReelGrid } from './components/ReelGrid';
import { Controls } from './components/Controls';
import { WinBanner, FreeSpinIntro, PaytableModal } from './components/WinDisplay';
import type { GameState, SlotConfig, SpinResponse, SymbolId } from './types';
import styles from './components/Slot.module.css';

export default function App() {
  const [config, setConfig] = useState<SlotConfig | null>(null);
  const [balance, setBalance] = useState(1000);
  const [betPerLine, setBetPerLine] = useState(0.5);
  const [grid, setGrid] = useState<SymbolId[][] | null>(null);
  const [lastResult, setLastResult] = useState<SpinResponse | null>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [lastWin, setLastWin] = useState(0);
  const [freeSpinSessionId, setFreeSpinSessionId] = useState<string | null>(null);
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
  const [showFreeSpinIntro, setShowFreeSpinIntro] = useState(false);
  const [pendingFreeSpins, setPendingFreeSpins] = useState(0);
  const [showPaytable, setShowPaytable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastResultRef = useRef<SpinResponse | null>(null);
  const autoSpinRef = useRef(false);

  useEffect(() => {
    Promise.all([api.getConfig(), api.getBalance()]).then(([cfg, bal]) => {
      setConfig(cfg);
      setBalance(bal.balance);
      setBetPerLine(cfg.betPresets[2] ?? 0.5);
    }).catch(() => {});
  }, []);

  const lineCount = config?.lineCount ?? 10;
  const totalBet = betPerLine * lineCount;
  const bonusBuyCost = totalBet * (config?.bonusBuyCostMultiplier ?? 100);

  const doSpin = useCallback(async (useFreeSession: boolean) => {
    setGameState('spinning');
    setLastWin(0);
    setError(null);

    try {
      const result =
        useFreeSession && freeSpinSessionId
          ? await api.spin(betPerLine, freeSpinSessionId)
          : await api.spin(betPerLine);

      lastResultRef.current = result;
      setGrid(result.grid);
      setLastResult(result);
      setBalance(result.balance);
      setFreeSpinSessionId(result.freeSpinSessionId);
      setFreeSpinsRemaining(result.freeSpinsRemaining);
    } catch (err) {
      setError((err as Error).message);
      setGameState('idle');
    }
  }, [betPerLine, freeSpinSessionId]);

  const onSpinComplete = useCallback(() => {
    const result = lastResultRef.current;
    if (!result) {
      setGameState('idle');
      return;
    }

    setLastWin(result.totalWin);
    setGameState('showing_win');

    if (result.freeSpinsAwarded > 0 && result.freeSpinsRemaining > 0) {
      setPendingFreeSpins(result.freeSpinsAwarded);
      setShowFreeSpinIntro(true);
      return;
    }

    if (result.freeSpinsRemaining > 0) {
      setTimeout(() => {
        setGameState('idle');
        autoSpinRef.current = true;
      }, result.totalWin > 0 ? 1200 : 500);
    } else {
      setFreeSpinSessionId(null);
      setFreeSpinsRemaining(0);
      setTimeout(() => setGameState('idle'), result.totalWin > 0 ? 1800 : 400);
    }
  }, []);

  useEffect(() => {
    if (autoSpinRef.current && gameState === 'idle' && freeSpinsRemaining > 0 && freeSpinSessionId) {
      autoSpinRef.current = false;
      doSpin(true);
    }
  }, [gameState, freeSpinsRemaining, freeSpinSessionId, doSpin]);

  const handleSpin = () => {
    if (freeSpinsRemaining > 0 && freeSpinSessionId) {
      doSpin(true);
    } else {
      doSpin(false);
    }
  };

  const handleBonusBuy = async () => {
    if (gameState === 'spinning') return;
    setGameState('spinning');
    setLastWin(0);
    setError(null);

    try {
      const result = await api.bonusBuy(betPerLine);
      lastResultRef.current = result;
      setGrid(result.grid);
      setLastResult(result);
      setBalance(result.balance);
      setFreeSpinSessionId(result.freeSpinSessionId);
      setFreeSpinsRemaining(result.freeSpinsRemaining);
    } catch (err) {
      setError((err as Error).message);
      setGameState('idle');
    }
  };

  const handleFreeSpinIntroDismiss = () => {
    setShowFreeSpinIntro(false);
    setGameState('idle');
    autoSpinRef.current = true;
  };

  const winningLines = lastResult?.lineWins.map((w) => w.lineIndex) ?? [];

  return (
    <div className={styles.game}>
      <div className={styles.bgOcean} />
      <div className={styles.bgShip} />

      <Header
        balance={balance}
        lastWin={lastWin}
        totalBet={totalBet}
        freeSpinsRemaining={freeSpinsRemaining}
        isFreeSpin={freeSpinsRemaining > 0}
      />

      <main className={styles.main}>
        <ReelGrid
          grid={grid}
          spinning={gameState === 'spinning'}
          winningLines={winningLines}
          symbols={config?.symbols ?? []}
          onSpinComplete={onSpinComplete}
        />

        <WinBanner
          lineWins={lastResult?.lineWins ?? []}
          scatterCount={lastResult?.scatterCount ?? 0}
          scatterPayout={lastResult?.scatterPayout ?? 0}
          totalWin={lastWin}
          visible={gameState === 'showing_win'}
        />
      </main>

      <button className={styles.paytableBtn} onClick={() => setShowPaytable(true)}>
        Paytable
      </button>

      <Controls
        betPerLine={betPerLine}
        lineCount={lineCount}
        betPresets={config?.betPresets ?? [0.1, 0.5, 1, 2, 5]}
        minBet={config?.minBetPerLine ?? 0.1}
        maxBet={config?.maxBetPerLine ?? 10}
        bonusBuyCost={bonusBuyCost}
        spinning={gameState === 'spinning'}
        isFreeSpin={freeSpinsRemaining > 0}
        freeSpinsRemaining={freeSpinsRemaining}
        onBetChange={setBetPerLine}
        onSpin={handleSpin}
        onBonusBuy={handleBonusBuy}
      />

      {error && (
        <div className={styles.errorToast} onClick={() => setError(null)}>
          {error}
        </div>
      )}

      {showFreeSpinIntro && (
        <FreeSpinIntro count={pendingFreeSpins} onDismiss={handleFreeSpinIntroDismiss} />
      )}

      <PaytableModal open={showPaytable} onClose={() => setShowPaytable(false)} />
    </div>
  );
}
