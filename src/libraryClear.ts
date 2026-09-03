type ConfirmClear = (message: string) => boolean;

export function confirmClearMeetingLibrary(totalMeetings: number, confirm: ConfirmClear): boolean {
  const scope = totalMeetings === 1
    ? '1 local meeting and its notes'
    : `all ${totalMeetings} local meetings and their notes`;

  return confirm(`Delete ${scope}? This cannot be undone.`);
}
