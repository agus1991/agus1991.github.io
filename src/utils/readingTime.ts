export function calculateReadingTime(content: string): string {
  if (!content) return '1 menit baca';
  // Strip HTML and markdown tags
  const clean = content
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/[#*`_~\[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const words = clean.split(' ').filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} menit baca`;
}
