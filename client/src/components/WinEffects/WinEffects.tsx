import { useState } from 'react';
import styles from './WinEffects.module.css';

interface Props {
  amount: number;
  bet: number;
  visible: boolean;
}

export function WinOverlay({ amount, bet, visible }: Props) {
  if (!visible || amount <= 0) return null;

  const ratio = bet > 0 ? amount / bet : 0;
  const tier = ratio >= 20 ? 'epic' : ratio >= 5 ? 'big' : 'nice';
  const label = tier === 'epic' ? 'EPIC WIN' : tier === 'big' ? 'BIG WIN' : 'WIN';

  return (
    <div className={`${styles.overlay} ${styles[tier]}`}>
      <div className={styles.banner}>
        <span className={styles.label}>{label}</span>
        <span className={styles.amount}>${amount.toFixed(2)}</span>
      </div>
      <CoinBurst count={tier === 'epic' ? 20 : tier === 'big' ? 12 : 6} />
    </div>
  );
}

function CoinBurst({ count }: { count: number }) {
  const [coins] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 20 + Math.random() * 60,
      delay: Math.random() * 0.4,
      duration: 0.8 + Math.random() * 0.6,
    }))
  );

  return (
    <div className={styles.coins}>
      {coins.map((c) => (
        <div
          key={c.id}
          className={styles.coin}
          style={{
            left: `${c.left}%`,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export function ScatterShake({ active }: { active: boolean }) {
  if (!active) return null;
  return <div className={styles.scatterFlash} />;
}
