import { OdometerWin } from '../Odometer';
import styles from './HUD.module.css';

interface Props {
  balance: number;
  bet: number;
  win: number;
  targetRtp: number;
  volatility: string;
  freeSpinsRemaining?: number;
  sessionSeconds: number;
}

export function HUD({
  balance,
  bet,
  win,
  targetRtp,
  volatility,
  freeSpinsRemaining = 0,
  sessionSeconds,
}: Props) {
  const fmt = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
            <span className={styles.value}>{fmt(balance)}</span>
          </div>
        </div>
        <div className={styles.stat}>
          <span className={styles.icon}>◈</span>
          <div>
            <span className={styles.label}>Bet</span>
            <span className={styles.valueGold}>{fmt(bet)}</span>
          </div>
        </div>
        <div className={`${styles.stat} ${win > 0 ? styles.statWin : ''}`}>
          <span className={styles.icon}>✦</span>
          <div>
            <span className={styles.label}>Win</span>
            <OdometerWin value={win} />
          </div>
        </div>
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
