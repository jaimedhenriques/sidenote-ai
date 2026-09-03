# SideNote empty-library CTA

## Goal

Give a first-time SideNote user one direct path from the empty meeting library to the existing consent-first meeting form.

## User-visible behavior

- When no local meetings exist, the library keeps its current explanation.
- The same empty state includes a link labelled `Create your first meeting note`.
- The link targets `#new-meeting`, the existing form on the page.
- Search or Open actions filters that hide saved meetings continue to show the existing `Clear filters` recovery action instead.

## Public test seam

Render `App` with empty local storage through Vite's existing React transform and inspect the returned HTML. The contract must fail if the empty-library link or its exact target disappears.

## Implementation boundary

- Reuse the existing `primary hero-cta` classes and `Play` icon.
- Change `src/App.tsx` only for product behavior.
- Add no style, package, lockfile, provider, storage, account, billing, credential, recording, deployment, or licence change.
- Keep the open pull request's hero/GTM files untouched.

## Verification

1. Run the persistent DOM contract with `node --test scripts/empty-library-cta.test.mjs`.
2. Run `npm run typecheck`.
3. Run `npm run build`.
4. Inspect the generated production bundle for the exact empty-state copy and `#new-meeting` target.
5. Confirm `LICENSE` retains its baseline SHA-256 and protected package files are unchanged.

## Stop condition

Stop after this single empty-library CTA is verified and committed on the existing feature branch. Do not merge or deploy.
