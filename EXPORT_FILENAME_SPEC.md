# SideNote export filename polish

## User problem

SideNote already exports Markdown from the active note and meeting library, but raw meeting titles can produce awkward download names such as `-planning-.md` or `.md`. A local note should be easy to recognise and file immediately after export.

## Scope

- Route the existing Markdown download through one pure filename formatter.
- Produce a lowercase `.md` filename with single hyphen separators.
- Normalise common Latin accents before slugging the title.
- Remove leading and trailing separators.
- Use `sidenote-meeting.md` when the title has no filename-safe characters.
- Cap the basename at 80 characters and remove any separator exposed by truncation.

## Public seams

- `formatMeetingExportFilename(title)` returns the exact browser download filename.
- The existing `exportMarkdown(meeting)` flow assigns that result to `anchor.download`.

## Boundaries

- Keep the generated Markdown body and both existing export actions unchanged.
- Add no share API, network request, storage, account, provider, dependency, styling, billing, deployment, or store-submission change.
- Keep `LICENSE` unchanged.

## Verification

- Record a failing focused test before implementation.
- Pass focused examples for punctuation, accents, fallback, and the length cap.
- Prove the browser download path uses the formatter.
- Run every existing contract, TypeScript, production build, bundle inspection, licence check, and secret scan separately after implementation.

## Stop condition

Stop after this one export-polish slice is committed, pushed to its draft branch/PR if available, and locally verified. Do not merge or deploy.
