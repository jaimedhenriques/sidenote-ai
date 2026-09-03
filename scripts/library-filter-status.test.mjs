import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { formatLibraryResultCount } from '../src/libraryStatus.ts';

test('library result count describes total and filtered meetings', () => {
  assert.equal(formatLibraryResultCount(1, 1, false), '1 local meeting.');
  assert.equal(formatLibraryResultCount(4, 4, false), '4 local meetings.');
  assert.equal(formatLibraryResultCount(2, 4, true), 'Showing 2 of 4 local meetings.');
  assert.equal(formatLibraryResultCount(0, 1, true), 'Showing 0 of 1 local meeting.');
});

test('App wires status and reset without changing zero-result recovery', async () => {
  const source = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const libraryStart = source.indexOf('<div className="library-head">');
  const libraryEnd = source.indexOf('</section>', libraryStart);

  assert.notEqual(libraryStart, -1, 'App must include the meeting-library header');
  assert.ok(libraryEnd > libraryStart, 'meeting-library section must close');
  const library = source.slice(libraryStart, libraryEnd);

  assert.match(library, /formatLibraryResultCount\(filteredMeetings\.length, meetings\.length, libraryFiltersActive\)/);
  assert.match(library, /role="status"/);
  assert.match(library, /libraryFiltersActive && filteredMeetings\.length > 0 && <button onClick=\{clearLibraryFilters\}>Clear filters<\/button>/);
  assert.match(library, /No local meetings match the current search or Open actions filter\.<\/p><button onClick=\{clearLibraryFilters\}>Clear filters<\/button>/);
});

test('non-empty library renders its local meeting count', async (context) => {
  const meetings = ['Client review', 'Team sync'].map((title, index) => ({
    id: `meeting-${index}`,
    title,
    template: 'general',
    startedAt: '2026-09-03T08:00:00.000Z',
    endedAt: '2026-09-03T08:01:00.000Z',
    durationSeconds: 60,
    consentConfirmed: true,
    userNotesMarkdown: '',
    transcriptText: '',
    aiSummaryMarkdown: '',
    actionItems: [],
    audioDeleted: true,
    createdAt: `2026-09-03T08:0${index}:00.000Z`,
    updatedAt: `2026-09-03T08:0${index}:00.000Z`,
  }));
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: () => JSON.stringify(meetings),
        setItem: () => undefined,
      },
    },
  });
  context.after(() => {
    if (windowDescriptor) Object.defineProperty(globalThis, 'window', windowDescriptor);
    else delete globalThis.window;
  });

  const vite = await createServer({
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  });
  context.after(() => vite.close());

  const { App } = await vite.ssrLoadModule('/src/App.tsx');
  const html = renderToStaticMarkup(React.createElement(App));

  assert.match(html, /<p class="muted" role="status" aria-atomic="true">2 local meetings\.<\/p>/);
  assert.match(html, /Client review/);
  assert.match(html, /Team sync/);
});
