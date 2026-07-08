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
          {/* Rope-knot coin stack (low-tier gold) */}
          <g opacity="0.98">
            <ellipse cx="40" cy="48" rx="20" ry="7" fill="#5D3A1A" opacity="0.85" />
            <ellipse cx="40" cy="44" rx="18" ry="6" fill="#8B6914" opacity="0.9" />
            <ellipse cx="40" cy="41" rx="16" ry="5.3" fill="#FFC94A" opacity="0.55" />
          </g>
          {/* Knot */}
          <path
            d="M26 52
               Q28 42 35 42
               Q40 42 42 46
               Q45 52 38 57
               Q33 60 26 52 Z"
            fill="#C9A227"
            opacity="0.65"
          />
          <path
            d="M22 50
               Q30 30 42 36
               Q55 42 58 58"
            fill="none"
            stroke="#C4A060"
            strokeWidth="4.5"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M25 48
               Q32 34 42 38
               Q52 42 55 52"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.18"
          />
        </g>
      );
    case 'barnacle':
      return (
        <g>
          {/* Barnacle rock with teal glint */}
          <path
            d="M22 56
               Q26 38 40 34
               Q54 38 58 56
               Q40 64 22 56 Z"
            fill="#2C3E50"
            opacity="0.88"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <ellipse
                cx={28 + i * 6}
                cy={44 + (i % 2) * 3}
                rx="5.2"
                ry="4.2"
                fill="#7A8B8B"
                stroke="#4A5A5A"
                strokeWidth="1"
              />
              {i % 2 === 0 && (
                <circle cx={28 + i * 6} cy={44} r="1.7" fill="#1FE3B4" opacity="0.7" />
              )}
            </g>
          ))}
          <ellipse cx="40" cy="38" rx="16" ry="11" fill="#6B7B7B" opacity="0.5" />
          <path
            d="M28 46 C34 40, 44 40, 52 46"
            fill="none"
            stroke="#1FE3B4"
            strokeWidth="2.2"
            opacity="0.16"
          />
        </g>
      );
    case 'anchor_chain':
      return (
        <g>
          {/* Anchor */}
          <path
            d="M40 18
               C34 22, 34 28, 40 30
               C46 28, 46 22, 40 18 Z"
            fill="#1FE3B4"
            opacity="0.12"
          />
          <g fill="none" stroke="#A0A8B0" strokeWidth="3" strokeLinecap="round">
            <line x1="40" y1="18" x2="40" y2="58" />
            <circle cx="40" cy="16" r="6" fill="#050B14" opacity="0.6" stroke="#C9A227" strokeWidth="1" />
            <path d="M22 52 Q40 70 58 52" />
            <line x1="28" y1="42" x2="52" y2="42" />
            <line x1="30" y1="32" x2="35" y2="37" strokeWidth="2" />
            <line x1="50" y1="32" x2="45" y2="37" strokeWidth="2" />
          </g>
          {/* Chain shimmer */}
          <path
            d="M36 26 C34 36, 34 46, 36 56"
            fill="none"
            stroke="#FFC94A"
            strokeWidth="2"
            opacity="0.16"
          />
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
          {/* Ancient trident with blue energy */}
          <path
            d="M34 58
               L34 40
               Q34 34 38 32
               Q40 31 42 32
               Q46 34 46 40
               L46 58 Z"
            fill="#0A4A40"
            opacity="0.22"
          />
          <g fill="none" stroke="#1FE3B4" strokeWidth="3" strokeLinecap="round" opacity="0.42">
            <path d="M40 22 L28 40" />
            <path d="M40 22 L52 40" />
          </g>
          <g fill="none" stroke={`url(#goldG-${id})`} strokeWidth="2" strokeLinecap="round">
            <path d="M40 18 L40 58" />
            <path d="M40 24 L30 40" />
            <path d="M40 24 L50 40" />
            <path d="M40 32 L36 42 L44 42 Z" fill="#1FE3B4" opacity="0.15" />
          </g>
          <circle cx="40" cy="56" r="5" fill={`url(#goldG-${id})`} opacity="0.65" />
          {/* Energy streak */}
          <path
            d="M40 28 C38 36, 38 44, 40 52"
            fill="none"
            stroke="#00FF9C"
            strokeWidth="2.8"
            opacity="0.18"
          />
        </g>
      );
    case 'skull':
      return (
        <g>
          {/* Giant pearl (high-tier) */}
          <ellipse cx="40" cy="40" rx="18" ry="22" fill="#0B2E3C" opacity="0.35" />
          <ellipse cx="40" cy="42" rx="16.5" ry="20.5" fill="#E8DCC8" opacity="0.92" />
          <ellipse cx="40" cy="40" rx="12" ry="14" fill="#FFFFFF" opacity="0.18" />
          <ellipse cx="37" cy="36" rx="6" ry="8" fill="#1FE3B4" opacity="0.22" />
          <ellipse cx="44" cy="44" rx="6" ry="8" fill="#FFC94A" opacity="0.16" />
          <path
            d="M30 40 C34 34, 40 34, 50 42"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.2"
          />
          <ellipse cx="40" cy="42" rx="18" ry="21" fill="none" stroke={`url(#goldG-${id})`} strokeWidth="1.6" opacity="0.55" />
          {/* Pearl glow */}
          <circle cx="40" cy="40" r="22" fill="#1FE3B4" opacity="0.08" />
        </g>
      );
    case 'crown':
      return (
        <g>
          {/* Outer crown silhouette */}
          <path
            d="M12 52
               L20 26
               L32 42
               L40 18
               L48 42
               L60 26
               L68 52 Z"
            fill={`url(#goldG-${id})`}
            stroke="#8B6914"
            strokeWidth="1.8"
          />
          <rect x="18" y="52" width="44" height="9" rx="2.2" fill={`url(#goldG-${id})`} />

          {/* Gems */}
          <g>
            <path d="M26 48 L32 34 L38 48 Z" fill="#1FE3B4" opacity="0.95" stroke="#0A4A40" strokeWidth="1" />
            <path d="M42 48 L40 34 L48 48 Z" fill="#00FF9C" opacity="0.9" stroke="#0A4A40" strokeWidth="1" />
            <circle cx="40" cy="22" r="5" fill="#00FF9C" opacity="0.95" />
            <circle cx="40" cy="22" r="2.2" fill="#FFF0A8" opacity="0.9" />
            <circle cx="20" cy="28" r="3.2" fill="#1FE3B4" opacity="0.95" />
            <circle cx="60" cy="28" r="3.2" fill="#1FE3B4" opacity="0.95" />
          </g>

          {/* Kraken tendril accent */}
          <path
            d="M30 58
               C28 48, 34 44, 38 46
               C42 48, 44 54, 42 60"
            fill="none"
            stroke="#1FE3B4"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.55"
          />

          {/* Specular reflection */}
          <path
            d="M22 46
               C30 26, 40 26, 48 46"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.18"
          />
        </g>
      );
    case 'chest':
      return (
        <g>
          {/* Open chest base */}
          <rect
            x="14"
            y="40"
            width="52"
            height="26"
            rx="4"
            fill="#3b2311"
            stroke={`url(#goldG-${id})`}
            strokeWidth="2"
          />
          {/* Lid (open) */}
          <path
            d="M16 40
               L22 28
               Q40 18 58 28
               L64 40 Z"
            fill="#5D3A1A"
            stroke={`url(#goldG-${id})`}
            strokeWidth="2"
          />

          {/* Lock plate */}
          <rect x="32" y="44" width="16" height="14" rx="3" fill={`url(#goldG-${id})`} opacity="0.95" />
          <circle cx="40" cy="51" r="2.6" fill="#00FF9C" opacity="0.85" />

          {/* Coins */}
          <g opacity="0.98">
            <ellipse cx="34" cy="58" rx="8" ry="4" fill="#FFC94A" opacity="0.85" />
            <ellipse cx="44" cy="56" rx="9" ry="4.6" fill="#FFC94A" opacity="0.92" />
            <ellipse cx="40" cy="60" rx="7" ry="3.8" fill="#F5D76E" opacity="0.95" />
            <circle cx="50" cy="55" r="2.6" fill="#1FE3B4" opacity="0.55" />
            <circle cx="28" cy="57" r="2.2" fill="#00FF9C" opacity="0.4" />
          </g>

          {/* Light escaping */}
          <g opacity="0.85">
            <path d="M28 38 L40 30 L52 38" fill="none" stroke="#1FE3B4" strokeWidth="3" strokeLinecap="round" />
            <path d="M24 40 L40 34 L56 40" fill="none" stroke="#FFC94A" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
            <ellipse cx="40" cy="46" rx="14" ry="10" fill="#1FE3B4" opacity="0.08" />
          </g>
        </g>
      );
    case 'wild':
      return (
        <g>
          {/* Kraken eye medallion */}
          <circle cx="40" cy="40" r="26" fill={`url(#tealG-${id})`} opacity="0.88" />
          <circle cx="40" cy="40" r="18" fill="#050B14" opacity="0.88" />
          <ellipse cx="40" cy="38" rx="10" ry="14" fill="#00FF9C" opacity="0.8" />
          <ellipse cx="40" cy="40" rx="4.2" ry="6.2" fill="#FFF0A8" opacity="0.95" />

          {/* Tentacle coils ring */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`M40 20
                  C${28 + i * 2} ${24 + i * 2}, ${18 + i * 3} ${34 + i * 1.5}, 40 60`}
              fill="none"
              stroke="#1FE3B4"
              strokeWidth="2"
              opacity="0.25"
              strokeLinecap="round"
            />
          ))}

          {/* Suction cups */}
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={40 + Math.cos((i * Math.PI) / 2.5) * (18 - i * 1.6)}
              cy={40 + Math.sin((i * Math.PI) / 2.5) * (14 - i * 1.2)}
              r={3.5 - i * 0.35}
              fill="#1FE3B4"
              opacity="0.18"
            />
          ))}

          {/* Reflection streak */}
          <path
            d="M28 30 C32 24, 38 22, 46 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.14"
          />
        </g>
      );
    case 'scatter':
      return (
        <g>
          {/* Kraken eye scatter */}
          <ellipse cx="40" cy="42" rx="26" ry="22" fill="#041625" stroke="#FFC94A" strokeWidth="2.6" opacity="0.95" />
          <ellipse cx="40" cy="42" rx="16" ry="12" fill="#00FF9C" opacity="0.18" />
          <ellipse cx="40" cy="40" rx="11" ry="14" fill="#00FF9C" opacity="0.6" />
          <ellipse cx="40" cy="42" rx="4.4" ry="6.2" fill="#050B14" opacity="0.95" />

          {/* Eyelid glow rings */}
          <path
            d="M18 42 C24 34, 32 30, 40 30 C48 30, 56 34, 62 42"
            fill="none"
            stroke="#1FE3B4"
            strokeWidth="3"
            opacity="0.22"
            strokeLinecap="round"
          />
          <path
            d="M20 48 C28 43, 34 40, 40 40 C46 40, 52 43, 60 48"
            fill="none"
            stroke="#FFC94A"
            strokeWidth="2"
            opacity="0.22"
            strokeLinecap="round"
          />

          {/* Tentacle sparks */}
          {[-1, 0, 1].map((i) => (
            <path
              key={i}
              d={`M${22 + i * 18} 58
                 Q${16 + i * 20} 44, ${26 + i * 14} 28`}
              fill="none"
              stroke="#1FE3B4"
              strokeWidth="3.8"
              strokeLinecap="round"
              opacity="0.25"
            />
          ))}
        </g>
      );
  }
}
