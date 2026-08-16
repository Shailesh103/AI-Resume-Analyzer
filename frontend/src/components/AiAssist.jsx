import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const BULLET_ACTIONS = [
  { key: 'improve_bullet', label: 'Improve' },
  { key: 'make_concise', label: 'More concise' },
  { key: 'make_professional', label: 'More professional' },
  { key: 'add_measurable_impact', label: 'Add impact' },
]

export const SUMMARY_ACTIONS = [
  { key: 'improve_summary', label: 'Improve' },
  { key: 'make_concise', label: 'More concise' },
  { key: 'make_professional', label: 'More professional' },
]

export const PROJECT_DESCRIPTION_ACTIONS = [{ key: 'generate_project_description', label: 'Draft with AI' }]

/**
 * text: the current value to send to the AI.
 * actions: which quick actions to offer (see the lists above).
 * onAccept(suggestion): called only when the user explicitly clicks "Use this" —
 * the AI never overwrites the field on its own.
 */
export function AiAssistButton({ text, actions = BULLET_ACTIONS, onAccept, label = '✦ Improve with AI' }) {
  const { token } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState(null)
  const [error, setError] = useState(null)

  async function runAction(action) {
    setOpen(false)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/ai-assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Could not get an AI suggestion.')
      setSuggestion(data.suggestion)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (suggestion) {
    return (
      <div className="border border-redline/40 bg-redline/5 rounded-sm p-2 mt-1.5">
        <p className="text-[10px] uppercase tracking-widest text-redline mb-1">AI suggestion</p>
        <p className="text-xs text-ink mb-2 leading-relaxed">{suggestion}</p>
        <div className="flex gap-3 text-[11px] uppercase tracking-widest">
          <button
            type="button"
            onClick={() => {
              onAccept(suggestion)
              setSuggestion(null)
            }}
            className="text-forest hover:underline"
          >
            Use this
          </button>
          <button type="button" onClick={() => setSuggestion(null)} className="text-slate hover:text-redline">
            Discard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative inline-block mt-1">
      <button
        type="button"
        disabled={loading || !text || !text.trim()}
        onClick={() => setOpen((v) => !v)}
        className="text-[11px] uppercase tracking-widest text-redline hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Thinking…' : label}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-44 bg-manuscript border border-line rounded-sm shadow-lg py-1 z-20">
          {actions.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => runAction(a.key)}
              className="w-full text-left px-3 py-1.5 text-xs text-slate hover:text-redline hover:bg-white/50"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-[10px] text-redline mt-1">{error}</p>}
    </div>
  )
}
