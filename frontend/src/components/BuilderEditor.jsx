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
import BuilderPreview, { SECTION_TITLES } from './BuilderPreview'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Sections always shown first, in this fixed order, not part of the reorderable list.
const FIXED_LEADING_SECTIONS = ['personalInfo', 'summary']

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
  const [resumeData, setResumeData] = useState(null)
  const [sectionOrder, setSectionOrder] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved
  const [showPreview, setShowPreview] = useState(false) // mobile toggle
  const [activeKey, setActiveKey] = useState('personalInfo')

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
    async (nextTitle, nextData, nextOrder) => {
      setSaveStatus('saving')
      try {
        await fetch(`${API_URL}/resumes/${resumeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: nextTitle, resume_data: nextData, section_order: nextOrder }),
        })
        setSaveStatus('saved')
      } catch {
        setSaveStatus('idle')
      }
    },
    [resumeId, token]
  )

  // Debounced autosave whenever title/resumeData/sectionOrder change.
  useEffect(() => {
    if (loading || !resumeData) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      doSave(title, resumeData, sectionOrder)
    }, 1000)
    return () => clearTimeout(saveTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, resumeData, sectionOrder])

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

  const navSections = [...FIXED_LEADING_SECTIONS, ...sectionOrder, 'customSections']

  return (
    <div className="max-w-6xl mx-auto">
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
          <button onClick={() => setShowPreview((v) => !v)} className="text-redline hover:underline lg:hidden">
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button disabled className="text-slate/50 cursor-not-allowed" title="Coming in Phase 6">
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[180px_1fr_380px] gap-6 items-start">
        {/* Sidebar */}
        <div className={`${showPreview ? 'hidden' : 'flex'} lg:flex flex-col gap-1 overflow-x-auto lg:overflow-visible`}>
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
                  <span className="hidden lg:flex flex-col text-[10px] text-slate">
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

        {/* Form */}
        <div className={showPreview ? 'hidden lg:block' : 'block'}>
          <SectionForm activeKey={activeKey} resumeData={resumeData} setField={setField} />
        </div>

        {/* Live preview */}
        <div className={showPreview ? 'block' : 'hidden lg:block'}>
          <div className="lg:sticky lg:top-24">
            <BuilderPreview resumeData={resumeData} sectionOrder={sectionOrder} />
          </div>
        </div>
      </div>
    </div>
  )
}
