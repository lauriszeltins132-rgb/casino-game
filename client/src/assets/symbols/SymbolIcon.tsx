import { symbolAssetSources } from '../manifest';
import { useRasterAsset } from '../useRasterAsset';
import type { SymbolId } from '../../types';
import { SymbolIconSvg } from './SymbolIconSvg';

interface Props {
  id: SymbolId;
  size?: number;
  glowing?: boolean;
}

export function SymbolIcon({ id, size = 64, glowing = false }: Props) {
  const rasterSrc = useRasterAsset(symbolAssetSources(id));

  if (rasterSrc) {
    return (
      <img
        src={rasterSrc}
        alt=""
        width={size}
        height={size}
        draggable={false}
        className={glowing ? 'sym-glow' : undefined}
        style={{
          objectFit: 'contain',
          filter: glowing ? 'drop-shadow(0 0 8px rgba(255,201,74,0.9))' : undefined,
        }}
      />
    );
  }

  return <SymbolIconSvg id={id} size={size} glowing={glowing} />;
}
