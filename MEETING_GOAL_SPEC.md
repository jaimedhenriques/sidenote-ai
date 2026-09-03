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
- Meeting-library search also includes local action-item owner and due-date
  metadata.
- Each meeting-library card shows its local action-item count with
  singular/plural copy.
- Deleting a local meeting requires confirmation; cancelling leaves its record
  and active-note state unchanged.
- The local deterministic summary renders a saved meeting goal in its own
  section and omits that section when no goal exists.
- When that dedicated goal section exists, the local summary does not repeat
  the raw goal heading in its executive summary or key points.
- The active note shows a compact local action-item panel when generated action
  items exist.
- Each action in that panel displays its existing owner and due-date metadata.
- Importing a local transcript into a new meeting carries the optional
  meeting-goal heading into that local note and resets the setup fields after
  import succeeds.
- Each active-note action item can be marked complete locally; the updated
  completed state persists through the meeting library.
- Each meeting-library card shows the number of local action items that remain
  open, with singular/plural copy.
- Markdown export appends a current local action-status section when action
  items exist, including each item’s completion state.
- The meeting library can be filtered to show only meetings with one or more
  local action items still open. Clearing that filter restores the complete
  local library.

## Out of Scope

- No recording, consent, provider, storage, account, billing, store, or
  deployment changes.
