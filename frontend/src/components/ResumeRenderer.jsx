import { TEMPLATES } from './templates/index'

/**
 * <ResumeRenderer template="modern" resumeData={resumeData} sectionOrder={sectionOrder} />
 *
 * Falls back to the Modern ATS template if the requested one isn't built yet
 * (or is invalid), so the preview never breaks while more templates are added
 * in Phase 4.
 */
export default function ResumeRenderer({ template, resumeData, sectionOrder, styling }) {
  const meta = TEMPLATES[template]
  const Template = meta && meta.available ? meta.component : TEMPLATES.modern.component

  return (
    <div className="shadow-[0_20px_50px_-20px_rgba(23,21,34,0.35)] border border-line">
      <Template resumeData={resumeData} sectionOrder={sectionOrder} styling={styling || {}} />
    </div>
  )
}
