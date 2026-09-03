export function formatLibraryResultCount(visibleCount: number, totalCount: number, filtersActive: boolean): string {
  const meetingLabel = totalCount === 1 ? 'meeting' : 'meetings';
  if (filtersActive) return `Showing ${visibleCount} of ${totalCount} local ${meetingLabel}.`;
  return `${totalCount} local ${meetingLabel}.`;
}
