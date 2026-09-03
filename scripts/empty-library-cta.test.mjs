import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('empty meeting library links to the existing new-meeting form', async (context) => {
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: () => null,
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
  const emptyStateStart = html.indexOf('<div class="empty-library"');
  const emptyStateEnd = html.indexOf('</div>', emptyStateStart);

  assert.notEqual(emptyStateStart, -1, 'rendered app must include the empty library state');
  const emptyState = html.slice(emptyStateStart, emptyStateEnd);
  assert.match(emptyState, /<a\b[^>]*href="#new-meeting"[^>]*>/);
  assert.match(emptyState, /Create your first meeting note/);
  assert.match(html, /<section\b[^>]*id="new-meeting"[^>]*>/);
});
