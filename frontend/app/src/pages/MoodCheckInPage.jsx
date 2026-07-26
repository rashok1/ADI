import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logMood, rearrangeWeek } from '../lib/api'

export default function MoodCheckInPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mood, setMood] = useState(null)
  const [medicated, setMedicated] = useState(null)
  const [medicatedChoice, setMedicatedChoice] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [aiSummary, setAiSummary] = useState(null)
  const [aiUnavailable, setAiUnavailable] = useState(false)

  async function handleContinue() {
    setSaving(true)
    setError(null)
    try {
      await logMood(user.id, mood, medicated)
      try {
        const result = await rearrangeWeek(mood, medicated)
        setAiSummary(result)
      } catch {
        // Mood is already saved either way — the rearrange step is a bonus,
        // and it needs the FastAPI backend running locally to work.
        setAiUnavailable(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const moodBtn = (value, label, activeClass) => (
    <button
      onClick={() => setMood(value)}
      className={`flex-1 rounded-wobble py-2 text-xs font-semibold ${
        mood === value ? activeClass : 'border-2 border-border bg-white text-textMuted'
      }`}
    >
      {label}
    </button>
  )

  if (aiSummary || aiUnavailable) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="w-full max-w-xs rounded-wobble bg-white p-5 text-center">
          <div className="text-base font-bold">Mood logged 💛</div>
          {aiSummary ? (
            <>
              <p className="mt-3 text-sm text-textDark">{aiSummary.summary}</p>
              {aiSummary.changed_task_ids.length > 0 && (
                <p className="mt-2 text-xs text-textMuted">
                  {aiSummary.changed_task_ids.length} task{aiSummary.changed_task_ids.length > 1 ? 's' : ''} rescheduled.
                </p>
              )}
              {aiSummary.breakdown_suggested_ids.length > 0 && (
                <p className="mt-1 text-xs text-textMuted">
                  Some big tasks could use breaking down — look for "Feels too much" on them.
                </p>
              )}
            </>
          ) : (
            <p className="mt-3 text-xs text-textMuted">
              (AI schedule adjustment wasn't available — start the backend locally to enable it.)
            </p>
          )}
          <button
            onClick={() => navigate('/')}
            className="mt-4 w-full rounded-wobble bg-leaf py-2.5 text-sm font-bold text-leafText"
          >
            Continue →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="w-full max-w-xs rounded-wobble bg-white p-5">
        <div className="text-base font-bold">How are you feeling?</div>
        <div className="mt-3 flex gap-2">
          {moodBtn('low', 'Low', 'bg-sky text-skyText')}
          {moodBtn('okay', 'Okay', 'bg-blossom text-blossomText')}
          {moodBtn('good', 'Good', 'bg-leaf text-leafText')}
        </div>

        <div className="mt-3 text-xs font-semibold text-textMuted">Took meds today?</div>
        <div className="mt-1 flex gap-2">
          {[
            ['yes', 'Yes'],
            ['no', 'No'],
            ['skip', 'Skip']
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setMedicatedChoice(value)
                setMedicated(value === 'yes' ? true : value === 'no' ? false : null)
              }}
              className={`flex-1 rounded-wobble border-2 py-2 text-xs font-semibold ${
                medicatedChoice === value
                  ? 'border-lilacText bg-lilac text-lilacText'
                  : 'border-border bg-[#F3EBFB] text-lilacText'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="mt-2 text-xs text-textMuted">No judgment either way 💛</p>

        {error && (
          <div className="mt-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</div>
        )}

        <button
          onClick={handleContinue}
          disabled={!mood || saving}
          className="mt-3 w-full rounded-wobble bg-leaf py-2.5 text-sm font-bold text-leafText disabled:opacity-50"
        >
          {saving ? 'Thinking about your week…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
