import type { ActionItem, MeetingRecord } from '../types';

export type ProviderId = 'mock' | 'openai-compatible';

export interface ProviderConfig {
  providerId: ProviderId;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface ProviderHealth {
  ready: boolean;
  reason?: string;
}

export interface TranscriptionInput {
  audio: Blob;
  mimeType?: string;
  language?: string;
  meeting?: MeetingRecord;
}

export interface TranscriptionResult {
  transcriptText: string;
  providerId: ProviderId;
}

export interface NotesInput {
  meeting: MeetingRecord;
  transcriptText: string;
}

export interface NotesResult {
  summaryMarkdown: string;
  actionItems: ActionItem[];
  providerId: ProviderId;
}

export interface TranscriptionProvider {
  id: ProviderId;
  label: string;
  health(config: ProviderConfig): ProviderHealth;
  transcribe(input: TranscriptionInput, config: ProviderConfig): Promise<TranscriptionResult>;
}

export interface NotesProvider {
  id: ProviderId;
  label: string;
  health(config: ProviderConfig): ProviderHealth;
  generateNotes(input: NotesInput, config: ProviderConfig): Promise<NotesResult>;
}

export interface ProviderBundle {
  transcription: TranscriptionProvider;
  notes: NotesProvider;
  transcriptionConfig: ProviderConfig;
  notesConfig: ProviderConfig;
}
