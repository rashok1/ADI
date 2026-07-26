import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getSettings, updateSettings } from '../lib/api'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    getSettings(user.id).then(setSettings)
  }, [user.id])

  async function toggleMedication() {
    const next = !settings.medicated
    const updated = await updateSettings(user.id, { medicated: next })
    setSettings(updated)
  }

  return (
    <div className="p-4">
      <div className="mb-3 text-lg font-bold">Settings ⚙️</div>

      <div className="flex justify-between border-b-2 border-border py-2.5 text-sm font-semibold">
        <span>Account</span>
        <span className="text-textMuted">{user.email}</span>
      </div>
      <div className="flex justify-between border-b-2 border-border py-2.5 text-sm font-semibold">
        <span>Connect Slack</span>
        <span className="text-textMuted">phase 2</span>
      </div>
      <div className="flex justify-between border-b-2 border-border py-2.5 text-sm font-semibold">
        <span>Connect calendar</span>
        <span className="text-textMuted">phase 2</span>
      </div>
      <div className="flex justify-between border-b-2 border-border py-2.5 text-sm font-semibold">
        <span>Medication log</span>
        <button onClick={toggleMedication} className="text-xs font-semibold text-blossomText">
          {settings?.medicated ? 'on' : 'off'} — tap to toggle
        </button>
      </div>
      <div className="flex justify-between py-2.5 text-sm font-semibold">
        <span>Accountability partner</span>
        <span className="text-textMuted">phase 3</span>
      </div>

      <button
        onClick={signOut}
        className="mt-4 w-full rounded-wobble border-2 border-border bg-white py-3 text-sm font-semibold text-textMuted"
      >
        Log out
      </button>
    </div>
  )
}
