import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getTodayTask } from '../lib/api'
import { usePomodoro } from '../hooks/usePomodoro'
import { useAmbientSound } from '../hooks/useAmbientSound'
import PomodoroScene from '../components/PomodoroScene'

const SOUND_OPTIONS = [
  { key: 'white', label: '🌫️ White noise' },
  { key: 'water', label: '💧 Water' },
  { key: 'fire', label: '🔥 Fire' },
  { key: 'off', label: '🔇 Off' }
]

// Just the timer, ambient sounds, and controls — no task details, no weeds
// counter. Still tracks today's task silently in the background so a
// finished session can mark it complete; that's Home's job to show.
export default function PomodoroPage() {
  const { user } = useAuth()
  const [taskId, setTaskId] = useState(null)

  useEffect(() => {
    let cancelled = false
    getTodayTask(user.id).then((task) => {
      if (!cancelled) setTaskId(task?.id ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [user.id])

  const { scene, remaining, duckDip, weedSprite, start, pause, resume, stop } = usePomodoro({
    userId: user.id,
    taskId
  })
  const { active: activeSound, toggle: toggleSound } = useAmbientSound()

  const isPaused = scene === 'resting'
  const isActive = scene === 'active' || scene === 'resting'

  return (
    <div className="p-4">
      <div className="mb-3 text-lg font-bold text-center">🐥 Focus timer</div>

      <PomodoroScene
        variant={
          scene === 'celebrate'
            ? 'celebrate'
            : isActive
              ? isPaused
                ? 'resting'
                : 'active'
              : scene
        }
        duckDip={duckDip}
        weedSpriteLeft={weedSprite.left}
        weedSpriteOpacity={weedSprite.opacity}
      />

      {scene === 'celebrate' && (
        <div className="mt-3 text-center text-base font-bold text-[#3E6B52]">Nice work! 🎉</div>
      )}

      <div className="mt-3 rounded-wobble bg-cream border-2 border-border p-4 text-center">
        {scene === 'welcome' && (
          <button
            onClick={start}
            className="w-full rounded-wobble bg-leaf py-3 text-base font-bold text-leafText"
          >
            Start focus ▶
          </button>
        )}

        {isActive && (
          <div className="flex flex-col gap-2">
            <div className="text-2xl font-bold">
              {remaining} <span className="text-xs font-semibold text-textMuted">min left</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={isPaused ? resume : pause}
                className="flex-1 rounded-wobble bg-blossom py-2 text-sm font-semibold text-blossomText"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={stop}
                className="flex-1 rounded-wobble bg-lilac py-2 text-sm font-semibold text-lilacText"
              >
                Stop
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="mb-1.5 text-xs font-semibold text-textDark">🎧 Ambient sound</div>
        <div className="flex flex-wrap gap-1.5">
          {SOUND_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => toggleSound(opt.key)}
              className={`rounded-wobble border-2 bg-cream px-2.5 py-1.5 text-[11px] font-semibold text-textDark ${
                activeSound === opt.key ? 'border-blossom' : 'border-lilac'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
