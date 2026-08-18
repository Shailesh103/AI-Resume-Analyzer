import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  PersonalInfoSection,
  SummarySection,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  ProjectsSection,
  CertificationsSection,
  AchievementsSection,
  LanguagesSection,
  CustomSectionsSection,
} from './BuilderSections'
import ResumeRenderer from './ResumeRenderer'
import AtsPanel from './AtsPanel'
import { TEMPLATE_LIST } from './templates/index'
import { SECTION_TITLES } from './BuilderPreview'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Personal Info is always shown first and isn't part of the reorderable list.
// Summary lives inside sectionOrder itself (like Experience, Education, ...),
// so it must NOT also be listed here — that was causing it to render twice.
const FIXED_LEADING_SECTIONS = ['personalInfo']

function SectionForm({ activeKey, resumeData, setField }) {
  switch (activeKey) {
    case 'personalInfo':
      return <PersonalInfoSection data={resumeData.personalInfo} onChange={(v) => setField('personalInfo', v)} />
    case 'summary':
      return <SummarySection value={resumeData.summary} onChange={(v) => setField('summary', v)} />
    case 'experience':
      return <ExperienceSection items={resumeData.experience} onChange={(v) => setField('experience', v)} />
    case 'education':
      return <EducationSection items={resumeData.education} onChange={(v) => setField('education', v)} />
    case 'skills':
      return <SkillsSection items={resumeData.skills} onChange={(v) => setField('skills', v)} />
    case 'projects':
      return <ProjectsSection items={resumeData.projects} onChange={(v) => setField('projects', v)} />
    case 'certifications':
      return <CertificationsSection items={resumeData.certifications} onChange={(v) => setField('certifications', v)} />
    case 'achievements':
      return <AchievementsSection items={resumeData.achievements} onChange={(v) => setField('achievements', v)} />
    case 'languages':
      return <LanguagesSection items={resumeData.languages} onChange={(v) => setField('languages', v)} />
    case 'customSections':
      return <CustomSectionsSection items={resumeData.customSections} onChange={(v) => setField('customSections', v)} />
    default:
      return null
  }
}

export default function BuilderEditor({ resumeId, onBack }) {
  const { token } = useAuth()
  const [title, setTitle] = useState('')
  const [template, setTemplate] = useState('modern')
  const [resumeData, setResumeData] = useState(null)
  const [sectionOrder, setSectionOrder] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved
  const [saveCount, setSaveCount] = useState(0)
  const [showPreview, setShowPreview] = useState(false) // mobile toggle
  const [activeKey, setActiveKey] = useState('personalInfo')
  const [downloading, setDownloading] = useState(false)

  const saveTimer = useRef(null)
  const skipNextSave = useRef(true) // don't autosave the instant we've just loaded

  useEffect(() => {
    fetch(`${API_URL}/resumes/${resumeId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load this resume')
        return res.json()
      })
      .then((data) => {
        setTitle(data.title)
        setTemplate(data.template)
        setResumeData(data.resume_data)
        setSectionOrder(data.section_order)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [resumeId, token])

  const doSave = useCallback(
    async (nextTitle, nextTemplate, nextData, nextOrder) => {
      setSaveStatus('saving')
      try {
        await fetch(`${API_URL}/resumes/${resumeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: nextTitle, template: nextTemplate, resume_data: nextData, section_order: nextOrder }),
        })
        setSaveStatus('saved')
        setSaveCount((n) => n + 1)
      } catch {
        setSaveStatus('idle')
      }
    },
    [resumeId, token]
  )

  // Debounced autosave whenever title/template/resumeData/sectionOrder change.
  useEffect(() => {
    if (loading || !resumeData) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      doSave(title, template, resumeData, sectionOrder)
    }, 1000)
    return () => clearTimeout(saveTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, template, resumeData, sectionOrder])

  function setField(key, value) {
    setResumeData((prev) => ({ ...prev, [key]: value }))
  }

  function moveSection(key, dir) {
    const i = sectionOrder.indexOf(key)
    const j = i + dir
    if (i < 0 || j < 0 || j >= sectionOrder.length) return
    const next = [...sectionOrder]
    ;[next[i], next[j]] = [next[j], next[i]]
    setSectionOrder(next)
  }

  const navSections = resumeData ? [...FIXED_LEADING_SECTIONS, ...sectionOrder, 'customSections'] : []
  const stepIndex = navSections.indexOf(activeKey)

  function goStep(dir) {
    const next = navSections[stepIndex + dir]
    if (next) setActiveKey(next)
  }

  async function downloadPdf() {
    setDownloading(true)
    try {
      const res = await fetch(`${API_URL}/resumes/${resumeId}/generate-pdf`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Could not generate the PDF. Please try again.')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${title || 'resume'}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert(e.message)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <p className="text-sm text-slate max-w-5xl mx-auto">Loading…</p>
  if (error) {
    return (
      <div className="max-w-md mx-auto text-center">
        <p className="text-redline mb-4">{error}</p>
        <button onClick={onBack} className="text-sm underline underline-offset-4 text-slate hover:text-redline">
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="text-sm text-slate hover:text-redline underline underline-offset-4 shrink-0">
            Back
          </button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-display text-lg text-ink bg-transparent border-b border-transparent
              hover:border-line focus:border-redline focus:outline-none px-1 min-w-0"
          />
        </div>
        <div className="flex items-center gap-4 text-xs uppercase tracking-widest shrink-0">
          <span className="text-slate">
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : ''}
          </span>
          <button
            onClick={downloadPdf}
            disabled={downloading}
            className="text-redline hover:underline disabled:opacity-50 disabled:cursor-wait"
          >
            {downloading ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Template selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-line">
        {TEMPLATE_LIST.map((t) => (
          <button
            key={t.key}
            disabled={!t.available}
            onClick={() => setTemplate(t.key)}
            title={t.available ? t.description : `${t.description} (coming soon)`}
            className={`shrink-0 text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${
              !t.available
                ? 'border-line text-slate/40 cursor-not-allowed'
                : template === t.key
                  ? 'border-redline bg-redline text-manuscript'
                  : 'border-line text-slate hover:text-redline hover:border-redline/40'
            }`}
          >
            {t.label}
            {!t.available && ' · Soon'}
          </button>
        ))}
      </div>

      {/* Desktop: sidebar + form + live preview, all visible at once */}
      <div className="hidden lg:grid lg:grid-cols-[180px_1fr_380px] gap-6 items-start">
        <div className="flex flex-col gap-1">
          {navSections.map((key) => {
            const isReorderable = sectionOrder.includes(key)
            return (
              <div key={key} className="flex items-center gap-1">
                <button
                  onClick={() => setActiveKey(key)}
                  className={`text-left text-xs uppercase tracking-widest px-2 py-1.5 rounded-sm flex-1 whitespace-nowrap ${
                    activeKey === key ? 'bg-ink text-manuscript' : 'text-slate hover:text-redline'
                  }`}
                >
                  {SECTION_TITLES[key] || (key === 'personalInfo' ? 'Personal Info' : 'Custom Sections')}
                </button>
                {isReorderable && activeKey === key && (
                  <span className="flex flex-col text-[10px] text-slate">
                    <button onClick={() => moveSection(key, -1)} className="hover:text-redline leading-none">
                      ▲
                    </button>
                    <button onClick={() => moveSection(key, 1)} className="hover:text-redline leading-none">
                      ▼
                    </button>
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <div>
          <SectionForm activeKey={activeKey} resumeData={resumeData} setField={setField} />
        </div>

        <div className="sticky top-24">
          <ResumeRenderer template={template} resumeData={resumeData} sectionOrder={sectionOrder} />
          <AtsPanel resumeId={resumeId} refreshSignal={saveCount} />
        </div>
      </div>

      {/* Mobile: clean step-based editor — one section at a time, with a Preview toggle */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-widest text-slate">
            {showPreview
              ? 'Preview'
              : `Step ${stepIndex + 1} of ${navSections.length} · ${
                  SECTION_TITLES[activeKey] || (activeKey === 'personalInfo' ? 'Personal Info' : 'Custom Sections')
                }`}
          </p>
          <button onClick={() => setShowPreview((v) => !v)} className="text-xs uppercase tracking-widest text-redline hover:underline">
            {showPreview ? 'Back to editing' : 'Preview'}
          </button>
        </div>

        {!showPreview && (
          <div className="h-1 bg-line/60 rounded-full overflow-hidden mb-5">
            <div
              className="h-full bg-redline rounded-full transition-all"
              style={{ width: `${((stepIndex + 1) / navSections.length) * 100}%` }}
            />
          </div>
        )}

        {showPreview ? (
          <>
            <ResumeRenderer template={template} resumeData={resumeData} sectionOrder={sectionOrder} />
            <AtsPanel resumeId={resumeId} refreshSignal={saveCount} />
          </>
        ) : (
          <>
            <SectionForm activeKey={activeKey} resumeData={resumeData} setField={setField} />

            <div className="flex items-center justify-between mt-8 pt-4 border-t border-line">
              <button
                onClick={() => goStep(-1)}
                disabled={stepIndex <= 0}
                className="text-xs uppercase tracking-widest text-slate disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Back
              </button>
              {sectionOrder.includes(activeKey) && (
                <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-slate">
                  <button onClick={() => moveSection(activeKey, -1)} className="hover:text-redline">
                    Move up
                  </button>
                  <button onClick={() => moveSection(activeKey, 1)} className="hover:text-redline">
                    Move down
                  </button>
                </div>
              )}
              <button
                onClick={() => goStep(1)}
                disabled={stepIndex >= navSections.length - 1}
                className="text-xs uppercase tracking-widest text-ink disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
