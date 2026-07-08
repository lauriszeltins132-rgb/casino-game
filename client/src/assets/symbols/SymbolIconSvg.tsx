import type { SymbolId } from '../../types';

interface Props {
  id: SymbolId;
  size?: number;
  glowing?: boolean;
}

const GRAD = {
  gold: ['#FFF0A8', '#FFC94A', '#B8860B'],
  teal: ['#1FE3B4', '#00FF9C', '#0A4A40'],
};

export function SymbolIconSvg({ id, size = 64, glowing = false }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={glowing ? 'sym-glow' : ''}
      style={{ filter: glowing ? 'drop-shadow(0 0 8px rgba(255,201,74,0.9))' : undefined }}
    >
      <defs>
        <radialGradient id={`glow-${id}`} cx="40%" cy="35%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`goldG-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={GRAD.gold[0]} />
          <stop offset="50%" stopColor={GRAD.gold[1]} />
          <stop offset="100%" stopColor={GRAD.gold[2]} />
        </linearGradient>
        <linearGradient id={`tealG-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GRAD.teal[0]} />
          <stop offset="100%" stopColor={GRAD.teal[2]} />
        </linearGradient>
      </defs>
      <ellipse cx="40" cy="40" rx="36" ry="34" fill={`url(#glow-${id})`} />
      {render(id)}
    </svg>
  );
}

function render(id: SymbolId) {
  switch (id) {
    case 'rope':
      return (
        <g>
          <path d="M20 55 Q25 25 35 30 Q45 35 40 55 Q50 30 55 28 Q60 45 58 58" fill="none" stroke="#C4A060" strokeWidth="5" strokeLinecap="round" />
          <path d="M22 50 Q28 35 38 38" fill="none" stroke="#8B6914" strokeWidth="2" opacity="0.5" />
        </g>
      );
    case 'barnacle':
      return (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={i} cx={28 + i * 6} cy={42 + (i % 2) * 4} rx="5" ry="4" fill="#7A8B8B" stroke="#4A5A5A" strokeWidth="1" />
          ))}
          <ellipse cx="40" cy="38" rx="14" ry="10" fill="#6B7B7B" opacity="0.6" />
        </g>
      );
    case 'anchor_chain':
      return (
        <g fill="none" stroke="#A0A8B0" strokeWidth="3" strokeLinecap="round">
          <line x1="40" y1="18" x2="40" y2="55" />
          <circle cx="40" cy="16" r="6" />
          <path d="M22 48 Q40 65 58 48" />
          <line x1="28" y1="40" x2="52" y2="40" />
          <line x1="30" y1="28" x2="35" y2="33" strokeWidth="2" />
          <line x1="50" y1="28" x2="45" y2="33" strokeWidth="2" />
        </g>
      );
    case 'wheel':
      return (
        <g>
          <circle cx="40" cy="40" r="22" fill="#5D3A1A" stroke={`url(#goldG-${id})`} strokeWidth="3" />
          {[0, 45, 90, 135].map((a) => (
            <line key={a} x1="40" y1="40" x2={40 + 20 * Math.cos((a * Math.PI) / 180)} y2={40 + 20 * Math.sin((a * Math.PI) / 180)} stroke="#8B6914" strokeWidth="2" />
          ))}
          <circle cx="40" cy="40" r="5" fill={`url(#goldG-${id})`} />
        </g>
      );
    case 'compass':
      return (
        <g>
          <circle cx="40" cy="40" r="24" fill="#1A2530" stroke={`url(#goldG-${id})`} strokeWidth="2" />
          <polygon points="40,16 44,40 40,36 36,40" fill="#C0392B" />
          <polygon points="40,64 44,40 40,44 36,40" fill="#ECF0F1" />
          <circle cx="40" cy="40" r="4" fill={`url(#goldG-${id})`} />
        </g>
      );
    case 'spyglass':
      return (
        <g>
          <rect x="48" y="22" width="8" height="36" rx="2" fill="#2C3E50" stroke="#C9A227" strokeWidth="1" transform="rotate(25 52 40)" />
          <circle cx="28" cy="52" r="10" fill="none" stroke={`url(#goldG-${id})`} strokeWidth="3" />
          <circle cx="28" cy="52" r="6" fill="#1A5276" opacity="0.6" />
        </g>
      );
    case 'map':
      return (
        <g>
          <path d="M16 28 L30 22 L50 30 L64 24 L64 56 L48 50 L28 58 L16 52 Z" fill="#C9A86C" stroke="#6B4423" strokeWidth="1.5" />
          <path d="M35 35 Q42 30 50 38" fill="none" stroke="#C0392B" strokeWidth="2" strokeDasharray="3 2" />
          <circle cx="48" cy="36" r="3" fill="#C0392B" />
        </g>
      );
    case 'bell':
      return (
        <g>
          <path d="M28 55 L52 55 L48 32 Q40 22 32 32 Z" fill={`url(#goldG-${id})`} stroke="#8B6914" strokeWidth="1.5" />
          <circle cx="40" cy="58" r="4" fill="#8B6914" />
          <circle cx="40" cy="30" r="3" fill="#5D3A1A" />
        </g>
      );
    case 'skull':
      return (
        <g>
          <ellipse cx="40" cy="38" rx="18" ry="20" fill={`url(#goldG-${id})`} stroke="#8B6914" strokeWidth="1" />
          <ellipse cx="32" cy="36" rx="5" ry="6" fill="#1A1000" />
          <ellipse cx="48" cy="36" rx="5" ry="6" fill="#1A1000" />
          <path d="M32 48 Q40 54 48 48" fill="none" stroke="#1A1000" strokeWidth="2" />
        </g>
      );
    case 'crown':
      return (
        <g>
          <path d="M14 50 L20 28 L32 40 L40 20 L48 40 L60 28 L66 50 Z" fill={`url(#goldG-${id})`} stroke="#8B6914" strokeWidth="1.5" />
          <rect x="14" y="50" width="52" height="8" rx="2" fill={`url(#goldG-${id})`} />
          <circle cx="20" cy="28" r="3" fill="#1FE3B4" />
          <circle cx="40" cy="20" r="4" fill="#00FF9C" />
          <circle cx="60" cy="28" r="3" fill="#1FE3B4" />
        </g>
      );
    case 'chest':
      return (
        <g>
          <rect x="16" y="38" width="48" height="28" rx="3" fill="#5D3A1A" stroke={`url(#goldG-${id})`} strokeWidth="2" />
          <path d="M16 38 L22 26 L58 26 L64 38 Z" fill="#8B4513" stroke={`url(#goldG-${id})`} strokeWidth="2" />
          <rect x="34" y="42" width="12" height="14" rx="2" fill={`url(#goldG-${id})`} />
          <ellipse cx="40" cy="32" rx="16" ry="10" fill="#FFC94A" opacity="0.35" />
        </g>
      );
    case 'wild':
      return (
        <g>
          <ellipse cx="40" cy="42" rx="20" ry="16" fill={`url(#tealG-${id})`} opacity="0.9" />
          <ellipse cx="40" cy="40" rx="8" ry="12" fill="#050B14" />
          <ellipse cx="40" cy="38" rx="4" ry="6" fill="#00FF9C" />
          <ellipse cx="38" cy="36" rx="1.5" ry="2" fill="#fff" opacity="0.7" />
          <text x="40" y="68" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1FE3B4">WILD</text>
        </g>
      );
    case 'scatter':
      return (
        <g>
          <ellipse cx="40" cy="42" rx="26" ry="22" fill="#0A1A2E" stroke="#1FE3B4" strokeWidth="2" />
          {[-1, 0, 1].map((i) => (
            <path key={i} d={`M${20 + i * 20} 55 Q${15 + i * 25} 35 ${25 + i * 15} 25`} fill="none" stroke="#1A4A3A" strokeWidth="4" strokeLinecap="round" />
          ))}
          <ellipse cx="40" cy="35" rx="10" ry="8" fill="#00FF9C" opacity="0.8" />
          <ellipse cx="40" cy="34" rx="4" ry="5" fill="#050B14" />
        </g>
      );
  }
}
