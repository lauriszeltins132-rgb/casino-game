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
  const multi = lineWins.length;
  const baseWidth = multi >= 4 ? 5 : multi >= 2 ? 4 : 3;
  const glowWidth = baseWidth + (multi >= 3 ? 3 : 2);
  const dotCount = multi >= 4 ? 3 : multi >= 2 ? 2 : 1;
  const tealBoost = multi >= 3;

  return (
    <svg className={styles.trace} viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      {paths.map((d, i) => (
        <g key={i}>
          <path
            d={d}
            fill="none"
            stroke={tealBoost ? '#1FE3B4' : '#FFC94A'}
            strokeWidth={glowWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={multi >= 2 ? 0.18 : 0.12}
            className={styles.pathGlowAnim}
            style={{ animationDelay: `${i * 0.08}s` }}
          />
          <path
            d={d}
            fill="none"
            stroke="#FFC94A"
            strokeWidth={baseWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.pathAnim}
            style={{ animationDelay: `${i * 0.1}s` }}
          />

          {Array.from({ length: dotCount }).map((_, j) => (
            <circle
              key={`${i}-${j}`}
              r={3.2}
              fill="#1FE3B4"
              opacity={1}
              className={styles.travelDot}
              style={{ animationDelay: `${i * 0.1 + j * 0.12}s` }}
            >
              <animateMotion
                dur="0.85s"
                begin={`${i * 0.1 + j * 0.12}s`}
                fill="freeze"
                rotate="auto"
                path={d}
              />
            </circle>
          ))}
        </g>
      ))}
    </svg>
  );
}
