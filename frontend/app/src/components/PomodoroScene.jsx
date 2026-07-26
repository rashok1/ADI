import DuckSVG from './DuckSVG'

// Renders the pond illustration that matches the current Pomodoro state.
// variant: 'welcome' | 'active' | 'resting' | 'celebrate'
// Extra props (weedSpriteLeft, weedSpriteOpacity, duckDip) only matter for 'active'.
export default function PomodoroScene({ variant, duckDip = false, weedSpriteLeft = '-10%', weedSpriteOpacity = 0 }) {
  if (variant === 'active') {
    return (
      <div
        className="relative h-[190px] rounded-wobble overflow-hidden animate-river"
        style={{ backgroundImage: 'repeating-linear-gradient(100deg, #BEE3FB 0 40px, #D6EEFD 40px 80px)' }}
      >
        <span className="absolute left-[10%] bottom-3.5 text-xl">🌾</span>
        <span className="absolute right-[12%] top-3.5 text-base">🌸</span>
        <span
          className="absolute font-display text-lg"
          style={{ left: weedSpriteLeft, bottom: '38px', opacity: weedSpriteOpacity, transition: 'left 1.6s linear, opacity 0.3s' }}
        >
          🌱
        </span>
        <div className={`absolute inset-0 flex items-center justify-center ${duckDip ? 'animate-duck-dip' : 'animate-duck-active'}`}>
          <DuckSVG />
        </div>
      </div>
    )
  }

  if (variant === 'resting') {
    return (
      <div className="relative h-[190px] rounded-wobble overflow-hidden">
        <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
          <defs>
            <linearGradient id="water2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9B6EA" />
              <stop offset="100%" stopColor="#5B7DA6" />
            </linearGradient>
            <linearGradient id="rock2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DCCFC0" />
              <stop offset="100%" stopColor="#A79684" />
            </linearGradient>
            <filter id="blurw2">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          <rect x="0" y="0" width="400" height="280" fill="#E7D6E0" />
          <g filter="url(#blurw2)" opacity="0.75">
            <ellipse cx="40" cy="30" rx="60" ry="34" fill="#8E7BAE" />
            <ellipse cx="160" cy="18" rx="70" ry="28" fill="#7D6BA0" />
            <ellipse cx="320" cy="28" rx="80" ry="36" fill="#9A85B8" />
          </g>
          <rect x="0" y="60" width="400" height="220" fill="url(#water2)" />
          <ellipse cx="40" cy="240" rx="46" ry="24" fill="url(#rock2)" />
          <ellipse cx="25" cy="222" rx="20" ry="10" fill="#7D6BA0" />
          <ellipse cx="360" cy="200" rx="40" ry="22" fill="url(#rock2)" />
          <ellipse cx="372" cy="185" rx="18" ry="9" fill="#7D6BA0" />
          <ellipse cx="120" cy="200" rx="22" ry="9" fill="#6B5A94" />
          <ellipse cx="300" cy="240" rx="26" ry="10" fill="#6B5A94" />
          <g filter="url(#blurw2)" opacity="0.7">
            <ellipse cx="10" cy="270" rx="60" ry="20" fill="#5C4A8B" />
            <ellipse cx="390" cy="270" rx="60" ry="20" fill="#5C4A8B" />
          </g>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <DuckSVG sleeping width={100} height={124} />
        </div>
        <div className="absolute left-0 right-0 bottom-0 p-2 text-center text-xs font-semibold text-[#5C4A8B]"
             style={{ background: 'linear-gradient(0deg, rgba(255,251,243,0.9) 30%, rgba(255,251,243,0))' }}>
          taking a breather 💜
        </div>
      </div>
    )
  }

  if (variant === 'celebrate') {
    return (
      <div className="relative h-[190px] rounded-wobble overflow-hidden">
        <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
          <defs>
            <linearGradient id="water3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE9B8" />
              <stop offset="100%" stopColor="#5FBFB0" />
            </linearGradient>
            <linearGradient id="rock3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E4DACB" />
              <stop offset="100%" stopColor="#B8AA96" />
            </linearGradient>
            <filter id="blurw3">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          <rect x="0" y="0" width="400" height="280" fill="#FFF3D6" />
          <g filter="url(#blurw3)" opacity="0.75">
            <ellipse cx="40" cy="30" rx="60" ry="34" fill="#8AC784" />
            <ellipse cx="160" cy="18" rx="70" ry="28" fill="#7EBE7A" />
            <ellipse cx="320" cy="28" rx="80" ry="36" fill="#95CE8E" />
          </g>
          <rect x="0" y="60" width="400" height="220" fill="url(#water3)" />
          <ellipse cx="40" cy="240" rx="46" ry="24" fill="url(#rock3)" />
          <ellipse cx="360" cy="200" rx="40" ry="22" fill="url(#rock3)" />
          <ellipse cx="120" cy="200" rx="22" ry="9" fill="#5FAE5E" />
          <ellipse cx="300" cy="240" rx="26" ry="10" fill="#5FAE5E" />
          <g fill="#FFD54F">
            <path className="animate-spark" d="M60,60 L63,68 L71,70 L63,72 L60,80 L57,72 L49,70 L57,68 Z" />
            <path className="animate-spark" style={{ animationDelay: '.4s' }} d="M330,90 L333,98 L341,100 L333,102 L330,110 L327,102 L319,100 L327,98 Z" />
            <path className="animate-spark" style={{ animationDelay: '.8s' }} d="M250,50 L252,56 L258,58 L252,60 L250,66 L248,60 L242,58 L248,56 Z" />
          </g>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <DuckSVG width={100} height={124} />
        </div>
      </div>
    )
  }

  // welcome (idle)
  return (
    <div className="relative h-[190px] rounded-wobble overflow-hidden">
      <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMid slice" className="w-full h-full block">
        <defs>
          <linearGradient id="water1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9FE0DA" />
            <stop offset="100%" stopColor="#4E9CA0" />
          </linearGradient>
          <radialGradient id="glow1" cx="30%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#FFFDE7" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFFDE7" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rock1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E4DACB" />
            <stop offset="100%" stopColor="#B8AA96" />
          </linearGradient>
          <filter id="blurw1">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <rect x="0" y="0" width="400" height="280" fill="#DCEFDD" />
        <g filter="url(#blurw1)" opacity="0.8">
          <ellipse cx="40" cy="30" rx="60" ry="34" fill="#7EBE7A" />
          <ellipse cx="160" cy="18" rx="70" ry="28" fill="#6BAE6E" />
          <ellipse cx="320" cy="28" rx="80" ry="36" fill="#8AC784" />
        </g>
        <rect x="0" y="60" width="400" height="220" fill="url(#water1)" />
        <g stroke="#fff" strokeOpacity="0.25" fill="none">
          <ellipse cx="90" cy="120" rx="26" ry="6" />
          <ellipse cx="270" cy="160" rx="30" ry="7" />
          <ellipse cx="200" cy="220" rx="34" ry="8" />
        </g>
        <ellipse cx="40" cy="240" rx="46" ry="24" fill="url(#rock1)" />
        <ellipse cx="25" cy="222" rx="20" ry="10" fill="#7BB86F" />
        <ellipse cx="360" cy="200" rx="40" ry="22" fill="url(#rock1)" />
        <ellipse cx="372" cy="185" rx="18" ry="9" fill="#7BB86F" />
        <ellipse cx="120" cy="200" rx="22" ry="9" fill="#5FAE5E" />
        <ellipse cx="300" cy="240" rx="26" ry="10" fill="#5FAE5E" />
        <ellipse cx="150" cy="255" rx="18" ry="7" fill="#5FAE5E" />
        <g opacity="0.9">
          <ellipse cx="288" cy="112" rx="11" ry="14" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="2" />
          <ellipse cx="90" cy="92" rx="9" ry="12" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="2" />
        </g>
        <rect x="0" y="0" width="400" height="280" fill="url(#glow1)" />
        <g filter="url(#blurw1)" opacity="0.7">
          <ellipse cx="10" cy="270" rx="60" ry="20" fill="#4E8C52" />
          <ellipse cx="390" cy="270" rx="60" ry="20" fill="#4E8C52" />
        </g>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center animate-duck-idle">
        <DuckSVG width={100} height={124} />
      </div>
    </div>
  )
}
