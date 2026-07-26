import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getTodayTask, getCurrency, getInventory, buyItem } from '../lib/api'
import { usePomodoro } from '../hooks/usePomodoro'
import { useAmbientSound } from '../hooks/useAmbientSound'
import PomodoroScene from '../components/PomodoroScene'
import ShopModal from '../components/ShopModal'

const SOUND_OPTIONS = [
  { key: 'white', label: '🌫️ White noise' },
  { key: 'water', label: '💧 Water' },
  { key: 'fire', label: '🔥 Fire' },
  { key: 'off', label: '🔇 Off' }
]

export default function HomePage() {
  const { user } = useAuth()
  const [task, setTask] = useState(null)
  const [loadingTask, setLoadingTask] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [weeds, setWeeds] = useState(0)
  const [owned, setOwned] = useState([])
  const [shopOpen, setShopOpen] = useState(false)

  const { scene, remaining, duckDip, weedSprite, start, pause, resume, stop } = usePomodoro({
    userId: user.id,
    taskId: task?.id ?? null,
    onWeedsChange: setWeeds
  })
  const { active: activeSound, toggle: toggleSound } = useAmbientSound()

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingTask(true)
      setLoadError(null)
      try {
        const [todayTask, currency, inventory] = await Promise.all([
          getTodayTask(user.id),
          getCurrency(user.id),
          getInventory(user.id)
        ])
        if (cancelled) return
        setTask(todayTask)
        setWeeds(currency)
        setOwned(inventory)
      } catch (err) {
        if (!cancelled) setLoadError(err.message)
      } finally {
        if (!cancelled) setLoadingTask(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user.id])

  async function handleBuy(itemKey, cost) {
    try {
      const remainingWeeds = await buyItem(user.id, itemKey, cost)
      setWeeds(remainingWeeds)
      setOwned((prev) => [...prev, itemKey])
    } catch (err) {
      alert(err.message)
    }
  }

  const isPaused = scene === 'resting'
  const isActive = scene === 'active' || scene === 'resting'

  return (
    <div
      className="rounded-b-[28px] p-4"
      style={{ background: 'linear-gradient(180deg, #D8C7F2 0%, #BEE3FB 55%, #C8F0D4 100%)' }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="rounded-wobble bg-cream px-4 py-1.5 text-base font-semibold text-textDark">
          🌿 {weeds}
        </div>
        <button
          onClick={() => setShopOpen(true)}
          className="rounded-wobble bg-blossom px-4 py-1.5 text-sm font-semibold text-white"
        >
          ✨ Shop
        </button>
      </div>

      <div className="relative">
        <PomodoroScene
          variant={isActive ? (isPaused ? 'resting' : 'active') : scene}
          duckDip={duckDip}
          weedSpriteLeft={weedSprite.left}
          weedSpriteOpacity={weedSprite.opacity}
        />
        <ShopModal open={shopOpen} onClose={() => setShopOpen(false)} weeds={weeds} owned={owned} onBuy={handleBuy} />
      </div>

      <div className="mt-3 rounded-wobble bg-cream p-4 text-center">
        {loadingTask ? (
          <div className="text-sm text-textMuted">Finding today's task…</div>
        ) : loadError ? (
          <div className="text-sm font-semibold text-red-600">Couldn't load: {loadError}</div>
        ) : !task ? (
          <div>
            <div className="text-base font-bold">Nothing scheduled today 💛</div>
            <Link to="/add-task" className="mt-2 inline-block text-sm font-semibold text-blossomText">
              Add a task →
            </Link>
          </div>
        ) : (
          <>
            <div className="text-lg font-bold">
              {task.urgency === 'high' ? '🔥 ' : task.urgency === 'medium' ? '🌤 ' : '🌱 '}
              {task.title}
            </div>

            {scene === 'welcome' && (
              <button
                onClick={start}
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

            <div className="mt-3 flex flex-wrap justify-center gap-1">
              <Link
                to={`/breakdown/${task.id}`}
                className="rounded-wobble bg-[#F3E3EE] px-3 py-2 text-xs font-semibold text-[#8B5C82]"
              >
                😮‍💨 Feels too much
              </Link>
            </div>
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
