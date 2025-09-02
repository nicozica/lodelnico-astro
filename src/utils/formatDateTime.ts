/**
 * Small helper to keep date-time formatting consistent across pages
 * Formats date and time in Rioplatense Spanish with Argentina timezone
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

/**
 * Format only date (no time) for cases where time is not needed
 */
export function formatDateOnly(raw?: string | number | Date): string {
  // Guard: if no input, return empty string
  if (!raw) return '';
  
  const dt = new Date(raw);
  
  // Validate date
  if (isNaN(dt.getTime())) {
    console.warn('Invalid date provided to formatDateOnly:', raw);
    return '';
  }
  
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeZone: 'America/Argentina/Buenos_Aires'
  }).format(dt);
}
