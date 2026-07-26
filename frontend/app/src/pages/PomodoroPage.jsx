import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getTodayTask, getCurrency } from '../lib/api'
import { usePomodoro } from '../hooks/usePomodoro'
import { useAmbientSound } from '../hooks/useAmbientSound'
import PomodoroScene from '../components/PomodoroScene'

const SOUND_OPTIONS = [
  { key: 'white', label: '🌫️ White noise' },
  { key: 'water', label: '💧 Water' },
  { key: 'fire', label: '🔥 Fire' },
  { key: 'off', label: '🔇 Off' }
]

export default function PomodoroPage() {
  const { user } = useAuth()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [weeds, setWeeds] = useState(0)
  const [justFinished, setJustFinished] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const [todayTask, currency] = await Promise.all([getTodayTask(user.id), getCurrency(user.id)])
      if (cancelled) return
      setTask(todayTask)
      setWeeds(currency)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user.id])

  const { scene, remaining, duckDip, weedSprite, start, pause, resume, stop } = usePomodoro({
    userId: user.id,
    taskId: task?.id ?? null,
    onWeedsChange: setWeeds,
    onTaskComplete: () => setJustFinished(true)
  })
  const { active: activeSound, toggle: toggleSound } = useAmbientSound()

  const isPaused = scene === 'resting'
  const isActive = scene === 'active' || scene === 'resting'

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-lg font-bold">🐥 Focus timer</div>
        <div className="rounded-wobble bg-cream border-2 border-border px-3 py-1 text-sm font-semibold text-textDark">
          🌿 {weeds}
        </div>
      </div>

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
        <div className="mt-3 text-center text-base font-bold text-[#3E6B52]">
          {justFinished ? 'You finished the task! 🎉' : 'Great focus session! 🎉'}
        </div>
      )}

      <div className="mt-3 rounded-wobble bg-cream border-2 border-border p-4 text-center">
        {loading ? (
          <div className="text-sm text-textMuted">Finding today's task…</div>
        ) : !task ? (
          <div>
            <div className="text-base font-bold">No task picked yet 💛</div>
            <Link to="/add-task" className="mt-2 inline-block text-sm font-semibold text-blossomText">
              Add a task →
            </Link>
          </div>
        ) : (
          <>
            <div className="text-base font-bold">
              {task.urgency === 'high' ? '🔥 ' : task.urgency === 'medium' ? '🌤 ' : '🌱 '}
              {task.title}
            </div>

            {scene === 'welcome' && (
              <button
                onClick={() => {
                  setJustFinished(false)
                  start()
                }}
                className="mt-3 w-full rounded-wobble bg-leaf py-3 text-base font-bold text-leafText"
              >
                Start focus ▶
              </button>
            )}

            {isActive && (
              <div className="mt-3 flex flex-col gap-2">
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
          </>
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
