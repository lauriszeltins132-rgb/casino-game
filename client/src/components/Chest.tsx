import styles from './Game.module.css';
import type { ChestContent } from '../types';

interface Props {
  index: number;
  opened: boolean;
  content?: ChestContent;
  isOpening: boolean;
  isSelected: boolean;
  disabled: boolean;
  onClick: () => void;
  variant?: 'normal' | 'bonus';
}

export function Chest({
  index,
  opened,
  content,
  isOpening,
  isSelected,
  disabled,
  onClick,
  variant = 'normal',
}: Props) {
  const showContent = opened && content;
  const isCurse = content === 'curse';
  const isTreasure = content === 'treasure';
  const isKey = content === 'golden_key';

  let animClass = '';
  if (isOpening) animClass = styles.chestOpening;
  else if (showContent && isTreasure) animClass = styles.chestTreasure;
  else if (showContent && isCurse) animClass = styles.chestCurse;
  else if (showContent && isKey) animClass = styles.chestKey;

  return (
    <button
      className={[
        styles.chest,
        variant === 'bonus' ? styles.chestBonus : '',
        opened ? styles.chestOpened : '',
        isSelected ? styles.chestSelected : '',
        animClass,
        disabled ? styles.chestDisabled : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      disabled={disabled || opened || isOpening}
      aria-label={`Chest ${index + 1}`}
    >
      <div className={styles.chestBody}>
        <div className={styles.chestLid} />
        <div className={styles.chestBase} />
        <div className={styles.chestLock} />
        <div className={styles.chestGlow} />

        {isOpening && <div className={styles.tensionRing} />}

        {showContent && isTreasure && (
          <>
            <div className={styles.treasureLight} />
            <div className={styles.coin1}>💎</div>
            <div className={styles.coin2}>🪙</div>
            <div className={styles.coin3}>💰</div>
          </>
        )}

        {showContent && isCurse && (
          <>
            <div className={styles.curseSmoke} />
            <div className={styles.curseSmoke2} />
            <div className={styles.curseSymbol}>☠</div>
            <div className={styles.tentacle} />
          </>
        )}

        {showContent && isKey && (
          <>
            <div className={styles.keyGlow} />
            <div className={styles.goldenKey}>🗝️</div>
          </>
        )}
      </div>
    </button>
  );
}
