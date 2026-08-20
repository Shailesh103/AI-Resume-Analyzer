import { ensureHref, ProjectLinks } from './linkUtils'

const SECTION_TITLES = {
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Technical Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  achievements: 'Achievements',
  languages: 'Languages',
}

function Heading({ children }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-widest text-black mt-5 mb-2 first:mt-0 flex items-center gap-2">
      <span className="text-black/30">#</span>
      {children}
    </h3>
  )
}

function Tag({ children }) {
  return (
    <span className="inline-block text-[11px] font-mono bg-black/5 border border-black/10 rounded px-1.5 py-0.5 mr-1.5 mb-1.5 text-black/80">
      {children}
    </span>
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
                <p className="text-[13px] font-semibold text-black font-mono">
                  {exp.position || 'Position'}
                  {exp.company && <span className="font-sans font-normal text-black/70"> @ {exp.company}</span>}
                </p>
                <p className="text-[11px] text-black/50 whitespace-nowrap shrink-0 font-mono">
                  {exp.startDate} {(exp.startDate || exp.endDate) && '→'} {exp.endDate}
                </p>
              </div>
              {exp.location && <p className="text-[11px] text-black/50">{exp.location}</p>}
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
                <span className="font-semibold">
                  {edu.degree}
                  {edu.field && ` in ${edu.field}`}
                </span>
                {edu.institution && ` — ${edu.institution}`}
                {edu.grade && <span className="text-black/60"> · {edu.grade}</span>}
              </p>
              <p className="text-[11px] text-black/50 whitespace-nowrap shrink-0 font-mono">{edu.endDate}</p>
            </div>
          ))}
        </div>
      ) : null

    case 'skills':
      return data.skills.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.skills}</Heading>
          {data.skills.map((group, i) => (
            <div key={i} className="mb-2 last:mb-0">
              {group.category && <p className="text-[11px] font-semibold text-black/70 mb-1">{group.category}</p>}
              <div className="flex flex-wrap">
                {group.skills.filter(Boolean).map((s, si) => (
                  <Tag key={si}>{s}</Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null

    case 'projects':
      return data.projects.length > 0 ? (
        <div key={key}>
          <Heading>{SECTION_TITLES.projects}</Heading>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <p className="text-[13px] font-semibold text-black font-mono">
                {proj.name}
                <ProjectLinks proj={proj} className="text-[11px] font-sans font-normal text-black/50 underline decoration-1 underline-offset-2 hover:text-redline" />
              </p>
              {proj.description && <p className="text-[12px] text-black/80 mt-0.5">{proj.description}</p>}
              {proj.bulletPoints.filter(Boolean).length > 0 && (
                <ul className="list-disc list-outside ml-4 text-[12px] text-black/85 mt-1 space-y-0.5">
                  {proj.bulletPoints.filter(Boolean).map((b, bi) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              )}
              {proj.technologies.filter(Boolean).length > 0 && (
                <div className="flex flex-wrap mt-1.5">
                  {proj.technologies.filter(Boolean).map((t, ti) => (
                    <Tag key={ti}>{t}</Tag>
                  ))}
                </div>
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
              <span className="font-semibold text-black">{c.name}</span>
              {c.issuer && ` — ${c.issuer}`}
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

export default function DeveloperTemplate({ resumeData, sectionOrder }) {
  const pi = resumeData.personalInfo
  const linkFields = [
    pi.website && { href: ensureHref(pi.website), label: 'Portfolio' },
    pi.linkedin && { href: ensureHref(pi.linkedin), label: 'LinkedIn' },
    pi.github && { href: ensureHref(pi.github), label: 'GitHub' },
  ].filter(Boolean)
  const contactLine = [pi.email, pi.phone, pi.location].filter(Boolean).join('  ·  ')

  return (
    <div className="bg-white text-black font-body" style={{ minHeight: '297mm' }}>
      <div className="px-10 py-10 sm:px-14 sm:py-12">
        <h1 className="text-[26px] font-bold font-mono tracking-tight text-black">{pi.fullName || 'Your Name'}</h1>
        {pi.professionalTitle && <p className="text-[13px] text-black/70 mt-0.5">{pi.professionalTitle}</p>}
        {contactLine && <p className="text-[11px] text-black/50 mt-2">{contactLine}</p>}
        {linkFields.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {linkFields.map((l, i) => (
              <a
                key={i}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono bg-black/5 border border-black/10 rounded px-1.5 py-0.5 text-black/80 hover:text-redline hover:border-redline/40"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}

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
