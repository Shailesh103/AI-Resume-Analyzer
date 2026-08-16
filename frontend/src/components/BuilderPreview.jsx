export const SECTION_TITLES = {
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  achievements: 'Achievements',
  languages: 'Languages',
}

function PreviewHeading({ children }) {
  return (
    <h3 className="text-[11px] uppercase tracking-widest text-ink border-b border-line pb-1 mb-2 mt-4 first:mt-0">
      {children}
    </h3>
  )
}

function renderSection(key, data) {
  switch (key) {
    case 'summary':
      return data.summary ? (
        <div key={key}>
          <PreviewHeading>Summary</PreviewHeading>
          <p className="text-xs text-ink/80 leading-relaxed">{data.summary}</p>
        </div>
      ) : null

    case 'experience':
      return data.experience.length > 0 ? (
        <div key={key}>
          <PreviewHeading>Experience</PreviewHeading>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between text-xs font-medium text-ink">
                <span>
                  {exp.position || 'Position'} {exp.company && `— ${exp.company}`}
                </span>
                <span className="text-slate shrink-0">
                  {exp.startDate} {(exp.startDate || exp.endDate) && '–'} {exp.endDate}
                </span>
              </div>
              {exp.location && <p className="text-[11px] text-slate">{exp.location}</p>}
              {exp.bulletPoints.filter(Boolean).length > 0 && (
                <ul className="list-disc list-inside text-xs text-ink/80 mt-1 space-y-0.5">
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
          <PreviewHeading>Education</PreviewHeading>
          {data.education.map((edu, i) => (
            <div key={i} className="flex justify-between text-xs mb-1.5">
              <span className="text-ink">
                {edu.degree} {edu.field && `in ${edu.field}`} {edu.institution && `— ${edu.institution}`}
              </span>
              <span className="text-slate shrink-0">{edu.endDate}</span>
            </div>
          ))}
        </div>
      ) : null

    case 'skills':
      return data.skills.length > 0 ? (
        <div key={key}>
          <PreviewHeading>Skills</PreviewHeading>
          {data.skills.map((group, i) => (
            <p key={i} className="text-xs text-ink/80 mb-1">
              {group.category && <span className="font-medium text-ink">{group.category}: </span>}
              {group.skills.filter(Boolean).join(', ')}
            </p>
          ))}
        </div>
      ) : null

    case 'projects':
      return data.projects.length > 0 ? (
        <div key={key}>
          <PreviewHeading>Projects</PreviewHeading>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <p className="text-xs font-medium text-ink">{proj.name}</p>
              {proj.description && <p className="text-xs text-ink/80">{proj.description}</p>}
              {proj.technologies.filter(Boolean).length > 0 && (
                <p className="text-[11px] text-slate">{proj.technologies.filter(Boolean).join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      ) : null

    case 'certifications':
      return data.certifications.length > 0 ? (
        <div key={key}>
          <PreviewHeading>Certifications</PreviewHeading>
          {data.certifications.map((c, i) => (
            <p key={i} className="text-xs text-ink/80 mb-1">
              {c.name} {c.issuer && `— ${c.issuer}`} {c.date && `(${c.date})`}
            </p>
          ))}
        </div>
      ) : null

    case 'achievements':
      return data.achievements.length > 0 ? (
        <div key={key}>
          <PreviewHeading>Achievements</PreviewHeading>
          {data.achievements.map((a, i) => (
            <p key={i} className="text-xs text-ink/80 mb-1">
              <span className="font-medium text-ink">{a.title}</span> {a.description && `— ${a.description}`}
            </p>
          ))}
        </div>
      ) : null

    case 'languages':
      return data.languages.length > 0 ? (
        <div key={key}>
          <PreviewHeading>Languages</PreviewHeading>
          <p className="text-xs text-ink/80">
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

export default function BuilderPreview({ resumeData, sectionOrder }) {
  const pi = resumeData.personalInfo
  const contactLine = [pi.email, pi.phone, pi.location, pi.website, pi.linkedin, pi.github]
    .filter(Boolean)
    .join('  ·  ')

  return (
    <div className="bg-manuscript border border-line rounded-sm p-6 shadow-sm">
      <h2 className="font-display text-xl text-ink text-center">{pi.fullName || 'Your Name'}</h2>
      {pi.professionalTitle && <p className="text-xs text-slate text-center mt-0.5">{pi.professionalTitle}</p>}
      {contactLine && <p className="text-[11px] text-slate text-center mt-1">{contactLine}</p>}

      {sectionOrder.map((key) => renderSection(key, resumeData))}

      {resumeData.customSections.map((sec, i) =>
        sec.title || sec.content ? (
          <div key={`custom-${i}`}>
            <PreviewHeading>{sec.title || 'Custom Section'}</PreviewHeading>
            <p className="text-xs text-ink/80 whitespace-pre-line">{sec.content}</p>
          </div>
        ) : null
      )}
    </div>
  )
}
