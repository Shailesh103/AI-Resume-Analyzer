import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import BuilderEditor from './BuilderEditor'
import ResumeOnboarding from './ResumeOnboarding'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TEMPLATE_LABELS = {
  modern: 'Modern ATS',
  professional: 'Professional',
  executive: 'Executive',
  developer: 'Developer',
  minimal: 'Minimal',
}

const FREE_RESUME_LIMIT = 2

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function ResumeCard({ resume, onEdit, onRename, onDuplicate, onDelete }) {
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState(resume.title)

  async function saveRename() {
    setRenaming(false)
    if (title.trim() && title !== resume.title) {
      await onRename(resume.id, title.trim())
    } else {
      setTitle(resume.title)
    }
  }

  return (
    <div className="border border-line bg-white/50 rounded-sm p-4 flex flex-col gap-3">
      {renaming ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveRename}
          onKeyDown={(e) => e.key === 'Enter' && saveRename()}
          className="border border-line bg-white/70 rounded-sm px-2 py-1 text-sm font-display
            focus:outline-none focus:ring-2 focus:ring-redline/40 focus:border-redline"
        />
      ) : (
        <button
          onClick={() => setRenaming(true)}
          className="font-display text-lg text-ink text-left hover:text-redline transition-colors truncate"
        >
          {resume.title}
        </button>
      )}

      <div className="flex items-center gap-2 text-xs text-slate">
        <span className="px-2 py-0.5 border border-line rounded-full">
          {TEMPLATE_LABELS[resume.template] || resume.template}
        </span>
        {resume.ats_score != null && (
          <span className="text-forest">ATS {resume.ats_score}</span>
        )}
      </div>

      <p className="text-xs text-slate">Updated {formatDate(resume.updated_at)}</p>

      <div className="flex items-center gap-4 mt-1 text-xs uppercase tracking-widest">
        <button onClick={() => onEdit(resume.id)} className="text-redline hover:underline">
          Edit
        </button>
        <button onClick={() => onDuplicate(resume.id)} className="text-slate hover:text-redline">
          Duplicate
        </button>
        <button onClick={() => onDelete(resume.id)} className="text-slate hover:text-redline">
          Delete
        </button>
      </div>
    </div>
  )
}

export default function ResumeBuilderDashboard({ onBack, onRequireAuth }) {
  const { token, user, isPro, loading: authLoading } = useAuth()
  const [resumes, setResumes] = useState(null)
  const [error, setError] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    if (!token) {
      setResumes([])
      return
    }
    fetch(`${API_URL}/resumes`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load your resumes')
        return res.json()
      })
      .then(setResumes)
      .catch((e) => setError(e.message))
  }, [token])

  function handleResumeCreated(created) {
    setResumes((prev) => [
      { id: created.id, title: created.title, template: created.template, ats_score: created.ats_score, created_at: created.created_at, updated_at: created.updated_at },
      ...(prev || []),
    ])
    setShowNewForm(false)
    setEditingId(created.id)
  }

  async function renameResume(id, title) {
    const res = await fetch(`${API_URL}/resumes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title }),
    })
    if (!res.ok) {
      setError('Could not rename resume')
      return
    }
    const updated = await res.json()
    setResumes((prev) => prev.map((r) => (r.id === id ? { ...r, title: updated.title, updated_at: updated.updated_at } : r)))
  }

  async function duplicateResume(id) {
    const res = await fetch(`${API_URL}/resumes/${id}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.detail || 'Could not duplicate resume')
      return
    }
    const created = await res.json()
    setResumes((prev) => [
      { id: created.id, title: created.title, template: created.template, ats_score: created.ats_score, created_at: created.created_at, updated_at: created.updated_at },
      ...(prev || []),
    ])
  }

  async function deleteResume(id) {
    if (!confirm('Delete this resume?')) return
    await fetch(`${API_URL}/resumes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setResumes((prev) => prev.filter((r) => r.id !== id))
  }

  if (editingId) {
    return (
      <BuilderEditor
        resumeId={editingId}
        onBack={() => {
          setEditingId(null)
          // Refresh the list so title/updated_at reflect any edits made.
          fetch(`${API_URL}/resumes`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => res.json())
            .then(setResumes)
            .catch(() => {})
        }}
      />
    )
  }

  const atFreeLimit = !isPro && (resumes || []).length >= FREE_RESUME_LIMIT

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-ink">My resumes</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (!user) return onRequireAuth()
              if (atFreeLimit) return
              setShowNewForm((v) => !v)
            }}
            disabled={atFreeLimit}
            className="text-xs uppercase tracking-widest text-redline hover:underline disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
          >
            {showNewForm ? 'Close' : '+ Create resume'}
          </button>
          <button
            onClick={onBack}
            className="text-sm text-slate hover:text-redline underline underline-offset-4"
          >
            Back
          </button>
        </div>
      </div>

      {!authLoading && !user && (
        <p className="text-xs text-slate mb-6">
          Browsing as a guest — <button onClick={onRequireAuth} className="text-redline hover:underline">sign in</button> to
          build and save resumes.
        </p>
      )}

      {user && !isPro && (
        <p className="text-xs text-slate mb-6">
          {(resumes || []).length} of {FREE_RESUME_LIMIT} resumes used on the Free plan
          {atFreeLimit && <span className="text-redline"> — upgrade to Pro for unlimited resumes and every template.</span>}
        </p>
      )}

      <p className="text-xs text-slate mb-6 max-w-md">
        Build a resume section by section with a live preview, switch between 5 templates, and download a polished PDF.
      </p>

      {showNewForm && (
        <ResumeOnboarding isPro={isPro} onCreated={handleResumeCreated} onCancel={() => setShowNewForm(false)} />
      )}

      {error && <p className="text-sm text-redline mb-4">{error}</p>}

      {resumes === null && !error && <p className="text-sm text-slate">Loading…</p>}

      {resumes && resumes.length === 0 && (
        <div className="border border-dashed border-line rounded-sm p-10 text-center">
          <p className="text-slate text-sm mb-1">No resumes yet.</p>
          <p className="text-slate text-xs">Create one to get started.</p>
        </div>
      )}

      {resumes && resumes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((r) => (
            <ResumeCard
              key={r.id}
              resume={r}
              onEdit={setEditingId}
              onRename={renameResume}
              onDuplicate={duplicateResume}
              onDelete={deleteResume}
            />
          ))}
        </div>
      )}
    </div>
  )
}
