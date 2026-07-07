import { useState } from 'react';
import type { AutoplaySettings } from '../../types';
import styles from './AutoplayModal.module.css';

interface Props {
  open: boolean;
  onStart: (settings: AutoplaySettings) => void;
  onClose: () => void;
}

export function AutoplayModal({ open, onStart, onClose }: Props) {
  const [spins, setSpins] = useState(25);
  const [lossLimit, setLossLimit] = useState(50);
  const [winLimit, setWinLimit] = useState(100);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Autoplay</h2>
        <label className={styles.label}>
          Spin count
          <input type="number" min={1} max={100} value={spins} onChange={(e) => setSpins(+e.target.value)} />
        </label>
        <label className={styles.label}>
          Loss limit ($)
          <input type="number" min={0} value={lossLimit} onChange={(e) => setLossLimit(+e.target.value)} />
        </label>
        <label className={styles.label}>
          Win limit ($)
          <input type="number" min={0} value={winLimit} onChange={(e) => setWinLimit(+e.target.value)} />
        </label>
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose}>Cancel</button>
          <button
            type="button"
            className={styles.start}
            onClick={() => { onStart({ spinCount: spins, lossLimit, winLimit }); onClose(); }}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
