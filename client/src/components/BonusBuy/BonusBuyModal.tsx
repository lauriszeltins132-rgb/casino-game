import { useState } from 'react';
import type { GameConfig, BonusBuyTier } from '../../types';
import { formatMoney } from '../../gameLogic/helpers';
import styles from './BonusBuyModal.module.css';

interface Props {
  open: boolean;
  bet: number;
  tiers: GameConfig['bonusBuyTiers'];
  onConfirm: (tier: BonusBuyTier) => void;
  onClose: () => void;
}

export function BonusBuyModal({ open, bet, tiers, onConfirm, onClose }: Props) {
  const [selected, setSelected] = useState<BonusBuyTier | null>(null);

  if (!open) return null;

  const handleConfirm = () => {
    if (selected) {
      onConfirm(selected);
      setSelected(null);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.tablet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.runeBorder} />
        <h2>Summon the Kraken</h2>
        <p className={styles.sub}>Select a bonus buy tier — prices shown for current bet</p>

        <div className={styles.tiers}>
          {tiers.map((t) => (
            <button
              key={t.id}
              className={`${styles.tier} ${selected === t.id ? styles.tierActive : ''}`}
              onClick={() => setSelected(t.id)}
            >
              <span className={styles.tierName}>{t.name}</span>
              <span className={styles.tierCost}>{formatMoney(bet * t.costMultiplier)}</span>
              <span className={styles.tierDesc}>{t.spins} Free Spins · {t.description}</span>
            </button>
          ))}
        </div>

        {selected && (
          <div className={styles.confirmBox}>
            <p>
              Confirm purchase for{' '}
              {formatMoney(bet * (tiers.find((t) => t.id === selected)?.costMultiplier ?? 0))}?
            </p>
            <div className={styles.confirmActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setSelected(null)}>
                Cancel
              </button>
              <button type="button" className={styles.confirmBtn} onClick={handleConfirm}>
                Summon
              </button>
            </div>
          </div>
        )}

        <button type="button" className={styles.closeBtn} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
