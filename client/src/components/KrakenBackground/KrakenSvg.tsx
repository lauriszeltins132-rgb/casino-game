/** Inline SVG Kraken boss — visible on all browsers including Safari (no Pixi). */
export function KrakenSvg({ strong }: { strong: boolean }) {
  return (
    <svg
      className="kraken-svg"
      viewBox="0 0 900 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id="krakenHeadGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#9B4DCA" />
          <stop offset="45%" stopColor="#6B2D8B" />
          <stop offset="100%" stopColor="#2D0A4A" />
        </radialGradient>
        <radialGradient id="tentacleGrad" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="#8B3FA8" />
          <stop offset="60%" stopColor="#4A1570" />
          <stop offset="100%" stopColor="#1A0530" />
        </radialGradient>
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE566" />
          <stop offset="40%" stopColor="#F5C842" />
          <stop offset="70%" stopColor="#1FE3B4" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1FE3B4" stopOpacity="0" />
        </radialGradient>
        <filter id="eyeBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="krakenGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Coral reef silhouettes */}
      <g opacity="0.55">
        <ellipse cx="120" cy="620" rx="90" ry="40" fill="#FF6B8A" opacity="0.5" />
        <ellipse cx="200" cy="640" rx="60" ry="30" fill="#FF8C69" opacity="0.4" />
        <ellipse cx="780" cy="630" rx="80" ry="35" fill="#FF6B8A" opacity="0.5" />
        <ellipse cx="700" cy="650" rx="55" ry="28" fill="#E85D9A" opacity="0.45" />
        <path
          d="M60 660 Q80 580 100 660 Q120 600 140 660"
          fill="none"
          stroke="#FF8C69"
          strokeWidth="8"
          opacity="0.35"
        />
        <path
          d="M760 665 Q780 590 800 665 Q820 610 840 665"
          fill="none"
          stroke="#FF6B8A"
          strokeWidth="8"
          opacity="0.35"
        />
      </g>

      {/* Left tentacles */}
      <g filter="url(#krakenGlow)">
        <path
          d="M-20 180 C80 220, 120 340, 90 480 C70 560, 40 620, 20 700"
          fill="none"
          stroke="url(#tentacleGrad)"
          strokeWidth="52"
          strokeLinecap="round"
        />
        <path
          d="M30 250 C100 280, 140 400, 110 520 C95 580, 70 640, 50 700"
          fill="none"
          stroke="url(#tentacleGrad)"
          strokeWidth="38"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Suckers left */}
        {[320, 400, 480, 550].map((y, i) => (
          <ellipse key={`sl${i}`} cx={95 - i * 4} cy={y} rx="10" ry="7" fill="#C9A227" opacity="0.5" />
        ))}
      </g>

      {/* Right tentacles */}
      <g filter="url(#krakenGlow)">
        <path
          d="M920 180 C820 220, 780 340, 810 480 C830 560, 860 620, 880 700"
          fill="none"
          stroke="url(#tentacleGrad)"
          strokeWidth="52"
          strokeLinecap="round"
        />
        <path
          d="M870 250 C800 280, 760 400, 790 520 C805 580, 830 640, 850 700"
          fill="none"
          stroke="url(#tentacleGrad)"
          strokeWidth="38"
          strokeLinecap="round"
          opacity="0.85"
        />
        {[320, 400, 480, 550].map((y, i) => (
          <ellipse key={`sr${i}`} cx={805 + i * 4} cy={y} rx="10" ry="7" fill="#C9A227" opacity="0.5" />
        ))}
      </g>

      {/* Bottom tentacles curling under reels */}
      <g filter="url(#krakenGlow)" opacity="0.9">
        <path
          d="M280 620 C350 560, 420 600, 450 660"
          fill="none"
          stroke="url(#tentacleGrad)"
          strokeWidth="32"
          strokeLinecap="round"
        />
        <path
          d="M620 620 C550 560, 480 600, 450 660"
          fill="none"
          stroke="url(#tentacleGrad)"
          strokeWidth="32"
          strokeLinecap="round"
        />
      </g>

      {/* Kraken head / mantle */}
      <ellipse
        cx="450"
        cy="260"
        rx="220"
        ry="180"
        fill="url(#krakenHeadGrad)"
        filter="url(#krakenGlow)"
      />
      <ellipse cx="450" cy="240" rx="180" ry="140" fill="#7B3FA0" opacity="0.6" />

      {/* Eye glow halos */}
      <ellipse cx="370" cy="250" rx="55" ry="40" fill="url(#eyeGlow)" filter="url(#eyeBlur)" opacity={strong ? 1 : 0.75}>
        <animate attributeName="opacity" values="0.65;1;0.65" dur="2s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="530" cy="250" rx="55" ry="40" fill="url(#eyeGlow)" filter="url(#eyeBlur)" opacity={strong ? 1 : 0.75}>
        <animate attributeName="opacity" values="0.65;1;0.65" dur="2.1s" repeatCount="indefinite" />
      </ellipse>

      {/* Eyes */}
      <ellipse cx="370" cy="252" rx="38" ry="26" fill="#0A0510" />
      <ellipse cx="530" cy="252" rx="38" ry="26" fill="#0A0510" />
      <ellipse cx="370" cy="250" rx="28" ry="18" fill="#F5C842" />
      <ellipse cx="530" cy="250" rx="28" ry="18" fill="#F5C842" />
      <ellipse cx="376" cy="246" rx="10" ry="8" fill="#1A0A20" />
      <ellipse cx="536" cy="246" rx="10" ry="8" fill="#1A0A20" />
      <ellipse cx="380" cy="244" rx="4" ry="3" fill="#FFFFFF" opacity="0.7" />
      <ellipse cx="540" cy="244" rx="4" ry="3" fill="#FFFFFF" opacity="0.7" />

      {/* Beak hint */}
      <path d="M450 310 L440 330 L460 330 Z" fill="#1A0530" opacity="0.7" />
    </svg>
  );
}
