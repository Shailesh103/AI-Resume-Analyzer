import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const COLUMNS = [
  { status: 'saved', label: 'Saved', accent: 'bg-slate' },
  { status: 'applied', label: 'Applied', accent: 'bg-gold' },
  { status: 'interviewing', label: 'Interviewing', accent: 'bg-redline' },
  { status: 'offer', label: 'Offer', accent: 'bg-forest' },
  { status: 'rejected', label: 'Rejected', accent: 'bg-ink/30' },
]

function AddJobForm({ onAdd, onCancel }) {
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onAdd({ company, title, url: url || null, notes: notes || null })
      setCompany('')
      setTitle('')
      setUrl('')
      setNotes('')
      onCancel()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-line bg-white/50 rounded-sm p-4 mb-6 max-w-md"
    >
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <input
          required
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="border border-line bg-white/70 rounded-sm px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-redline/40 focus:border-redline"
        />
        <input
          required
          placeholder="Job title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-line bg-white/70 rounded-sm px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-redline/40 focus:border-redline"
        />
      </div>
      <input
        placeholder="Job posting URL (optional)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm mb-3
          focus:outline-none focus:ring-2 focus:ring-redline/40 focus:border-redline"
      />
      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm mb-3
          focus:outline-none focus:ring-2 focus:ring-redline/40 focus:border-redline resize-none"
      />
      {error && <p className="text-xs text-redline mb-3">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-ink text-manuscript text-sm font-medium px-4 py-2 rounded-sm
            hover:bg-redline transition-colors disabled:opacity-40"
        >
          {saving ? 'Adding…' : 'Add job'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-slate hover:text-redline px-2"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function JobCard({ job, onStatusChange, onDelete }) {
  return (
    <div className="border border-line bg-white/50 rounded-sm p-3 mb-2">
      <p className="text-sm font-medium text-ink break-words">{job.title}</p>
      <p className="text-xs text-slate mb-2 break-words">{job.company}</p>
      {job.notes && <p className="text-xs text-ink/70 mb-2 break-words">{job.notes}</p>}
      {job.url && (
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate underline underline-offset-2 hover:text-redline block mb-2 truncate"
        >
          View posting ↗
        </a>
      )}
      <div className="flex items-center justify-between gap-2 mt-2">
        <select
          value={job.status}
          onChange={(e) => onStatusChange(job.id, e.target.value)}
          className="text-xs border border-line rounded-sm px-1.5 py-1 bg-white/70 flex-1
            focus:outline-none focus:ring-1 focus:ring-redline/40"
        >
          {COLUMNS.map((c) => (
            <option key={c.status} value={c.status}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => onDelete(job.id)}
          className="text-slate hover:text-redline text-xs shrink-0"
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default function JobTracker({ onBack }) {
  const { token, user, loading: authLoading } = useAuth()
  const [jobs, setJobs] = useState(null)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (!token) return
    fetch(`${API_URL}/jobs`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load jobs')
        return res.json()
      })
      .then(setJobs)
      .catch((e) => setError(e.message))
  }, [token])

  async function addJob(fields) {
    const res = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.detail || 'Could not add job')
    }
    const newJob = await res.json()
    setJobs((prev) => [newJob, ...(prev || [])])
  }

  async function updateStatus(jobId, status) {
    const res = await fetch(`${API_URL}/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)))
    }
  }

  async function deleteJob(jobId) {
    if (!confirm('Delete this job?')) return
    await fetch(`${API_URL}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    setJobs((prev) => prev.filter((j) => j.id !== jobId))
  }

  if (!authLoading && !user) {
    return (
      <div className="max-w-md mx-auto text-center">
        <p className="text-slate mb-4">Sign in to track jobs you're applying to.</p>
        <button
          onClick={onBack}
          className="text-sm underline underline-offset-4 text-slate hover:text-redline"
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-ink">Job tracker</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="text-xs uppercase tracking-widest text-redline hover:underline"
          >
            {showAddForm ? 'Close' : '+ Add job'}
          </button>
          <button
            onClick={onBack}
            className="text-sm text-slate hover:text-redline underline underline-offset-4"
          >
            Back
          </button>
        </div>
      </div>

      {showAddForm && <AddJobForm onAdd={addJob} onCancel={() => setShowAddForm(false)} />}

      {error && <p className="text-sm text-redline mb-4">{error}</p>}

      {jobs === null && !error && <p className="text-sm text-slate">Loading…</p>}

      {jobs && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {COLUMNS.map((col) => {
            const colJobs = jobs.filter((j) => j.status === col.status)
            return (
              <div key={col.status}>
                <div className={`h-1 ${col.accent} rounded-full mb-2`} />
                <div className="flex items-center justify-between mb-3 border-b border-line pb-2">
                  <h3 className="text-xs uppercase tracking-widest text-slate font-medium">
                    {col.label}
                  </h3>
                  <span className="text-xs font-mono text-slate">{colJobs.length}</span>
                </div>
                {colJobs.length === 0 && (
                  <p className="text-xs text-slate/60 italic">Nothing here</p>
                )}
                {colJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onStatusChange={updateStatus}
                    onDelete={deleteJob}
                  />
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
