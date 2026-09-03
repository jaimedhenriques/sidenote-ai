import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { formatMeetingExportFilename } from '../src/exportFilename.ts';

test('Markdown exports receive a readable, safe filename', () => {
  assert.equal(formatMeetingExportFilename('Q3 Roadmap / ACME?'), 'q3-roadmap-acme.md');
  assert.equal(formatMeetingExportFilename('  Café revisão  '), 'cafe-revisao.md');
  assert.equal(formatMeetingExportFilename('!!!'), 'sidenote-meeting.md');
});

test('export filenames cap the basename without a trailing separator', () => {
  assert.equal(formatMeetingExportFilename(`${'a'.repeat(79)} meeting`), `${'a'.repeat(79)}.md`);
});

test('the existing browser download uses the shared filename formatter', async () => {
  const source = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');

  assert.match(source, /anchor\.download = formatMeetingExportFilename\(meeting\.title\);/);
  assert.match(source, /<FileDown size=\{16\} \/> Export note/);
  assert.match(source, /<FileDown size=\{16\} \/> Export MD/);
  assert.doesNotMatch(source, /navigator\.share|fetch\(|XMLHttpRequest/);
});
