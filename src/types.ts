export type MeetingTemplate = 'general' | 'sales' | 'interview';

export interface ActionItem {
  id: string;
  text: string;
  owner: string;
  dueDate: string;
  completed: boolean;
}

export interface MeetingRecord {
  id: string;
  title: string;
  template: MeetingTemplate;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  consentConfirmed: boolean;
  userNotesMarkdown: string;
  transcriptText: string;
  aiSummaryMarkdown: string;
  actionItems: ActionItem[];
  audioDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecorderManifest {
  schemaVersion: number;
  meetingTitle: string;
  createdAt: string;
  endedAt: string;
  captureMode: string;
  microphoneFile: string | null;
  systemAudioFile: string | null;
  consentMessage: string;
  consentConfirmed: boolean;
  audioDeleted: boolean;
  notes: string;
}

export interface CaptureState {
  status: 'idle' | 'recording' | 'processing' | 'complete' | 'error';
  errorMessage: string | null;
  startedAt: string | null;
  elapsedSeconds: number;
}
