import { useEffect, useState } from 'react';
import styles from './Odometer.module.css';

interface Props {
  value: number;
  duration?: number;
}

export function OdometerWin({ value, duration = 800 }: Props) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (value <= 0) {
      setDisplay(0);
      return;
    }
    const start = display;
    const diff = value - start;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + diff * eased);
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value, duration]);

  return (
    <span className={`${styles.odometer} ${styles.odometerWin}`}>
      ${display.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}

export function OdometerMoney({
  value,
  duration = 800,
  prefix = '$',
  className = '',
}: Props & { prefix?: string; className?: string }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (value <= 0) {
      setDisplay(0);
      return;
    }
    const start = display;
    const diff = value - start;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + diff * eased);
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value, duration]);

  return (
    <span className={`${styles.odometer} ${className}`}>
      {prefix}
      {display.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}
