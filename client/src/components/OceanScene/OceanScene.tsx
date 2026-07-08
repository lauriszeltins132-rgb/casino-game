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
      const particles: { g: Graphics; x: number; y: number; speed: number }[] = [];
      let tentacleTimer = 0;
      let tentacle: Graphics | null = null;
      let tentacleProgress = 0;
      let lightningFlash = 0;
      let causticPhase = 0;
      let raysPhase = 0;
      let krakenShiftX = 0;
      let krakenTargetShiftX = 0;
      let krakenMoveTimer = 0;

      function drawBg() {
        bg.clear();
        const H = h();
        const W = w();
        bg.rect(0, 0, W, H);
        bg.fill({ color: 0x062a44 });
        for (let i = 0; i < 6; i++) {
          bg.rect(0, H * 0.1 * i, W, H * 0.2);
          // Brighter ocean layers for premium fantasy feel.
          bg.fill({ color: 0x075a93, alpha: 0.22 - i * 0.025 });
        }
        const rayAlpha =
          intensity === 'freespin' ? 0.22 : intensity === 'bonus' ? 0.18 : 0.12;
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

      for (let i = 0; i < 45; i++) {
        const g = new Graphics();
        g.circle(0, 0, 1.5 + Math.random() * 4.0);
        g.fill({ color: 0x7ae7ff, alpha: 0.25 + Math.random() * 0.45 });
        g.x = Math.random() * w();
        g.y = Math.random() * h();
        root.addChildAt(g, 1);
        bubbles.push({ g, x: g.x, y: g.y, speed: 0.45 + Math.random() * 1.05 });
      }

      // Foreground particles (floating dust / micro-bubbles)
      for (let i = 0; i < 120; i++) {
        const g = new Graphics();
        const r = 0.8 + Math.random() * 2.6;
        g.circle(0, 0, r);
        g.fill({ color: 0x1fe3b4, alpha: 0.1 + Math.random() * 0.28 });
        g.x = Math.random() * w();
        g.y = Math.random() * h();
        root.addChildAt(g, 2);
        particles.push({ g, x: g.x, y: g.y, speed: 0.15 + Math.random() * 0.55 });
      }

      // Fish (subtle background movement)
      const fish: {
        g: Graphics;
        x: number;
        y: number;
        speed: number;
        dir: number;
        phase: number;
        size: number;
      }[] = [];
      const fishCount = 8;
      for (let i = 0; i < fishCount; i++) {
        const g = new Graphics();
        const size = 0.7 + Math.random() * 1.2;
        const teal = 0x1fe3b4;
        const gold = 0xFFC94A;
        // Body
        g.beginFill(teal, 0.55);
        g.drawEllipse(0, 0, 18 * size, 6 * size);
        g.endFill();
        // Tail
        g.beginFill(gold, 0.45);
        g.moveTo(-14 * size, 0);
        g.lineTo(-22 * size, -6 * size);
        g.lineTo(-18 * size, 0);
        g.lineTo(-22 * size, 6 * size);
        g.lineTo(-14 * size, 0);
        g.endFill();
        // Eye
        g.beginFill(0xFFFFFF, 0.65);
        g.drawCircle(4 * size, -1 * size, 1.4 * size);
        g.endFill();

        const x = Math.random() * w();
        const y = h() * (0.25 + Math.random() * 0.35);
        const dir = Math.random() < 0.5 ? 1 : -1;
        const speed = 0.18 + Math.random() * 0.35;
        const phase = Math.random() * Math.PI * 2;
        g.x = x;
        g.y = y;
        root.addChildAt(g, 1);
        fish.push({ g, x, y, speed, dir, phase, size });
      }

      root.addChildAt(bg, 0);

      const caustics = new Graphics();
      root.addChild(caustics);

      // Distant ruins / temple silhouettes (mid layer)
      const ruins = new Graphics();
      root.addChildAt(ruins, 3);
      const seaweed = new Graphics();
      root.addChildAt(seaweed, 4);

      const coralLeft = new Graphics();
      const coralRight = new Graphics();
      root.addChildAt(coralLeft, 3);
      root.addChildAt(coralRight, 3);

      // Kraken layer: only fades in during bonus / freespin intensity
      const krakenLayer = new Container();
      const krakenTentacles: Graphics[] = [];
      const krakenSplashRings: { g: Graphics; age: number; x: number; y: number }[] = [];
      const TENTACLE_COUNT = 7;

      for (let i = 0; i < TENTACLE_COUNT; i++) {
        const g = new Graphics();
        krakenTentacles.push(g);
        krakenLayer.addChild(g);
      }

      // Body silhouette
      const krakenBody = new Graphics();
      krakenLayer.addChildAt(krakenBody, 0);
      const krakenEyes: Graphics[] = [new Graphics(), new Graphics()];
      krakenEyes.forEach((e) => krakenLayer.addChild(e));
      root.addChild(krakenLayer);

      // Additional rays in bonus/freespin
      const rays = new Graphics();
      root.addChildAt(rays, 1);

      function spawnKrakenSplash() {
        const g = new Graphics();
        root.addChildAt(g, 4);
        const W = w();
        const H = h();
        const x = W * 0.52 + krakenShiftX * 0.15 + (Math.random() * 2 - 1) * 60;
        const y = H * 0.66 + Math.random() * 60;
        krakenSplashRings.push({ g, age: 0, x, y });
      }

      function lerp(a: number, b: number, t: number) {
        return a + (b - a) * t;
      }

      function cubicPoint(
        p0: number,
        p1: number,
        p2: number,
        p3: number,
        t: number
      ) {
        const u = 1 - t;
        return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
      }

      function drawKrakenBackdrop(alpha: number) {
        const W = w();
        const H = h();
        krakenLayer.alpha = alpha;

        // Body blob
        krakenBody.clear();
        krakenBody.beginFill(0x2b0616, alpha * 0.92);
        const cx = W * 0.54 + krakenShiftX;
        krakenBody.moveTo(cx - 220, H * 0.52);
        krakenBody.bezierCurveTo(cx - 240, H * 0.44, cx - 140, H * 0.35, cx - 70, H * 0.40);
        krakenBody.bezierCurveTo(cx - 10, H * 0.22, cx + 90, H * 0.26, cx + 140, H * 0.38);
        krakenBody.bezierCurveTo(cx + 200, H * 0.47, cx + 190, H * 0.56, cx + 90, H * 0.58);
        krakenBody.bezierCurveTo(cx + 10, H * 0.65, cx - 160, H * 0.66, cx - 220, H * 0.52);
        krakenBody.closePath();
        krakenBody.endFill();

        // Tentacles
        krakenTentacles.forEach((g, idx) => {
          const i = idx / (TENTACLE_COUNT - 1);
          const baseX = W * 0.4 + i * W * 0.3;
          const wobble = Math.sin((performance.now() / 1000) * (0.2 + i * 0.12) + i * 4.2) * (26 + i * 24);
          const sway = krakenShiftX * (0.4 + i * 0.2);
          const x0 = baseX + sway;
          const y0 = H * 0.50;
          const x3 = x0 + wobble * 0.25;
          const y3 = H * 1.06;
          const x1 = x0 + wobble * 0.55;
          const y1 = H * (0.68 + i * 0.02);
          const x2 = x0 - wobble * 0.12;
          const y2 = H * (0.84 - i * 0.01);

          g.clear();
          const tentColor = 0x4a0b2c;
          g.lineStyle(22 - i * 2.5, tentColor, alpha * 0.95);
          g.beginFill(tentColor, alpha * 0.34);
          g.moveTo(x0, y0);
          g.bezierCurveTo(x1, y1, x2, y2, x3, y3);
          g.endFill();
          g.lineStyle(6, 0x1fe3b4, alpha * 0.10);
          g.moveTo(x0, y0);
          g.bezierCurveTo(x1, y1, x2, y2, x3, y3);

          // Suction cups
          g.lineStyle(0);
          const cups = 5;
          for (let c = 0; c < cups; c++) {
            const t = 0.15 + (c / (cups + 1)) * 0.8;
            const cx = cubicPoint(x0, x1, x2, x3, t);
            const cy = cubicPoint(y0, y1, y2, y3, t);
            g.beginFill(0xFFC94A, alpha * 0.18);
            g.drawCircle(cx, cy, 4 - i * 0.3);
            g.endFill();
            g.lineStyle(1, 0x1fe3b4, alpha * 0.12);
            g.drawCircle(cx, cy, 4 - i * 0.3);
          }
        });

        // Eyes: glowing gold with occasional blink
        const time = performance.now() / 1000;
        const blinkCycle = time % 8;
        const blink = blinkCycle < 0.12 ? 0.2 + blinkCycle / 0.12 * 0.8 : 1;
        const glow = alpha * (0.55 + 0.45 * Math.sin(time * 1.3));

        const eyeLeftX = cx - 55 + Math.sin(time * 0.8) * 6;
        const eyeRightX = cx + 40 + Math.sin(time * 0.9 + 1.2) * 6;
        const eyeY = H * 0.38 + Math.sin(time * 0.6) * 4;

        const eyes = [0, 1];
        const eyeXs = [eyeLeftX, eyeRightX];
        eyes.forEach((idx) => {
          const e = krakenEyes[idx];
          e.clear();
          e.beginFill(0xC9A227, Math.max(0.05, glow * 0.85));
          e.drawEllipse(eyeXs[idx] - 0, eyeY, 28, 18 * blink);
          e.endFill();
          e.beginFill(0x00FF9C, Math.max(0.05, glow * 0.55));
          e.drawEllipse(eyeXs[idx] - 0, eyeY, 12, 8 * blink);
          e.endFill();
          e.beginFill(0x020911, 0.65);
          e.drawEllipse(eyeXs[idx] - 0, eyeY, 4, 2.5 * blink);
          e.endFill();
        });
      }

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

        particles.forEach((p) => {
          p.y -= p.speed * dt * 18;
          p.x = p.x + Math.sin(t * 0.45 + p.x * 0.01) * dt * 2.2;
          p.g.x = p.x;
          p.g.y = p.y;
          if (p.y < -20) {
            p.y = H + 20;
            p.x = Math.random() * W;
          }
        });

        // Fish (slow swim + subtle bobbing)
        fish.forEach((f) => {
          f.x += f.dir * f.speed * dt * 160;
          if (f.x > W + 60) f.x = -60;
          if (f.x < -80) f.x = W + 80;
          f.g.x = f.x;
          f.g.y = f.y + Math.sin(t * 0.9 + f.phase) * 8;
          f.g.rotation = Math.sin(t * 0.55 + f.phase) * 0.03 * f.dir;
          f.g.scale.x = f.dir;
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

        // Moving rays layer
        raysPhase += dt * 0.025;
        rays.clear();
        const showKraken =
          intensity === 'bonus' ||
          intensity === 'freespin' ||
          intensity === 'base' ||
          bigWin;
        const rayCount = showKraken ? 5 : 3;
        const rayAlpha = showKraken ? 0.2 : 0.1;
        for (let i = 0; i < rayCount; i++) {
          const rx = W * (0.15 + i * 0.18) + Math.sin(raysPhase + i * 1.4) * 30;
          const topY = 0;
          const bottomY = H * (0.75 + Math.sin(raysPhase * 0.9 + i) * 0.06);
          rays.beginFill(0x1fe3b4, rayAlpha * (1 - i * 0.12));
          rays.moveTo(rx, topY);
          rays.lineTo(rx + 22 + i * 4, bottomY);
          rays.lineTo(rx - 22 - i * 4, bottomY);
          rays.closePath();
          rays.endFill();
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

        // Distant ruins + seaweed
        ruins.clear();
        seaweed.clear();
        const ruinsAlpha = showKraken ? 0.22 : 0.12;
        ruins.fill({ color: 0x01070f, alpha: ruinsAlpha });
        const baseY = H * 0.62;
        const ruinCount = 6;
        for (let i = 0; i < ruinCount; i++) {
          const rx = W * (0.1 + (i / ruinCount) * 0.8) + Math.sin(t * 0.22 + i) * 12;
          const rh = 60 + i * 10;
          ruins.beginFill(0x01070f, ruinsAlpha);
          ruins.drawRoundedRect(rx - 18, baseY - rh, 36, rh, 10);
          ruins.endFill();
          ruins.beginFill(0x021018, ruinsAlpha * 0.7);
          ruins.drawRoundedRect(rx - 10, baseY - rh - 22, 20, 16, 7);
          ruins.endFill();
        }
        seaweed.fill({ color: 0x001014, alpha: 0.22 });
        for (let i = 0; i < 4; i++) {
          const sx = W * (0.04 + i * 0.22) + Math.sin(t * 0.3 + i) * 8;
          seaweed.lineStyle(8, 0x001014, 0.22);
          seaweed.moveTo(sx, H);
          seaweed.bezierCurveTo(
            sx + 12,
            H * 0.72,
            sx - 12,
            H * 0.54,
            sx + Math.sin(t * 0.2 + i) * 8,
            H * 0.48
          );
        }

        // Coral edges (simple but bright fantasy accents)
        coralLeft.clear();
        coralRight.clear();
        const coralAlpha = showKraken ? 0.42 : 0.28;
        const coralBaseY = H * 0.78;
        const leftX = W * 0.06 + Math.sin(t * 0.55) * 6;
        const rightX = W * 0.94 - Math.sin(t * 0.55 + 1.2) * 6;
        for (let i = 0; i < 4; i++) {
          const stemH = 48 + i * 28 + Math.sin(t * 0.6 + i) * 10;
          const stemW = 14 + i * 3;
          const xL = leftX + i * 14;
          const xR = rightX - i * 14;

          coralLeft.beginFill(0xFF7A6E, coralAlpha * (1 - i * 0.14));
          coralLeft.drawRoundedRect(xL - stemW / 2, coralBaseY - stemH, stemW, stemH, 10);
          coralLeft.endFill();

          coralRight.beginFill(0xFF7A6E, coralAlpha * (1 - i * 0.14));
          coralRight.drawRoundedRect(xR - stemW / 2, coralBaseY - stemH, stemW, stemH, 10);
          coralRight.endFill();

          // Glow buds
          for (let b = 0; b < 2; b++) {
            const yBud = coralBaseY - stemH * (0.35 + b * 0.25) + Math.sin(t * 0.8 + i * 2 + b) * 4;
            coralLeft.beginFill(0xFFD56A, coralAlpha * 0.35);
            coralLeft.drawCircle(xL - 2 + b * 4, yBud, 5 + i * 0.7);
            coralLeft.endFill();

            coralRight.beginFill(0xFFD56A, coralAlpha * 0.35);
            coralRight.drawCircle(xR + 2 - b * 4, yBud, 5 + i * 0.7);
            coralRight.endFill();
          }
        }

        // Kraken movement: occasional left/right sway + subtle splash ripples
        if (showKraken) {
          krakenMoveTimer += dt;
          if (krakenMoveTimer > 6 + Math.sin(t * 0.1) * 2) {
            krakenMoveTimer = 0;
            krakenTargetShiftX = (Math.random() * 2 - 1) * 90;
            spawnKrakenSplash();
          }
          krakenShiftX = lerp(krakenShiftX, krakenTargetShiftX, 0.035 + dt * 0.05);

          // Fade-in based on intensity: always present in base, stronger in bonus/free spins.
          const targetAlpha =
            intensity === 'bonus' || intensity === 'freespin'
              ? 0.92
              : bigWin
                ? 0.62
                : intensity === 'anticipation'
                  ? 0.48
                  : 0.28;
          drawKrakenBackdrop(targetAlpha);

          // Update splash rings
          for (let i = krakenSplashRings.length - 1; i >= 0; i--) {
            const r = krakenSplashRings[i];
            r.age += dt;
            const life = 1.25;
            if (r.age > life) {
              root.removeChild(r.g);
              r.g.destroy();
              krakenSplashRings.splice(i, 1);
              continue;
            }
            const t01 = r.age / life;
            const alpha = Math.pow(1 - t01, 2) * 0.42;
            const radius = 18 + t01 * 90;
            r.g.clear();
            r.g.lineStyle(3, 0x1fe3b4, alpha);
            r.g.beginFill(0x1fe3b4, alpha * 0.12);
            r.g.drawCircle(r.x, r.y, radius);
            r.g.endFill();
          }
        } else {
          krakenShiftX = lerp(krakenShiftX, 0, 0.05);
          drawKrakenBackdrop(0);
          krakenMoveTimer = 0;
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
