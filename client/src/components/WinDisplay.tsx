import styles from './Slot.module.css';
import type { LineWin, SymbolId } from '../types';
import { SYMBOL_EMOJI } from '../utils/symbols';
import { formatMoney } from '../utils/symbols';

interface Props {
  lineWins: LineWin[];
  scatterCount: number;
  scatterPayout: number;
  totalWin: number;
  visible: boolean;
}

export function WinBanner({ lineWins, scatterCount, scatterPayout, totalWin, visible }: Props) {
  if (!visible || totalWin <= 0) return null;

  const isBigWin = totalWin >= 50;
  const isEpicWin = totalWin >= 200;

  return (
    <div
      className={`${styles.winBanner} ${isEpicWin ? styles.winEpic : isBigWin ? styles.winBig : ''}`}
    >
      <div className={styles.winAmount}>{formatMoney(totalWin)}</div>
      {lineWins.length > 0 && (
        <div className={styles.winDetails}>
          {lineWins.slice(0, 3).map((w) => (
            <span key={w.lineIndex} className={styles.winLine}>
              Line {w.lineIndex + 1}: {SYMBOL_EMOJI[w.symbol as SymbolId]} ×{w.count} ={' '}
              {formatMoney(w.payout)}
            </span>
          ))}
          {lineWins.length > 3 && (
            <span className={styles.winLine}>+{lineWins.length - 3} more lines</span>
          )}
        </div>
      )}
      {scatterCount >= 3 && (
        <div className={styles.scatterWin}>
          💎 {scatterCount} Scatters = {formatMoney(scatterPayout)}
        </div>
      )}
    </div>
  );
}

interface FreeSpinIntroProps {
  count: number;
  onDismiss: () => void;
}

export function FreeSpinIntro({ count, onDismiss }: FreeSpinIntroProps) {
  return (
    <div className={styles.overlay} onClick={onDismiss}>
      <div className={styles.freeSpinIntro}>
        <div className={styles.introEmoji}>💎</div>
        <h2>Free Spins!</h2>
        <p className={styles.introCount}>{count} Free Spins</p>
        <p className={styles.introSub}>All wins pay 2× during free spins</p>
        <p className={styles.introTap}>Tap to start</p>
      </div>
    </div>
  );
}

interface PaytableProps {
  open: boolean;
  onClose: () => void;
}

export function PaytableModal({ open, onClose }: PaytableProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.paytableModal} onClick={(e) => e.stopPropagation()}>
        <h2>Paytable — 10 Lines</h2>
        <div className={styles.paytableGrid}>
          <div className={styles.payRow}><span>🪙⚓🧭</span><span>3/4/5 = 0.4×–2.5×</span></div>
          <div className={styles.payRow}><span>🦜🗺️</span><span>3/4/5 = 0.8×–5×</span></div>
          <div className={styles.payRow}><span>🏴‍☠️⛵</span><span>3/4/5 = 1.5×–12×</span></div>
          <div className={styles.payRow}><span>🐙 Wild</span><span>3/4/5 = 3×–20×</span></div>
          <div className={styles.payRow}><span>💎 Scatter</span><span>3/4/5 = 2×/10×/50× total bet + Free Spins</span></div>
        </div>
        <p className={styles.payNote}>All pays per line bet. RTP ~96%.</p>
        <button className={styles.closeBtn} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
