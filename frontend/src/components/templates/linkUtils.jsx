/** Shared link helpers for all resume templates — used for both the header
 * contact line and project links, so a raw URL never gets dumped into the
 * resume as unbroken text (that's what was causing PDF misalignment: a long
 * space-less URL can't wrap, so it just overflows its column). Short,
 * clickable labels fix both the look and the wrapping. */

export function ensureHref(url) {
  if (!url) return null
  return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`
}

/** Renders email/phone/location as plain text and website/linkedin/github as
 * short clickable labels ("Portfolio", "LinkedIn", "GitHub"), separated by sep. */
export function ContactLine({ pi, className, linkClassName = 'underline decoration-1 underline-offset-2', sep = '   |   ' }) {
  const parts = []
  if (pi.email) {
    parts.push(
      <a key="email" href={`mailto:${pi.email}`} className={linkClassName}>
        {pi.email}
      </a>
    )
  }
  if (pi.phone) parts.push(<span key="phone">{pi.phone}</span>)
  if (pi.location) parts.push(<span key="location">{pi.location}</span>)
  if (pi.website) {
    parts.push(
      <a key="website" href={ensureHref(pi.website)} target="_blank" rel="noopener noreferrer" className={linkClassName}>
        Portfolio
      </a>
    )
  }
  if (pi.linkedin) {
    parts.push(
      <a key="linkedin" href={ensureHref(pi.linkedin)} target="_blank" rel="noopener noreferrer" className={linkClassName}>
        LinkedIn
      </a>
    )
  }
  if (pi.github) {
    parts.push(
      <a key="github" href={ensureHref(pi.github)} target="_blank" rel="noopener noreferrer" className={linkClassName}>
        GitHub
      </a>
    )
  }
  if (parts.length === 0) return null

  return (
    <p className={className}>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && sep}
        </span>
      ))}
    </p>
  )
}

/** Renders a project's liveUrl/githubUrl as short clickable "Live" / "GitHub" labels. */
export function ProjectLinks({ proj, className, prefix = '  —  ' }) {
  const links = []
  if (proj.liveUrl) {
    links.push(
      <a key="live" href={ensureHref(proj.liveUrl)} target="_blank" rel="noopener noreferrer" className={className}>
        Live
      </a>
    )
  }
  if (proj.githubUrl) {
    links.push(
      <a key="gh" href={ensureHref(proj.githubUrl)} target="_blank" rel="noopener noreferrer" className={className}>
        GitHub
      </a>
    )
  }
  if (links.length === 0) return null

  return (
    <span>
      {prefix}
      {links.map((l, i) => (
        <span key={i}>
          {l}
          {i < links.length - 1 && '  ·  '}
        </span>
      ))}
    </span>
  )
}
