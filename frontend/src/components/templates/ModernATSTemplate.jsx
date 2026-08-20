import { ContactLine, ProjectLinks } from './linkUtils'

const SECTION_TITLES = {
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  achievements: 'Achievements',
  languages: 'Languages',
}

function Heading({ children }) {
  return (
    <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black border-b border-black/60 pb-1 mb-2 mt-5 first:mt-0">
      {children}
    </h3>
  )
}

function renderSection(key, data) {
  switch (key) {
    case 'summary':
      return data.summary ? (
        <div key={key}>
          <Heading>Summary</Heading>
          <p className="text-[13px] text-black/85 leading-relaxed">{data.summary}</p>
        </div>
      ) : null

    case 'experience':
      return data.experience.length > 0 ? (
        <div key={key}>
          <Heading>Experience</Heading>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="flex justify-between items-baseline gap-3">
                <p className="text-[13px] font-semibold text-black">
                  {exp.position || 'Position'}
                  {exp.company && <span className="font-normal"> — {exp.company}</span>}
                </p>
                <p className="text-[11px] text-black/60 whitespace-nowrap shrink-0">
                  {exp.startDate} {(exp.startDate || exp.endDate) && '–'} {exp.endDate}
                </p>
              </div>
              {exp.location && <p className="text-[11px] text-black/60">{exp.location}</p>}
              {exp.description && <p className="text-[12px] text-black/80 mt-1">{exp.description}</p>}
              {exp.bulletPoints.filter(Boolean).length > 0 && (
                <ul className="list-disc list-outside ml-4 text-[12px] text-black/85 mt-1 space-y-0.5">
                  {exp.bulletPoints.filter(Boolean).map((b, bi) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : null

    case 'education':
      return data.education.length > 0 ? (
        <div key={key}>
          <Heading>Education</Heading>
          {data.education.map((edu, i) => (
            <div key={i} className="flex justify-between items-baseline gap-3 mb-1.5 last:mb-0">
              <p className="text-[13px] text-black">
                <span className="font-semibold">
                  {edu.degree}
                  {edu.field && ` in ${edu.field}`}
                </span>
                {edu.institution && ` — ${edu.institution}`}
                {edu.grade && <span className="text-black/60"> · {edu.grade}</span>}
              </p>
              <p className="text-[11px] text-black/60 whitespace-nowrap shrink-0">{edu.endDate}</p>
            </div>
          ))}
        </div>
      ) : null

    case 'skills':
      return data.skills.length > 0 ? (
        <div key={key}>
          <Heading>Skills</Heading>
          {data.skills.map((group, i) => (
            <p key={i} className="text-[12px] text-black/85 mb-1 last:mb-0">
              {group.category && <span className="font-semibold text-black">{group.category}: </span>}
              {group.skills.filter(Boolean).join(', ')}
            </p>
          ))}
        </div>
      ) : null

    case 'projects':
      return data.projects.length > 0 ? (
        <div key={key}>
          <Heading>Projects</Heading>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-2.5 last:mb-0">
              <p className="text-[13px] font-semibold text-black">
                {proj.name}
                <ProjectLinks proj={proj} className="text-[11px] font-normal text-black/60 underline decoration-1 underline-offset-2 hover:text-redline" />
              </p>
              {proj.description && <p className="text-[12px] text-black/80">{proj.description}</p>}
              {proj.bulletPoints.filter(Boolean).length > 0 && (
                <ul className="list-disc list-outside ml-4 text-[12px] text-black/85 mt-1 space-y-0.5">
                  {proj.bulletPoints.filter(Boolean).map((b, bi) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              )}
              {proj.technologies.filter(Boolean).length > 0 && (
                <p className="text-[11px] text-black/60 mt-0.5">{proj.technologies.filter(Boolean).join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      ) : null

    case 'certifications':
      return data.certifications.length > 0 ? (
        <div key={key}>
          <Heading>Certifications</Heading>
          {data.certifications.map((c, i) => (
            <p key={i} className="text-[12px] text-black/85 mb-1 last:mb-0">
              <span className="font-semibold text-black">{c.name}</span>
              {c.issuer && ` — ${c.issuer}`}
              {c.date && <span className="text-black/60"> ({c.date})</span>}
            </p>
          ))}
        </div>
      ) : null

    case 'achievements':
      return data.achievements.length > 0 ? (
        <div key={key}>
          <Heading>Achievements</Heading>
          {data.achievements.map((a, i) => (
            <p key={i} className="text-[12px] text-black/85 mb-1 last:mb-0">
              <span className="font-semibold text-black">{a.title}</span>
              {a.description && ` — ${a.description}`}
            </p>
          ))}
        </div>
      ) : null

    case 'languages':
      return data.languages.length > 0 ? (
        <div key={key}>
          <Heading>Languages</Heading>
          <p className="text-[12px] text-black/85">
            {data.languages
              .filter((l) => l.language)
              .map((l) => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ''}`)
              .join(', ')}
          </p>
        </div>
      ) : null

    default:
      return null
  }
}

/**
 * Modern ATS template — clean single-column layout, no graphics/columns/icons,
 * so applicant-tracking systems parse it cleanly. Presentation only: it never
 * modifies resumeData, so switching templates never changes the user's content.
 */
export default function ModernATSTemplate({ resumeData, sectionOrder }) {
  const pi = resumeData.personalInfo

  return (
    <div className="bg-white text-black font-body" style={{ minHeight: '297mm' }}>
      <div className="px-10 py-10 sm:px-14 sm:py-12">
        <h1 className="text-[26px] font-semibold tracking-tight text-black">{pi.fullName || 'Your Name'}</h1>
        {pi.professionalTitle && <p className="text-[14px] text-black/70 mt-0.5">{pi.professionalTitle}</p>}
        <ContactLine
          pi={pi}
          className="text-[11px] text-black/60 mt-2"
          linkClassName="text-black/60 underline decoration-1 underline-offset-2 hover:text-redline"
        />

        <div className="mt-1">
          {sectionOrder.map((key) => renderSection(key, resumeData))}

          {resumeData.customSections.map((sec, i) =>
            sec.title || sec.content ? (
              <div key={`custom-${i}`}>
                <Heading>{sec.title || 'Custom Section'}</Heading>
                <p className="text-[12px] text-black/85 whitespace-pre-line">{sec.content}</p>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}
