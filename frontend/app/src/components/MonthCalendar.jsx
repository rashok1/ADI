import { useEffect, useState } from 'react'
import { getMonthlyCompletion } from '../lib/api'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function tierClass(count) {
  if (!count) return 'bg-white border-border text-textMuted'
  if (count === 1) return 'bg-lilac border-lilac text-lilacText'
  if (count === 2) return 'bg-blossom border-blossom text-blossomText'
  return 'bg-leaf border-leaf text-leafText'
}

export default function MonthCalendar({ userId }) {
  const today = new Date()
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getMonthlyCompletion(userId, cursor.year, cursor.month)
      .then((c) => {
        if (!cancelled) setCounts(c)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId, cursor])

  const firstOfMonth = new Date(cursor.year, cursor.month, 1)
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
  const startOffset = firstOfMonth.getDay()
  const monthLabel = firstOfMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function shiftMonth(delta) {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  return (
    <div className="mt-3 rounded-wobble bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <button onClick={() => shiftMonth(-1)} className="px-2 text-sm font-bold text-textMuted" aria-label="Previous month">
          ‹
        </button>
        <div className="text-sm font-bold">{monthLabel}</div>
        <button onClick={() => shiftMonth(1)} className="px-2 text-sm font-bold text-textMuted" aria-label="Next month">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-textMuted">
        {WEEKDAY_LABELS.map((w, i) => (
          <div key={i}>{w}</div>
        ))}
      </div>

      <div className={`grid grid-cols-7 gap-1 mt-1 ${loading ? 'opacity-50' : ''}`}>
        {cells.map((day, i) =>
          day == null ? (
            <div key={i} />
          ) : (
            <div
              key={i}
              title={counts[day] ? `${counts[day]} task${counts[day] > 1 ? 's' : ''} completed` : 'No tasks completed'}
              className={`flex aspect-square items-center justify-center rounded-md border text-[11px] font-semibold ${tierClass(counts[day])}`}
            >
              {day}
            </div>
          )
        )}
      </div>

      <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-textMuted">
        <span className="inline-block h-3 w-3 rounded border border-border bg-white" /> none
        <span className="inline-block h-3 w-3 rounded bg-lilac" /> 1
        <span className="inline-block h-3 w-3 rounded bg-blossom" /> 2
        <span className="inline-block h-3 w-3 rounded bg-leaf" /> 3+
      </div>
    </div>
  )
}
