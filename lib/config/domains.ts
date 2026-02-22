/**
 * Domain configuration for email validation
 * Hardcoded as per original implementation
 */

export const DOMAIN_CONFIG = {
  studentDomains: ["students.eui.edu.eg"],
  professorDomains: ["eui.edu.eg"],
} as const;

/**
 * Extract domain from email address
 */
function extractDomain(email: string): string {
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) return "";
  return email.slice(atIndex + 1).toLowerCase();
}

/**
 * Check if email domain is valid for students
 */
export function isValidStudentDomain(email: string): boolean {
  const domain = extractDomain(email);
  return DOMAIN_CONFIG.studentDomains.includes(domain as any);
}

/**
 * Check if email domain is valid for professors
 */
export function isValidProfessorDomain(email: string): boolean {
  const domain = extractDomain(email);
  return DOMAIN_CONFIG.professorDomains.includes(domain as any);
}

/**
 * Get domain configuration (for public API endpoint)
 */
export function getDomainConfig() {
  return {
    studentDomains: [...DOMAIN_CONFIG.studentDomains],
    professorDomains: [...DOMAIN_CONFIG.professorDomains],
  };
}
