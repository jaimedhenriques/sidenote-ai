# Separate verification review

## Standards

- Correctness: PASS locally. The formatter normalises before slugging, trims before and after truncation, and always appends one `.md` suffix.
- Readability: PASS. The filename policy is isolated behind one purpose-named function.
- Architecture: PASS. The existing export flow still owns browser download behavior; the helper owns filename policy only.
- Accessibility: unchanged. The two existing export buttons and their labels remain intact.
- Performance: PASS. Filename formatting is synchronous local string work at click time.
- Scope: PASS. No export body, filter, empty-state, style, dependency, provider, or persistence behavior changed.

## Spec

- Clean lowercase separators: PASS through direct examples.
- Common Latin accents: PASS with `Café revisão` producing `cafe-revisao.md`.
- Safe fallback: PASS with a punctuation-only title producing `sidenote-meeting.md`.
- Length cap: PASS with truncation removing the exposed trailing separator.
- Existing export paths: PASS through the App source contract and the pre-existing active-note export contract.

## Premortem

- Most likely failure: a title written entirely in a non-Latin script falls back to the generic filename, reducing recognisability.
- Hidden assumption: the first SideNote users mostly use Latin-script meeting titles.
- Preventive action: add Unicode-aware transliteration only when real user titles show that need; avoid adding a dependency speculatively.

## Verdict

- Requested local increment: PASS.
- Full Helix delivery acceptance: PARTIAL pending remote commit/PR proof, independent review, the missing delivery verifier, and deployment evidence.
