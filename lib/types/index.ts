/**
 * User roles
 */
export const USER_ROLES = {
  PROFESSOR: "professor",
  STUDENT: "student",
  ORGANIZATION: "organization",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Email domain configuration
 * Students enter their ID (e.g., 2x-xxxxxx)
 * Professors enter their name/identifier
 */
export const EMAIL_DOMAINS = {
  STUDENT: ["students.eui.edu.eg"],
  PROFESSOR: ["eui.edu.eg"],
};

/**
 * Get the default domain for a role
 */
export const getDefaultDomain = (role: UserRole): string => {
  switch (role) {
    case USER_ROLES.STUDENT:
      return EMAIL_DOMAINS.STUDENT[0];
    case USER_ROLES.PROFESSOR:
      return EMAIL_DOMAINS.PROFESSOR[0];
    default:
      return "";
  }
};

/**
 * Get all available domains for a role
 */
export const getDomainsForRole = (role: UserRole): string[] => {
  switch (role) {
    case USER_ROLES.STUDENT:
      return EMAIL_DOMAINS.STUDENT;
    case USER_ROLES.PROFESSOR:
      return EMAIL_DOMAINS.PROFESSOR;
    default:
      return [];
  }
};

/**
 * Build full email from identifier and domain
 */
export const buildEmail = (identifier: string, domain: string): string => {
  if (!identifier || !domain) return "";
  return `${identifier}@${domain}`;
};

/**
 * Application statuses
 */
export const APPLICATION_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

export type ApplicationStatus =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

/**
 * Opportunity types (must match backend validation)
 */
export const OPPORTUNITY_TYPES = {
  RESEARCH: "research",
  PROJECT: "project",
  INTERNSHIP: "internship",
} as const;

export type OpportunityType =
  (typeof OPPORTUNITY_TYPES)[keyof typeof OPPORTUNITY_TYPES];
