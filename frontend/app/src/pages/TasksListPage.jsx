import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listTasks, todayLocal } from '../lib/api'

const URGENCY_ICON = { high: '🔥', medium: '🌤', low: '🌱' }

function startOfWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() - d.getDay())
  return d
}

function formatDay(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function TasksListPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    listTasks(user.id).then(setTasks).catch((err) => setError(err.message))
  }, [user.id])

  if (error) return <div className="p-4 text-sm font-semibold text-red-600">Couldn't load: {error}</div>
  if (!tasks) return <div className="p-6 text-sm text-textMuted">Loading…</div>

  const today = todayLocal()
  const weekStart = startOfWeek(today)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const active = tasks.filter((t) => t.status !== 'completed' && t.status !== 'removed' && !t.parent_task_id)
  const thisWeek = active.filter((t) => {
    if (!t.scheduled_for) return false
    const d = new Date(t.scheduled_for + 'T00:00:00')
    return d >= weekStart && d < weekEnd
  })
  const grouped = thisWeek.reduce((acc, t) => {
    ;(acc[t.scheduled_for] ??= []).push(t)
    return acc
  }, {})
  const days = Object.keys(grouped).sort()

  return (
    <div className="p-4">
      <div className="mb-3 text-lg font-bold">This week's tasks 📋</div>

      {thisWeek.length === 0 ? (
        <div className="rounded-wobble bg-white p-4 text-center text-sm text-textMuted">
          Nothing set for the week yet 💛
          <div className="mt-2">
            <Link to="/add-task" className="text-sm font-semibold text-blossomText">
              Add a task →
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {days.map((day) => (
            <div key={day}>
              <div className="mb-1 text-xs font-semibold text-textMuted">
                {day === today ? `Today — ${formatDay(day)}` : formatDay(day)}
              </div>
              <div className="flex flex-col gap-1.5">
                {grouped[day].map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-wobble border-2 border-border bg-white px-3 py-2 text-sm font-semibold"
                  >
                    <span>
                      {URGENCY_ICON[t.urgency] ?? ''} {t.title}
                    </span>
                    {t.hours_needed != null && (
                      <span className="text-xs font-normal text-textMuted">
                        {t.hours_needed < 1 ? `${Math.round(t.hours_needed * 60)}m` : `${t.hours_needed}h`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
