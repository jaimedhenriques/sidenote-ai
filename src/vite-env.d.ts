declare module '*.css';

interface ImportMetaEnv {
  readonly VITE_SIDENOTE_TRANSCRIPTION_PROVIDER?: string;
  readonly VITE_SIDENOTE_TRANSCRIPTION_API_KEY?: string;
  readonly VITE_SIDENOTE_TRANSCRIPTION_BASE_URL?: string;
  readonly VITE_SIDENOTE_TRANSCRIPTION_MODEL?: string;
  readonly VITE_SIDENOTE_NOTES_PROVIDER?: string;
  readonly VITE_SIDENOTE_NOTES_API_KEY?: string;
  readonly VITE_SIDENOTE_NOTES_BASE_URL?: string;
  readonly VITE_SIDENOTE_NOTES_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
