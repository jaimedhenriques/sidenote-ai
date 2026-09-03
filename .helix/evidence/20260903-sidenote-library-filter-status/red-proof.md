# RED proof

- Command: `node --test scripts/library-filter-status.test.mjs`
- Result before implementation: 0 passed, 1 failed at module load.
- Expected failure: `src/libraryStatus.ts` did not exist, so the specified count-copy boundary was absent.
- No product source was changed before this failure was captured.
