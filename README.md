# SideNote AI

Consent-first AI meeting notes from your own Mac — no meeting bots.

SideNote AI is a Granola-style competitor MVP for founders/operators who want private meeting notes without a bot joining Zoom, Teams, Meet, Slack Huddles, or FaceTime.

## Safety boundary

SideNote is designed for lawful user-side capture only:

- The user must be a participant in the meeting.
- The user must notify participants and obtain consent where required.
- The product must not be marketed as stealth recording.
- The product does not bypass Zoom/Teams/Meet controls.
- The product does not join meetings as a bot.
- Temporary audio is deleted after transcription by default.

## Repo structure

```text
apps/sidenote-ai/
  src/                         React TypeScript MVP
  macos/SideNoteRecorder/      Swift macOS recorder companion scaffold
  docs/                        implementation, app-store, Android docs
  scripts/                     local verification scripts
```

## Run the web MVP

```bash
cd /Users/jaimehenriques/Helix-Labs/apps/sidenote-ai
npm install
npm run typecheck
npm run build
npm run dev
```

Open: http://127.0.0.1:4397

## Mac companion goal

The Mac companion captures local audio from the user's own Mac:

- Microphone: local speaker via AVAudioEngine.
- System audio: meeting participants via ScreenCaptureKit where available.
- Fallback: documented BlackHole virtual audio routing when system audio capture is not available.

The MVP web app currently supports notes, consent flow, transcript paste/import, local AI-style summary generation, action items, export, and local storage. The Swift companion scaffold documents and starts the native capture path.

## 48-hour acceptance criteria

- Consent-first onboarding/recording flow.
- Meeting library and search.
- Notes + transcript + generated summary/action items/follow-up.
- Mac recorder companion source scaffold with permissions and capture architecture.
- Apple Developer and Android/Google Play submission docs.
- Build/typecheck passes.

## Hard gates

Do not submit to App Store/Google Play, publish public builds, start paid services, change accounts/credentials, or collect real user data without Jaime approval.
