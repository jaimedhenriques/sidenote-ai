#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm install
npm run typecheck
npm run build
if command -v swift >/dev/null 2>&1; then
  (cd macos/SideNoteRecorder && swift build)
fi
