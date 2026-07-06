import styles from './Slot.module.css';
import { formatMoney } from '../utils/symbols';

interface Props {
  betPerLine: number;
  lineCount: number;
  betPresets: number[];
  minBet: number;
  maxBet: number;
  bonusBuyCost: number;
  spinning: boolean;
  isFreeSpin: boolean;
  freeSpinsRemaining: number;
  onBetChange: (bet: number) => void;
  onSpin: () => void;
  onBonusBuy: () => void;
}

export function Controls({
  betPerLine,
  lineCount,
  betPresets,
  minBet,
  maxBet,
  bonusBuyCost,
  spinning,
  isFreeSpin,
  freeSpinsRemaining,
  onBetChange,
  onSpin,
  onBonusBuy,
}: Props) {
  const totalBet = betPerLine * lineCount;
  const canSpin = !spinning && (isFreeSpin || totalBet > 0);
  const canChangeBet = !spinning && !isFreeSpin && freeSpinsRemaining === 0;

  return (
    <footer className={styles.controls}>
      <div className={styles.betRow}>
        <span className={styles.controlLabel}>
          Bet / Line ({lineCount} lines = {formatMoney(totalBet)})
        </span>
        <div className={styles.betPresets}>
          {betPresets.map((amount) => (
            <button
              key={amount}
              className={`${styles.betBtn} ${betPerLine === amount ? styles.betActive : ''}`}
              onClick={() => onBetChange(amount)}
              disabled={!canChangeBet}
            >
              {formatMoney(amount)}
            </button>
          ))}
        </div>
        <div className={styles.betAdjust}>
          <button
            className={styles.adjustBtn}
            onClick={() => onBetChange(Math.max(minBet, Math.round((betPerLine - 0.1) * 10) / 10))}
            disabled={!canChangeBet || betPerLine <= minBet}
          >
            −
          </button>
          <span className={styles.betDisplay}>{formatMoney(betPerLine)}</span>
          <button
            className={styles.adjustBtn}
            onClick={() => onBetChange(Math.min(maxBet, Math.round((betPerLine + 0.1) * 10) / 10))}
            disabled={!canChangeBet || betPerLine >= maxBet}
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.actionRow}>
        <button
          className={`${styles.spinBtn} ${spinning ? styles.spinning : ''}`}
          onClick={onSpin}
          disabled={!canSpin}
        >
          {spinning
            ? '...'
            : isFreeSpin || freeSpinsRemaining > 0
              ? 'FREE SPIN'
              : 'SPIN'}
        </button>

        {!isFreeSpin && freeSpinsRemaining === 0 && (
          <button
            className={styles.bonusBuyBtn}
            onClick={onBonusBuy}
            disabled={spinning}
          >
            Bonus Buy
            <span className={styles.bonusBuyCost}>{formatMoney(bonusBuyCost)}</span>
          </button>
        )}
      </div>
    </footer>
  );
}
