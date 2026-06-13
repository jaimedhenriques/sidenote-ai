import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, CircleStop, Clipboard, FileDown, FileText, Lock, Play, Search, ShieldCheck, Sparkles, Trash2, Upload } from 'lucide-react';
import type { MeetingRecord, MeetingTemplate, RecorderManifest } from './types';
import { generateConfiguredSummary } from './ai';
import { createMeeting, createMeetingFromRecorderManifest, formatDuration, loadMeetings, saveMeetings } from './storage';
import { describeProviderConfiguration } from './providers';

const consentMessage = 'Heads up: I am using SideNote AI to help me take notes and generate a transcript/summary from this meeting. Please let me know if you would prefer I turn it off.';

export function App() {
  const [meetings, setMeetings] = useState<MeetingRecord[]>(() => loadMeetings());
  const [activeMeeting, setActiveMeeting] = useState<MeetingRecord | null>(null);
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState<MeetingTemplate>('general');
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [query, setQuery] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'complete' | 'error'>('idle');
  const [audioPermission, setAudioPermission] = useState('not requested');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const providerConfiguration = useMemo(() => describeProviderConfiguration(), []);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  useEffect(() => saveMeetings(meetings), [meetings]);

  useEffect(() => {
    if (!activeMeeting || status !== 'recording') return undefined;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [activeMeeting, status]);

  const filteredMeetings = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return meetings;
    return meetings.filter((meeting) => `${meeting.title} ${meeting.aiSummaryMarkdown} ${meeting.transcriptText}`.toLowerCase().includes(needle));
  }, [meetings, query]);

  async function startMeeting() {
    if (!consentConfirmed) return;
    const meeting = createMeeting(title, template);
    setActiveMeeting(meeting);
    setElapsed(0);
    setStatus('recording');
    setImportStatus(null);
    setAudioPermission('requesting microphone');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.start();
      mediaRecorder.current = recorder;
      setAudioPermission('microphone granted — Mac companion adds system audio capture');
    } catch {
      setAudioPermission('browser mic unavailable — use Mac companion or paste transcript');
    }
  }

  function updateActiveNotes(value: string) {
    if (!activeMeeting) return;
    const updated = { ...activeMeeting, userNotesMarkdown: value, updatedAt: new Date().toISOString() };
    setActiveMeeting(updated);
    updateMeetingInLibrary(updated);
  }

  function updateActiveTranscript(value: string) {
    if (!activeMeeting) return;
    const updated = { ...activeMeeting, transcriptText: value, updatedAt: new Date().toISOString() };
    setActiveMeeting(updated);
    updateMeetingInLibrary(updated);
  }

  function updateMeetingInLibrary(meeting: MeetingRecord) {
    setMeetings((items) => items.some((item) => item.id === meeting.id) ? items.map((item) => item.id === meeting.id ? meeting : item) : items);
  }

  function upsertMeetingInLibrary(meeting: MeetingRecord) {
    setMeetings((items) => [meeting, ...items.filter((item) => item.id !== meeting.id)]);
  }

  async function importRecorderManifest(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      if (!isRecorderManifest(parsed)) throw new Error('Selected file is not a SideNote recorder manifest.');
      const meeting = createMeetingFromRecorderManifest(parsed);
      setActiveMeeting(meeting);
      upsertMeetingInLibrary(meeting);
      setElapsed(meeting.durationSeconds);
      setStatus('complete');
      setAudioPermission('manifest imported — local audio paths referenced only, no upload performed');
      setImportStatus(`Imported recorder manifest for “${meeting.title}”. Local audio files were not uploaded.`);
    } catch (error) {
      setImportStatus(error instanceof Error ? error.message : 'Could not import recorder manifest.');
    }
  }

  async function importTranscript(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      if (!isTranscriptFile(file)) throw new Error('Please choose a .txt or .md transcript file.');
      const transcriptText = await file.text();
      const baseTitle = file.name.replace(/\.(txt|md)$/i, '').replace(/[-_]+/g, ' ').trim();
      const meeting = activeMeeting ?? createMeeting(title.trim() || baseTitle || file.name, template);
      const updated: MeetingRecord = { ...meeting, transcriptText, updatedAt: new Date().toISOString() };
      setActiveMeeting(updated);
      upsertMeetingInLibrary(updated);
      setElapsed(updated.durationSeconds);
      setStatus(activeMeeting ? status : 'complete');
      setAudioPermission('transcript imported from local file — no audio upload performed');
      setImportStatus(`Imported transcript into “${updated.title}”.`);
    } catch (error) {
      setImportStatus(error instanceof Error ? error.message : 'Could not import transcript.');
    }
  }

  async function stopMeeting() {
    if (!activeMeeting) return;
    mediaRecorder.current?.stop();
    mediaRecorder.current?.stream.getTracks().forEach((track) => track.stop());
    setStatus('processing');
    const endedAt = new Date().toISOString();
    try {
      const completed = await generateConfiguredSummary({ ...activeMeeting, endedAt, durationSeconds: elapsed, audioDeleted: true });
      setMeetings((items) => [completed, ...items.filter((item) => item.id !== completed.id)]);
      setActiveMeeting(completed);
      setStatus('complete');
    } catch {
      setStatus('error');
      setAudioPermission('notes provider failed — transcript and notes remain local');
    }
  }

  function deleteMeeting(id: string) {
    setMeetings((items) => items.filter((item) => item.id !== id));
    if (activeMeeting?.id === id) setActiveMeeting(null);
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  function exportMarkdown(meeting: MeetingRecord) {
    const blob = new Blob([meeting.aiSummaryMarkdown || meeting.userNotesMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${meeting.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow"><ShieldCheck size={16} /> Consent-first Granola competitor</p>
          <h1>SideNote AI</h1>
          <p className="lede">AI meeting notes from your own Mac — no bots joining Zoom, Teams, Meet, or Slack calls.</p>
        </div>
        <div className="trust-card"><Lock size={18} /> Local-first notes. Temporary audio deleted after transcription by default. {providerConfiguration}</div>
      </section>

      <section className="grid two">
        <div className="panel">
          <h2>New meeting</h2>
          <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Customer call, 1:1, user interview..." /></label>
          <label>Template<select value={template} onChange={(event) => setTemplate(event.target.value as MeetingTemplate)}><option value="general">General</option><option value="sales">Sales / customer</option><option value="interview">User interview</option></select></label>
          <div className="import-box"><strong>Import from local files</strong><p>Open a recorder manifest or import a transcript without uploading audio.</p><div className="actions"><label className="file-button"><Upload size={16} /> Import recorder manifest<input type="file" accept="application/json,.json" onChange={importRecorderManifest} /></label><label className="file-button"><FileText size={16} /> Import transcript<input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={importTranscript} /></label></div>{importStatus && <p className="import-status">{importStatus}</p>}</div>
          <div className="consent-box"><strong>Consent message</strong><p>{consentMessage}</p><button onClick={() => copy(consentMessage)}><Clipboard size={16} /> Copy consent message</button></div>
          <label className="check"><input type="checkbox" checked={consentConfirmed} onChange={(event) => setConsentConfirmed(event.target.checked)} /> I am a meeting participant and have notified participants / confirmed consent is not required.</label>
          <button className="primary" disabled={!consentConfirmed || status === 'recording'} onClick={startMeeting}><Play size={18} /> Start meeting note</button>
        </div>

        <div className="panel active">
          <h2>Active note</h2>
          {activeMeeting ? <>
            <div className="recording-row"><span className={`dot ${status}`} /> {status} · {formatDuration(elapsed)} · {audioPermission}</div>
            <textarea value={activeMeeting.userNotesMarkdown} onChange={(event) => updateActiveNotes(event.target.value)} placeholder="Type rough notes while you talk..." />
            <textarea value={activeMeeting.transcriptText} onChange={(event) => updateActiveTranscript(event.target.value)} placeholder="Paste transcript here, import a .txt/.md file, or connect Mac recorder/transcription provider..." />
            <div className="actions"><label className="file-button"><FileText size={16} /> Import transcript<input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={importTranscript} /></label><button onClick={stopMeeting}><CircleStop size={16} /> Stop + summarize</button>{activeMeeting.aiSummaryMarkdown && <button onClick={() => copy(activeMeeting.aiSummaryMarkdown)}><Clipboard size={16} /> Copy AI notes</button>}</div>
          </> : <p className="muted">Start a meeting or import a recorder manifest/transcript to open the note editor.</p>}
        </div>
      </section>

      <section className="panel">
        <div className="library-head"><h2>Meeting library</h2><label className="search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes, transcripts, actions..." /></label></div>
        <div className="cards">{filteredMeetings.map((meeting) => <article key={meeting.id} className="meeting-card"><div><h3>{meeting.title}</h3><p>{new Date(meeting.createdAt).toLocaleString()} · {meeting.template} · {formatDuration(meeting.durationSeconds)}</p></div><pre>{meeting.aiSummaryMarkdown || meeting.userNotesMarkdown || 'No summary yet.'}</pre><div className="actions"><button onClick={() => setActiveMeeting(meeting)}><Sparkles size={16} /> Open</button><button onClick={() => exportMarkdown(meeting)}><FileDown size={16} /> Export MD</button><button onClick={() => deleteMeeting(meeting.id)}><Trash2 size={16} /> Delete</button></div></article>)}</div>
      </section>

      <section className="panel compliance"><h2><CheckCircle2 size={20} /> Built-in guardrails</h2><ul><li>Manual start/stop only.</li><li>Consent confirmation before every recording.</li><li>No meeting bot, no credential access, no platform bypass.</li><li>Mac companion captures local device audio only for meetings the user participates in.</li><li>Temporary audio deletion by default.</li></ul></section>
    </main>
  );
}

function isRecorderManifest(value: unknown): value is RecorderManifest {
  if (!isRecord(value)) return false;
  return typeof value.schemaVersion === 'number'
    && typeof value.meetingTitle === 'string'
    && typeof value.createdAt === 'string'
    && typeof value.endedAt === 'string'
    && typeof value.captureMode === 'string'
    && isNullableString(value.microphoneFile)
    && isNullableString(value.systemAudioFile)
    && typeof value.consentMessage === 'string'
    && typeof value.consentConfirmed === 'boolean'
    && typeof value.audioDeleted === 'boolean'
    && typeof value.notes === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isTranscriptFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return lowerName.endsWith('.txt') || lowerName.endsWith('.md');
}
