import { useState } from 'react';
import type { BonusChestOutcome, BonusState } from '../../types';
import { audio } from '../../audio/AudioManager';
import styles from './KrakenLair.module.css';

interface Props {
  bonus: BonusState;
  onPick: (index: number) => void;
  lastOutcome: BonusChestOutcome | null;
  lastPayout: number;
  picking: boolean;
}

const OUTCOME_LABELS: Record<BonusChestOutcome, string> = {
  gold_coins: 'Gold Coins',
  multiplier_x2: '×2 Multiplier',
  multiplier_x3: '×3 Multiplier',
  multiplier_x5: '×5 Multiplier',
  multiplier_x10: '×10 Multiplier',
  kraken_rage: 'Kraken Rage! +2 Picks',
  ancient_relic: 'Ancient Relic',
  jackpot: 'JACKPOT CHEST',
};

export function KrakenLair({ bonus, onPick, lastOutcome, lastPayout, picking }: Props) {
  const [revealed, setRevealed] = useState<number | null>(null);
  const ragePercent = Math.min(100, (bonus.rageMeter / 10) * 100);

  const handlePick = (index: number) => {
    if (picking || bonus.chests[index].picked || bonus.picksRemaining <= 0) return;
    audio.play('chest_open');
    setRevealed(index);
    onPick(index);
  };

  return (
    <div className={styles.lair}>
      <div className={styles.lairBg} />
      <div className={styles.lairContent}>
        <h2 className={styles.title}>Kraken&apos;s Lair</h2>
        <p className={styles.subtitle}>Pick treasure chests from the sunken temple</p>

        <div className={styles.meters}>
          <div className={styles.meter}>
            <span className={styles.meterLabel}>Picks Remaining</span>
            <span className={styles.meterValue}>{bonus.picksRemaining}</span>
          </div>
          <div className={styles.meter}>
            <span className={styles.meterLabel}>Relics</span>
            <span className={styles.meterValue}>{bonus.relicsCollected}/3</span>
          </div>
          <div className={styles.meter}>
            <span className={styles.meterLabel}>Bonus Win</span>
            <span className={styles.meterValue}>${bonus.totalWin.toFixed(2)}</span>
          </div>
        </div>

        <div className={styles.rageBar}>
          <span className={styles.rageLabel}>
            Kraken Rage {bonus.rageLevel > 0 ? `— Level ${bonus.rageLevel} (×${bonus.rageMultiplier})` : ''}
          </span>
          <div className={styles.rageTrack}>
            <div className={styles.rageFill} style={{ width: `${ragePercent}%` }} />
            {[3, 6, 10].map((t) => (
              <div key={t} className={styles.rageTick} style={{ left: `${t * 10}%` }} />
            ))}
          </div>
        </div>

        <div className={styles.chestGrid}>
          {bonus.chests.map((chest) => (
            <button
              key={chest.index}
              className={[
                styles.chest,
                chest.picked ? styles.chestOpen : '',
                revealed === chest.index ? styles.chestReveal : '',
              ].filter(Boolean).join(' ')}
              onClick={() => handlePick(chest.index)}
              disabled={chest.picked || picking || bonus.picksRemaining <= 0}
            >
              {chest.picked && chest.outcome ? (
                <div className={styles.chestResult}>
                  <span className={styles.chestOutcome}>{OUTCOME_LABELS[chest.outcome]}</span>
                  {chest.payout !== undefined && chest.payout > 0 && (
                    <span className={styles.chestPayout}>+${chest.payout.toFixed(2)}</span>
                  )}
                </div>
              ) : (
                <div className={styles.chestClosed}>
                  <svg viewBox="0 0 60 50" width="48" height="40">
                    <rect x="8" y="22" width="44" height="24" rx="3" fill="#5d3a1a" stroke="#c9a227" strokeWidth="2" />
                    <path d="M8 22 L14 14 L46 14 L52 22 Z" fill="#8b4513" stroke="#c9a227" strokeWidth="2" />
                    <rect x="25" y="28" width="10" height="10" rx="2" fill="#c9a227" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {lastOutcome && lastPayout > 0 && (
          <div className={styles.lastWin}>
            {OUTCOME_LABELS[lastOutcome]} — +${lastPayout.toFixed(2)}
          </div>
        )}

        {bonus.completed && (
          <div className={styles.complete}>
            <h3>Lair Conquered!</h3>
            <p>Total Bonus: ${bonus.totalWin.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface IntroProps {
  onStart: () => void;
}

export function BonusIntro({ onStart }: IntroProps) {
  return (
    <div className={styles.introOverlay} onClick={onStart}>
      <div className={styles.introCard}>
        <div className={styles.introEye}>
          <svg viewBox="0 0 100 80" width="120" height="96">
            <defs>
              <radialGradient id="introEye">
                <stop offset="0%" stopColor="#2ecc71" />
                <stop offset="100%" stopColor="#0a1628" />
              </radialGradient>
            </defs>
            <ellipse cx="50" cy="40" rx="45" ry="35" fill="url(#introEye)" />
            <ellipse cx="50" cy="40" rx="18" ry="25" fill="#0a1628" />
            <ellipse cx="50" cy="38" rx="8" ry="12" fill="#2ecc71" />
          </svg>
        </div>
        <h2>KRAKEN&apos;S LAIR</h2>
        <p>The ancient Kraken grants you 10 picks among 15 treasure chests.</p>
        <p className={styles.introHint}>Fill the Rage meter for bigger prizes!</p>
        <span className={styles.introTap}>Tap to enter</span>
      </div>
    </div>
  );
}
