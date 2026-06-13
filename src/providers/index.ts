import { mockNotesProvider, mockTranscriptionProvider } from './mock';
import { openAICompatibleNotesProvider, openAICompatibleTranscriptionProvider } from './openaiCompatible';
import type { NotesProvider, ProviderBundle, ProviderConfig, ProviderId, TranscriptionProvider } from './types';

const TRANSCRIPTION_ENV_PREFIX = 'VITE_SIDENOTE_TRANSCRIPTION_';
const NOTES_ENV_PREFIX = 'VITE_SIDENOTE_NOTES_';

function env(name: string): string | undefined {
  const values = import.meta.env as unknown as Record<string, string | undefined>;
  const value = values[name];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function providerId(value: string | undefined): ProviderId {
  return value === 'openai-compatible' ? 'openai-compatible' : 'mock';
}

function readConfig(prefix: string): ProviderConfig {
  return {
    providerId: providerId(env(`${prefix}PROVIDER`)),
    apiKey: env(`${prefix}API_KEY`),
    baseUrl: env(`${prefix}BASE_URL`),
    model: env(`${prefix}MODEL`),
  };
}

function transcriptionProvider(id: ProviderId): TranscriptionProvider {
  if (id === 'openai-compatible') return openAICompatibleTranscriptionProvider;
  return mockTranscriptionProvider;
}

function notesProvider(id: ProviderId): NotesProvider {
  if (id === 'openai-compatible') return openAICompatibleNotesProvider;
  return mockNotesProvider;
}

export function createProviderBundle(): ProviderBundle {
  const transcriptionConfig = readConfig(TRANSCRIPTION_ENV_PREFIX);
  const notesConfig = readConfig(NOTES_ENV_PREFIX);

  return {
    transcription: transcriptionProvider(transcriptionConfig.providerId),
    notes: notesProvider(notesConfig.providerId),
    transcriptionConfig,
    notesConfig,
  };
}

export function describeProviderConfiguration(bundle = createProviderBundle()): string {
  const transcriptionHealth = bundle.transcription.health(bundle.transcriptionConfig);
  const notesHealth = bundle.notes.health(bundle.notesConfig);
  return `Transcription: ${bundle.transcription.label} (${transcriptionHealth.ready ? 'ready' : 'not configured'}). Notes: ${bundle.notes.label} (${notesHealth.ready ? 'ready' : 'not configured'}).`;
}

export type { NotesProvider, ProviderBundle, ProviderConfig, ProviderId, TranscriptionProvider } from './types';
