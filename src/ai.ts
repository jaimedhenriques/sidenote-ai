import type { MeetingRecord } from './types';
import { createProviderBundle } from './providers';
import { generateMockNotes } from './providers/mock';

export function generateLocalSummary(meeting: MeetingRecord): MeetingRecord {
  const notes = generateMockNotes(meeting, meeting.transcriptText);
  const now = new Date().toISOString();
  return {
    ...meeting,
    aiSummaryMarkdown: notes.summaryMarkdown,
    actionItems: notes.actionItems,
    updatedAt: now,
  };
}

export async function generateConfiguredSummary(meeting: MeetingRecord): Promise<MeetingRecord> {
  const bundle = createProviderBundle();
  const health = bundle.notes.health(bundle.notesConfig);
  const notes = health.ready
    ? await bundle.notes.generateNotes({ meeting, transcriptText: meeting.transcriptText }, bundle.notesConfig)
    : generateMockNotes(meeting, meeting.transcriptText);

  const now = new Date().toISOString();
  return {
    ...meeting,
    aiSummaryMarkdown: notes.summaryMarkdown,
    actionItems: notes.actionItems,
    updatedAt: now,
  };
}
