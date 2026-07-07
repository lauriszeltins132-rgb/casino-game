import type { LineWin } from '../../types';
import { getWinningLinePaths } from '../../gameLogic/helpers';
import styles from './PaylineTrace.module.css';

interface Props {
  lineWins: LineWin[];
  paylines: number[][];
  visible: boolean;
  cellSize?: number;
  gap?: number;
}

export function PaylineTrace({ lineWins, paylines, visible, cellSize = 88, gap = 6 }: Props) {
  if (!visible || lineWins.length === 0) return null;

  const w = 5 * cellSize + 4 * gap;
  const h = 3 * cellSize + 2 * gap;
  const paths = getWinningLinePaths(lineWins, paylines, cellSize, cellSize, gap);

  return (
    <svg className={styles.trace} viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#FFC94A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.pathAnim}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </svg>
  );
}
