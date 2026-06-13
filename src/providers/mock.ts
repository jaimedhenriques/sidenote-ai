import type { ActionItem, MeetingRecord } from '../types';
import type { NotesInput, NotesProvider, NotesResult, ProviderConfig, ProviderHealth, TranscriptionInput, TranscriptionProvider, TranscriptionResult } from './types';

const TEMPLATE_LABELS: Record<MeetingRecord['template'], string> = {
  general: 'General Meeting',
  sales: 'Sales / Customer Call',
  interview: 'User Interview',
};

export function collectLocalActionItems(source: string): ActionItem[] {
  const candidates = source
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /\b(action|follow up|send|schedule|owner|todo|next step)\b/i.test(line))
    .slice(0, 8);

  return candidates.map((text) => ({
    id: crypto.randomUUID(),
    text: text.replace(/^[-*\d.)\s]+/, ''),
    owner: 'Unassigned',
    dueDate: 'Not stated',
    completed: false,
  }));
}

function bulletize(text: string, fallback: string): string[] {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 5);
  return sentences.length ? sentences : [fallback];
}

export function generateMockNotes(meeting: MeetingRecord, transcriptText = meeting.transcriptText): NotesResult {
  const source = `${meeting.userNotesMarkdown}\n${transcriptText}`.trim();
  const actionItems = collectLocalActionItems(source);
  const keyPoints = bulletize(source, 'No detailed transcript yet. Add transcript text or configure a transcription provider.');
  const templateLabel = TEMPLATE_LABELS[meeting.template];

  const extraSection = meeting.template === 'sales'
    ? `\n## Sales Lens\n- Pain points: Review transcript for explicit blockers.\n- Objections: Pricing/security/timeline cues are highlighted when present.\n- Next step: Confirm follow-up owner and date.\n`
    : meeting.template === 'interview'
      ? `\n## Research Lens\n- Workflow: Capture current process from transcript.\n- Pain points: Pull exact quotes before sharing externally.\n- Opportunities: Convert repeated friction into product hypotheses.\n`
      : '';

  const summaryMarkdown = `# ${meeting.title}\n\n## Executive Summary\n${keyPoints[0]}\n\n## Key Points\n${keyPoints.map((point) => `- ${point}`).join('\n')}\n\n## Decisions\n- Review transcript for explicit decisions before sending externally.\n\n## Action Items\n${actionItems.length ? actionItems.map((item) => `- [ ] ${item.text} — ${item.owner} — ${item.dueDate}`).join('\n') : '- No action items detected yet.'}\n\n## Open Questions\n- What follow-up is required?\n- Who owns the next step?\n\n## Important Details\n- Template: ${templateLabel}\n- Consent confirmed by user: ${meeting.consentConfirmed ? 'Yes' : 'No'}\n- Temporary audio retained: No — audio deletion by default.\n- Provider: mock/local deterministic adapter.\n${extraSection}\n## Follow-up Draft\nHi — thanks for the conversation today. Here are the notes I captured:\n\n${keyPoints.map((point) => `- ${point}`).join('\n')}\n\nNext steps:\n${actionItems.length ? actionItems.map((item) => `- ${item.text}`).join('\n') : '- I will confirm the next step separately.'}\n`;

  return {
    summaryMarkdown,
    actionItems,
    providerId: 'mock',
  };
}

const ready: ProviderHealth = { ready: true };

export const mockTranscriptionProvider: TranscriptionProvider = {
  id: 'mock',
  label: 'Mock / paste transcript',
  health: (_config: ProviderConfig) => ready,
  async transcribe(_input: TranscriptionInput, _config: ProviderConfig): Promise<TranscriptionResult> {
    return {
      transcriptText: '',
      providerId: 'mock',
    };
  },
};

export const mockNotesProvider: NotesProvider = {
  id: 'mock',
  label: 'Mock / local deterministic notes',
  health: (_config: ProviderConfig) => ready,
  async generateNotes(input: NotesInput, _config: ProviderConfig): Promise<NotesResult> {
    return generateMockNotes(input.meeting, input.transcriptText);
  },
};
