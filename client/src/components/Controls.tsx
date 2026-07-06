import styles from './Game.module.css';
import type { RiskMode } from '../types';

interface Props {
  bet: number;
  potentialWin: number;
  riskMode: RiskMode;
  disabled: boolean;
  canCashOut: boolean;
  canPick: boolean;
  hasActiveRound: boolean;
  onBetChange: (bet: number) => void;
  onRiskChange: (risk: RiskMode) => void;
  onStart: () => void;
  onCashOut: () => void;
}

const RISK_OPTIONS: { value: RiskMode; label: string; desc: string }[] = [
  { value: 'low', label: 'Low Risk', desc: 'Safer · Lower multipliers' },
  { value: 'medium', label: 'Medium', desc: 'Balanced · Default' },
  { value: 'high', label: 'High Risk', desc: 'Bigger wins · More danger' },
];

export function Controls({
  bet,
  potentialWin,
  riskMode,
  disabled,
  canCashOut,
  canPick,
  hasActiveRound,
  onBetChange,
  onRiskChange,
  onStart,
  onCashOut,
}: Props) {
  const betPresets = [1, 5, 10, 25, 50, 100];

  return (
    <footer className={styles.controls}>
      {!hasActiveRound && (
        <>
          <div className={styles.betSection}>
            <label className={styles.controlLabel}>Bet Amount</label>
            <div className={styles.betPresets}>
              {betPresets.map((amount) => (
                <button
                  key={amount}
                  className={`${styles.presetBtn} ${bet === amount ? styles.presetActive : ''}`}
                  onClick={() => onBetChange(amount)}
                  disabled={disabled}
                >
                  €{amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              className={styles.betInput}
              value={bet}
              min={1}
              max={1000}
              onChange={(e) => onBetChange(Math.max(1, Number(e.target.value)))}
              disabled={disabled}
            />
          </div>

          <div className={styles.riskSection}>
            <label className={styles.controlLabel}>Risk Mode</label>
            <div className={styles.riskButtons}>
              {RISK_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.riskBtn} ${riskMode === opt.value ? styles.riskActive : ''}`}
                  onClick={() => onRiskChange(opt.value)}
                  disabled={disabled}
                >
                  <span className={styles.riskLabel}>{opt.label}</span>
                  <span className={styles.riskDesc}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            className={`${styles.actionBtn} ${styles.startBtn}`}
            onClick={onStart}
            disabled={disabled}
          >
            Place Bet & Start
          </button>
        </>
      )}

      {hasActiveRound && (
        <div className={styles.actionRow}>
          <p className={styles.pickHint}>
            {canPick
              ? 'Tap a chest to open — or cash out your treasure'
              : 'Choose your fate...'}
          </p>
          <button
            className={`${styles.actionBtn} ${styles.cashoutBtn}`}
            onClick={onCashOut}
            disabled={!canCashOut || disabled}
          >
            Cash Out €{potentialWin.toFixed(2)}
          </button>
        </div>
      )}
    </footer>
  );
}
