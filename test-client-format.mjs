// Test client-side date formatting
const testDate = '2025-08-28T06:25:00.000Z';
console.log('Raw date:', testDate);

const formatted = new Intl.DateTimeFormat('es-AR', {
  year: 'numeric',
  month: 'long', 
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Argentina/Buenos_Aires'
}).format(new Date(testDate));

console.log('Client-side formatted (Argentina TZ):', formatted);

// Test what happens in UTC (GitHub Actions environment)
const utcFormatted = new Intl.DateTimeFormat('es-AR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric', 
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC'
}).format(new Date(testDate));

console.log('UTC formatted (GitHub build):', utcFormatted);
