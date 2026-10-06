# Security and privacy — Time Study Desk

This repository contains a static browser app. v0.7.0 is a development build, not a security certification or a formal release.

## Data boundary

A local video is held as a File reference and Blob URL. No video, filename, step name or note is uploaded. There is no backend, analytics, runtime CDN, remote font, WebRTC, worker, WASM, service worker, or update-check request in the application. Generic template helpers remain available but no external asset is configured.

The app CSP allows inline application code/styles and local media Blob URLs; `connect-src 'none'`, `worker-src 'none'`, `object-src 'none'`, `frame-src 'none'`, `base-uri 'none'`, and `form-action 'none'` restrict unused capabilities. The self-extracting loader is verified separately; it is not a reason to broaden the expanded app's permissions.

## Analysis data

Language and the autosave preference are device-side settings. When autosave is enabled and IndexedDB is actually available, the app persists one validated analysis snapshot plus revision metadata in its own `time-study-desk` database. It never stores video bytes, File objects, Blob URLs or local absolute paths. Browser storage can contain sensitive filenames, step names and notes and is not described as permanent or encrypted retention. Manual `.tsd.json` download remains available independently.

Analysis import checks the file size before reading, parses JSON, then validates allow-listed fields, primitive types, unique IDs, references, planned step order, increasing in-range integer boundaries, cycle/occurrence states, exclusion reasons, counts, Unicode-codepoint text limits, nesting and a 10 MiB UTF-8 budget. Unknown fields, malformed JSON, unsupported schema versions and inconsistent references reject the whole import. The current analysis is replaced only after successful validation and, when needed, explicit confirmation.

Autosave revisions increase only after a successful IndexedDB transaction. A stale tab receives a conflict instead of overwriting a newer saved revision. App-specific browser-data deletion waits for an in-flight save, invalidates queued work and clears only this app's stores; it does not remove original videos or downloaded files. If IndexedDB is unavailable, blocked or full, a visible warning remains while manual JSON saving and measurement stay usable. `file://` persistence is feature-detected, not promised.

Procedure order and conditions are immutable snapshots; old cycles keep their original references. The selected review cycle does not receive recording or video-end commands for another cycle. Procedure drafts are not applied until validated and saved.

Commands are atomic: validation failure leaves the previous model unchanged. Undo uses validated differences, not permanent duplicated project snapshots. Replacement cancellation and loading failures preserve the previous analysis. Video-end observation is incomplete until explicitly resolved. Never label partly observed time as a complete step value.

User strings go into text nodes or form values, not `innerHTML`. Names resembling HTML remain literal text. Filenames are sanitized before downloads; fixed extensions do not allow directory writes. CSV export treats user-authored text separately from app-generated numeric fields. After BOM/leading whitespace-control inspection, text whose first meaningful character is `=`, `+`, `-`, `@` or the specified full-width equivalents, and text beginning with tab/newline controls, receives a leading apostrophe before CSV quoting. This changes only the CSV representation; JSON and in-memory source text remain unchanged. All CSV cells are quoted and embedded quotes are doubled.

## Import and source reconnection

A reopened or browser-restored analysis starts detached from video. Results and text edits remain usable, but measurement and video seeking require an explicit source reconnection. Candidate matching compares saved size/dimensions and allows at most 100,000 µs duration difference; a candidate shorter than any recorded boundary is rejected. Filename and modification-time differences are warnings only. Even compatible metadata never proves that two files are identical, so reconnection still requires confirmation and never autoplays. A rejected or cancelled candidate cannot replace the current analysis or source.

## Interval editing

Interruptions and unobserved intervals retain explicit kinds and times. A step not performed has a state but no invented zero-length work span. Reassignment and merging conserve the recorded time range and revalidate affected occurrence states. Losing complete evidence makes a step pending; it is never automatically changed to not performed. Editing a live assignment suspends recording. An explicit review finish is required after incomplete observations are resolved.

A merge that changes assignments or notes is confirmed and guarded by project identity/revision, so an old confirmation cannot apply to a replacement analysis. Reversible deletion removes only the selected cycle, not the source video or phase/procedure definitions. No-op assignment offers no Undo for earlier work.

CSV downloads are generated locally from validated analysis state. They use fixed suffixes and sanitized base filenames, never a user-supplied filesystem path. A download-handoff message does not claim disk persistence or safe behavior after arbitrary third-party re-save/reinterpretation. No CSV is uploaded.

Result statistics are derived only from validated integer boundaries and explicit states. Incomplete, not-performed, unobserved and excluded records are not coerced into zero values. Result links carry only in-memory cycle/phase identifiers and saved time ranges; selecting evidence does not upload data or autoplay the video. Derived statistics and chart values are not persisted separately in JSON or IndexedDB.

## Verification

Tests distinguish actual network requests from attempted network API calls and CSP violations. Blocking a requested upload with CSP would not make the privacy test pass. See the revision's Actions artifact and [QA_RESULTS](docs/QA_RESULTS.md). Real mobile devices and large real video files have not been checked; emulation and upper-limit unit tests do not establish those guarantees.

## Reporting

Do not post private video, analysis data or sensitive vulnerability details in a public issue. Contact the repository owner through a private channel or GitHub private vulnerability reporting when enabled. Include the affected commit/version, a minimal non-sensitive reproduction, expected/actual behavior, and impact. Public development dependencies are pinned in `package-lock.json`; review any dependency change rather than silently updating it.
