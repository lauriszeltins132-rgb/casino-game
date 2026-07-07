import styles from './FreeSpinIntro.module.css';

interface Props {
  spins: number;
  onStart: () => void;
}

export function FreeSpinIntro({ spins, onStart }: Props) {
  return (
    <div className={styles.overlay} onClick={onStart}>
      <div className={styles.card}>
        <h2>Kraken&apos;s Fury</h2>
        <p className={styles.count}>{spins} Free Spins</p>
        <p className={styles.sub}>Ink Orbs multiply your wins · 2+ scatters retrigger +5</p>
        <span className={styles.tap}>Tap to begin</span>
      </div>
    </div>
  );
}

export function BonusCinematic({ onComplete }: { onComplete: () => void }) {
  return (
    <div className={styles.cinematic} onAnimationEnd={onComplete}>
      <div className={styles.shake}>
        <div className={styles.krakenBurst} />
        <h2>THE KRAKEN RISES</h2>
      </div>
    </div>
  );
}
