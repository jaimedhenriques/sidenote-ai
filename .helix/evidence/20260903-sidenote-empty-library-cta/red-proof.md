# RED proof

- Command: `node --test scripts/empty-library-cta.test.mjs`
- Result before the product edit: 0 passed, 1 failed.
- Expected failure: the rendered empty-library markup did not contain an anchor targeting `#new-meeting`.
- The failure occurred at the public rendered-markup seam rather than a private component helper.
