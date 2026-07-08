import styles from './KrakenLairOverlay.module.css';

export function KrakenLairOverlay() {
  // Purely visual: sits behind the reel grid during free spins.
  return (
    <div className={styles.overlay} aria-hidden>
      <div className={styles.ambientGlow} />
      <div className={styles.templeArch} />
      <div className={styles.treasureSparkles}>
        {Array.from({ length: 26 }).map((_, i) => (
          <div key={i} className={styles.sparkle} style={{ ['--i' as any]: i }} />
        ))}
      </div>
      <div className={styles.backVignette} />
    </div>
  );
}

