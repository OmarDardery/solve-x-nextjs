/**
 * User roles
 */
export const USER_ROLES = {
  PROFESSOR: 'professor',
  STUDENT: 'student',
  ORGANIZATION: 'organization',
}

/**
 * Email domain configuration
 * Students enter their ID (e.g., 2x-xxxxxx)
 * Professors enter their name/identifier
 */
export const EMAIL_DOMAINS = {
  STUDENT: ['students.eui.edu.eg'],
  PROFESSOR: ['eui.edu.eg'],
}

/**
 * Get the default domain for a role
 */
export const getDefaultDomain = (role) => {
  switch (role) {
    case USER_ROLES.STUDENT:
      return EMAIL_DOMAINS.STUDENT[0]
    case USER_ROLES.PROFESSOR:
      return EMAIL_DOMAINS.PROFESSOR[0]
    default:
      return ''
  }
}

/**
 * Get all available domains for a role
 */
export const getDomainsForRole = (role) => {
  switch (role) {
    case USER_ROLES.STUDENT:
      return EMAIL_DOMAINS.STUDENT
    case USER_ROLES.PROFESSOR:
      return EMAIL_DOMAINS.PROFESSOR
    default:
      return []
  }
}

/**
 * Build full email from identifier and domain
 */
export const buildEmail = (identifier, domain) => {
  if (!identifier || !domain) return ''
  return `${identifier}@${domain}`
}

/**
 * Application statuses
 */
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
}

/**
 * Opportunity types (must match backend validation)
 */
export const OPPORTUNITY_TYPES = {
  RESEARCH: 'research',
  PROJECT: 'project',
  INTERNSHIP: 'internship',
}


