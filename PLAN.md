# SideNote SKU 0.1.1 Increment Plan

## Objective

Create one patch-level SKU increment from `0.1.0` to `0.1.1` for SideNote AI.

## Scope

- Update version metadata for the web package, mobile package, lockfiles, and Expo application.
- Preserve `LICENSE` exactly as it exists on `main`.
- Do not change product behavior, dependencies, credentials, deployment settings, or pricing.

## Verification

1. Confirm every release version field is `0.1.1`.
2. Run the web typecheck and production build.
3. Run the mobile typecheck.
4. Have a separate QA pass review the version metadata, license integrity, and build surface.

## Stop Condition

Stop after opening one draft pull request for this increment. Do not merge or deploy.
