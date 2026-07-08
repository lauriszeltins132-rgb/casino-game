import { useEffect, useMemo, useRef, useState } from 'react';
import type { BonusBuyTier } from '../../types';
import { audio } from '../../audio/AudioManager';
import { SymbolIcon } from '../../assets/symbols';
import { GAME_ASSETS } from '../../assets/manifest';
import { useRasterAsset } from '../../assets/useRasterAsset';
import styles from './BonusBuyCinematic.module.css';

type Stage = 'intro' | 'eye' | 'pick' | 'opening';

interface Props {
  tier: BonusBuyTier;
  bet: number;
  rewardMultiplier: number; // tier costMultiplier
  freeSpins: number; // tier spins
  onEnterBonus: () => Promise<void> | void;
}

export function BonusBuyCinematic({
  tier,
  bet,
  rewardMultiplier,
  freeSpins,
  onEnterBonus,
}: Props) {
  const [stage, setStage] = useState<Stage>('intro');
  const [picked, setPicked] = useState<number | null>(null);
  const enteredRef = useRef(false);

  const heroSrc = useRasterAsset([GAME_ASSETS.heroKraken, GAME_ASSETS.heroKrakenFallback]);

  const chestLabels = useMemo(() => {
    // purely cosmetic: vary how the player experiences the selection
    const base = tier === 'awaken' ? 'Awaken' : tier === 'fury' ? 'Fury' : 'Leviathan';
    return [`${base} I`, `${base} II`, `${base} III`];
  }, [tier]);

  useEffect(() => {
    // Match premium “BUY KRAKEN'S LAIR” pacing:
    // 0-0.5s: instant darken + rumble + shake
    // 0.5-2s: tentacles appear + water distortion (handled by CSS + OceanScene intensity)
    // 2-4s: eye opens + magical glow + screen flash
    // 4+s: transition into the lair chamber (chest pick)
    audio.play('ocean_rumble');
    audio.play('bonus_enter');
    const t1 = window.setTimeout(() => setStage('eye'), 2300);
    const t2 = window.setTimeout(() => setStage('pick'), 4600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (stage !== 'opening' || picked === null) return;

    const t = window.setTimeout(async () => {
      if (enteredRef.current) return;
      enteredRef.current = true;
      await onEnterBonus();
    }, 2350);

    return () => window.clearTimeout(t);
  }, [stage, picked, onEnterBonus]);

  const pickChest = (index: number) => {
    if (stage !== 'pick' || picked !== null) return;
    setPicked(index);
    setStage('opening');
    audio.play('water_splash');
  };

  const coinBurst = useMemo(() => {
    const count = rewardMultiplier >= 400 ? 28 : rewardMultiplier >= 150 ? 20 : 14;
    const rand = (seed: number) => {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    const seedBase = (picked ?? 0) * 997 + rewardMultiplier;
    return Array.from({ length: count }, (_, i) => {
      const r1 = rand(seedBase + i * 1.17);
      const r2 = rand(seedBase + i * 2.31);
      const r3 = rand(seedBase + i * 3.77);
      return {
        id: i,
        left: 50 + (r1 - 0.5) * 44,
        delay: r2 * 0.25,
        dur: 0.95 + r3 * 0.65,
        dx: (r1 - 0.5) * 280,
        dy: -200 - r2 * 260,
        scale: 0.7 + r3 * 0.55,
      };
    });
  }, [rewardMultiplier, picked]);

  return (
    <div className={styles.overlay} data-stage={stage}>
      <div className={styles.cameraShake} aria-hidden />

      {heroSrc && (
        <img
          className={styles.heroArt}
          src={heroSrc}
          alt=""
          draggable={false}
          style={{ opacity: stage === 'intro' || stage === 'eye' ? 0.95 : 0.65 }}
        />
      )}

      <div className={styles.darken} aria-hidden />

      <div className={styles.waterDistortion} aria-hidden />

      <div className={styles.waterExplosion} aria-hidden />

      <div className={styles.treasureAura} aria-hidden />

      <div className={styles.tentacles} aria-hidden>
        <div className={styles.tentacleLeft} />
        <div className={styles.tentacleRight} />
      </div>

      {/* Kraken Eye (scatter) opens in the center */}
      <div className={styles.eyeStage} aria-hidden>
        <div className={styles.eyeSymbol}>
          <div className={styles.eyeRing} />
          <div className={styles.eyeOpenWrap} data-active={stage === 'eye' || stage === 'pick'}>
            <SymbolIcon id="scatter" size={120} glowing={true} />
          </div>
        </div>
        <div className={styles.eyeCaption}>BUY KRAKEN&apos;S LAIR</div>
      </div>

      <div className={styles.screenFlash} aria-hidden />

      {/* Rising bubbles / gold particles */}
      <div className={styles.bubbleField} aria-hidden>
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} className={styles.bubble} style={{ ['--bi' as any]: i }} />
        ))}
      </div>

      {/* Treasure chamber + pick */}
      <div className={styles.chamber} aria-hidden={stage === 'intro' || stage === 'eye'}>
        <div className={styles.doorFrame} />

        <div className={styles.chests}>
          {[0, 1, 2].map((i) => {
            const isPicked = picked === i;
            const state = stage === 'opening' && isPicked ? 'picked' : stage === 'pick' ? 'idle' : 'locked';
            return (
              <button
                key={i}
                type="button"
                className={styles.chestBtn}
                onClick={() => pickChest(i)}
                disabled={stage !== 'pick'}
                aria-disabled={stage !== 'pick'}
                data-state={state}
              >
                <div className={styles.chestTop} />
                <div className={styles.chestBody}>
                  <SymbolIcon id="chest" size={62} glowing={stage === 'pick' || isPicked} />
                </div>
                <div className={styles.chestTag}>{chestLabels[i]}</div>
              </button>
            );
          })}
        </div>

        <div className={styles.reward}>
          <div className={styles.rewardLine}>
            {rewardMultiplier}× bonus · {freeSpins} free spins
          </div>
          <div className={styles.rewardSub}>Cost: ${Number(bet * (rewardMultiplier as number)).toFixed(2)}</div>
        </div>

      {stage === 'opening' && picked !== null && (
        <div className={styles.coinExplosion} aria-hidden>
          {coinBurst.map((c) => (
            <div
              key={c.id}
              className={styles.coin}
              style={{
                left: `${c.left}%`,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.dur}s`,
                ['--dx' as any]: `${c.dx}px`,
                ['--dy' as any]: `${c.dy}px`,
                transform: `scale(${c.scale})`,
              }}
            />
          ))}
        </div>
      )}
      </div>

      {/* Golden particles */}
      <div className={styles.goldParticles} aria-hidden>
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className={styles.goldParticle} style={{ ['--i' as any]: i }} />
        ))}
      </div>
    </div>
  );
}

