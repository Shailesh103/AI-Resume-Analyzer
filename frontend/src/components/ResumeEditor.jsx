import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ResumeEditor({ resumeText, weakBullets, filename, onBack }) {
  const [text, setText] = useState(resumeText || '')
  const [appliedIndices, setAppliedIndices] = useState(new Set())
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState(null)

  function applyRewrite(bullet, index) {
    if (!text.includes(bullet.original)) {
      setError(
        `Couldn't find that exact line in the text below — it may have already been edited. Paste the rewrite in manually if needed.`
      )
      return
    }
    setText((prev) => prev.replace(bullet.original, bullet.rewrite))
    setAppliedIndices((prev) => new Set(prev).add(index))
    setError(null)
  }

  async function handleExport() {
    setExporting(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/export/docx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: text }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || 'Export failed.')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = (filename?.replace(/\.[^.]+$/, '') || 'resume') + '-improved.docx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      setError(e.message || 'Something went wrong exporting the file.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate">Build improved resume</p>
          <h2 className="font-display text-2xl text-ink">Edit &amp; export</h2>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-slate hover:text-redline underline underline-offset-4"
        >
          Back to analysis
        </button>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-6">
        {/* Editable resume text */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-slate mb-2">
            Resume text — edit freely
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={28}
            className="w-full border border-line bg-white/60 rounded-sm p-4 text-sm font-mono
              leading-relaxed focus:outline-none focus:ring-2 focus:ring-redline/40 focus:border-redline
              resize-y"
            spellCheck={false}
          />

          {error && (
            <p className="mt-3 text-sm text-redline border-l-2 border-redline pl-3">{error}</p>
          )}

          <button
            onClick={handleExport}
            disabled={exporting || !text.trim()}
            className="mt-4 w-full bg-ink text-manuscript font-body font-medium py-3 rounded-sm
              hover:bg-redline transition-colors disabled:opacity-40 disabled:hover:bg-ink"
          >
            {exporting ? 'Building your file…' : 'Export as Word (.docx)'}
          </button>
        </div>

        {/* AI rewrite suggestions to apply */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-slate mb-2">
            Apply red-pen rewrites
          </label>
          {(!weakBullets || weakBullets.length === 0) && (
            <p className="text-sm text-slate">
              No bullet-level suggestions from the analysis — just edit the text directly.
            </p>
          )}
          <div className="space-y-3">
            {weakBullets?.map((bullet, i) => {
              const applied = appliedIndices.has(i)
              return (
                <div
                  key={i}
                  className={`border rounded-sm p-3 transition-colors ${
                    applied ? 'border-slate/40 bg-slate/5' : 'border-line bg-white/40'
                  }`}
                >
                  <p className="text-xs text-ink/60 line-through mb-1">{bullet.original}</p>
                  <p className="text-xs text-ink font-medium mb-2">→ {bullet.rewrite}</p>
                  <button
                    onClick={() => applyRewrite(bullet, i)}
                    disabled={applied}
                    className="text-xs uppercase tracking-widest px-2.5 py-1 rounded-full border
                      border-redline text-redline hover:bg-redline hover:text-manuscript
                      transition-colors disabled:opacity-40 disabled:hover:bg-transparent
                      disabled:hover:text-redline disabled:cursor-default"
                  >
                    {applied ? 'Applied ✓' : 'Insert into resume'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
