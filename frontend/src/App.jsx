import { useState } from 'react'
import UploadForm from './components/UploadForm'
import ResultsDashboard from './components/ResultsDashboard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleAnalyze(file, jobDescription) {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('resume', file)
    if (jobDescription?.trim()) {
      formData.append('job_description', jobDescription)
    }

    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || `Request failed (${res.status})`)
      }

      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-manuscript bg-paper-texture">
      <header className="border-b border-line py-6 mb-12">
        <div className="max-w-4xl mx-auto px-4 flex items-baseline justify-between">
          <h1 className="font-display text-2xl text-ink">
            Redline<span className="text-redline">.</span>
          </h1>
          <p className="text-xs uppercase tracking-widest text-slate">
            AI resume analyzer
          </p>
        </div>
      </header>

      <main className="px-4 pb-24">
        {!result ? (
          <>
            <div className="max-w-2xl mx-auto text-center mb-10">
              <h2 className="font-display text-3xl md:text-4xl text-ink leading-tight">
                Get your resume <span className="italic">marked up</span> like a recruiter would.
              </h2>
              <p className="text-slate mt-3">
                Upload once, get an ATS score, a red-pen edit of your weakest bullets,
                and the keywords you're missing.
              </p>
            </div>
            <UploadForm onAnalyze={handleAnalyze} loading={loading} error={error} />
          </>
        ) : (
          <ResultsDashboard data={result} onReset={() => setResult(null)} />
        )}
      </main>
    </div>
  )
}
