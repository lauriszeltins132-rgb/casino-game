import { useEffect, useRef } from 'react';
import { Application, Graphics, Container } from 'pixi.js';

interface Props {
  intensity?: 'base' | 'freespin' | 'anticipation' | 'bonus';
  bigWin?: boolean;
}

export function OceanScene({ intensity = 'base', bigWin = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;

    const app = new Application();
    appRef.current = app;

    (async () => {
      try {
        await app.init({
          resizeTo: containerRef.current!,
          backgroundAlpha: 0,
          antialias: true,
          preference: 'webgl',
        });
      } catch (err) {
        console.warn('OceanScene WebGL init failed — CSS fallback will show:', err);
        return;
      }

      if (destroyed) {
        app.destroy(true);
        return;
      }

      containerRef.current!.appendChild(app.canvas);

      const w = () => app.screen.width;
      const h = () => app.screen.height;

      const root = new Container();
      app.stage.addChild(root);

      const bg = new Graphics();
      const ships: { g: Graphics; phase: number; speed: number; y: number }[] = [];
      const bubbles: { g: Graphics; x: number; y: number; speed: number }[] = [];
      let tentacleTimer = 0;
      let tentacle: Graphics | null = null;
      let tentacleProgress = 0;
      let lightningFlash = 0;
      let causticPhase = 0;

      function drawBg() {
        bg.clear();
        const H = h();
        const W = w();
        bg.rect(0, 0, W, H);
        bg.fill({ color: 0x050b14 });
        for (let i = 0; i < 6; i++) {
          bg.rect(0, H * 0.1 * i, W, H * 0.2);
          bg.fill({ color: 0x0c1b2e, alpha: 0.15 - i * 0.02 });
        }
        const rayAlpha = intensity === 'freespin' ? 0.12 : 0.06;
        bg.moveTo(W * 0.3, 0);
        bg.lineTo(W * 0.45, H);
        bg.lineTo(W * 0.35, H);
        bg.closePath();
        bg.fill({ color: 0x1fe3b4, alpha: rayAlpha });
      }

      function createShip(x: number, y: number, speed: number, phase: number) {
        const g = new Graphics();
        g.moveTo(0, 0);
        g.lineTo(40, -8);
        g.lineTo(80, 0);
        g.lineTo(70, 20);
        g.lineTo(10, 20);
        g.closePath();
        g.fill({ color: 0x0a1520, alpha: 0.7 });
        g.moveTo(35, -8);
        g.lineTo(38, -35);
        g.lineTo(42, -8);
        g.closePath();
        g.fill({ color: 0x0a1520, alpha: 0.5 });
        g.x = x;
        g.y = y;
        root.addChild(g);
        ships.push({ g, phase, speed, y });
      }

      for (let i = 0; i < 4; i++) {
        createShip(
          (i / 4) * 800,
          h() * (0.15 + i * 0.08),
          0.3 + i * 0.15,
          i * 1.7
        );
      }

      for (let i = 0; i < 30; i++) {
        const g = new Graphics();
        g.circle(0, 0, 1 + Math.random() * 3);
        g.fill({ color: 0x1fe3b4, alpha: 0.2 + Math.random() * 0.3 });
        g.x = Math.random() * w();
        g.y = Math.random() * h();
        root.addChildAt(g, 1);
        bubbles.push({ g, x: g.x, y: g.y, speed: 0.3 + Math.random() * 0.8 });
      }

      root.addChildAt(bg, 0);

      const caustics = new Graphics();
      root.addChild(caustics);

      app.ticker.add((ticker) => {
        const dt = ticker.deltaTime / 60;
        const W = w();
        const H = h();
        const t = performance.now() / 1000;

        ships.forEach((s) => {
          s.g.x = ((t * s.speed * 20 + s.phase * 200) % (W + 100)) - 50;
          s.g.y = s.y + Math.sin(t * 0.8 + s.phase) * (bigWin ? 12 : 6);
          s.g.rotation = Math.sin(t * 0.5 + s.phase) * (bigWin ? 0.08 : 0.03);
        });

        bubbles.forEach((b) => {
          b.y -= b.speed * dt * 40;
          b.g.y = b.y;
          b.g.x = b.x + Math.sin(t + b.x) * 0.5;
          if (b.y < -10) {
            b.y = H + 10;
            b.x = Math.random() * W;
          }
        });

        tentacleTimer += dt;
        const tentacleInterval =
          intensity === 'freespin' || intensity === 'bonus' ? 8 : 25 + Math.sin(t) * 5;

        if (!tentacle && tentacleTimer > tentacleInterval) {
          tentacleTimer = 0;
          tentacle = new Graphics();
          tentacle.moveTo(W * 0.3, H + 20);
          tentacle.bezierCurveTo(
            W * 0.25, H * 0.7,
            W * 0.35, H * 0.5,
            W * 0.4, H * 0.35
          );
          tentacle.stroke({ color: 0x1a4a3a, width: 18, alpha: 0.8 });
          for (let i = 0; i < 5; i++) {
            tentacle.circle(W * 0.38 + i * 3, H * 0.4 + i * 8, 4);
            tentacle.fill({ color: 0x00ff9c, alpha: 0.4 });
          }
          root.addChild(tentacle);
          tentacleProgress = 0;
        }

        if (tentacle) {
          tentacleProgress += dt * 0.5;
          tentacle.alpha = tentacleProgress < 0.5
            ? tentacleProgress * 2
            : Math.max(0, 1 - (tentacleProgress - 0.5) * 2);
          if (tentacleProgress > 1.2) {
            root.removeChild(tentacle);
            tentacle.destroy();
            tentacle = null;
          }
        }

        if (intensity === 'freespin' && Math.random() < 0.002) {
          lightningFlash = 1;
        }
        if (lightningFlash > 0) {
          lightningFlash -= dt * 2;
          bg.alpha = 1 + lightningFlash * 0.3;
        } else {
          bg.alpha = 1;
        }

        causticPhase += dt * 0.5;
        caustics.clear();
        for (let i = 0; i < 8; i++) {
          const cx = (Math.sin(causticPhase + i) * 0.5 + 0.5) * W;
          caustics.circle(cx, H * 0.1, 30 + i * 5);
          caustics.fill({ color: 0x1fe3b4, alpha: 0.03 });
        }

        if (intensity === 'anticipation') {
          caustics.rect(0, 0, W, H);
          caustics.fill({ color: 0xff2020, alpha: 0.04 + Math.sin(t * 8) * 0.02 });
        }
      });

      drawBg();
      app.renderer.on('resize', drawBg);
    })();

    return () => {
      destroyed = true;
      appRef.current?.destroy(true);
      appRef.current = null;
    };
  }, []);

  useEffect(() => {
    // intensity changes handled by ticker reading closure - re-mount on major mode change
  }, [intensity, bigWin]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
