import { useEffect, useRef, useState } from 'react';
import type { InkOrb, SymbolId } from '../../types';
import { SymbolIcon } from '../../assets/symbols';
import { PaylineTrace } from '../PaylineTrace';
import type { LineWin } from '../../types';
import styles from './ReelGrid.module.css';

interface Props {
  grid: SymbolId[][] | null;
  spinning: boolean;
  anticipation: boolean;
  winningCells: Set<string>;
  inkOrbs: InkOrb[];
  lineWins: LineWin[];
  paylines: number[][];
  showPaylines: boolean;
  onSpinComplete: () => void;
}

const BASE_DELAYS = [400, 580, 760, 980, 1200];
const ANTICIPATION_EXTRA = [0, 0, 0, 600, 900];

export function ReelGrid({
  grid,
  spinning,
  anticipation,
  winningCells,
  inkOrbs,
  lineWins,
  paylines,
  showPaylines,
  onSpinComplete,
}: Props) {
  const [display, setDisplay] = useState<SymbolId[][]>(
    grid ?? defaultGrid()
  );
  const [activeReels, setActiveReels] = useState([false, false, false, false, false]);
  const [landed, setLanded] = useState([false, false, false, false, false]);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!spinning) {
      if (grid) setDisplay(grid);
      setActiveReels([false, false, false, false, false]);
      setLanded([false, false, false, false, false]);
      return;
    }

    doneRef.current = false;
    setActiveReels([true, true, true, true, true]);
    setLanded([false, false, false, false, false]);

    const delays = BASE_DELAYS.map((d, i) => d + (anticipation ? ANTICIPATION_EXTRA[i] : 0));
    const maxDelay = Math.max(...delays) + 400;
    const timers: ReturnType<typeof setTimeout>[] = [];

    delays.forEach((delay, reel) => {
      timers.push(
        setTimeout(() => {
          setActiveReels((p) => { const n = [...p]; n[reel] = false; return n; });
          setLanded((p) => { const n = [...p]; n[reel] = true; return n; });
          if (grid) {
            setDisplay((prev) => {
              const next = prev.map((row) => [...row]);
              for (let r = 0; r < 3; r++) next[r][reel] = grid[r][reel];
              return next;
            });
          }
          setTimeout(() => setLanded((p) => { const n = [...p]; n[reel] = false; return n; }), 350);
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
      }, maxDelay)
    );

    return () => timers.forEach(clearTimeout);
  }, [spinning, grid, anticipation, onSpinComplete]);

  const orbAt = (row: number, col: number) =>
    inkOrbs.find((o) => o.row === row && o.col === col);

  return (
    <div className={`${styles.frame} ${anticipation && spinning ? styles.anticipation : ''}`}>
      <div className={styles.brassRim} />
      <div className={styles.inner}>
        <div className={styles.causticTop} />
        <span className={styles.badge}>20 LINES</span>
        <div className={styles.gridWrap}>
          <div className={styles.grid}>
            {Array.from({ length: 5 }, (_, col) => (
              <div
                key={col}
                className={`${styles.reel} ${activeReels[col] ? styles.spin : ''} ${landed[col] ? styles.land : ''}`}
              >
                {[0, 1, 2].map((row) => {
                  const key = `${row}-${col}`;
                  const win = winningCells.has(key);
                  const orb = orbAt(row, col);
                  return (
                    <div key={row} className={`${styles.cell} ${win ? styles.cellWin : ''}`}>
                      <SymbolIcon id={display[row][col]} size={52} glowing={win} />
                      {orb && (
                        <span className={styles.orb} style={{ animationDelay: `${col * 0.1}s` }}>
                          x{orb.value}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <PaylineTrace
            lineWins={lineWins}
            paylines={paylines}
            visible={showPaylines}
            cellSize={72}
            gap={6}
          />
        </div>
      </div>
    </div>
  );
}

function defaultGrid(): SymbolId[][] {
  return [
    ['rope', 'compass', 'map', 'bell', 'skull'],
    ['barnacle', 'crown', 'chest', 'spyglass', 'wheel'],
    ['anchor_chain', 'wheel', 'rope', 'compass', 'map'],
  ];
}
