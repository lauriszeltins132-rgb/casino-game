import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { Header } from './components/Header';
import { Chest } from './components/Chest';
import { Controls } from './components/Controls';
import { WinOverlay, LossOverlay } from './components/Overlays';
import { BonusChoiceModal, BonusVault } from './components/BonusModal';
import type {
  GamePhase,
  RiskMode,
  RoundPublicView,
  WinTier,
} from './types';
import styles from './components/Game.module.css';

const OPEN_ANIMATION_MS = 1400;

export default function App() {
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [riskMode, setRiskMode] = useState<RiskMode>('medium');
  const [round, setRound] = useState<RoundPublicView | null>(null);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [openingChest, setOpeningChest] = useState<number | null>(null);
  const [openingBonusChest, setOpeningBonusChest] = useState<number | null>(null);
  const [winOverlay, setWinOverlay] = useState<{ tier: WinTier; amount: number } | null>(null);
  const [showLoss, setShowLoss] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getBalance().then((r) => setBalance(r.balance)).catch(() => {});
  }, []);

  const resetToIdle = useCallback(() => {
    setRound(null);
    setPhase('idle');
    setOpeningChest(null);
    setOpeningBonusChest(null);
    setWinOverlay(null);
    setShowLoss(false);
    setError(null);
  }, []);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const newRound = await api.startRound(bet, riskMode);
      setRound(newRound);
      setBalance(newRound.balance);
      setPhase('playing');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickChest = async (index: number) => {
    if (!round || phase !== 'playing' || openingChest !== null) return;

    setOpeningChest(index);
    setPhase('opening');

    await new Promise((r) => setTimeout(r, OPEN_ANIMATION_MS));

    setLoading(true);
    try {
      const result = await api.pickChest(round.roundId, index);
      setRound(result.round);
      setBalance(result.round.balance);

      if (result.showBonusChoice) {
        setPhase('bonus_choice');
        setOpeningChest(null);
        return;
      }

      if (result.pickedContent === 'curse') {
        setPhase('lost');
        setShowLoss(true);
        await api.revealRemaining(round.roundId).catch(() => {});
        return;
      }

      if (result.roundEnded && result.winAmount !== undefined && result.winTier) {
        setPhase('won');
        setWinOverlay({ tier: result.winTier, amount: result.winAmount });
        await api.revealRemaining(round.roundId).catch(() => {});
        return;
      }

      setPhase('playing');
      setOpeningChest(null);
    } catch (err) {
      setError((err as Error).message);
      setPhase('playing');
      setOpeningChest(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCashOut = async () => {
    if (!round) return;
    setLoading(true);
    try {
      const result = await api.cashOut(round.roundId);
      setRound(result.round);
      setBalance(result.round.balance);
      setPhase('won');
      setWinOverlay({ tier: result.winTier, amount: result.winAmount });
      await api.revealRemaining(round.roundId).catch(() => {});
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeBonusWin = async () => {
    if (!round) return;
    setLoading(true);
    try {
      const result = await api.declineBonus(round.roundId);
      setRound(result.round);
      setBalance(result.round.balance);
      setPhase('won');
      setWinOverlay({ tier: result.winTier, amount: result.winAmount });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterBonus = async () => {
    if (!round) return;
    setLoading(true);
    try {
      const updated = await api.acceptBonus(round.roundId);
      setRound(updated);
      setPhase('bonus_pick');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBonusPick = async (index: number) => {
    if (!round) return;
    setOpeningBonusChest(index);
    await new Promise((r) => setTimeout(r, OPEN_ANIMATION_MS));

    setLoading(true);
    try {
      const result = await api.pickBonusChest(round.roundId, index);
      setRound(result.round);
      setBalance(result.round.balance);

      if (result.result === 'curse') {
        setPhase('lost');
        setShowLoss(true);
        setOpeningBonusChest(null);
        return;
      }

      if (result.roundEnded && result.winAmount !== undefined && result.winTier) {
        setPhase('won');
        setWinOverlay({ tier: result.winTier, amount: result.winAmount });
        setOpeningBonusChest(null);
        return;
      }

      setPhase('playing');
      setOpeningBonusChest(null);
    } catch (err) {
      setError((err as Error).message);
      setOpeningBonusChest(null);
    } finally {
      setLoading(false);
    }
  };

  const multiplier = round?.multiplier ?? 1;
  const potentialWin = round?.potentialWin ?? bet;
  const hasActiveRound = round !== null && ['playing', 'opening', 'bonus_choice', 'bonus_pick'].includes(phase);

  return (
    <div className={styles.game}>
      <div className={styles.background}>
        <div className={styles.caveGlow} />
        <div className={styles.krakenEye1} />
        <div className={styles.krakenEye2} />
        <div className={styles.curseMist} />
      </div>

      <Header
        balance={balance}
        multiplier={multiplier}
        potentialWin={potentialWin}
        bet={round?.bet ?? 0}
      />

      <main className={styles.arena}>
        {phase === 'bonus_pick' ? (
          <BonusVault
            onPick={handleBonusPick}
            disabled={loading}
            openingIndex={openingBonusChest}
          />
        ) : (
          <div className={styles.chestGrid}>
            {(round?.chests ?? Array.from({ length: 5 }, (_, i) => ({ index: i, opened: false as const }))).map(
              (chest) => (
                <Chest
                  key={chest.index}
                  index={chest.index}
                  opened={chest.opened}
                  content={'content' in chest ? chest.content : undefined}
                  isOpening={openingChest === chest.index}
                  isSelected={false}
                  disabled={!hasActiveRound || phase === 'opening' || loading || phase === 'bonus_choice'}
                  onClick={() => handlePickChest(chest.index)}
                />
              )
            )}
          </div>
        )}

        {phase === 'idle' && (
          <div className={styles.idleMessage}>
            <p>Open treasure chests. Build your multiplier.</p>
            <p className={styles.idleSub}>Cash out before the curse finds you.</p>
          </div>
        )}
      </main>

      <Controls
        bet={bet}
        potentialWin={potentialWin}
        riskMode={riskMode}
        disabled={loading || phase === 'opening' || phase === 'bonus_pick'}
        canCashOut={round?.canCashOut ?? false}
        canPick={round?.canPick ?? false}
        hasActiveRound={hasActiveRound}
        onBetChange={setBet}
        onRiskChange={setRiskMode}
        onStart={handleStart}
        onCashOut={handleCashOut}
      />

      {error && (
        <div className={styles.errorToast} onClick={() => setError(null)}>
          {error}
        </div>
      )}

      {phase === 'bonus_choice' && round && (
        <BonusChoiceModal
          currentWin={round.potentialWin}
          onTakeWin={handleTakeBonusWin}
          onEnterBonus={handleEnterBonus}
          disabled={loading}
        />
      )}

      {winOverlay && (
        <WinOverlay
          tier={winOverlay.tier}
          amount={winOverlay.amount}
          onDismiss={resetToIdle}
        />
      )}

      {showLoss && <LossOverlay onDismiss={resetToIdle} />}
    </div>
  );
}
