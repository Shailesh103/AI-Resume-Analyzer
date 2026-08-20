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
const PRO_ONLY_TEMPLATES = new Set(['professional', 'executive', 'developer'])

// Personal Info is always shown first and isn't part of the reorderable list.
// Summary lives inside sectionOrder itself (like Experience, Education, ...),
// so it must NOT also be listed here — that was causing it to render twice.
const FIXED_LEADING_SECTIONS = ['personalInfo']

function sectionLabel(key) {
  return SECTION_TITLES[key] || (key === 'personalInfo' ? 'Personal Info' : 'Custom Sections')
}

function SectionIcon({ section, className }) {
  const common = { className, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (section) {
    case 'personalInfo':
      return <svg {...common}><circle cx="10" cy="7" r="3" /><path d="M4 17c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /></svg>
    case 'summary':
      return <svg {...common}><rect x="4" y="3" width="12" height="14" rx="1.2" /><path d="M7 7.5h6M7 10.5h6M7 13.5h3.5" /></svg>
    case 'experience':
      return <svg {...common}><rect x="3" y="6.5" width="14" height="9.5" rx="1.2" /><path d="M7 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 5v1.5M3 10.5h14" /></svg>
    case 'education':
      return <svg {...common}><path d="M2.5 7 10 4l7.5 3-7.5 3-7.5-3Z" /><path d="M5.5 8.6v3.4c0 1.1 2 2 4.5 2s4.5-.9 4.5-2V8.6" /></svg>
    case 'skills':
      return <svg {...common}><path d="M10 3.5 11.6 7l3.9.5-2.8 2.7.7 3.8L10 12.2l-3.4 1.8.7-3.8-2.8-2.7L8.4 7 10 3.5Z" /></svg>
    case 'projects':
      return <svg {...common}><path d="M3 6.5a1 1 0 0 1 1-1h3.5l1.3 1.7H16a1 1 0 0 1 1 1v6.3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6.5Z" /></svg>
    case 'certifications':
      return <svg {...common}><circle cx="10" cy="8" r="4.2" /><path d="M7.5 11.5 6.5 17l3.5-1.8 3.5 1.8-1-5.5" /></svg>
    case 'achievements':
      return <svg {...common}><path d="M6 3.5h8v3a4 4 0 0 1-4 4 4 4 0 0 1-4-4v-3Z" /><path d="M6 4.5H4a1 1 0 0 0-1 1.2c.3 1.5 1.3 2.6 3 2.9M14 4.5h2a1 1 0 0 1 1 1.2c-.3 1.5-1.3 2.6-3 2.9M10 10.5v3M7.5 16.5h5l-.5-2h-4l-.5 2Z" /></svg>
    case 'languages':
      return <svg {...common}><circle cx="10" cy="10" r="7" /><path d="M3 10h14M10 3c1.8 2 2.8 4.5 2.8 7s-1 5-2.8 7c-1.8-2-2.8-4.5-2.8-7s1-5 2.8-7Z" /></svg>
    default:
      return <svg {...common}><rect x="3.5" y="3.5" width="13" height="13" rx="1.5" /><path d="M10 6.5v7M6.5 10h7" /></svg>
  }
}

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

/** One collapsed/expandable card in the accordion — FlowCV-style. */
function AccordionCard({ sectionKey, isOpen, onToggle, isReorderable, onMoveUp, onMoveDown, children }) {
  return (
    <div
      className={`bg-white/60 border rounded-lg overflow-hidden transition-colors ${
        isOpen ? 'border-redline/50' : 'border-line'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className={`shrink-0 ${isOpen ? 'text-redline' : 'text-slate'}`}>
          <SectionIcon section={sectionKey} className="w-5 h-5" />
        </span>
        <span className={`flex-1 font-display text-[15px] ${isOpen ? 'text-ink' : 'text-ink/80'}`}>
          {sectionLabel(sectionKey)}
        </span>
        {isReorderable && isOpen && (
          <span className="flex items-center gap-2 text-[10px] text-slate mr-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={onMoveUp} className="hover:text-redline px-1">▲</button>
            <button onClick={onMoveDown} className="hover:text-redline px-1">▼</button>
          </span>
        )}
        <svg
          viewBox="0 0 20 20"
          className={`w-4 h-4 text-slate shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M5.5 8 10 12.5 14.5 8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && <div className="px-4 pb-5 pt-1 border-t border-line/70">{children}</div>}
    </div>
  )
}

export default function BuilderEditor({ resumeId, onBack }) {
  const { token, isPro } = useAuth()
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
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
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
      <div className="bg-white/50 border border-line rounded-lg p-2 flex items-center gap-2 overflow-x-auto mb-2">
        {TEMPLATE_LIST.map((t) => {
          const locked = !isPro && PRO_ONLY_TEMPLATES.has(t.key)
          const disabled = !t.available || locked
          return (
            <button
              key={t.key}
              disabled={disabled}
              onClick={() => setTemplate(t.key)}
              title={
                !t.available
                  ? `${t.description} (coming soon)`
                  : locked
                    ? `${t.description} (Pro only)`
                    : t.description
              }
              className={`shrink-0 text-xs uppercase tracking-widest px-3 py-1.5 rounded-md border transition-colors ${
                disabled
                  ? 'border-transparent text-slate/40 cursor-not-allowed'
                  : template === t.key
                    ? 'border-redline bg-redline text-manuscript'
                    : 'border-transparent text-slate hover:text-redline hover:bg-white/70'
              }`}
            >
              {t.label}
              {!t.available && ' · Soon'}
              {t.available && locked && ' · Pro'}
            </button>
          )
        })}
      </div>
      {!isPro && (
        <p className="text-[11px] text-slate mb-6">
          🔒 Professional, Executive, and Developer are Pro templates — upgrade to unlock every template.
        </p>
      )}

      {/* Desktop: accordion cards + sticky live preview, FlowCV-style */}
      <div className="hidden lg:grid lg:grid-cols-[420px_1fr] gap-6 items-start">
        
        <div className="space-y-2.5">
          {navSections.map((key) => (
            <AccordionCard
              key={key}
              sectionKey={key}
              isOpen={activeKey === key}
              onToggle={() => setActiveKey(activeKey === key ? null : key)}
              isReorderable={sectionOrder.includes(key)}
              onMoveUp={() => moveSection(key, -1)}
              onMoveDown={() => moveSection(key, 1)}
            >
              <SectionForm activeKey={key} resumeData={resumeData} setField={setField} />
            </AccordionCard>
          ))}
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
            {showPreview ? 'Preview' : `Step ${stepIndex + 1} of ${navSections.length} · ${sectionLabel(activeKey)}`}
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
            <div className="bg-white/60 border border-line rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4 text-ink">
                <SectionIcon section={activeKey} className="w-5 h-5 text-redline" />
                <span className="font-display text-[15px]">{sectionLabel(activeKey)}</span>
              </div>
              <SectionForm activeKey={activeKey} resumeData={resumeData} setField={setField} />
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
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
