import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getTodayTask, getCurrency, getInventory, buyItem, completeTask } from '../lib/api'
import PomodoroScene from '../components/PomodoroScene'
import ShopModal from '../components/ShopModal'

const HAPPY_MESSAGES = [
  "Nothing on deck for today — enjoy the breathing room 💛",
  "All clear for today! You're caught up 🌿",
  "Nothing scheduled today. A quiet day is still a good day 🌤"
]

export default function HomePage() {
  const { user } = useAuth()
  const [task, setTask] = useState(null)
  const [loadingTask, setLoadingTask] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [weeds, setWeeds] = useState(0)
  const [owned, setOwned] = useState([])
  const [shopOpen, setShopOpen] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [happyMessage] = useState(() => HAPPY_MESSAGES[Math.floor(Math.random() * HAPPY_MESSAGES.length)])

  async function load() {
    setLoadingTask(true)
    setLoadError(null)
    try {
      const [todayTask, currency, inventory] = await Promise.all([
        getTodayTask(user.id),
        getCurrency(user.id),
        getInventory(user.id)
      ])
      setTask(todayTask)
      setWeeds(currency)
      setOwned(inventory)
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoadingTask(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  async function handleMarkDone() {
    if (!task) return
    setCompleting(true)
    try {
      await completeTask(task.id)
      await load()
    } catch (err) {
      alert(err.message)
    } finally {
      setCompleting(false)
    }
  }

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
        <PomodoroScene variant="welcome" />
        <ShopModal open={shopOpen} onClose={() => setShopOpen(false)} weeds={weeds} owned={owned} onBuy={handleBuy} />
      </div>

      <div className="mt-3 rounded-wobble bg-cream p-4 text-center">
        {loadingTask ? (
          <div className="text-sm text-textMuted">Finding today's task…</div>
        ) : loadError ? (
          <div className="text-sm font-semibold text-red-600">Couldn't load: {loadError}</div>
        ) : !task ? (
          <div>
            <div className="text-base font-bold">{happyMessage}</div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Link to="/add-task" className="text-sm font-semibold text-blossomText">
                Add a task →
              </Link>
              <Link to="/tasks" className="text-sm font-semibold text-blossomText">
                See this week's tasks →
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-lg font-bold">
              {task.urgency === 'high' ? '🔥 ' : task.urgency === 'medium' ? '🌤 ' : '🌱 '}
              {task.title}
            </div>

            <Link
              to="/pomodoro"
              className="mt-3 block w-full rounded-wobble bg-leaf py-3 text-base font-bold text-leafText"
            >
              Start focus session ▶
            </Link>

            <div className="mt-2 flex flex-wrap justify-center gap-1">
              <Link
                to={`/breakdown/${task.id}`}
                className="rounded-wobble bg-[#F3E3EE] px-3 py-2 text-xs font-semibold text-[#8B5C82]"
              >
                😮‍💨 Feels too much
              </Link>
              <button
                onClick={handleMarkDone}
                disabled={completing}
                className="rounded-wobble bg-[#E5F7EB] px-3 py-2 text-xs font-semibold text-[#3E6B52] disabled:opacity-60"
              >
                ✅ Mark done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
