import styles from './RageMeter.module.css';

interface Props {
  value: number; // 0..100
  pulseKey?: number; // bump to retrigger CSS pulse
}

export function RageMeter({ value, pulseKey = 0 }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const level = Math.floor(clamped / 10);

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>RAGE</div>
      <div className={styles.barOuter}>
        <div
          key={pulseKey}
          className={styles.barInner}
          style={{
            width: `${clamped}%`,
            ['--rageFill' as any]: `${clamped}%`,
          }}
        />
      </div>
      <div className={styles.level}>LVL {level}</div>
    </div>
  );
}

