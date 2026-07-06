import styles from './Game.module.css';

interface Props {
  balance: number;
  multiplier: number;
  potentialWin: number;
  bet: number;
}

export function Header({ balance, multiplier, potentialWin, bet }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>⚓</span>
        <h1 className={styles.logoText}>Cursed Chest</h1>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Balance</span>
          <span className={styles.statValue}>€{balance.toFixed(2)}</span>
        </div>
        <div className={`${styles.stat} ${styles.statHighlight}`}>
          <span className={styles.statLabel}>Multiplier</span>
          <span className={styles.multiplierValue}>{multiplier.toFixed(2)}x</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Potential Win</span>
          <span className={`${styles.statValue} ${styles.statGold}`}>€{potentialWin.toFixed(2)}</span>
        </div>
      </div>

      {bet > 0 && (
        <div className={styles.betBadge}>Bet: €{bet.toFixed(2)}</div>
      )}
    </header>
  );
}
