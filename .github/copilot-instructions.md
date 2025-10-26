## Repo overview

This is a small Next.js app that auto-generates, voices, and mixes AI podcast episodes.

- Frontend: `pages/index.js` (React hooks). It orchestrates three main steps: create script -> generate TTS audio -> mix final episode.
- Server APIs: `pages/api/*` provide the core behavior:
  - `generateScript.js` — uses OpenAI to create the episode script.
  - `generateAudio.js` — calls ElevenLabs TTS and returns an audio/mpeg stream to the client.
  - `generateExtras.js` — uses OpenAI to create show notes and social snippets.
  - `mixAudio.js` — server-side FFmpeg mixing using `fluent-ffmpeg` and static assets in `public/audio/`.

## Essential facts for an AI coding agent

1. Project type & commands
   - Next.js app (see `package.json`). Dev command: `npm run dev`. Build: `npm run build`, Start: `npm run start`.

2. Key directories and files to reference
   - `pages/index.js` — orchestrator and UX for generation flow.
   - `pages/api/generateScript.js`, `generateAudio.js`, `generateExtras.js`, `mixAudio.js` — implement core server behavior. Read these before changing control flow.
   - `public/audio/` — contains mixing assets (expected files: `intro.mp3`, `segment_bg.mp3`, `ding.mp3`, `outro.mp3`). `mixAudio.js` writes/reads `final_episode.mp3` here.
   - `components/*.js` — small UI helpers; follow their patterns for props/state.

3. Dataflows & integration points
   - Script generation: frontend sends { topic } -> `/api/generateScript` -> returns JSON { script }.
   - TTS: frontend sends { script } -> `/api/generateAudio` -> returns an audio/mpeg stream (blob). The frontend currently creates an in-memory File/Blob URL; it does NOT automatically persist to disk/server.
   - Mixing: `/api/mixAudio` expects a server-side voice file at `public/audio/voice.mp3` and mixes it with assets using FFmpeg via `fluent-ffmpeg`. The mixing endpoint returns JSON { success: true, file: '/audio/final_episode.mp3' } when done.

   Important discoverable mismatch: the frontend receives the TTS audio blob but does not upload it to the server; `mixAudio.js` expects `public/audio/voice.mp3` to exist. Any changes that rely on automated mixing should either (A) persist the voice file server-side before calling `/api/mixAudio`, or (B) change `mixAudio.js` to accept an uploaded audio stream or multipart form-data.

4. Environment variables & secrets
   - `process.env.OPENAI_API_KEY` used by OpenAI calls (`generateScript.js`, `generateExtras.js`).
   - `process.env.ELEVENLABS_API_KEY` used by ElevenLabs in `generateAudio.js`.
   - Don't hardcode keys — keep them in env or deployment secrets.

5. FFmpeg & audio mixing specifics
   - `mixAudio.js` uses `fluent-ffmpeg` and a complex filter: it raises AI voice (`volume=1.2`), lowers background (`volume=0.2`), then `amix=inputs=4:duration=longest` to combine intro, voice, bg, outro.
   - Paths are built using `process.cwd()` -> `public/audio`. Use that same convention when adding/removing files.

6. Conventions and patterns to follow
   - API handlers return JSON for status and errors except `generateAudio.js`, which streams audio/mpeg directly.
   - Keep changes minimal and reference existing files for examples:
     - Use `res.status(...).json(...)` for error responses in API files.
     - When adding server-side file writes, use `process.cwd()` + `public/audio` like `mixAudio.js`.

7. Bug/edge hints observed (useful to surface)
   - Mismatch between TTS flow and mixing (see section 3). If you implement persistent saving of TTS audio, ensure the file is named `voice.mp3` in `public/audio/` or update `mixAudio.js` accordingly.
   - Different OpenAI invocation styles appear in `generateExtras.js` vs `generateScript.js`. Prefer reading the file you edit and keeping the same style unless upgrading the SDK.

8. Quick examples to copy from the repo
   - Mixing filter snippet (from `mixAudio.js`):
     - "[1]volume=1.2[aivoice]", "[2]volume=0.2[bg]", "[0][aivoice][bg][3]amix=inputs=4:duration=longest[out]"
   - TTS headers (from `generateAudio.js`): include `xi-api-key: process.env.ELEVENLABS_API_KEY` and send JSON body { text, voice_settings }.

## When editing, prefer small, incremental changes
- If you change the audio flow, wire a new API endpoint (e.g., `/api/uploadVoice`) that writes `public/audio/voice.mp3` and update the frontend to POST the blob there before calling `/api/mixAudio`.
- If you update OpenAI usages, update all API files consistently and test locally with `npm run dev`.

## What to ask the maintainer if unclear
- Should TTS blobs be persisted server-side automatically, or do you prefer manual uploads? (current code expects manual persistence.)
- Are there preferred voice IDs or other ElevenLabs constraints to encode as constants?

---
If anything in this file is unclear or you'd like the doc to include additional examples (unit tests, sample env file, or a small upload endpoint), tell me what to add and I will iterate.
