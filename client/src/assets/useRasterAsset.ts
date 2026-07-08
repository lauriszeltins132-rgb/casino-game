import { useEffect, useState } from 'react';

/** Try URLs in order; returns first that loads, or null (use SVG fallback). */
export function useRasterAsset(urls: string[]): string | null {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSrc(null);

    const tryNext = (index: number) => {
      if (cancelled || index >= urls.length) return;
      const img = new Image();
      img.onload = () => {
        if (!cancelled) setSrc(urls[index]);
      };
      img.onerror = () => tryNext(index + 1);
      img.src = urls[index];
    };

    tryNext(0);
    return () => {
      cancelled = true;
    };
  }, [urls.join('|')]);

  return src;
}
