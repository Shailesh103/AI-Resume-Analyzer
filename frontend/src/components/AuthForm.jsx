import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthForm({ onDone }) {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await signup(email, password)
      }
      onDone?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto bg-white/50 border border-line rounded-sm p-8">
      <h2 className="font-display text-xl text-ink mb-1">
        {mode === 'login' ? 'Welcome back' : 'Create an account'}
      </h2>
      <p className="text-xs text-slate mb-6">
        {mode === 'login'
          ? "Sign in to see your analysis history."
          : "Save every resume you analyze and track your score over time."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-slate mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-redline/40 focus:border-redline"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-slate mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm
              focus:outline-none focus:ring-2 focus:ring-redline/40 focus:border-redline"
          />
          {mode === 'signup' && (
            <p className="text-xs text-slate mt-1">At least 8 characters.</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-redline border-l-2 border-redline pl-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-manuscript font-body font-medium py-2.5 rounded-sm
            hover:bg-redline transition-colors disabled:opacity-40"
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === 'login' ? 'signup' : 'login')
          setError(null)
        }}
        className="w-full text-center text-xs text-slate mt-4 hover:text-redline underline underline-offset-4"
      >
        {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </button>
    </div>
  )
}
