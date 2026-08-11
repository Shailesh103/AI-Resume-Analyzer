import { useState, useEffect, useCallback } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import UploadForm from './components/UploadForm'
import ResultsDashboard from './components/ResultsDashboard'
import AuthForm from './components/AuthForm'
import HistoryList from './components/HistoryList'
import ResumeEditor from './components/ResumeEditor'


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function NavLink({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs uppercase tracking-widest pb-0.5 border-b-2 transition-colors ${
        active
          ? 'text-redline border-redline'
          : 'text-slate border-transparent hover:text-redline hover:border-redline/40'
      }`}
    >
      {children}
    </button>
  )
}

function Header({ view, setView }) {
  const { user, logout, loading } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-20 bg-manuscript/90 backdrop-blur-sm border-b py-5 mb-12
        transition-shadow ${scrolled ? 'border-line shadow-[0_2px_10px_-4px_rgba(20,21,26,0.15)]' : 'border-transparent'}`}
    >
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-4">
        <button onClick={() => setView('analyze')} className="font-display text-2xl text-ink shrink-0">
          Redline<span className="text-redline">.</span>
        </button>

        <div className="flex items-center gap-3 sm:gap-5 overflow-x-auto min-w-0">
          {!loading && user && (
            <>
              
              <NavLink active={view === 'history'} onClick={() => setView('history')}>
                History
              </NavLink>
              <span className="hidden sm:inline text-xs text-slate truncate max-w-[160px]">
                {user.email}
              </span>
              <button
                onClick={() => {
                  logout()
                  setView('analyze')
                }}
                className="text-xs uppercase tracking-widest text-slate hover:text-redline shrink-0"
              >
                Sign out
              </button>
            </>
          )}
          {!loading && !user && (
            <button
              onClick={() => setView('auth')}
              className="text-xs uppercase tracking-widest text-slate hover:text-redline"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

function UsageIndicator({ usage }) {
  if (!usage) return null

  const isLow = usage.remaining <= 1
  const isZero = usage.remaining === 0

  return (
    <p
      className={`text-xs text-center mt-4 ${
        isZero ? 'text-redline' : isLow ? 'text-gold' : 'text-slate'
      }`}
    >
      {isZero
        ? "You've used all your scans for today."
        : `${usage.remaining} scan${usage.remaining === 1 ? '' : 's'} left today`}
      {' · '}
      {usage.limit} per day{usage.used > 0 ? ` (${usage.used} used)` : ''}
    </p>
  )
}

function MainContent({ view, setView }) {
  const { token } = useAuth()
  const [result, setResult] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [usage, setUsage] = useState(null)

  const refreshUsage = useCallback(async () => {
    try {
      const headers = {}
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(`${API_URL}/usage`, { headers })
      if (res.ok) setUsage(await res.json())
    } catch {
      // Non-critical — the analyze call will still enforce the real limit server-side.
    }
  }, [token])

  useEffect(() => {
    refreshUsage()
  }, [refreshUsage])

  async function handleAnalyze(file, jobDescription) {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('resume', file)
    if (jobDescription?.trim()) {
      formData.append('job_description', jobDescription)
    }

    try {
      const headers = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || `Request failed (${res.status})`)
      }

      const data = await res.json()
      setResult(data)
      refreshUsage()
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (view === 'auth') {
    return <AuthForm onDone={() => setView('analyze')} />
  }

  if (view === 'history') {
    return <HistoryList onBack={() => setView('analyze')} />
  }



  if (result && editing) {
    return (
      <ResumeEditor
        resumeText={result.resume_text}
        weakBullets={result.analysis.weak_bullets}
        filename={result.filename}
        onBack={() => setEditing(false)}
      />
    )
  }

  if (result) {
    return (
      <ResultsDashboard
        data={result}
        onReset={() => setResult(null)}
        onBuildResume={() => setEditing(true)}
      />
    )
  }

  return (
    <>
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-ink leading-tight">
          Get your resume <span className="italic">marked up</span> like a recruiter would.
        </h2>
        <p className="text-slate mt-3">
          Upload once, get an ATS score, a red-pen edit of your weakest bullets,
          and the keywords you're missing.
        </p>
        {!token && (
          <p className="text-xs text-slate mt-3">
            <button onClick={() => setView('auth')} className="underline underline-offset-4 hover:text-redline">
              Sign in
            </button>{' '}
            to save your results and track your score over time.
          </p>
        )}
      </div>
      <UploadForm onAnalyze={handleAnalyze} loading={loading} error={error} />
      <UsageIndicator usage={usage} />
    </>
  )
}

function AppShell() {
  const [view, setView] = useState('analyze') // 'analyze' | 'auth' | 'history'

  return (
    <div className="min-h-screen bg-manuscript bg-paper-texture">
      <Header view={view} setView={setView} />
      <main className="px-4 pb-24">
        <MainContent view={view} setView={setView} />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
