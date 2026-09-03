# SideNote clear-library confirmation

## User problem

SideNote can delete one meeting at a time, but its full-library reset function is unfinished and has no committed control. A filtered library also makes a generic bulk-delete warning ambiguous because some local meetings are hidden.

## Scope

- Show one `Clear all meetings` action only when the local library contains meetings.
- Place the action beside the existing visible/total library summary, outside the search-control cluster.
- Keep the browser-native confirmation pattern already used for single-meeting deletion.
- State the total number of local meetings in the prompt, with correct singular and plural copy.
- On confirmation, clear meetings, the active note, search text, and the Open actions filter.
- On cancellation, change nothing.

## Public seams

- `confirmClearMeetingLibrary(totalMeetings, confirm)` returns the browser confirmation result and supplies the exact count-aware prompt to the confirmation boundary.
- Server-rendered `App` markup exposes the destructive action for a non-empty library and omits it for an empty library.
- The App clear handler uses the total `meetings.length` and resets all library-selection/filter state only after confirmation succeeds.

## Boundaries

- Keep the existing library empty-state copy, per-meeting delete flow, export paths, search behavior, and Open actions semantics unchanged.
- Add no custom modal, CSS, dependency, network request, storage schema, account, provider, billing, deployment, or store-submission change.
- Keep `LICENSE` unchanged.

## Verification

- Record a failing focused contract before implementation.
- Pass count-aware singular/plural and cancel/confirm boundary assertions.
- Render both empty and non-empty library states.
- Run every existing contract, TypeScript, production build, bundle inspection, licence check, and secret scan separately after implementation.

## Stop condition

Stop after this one clear-library slice is committed, pushed to its draft branch/PR, and locally verified. Do not merge or deploy.
