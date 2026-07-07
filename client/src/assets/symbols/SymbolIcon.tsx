import type { SymbolId } from '../../types';

interface Props {
  id: SymbolId;
  size?: number;
  glowing?: boolean;
  className?: string;
}

export function SymbolIcon({ id, size = 64, glowing = false, className = '' }: Props) {
  const glowClass = glowing ? 'symbol-glow' : '';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={`${glowClass} ${className}`}
      aria-label={id}
    >
      {renderSymbol(id)}
    </svg>
  );
}

function renderSymbol(id: SymbolId) {
  switch (id) {
    case 'crown':
      return (
        <g>
          <defs>
            <linearGradient id="crownGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5d76e" />
              <stop offset="50%" stopColor="#c9a227" />
              <stop offset="100%" stopColor="#8b6914" />
            </linearGradient>
          </defs>
          <path d="M15 50 L20 30 L30 42 L40 22 L50 42 L60 30 L65 50 Z" fill="url(#crownGold)" stroke="#8b6914" strokeWidth="1.5" />
          <circle cx="20" cy="30" r="3" fill="#e74c3c" />
          <circle cx="40" cy="22" r="4" fill="#2ecc71" />
          <circle cx="60" cy="30" r="3" fill="#3498db" />
          <rect x="15" y="50" width="50" height="8" rx="2" fill="url(#crownGold)" />
          <path d="M25 58 Q30 68 35 58 Q40 72 45 58 Q50 68 55 58" fill="none" stroke="#1a5276" strokeWidth="2.5" opacity="0.7" />
        </g>
      );
    case 'trident':
      return (
        <g>
          <defs>
            <linearGradient id="tridentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#85c1e9" />
              <stop offset="100%" stopColor="#1a5276" />
            </linearGradient>
          </defs>
          <line x1="40" y1="15" x2="40" y2="65" stroke="url(#tridentGrad)" strokeWidth="4" strokeLinecap="round" />
          <line x1="40" y1="20" x2="22" y2="35" stroke="url(#tridentGrad)" strokeWidth="3" strokeLinecap="round" />
          <line x1="40" y1="20" x2="58" y2="35" stroke="url(#tridentGrad)" strokeWidth="3" strokeLinecap="round" />
          <line x1="40" y1="25" x2="40" y2="40" stroke="url(#tridentGrad)" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="40" cy="68" rx="8" ry="3" fill="#1a5276" opacity="0.5" />
        </g>
      );
    case 'chest':
      return (
        <g>
          <defs>
            <linearGradient id="chestWood" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a0522d" />
              <stop offset="100%" stopColor="#5d3a1a" />
            </linearGradient>
            <radialGradient id="chestGlow" cx="50%" cy="40%">
              <stop offset="0%" stopColor="#fff9c4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f5d76e" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="18" y="38" width="44" height="28" rx="3" fill="url(#chestWood)" stroke="#c9a227" strokeWidth="2" />
          <path d="M18 38 L25 28 L55 28 L62 38 Z" fill="url(#chestWood)" stroke="#c9a227" strokeWidth="2" />
          <rect x="35" y="42" width="10" height="12" rx="2" fill="#c9a227" />
          <circle cx="40" cy="48" r="2" fill="#5d3a1a" />
          <ellipse cx="40" cy="35" rx="18" ry="12" fill="url(#chestGlow)" />
          <circle cx="32" cy="32" r="3" fill="#f5d76e" />
          <circle cx="40" cy="30" r="4" fill="#f5d76e" />
          <circle cx="48" cy="32" r="3" fill="#f5d76e" />
        </g>
      );
    case 'pearl':
      return (
        <g>
          <defs>
            <radialGradient id="pearlGrad" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#d7bde2" />
              <stop offset="100%" stopColor="#8e44ad" />
            </radialGradient>
          </defs>
          <circle cx="40" cy="42" r="22" fill="url(#pearlGrad)" />
          <ellipse cx="32" cy="34" rx="6" ry="4" fill="white" opacity="0.6" />
          <circle cx="40" cy="42" r="22" fill="none" stroke="#6c3483" strokeWidth="1" opacity="0.4" />
        </g>
      );
    case 'anchor':
      return (
        <g fill="none" stroke="#bdc3c7" strokeWidth="3" strokeLinecap="round">
          <circle cx="40" cy="22" r="8" />
          <line x1="40" y1="30" x2="40" y2="58" />
          <path d="M22 48 Q40 68 58 48" />
          <line x1="28" y1="42" x2="52" y2="42" />
        </g>
      );
    case 'compass':
      return (
        <g>
          <circle cx="40" cy="40" r="24" fill="none" stroke="#c9a227" strokeWidth="2" />
          <circle cx="40" cy="40" r="20" fill="#1a252f" stroke="#8b6914" strokeWidth="1" />
          <polygon points="40,18 44,40 40,36 36,40" fill="#e74c3c" />
          <polygon points="40,62 44,40 40,44 36,40" fill="#ecf0f1" />
          <circle cx="40" cy="40" r="3" fill="#c9a227" />
        </g>
      );
    case 'map':
      return (
        <g>
          <path d="M18 25 L32 20 L48 28 L62 22 L62 58 L48 52 L32 60 L18 54 Z" fill="#d4ac6e" stroke="#8b6914" strokeWidth="1.5" />
          <path d="M32 20 L32 60 M48 28 L48 52" stroke="#8b6914" strokeWidth="1" opacity="0.5" />
          <path d="M35 35 Q42 30 50 38" fill="none" stroke="#c0392b" strokeWidth="2" strokeDasharray="4 2" />
          <circle cx="46" cy="36" r="3" fill="#c0392b" />
        </g>
      );
    case 'coin':
      return (
        <g>
          <defs>
            <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5d76e" />
              <stop offset="100%" stopColor="#c9a227" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="24" fill="url(#coinGrad)" stroke="#8b6914" strokeWidth="2" />
          <text x="40" y="46" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#5d3a1a">$</text>
        </g>
      );
    case 'wild':
      return (
        <g>
          <defs>
            <linearGradient id="tentacleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2ecc71" />
              <stop offset="100%" stopColor="#1a5276" />
            </linearGradient>
          </defs>
          <ellipse cx="40" cy="55" rx="20" ry="12" fill="#1a5276" opacity="0.6" />
          <path d="M20 55 Q15 35 25 25 Q30 40 35 55" fill="url(#tentacleGrad)" />
          <path d="M35 55 Q30 30 40 18 Q45 35 42 55" fill="url(#tentacleGrad)" />
          <path d="M45 55 Q50 30 55 22 Q58 38 52 55" fill="url(#tentacleGrad)" />
          <path d="M55 55 Q65 38 62 28 Q58 42 58 55" fill="url(#tentacleGrad)" />
          <text x="40" y="72" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2ecc71">WILD</text>
        </g>
      );
    case 'scatter':
      return (
        <g>
          <defs>
            <radialGradient id="eyeGrad" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#2ecc71" />
              <stop offset="30%" stopColor="#1a5276" />
              <stop offset="70%" stopColor="#0a1628" />
              <stop offset="100%" stopColor="#000" />
            </radialGradient>
          </defs>
          <ellipse cx="40" cy="40" rx="28" ry="24" fill="url(#eyeGrad)" />
          <ellipse cx="40" cy="40" rx="12" ry="18" fill="#0a1628" />
          <ellipse cx="40" cy="38" rx="5" ry="8" fill="#2ecc71" />
          <ellipse cx="38" cy="35" rx="2" ry="3" fill="#fff" opacity="0.8" />
          <path d="M15 40 Q5 20 20 15 Q25 30 18 40" fill="none" stroke="#1a5276" strokeWidth="2" opacity="0.5" />
          <path d="M65 40 Q75 20 60 15 Q55 30 62 40" fill="none" stroke="#1a5276" strokeWidth="2" opacity="0.5" />
        </g>
      );
  }
}
