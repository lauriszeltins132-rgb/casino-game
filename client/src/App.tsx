import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './gameLogic/api';
import { getWinningCells } from './gameLogic/helpers';
import { HUD } from './components/HUD';
import { ReelGrid } from './components/ReelGrid';
import { Controls } from './components/Controls';
import { KrakenLair, BonusIntro } from './components/Bonus';
import { Paytable } from './components/Paytable';
import { WinOverlay, ScatterShake } from './components/WinEffects';
import { audio } from './audio/AudioManager';
import type {
  BonusChestOutcome,
  BonusState,
  GameConfig,
  GamePhase,
  SpinResult,
  SymbolId,
} from './types';
import './styles/global.css';
import styles from './styles/App.module.css';

const AUTO_SPIN_COUNT = 50;

export default function App() {
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [balance, setBalance] = useState(10000);
  const [bet, setBet] = useState(1);
  const [win, setWin] = useState(0);
  const [grid, setGrid] = useState<SymbolId[][] | null>(null);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [winningCells, setWinningCells] = useState<Set<string>>(new Set());
  const [showPaytable, setShowPaytable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bonus, setBonus] = useState<BonusState | null>(null);
  const [showBonusIntro, setShowBonusIntro] = useState(false);
  const [bonusPicking, setBonusPicking] = useState(false);
  const [lastBonusOutcome, setLastBonusOutcome] = useState<BonusChestOutcome | null>(null);
  const [lastBonusPayout, setLastBonusPayout] = useState(0);
  const [scatterShake, setScatterShake] = useState(false);

  const [autoSpin, setAutoSpin] = useState(false);
  const [autoSpinRemaining, setAutoSpinRemaining] = useState(0);

  const resultRef = useRef<SpinResult | null>(null);
  const autoSpinRef = useRef(false);
  const autoRemainingRef = useRef(0);
  const configRef = useRef<GameConfig | null>(null);
  const betRef = useRef(bet);
  const balanceRef = useRef(balance);
  const phaseRef = useRef(phase);

  configRef.current = config;
  betRef.current = bet;
  balanceRef.current = balance;
  phaseRef.current = phase;

  useEffect(() => {
    api.getConfig().then((cfg) => {
      setConfig(cfg);
      setBet(cfg.betOptions[2] ?? 1);
    });
    api.getBalance().then((r) => setBalance(r.balance)).catch(() => {});
  }, []);

  const bonusBuyCost = bet * (config?.bonusBuyMultiplier ?? 100);

  const triggerSpin = useCallback(async () => {
    if (phaseRef.current === 'spinning') return;
    const currentBet = betRef.current;
    if (currentBet > balanceRef.current) {
      setError('Insufficient balance');
      setAutoSpin(false);
      autoSpinRef.current = false;
      return;
    }

    setPhase('spinning');
    phaseRef.current = 'spinning';
    setWin(0);
    setWinningCells(new Set());
    setError(null);
    audio.play('spin');

    if (autoSpinRef.current) {
      autoRemainingRef.current -= 1;
      setAutoSpinRemaining(autoRemainingRef.current);
    }

    try {
      const result = await api.spin(currentBet);
      resultRef.current = result;
      setGrid(result.grid);
      setBalance(result.balance);
      balanceRef.current = result.balance;
      if (configRef.current) {
        setWinningCells(getWinningCells(result.lineWins, configRef.current.paylines));
      }
    } catch (err) {
      setError((err as Error).message);
      setPhase('idle');
      phaseRef.current = 'idle';
      setAutoSpin(false);
      autoSpinRef.current = false;
    }
  }, []);

  const finishSpin = useCallback(() => {
    const result = resultRef.current;
    if (!result) {
      setPhase('idle');
      phaseRef.current = 'idle';
      return;
    }

    setWin(result.totalWin);
    setPhase('showing_win');
    phaseRef.current = 'showing_win';

    if (result.scatterCount >= 3) {
      setScatterShake(true);
      audio.play('scatter');
      setTimeout(() => setScatterShake(false), 600);
    }

    audio.playWin(result.totalWin, result.bet);

    if (result.bonusTriggered && result.bonusId) {
      api.getBonus(result.bonusId).then((b) => {
        setBonus(b);
        setTimeout(() => {
          setShowBonusIntro(true);
          audio.play('bonus_enter');
        }, result.totalWin > 0 ? 1800 : 800);
      });
      return;
    }

    const delay = result.totalWin > 0 ? 2000 : 400;
    setTimeout(() => {
      setPhase('idle');
      phaseRef.current = 'idle';
      if (autoSpinRef.current && autoRemainingRef.current > 0) {
        triggerSpin();
      } else if (autoSpinRef.current) {
        setAutoSpin(false);
        autoSpinRef.current = false;
      }
    }, delay);
  }, [triggerSpin]);

  const handleSpin = () => {
    if (autoSpin) {
      setAutoSpin(false);
      autoSpinRef.current = false;
      autoRemainingRef.current = 0;
      setAutoSpinRemaining(0);
    }
    triggerSpin();
  };

  const handleToggleAuto = () => {
    if (autoSpin) {
      setAutoSpin(false);
      autoSpinRef.current = false;
      autoRemainingRef.current = 0;
      setAutoSpinRemaining(0);
    } else {
      setAutoSpin(true);
      autoSpinRef.current = true;
      autoRemainingRef.current = AUTO_SPIN_COUNT;
      setAutoSpinRemaining(AUTO_SPIN_COUNT);
      if (phaseRef.current === 'idle') triggerSpin();
    }
  };

  const handleBonusBuy = async () => {
    if (phaseRef.current === 'spinning' || bonus) return;
    if (bonusBuyCost > balanceRef.current) {
      setError('Insufficient balance for bonus buy');
      return;
    }

    setPhase('spinning');
    phaseRef.current = 'spinning';
    setWin(0);
    setWinningCells(new Set());
    setError(null);
    audio.play('spin');

    try {
      const result = await api.bonusBuy(betRef.current);
      resultRef.current = result;
      setGrid(result.grid);
      setBalance(result.balance);
      balanceRef.current = result.balance;
      if (configRef.current) {
        setWinningCells(getWinningCells(result.lineWins, configRef.current.paylines));
      }
      setScatterShake(true);
      audio.play('scatter');
      setTimeout(() => setScatterShake(false), 600);
    } catch (err) {
      setError((err as Error).message);
      setPhase('idle');
      phaseRef.current = 'idle';
    }
  };

  const handleBonusPick = async (index: number) => {
    if (!bonus || bonusPicking) return;
    setBonusPicking(true);

    try {
      const result = await api.pickChest(bonus.id, index);
      setBonus(result.bonus);
      setBalance(result.balance);
      balanceRef.current = result.balance;
      setLastBonusOutcome(result.outcome);
      setLastBonusPayout(result.payout);
      if (result.rageLevelUp) audio.play('rage_up');
      audio.playWin(result.payout, bonus.bet);

      if (result.bonus.completed) {
        setTimeout(() => {
          setBonus(null);
          setShowBonusIntro(false);
          setPhase('idle');
          phaseRef.current = 'idle';
          setLastBonusOutcome(null);
          setLastBonusPayout(0);
        }, 3000);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBonusPicking(false);
    }
  };

  const handleBonusIntroStart = () => {
    setShowBonusIntro(false);
    setPhase('bonus_active');
    phaseRef.current = 'bonus_active';
  };

  const spinning = phase === 'spinning';
  const inBonus = phase === 'bonus_active' && bonus !== null;

  return (
    <div className={styles.app}>
      <div className={styles.oceanBg} />
      <div className={styles.vignette} />

      {!inBonus && (
        <>
          <HUD balance={balance} bet={bet} win={win} />

          <main className={styles.main}>
            <ReelGrid
              grid={grid}
              spinning={spinning}
              winningCells={winningCells}
              onSpinComplete={finishSpin}
            />
            <ScatterShake active={scatterShake} />
            <WinOverlay amount={win} bet={bet} visible={phase === 'showing_win'} />
          </main>

          <button className={styles.paytableBtn} onClick={() => setShowPaytable(true)}>
            ⓘ Paytable
          </button>

          <Controls
            bet={bet}
            betOptions={config?.betOptions ?? [0.2, 0.5, 1, 2, 5, 10, 25]}
            spinning={spinning}
            autoSpin={autoSpin}
            autoSpinCount={autoSpinRemaining}
            bonusBuyCost={bonusBuyCost}
            disabled={!!bonus}
            onBetChange={setBet}
            onSpin={handleSpin}
            onBonusBuy={handleBonusBuy}
            onToggleAuto={handleToggleAuto}
          />
        </>
      )}

      {inBonus && bonus && (
        <KrakenLair
          bonus={bonus}
          onPick={handleBonusPick}
          lastOutcome={lastBonusOutcome}
          lastPayout={lastBonusPayout}
          picking={bonusPicking}
        />
      )}

      {showBonusIntro && <BonusIntro onStart={handleBonusIntroStart} />}

      {config && (
        <Paytable config={config} open={showPaytable} onClose={() => setShowPaytable(false)} />
      )}

      {error && (
        <div className={styles.error} onClick={() => setError(null)}>
          {error}
        </div>
      )}
    </div>
  );
}
