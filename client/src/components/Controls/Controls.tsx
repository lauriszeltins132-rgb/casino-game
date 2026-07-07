import styles from './Controls.module.css';
import { audio } from '../../audio/AudioManager';

interface Props {
  bet: number;
  betOptions: number[];
  spinning: boolean;
  autoActive: boolean;
  autoRemaining: number;
  disabled: boolean;
  onBetChange: (bet: number) => void;
  onSpin: () => void;
  onAutoplayOpen: () => void;
  onBonusBuyOpen: () => void;
}

function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

export function Controls({
  bet,
  betOptions,
  spinning,
  autoActive,
  autoRemaining,
  disabled,
  onBetChange,
  onSpin,
  onAutoplayOpen,
  onBonusBuyOpen,
}: Props) {
  return (
    <footer className={styles.controls}>
      <div className={styles.betRow}>
        <span className={styles.label}>Bet</span>
        <div className={styles.betOptions}>
          {betOptions.map((amount) => (
            <button
              key={amount}
              type="button"
              className={`${styles.betBtn} ${bet === amount ? styles.betActive : ''}`}
              onClick={() => { audio.play('button'); onBetChange(amount); }}
              disabled={disabled || spinning}
            >
              {fmt(amount)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.autoBtn} ${autoActive ? styles.autoOn : ''}`}
          onClick={() => { audio.play('button'); onAutoplayOpen(); }}
          disabled={spinning && !autoActive}
        >
          {autoActive ? `AUTO ${autoRemaining}` : 'AUTO'}
        </button>

        <button
          type="button"
          className={`${styles.spinBtn} ${spinning ? styles.spinning : ''}`}
          onClick={() => { audio.play('button'); onSpin(); }}
          disabled={disabled || spinning}
        >
          {spinning ? '···' : 'SPIN'}
        </button>

        <button
          type="button"
          className={styles.summonBtn}
          onClick={() => { audio.play('button'); onBonusBuyOpen(); }}
          disabled={disabled || spinning}
        >
          <span className={styles.summonLabel}>SUMMON</span>
          <span className={styles.summonSub}>Bonus Buy</span>
        </button>
      </div>
    </footer>
  );
}
