import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DuckSVG from '../components/DuckSVG'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const action = mode === 'signin' ? signIn : signUp
    const { error: authError } = await action(email, password)
    setSubmitting(false)
    if (authError) {
      setError(authError.message)
      return
    }
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EAF7FF] p-6">
      <div className="w-full max-w-sm rounded-wobble border-2 border-border bg-cream p-6">
        <div className="flex flex-col items-center gap-2">
          <DuckSVG width={100} height={120} />
          <div className="text-2xl font-bold">adi</div>
          <div className="text-xs font-semibold text-textMuted">one task at a time</div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border-2 border-border px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border-2 border-border px-3 py-2 text-sm"
          />
          {error && <div className="text-xs font-semibold text-red-500">{error}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-wobble bg-leaf py-3 text-base font-bold text-leafText disabled:opacity-60"
          >
            {mode === 'signin' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="mt-3 w-full text-center text-xs font-semibold text-textMuted"
        >
          {mode === 'signin' ? "New here? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  )
}
