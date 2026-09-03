# RED proof

- Command: `node --test scripts/clear-library.test.mjs`
- Result: failed with exit 1 before implementation.
- Failure: `ERR_MODULE_NOT_FOUND` for `src/libraryClear.ts`.
- Meaning: the focused contract required a count-aware confirmation boundary that did not yet exist.
