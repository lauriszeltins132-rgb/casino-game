import styles from './Slot.module.css';
import { formatMoney } from '../utils/symbols';

interface Props {
  balance: number;
  lastWin: number;
  totalBet: number;
  freeSpinsRemaining: number;
  isFreeSpin: boolean;
}

export function Header({ balance, lastWin, totalBet, freeSpinsRemaining, isFreeSpin }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.logoEmoji}>🏴‍☠️</span>
        <h1 className={styles.logoText}>Pirate&apos;s Bounty</h1>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Balance</span>
          <span className={styles.statValue}>{formatMoney(balance)}</span>
        </div>
        <div className={`${styles.stat} ${lastWin > 0 ? styles.statWin : ''}`}>
          <span className={styles.statLabel}>Last Win</span>
          <span className={styles.statValue}>{formatMoney(lastWin)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total Bet</span>
          <span className={styles.statValue}>
            {isFreeSpin ? 'FREE' : formatMoney(totalBet)}
          </span>
        </div>
      </div>

      {freeSpinsRemaining > 0 && (
        <div className={styles.freeSpinBanner}>
          FREE SPINS: {freeSpinsRemaining} remaining (2× multiplier)
        </div>
      )}
    </header>
  );
}
