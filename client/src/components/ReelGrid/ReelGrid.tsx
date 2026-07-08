import { useEffect, useRef, useState } from 'react';
import type { InkOrb, SymbolId } from '../../types';
import { SymbolIcon } from '../../assets/symbols';
import { GAME_ASSETS } from '../../assets/manifest';
import { useRasterAsset } from '../../assets/useRasterAsset';
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
const SYMBOL_POOL: SymbolId[] = [
  'rope',
  'barnacle',
  'anchor_chain',
  'wheel',
  'compass',
  'spyglass',
  'map',
  'bell',
  'skull',
  'crown',
  'chest',
  'wild',
  'scatter',
];

function pickRandomSymbol(): SymbolId {
  const r = Math.random();
  // UI-only: keep special symbols rare while the reels are spinning.
  if (r < 0.02) return 'scatter';
  if (r < 0.06) return 'wild';
  if (r < 0.09) return 'chest';
  if (r < 0.12) return 'crown';
  const normal = SYMBOL_POOL.filter((s) => !['scatter', 'wild', 'chest', 'crown'].includes(s));
  return normal[Math.floor(Math.random() * normal.length)];
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function spinIntervalMs(p: number) {
  // p: 0..1 progress through that reel's stop time.
  // Phase 1 accelerates (interval gets smaller), Phase 2 decelerates (interval grows).
  if (p < 0.6) {
    const t = p / 0.6;
    return 95 - 35 * t; // ~95ms -> ~60ms
  }
  const t = (p - 0.6) / 0.4;
  return 60 + 95 * t; // ~60ms -> ~155ms
}

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
  const frameSrc = useRasterAsset([
    GAME_ASSETS.reelFrame,
    GAME_ASSETS.reelFrameFallback,
  ]);

  useEffect(() => {
    if (!spinning) {
      if (grid) setDisplay(grid);
      setActiveReels([false, false, false, false, false]);
      setLanded([false, false, false, false, false]);
      return;
    }

    // If the backend hasn't returned the final grid yet, wait — we need
    // the real symbols for the stopping phase.
    if (!grid) return;

    doneRef.current = false;
    setActiveReels([true, true, true, true, true]);
    setLanded([false, false, false, false, false]);

    const jitter = [0, 70, -40, 55, -25];
    const delays = BASE_DELAYS.map((d, i) => d + (anticipation ? ANTICIPATION_EXTRA[i] : 0) + jitter[i]);
    const maxDelay = Math.max(...delays) + 420;

    let cancelled = false;
    const start = performance.now();

    const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

    const runReel = async (reel: number) => {
      const finalCol = [grid[0][reel], grid[1][reel], grid[2][reel]] as SymbolId[];
      const reelStopAfter = delays[reel];

      while (!cancelled) {
        const elapsed = performance.now() - start;
        const p = clamp01(elapsed / reelStopAfter);
        if (elapsed >= reelStopAfter) break;

        // Cycle UI symbols to simulate movement without affecting RNG/paytable.
        const newSymbols: SymbolId[] = [pickRandomSymbol(), pickRandomSymbol(), pickRandomSymbol()];
        setDisplay((prev) => {
          const next = prev.map((row) => [...row]);
          for (let r = 0; r < 3; r++) next[r][reel] = newSymbols[r];
          return next;
        });

        const interval = spinIntervalMs(p);
        await sleep(interval);
      }

      if (cancelled) return;

      // Reel stops
      setActiveReels((p) => {
        const n = [...p];
        n[reel] = false;
        return n;
      });
      setLanded((p) => {
        const n = [...p];
        n[reel] = true;
        return n;
      });

      setDisplay((prev) => {
        const next = prev.map((row) => [...row]);
        for (let r = 0; r < 3; r++) next[r][reel] = finalCol[r];
        return next;
      });

      window.setTimeout(() => {
        setLanded((p) => {
          const n = [...p];
          n[reel] = false;
          return n;
        });
      }, 360);
    };

    // Kick off all reels (independent stop times)
    runReel(0);
    runReel(1);
    runReel(2);
    runReel(3);
    runReel(4);

    const doneTimer = window.setTimeout(() => {
      if (cancelled) return;
      if (!doneRef.current) {
        doneRef.current = true;
        setDisplay(grid);
        onSpinComplete();
      }
    }, maxDelay);

    return () => {
      cancelled = true;
      window.clearTimeout(doneTimer);
    };
  }, [spinning, grid, anticipation, onSpinComplete]);

  const orbAt = (row: number, col: number) =>
    inkOrbs.find((o) => o.row === row && o.col === col);

  return (
    <div
      className={`${styles.frame} ${anticipation && spinning ? styles.anticipation : ''} ${frameSrc ? styles.frameRaster : ''}`}
      style={frameSrc ? { backgroundImage: `url(${frameSrc})` } : undefined}
    >
      {!frameSrc && <div className={styles.brassRim} />}
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
                  const resultRevealed = !spinning;
                  const landedHere = landed[col];
                  const win = resultRevealed && winningCells.has(key);
                  const orb = orbAt(row, col);
                  const sym = display[row][col];
                  const specialOn = resultRevealed || landedHere;
                  return (
                    <div
                      key={row}
                      className={[
                        styles.cell,
                        win ? styles.cellWin : '',
                        specialOn && sym === 'wild' ? styles.cellWild : '',
                        specialOn && sym === 'scatter' ? styles.cellScatter : '',
                        specialOn && sym === 'chest' ? styles.cellChest : '',
                        specialOn && sym === 'crown' ? styles.cellCrown : '',
                      ].join(' ')}
                    >
                      <SymbolIcon
                        id={sym}
                        size={52}
                        glowing={
                          win ||
                          (specialOn && (sym === 'wild' || sym === 'scatter' || sym === 'crown' || sym === 'chest'))
                        }
                      />
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
