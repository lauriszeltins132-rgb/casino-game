import { GAME_ASSETS } from '../../assets/manifest';
import { useRasterAsset } from '../../assets/useRasterAsset';
import styles from './SceneBackground.module.css';

export function SceneBackground() {
  const src = useRasterAsset([
    GAME_ASSETS.background,
    GAME_ASSETS.backgroundFallback,
  ]);

  if (!src) return null;

  return (
    <div
      className={styles.bg}
      style={{ backgroundImage: `url(${src})` }}
      aria-hidden
    />
  );
}
