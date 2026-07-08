import { KrakenSvg } from './KrakenSvg';
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
      <div className={styles.svgWrap}>
        <KrakenSvg strong={strong || mid} />
      </div>

      <div className={styles.sunRays} />
      <div className={styles.particles} />
    </div>
  );
}
