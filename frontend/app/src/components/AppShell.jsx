import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Home', end: true },
  { to: '/add-task', label: 'Add task' },
  { to: '/tasks', label: 'This week' },
  { to: '/pomodoro', label: 'Focus timer' },
  { to: '/record', label: 'Weekly record' },
  { to: '/mood', label: 'Mood check-in' },
  { to: '/settings', label: 'Settings' }
]

// Shared chrome: the pond background, title, and top tab nav, wrapping
// every authenticated page (matches the HTML prototype's layout).
export default function AppShell({ children }) {
  return (
    <div className="relative min-h-screen bg-[#DCEFDD] p-6">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id="bgwater" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#BEE3FB" />
              <stop offset="100%" stopColor="#8FD1C7" />
            </linearGradient>
            <filter id="bgblur">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>
          <rect width="800" height="600" fill="#DCEFDD" />
          <g filter="url(#bgblur)" opacity="0.6">
            <ellipse cx="80" cy="40" rx="140" ry="70" fill="#9ED79A" />
            <ellipse cx="700" cy="30" rx="160" ry="80" fill="#8AC784" />
            <ellipse cx="400" cy="10" rx="180" ry="60" fill="#B7E3B4" />
          </g>
          <rect x="0" y="120" width="800" height="480" fill="url(#bgwater)" opacity="0.7" />
        </svg>
      </div>

      <h1 className="mb-4 text-center text-xl font-bold">ADI — your task helper</h1>

      <div className="mb-4 flex flex-wrap justify-center gap-1.5">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `rounded-wobble border-2 px-3.5 py-1.5 text-xs font-semibold ${
                isActive ? 'border-blossom bg-blossom text-white' : 'border-border bg-cream text-lilacText'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-[380px] overflow-hidden rounded-wobble border-2 border-border bg-cream shadow-lg">
          {children}
        </div>
      </div>
    </div>
  )
}
