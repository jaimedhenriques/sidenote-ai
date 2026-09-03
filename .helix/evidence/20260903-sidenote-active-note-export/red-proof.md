# RED proof

- Command: `node --test scripts/active-note-export.test.mjs`
- Result before the App edit: 0 passed, 1 failed.
- Expected failure: the active-note action row did not call `exportMarkdown(activeMeeting)`.
- The existing library-card `Export MD` assertion passed independently of the missing active-note action.
