const maxExportBasenameLength = 80;

export function formatMeetingExportFilename(title: string): string {
  const basename = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, maxExportBasenameLength)
    .replace(/-+$/g, '');

  return `${basename || 'sidenote-meeting'}.md`;
}
