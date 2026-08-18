import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function ScoreRing({ score }) {
  const color = score >= 80 ? 'text-forest border-forest' : score >= 50 ? 'text-gold border-gold' : 'text-redline border-redline'
  return (
    <div className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center shrink-0 ${color}`}>
      <span className="font-display text-lg">{score}</span>
    </div>
  )
}

function AtsCheckTab({ resumeId, refreshSignal }) {
  const { token } = useAuth()
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/resumes/${resumeId}/ats-check`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Could not run the ATS check.')
        return res.json()
      })
      .then(setResult)
      .catch((e) => setError(e.message))
    // refreshSignal bumps whenever the resume is saved, so the check re-runs with fresh data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, token, refreshSignal])

  if (error) return <p className="text-xs text-redline">{error}</p>
  if (!result) return <p className="text-xs text-slate">Checking…</p>

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <ScoreRing score={result.score} />
        <div>
          <p className="text-xs uppercase tracking-widest text-slate">ATS Compatibility</p>
          <p className="text-[11px] text-slate mt-0.5">
            {result.checks.filter((c) => c.passed).length} of {result.checks.length} checks passed
          </p>
        </div>
      </div>
      <div className="space-y-2.5">
        {result.checks.map((c, i) => (
          <div key={i} className="flex gap-2 text-xs">
            <span className={c.passed ? 'text-forest' : 'text-redline'}>{c.passed ? '✓' : '✕'}</span>
            <div>
              <p className="text-ink font-medium">{c.label}</p>
              <p className="text-slate">{c.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OptimizeForJobTab({ resumeId }) {
  const { token } = useAuth()
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function runOptimize() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${API_URL}/resumes/${resumeId}/optimize-for-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ job_description: jobDescription }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Could not check this job description.')
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        rows={5}
        placeholder="Paste a job description to check your resume against it…"
        className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-xs resize-none
          focus:outline-none focus:ring-2 focus:ring-redline/40 focus:border-redline mb-2"
      />
      <button
        onClick={runOptimize}
        disabled={loading || !jobDescription.trim()}
        className="text-xs uppercase tracking-widest text-redline hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Checking…' : '✦ Check against this job'}
      </button>

      {error && <p className="text-xs text-redline mt-3">{error}</p>}

      {result && (
        <div className="mt-4 space-y-4">
          {result.missing_keywords.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate mb-1.5">Missing keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing_keywords.map((k, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded-full border border-redline/40 text-redline">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
          {result.matched_keywords.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate mb-1.5">Already covered</p>
              <div className="flex flex-wrap gap-1.5">
                {result.matched_keywords.map((k, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded-full border border-forest/40 text-forest">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
          {result.suggestions.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate mb-1.5">Suggestions</p>
              <ul className="space-y-1.5">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-ink flex gap-1.5">
                    <span className="text-redline shrink-0">✎</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AtsPanel({ resumeId, refreshSignal }) {
  const [tab, setTab] = useState('check') // 'check' | 'optimize'

  return (
    <div className="border border-line bg-white/40 rounded-sm p-4 mt-6">
      <div className="flex gap-4 border-b border-line mb-4 pb-2">
        <button
          onClick={() => setTab('check')}
          className={`text-xs uppercase tracking-widest ${tab === 'check' ? 'text-redline' : 'text-slate hover:text-redline'}`}
        >
          ATS Check
        </button>
        <button
          onClick={() => setTab('optimize')}
          className={`text-xs uppercase tracking-widest ${tab === 'optimize' ? 'text-redline' : 'text-slate hover:text-redline'}`}
        >
          Optimize for job
        </button>
      </div>
      {tab === 'check' ? (
        <AtsCheckTab resumeId={resumeId} refreshSignal={refreshSignal} />
      ) : (
        <OptimizeForJobTab resumeId={resumeId} />
      )}
    </div>
  )
}
