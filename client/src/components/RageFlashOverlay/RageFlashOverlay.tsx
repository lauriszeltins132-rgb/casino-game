import { useEffect, useMemo, useState } from 'react';
import styles from './RageFlashOverlay.module.css';

export function RageFlashOverlay({ triggerKey }: { triggerKey: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (triggerKey <= 0) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 750);
    return () => window.clearTimeout(t);
  }, [triggerKey]);

  const particles = useMemo(() => {
    // Keep it lightweight: only render a small number.
    const count = 22;
    const seed = triggerKey * 9973;
    let x = seed % 2147483647;
    const rand = () => (x = (x * 48271) % 2147483647) / 2147483647;

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rand() * 100,
      top: rand() * 100,
      delay: rand() * 0.22,
      duration: 0.55 + rand() * 0.35,
      size: 3 + rand() * 6,
    }));
  }, [triggerKey]);

  if (!visible) return null;

  return (
    <div className={styles.overlay} aria-hidden>
      <div className={styles.flash} />
      <div className={styles.roar}>KRAKEN ROAR</div>
      <div className={styles.particles}>
        {particles.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

