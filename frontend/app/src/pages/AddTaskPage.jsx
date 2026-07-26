import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createTask, todayLocal } from '../lib/api'

export default function AddTaskPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [hours, setHours] = useState('')
  const [urgency, setUrgency] = useState('medium')
  const [bigTaskMode, setBigTaskMode] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await createTask(user.id, {
        title,
        due_date: dueDate || null,
        scheduled_for: dueDate || todayLocal(),
        hours_needed: hours ? Number(hours) : null,
        urgency,
        big_task_mode: bigTaskMode
      })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
      <div className="text-lg font-bold">New task 📝</div>

      <label className="text-xs font-semibold text-textMuted">
        Title
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Clean off one dresser"
          className="mt-1 w-full rounded-2xl border-2 border-border px-3 py-2 text-sm"
        />
      </label>

      <div className="flex gap-2">
        <label className="flex-1 text-xs font-semibold text-textMuted">
          Due date
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-2xl border-2 border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="flex-1 text-xs font-semibold text-textMuted">
          Hours
          <input
            type="number"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="1.5"
            className="mt-1 w-full rounded-2xl border-2 border-border px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="text-xs font-semibold text-textMuted">
        Urgency
        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          className="mt-1 w-full rounded-2xl border-2 border-border px-3 py-2 text-sm"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </label>

      <div className="text-xs font-semibold text-textMuted">Big task mode (1hr+)</div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setBigTaskMode('single_session')}
          className={`flex-1 rounded-wobble py-2 text-xs font-semibold ${
            bigTaskMode === 'single_session' ? 'bg-[#FFE29A] text-[#8B6B2E]' : 'bg-lilac text-lilacText'
          }`}
        >
          One 3hr sitting
        </button>
        <button
          type="button"
          onClick={() => setBigTaskMode('spread_week')}
          className={`flex-1 rounded-wobble py-2 text-xs font-semibold ${
            bigTaskMode === 'spread_week' ? 'bg-sky text-skyText' : 'bg-lilac text-lilacText'
          }`}
        >
          Spread over week
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-2 rounded-wobble bg-leaf py-3 text-base font-bold text-leafText disabled:opacity-60"
      >
        Save task
      </button>
    </form>
  )
}
