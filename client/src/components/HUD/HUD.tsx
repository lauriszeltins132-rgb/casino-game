import { OdometerMoney, OdometerWin } from '../Odometer';
import { RageMeter } from '../RageMeter';
import styles from './HUD.module.css';

interface Props {
  balance: number;
  bet: number;
  win: number;
  targetRtp: number;
  volatility: string;
  freeSpinsRemaining?: number;
  sessionSeconds: number;
  rageLevel?: number; // 0..100
  ragePulseKey?: number;
}

export function HUD({
  balance,
  bet,
  win,
  targetRtp,
  volatility,
  freeSpinsRemaining = 0,
  sessionSeconds,
  rageLevel = 0,
  ragePulseKey = 0,
}: Props) {
  const mins = Math.floor(sessionSeconds / 60);
  const secs = sessionSeconds % 60;

  return (
    <header className={styles.hud}>
      <div className={styles.brand}>
        <h1 className={styles.title}>Kraken&apos;s Lair</h1>
        <p className={styles.disclosure}>
          RTP {targetRtp}% · {volatility} vol · Session {mins}:{secs.toString().padStart(2, '0')}
        </p>
      </div>

      {freeSpinsRemaining > 0 && (
        <div className={styles.fsBanner}>
          KRAKEN&apos;S FURY — {freeSpinsRemaining} FREE SPINS
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.icon}>◎</span>
          <div>
            <span className={styles.label}>Balance</span>
            <OdometerMoney value={balance} className={styles.value} />
          </div>
        </div>
        <div className={styles.stat}>
          <span className={styles.icon}>◈</span>
          <div>
            <span className={styles.label}>Bet</span>
            <OdometerMoney value={bet} className={styles.valueGold} />
          </div>
        </div>
        <div className={`${styles.stat} ${win > 0 ? styles.statWin : ''}`}>
          <span className={styles.icon}>✦</span>
          <div>
            <span className={styles.label}>Win</span>
            <OdometerWin value={win} />
          </div>
        </div>

        <RageMeter value={rageLevel} pulseKey={ragePulseKey} />
      </div>
    </header>
  );
}

export function RealityCheck({ show, onDismiss }: { show: boolean; onDismiss: () => void }) {
  if (!show) return null;
  return (
    <div className={styles.realityOverlay}>
      <div className={styles.realityBox}>
        <h3>Reality Check</h3>
        <p>You have been playing for 15 minutes. This is a demo game — no real money.</p>
        <button type="button" onClick={onDismiss}>Continue</button>
      </div>
    </div>
  );
}
