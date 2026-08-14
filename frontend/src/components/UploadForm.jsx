import { useState, useRef } from 'react'

function DocumentIcon({ className }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 4h13l7 7v23a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M24 4v7h7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 21h14M13 26h14M13 16h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function CheckStampIcon({ className }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M13 20.5l4.5 4.5L27 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

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
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        className={`cursor-pointer border-2 border-dashed rounded-sm p-10 text-center
          transition-all duration-200
          ${dragActive ? 'border-redline bg-redline/5 scale-[1.01]' : 'border-line bg-white/40 hover:border-slate/50 hover:bg-white/60'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {file ? (
          <div className="flex flex-col items-center animate-fade-up">
            <CheckStampIcon className="w-10 h-10 text-forest mb-3" />
            <p className="font-mono text-sm text-ink break-all">{file.name}</p>
            <p className="text-xs text-slate mt-1">Click to choose a different file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <DocumentIcon
              className={`w-10 h-10 mb-3 transition-colors ${dragActive ? 'text-redline' : 'text-slate/70'}`}
            />
            <p className="font-display text-xl text-ink italic">
              {dragActive ? 'Drop it right here' : 'Drop your resume here'}
            </p>
            <p className="text-sm text-slate mt-2">
              PDF, DOCX, or TXT — up to 8MB — or click to browse
            </p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="block text-xs uppercase tracking-widest text-slate mb-2 font-medium">
          Target job description <span className="text-slate/50">(optional, sharpens the review)</span>
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={6}
          placeholder="Paste the job posting here to get keyword-gap and match scoring…"
          className="w-full border border-line bg-white/60 rounded-sm p-3 text-sm font-body
            transition-colors focus:outline-none focus:ring-2 focus:ring-redline/40 focus:border-redline resize-none"
        />
      </div>

      {error && (
        <p className="mt-4 text-sm text-redline border-l-2 border-redline pl-3 animate-fade-up">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!file || loading}
        className="mt-6 w-full bg-ink text-manuscript font-body font-medium py-3 rounded-sm
          hover:bg-redline active:scale-[0.99] transition-all disabled:opacity-40
          disabled:hover:bg-ink disabled:active:scale-100 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-manuscript/40 border-t-manuscript animate-spin" />
            Marking up your resume…
          </span>
        ) : (
          'Analyze resume'
        )}
      </button>
    </form>
  )
}
