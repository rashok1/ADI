import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getWeeklyRecord } from '../lib/api'
import MonthCalendar from '../components/MonthCalendar'

export default function WeeklyRecordPage() {
  const { user } = useAuth()
  const [record, setRecord] = useState(null)
  const [view, setView] = useState('week')

  useEffect(() => {
    getWeeklyRecord(user.id).then(setRecord)
  }, [user.id])

  if (!record) return <div className="p-6 text-sm text-textMuted">Loading…</div>

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-lg font-bold">Your record 🌈</div>
        <div className="flex rounded-wobble border-2 border-border overflow-hidden text-xs font-semibold">
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1.5 ${view === 'week' ? 'bg-blossom text-white' : 'bg-cream text-textMuted'}`}
          >
            Week
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-3 py-1.5 ${view === 'month' ? 'bg-blossom text-white' : 'bg-cream text-textMuted'}`}
          >
            Month
          </button>
        </div>
      </div>

      {view === 'week' ? (
        <>
          <div className="flex gap-2">
            <div className="flex-1 rounded-wobble bg-[#F3EBFB] p-3 text-center">
              <div className="text-xs font-semibold text-textMuted">Tasks done</div>
              <div className="text-2xl font-bold">{record.tasksCompleted}</div>
            </div>
            <div className="flex-1 rounded-wobble bg-[#E5F7EB] p-3 text-center">
              <div className="text-xs font-semibold text-textMuted">🌿 earned</div>
              <div className="text-2xl font-bold">{record.weedsEarned}</div>
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-textMuted">
            No streaks — just a record of what you did 💛
          </p>
        </>
      ) : (
        <MonthCalendar userId={user.id} />
      )}
    </div>
  )
}
