import { useState, useRef } from 'react'

export default function UploadForm({ onAnalyze, loading, error }) {
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

  function handleFile(f) {
    if (!f) return
    setFile(f)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragActive(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!file) return
    onAnalyze(file, jobDescription)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-sm p-10 text-center transition-colors
          ${dragActive ? 'border-redline bg-redline/5' : 'border-line bg-white/40'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {file ? (
          <div>
            <p className="font-mono text-sm text-ink">{file.name}</p>
            <p className="text-xs text-slate mt-1">Click to choose a different file</p>
          </div>
        ) : (
          <div>
            <p className="font-display text-xl text-ink italic">
              Drop your resume here
            </p>
            <p className="text-sm text-slate mt-2">
              PDF, DOCX, or TXT — up to 8MB — or click to browse
            </p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="block text-xs uppercase tracking-widest text-slate mb-2 font-medium">
          Target job description <span className="text-line">(optional, sharpens the review)</span>
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={6}
          placeholder="Paste the job posting here to get keyword-gap and match scoring…"
          className="w-full border border-line bg-white/60 rounded-sm p-3 text-sm font-body
            focus:outline-none focus:ring-2 focus:ring-redline/40 focus:border-redline resize-none"
        />
      </div>

      {error && (
        <p className="mt-4 text-sm text-redline border-l-2 border-redline pl-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={!file || loading}
        className="mt-6 w-full bg-ink text-manuscript font-body font-medium py-3 rounded-sm
          hover:bg-redline transition-colors disabled:opacity-40 disabled:hover:bg-ink
          disabled:cursor-not-allowed"
      >
        {loading ? 'Marking up your resume…' : 'Analyze resume'}
      </button>
    </form>
  )
}
