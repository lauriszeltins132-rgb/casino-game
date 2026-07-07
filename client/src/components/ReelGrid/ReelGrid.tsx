import { useEffect, useRef, useState } from 'react';
import type { SymbolId } from '../../types';
import { SymbolIcon } from '../../assets/symbols';
import styles from './ReelGrid.module.css';

interface Props {
  grid: SymbolId[][] | null;
  spinning: boolean;
  winningCells: Set<string>;
  onSpinComplete: () => void;
}

const REEL_DELAYS = [500, 750, 1000, 1250, 1500];
const SPIN_MS = 1700;

const DEFAULT: SymbolId[][] = [
  ['coin', 'anchor', 'compass', 'map', 'pearl'],
  ['anchor', 'crown', 'trident', 'chest', 'coin'],
  ['compass', 'map', 'pearl', 'anchor', 'compass'],
];

export function ReelGrid({ grid, spinning, winningCells, onSpinComplete }: Props) {
  const [display, setDisplay] = useState<SymbolId[][]>(grid ?? DEFAULT);
  const [activeReels, setActiveReels] = useState<boolean[]>([false, false, false, false, false]);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!spinning) {
      if (grid) setDisplay(grid);
      setActiveReels([false, false, false, false, false]);
      return;
    }

    doneRef.current = false;
    setActiveReels([true, true, true, true, true]);

    const timers: ReturnType<typeof setTimeout>[] = [];

    REEL_DELAYS.forEach((delay, reel) => {
      timers.push(
        setTimeout(() => {
          setActiveReels((prev) => {
            const n = [...prev];
            n[reel] = false;
            return n;
          });
          if (grid) {
            setDisplay((prev) => {
              const next = prev.map((row) => [...row]);
              for (let r = 0; r < 3; r++) next[r][reel] = grid[r][reel];
              return next;
            });
          }
        }, delay)
      );
    });

    timers.push(
      setTimeout(() => {
        if (!doneRef.current) {
          doneRef.current = true;
          if (grid) setDisplay(grid);
          onSpinComplete();
        }
      }, SPIN_MS)
    );

    return () => timers.forEach(clearTimeout);
  }, [spinning, grid, onSpinComplete]);

  return (
    <div className={styles.frame}>
      <div className={styles.frameGlow} />
      <div className={styles.inner}>
        <div className={styles.lineBadge}>20 LINES</div>
        <div className={styles.grid}>
          {Array.from({ length: 5 }, (_, col) => (
            <div
              key={col}
              className={`${styles.reel} ${activeReels[col] ? styles.reelSpin : ''} ${!activeReels[col] && spinning ? styles.reelLand : ''}`}
            >
              {[0, 1, 2].map((row) => {
                const key = `${row}-${col}`;
                const win = winningCells.has(key);
                return (
                  <div
                    key={row}
                    className={`${styles.cell} ${win ? styles.cellWin : ''}`}
                  >
                    <SymbolIcon id={display[row][col]} size={56} glowing={win} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
