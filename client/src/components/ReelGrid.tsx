import { useEffect, useRef, useState } from 'react';
import type { SymbolId, SymbolInfo } from '../types';
import { getSymbolEmoji } from '../utils/symbols';
import styles from './Slot.module.css';

interface Props {
  grid: SymbolId[][] | null;
  spinning: boolean;
  winningLines: number[];
  symbols: SymbolInfo[];
  onSpinComplete?: () => void;
}

const REEL_STOP_DELAYS = [600, 900, 1200, 1500, 1800];
const SPIN_DURATION = 2000;

export function ReelGrid({ grid, spinning, winningLines, symbols, onSpinComplete }: Props) {
  const [displayGrid, setDisplayGrid] = useState<SymbolId[][] | null>(grid);
  const [reelSpinning, setReelSpinning] = useState<boolean[]>([false, false, false, false, false]);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!spinning) {
      setDisplayGrid(grid);
      setReelSpinning([false, false, false, false, false]);
      return;
    }

    completedRef.current = false;
    setReelSpinning([true, true, true, true, true]);

    const timers: ReturnType<typeof setTimeout>[] = [];

    REEL_STOP_DELAYS.forEach((delay, reelIndex) => {
      timers.push(
        setTimeout(() => {
          setReelSpinning((prev) => {
            const next = [...prev];
            next[reelIndex] = false;
            return next;
          });
          if (grid) {
            setDisplayGrid((prev) => {
              const next = prev ? prev.map((row) => [...row]) : [
                ['coin', 'coin', 'coin', 'coin', 'coin'],
                ['coin', 'coin', 'coin', 'coin', 'coin'],
                ['coin', 'coin', 'coin', 'coin', 'coin'],
              ] as SymbolId[][];
              for (let row = 0; row < 3; row++) {
                next[row][reelIndex] = grid[row][reelIndex];
              }
              return next;
            });
          }
        }, delay)
      );
    });

    timers.push(
      setTimeout(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          setDisplayGrid(grid);
          onSpinComplete?.();
        }
      }, SPIN_DURATION)
    );

    return () => timers.forEach(clearTimeout);
  }, [spinning, grid, onSpinComplete]);

  const currentGrid = displayGrid ?? [
    ['coin', 'anchor', 'compass', 'parrot', 'map'],
    ['anchor', 'coin', 'parrot', 'map', 'captain'],
    ['compass', 'parrot', 'map', 'captain', 'ship'],
  ] as SymbolId[][];

  const isWinningCell = (_row: number, _col: number): boolean => {
    if (winningLines.length === 0) return false;
    return false;
  };

  return (
    <div className={styles.reelFrame}>
      <div className={styles.reelFrameInner}>
        <div className={styles.paylineIndicator}>10 LINES</div>
        <div className={styles.reelGrid}>
          {Array.from({ length: 5 }, (_, col) => (
            <div
              key={col}
              className={`${styles.reel} ${reelSpinning[col] ? styles.reelActive : ''}`}
            >
              <div className={styles.reelStrip}>
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    className={`${styles.symbolCell} ${isWinningCell(row, col) ? styles.symbolWin : ''}`}
                  >
                    <span className={styles.symbolEmoji}>
                      {getSymbolEmoji(currentGrid[row][col], symbols)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
