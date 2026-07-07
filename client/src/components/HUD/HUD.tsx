import styles from './HUD.module.css';

interface Props {
  balance: number;
  bet: number;
  win: number;
}

function fmt(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function HUD({ balance, bet, win }: Props) {
  return (
    <header className={styles.hud}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <svg viewBox="0 0 40 40" width="32" height="32">
            <defs>
              <radialGradient id="eyeMini">
                <stop offset="0%" stopColor="#2ecc71" />
                <stop offset="100%" stopColor="#0a1628" />
              </radialGradient>
            </defs>
            <ellipse cx="20" cy="20" rx="16" ry="14" fill="url(#eyeMini)" />
            <ellipse cx="20" cy="20" rx="6" ry="8" fill="#0a1628" />
            <ellipse cx="20" cy="19" rx="3" ry="4" fill="#2ecc71" />
          </svg>
        </div>
        <div>
          <h1 className={styles.title}>Kraken&apos;s Treasure</h1>
          <p className={styles.subtitle}>20 Lines · 96% RTP · Medium-High Volatility</p>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Balance</span>
          <span className={styles.value}>{fmt(balance)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Bet</span>
          <span className={styles.valueGold}>{fmt(bet)}</span>
        </div>
        <div className={`${styles.stat} ${win > 0 ? styles.statWin : ''}`}>
          <span className={styles.label}>Win</span>
          <span className={styles.value}>{fmt(win)}</span>
        </div>
      </div>
    </header>
  );
}
