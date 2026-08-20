import { ContactLine, ProjectLinks } from './linkUtils'

const SECTION_TITLES = {
  summary: 'Summary',
  experience: 'Professional Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  achievements: 'Achievements',
  languages: 'Languages',
}

function Heading({ children }) {
  return (
    <h3 className="text-[12px] font-bold uppercase tracking-widest text-black mt-5 mb-2 first:mt-0 pb-1.5 border-b-2 border-black">
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
          <p className="text-[13px] text-black/85 leading-relaxed">{data.summary}</p>
        </div>
      ) : null

    case 'experience':
      return data.experience.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.experience}</Heading>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-3.5 last:mb-0">
              <div className="flex justify-between items-baseline gap-3">
                <p className="text-[13.5px] font-bold text-black">{exp.position || 'Position'}</p>
                <p className="text-[11px] font-semibold text-black/70 whitespace-nowrap shrink-0">
                  {exp.startDate} {(exp.startDate || exp.endDate) && '–'} {exp.endDate}
                </p>
              </div>
              <p className="text-[12px] italic text-black/70">
                {exp.company}
                {exp.location && `, ${exp.location}`}
              </p>
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
          <Heading>{SECTION_TITLES.education}</Heading>
          {data.education.map((edu, i) => (
            <div key={i} className="flex justify-between items-baseline gap-3 mb-1.5 last:mb-0">
              <p className="text-[13px] text-black">
                <span className="font-bold">{edu.institution}</span>
                {edu.degree && ` — ${edu.degree}${edu.field ? `, ${edu.field}` : ''}`}
                {edu.grade && <span className="text-black/60"> ({edu.grade})</span>}
              </p>
              <p className="text-[11px] font-semibold text-black/70 whitespace-nowrap shrink-0">{edu.endDate}</p>
            </div>
          ))}
        </div>
      ) : null

    case 'skills':
      return data.skills.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.skills}</Heading>
          {data.skills.map((group, i) => (
            <p key={i} className="text-[12px] text-black/85 mb-1 last:mb-0">
              {group.category && <span className="font-bold text-black">{group.category}: </span>}
              {group.skills.filter(Boolean).join(', ')}
            </p>
          ))}
        </div>
      ) : null

    case 'projects':
      return data.projects.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.projects}</Heading>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-2.5 last:mb-0">
              <p className="text-[13px] font-bold text-black">
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
          <Heading>{SECTION_TITLES.certifications}</Heading>
          {data.certifications.map((c, i) => (
            <p key={i} className="text-[12px] text-black/85 mb-1 last:mb-0">
              <span className="font-bold text-black">{c.name}</span>
              {c.issuer && ` — ${c.issuer}`}
              {c.date && <span className="text-black/60"> ({c.date})</span>}
            </p>
          ))}
        </div>
      ) : null

    case 'achievements':
      return data.achievements.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.achievements}</Heading>
          {data.achievements.map((a, i) => (
            <p key={i} className="text-[12px] text-black/85 mb-1 last:mb-0">
              <span className="font-bold text-black">{a.title}</span>
              {a.description && ` — ${a.description}`}
            </p>
          ))}
        </div>
      ) : null

    case 'languages':
      return data.languages.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.languages}</Heading>
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

export default function ProfessionalTemplate({ resumeData, sectionOrder }) {
  const pi = resumeData.personalInfo

  return (
    <div className="bg-white text-black font-body" style={{ minHeight: '297mm' }}>
      <div className="px-10 py-10 sm:px-14 sm:py-12">
        <div className="text-center border-b-2 border-black pb-4 mb-1">
          <h1 className="text-[28px] font-bold uppercase tracking-wide text-black">{pi.fullName || 'Your Name'}</h1>
          {pi.professionalTitle && (
            <p className="text-[13px] font-semibold text-black/70 mt-1">{pi.professionalTitle}</p>
          )}
          <ContactLine
            pi={pi}
            className="text-[11px] text-black/60 mt-2"
            linkClassName="text-black/60 underline decoration-1 underline-offset-2 hover:text-redline"
            sep="  |  "
          />
        </div>

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
  )
}
