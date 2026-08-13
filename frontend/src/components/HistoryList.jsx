import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import ResultsDashboard from './ResultsDashboard'
import ResumeEditor from './ResumeEditor'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function scoreColor(score) {
  if (score >= 80) return 'text-forest'
  if (score >= 60) return 'text-gold'
  return 'text-redline'
}

export default function HistoryList({ onBack }) {
  const { token } = useAuth()
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)
  const [detail, setDetail] = useState(null)
  const [editing, setEditing] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load history')
        return res.json()
      })
      .then(setItems)
      .catch((e) => setError(e.message))
  }, [token])

  async function openItem(id) {
    setDetailLoading(true)
    try {
      const res = await fetch(`${API_URL}/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Could not load this analysis')
      const data = await res.json()
      setDetail({ filename: data.filename, resume_text: data.resume_text, analysis: data.analysis })
    } catch (e) {
      setError(e.message)
    } finally {
      setDetailLoading(false)
    }
  }

  async function deleteItem(id, e) {
    e.stopPropagation()
    if (!confirm('Delete this analysis?')) return
    await fetch(`${API_URL}/history/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  if (detail && editing) {
    return (
      <ResumeEditor
        resumeText={detail.resume_text}
        weakBullets={detail.analysis.weak_bullets}
        filename={detail.filename}
        onBack={() => setEditing(false)}
      />
    )
  }

  if (detail) {
    return (
      <ResultsDashboard
        data={detail}
        onReset={() => setDetail(null)}
        onBuildResume={detail.resume_text ? () => setEditing(true) : undefined}
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-ink">Your analysis history</h2>
        <button
          onClick={onBack}
          className="text-sm text-slate hover:text-redline underline underline-offset-4"
        >
          New analysis
        </button>
      </div>

      {error && <p className="text-sm text-redline">{error}</p>}

      {items === null && !error && (
        <p className="text-sm text-slate flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-line border-t-slate animate-spin" />
          Loading your history…
        </p>
      )}

      {items?.length === 0 && (
        <p className="text-sm text-slate">
          No analyses yet — upload a resume to get started.
        </p>
      )}

      <div className="space-y-2">
        {items?.map((item) => (
          <div
            key={item.id}
            onClick={() => openItem(item.id)}
            className="flex items-center justify-between gap-4 border border-line bg-white/40
              rounded-sm px-4 py-3 cursor-pointer hover:border-redline/50 transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{item.filename}</p>
              <p className="text-xs text-slate mt-0.5">
                {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div className="text-right">
                <p className={`font-mono text-sm font-medium ${scoreColor(item.overall_score)}`}>
                  {item.overall_score}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-slate">Overall</p>
              </div>
              <div className="text-right">
                <p className={`font-mono text-sm font-medium ${scoreColor(item.ats_score)}`}>
                  {item.ats_score}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-slate">ATS</p>
              </div>
              <button
                onClick={(e) => deleteItem(item.id, e)}
                className="text-slate hover:text-redline text-xs"
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {detailLoading && (
        <p className="text-sm text-slate mt-4 flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-line border-t-slate animate-spin" />
          Loading analysis…
        </p>
      )}
    </div>
  )
}
