# RED proof

- Command: `node --test scripts/export-filename.test.mjs`
- Result: failed with exit 1 before implementation.
- Failure: `ERR_MODULE_NOT_FOUND` for `src/exportFilename.ts`.
- Meaning: the focused contract required a filename formatter that did not yet exist.
