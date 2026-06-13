import type { MeetingRecord, MeetingTemplate, RecorderManifest } from './types';

const STORAGE_KEY = 'sidenote-ai-meetings-v1';
const localFirstGuardrail = 'User-side local capture only. The user must be a meeting participant and must notify participants or confirm consent is not required. SideNote does not join meetings as a bot, bypass platform controls, or send audio externally from this recorder.';

export function loadMeetings(): MeetingRecord[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as MeetingRecord[];
    return parsed.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export function saveMeetings(meetings: MeetingRecord[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
}

export function createMeeting(title: string, template: MeetingTemplate): MeetingRecord {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: title.trim() || `Untitled meeting — ${new Date().toLocaleString()}`,
    template,
    startedAt: now,
    endedAt: null,
    durationSeconds: 0,
    consentConfirmed: true,
    userNotesMarkdown: '',
    transcriptText: '',
    aiSummaryMarkdown: '',
    actionItems: [],
    audioDeleted: true,
    createdAt: now,
    updatedAt: now,
  };
}

export function createMeetingFromRecorderManifest(manifest: RecorderManifest): MeetingRecord {
  const now = new Date().toISOString();
  const startedAt = manifest.createdAt || now;
  const endedAt = manifest.endedAt || null;

  return {
    id: crypto.randomUUID(),
    title: manifest.meetingTitle.trim() || `Imported recording — ${new Date().toLocaleString()}`,
    template: 'general',
    startedAt,
    endedAt,
    durationSeconds: calculateDurationSeconds(startedAt, endedAt),
    consentConfirmed: manifest.consentConfirmed,
    userNotesMarkdown: buildManifestNotes(manifest),
    transcriptText: buildManifestTranscriptPlaceholder(manifest),
    aiSummaryMarkdown: '',
    actionItems: [],
    audioDeleted: manifest.audioDeleted,
    createdAt: startedAt,
    updatedAt: now,
  };
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function buildManifestTranscriptPlaceholder(manifest: RecorderManifest): string {
  const audioReferences = [
    manifest.microphoneFile ? `- Microphone audio: ${manifest.microphoneFile}` : '- Microphone audio: not captured in manifest',
    manifest.systemAudioFile ? `- System audio: ${manifest.systemAudioFile}` : '- System audio: not captured in manifest',
  ].join('\n');

  return [
    'Imported SideNote recorder manifest. No audio files were uploaded into the web app.',
    '',
    'Local audio references from the manifest:',
    audioReferences,
    '',
    `Local-first guardrail: ${manifest.notes || localFirstGuardrail}`,
    '',
    'Paste or generate the transcript here after transcribing the local audio files on your device.',
  ].join('\n');
}

function buildManifestNotes(manifest: RecorderManifest): string {
  return [
    `Imported recorder manifest v${manifest.schemaVersion}`,
    `Capture mode: ${manifest.captureMode || 'unknown'}`,
    `Consent confirmed: ${manifest.consentConfirmed ? 'yes' : 'no'}`,
    `Consent message: ${manifest.consentMessage || 'not included'}`,
    `Audio deleted by recorder: ${manifest.audioDeleted ? 'yes' : 'no'}`,
  ].join('\n');
}

function calculateDurationSeconds(startedAt: string, endedAt: string | null): number {
  if (!endedAt) return 0;
  const started = Date.parse(startedAt);
  const ended = Date.parse(endedAt);
  if (!Number.isFinite(started) || !Number.isFinite(ended) || ended < started) return 0;
  return Math.floor((ended - started) / 1000);
}
