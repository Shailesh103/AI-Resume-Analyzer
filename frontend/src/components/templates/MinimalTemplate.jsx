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
    <h3 className="text-[10px] uppercase tracking-[0.2em] text-black/50 mt-6 mb-3 first:mt-0">{children}</h3>
  )
}

function renderSection(key, data) {
  switch (key) {
    case 'summary':
      return data.summary ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.summary}</Heading>
          <p className="text-[13px] text-black/80 leading-[1.75] font-light">{data.summary}</p>
        </div>
      ) : null

    case 'experience':
      return data.experience.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.experience}</Heading>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-5 last:mb-0">
              <div className="flex justify-between items-baseline gap-3">
                <p className="text-[13.5px] text-black font-normal">
                  {exp.position || 'Position'}
                  {exp.company && <span className="text-black/60"> — {exp.company}</span>}
                </p>
                <p className="text-[11px] text-black/40 whitespace-nowrap shrink-0">
                  {exp.startDate} {(exp.startDate || exp.endDate) && '–'} {exp.endDate}
                </p>
              </div>
              {exp.location && <p className="text-[11px] text-black/40">{exp.location}</p>}
              {exp.description && <p className="text-[12.5px] text-black/70 font-light mt-1.5">{exp.description}</p>}
              {exp.bulletPoints.filter(Boolean).length > 0 && (
                <ul className="list-none text-[12.5px] text-black/75 font-light mt-1.5 space-y-1">
                  {exp.bulletPoints.filter(Boolean).map((b, bi) => (
                    <li key={bi} className="pl-3 border-l border-black/10">
                      {b}
                    </li>
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
              <p className="text-[13px] text-black/85">
                {edu.degree}
                {edu.field && ` in ${edu.field}`}
                {edu.institution && <span className="text-black/50"> — {edu.institution}</span>}
              </p>
              <p className="text-[11px] text-black/40 whitespace-nowrap shrink-0">{edu.endDate}</p>
            </div>
          ))}
        </div>
      ) : null

    case 'skills':
      return data.skills.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.skills}</Heading>
          {data.skills.map((group, i) => (
            <p key={i} className="text-[12.5px] text-black/75 font-light mb-1.5 last:mb-0">
              {group.category && <span className="text-black/85">{group.category}: </span>}
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
            <div key={i} className="mb-3 last:mb-0">
              <p className="text-[13px] text-black">{proj.name}</p>
              {proj.description && <p className="text-[12.5px] text-black/70 font-light">{proj.description}</p>}
              {proj.technologies.filter(Boolean).length > 0 && (
                <p className="text-[11px] text-black/40 mt-0.5">{proj.technologies.filter(Boolean).join(', ')}</p>
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
            <p key={i} className="text-[12.5px] text-black/75 font-light mb-1 last:mb-0">
              <span className="text-black/85">{c.name}</span>
              {c.issuer && ` — ${c.issuer}`}
              {c.date && <span className="text-black/40"> ({c.date})</span>}
            </p>
          ))}
        </div>
      ) : null

    case 'achievements':
      return data.achievements.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.achievements}</Heading>
          {data.achievements.map((a, i) => (
            <p key={i} className="text-[12.5px] text-black/75 font-light mb-1 last:mb-0">
              <span className="text-black/85">{a.title}</span>
              {a.description && ` — ${a.description}`}
            </p>
          ))}
        </div>
      ) : null

    case 'languages':
      return data.languages.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.languages}</Heading>
          <p className="text-[12.5px] text-black/75 font-light">
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

export default function MinimalTemplate({ resumeData, sectionOrder }) {
  const pi = resumeData.personalInfo
  const contactLine = [pi.email, pi.phone, pi.location, pi.website, pi.linkedin, pi.github]
    .filter(Boolean)
    .join('   ')

  return (
    <div className="bg-white text-black font-body" style={{ minHeight: '297mm' }}>
      <div className="px-12 py-14 sm:px-16 sm:py-16">
        <h1 className="text-[24px] font-normal text-black">{pi.fullName || 'Your Name'}</h1>
        {pi.professionalTitle && <p className="text-[13px] text-black/50 font-light mt-1">{pi.professionalTitle}</p>}
        {contactLine && <p className="text-[11px] text-black/40 font-light mt-3">{contactLine}</p>}

        {sectionOrder.map((key) => renderSection(key, resumeData))}

        {resumeData.customSections.map((sec, i) =>
          sec.title || sec.content ? (
            <div key={`custom-${i}`}>
              <Heading>{sec.title || 'Custom Section'}</Heading>
              <p className="text-[12.5px] text-black/75 font-light whitespace-pre-line">{sec.content}</p>
            </div>
          ) : null
        )}
      </div>
    </div>
  )
}
