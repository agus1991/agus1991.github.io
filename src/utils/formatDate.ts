export function formatDate(date: Date | string, locale: string = 'id-ID'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatYear(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getFullYear().toString();
}

export function toIsoDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}
