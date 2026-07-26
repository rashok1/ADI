import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logMood } from '../lib/api'

export default function MoodCheckInPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mood, setMood] = useState(null)
  const [medicated, setMedicated] = useState(null)
  const [medicatedChoice, setMedicatedChoice] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleContinue() {
    setSaving(true)
    setError(null)
    try {
      await logMood(user.id, mood, medicated)
      navigate('/')
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
          Continue
        </button>
      </div>
    </div>
  )
}
