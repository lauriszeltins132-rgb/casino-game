import styles from './Game.module.css';
import type { WinTier } from '../types';

interface Props {
  tier: WinTier;
  amount: number;
  onDismiss: () => void;
}

const TIER_LABELS: Record<WinTier, string> = {
  nice: 'Nice Win',
  big: 'Big Win',
  epic: 'Epic Win',
};

export function WinOverlay({ tier, amount, onDismiss }: Props) {
  return (
    <div className={styles.overlay} onClick={onDismiss}>
      <div className={`${styles.winBanner} ${styles[`win_${tier}`]}`}>
        <div className={styles.winSparkles}>✨</div>
        <h2 className={styles.winTitle}>{TIER_LABELS[tier]}</h2>
        <p className={styles.winAmount}>€{amount.toFixed(2)}</p>
        <p className={styles.winTap}>Tap to continue</p>
      </div>
    </div>
  );
}

interface LossProps {
  onDismiss: () => void;
}

export function LossOverlay({ onDismiss }: LossProps) {
  return (
    <div className={styles.overlay} onClick={onDismiss}>
      <div className={`${styles.winBanner} ${styles.lossBanner}`}>
        <div className={styles.curseIcon}>☠</div>
        <h2 className={styles.lossTitle}>Cursed!</h2>
        <p className={styles.lossSub}>The kraken claims your treasure...</p>
        <p className={styles.winTap}>Tap to continue</p>
      </div>
    </div>
  );
}
