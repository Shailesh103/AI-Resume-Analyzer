import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import TemplateGallery from './TemplateGallery'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ResumeOnboarding({ isPro, onCreated, onCancel }) {
  const { token } = useAuth()
  const [step, setStep] = useState('ask') // 'ask' | 'pickHistory' | 'gallery'
  const [mode, setMode] = useState('manual') // 'manual' | 'import'
  const [history, setHistory] = useState(null)
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (step !== 'pickHistory' || history !== null) return
    fetch(`${API_URL}/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then(setHistory)
      .catch(() => setHistory([]))
  }, [step, history, token])

  function chooseHasResume() {
    setMode('import')
    setStep('pickHistory')
  }

  function chooseStartBlank() {
    setMode('manual')
    setSelectedAnalysisId(null)
    setStep('gallery')
  }

  function pickHistoryItem(id) {
    setSelectedAnalysisId(id)
    setStep('gallery')
  }

  async function handleTemplateSelect(template) {
    setCreating(true)
    setError(null)
    try {
      const url = mode === 'import' ? `${API_URL}/resumes/import` : `${API_URL}/resumes`
      const body =
        mode === 'import'
          ? { analysis_id: selectedAnalysisId, template }
          : { title: 'Untitled resume', template }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Could not create resume')
      onCreated(data)
    } catch (e) {
      setError(e.message)
      setCreating(false)
    }
  }

  return (
    <div className="border border-line bg-white/50 rounded-sm p-6 mb-6">
      {step === 'ask' && (
        <div className="max-w-md">
          <p className="font-display text-lg text-ink mb-1">Let's create your resume</p>
          <p className="text-sm text-slate mb-5">
            Do you already have a resume you've analyzed with Redline?
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={chooseHasResume}
              className="bg-ink text-manuscript text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm"
            >
              Yes, use one from my history
            </button>
            <button
              onClick={chooseStartBlank}
              className="border border-line text-ink text-xs uppercase tracking-widest px-4 py-2.5 rounded-sm hover:border-redline hover:text-redline transition-colors"
            >
              No, start from scratch
            </button>
          </div>
          <button onClick={onCancel} className="text-xs text-slate hover:text-redline mt-4">
            Cancel
          </button>
        </div>
      )}

      {step === 'pickHistory' && (
        <div>
          <p className="font-display text-lg text-ink mb-1">Pick a resume to import</p>
          <p className="text-sm text-slate mb-4">
            We'll pull your details from it and drop them straight into the template you choose.
          </p>

          {history === null && <p className="text-sm text-slate">Loading…</p>}

          {history && history.length === 0 && (
            <div className="border border-dashed border-line rounded-sm p-6 text-center mb-4">
              <p className="text-slate text-sm">You haven't analyzed a resume yet.</p>
            </div>
          )}

          {history && history.length > 0 && (
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => pickHistoryItem(h.id)}
                  className="w-full flex items-center justify-between text-left border border-line rounded-sm px-3 py-2.5 hover:border-redline transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">{h.filename}</p>
                    <p className="text-xs text-slate">{formatDate(h.created_at)}</p>
                  </div>
                  <span className="text-xs text-forest shrink-0 ml-3">ATS {h.ats_score}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button onClick={chooseStartBlank} className="text-xs uppercase tracking-widest text-redline hover:underline">
              Start from scratch instead
            </button>
            <button onClick={() => setStep('ask')} className="text-xs text-slate hover:text-redline">
              Back
            </button>
          </div>
        </div>
      )}

      {step === 'gallery' && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="font-display text-lg text-ink">Choose a template</p>
            <button
              onClick={() => setStep(mode === 'import' ? 'pickHistory' : 'ask')}
              className="text-xs text-slate hover:text-redline"
            >
              Back
            </button>
          </div>
          <p className="text-sm text-slate mb-5">
            {mode === 'import'
              ? "We'll fill this template in with your resume's details."
              : "You'll start with a blank version of whichever one you pick."}
          </p>

          {creating ? (
            <p className="text-sm text-slate">
              {mode === 'import' ? 'Reading your resume and building your draft…' : 'Creating your resume…'}
            </p>
          ) : (
            <TemplateGallery isPro={isPro} onSelect={handleTemplateSelect} />
          )}

          {error && <p className="text-sm text-redline mt-4">{error}</p>}
        </div>
      )}
    </div>
  )
}
