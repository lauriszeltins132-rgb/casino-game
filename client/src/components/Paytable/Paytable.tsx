import type { GameConfig } from '../../types';
import { SymbolIcon } from '../../assets/symbols';
import type { SymbolId } from '../../types';
import styles from './Paytable.module.css';

interface Props {
  config: GameConfig;
  open: boolean;
  onClose: () => void;
}

const ORDER: SymbolId[] = [
  'crown', 'trident', 'chest', 'pearl', 'anchor', 'compass', 'map', 'coin', 'wild', 'scatter',
];

export function Paytable({ config, open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Paytable</h2>
        <p className={styles.note}>20 paylines · Wins = bet × multiplier · RTP {config.targetRtp * 100}%</p>

        <div className={styles.table}>
          {ORDER.map((id) => {
            const sym = config.symbols.find((s) => s.id === id);
            const pays = config.paytable[id];
            return (
              <div key={id} className={styles.row}>
                <div className={styles.sym}>
                  <SymbolIcon id={id} size={40} />
                  <span>{sym?.name}</span>
                </div>
                <div className={styles.pays}>
                  {id === 'scatter' ? (
                    <span>3={config.scatterPay[3]}× · 4=Bonus+{config.scatterPay[4]}× · 5={config.scatterPay[5]}×</span>
                  ) : (
                    <span>{pays[0]}× / {pays[1]}× / {pays[2]}×</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button className={styles.close} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
