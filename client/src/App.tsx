import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { api } from './gameLogic/api';
import { getWinningCells } from './gameLogic/helpers';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HUD, RealityCheck } from './components/HUD';
import { ReelGrid } from './components/ReelGrid';
import { Controls } from './components/Controls';
import { Paytable } from './components/Paytable';
import { WinOverlay } from './components/WinEffects';
import { BonusBuyModal } from './components/BonusBuy';
import { AutoplayModal } from './components/Autoplay';
import { FreeSpinIntro, BonusCinematic } from './components/FreeSpinIntro';
import { audio } from './audio/AudioManager';
import type {
  AutoplaySettings,
  BonusBuyTier,
  GameConfig,
  GamePhase,
  SpinResult,
  SymbolId,
} from './types';
import './styles/global.css';
import styles from './styles/App.module.css';

const OceanScene = lazy(() =>
  import('./components/OceanScene').then((m) => ({ default: m.OceanScene }))
);

export default function App() {
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [balance, setBalance] = useState(10000);
  const [bet, setBet] = useState(1);
  const [win, setWin] = useState(0);
  const [grid, setGrid] = useState<SymbolId[][] | null>(null);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [winningCells, setWinningCells] = useState<Set<string>>(new Set());
  const [showPaytable, setShowPaytable] = useState(false);
  const [showBonusBuy, setShowBonusBuy] = useState(false);
  const [showAutoplay, setShowAutoplay] = useState(false);
  const [showFsIntro, setShowFsIntro] = useState(false);
  const [showCinematic, setShowCinematic] = useState(false);
  const [pendingFs, setPendingFs] = useState(0);
  const [fsSessionId, setFsSessionId] = useState<string | null>(null);
  const [fsRemaining, setFsRemaining] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showReality, setShowReality] = useState(false);
  const [anticipation, setAnticipation] = useState(false);
  const [inkOrbs, setInkOrbs] = useState<SpinResult['inkOrbs']>([]);

  const [autoActive, setAutoActive] = useState(false);
  const [autoRemaining, setAutoRemaining] = useState(0);
  const autoSettings = useRef<AutoplaySettings | null>(null);
  const autoStartBalance = useRef(0);
  const resultRef = useRef<SpinResult | null>(null);
  const phaseRef = useRef(phase);
  const betRef = useRef(bet);
  const balanceRef = useRef(balance);
  const fsIdRef = useRef<string | null>(null);

  phaseRef.current = phase;
  betRef.current = bet;
  balanceRef.current = balance;
  fsIdRef.current = fsSessionId;

  useEffect(() => {
    api.getConfig()
      .then((cfg) => {
        setConfig(cfg);
        setBet(cfg.betOptions[2] ?? 1);
      })
      .catch((err) => {
        console.error('Failed to load game config:', err);
        setError('Cannot reach game server — run npm run dev from the project root');
      });
    api.getBalance().then((r) => setBalance(r.balance)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setSessionSeconds((s) => {
        if (s === 900) setShowReality(true);
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const oceanIntensity =
    phase === 'freespin' || fsRemaining > 0
      ? 'freespin'
      : anticipation
        ? 'anticipation'
        : showCinematic
          ? 'bonus'
          : 'base';

  const executeSpin = useCallback(async (useFs = false) => {
    if (phaseRef.current === 'spinning') return;
    const currentBet = betRef.current;
    if (!useFs && currentBet > balanceRef.current) {
      setError('Insufficient balance');
      stopAuto();
      return;
    }

    setPhase('spinning');
    setWin(0);
    setWinningCells(new Set());
    setInkOrbs([]);
    setError(null);
    audio.play('spin');

    try {
      const result = await api.spin(
        currentBet,
        useFs ? fsIdRef.current ?? undefined : undefined
      );
      resultRef.current = result;
      setGrid(result.grid);
      setLastResult(result);
      setBalance(result.balance);
      balanceRef.current = result.balance;
      setAnticipation(result.anticipation);
      setInkOrbs(result.inkOrbs);
      if (config) {
        setWinningCells(getWinningCells(result.lineWins, config.paylines));
      }
      if (result.freeSpinState) {
        setFsSessionId(result.freeSpinState.sessionId);
        setFsRemaining(result.freeSpinState.remaining);
        fsIdRef.current = result.freeSpinState.sessionId;
      } else if (!result.isFreeSpin) {
        setFsSessionId(null);
        setFsRemaining(0);
        fsIdRef.current = null;
      }
    } catch (err) {
      setError((err as Error).message);
      setPhase('idle');
      stopAuto();
    }
  }, [config]);

  const finishSpin = useCallback(() => {
    const result = resultRef.current;
    if (!result) {
      setPhase('idle');
      return;
    }

    setWin(result.totalWin);
    setPhase('showing_win');
    setAnticipation(false);
    audio.playWin(result.totalWin, result.bet);

    if (result.freeSpinsAwarded > 0 && !result.isFreeSpin) {
      setPendingFs(result.freeSpinsAwarded);
      setShowFsIntro(true);
      audio.play('bonus_enter');
      return;
    }

    const delay = result.totalWin > 0 ? 2000 : 500;
    setTimeout(() => {
      afterWinDelay(result);
    }, delay);
  }, []);

  const afterWinDelay = (result: SpinResult) => {
    setPhase(result.freeSpinState ? 'freespin' : 'idle');

    if (autoActive && autoSettings.current) {
      const profit = balanceRef.current - autoStartBalance.current;
      const s = autoSettings.current;
      if (profit <= -s.lossLimit || profit >= s.winLimit || autoRemaining <= 1) {
        stopAuto();
        return;
      }
      setAutoRemaining((r) => r - 1);
      setTimeout(() => executeSpin(!!fsIdRef.current), 400);
      return;
    }

    if (result.freeSpinState && result.freeSpinState.remaining > 0) {
      setTimeout(() => executeSpin(true), 600);
    }
  };

  const stopAuto = () => {
    setAutoActive(false);
    setAutoRemaining(0);
    autoSettings.current = null;
  };

  const handleSpin = () => {
    if (autoActive) stopAuto();
    executeSpin(fsRemaining > 0);
  };

  const handleAutoplayStart = (settings: AutoplaySettings) => {
    autoSettings.current = settings;
    autoStartBalance.current = balanceRef.current;
    setAutoActive(true);
    setAutoRemaining(settings.spinCount);
    if (phaseRef.current === 'idle') executeSpin(false);
  };

  const handleBonusBuyConfirm = async (tier: BonusBuyTier) => {
    setShowBonusBuy(false);
    setShowCinematic(true);
    audio.play('bonus_enter');

    setTimeout(async () => {
      setShowCinematic(false);
      setPhase('spinning');
      try {
        const result = await api.bonusBuy(betRef.current, tier);
        resultRef.current = result;
        setGrid(result.grid);
        setBalance(result.balance);
        balanceRef.current = result.balance;
        setAnticipation(true);
        if (config) setWinningCells(getWinningCells(result.lineWins, config.paylines));
        if (result.freeSpinState) {
          setFsSessionId(result.freeSpinState.sessionId);
          setFsRemaining(result.freeSpinState.remaining);
          fsIdRef.current = result.freeSpinState.sessionId;
          setPendingFs(result.freeSpinsAwarded);
        }
      } catch (err) {
        setError((err as Error).message);
        setPhase('idle');
      }
    }, 2500);
  };

  const handleFsIntroStart = () => {
    setShowFsIntro(false);
    setPhase('freespin');
    setTimeout(() => executeSpin(true), 400);
  };

  const spinning = phase === 'spinning';

  return (
    <div className={styles.app}>
      <div className={styles.oceanBg} aria-hidden />
      <div className={styles.vignette} aria-hidden />
      <ErrorBoundary>
        <Suspense fallback={null}>
          <OceanScene intensity={oceanIntensity} bigWin={win > bet * 20} />
        </Suspense>
      </ErrorBoundary>

      <HUD
        balance={balance}
        bet={bet}
        win={win}
        targetRtp={(config?.targetRtp ?? 0.96) * 100}
        volatility={config?.volatility ?? 'medium-high'}
        freeSpinsRemaining={fsRemaining}
        sessionSeconds={sessionSeconds}
      />

      <main className={styles.main}>
        <ReelGrid
          grid={grid}
          spinning={spinning}
          anticipation={anticipation}
          winningCells={winningCells}
          inkOrbs={inkOrbs}
          lineWins={lastResult?.lineWins ?? []}
          paylines={config?.paylines ?? []}
          showPaylines={phase === 'showing_win'}
          onSpinComplete={finishSpin}
        />
        <WinOverlay amount={win} bet={bet} visible={phase === 'showing_win'} />
      </main>

      <button type="button" className={styles.paytableBtn} onClick={() => setShowPaytable(true)}>
        Paytable
      </button>

      <Controls
        bet={bet}
        betOptions={config?.betOptions ?? [0.2, 0.5, 1, 2, 5, 10, 25]}
        spinning={spinning}
        autoActive={autoActive}
        autoRemaining={autoRemaining}
        disabled={showFsIntro || showCinematic}
        onBetChange={setBet}
        onSpin={handleSpin}
        onAutoplayOpen={() => setShowAutoplay(true)}
        onBonusBuyOpen={() => setShowBonusBuy(true)}
      />

      {config && (
        <>
          <Paytable config={config} open={showPaytable} onClose={() => setShowPaytable(false)} />
          <BonusBuyModal
            open={showBonusBuy}
            bet={bet}
            tiers={config.bonusBuyTiers}
            onConfirm={handleBonusBuyConfirm}
            onClose={() => setShowBonusBuy(false)}
          />
        </>
      )}

      <AutoplayModal
        open={showAutoplay}
        onStart={handleAutoplayStart}
        onClose={() => setShowAutoplay(false)}
      />

      {showFsIntro && <FreeSpinIntro spins={pendingFs} onStart={handleFsIntroStart} />}
      {showCinematic && <BonusCinematic onComplete={() => setShowCinematic(false)} />}

      <RealityCheck show={showReality} onDismiss={() => setShowReality(false)} />

      {error && (
        <div className={styles.error} onClick={() => setError(null)}>
          {error}
        </div>
      )}
    </div>
  );
}
