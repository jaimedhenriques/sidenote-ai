import type { ActionItem } from '../types';
import type { NotesInput, NotesProvider, NotesResult, ProviderConfig, ProviderHealth, TranscriptionInput, TranscriptionProvider, TranscriptionResult } from './types';

function health(config: ProviderConfig): ProviderHealth {
  if (!config.apiKey) return { ready: false, reason: 'Missing user/env API key' };
  if (!config.baseUrl) return { ready: false, reason: 'Missing provider base URL' };
  if (!config.model) return { ready: false, reason: 'Missing provider model' };
  return { ready: true };
}

function assertReady(config: ProviderConfig): void {
  const state = health(config);
  if (!state.ready) {
    throw new Error(state.reason ?? 'Provider is not configured');
  }
}

function endpoint(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

function extractText(value: unknown): string {
  if (typeof value !== 'object' || value === null) return '';
  const record = value as Record<string, unknown>;
  if (typeof record.text === 'string') return record.text;
  const choices = record.choices;
  if (!Array.isArray(choices)) return '';
  const first = choices[0] as Record<string, unknown> | undefined;
  const message = first?.message as Record<string, unknown> | undefined;
  return typeof message?.content === 'string' ? message.content : '';
}

function parseActionItems(markdown: string): ActionItem[] {
  const section = markdown.split(/## Action Items/i)[1]?.split(/\n## /)[0] ?? '';
  return section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+(\[[ x]\]\s*)?/i.test(line))
    .slice(0, 12)
    .map((line) => ({
      id: crypto.randomUUID(),
      text: line.replace(/^[-*]\s+(\[[ x]\]\s*)?/i, '').trim(),
      owner: 'Unassigned',
      dueDate: 'Not stated',
      completed: false,
    }));
}

export const openAICompatibleTranscriptionProvider: TranscriptionProvider = {
  id: 'openai-compatible',
  label: 'OpenAI-compatible transcription',
  health,
  async transcribe(input: TranscriptionInput, config: ProviderConfig): Promise<TranscriptionResult> {
    assertReady(config);
    const form = new FormData();
    form.append('file', input.audio, `sidenote-audio.${input.mimeType?.includes('mpeg') ? 'mp3' : 'webm'}`);
    form.append('model', config.model as string);
    if (input.language) form.append('language', input.language);

    const response = await fetch(endpoint(config.baseUrl as string, '/audio/transcriptions'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.apiKey}` },
      body: form,
    });

    if (!response.ok) throw new Error(`Transcription provider failed with HTTP ${response.status}`);
    const data: unknown = await response.json();
    const transcriptText = extractText(data);
    if (!transcriptText) throw new Error('Transcription provider returned no text');
    return { transcriptText, providerId: 'openai-compatible' };
  },
};

export const openAICompatibleNotesProvider: NotesProvider = {
  id: 'openai-compatible',
  label: 'OpenAI-compatible notes LLM',
  health,
  async generateNotes(input: NotesInput, config: ProviderConfig): Promise<NotesResult> {
    assertReady(config);
    const prompt = `Create concise consent-first meeting notes in Markdown. Include sections exactly named: Executive Summary, Key Points, Decisions, Action Items, Open Questions, Important Details, Follow-up Draft.\n\nMeeting title: ${input.meeting.title}\nTemplate: ${input.meeting.template}\nConsent confirmed: ${input.meeting.consentConfirmed ? 'yes' : 'no'}\n\nUser notes:\n${input.meeting.userNotesMarkdown || '(none)'}\n\nTranscript:\n${input.transcriptText || '(none)'}`;

    const response = await fetch(endpoint(config.baseUrl as string, '/chat/completions'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: 'You generate accurate, consent-first meeting notes. Never invent facts not supported by the notes or transcript.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) throw new Error(`Notes provider failed with HTTP ${response.status}`);
    const data: unknown = await response.json();
    const summaryMarkdown = extractText(data);
    if (!summaryMarkdown) throw new Error('Notes provider returned no content');
    return {
      summaryMarkdown,
      actionItems: parseActionItems(summaryMarkdown),
      providerId: 'openai-compatible',
    };
  },
};
