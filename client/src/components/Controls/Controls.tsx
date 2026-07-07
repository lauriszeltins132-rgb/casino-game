import styles from './Controls.module.css';
import { audio } from '../../audio/AudioManager';

interface Props {
  bet: number;
  betOptions: number[];
  spinning: boolean;
  autoSpin: boolean;
  autoSpinCount: number;
  bonusBuyCost: number;
  disabled: boolean;
  onBetChange: (bet: number) => void;
  onSpin: () => void;
  onBonusBuy: () => void;
  onToggleAuto: () => void;
}

function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

export function Controls({
  bet,
  betOptions,
  spinning,
  autoSpin,
  autoSpinCount,
  bonusBuyCost,
  disabled,
  onBetChange,
  onSpin,
  onBonusBuy,
  onToggleAuto,
}: Props) {
  return (
    <footer className={styles.controls}>
      <div className={styles.betRow}>
        <span className={styles.label}>Select Bet</span>
        <div className={styles.betOptions}>
          {betOptions.map((amount) => (
            <button
              key={amount}
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
          className={`${styles.autoBtn} ${autoSpin ? styles.autoActive : ''}`}
          onClick={() => { audio.play('button'); onToggleAuto(); }}
          disabled={spinning && !autoSpin}
        >
          {autoSpin ? `AUTO (${autoSpinCount})` : 'AUTO'}
        </button>

        <button
          className={`${styles.spinBtn} ${spinning ? styles.spinning : ''}`}
          onClick={() => { audio.play('button'); onSpin(); }}
          disabled={disabled || spinning}
        >
          {spinning ? 'SPINNING' : 'SPIN'}
        </button>

        <button
          className={styles.bonusBuyBtn}
          onClick={() => { audio.play('button'); onBonusBuy(); }}
          disabled={disabled || spinning}
        >
          <span className={styles.bonusBuyLabel}>BUY KRAKEN&apos;S LAIR</span>
          <span className={styles.bonusBuyCost}>{fmt(bonusBuyCost)}</span>
        </button>
      </div>
    </footer>
  );
}
