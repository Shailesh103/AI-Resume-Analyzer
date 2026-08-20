import { ContactLine, ProjectLinks } from './linkUtils'

const SECTION_TITLES = {
  summary: 'Executive Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Core Competencies',
  projects: 'Selected Projects',
  certifications: 'Certifications',
  achievements: 'Achievements',
  languages: 'Languages',
}

function Heading({ children }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/70 mt-7 mb-3 first:mt-0">
      {children}
    </h3>
  )
}

function renderSection(key, data) {
  switch (key) {
    case 'summary':
      return data.summary ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.summary}</Heading>
          <p className="text-[13.5px] text-black/85 leading-[1.7]">{data.summary}</p>
        </div>
      ) : null

    case 'experience':
      return data.experience.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.experience}</Heading>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-5 last:mb-0">
              <div className="flex justify-between items-baseline gap-3">
                <p className="text-[14px] font-semibold text-black tracking-tight">
                  {exp.position || 'Position'}
                  {exp.company && <span className="font-normal text-black/70"> · {exp.company}</span>}
                </p>
                <p className="text-[10.5px] uppercase tracking-widest text-black/50 whitespace-nowrap shrink-0">
                  {exp.startDate} {(exp.startDate || exp.endDate) && '—'} {exp.endDate}
                </p>
              </div>
              {exp.location && <p className="text-[11px] text-black/50">{exp.location}</p>}
              {exp.description && <p className="text-[12.5px] text-black/80 mt-1.5">{exp.description}</p>}
              {exp.bulletPoints.filter(Boolean).length > 0 && (
                <ul className="list-disc list-outside ml-4 text-[12.5px] text-black/85 mt-1.5 space-y-1">
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
          <Heading>{SECTION_TITLES.education}</Heading>
          {data.education.map((edu, i) => (
            <div key={i} className="flex justify-between items-baseline gap-3 mb-2 last:mb-0">
              <p className="text-[13px] text-black">
                <span className="font-semibold">
                  {edu.degree}
                  {edu.field && ` in ${edu.field}`}
                </span>
                {edu.institution && <span className="text-black/70"> · {edu.institution}</span>}
              </p>
              <p className="text-[10.5px] uppercase tracking-widest text-black/50 whitespace-nowrap shrink-0">
                {edu.endDate}
              </p>
            </div>
          ))}
        </div>
      ) : null

    case 'skills':
      return data.skills.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.skills}</Heading>
          {data.skills.map((group, i) => (
            <p key={i} className="text-[12.5px] text-black/85 mb-1.5 last:mb-0">
              {group.category && <span className="font-semibold text-black">{group.category} — </span>}
              {group.skills.filter(Boolean).join(' · ')}
            </p>
          ))}
        </div>
      ) : null

    case 'projects':
      return data.projects.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.projects}</Heading>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <p className="text-[13px] font-semibold text-black">
                {proj.name}
                <ProjectLinks proj={proj} className="text-[11px] font-normal text-black/60 underline decoration-1 underline-offset-2 hover:text-redline" />
              </p>
              {proj.description && <p className="text-[12.5px] text-black/80">{proj.description}</p>}
              {proj.bulletPoints.filter(Boolean).length > 0 && (
                <ul className="list-disc list-outside ml-4 text-[12.5px] text-black/85 mt-1 space-y-0.5">
                  {proj.bulletPoints.filter(Boolean).map((b, bi) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : null

    case 'certifications':
      return data.certifications.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.certifications}</Heading>
          {data.certifications.map((c, i) => (
            <p key={i} className="text-[12.5px] text-black/85 mb-1 last:mb-0">
              <span className="font-semibold text-black">{c.name}</span>
              {c.issuer && ` · ${c.issuer}`}
              {c.date && <span className="text-black/50"> ({c.date})</span>}
            </p>
          ))}
        </div>
      ) : null

    case 'achievements':
      return data.achievements.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.achievements}</Heading>
          {data.achievements.map((a, i) => (
            <p key={i} className="text-[12.5px] text-black/85 mb-1 last:mb-0">
              <span className="font-semibold text-black">{a.title}</span>
              {a.description && ` — ${a.description}`}
            </p>
          ))}
        </div>
      ) : null

    case 'languages':
      return data.languages.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.languages}</Heading>
          <p className="text-[12.5px] text-black/85">
            {data.languages
              .filter((l) => l.language)
              .map((l) => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ''}`)
              .join(' · ')}
          </p>
        </div>
      ) : null

    default:
      return null
  }
}

export default function ExecutiveTemplate({ resumeData, sectionOrder }) {
  const pi = resumeData.personalInfo

  return (
    <div className="bg-white text-black font-body" style={{ minHeight: '297mm' }}>
      <div className="px-12 py-12 sm:px-16 sm:py-14">
        <h1 className="text-[32px] font-display font-semibold tracking-tight text-black text-center">
          {pi.fullName || 'Your Name'}
        </h1>
        {pi.professionalTitle && (
          <p className="text-[13px] uppercase tracking-[0.3em] text-black/60 text-center mt-2">
            {pi.professionalTitle}
          </p>
        )}
        <div className="w-16 h-px bg-black/40 mx-auto mt-4" />
        <ContactLine
          pi={pi}
          className="text-[11px] text-black/50 text-center mt-4"
          linkClassName="text-black/50 underline decoration-1 underline-offset-2 hover:text-redline"
          sep="   ·   "
        />

        {sectionOrder.map((key) => renderSection(key, resumeData))}

        {resumeData.customSections.map((sec, i) =>
          sec.title || sec.content ? (
            <div key={`custom-${i}`}>
              <Heading>{sec.title || 'Custom Section'}</Heading>
              <p className="text-[12.5px] text-black/85 whitespace-pre-line">{sec.content}</p>
            </div>
          ) : null
        )}
      </div>
    </div>
  )
}
