# SideNote increment: landing-hero quota GTM

## Objective

Ship one bounded MVP+GTM slice on the landing hero: hosted AI notes monthly quota vs local SideNote, with the vendored `jaimedhenriques/ui` Button on the existing hero CTA. Keep LICENSE. No new spend.

## Scope

- Add `SIDENOTE_GTM` copy for the quota line and free-local pricing note.
- Vendor kit `button.tsx` plus MIT `LICENSE.md` / `SOURCE.md` / `utils.ts` from pin `63c1308d112b6b1205d86244a156cca1abef5087`.
- Replace only the landing-hero CTA `<a className="primary hero-cta">` with kit `Button` keeping `.primary.hero-cta` CSS (Tailwind classes are inert; do not add Tailwind).
- CTA still targets `#new-meeting`.
- Do not convert other buttons, add a $10 hosted SKU, mention Copilot/Fitch, change accounts, deploy, or merge.

## Verification

1. Root `LICENSE` SHA-256 stays `1f7b21edb5e5810a5d2ae405ecd1882d67f410e4c2a2245e93e9de48112e5da6`.
2. Isolated Node assertions in `scripts/sidenote_quota_gtm_ok.mjs` pass.
3. `npm run typecheck` and `npm run build` pass.
4. Independent checker reviews this increment only.

## Stop condition

Open one draft PR stacked on `feat/sidenote-meeting-goal` (PR 15). Do not merge, deploy, submit to a store, or start paid services.
