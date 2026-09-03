# SideNote active-note export CTA

## Goal

Let a participant download the note they are already reviewing without returning to its meeting-library card.

## User-visible behavior

- Every active note shows an `Export note` button in its existing action row.
- Selecting it downloads the active meeting through SideNote's existing local Markdown export function.
- The existing library-card `Export MD` action remains available and unchanged.

## Test seam

The focused contract isolates the active-note section in `src/App.tsx` and requires its export action to call `exportMarkdown(activeMeeting)`. A production-bundle check separately proves the new label reaches compiled output.

## Implementation boundary

- Reuse the existing `FileDown` icon, button vocabulary, and `exportMarkdown` function.
- Change `src/App.tsx` only for product behavior.
- Add no CSS, dependency, share API, provider request, storage change, account, billing, credential, recording, deployment, or licence change.
- Leave the stacked GTM pull request's hero, copy module, UI components, and styles untouched.

## Verification

1. Run `node --test scripts/active-note-export.test.mjs`.
2. Run `npm run typecheck`.
3. Run `npm run build`.
4. Inspect the generated bundle for the exact `Export note` label.
5. Confirm the branch diff keeps the library export action and protected files unchanged.

## Stop condition

Stop after this single export CTA is verified, committed, and pushed to the existing draft branch. Do not merge or deploy.
