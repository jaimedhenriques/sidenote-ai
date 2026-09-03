# SideNote library filter status

## Goal

Show how search and the Open actions filter change the visible local meeting set, and let users reset filters before the result set becomes empty.

## User-visible behavior

- A non-empty unfiltered library shows its saved local meeting count.
- Active search or Open actions filtering shows `Showing X of Y local meetings.`
- Singular copy uses `meeting` when the total is 1.
- When active filters still return at least 1 meeting, `Clear filters` appears with the search controls.
- When filters return zero meetings, the existing no-results state remains responsible for the reset action.

## Test seam

`formatLibraryResultCount` is the copy boundary for total and filtered counts. The focused contract tests its visible strings at 1, many, and zero-visible boundaries, then checks that `App` wires the status and non-empty reset condition into the library surface.

## Implementation boundary

- Add one small pure formatter and use existing `muted`, `library-controls`, and button styles.
- Change no empty-state copy, CSS, dependency, remote search, storage, account, provider, billing, credential, recording, deployment, or licence behavior.
- Leave the stacked GTM pull request's hero, copy module, UI components, and styles untouched.

## Verification

1. Run `node --test scripts/library-filter-status.test.mjs`.
2. Run the existing empty-library and active-note export contracts.
3. Run `npm run typecheck` and `npm run build`.
4. Inspect the compiled bundle for the exact filtered-count copy and existing empty-state recovery copy.
5. Confirm protected files and the existing empty-state copy are unchanged.

## Stop condition

Stop after this single library/search increment is verified, committed, and pushed to the existing draft branch. Do not merge or deploy.
