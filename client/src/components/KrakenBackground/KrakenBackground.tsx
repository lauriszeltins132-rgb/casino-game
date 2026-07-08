import styles from './KrakenBackground.module.css';

type Intensity = 'base' | 'freespin' | 'anticipation' | 'bonus';

export function KrakenBackground({ intensity }: { intensity: Intensity }) {
  const strong = intensity === 'bonus' || intensity === 'freespin';
  const mid = intensity === 'anticipation';

  return (
    <div
      className={styles.root}
      aria-hidden
      data-strong={strong ? '1' : '0'}
      data-mid={mid ? '1' : '0'}
    >
      {/* Distant ruins / temple silhouettes */}
      <div className={styles.ruins} />

      {/* Tentacles framing the reels */}
      <div className={styles.tentacles}>
        <div className={styles.tentLeft} />
        <div className={styles.tentRight} />
        <div className={styles.tentBottomLeft} />
        <div className={styles.tentBottomRight} />
      </div>

      {/* Golden glowing eyes */}
      <div className={styles.eyes}>
        <div className={styles.eye} />
        <div className={styles.eye} />
      </div>

      {/* Water splashes / suction “pulses” */}
      <div className={styles.suctionRipples} />
      <div className={styles.particles} />
    </div>
  );
}

