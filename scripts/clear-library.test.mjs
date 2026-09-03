import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

import { confirmClearMeetingLibrary } from '../src/libraryClear.ts';

test('clear-library confirmation states total local scope and preserves cancellation', () => {
  const prompts = [];

  assert.equal(confirmClearMeetingLibrary(1, (message) => {
    prompts.push(message);
    return false;
  }), false);
  assert.equal(confirmClearMeetingLibrary(3, (message) => {
    prompts.push(message);
    return true;
  }), true);
  assert.deepEqual(prompts, [
    'Delete 1 local meeting and its notes? This cannot be undone.',
    'Delete all 3 local meetings and their notes? This cannot be undone.',
  ]);
});

test('App clears library and filter state only after count-aware confirmation', async () => {
  const source = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const handlerStart = source.indexOf('function clearAllMeetings()');
  const handlerEnd = source.indexOf('\n}', handlerStart);

  assert.notEqual(handlerStart, -1, 'App must include the clear-library handler');
  assert.ok(handlerEnd > handlerStart, 'clear-library handler must close');
  const handler = source.slice(handlerStart, handlerEnd);

  assert.match(handler, /if \(!confirmClearMeetingLibrary\(meetings\.length, \(message\) => window\.confirm\(message\)\)\) return;/);
  assert.match(handler, /setMeetings\(\[\]\);/);
  assert.match(handler, /setActiveMeeting\(null\);/);
  assert.match(handler, /clearLibraryFilters\(\);/);
});

test('populated library renders one clear action and empty library renders none', async (context) => {
  const meetings = [
    {
      id: 'meeting-1',
      title: 'Client review',
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
      createdAt: '2026-09-03T08:00:00.000Z',
      updatedAt: '2026-09-03T08:01:00.000Z',
    },
  ];
  let storedMeetings = JSON.stringify(meetings);
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: () => storedMeetings,
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
  const populatedHtml = renderToStaticMarkup(React.createElement(App));
  assert.equal(populatedHtml.match(/Clear all meetings/g)?.length, 1);

  storedMeetings = null;
  const emptyHtml = renderToStaticMarkup(React.createElement(App));
  assert.doesNotMatch(emptyHtml, /Clear all meetings/);
});
