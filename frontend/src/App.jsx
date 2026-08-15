import { useState, useEffect, useCallback, useRef } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import UploadForm from './components/UploadForm'
import HeroVisual from './components/HeroVisual'
import ResultsDashboard from './components/ResultsDashboard'
import AuthForm from './components/AuthForm'
import HistoryList from './components/HistoryList'
import ResumeEditor from './components/ResumeEditor'
import JobTracker from './components/JobTracker'
import LandingSections from './components/LandingSections'
import Footer from './components/Footer'
import { PrivacyPolicy, TermsOfService } from './components/LegalPages'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function NavLink({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs uppercase tracking-widest pb-0.5 border-b-2 transition-colors text-left w-fit ${
        active
          ? 'text-redline border-redline'
          : 'text-slate border-transparent hover:text-redline hover:border-redline/40'
      }`}
    >
      {children}
    </button>
  )
}

function UserMenu({ email, onSignOut }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!open) return
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
          open ? 'border-redline text-redline' : 'border-line text-slate hover:border-redline/50 hover:text-redline'
        }`}
        aria-label="Account menu"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4.5 20c0-4.2 3.4-6.5 7.5-6.5s7.5 2.3 7.5 6.5" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-56 bg-manuscript border border-line rounded-sm
            shadow-[0_16px_32px_-16px_rgba(23,21,34,0.35)] py-2 z-30 animate-fade-up"
        >
          <p className="px-3 py-1.5 text-xs text-slate truncate">{email}</p>
          <div className="h-px bg-line my-1" />
          <button
            onClick={() => {
              setOpen(false)
              onSignOut()
            }}
            className="w-full text-left px-3 py-1.5 text-xs uppercase tracking-widest text-slate hover:text-redline"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

function Header({ view, setView, onGoHome }) {
  const { user, token, logout, loading } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 4)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!token) {
      setIsPro(false)
      return
    }
    fetch(`${API_URL}/billing/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setIsPro(data.is_pro))
      .catch(() => {})
  }, [token])

  // Close the mobile menu whenever the view changes, so it doesn't stay open underneath.
  useEffect(() => {
    setMobileOpen(false)
  }, [view])

  // Close the mobile menu if the user scrolls while it's open.
  // (The listener is attached a tick late, and needs a small movement threshold,
  // so the layout-shift scroll caused by the menu opening itself doesn't
  // immediately close it.)
  useEffect(() => {
    if (!mobileOpen) return
    const startY = window.scrollY
    function onMenuScroll() {
      if (Math.abs(window.scrollY - startY) > 10) {
        setMobileOpen(false)
      }
    }
    const timerId = setTimeout(() => {
      window.addEventListener('scroll', onMenuScroll, { passive: true })
    }, 150)
    return () => {
      clearTimeout(timerId)
      window.removeEventListener('scroll', onMenuScroll)
    }
  }, [mobileOpen])

  async function handleUpgrade() {
    setBillingLoading(true)
    try {
      const res = await fetch(`${API_URL}/billing/checkout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      }
    } finally {
      setBillingLoading(false)
    }
  }

  async function handleManageBilling() {
    setBillingLoading(true)
    try {
      const res = await fetch(`${API_URL}/billing/portal`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      }
    } finally {
      setBillingLoading(false)
    }
  }

  const navItems = !loading && user && (
    <>
      <NavLink active={view === 'jobs'} onClick={() => setView('jobs')}>
        Jobs
      </NavLink>
      <NavLink active={view === 'history'} onClick={() => setView('history')}>
        History
      </NavLink>
      {isPro ? (
        <>
          <span className="text-[10px] uppercase tracking-widest text-manuscript bg-gold px-2 py-0.5 rounded-full shrink-0 w-fit">
            Pro
          </span>
          <button
            onClick={handleManageBilling}
            disabled={billingLoading}
            className="text-xs uppercase tracking-widest text-slate hover:text-redline shrink-0 disabled:opacity-40 text-left"
          >
            Manage billing
          </button>
        </>
      ) : (
        <button
          onClick={handleUpgrade}
          disabled={billingLoading}
          className="text-xs uppercase tracking-widest text-redline hover:underline shrink-0 disabled:opacity-40 text-left"
        >
          {billingLoading ? 'Loading…' : 'Upgrade'}
        </button>
      )}
      <UserMenu
        email={user.email}
        onSignOut={() => {
          logout()
          setView('analyze')
        }}
      />
    </>
  )

  return (
    <header
      className={`sticky top-0 z-20 bg-manuscript/90 backdrop-blur-sm border-b py-5 mb-12
        transition-shadow ${scrolled ? 'border-line shadow-[0_2px_10px_-4px_rgba(23,21,34,0.15)]' : 'border-transparent'}`}
    >
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-4">
        <button onClick={onGoHome} className="font-display text-2xl text-ink shrink-0">
          Redline<span className="text-redline">.</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-5 min-w-0">
          {navItems}
          {!loading && !user && (
            <button
              onClick={() => setView('auth')}
              className="text-xs uppercase tracking-widest text-slate hover:text-redline"
            >
              Sign in
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="sm:hidden w-9 h-9 flex items-center justify-center shrink-0"
          aria-label="Menu"
        >
          <div className="w-5 space-y-1.5">
            <span
              className={`block h-[1.5px] bg-ink transition-transform ${mobileOpen ? 'translate-y-[6.5px] rotate-45' : ''}`}
            />
            <span className={`block h-[1.5px] bg-ink transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
            <span
              className={`block h-[1.5px] bg-ink transition-transform ${mobileOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`}
            />
          </div>
        </button>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="sm:hidden max-w-4xl mx-auto px-4 pt-4 flex flex-col gap-4 animate-fade-up">
          {navItems}
          {!loading && !user && (
            <button
              onClick={() => setView('auth')}
              className="text-xs uppercase tracking-widest text-slate hover:text-redline text-left"
            >
              Sign in
            </button>
          )}
        </div>
      )}
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

function MainContent({ view, setView, homeSignal }) {
  const { token } = useAuth()
  const [result, setResult] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [usage, setUsage] = useState(null)

  // The header logo can be clicked from any nested state (results shown, editor
  // open, etc.) — this always forces a full reset back to the true landing page.
  useEffect(() => {
    if (homeSignal === 0) return
    setResult(null)
    setEditing(false)
    setError(null)
  }, [homeSignal])

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

  async function handleUpgrade() {
    if (!token) {
      setView('auth')
      return
    }
    try {
      const res = await fetch(`${API_URL}/billing/checkout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      }
    } catch {
      // silently fail — the Header's own Upgrade button is a reliable fallback
    }
  }

  if (view === 'auth') {
    return <AuthForm onDone={() => setView('analyze')} />
  }

  if (view === 'history') {
    return <HistoryList onBack={() => setView('analyze')} />
  }

  if (view === 'jobs') {
    return <JobTracker onBack={() => setView('analyze')} />
  }

  if (view === 'privacy') {
    return <PrivacyPolicy onBack={() => setView('analyze')} />
  }

  if (view === 'terms') {
    return <TermsOfService onBack={() => setView('analyze')} />
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
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-center mb-10">
        <div>
          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left mb-8">
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
        </div>
        <div className="hidden lg:flex justify-center">
          <HeroVisual />
        </div>
      </div>
      <UsageIndicator usage={usage} />
      <LandingSections onUpgrade={handleUpgrade} />
    </>
  )
}

function BillingBanner() {
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const billing = params.get('billing')
    if (billing === 'success') {
      setMessage({ type: 'success', text: "You're on Pro now — thanks for upgrading! 🎉" })
    } else if (billing === 'cancel') {
      setMessage({ type: 'info', text: 'Checkout was cancelled — no charge was made.' })
    }
    if (billing) {
      params.delete('billing')
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : '')
      window.history.replaceState({}, '', newUrl)
    }
  }, [])

  if (!message) return null

  return (
    <div
      className={`max-w-4xl mx-auto mb-6 px-4 py-3 rounded-sm text-sm border ${
        message.type === 'success'
          ? 'border-slate/40 bg-slate/5 text-ink'
          : 'border-line bg-white/50 text-slate'
      }`}
    >
      {message.text}
    </div>
  )
}

function AppShell() {
  const [view, setView] = useState('analyze') // 'analyze' | 'auth' | 'history'
  const [homeSignal, setHomeSignal] = useState(0)

  // Scroll to the top of the page whenever the view changes (Jobs, History, etc.)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  function goHome() {
    setView('analyze')
    setHomeSignal((n) => n + 1)
  }

  return (
    <div className="min-h-screen bg-manuscript bg-paper-texture flex flex-col relative isolate">
      {/* Soft gradient-mesh wash behind the top of the page — purely decorative.
          Tall enough to cover the hero (including the wider two-column layout),
          and fades out smoothly at the bottom so there's no hard seam where it ends. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[900px] overflow-hidden -z-10"
        style={{
          maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-forest/10 via-manuscript to-redline/10" />
        <div className="absolute -top-40 -left-32 w-[560px] h-[560px] rounded-full bg-forest/25 blur-[100px]" />
        <div className="absolute -top-24 right-[-140px] w-[520px] h-[520px] rounded-full bg-redline/20 blur-[100px]" />
        <div className="absolute top-44 left-1/2 -translate-x-1/2 w-[460px] h-[460px] rounded-full bg-gold/25 blur-[100px]" />
        <div className="absolute top-[440px] right-[8%] w-[480px] h-[480px] rounded-full bg-redline/15 blur-[110px]" />
        <div className="absolute top-[520px] left-[15%] w-[420px] h-[420px] rounded-full bg-forest/15 blur-[110px]" />
      </div>

      <Header view={view} setView={setView} onGoHome={goHome} />
      <main className="px-4 flex-1">
        <BillingBanner />
        <MainContent view={view} setView={setView} homeSignal={homeSignal} />
      </main>
      <Footer setView={setView} onGoHome={goHome} />
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
