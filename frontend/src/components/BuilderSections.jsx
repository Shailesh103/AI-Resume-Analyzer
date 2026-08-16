import { Field, TextAreaField, CheckboxField, StringListEditor, BulletListEditor, ItemCard, useListHelpers } from './BuilderFields'
import { AiAssistButton, SUMMARY_ACTIONS, PROJECT_DESCRIPTION_ACTIONS } from './AiAssist'

export function PersonalInfoSection({ data, onChange }) {
  function set(key, value) {
    onChange({ ...data, [key]: value })
  }
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="Full name" value={data.fullName} onChange={(v) => set('fullName', v)} placeholder="Jane Doe" />
      <Field
        label="Professional title"
        value={data.professionalTitle}
        onChange={(v) => set('professionalTitle', v)}
        placeholder="Software Engineer"
      />
      <Field label="Email" value={data.email} onChange={(v) => set('email', v)} placeholder="jane@email.com" />
      <Field label="Phone" value={data.phone} onChange={(v) => set('phone', v)} placeholder="+91 98765 43210" />
      <Field label="Location" value={data.location} onChange={(v) => set('location', v)} placeholder="Gorakhpur, India" />
      <Field label="Website" value={data.website} onChange={(v) => set('website', v)} placeholder="janedoe.dev" />
      <Field label="LinkedIn" value={data.linkedin} onChange={(v) => set('linkedin', v)} placeholder="linkedin.com/in/janedoe" />
      <Field label="GitHub" value={data.github} onChange={(v) => set('github', v)} placeholder="github.com/janedoe" />
    </div>
  )
}

export function SummarySection({ value, onChange }) {
  return (
    <div>
      <TextAreaField
        value={value}
        onChange={onChange}
        rows={4}
        placeholder="A 2-3 sentence pitch — who you are, your strongest skills, and what you're looking for."
      />
      <AiAssistButton text={value} actions={SUMMARY_ACTIONS} onAccept={onChange} />
    </div>
  )
}

const BLANK_EXPERIENCE = {
  company: '',
  position: '',
  location: '',
  startDate: '',
  endDate: '',
  currentlyWorking: false,
  description: '',
  bulletPoints: [],
}

export function ExperienceSection({ items, onChange }) {
  const { updateItem, removeItem, addItem, moveItem } = useListHelpers(items, onChange)
  return (
    <div>
      {items.map((exp, i) => (
        <ItemCard
          key={i}
          title={exp.position || exp.company || `Experience ${i + 1}`}
          onRemove={() => removeItem(i)}
          onMoveUp={i > 0 ? () => moveItem(i, -1) : null}
          onMoveDown={i < items.length - 1 ? () => moveItem(i, 1) : null}
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Position" value={exp.position} onChange={(v) => updateItem(i, { position: v })} />
            <Field label="Company" value={exp.company} onChange={(v) => updateItem(i, { company: v })} />
            <Field label="Location" value={exp.location} onChange={(v) => updateItem(i, { location: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date" value={exp.startDate} onChange={(v) => updateItem(i, { startDate: v })} placeholder="Jan 2023" />
              <Field
                label="End date"
                value={exp.endDate}
                onChange={(v) => updateItem(i, { endDate: v })}
                placeholder="Present"
              />
            </div>
          </div>
          <CheckboxField
            label="I currently work here"
            checked={exp.currentlyWorking}
            onChange={(v) => updateItem(i, { currentlyWorking: v, endDate: v ? 'Present' : exp.endDate })}
          />
          <TextAreaField
            label="Short description (optional)"
            value={exp.description}
            onChange={(v) => updateItem(i, { description: v })}
            rows={2}
          />
          <div>
            <span className="block text-xs uppercase tracking-widest text-slate mb-1">Bullet points</span>
            <BulletListEditor
              items={exp.bulletPoints}
              onChange={(v) => updateItem(i, { bulletPoints: v })}
              placeholder="Increased X by Y% through Z"
            />
          </div>
        </ItemCard>
      ))}
      <button
        type="button"
        onClick={() => addItem(BLANK_EXPERIENCE)}
        className="text-xs uppercase tracking-widest text-redline hover:underline"
      >
        + Add experience
      </button>
    </div>
  )
}

const BLANK_EDUCATION = { institution: '', degree: '', field: '', startDate: '', endDate: '', grade: '' }

export function EducationSection({ items, onChange }) {
  const { updateItem, removeItem, addItem, moveItem } = useListHelpers(items, onChange)
  return (
    <div>
      {items.map((edu, i) => (
        <ItemCard
          key={i}
          title={edu.institution || `Education ${i + 1}`}
          onRemove={() => removeItem(i)}
          onMoveUp={i > 0 ? () => moveItem(i, -1) : null}
          onMoveDown={i < items.length - 1 ? () => moveItem(i, 1) : null}
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Institution" value={edu.institution} onChange={(v) => updateItem(i, { institution: v })} />
            <Field label="Degree" value={edu.degree} onChange={(v) => updateItem(i, { degree: v })} placeholder="B.Tech" />
            <Field label="Field of study" value={edu.field} onChange={(v) => updateItem(i, { field: v })} placeholder="Computer Science" />
            <Field label="Grade / CGPA" value={edu.grade} onChange={(v) => updateItem(i, { grade: v })} />
            <Field label="Start date" value={edu.startDate} onChange={(v) => updateItem(i, { startDate: v })} placeholder="2020" />
            <Field label="End date" value={edu.endDate} onChange={(v) => updateItem(i, { endDate: v })} placeholder="2024" />
          </div>
        </ItemCard>
      ))}
      <button
        type="button"
        onClick={() => addItem(BLANK_EDUCATION)}
        className="text-xs uppercase tracking-widest text-redline hover:underline"
      >
        + Add education
      </button>
    </div>
  )
}

const BLANK_SKILL_GROUP = { category: '', skills: [] }

export function SkillsSection({ items, onChange }) {
  const { updateItem, removeItem, addItem, moveItem } = useListHelpers(items, onChange)
  return (
    <div>
      {items.map((group, i) => (
        <ItemCard
          key={i}
          title={group.category || `Skill group ${i + 1}`}
          onRemove={() => removeItem(i)}
          onMoveUp={i > 0 ? () => moveItem(i, -1) : null}
          onMoveDown={i < items.length - 1 ? () => moveItem(i, 1) : null}
        >
          <Field
            label="Category"
            value={group.category}
            onChange={(v) => updateItem(i, { category: v })}
            placeholder="Languages, Frameworks, Tools..."
          />
          <div>
            <span className="block text-xs uppercase tracking-widest text-slate mb-1">Skills</span>
            <StringListEditor
              items={group.skills}
              onChange={(v) => updateItem(i, { skills: v })}
              placeholder="React"
              addLabel="+ Add skill"
            />
          </div>
        </ItemCard>
      ))}
      <button
        type="button"
        onClick={() => addItem(BLANK_SKILL_GROUP)}
        className="text-xs uppercase tracking-widest text-redline hover:underline"
      >
        + Add skill group
      </button>
    </div>
  )
}

const BLANK_PROJECT = {
  name: '',
  description: '',
  technologies: [],
  liveUrl: '',
  githubUrl: '',
  bulletPoints: [],
}

export function ProjectsSection({ items, onChange }) {
  const { updateItem, removeItem, addItem, moveItem } = useListHelpers(items, onChange)
  return (
    <div>
      {items.map((proj, i) => (
        <ItemCard
          key={i}
          title={proj.name || `Project ${i + 1}`}
          onRemove={() => removeItem(i)}
          onMoveUp={i > 0 ? () => moveItem(i, -1) : null}
          onMoveDown={i < items.length - 1 ? () => moveItem(i, 1) : null}
        >
          <Field label="Project name" value={proj.name} onChange={(v) => updateItem(i, { name: v })} />
          <div>
            <TextAreaField
              label="Description"
              value={proj.description}
              onChange={(v) => updateItem(i, { description: v })}
              rows={2}
            />
            <AiAssistButton
              text={[proj.name, proj.technologies.filter(Boolean).join(', ')].filter(Boolean).join(' — ')}
              actions={PROJECT_DESCRIPTION_ACTIONS}
              onAccept={(s) => updateItem(i, { description: s })}
              label="✦ Draft with AI"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Live URL" value={proj.liveUrl} onChange={(v) => updateItem(i, { liveUrl: v })} />
            <Field label="GitHub URL" value={proj.githubUrl} onChange={(v) => updateItem(i, { githubUrl: v })} />
          </div>
          <div>
            <span className="block text-xs uppercase tracking-widest text-slate mb-1">Technologies</span>
            <StringListEditor
              items={proj.technologies}
              onChange={(v) => updateItem(i, { technologies: v })}
              placeholder="React"
              addLabel="+ Add technology"
            />
          </div>
          <div>
            <span className="block text-xs uppercase tracking-widest text-slate mb-1">Bullet points</span>
            <BulletListEditor
              items={proj.bulletPoints}
              onChange={(v) => updateItem(i, { bulletPoints: v })}
              placeholder="Built X that does Y"
            />
          </div>
        </ItemCard>
      ))}
      <button
        type="button"
        onClick={() => addItem(BLANK_PROJECT)}
        className="text-xs uppercase tracking-widest text-redline hover:underline"
      >
        + Add project
      </button>
    </div>
  )
}

const BLANK_CERT = { name: '', issuer: '', date: '', credentialUrl: '' }

export function CertificationsSection({ items, onChange }) {
  const { updateItem, removeItem, addItem, moveItem } = useListHelpers(items, onChange)
  return (
    <div>
      {items.map((cert, i) => (
        <ItemCard
          key={i}
          title={cert.name || `Certification ${i + 1}`}
          onRemove={() => removeItem(i)}
          onMoveUp={i > 0 ? () => moveItem(i, -1) : null}
          onMoveDown={i < items.length - 1 ? () => moveItem(i, 1) : null}
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name" value={cert.name} onChange={(v) => updateItem(i, { name: v })} />
            <Field label="Issuer" value={cert.issuer} onChange={(v) => updateItem(i, { issuer: v })} />
            <Field label="Date" value={cert.date} onChange={(v) => updateItem(i, { date: v })} placeholder="2024" />
            <Field label="Credential URL" value={cert.credentialUrl} onChange={(v) => updateItem(i, { credentialUrl: v })} />
          </div>
        </ItemCard>
      ))}
      <button
        type="button"
        onClick={() => addItem(BLANK_CERT)}
        className="text-xs uppercase tracking-widest text-redline hover:underline"
      >
        + Add certification
      </button>
    </div>
  )
}

const BLANK_ACHIEVEMENT = { title: '', description: '' }

export function AchievementsSection({ items, onChange }) {
  const { updateItem, removeItem, addItem, moveItem } = useListHelpers(items, onChange)
  return (
    <div>
      {items.map((ach, i) => (
        <ItemCard
          key={i}
          title={ach.title || `Achievement ${i + 1}`}
          onRemove={() => removeItem(i)}
          onMoveUp={i > 0 ? () => moveItem(i, -1) : null}
          onMoveDown={i < items.length - 1 ? () => moveItem(i, 1) : null}
        >
          <Field label="Title" value={ach.title} onChange={(v) => updateItem(i, { title: v })} />
          <TextAreaField label="Description" value={ach.description} onChange={(v) => updateItem(i, { description: v })} rows={2} />
        </ItemCard>
      ))}
      <button
        type="button"
        onClick={() => addItem(BLANK_ACHIEVEMENT)}
        className="text-xs uppercase tracking-widest text-redline hover:underline"
      >
        + Add achievement
      </button>
    </div>
  )
}

const BLANK_LANGUAGE = { language: '', proficiency: '' }

export function LanguagesSection({ items, onChange }) {
  const { updateItem, removeItem, addItem, moveItem } = useListHelpers(items, onChange)
  return (
    <div>
      {items.map((lang, i) => (
        <ItemCard
          key={i}
          title={lang.language || `Language ${i + 1}`}
          onRemove={() => removeItem(i)}
          onMoveUp={i > 0 ? () => moveItem(i, -1) : null}
          onMoveDown={i < items.length - 1 ? () => moveItem(i, 1) : null}
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Language" value={lang.language} onChange={(v) => updateItem(i, { language: v })} />
            <Field
              label="Proficiency"
              value={lang.proficiency}
              onChange={(v) => updateItem(i, { proficiency: v })}
              placeholder="Native, Fluent, Conversational..."
            />
          </div>
        </ItemCard>
      ))}
      <button
        type="button"
        onClick={() => addItem(BLANK_LANGUAGE)}
        className="text-xs uppercase tracking-widest text-redline hover:underline"
      >
        + Add language
      </button>
    </div>
  )
}

const BLANK_CUSTOM = { title: '', content: '' }

export function CustomSectionsSection({ items, onChange }) {
  const { updateItem, removeItem, addItem } = useListHelpers(items, onChange)
  return (
    <div>
      {items.map((sec, i) => (
        <ItemCard key={i} title={sec.title || `Custom section ${i + 1}`} onRemove={() => removeItem(i)}>
          <Field label="Section title" value={sec.title} onChange={(v) => updateItem(i, { title: v })} placeholder="Volunteering" />
          <TextAreaField label="Content" value={sec.content} onChange={(v) => updateItem(i, { content: v })} rows={3} />
        </ItemCard>
      ))}
      <button
        type="button"
        onClick={() => addItem(BLANK_CUSTOM)}
        className="text-xs uppercase tracking-widest text-redline hover:underline"
      >
        + Add custom section
      </button>
    </div>
  )
}
