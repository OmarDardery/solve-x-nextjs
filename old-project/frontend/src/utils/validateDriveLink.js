/**
 * Validates Google Drive links
 * Accepts various Google Drive link formats
 */
export function validateDriveLink(url) {
  if (!url || typeof url !== 'string') {
    return false
  }

  // Remove whitespace
  url = url.trim()

  // Common Google Drive link patterns
  const drivePatterns = [
    /^https?:\/\/(drive\.google\.com|docs\.google\.com)/i,
    /^https?:\/\/.*google.*drive/i,
  ]

  return drivePatterns.some(pattern => pattern.test(url))
}

/**
 * Formats a Google Drive link to ensure it's shareable
 */
export function formatDriveLink(url) {
  if (!url) return ''
  
  url = url.trim()
  
  // If it's a file ID, convert to shareable link
  if (/^[a-zA-Z0-9_-]+$/.test(url)) {
    return `https://drive.google.com/file/d/${url}/view?usp=sharing`
  }
  
  return url
}


