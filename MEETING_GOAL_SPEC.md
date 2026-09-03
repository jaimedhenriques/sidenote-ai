# Meeting Goal Slice

## Objective

Let a meeting owner state an optional goal before a consent-gated note starts.

## Behavior

- The new-meeting form includes one optional meeting-goal input.
- The meeting-goal input accepts up to 280 characters and explains that it
  pre-fills the local note.
- A local character counter shows the current goal length against the
  280-character limit while the owner types.
- Starting a meeting carries that goal into the active note as a Markdown
  heading.
- Starting without a goal keeps the note blank.
- Starting a meeting clears the new-meeting title and goal fields after the
  title is stored in the meeting record and the optional goal is copied into
  the active note, so neither can carry into the next one.
- The goal is stored with the local meeting record and introduces no new
  external request.
- Markdown export preserves the local note, including its meeting goal, before
  an available AI summary.
- Meeting-library search includes local owner notes, so a saved meeting goal
  can be found without an external index.
- Meeting-library search includes local action-item text, even when an AI
  summary does not repeat it.
- The local deterministic summary renders a saved meeting goal in its own
  section and omits that section when no goal exists.
- When that dedicated goal section exists, the local summary does not repeat
  the raw goal heading in its executive summary or key points.
- The active note shows a compact local action-item panel when generated action
  items exist.

## Out of Scope

- No recording, consent, provider, storage, account, billing, store, or
  deployment changes.
