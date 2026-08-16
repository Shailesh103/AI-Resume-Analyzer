import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import BuilderEditor from './BuilderEditor'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TEMPLATE_LABELS = {
  modern: 'Modern ATS',
  professional: 'Professional',
  executive: 'Executive',
  developer: 'Developer',
  minimal: 'Minimal',
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function NewResumeForm({ onCreate, onCancel }) {
  const [title, setTitle] = useState('')
  const [template, setTemplate] = useState('modern')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onCreate({ title: title || 'Untitled resume', template })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-line bg-white/50 rounded-sm p-4 mb-6 max-w-md"
    >
      <input
        placeholder="Resume title (e.g. Software Engineer Resume)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm mb-3
          focus:outline-none focus:ring-2 focus:ring-redline/40 focus:border-redline"
      />
      <select
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm mb-3
          focus:outline-none focus:ring-2 focus:ring-redline/40 focus:border-redline"
      >
        {Object.entries(TEMPLATE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-redline mb-3">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-ink text-manuscript text-xs uppercase tracking-widest px-4 py-2 rounded-sm disabled:opacity-50"
        >
          {saving ? 'Creating…' : 'Create resume'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs uppercase tracking-widest text-slate hover:text-redline px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  )
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

export default function ResumeBuilderDashboard({ onBack }) {
  const { token, user, loading: authLoading } = useAuth()
  const [resumes, setResumes] = useState(null)
  const [error, setError] = useState(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    if (!token) return
    fetch(`${API_URL}/resumes`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load your resumes')
        return res.json()
      })
      .then(setResumes)
      .catch((e) => setError(e.message))
  }, [token])

  async function createResume({ title, template }) {
    const res = await fetch(`${API_URL}/resumes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, template }),
    })
    if (!res.ok) throw new Error('Could not create resume')
    const created = await res.json()
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
      setError('Could not duplicate resume')
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

  if (!authLoading && !user) {
    return (
      <div className="max-w-md mx-auto text-center">
        <p className="text-slate mb-4">Sign in to build and save resumes.</p>
        <button
          onClick={onBack}
          className="text-sm underline underline-offset-4 text-slate hover:text-redline"
        >
          Go back
        </button>
      </div>
    )
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

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-ink">My resumes</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNewForm((v) => !v)}
            className="text-xs uppercase tracking-widest text-redline hover:underline"
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

      <p className="text-xs text-slate mb-6 max-w-md">
        Build a resume section by section with a live preview. Templates and PDF download are coming in the next phases.
      </p>

      {showNewForm && <NewResumeForm onCreate={createResume} onCancel={() => setShowNewForm(false)} />}

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
