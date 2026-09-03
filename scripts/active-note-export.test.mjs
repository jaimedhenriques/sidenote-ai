import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('active note exposes the existing local Markdown export', async () => {
  const source = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const activeStart = source.indexOf('<div className="panel active">');
  const libraryStart = source.indexOf('<div className="library-head">', activeStart);

  assert.notEqual(activeStart, -1, 'App must include the active-note panel');
  assert.ok(libraryStart > activeStart, 'meeting library must follow the active-note panel');
  const activeNote = source.slice(activeStart, libraryStart);

  assert.match(activeNote, /<button onClick=\{\(\) => exportMarkdown\(activeMeeting\)\}>/);
  assert.match(activeNote, /<FileDown size=\{16\} \/> Export note/);
  assert.match(source, /<button onClick=\{\(\) => exportMarkdown\(meeting\)\}><FileDown size=\{16\} \/> Export MD<\/button>/);
  assert.doesNotMatch(activeNote, /navigator\.share|fetch\(|XMLHttpRequest/);
});
