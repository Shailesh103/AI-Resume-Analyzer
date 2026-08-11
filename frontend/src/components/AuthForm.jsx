import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function AuthForm({ onDone }) {
  const { login, signup, loginWithGoogle } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const googleButtonRef = useRef(null)

  const handleGoogleResponse = useCallback(
    async (response) => {
      setError(null)
      setLoading(true)
      try {
        await loginWithGoogle(response.credential)
        onDone?.()
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [loginWithGoogle, onDone]
  )

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return

    let cancelled = false

    function renderGoogleButton() {
      if (cancelled) return
      if (!window.google?.accounts?.id) {
        setTimeout(renderGoogleButton, 150)
        return
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      })
      googleButtonRef.current.innerHTML = ''
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: mode === 'login' ? 'signin_with' : 'signup_with',
      })
    }

    renderGoogleButton()
    return () => {
      cancelled = true
    }
  }, [mode, handleGoogleResponse])

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

      {GOOGLE_CLIENT_ID && (
        <>
          <div ref={googleButtonRef} className="mb-4 flex justify-center" />
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-slate uppercase tracking-widest">or</span>
            <div className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

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
