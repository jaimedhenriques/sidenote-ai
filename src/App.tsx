import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, CircleStop, Clipboard, FileDown, FileText, Lock, Play, Search, ShieldCheck, Sparkles, Trash2, Upload } from 'lucide-react';
import type { MeetingRecord, MeetingTemplate, RecorderManifest } from './types';
import { generateConfiguredSummary } from './ai';
import { createMeeting, createMeetingFromRecorderManifest, formatDuration, loadMeetings, saveMeetings } from './storage';
import { describeProviderConfiguration } from './providers';

const consentMessage = 'Heads up: I am using SideNote AI to help me take notes and generate a transcript/summary from this meeting. Please let me know if you would prefer I turn it off.';
const meetingGoalLimit = 280;

function createMeetingWithGoal(title: string, template: MeetingTemplate, meetingGoal: string): MeetingRecord {
  const goal = meetingGoal.trim();
  return {
    ...createMeeting(title, template),
    userNotesMarkdown: goal ? `## Meeting goal\n${goal}` : '',
  };
}

function formatOpenActionCount(actionItems: MeetingRecord['actionItems']): string {
  const openCount = actionItems.filter((item) => !item.completed).length;
  return `${openCount} open ${openCount === 1 ? 'action' : 'actions'}`;
}

function formatCurrentActionStatus(actionItems: MeetingRecord['actionItems']): string {
  if (!actionItems.length) return '';
  return `## Current action status\n${actionItems.map((item) => `- [${item.completed ? 'x' : ' '}] ${item.text} — ${item.owner} — ${item.dueDate}`).join('\n')}`;
}

export function App() {
  const [meetings, setMeetings] = useState<MeetingRecord[]>(() => loadMeetings());
  const [activeMeeting, setActiveMeeting] = useState<MeetingRecord | null>(null);
  const [title, setTitle] = useState('');
  const [meetingGoal, setMeetingGoal] = useState('');
  const [template, setTemplate] = useState<MeetingTemplate>('general');
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [query, setQuery] = useState('');
  const [showOpenActionsOnly, setShowOpenActionsOnly] = useState(false);
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
    return meetings.filter((meeting) => {
      if (showOpenActionsOnly && !meeting.actionItems.some((item) => !item.completed)) return false;
      if (!needle) return true;
      return [
      meeting.title,
      meeting.userNotesMarkdown,
      meeting.aiSummaryMarkdown,
      meeting.transcriptText,
      ...meeting.actionItems.map((item) => `${item.text} ${item.owner} ${item.dueDate}`),
      ].join(' ').toLowerCase().includes(needle);
    });
  }, [meetings, query, showOpenActionsOnly]);

  async function startMeeting() {
    if (!consentConfirmed) return;
    const meeting = createMeetingWithGoal(title, template, meetingGoal);
    setActiveMeeting(meeting);
    setTitle('');
    setMeetingGoal('');
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

  function toggleActiveActionItem(id: string) {
    if (!activeMeeting) return;
    const updated = {
      ...activeMeeting,
      actionItems: activeMeeting.actionItems.map((item) => item.id === id ? { ...item, completed: !item.completed } : item),
      updatedAt: new Date().toISOString(),
    };
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
      const isNewMeeting = !activeMeeting;
      const meeting = activeMeeting ?? createMeetingWithGoal(title.trim() || baseTitle || file.name, template, meetingGoal);
      const updated: MeetingRecord = { ...meeting, transcriptText, updatedAt: new Date().toISOString() };
      setActiveMeeting(updated);
      upsertMeetingInLibrary(updated);
      setElapsed(updated.durationSeconds);
      setStatus(activeMeeting ? status : 'complete');
      if (isNewMeeting) {
        setTitle('');
        setMeetingGoal('');
      }
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
    if (!window.confirm('Delete this local meeting and its notes? This cannot be undone.')) return;
    setMeetings((items) => items.filter((item) => item.id !== id));
    if (activeMeeting?.id === id) setActiveMeeting(null);
  }

  function clearLibraryFilters() {
    setQuery('');
    setShowOpenActionsOnly(false);
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  function exportMarkdown(meeting: MeetingRecord) {
    const markdown = [meeting.userNotesMarkdown, meeting.aiSummaryMarkdown, formatCurrentActionStatus(meeting.actionItems)].filter(Boolean).join('\n\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
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
          <div className="hero-actions">
            <a className="primary hero-cta" href="#new-meeting"><Play size={18} /> Start a private meeting note</a>
            <p>Consent comes first. Start locally with no meeting bot.</p>
            <p className="pricing-note">Free local MVP. No account, payment card, or subscription required.</p>
          </div>
        </div>
        <div className="trust-card"><Lock size={18} /> Local-first notes. Temporary audio deleted after transcription by default. {providerConfiguration}</div>
      </section>

      <section className="panel privacy-brief">
        <h2>Your meeting stays in your control</h2>
        <div className="privacy-points">
          <p><strong>1. Start manually</strong> SideNote never joins a meeting for you.</p>
          <p><strong>2. Confirm consent</strong> Use the provided notice before recording.</p>
          <p><strong>3. Keep files local</strong> Recorder manifests and transcripts stay on this device unless you choose to export them.</p>
        </div>
      </section>

      <section className="grid two" id="new-meeting">
        <div className="panel">
          <h2>New meeting</h2>
          <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Customer call, 1:1, user interview..." /></label>
          <label>Meeting goal <span className="muted">(optional)</span><input value={meetingGoal} onChange={(event) => setMeetingGoal(event.target.value)} placeholder="Decide next steps, validate a proposal..." maxLength={meetingGoalLimit} aria-describedby="meeting-goal-help meeting-goal-count" /></label>
          <p className="muted" id="meeting-goal-help">Up to 280 characters. This pre-fills the local note.</p>
          <p className="muted" id="meeting-goal-count" aria-live="polite">{meetingGoal.length}/{meetingGoalLimit} characters</p>
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
            {activeMeeting.actionItems.length > 0 && <section className="import-box" aria-labelledby="active-action-items"><h3 id="active-action-items">Action items</h3><ul>{activeMeeting.actionItems.map((item) => <li key={item.id}><label className="check"><input type="checkbox" checked={item.completed} onChange={() => toggleActiveActionItem(item.id)} /><span><strong>{item.text}</strong><br /><span className="muted">{item.owner} · {item.dueDate}</span></span></label></li>)}</ul></section>}
            <div className="actions"><label className="file-button"><FileText size={16} /> Import transcript<input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={importTranscript} /></label><button onClick={stopMeeting}><CircleStop size={16} /> Stop + summarize</button>{activeMeeting.aiSummaryMarkdown && <button onClick={() => copy(activeMeeting.aiSummaryMarkdown)}><Clipboard size={16} /> Copy AI notes</button>}</div>
          </> : <p className="muted">Start a meeting or import a recorder manifest/transcript to open the note editor.</p>}
        </div>
      </section>

      <section className="panel">
        <div className="library-head"><h2>Meeting library</h2><div className="library-controls"><label className="search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes, transcripts, actions..." /></label><label className="filter"><input type="checkbox" checked={showOpenActionsOnly} onChange={(event) => setShowOpenActionsOnly(event.target.checked)} /> Open actions</label></div></div>
        <div className="cards">{filteredMeetings.length ? filteredMeetings.map((meeting) => <article key={meeting.id} className="meeting-card"><div><h3>{meeting.title}</h3><p>{new Date(meeting.createdAt).toLocaleString()} · {meeting.template} · {formatDuration(meeting.durationSeconds)} · {formatOpenActionCount(meeting.actionItems)}</p></div><pre>{meeting.aiSummaryMarkdown || meeting.userNotesMarkdown || 'No summary yet.'}</pre><div className="actions"><button onClick={() => setActiveMeeting(meeting)}><Sparkles size={16} /> Open</button><button onClick={() => exportMarkdown(meeting)}><FileDown size={16} /> Export MD</button><button onClick={() => deleteMeeting(meeting.id)}><Trash2 size={16} /> Delete</button></div></article>) : <div className="empty-library" aria-live="polite">{meetings.length ? <><p>No local meetings match the current search or Open actions filter.</p><button onClick={clearLibraryFilters}>Clear filters</button></> : <p>No local meetings yet. Start a meeting or import a local transcript to create one.</p>}</div>}</div>
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
