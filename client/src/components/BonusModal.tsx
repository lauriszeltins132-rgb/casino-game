import styles from './Game.module.css';

interface Props {
  currentWin: number;
  onTakeWin: () => void;
  onEnterBonus: () => void;
  disabled: boolean;
}

export function BonusChoiceModal({ currentWin, onTakeWin, onEnterBonus, disabled }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.bonusModal}>
        <div className={styles.keyIcon}>🗝️</div>
        <h2 className={styles.bonusTitle}>Golden Key Found!</h2>
        <p className={styles.bonusDesc}>
          You've unlocked the Bonus Vault. Take your €{currentWin.toFixed(2)} now, or risk it
          for a bigger multiplier boost.
        </p>
        <div className={styles.bonusActions}>
          <button
            className={`${styles.actionBtn} ${styles.cashoutBtn}`}
            onClick={onTakeWin}
            disabled={disabled}
          >
            Take €{currentWin.toFixed(2)}
          </button>
          <button
            className={`${styles.actionBtn} ${styles.bonusBtn}`}
            onClick={onEnterBonus}
            disabled={disabled}
          >
            Enter Bonus Vault
          </button>
        </div>
      </div>
    </div>
  );
}

interface BonusPickProps {
  onPick: (index: number) => void;
  disabled: boolean;
  openingIndex: number | null;
}

export function BonusVault({ onPick, disabled, openingIndex }: BonusPickProps) {
  return (
    <div className={styles.bonusVault}>
      <h2 className={styles.bonusVaultTitle}>Bonus Vault</h2>
      <p className={styles.bonusVaultDesc}>Choose one special chest — fortune or curse awaits</p>
      <div className={styles.bonusChests}>
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            className={`${styles.bonusChestBtn} ${openingIndex === i ? styles.bonusChestOpening : ''}`}
            onClick={() => onPick(i)}
            disabled={disabled || openingIndex !== null}
          >
            <div className={styles.bonusChestInner}>
              <span className={styles.bonusChestEmoji}>📦</span>
              <span className={styles.bonusChestLabel}>?</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
