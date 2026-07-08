import type { GameConfig, SymbolId } from '../../types';
import { SymbolIcon } from '../../assets/symbols';
import styles from './Paytable.module.css';

const ORDER: SymbolId[] = [
  'rope', 'barnacle', 'anchor_chain', 'wheel', 'compass', 'spyglass',
  'map', 'bell', 'skull', 'crown', 'chest', 'wild', 'scatter',
];

interface Props {
  config: GameConfig;
  open: boolean;
  onClose: () => void;
}

export function Paytable({ config, open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Paytable</h2>
        <p className={styles.note}>
          20 lines · Pays left-to-right · 3+ matching · Per line bet = total bet ÷ 20
          <br />
          RTP {(config.targetRtp * 100).toFixed(1)}% target
          {config.fsTriggerRate ? ` · FS ~${config.fsTriggerRate}` : ''}
          {' · '}Hit freq {config.hitFrequency} · {config.volatility}
        </p>
        <div className={styles.table}>
          {ORDER.map((id) => {
            const sym = config.symbols.find((s) => s.id === id);
            const pays = config.paytable[id];
            return (
              <div key={id} className={styles.row}>
                <div className={styles.sym}>
                  <SymbolIcon id={id} size={36} />
                  <span>{sym?.name}</span>
                </div>
                <div className={styles.pays}>
                  {id === 'scatter' ? (
                    <span>
                      3: {config.scatterAwards[3]?.spins} FS + {config.scatterAwards[3]?.payMultiplier}x
                      {' · '}
                      4: {config.scatterAwards[4]?.spins} FS + {config.scatterAwards[4]?.payMultiplier}x
                      {' · '}
                      5: {config.scatterAwards[5]?.spins} FS + {config.scatterAwards[5]?.payMultiplier}x
                    </span>
                  ) : id === 'wild' ? (
                    <span>Substitutes · 5-kind = {pays[2]}x line bet</span>
                  ) : (
                    <span>3x={pays[0]} · 4x={pays[1]} · 5x={pays[2]}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className={styles.fsNote}>
          Free Spins: Ink Orbs (2x–50x) drop on winning spins. Orb values sum and multiply that spin&apos;s win.
        </p>
        <button type="button" className={styles.close} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
