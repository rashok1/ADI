// Dia the duckling — one continuous outline body, simple dot eyes, flat
// beak and feet, two thin belly lines. Reused at every size across the app.
export default function DuckSVG({ className = '', width = 72, height = 90, sleeping = false }) {
  return (
    <svg width={width} height={height} viewBox="0 0 140 175" className={className}>
      <path
        d="M70,15 C48,15 34,35 32,60 C30,85 28,110 34,130 C40,150 55,160 70,160 C85,160 100,150 106,130 C112,110 110,85 108,60 C106,35 92,15 70,15 Z"
        fill="#FFFFFF"
        stroke="#1A1A1A"
        strokeWidth="3"
      />
      <path
        d="M50,158 L44,172 L54,168 L58,158 Z"
        fill="#FFB13D"
        stroke="#1A1A1A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M90,158 L96,172 L86,168 L82,158 Z"
        fill="#FFB13D"
        stroke="#1A1A1A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <ellipse cx="70" cy="79" rx="15" ry="8" fill="#FFB13D" stroke="#1A1A1A" strokeWidth="2.5" />
      {sleeping ? (
        <>
          <path d="M50,55 Q58,49 66,55" stroke="#1A1A1A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M74,55 Q82,49 90,55" stroke="#1A1A1A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <text x="95" y="45" fontSize="14" fill="#6B5A6B">z z z</text>
        </>
      ) : (
        <>
          <circle cx="58" cy="55" r="4" fill="#1A1A1A" />
          <circle cx="82" cy="55" r="4" fill="#1A1A1A" />
        </>
      )}
      <path d="M50,118 Q70,126 90,118" stroke="#1A1A1A" strokeWidth="1.5" fill="none" opacity="0.35" />
      <path d="M52,134 Q70,141 88,134" stroke="#1A1A1A" strokeWidth="1.5" fill="none" opacity="0.3" />
    </svg>
  )
}
