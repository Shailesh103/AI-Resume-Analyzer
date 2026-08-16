import ModernATSTemplate from './ModernATSTemplate'
import ProfessionalTemplate from './ProfessionalTemplate'
import ExecutiveTemplate from './ExecutiveTemplate'
import DeveloperTemplate from './DeveloperTemplate'
import MinimalTemplate from './MinimalTemplate'

/**
 * Every template component receives the exact same props — { resumeData, sectionOrder, styling } —
 * and must only decide presentation. None of them may mutate resumeData; the data stays identical
 * no matter which template renders it, so switching templates never loses information.
 */
export const TEMPLATES = {
  modern: {
    label: 'Modern ATS',
    description: 'Clean single-column layout, minimal visual elements, excellent ATS compatibility.',
    component: ModernATSTemplate,
    available: true,
  },
  professional: {
    label: 'Professional',
    description: 'Traditional corporate design with strong section hierarchy.',
    component: ProfessionalTemplate,
    available: true,
  },
  executive: {
    label: 'Executive',
    description: 'Premium layout with strong typography, for experienced professionals.',
    component: ExecutiveTemplate,
    available: true,
  },
  developer: {
    label: 'Developer',
    description: 'Optimized for software engineers — skills, projects, and links up front.',
    component: DeveloperTemplate,
    available: true,
  },
  minimal: {
    label: 'Minimal',
    description: 'Extremely clean, lots of whitespace, simple typography.',
    component: MinimalTemplate,
    available: true,
  },
}

export const TEMPLATE_LIST = Object.entries(TEMPLATES).map(([key, meta]) => ({ key, ...meta }))
