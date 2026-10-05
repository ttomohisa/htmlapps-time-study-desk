# Security and privacy — Time Study Desk

This repository contains a static browser app. v0.3.0 is a development build, not a security certification or a formal release.

## Data boundary

A local video is held as a File reference and Blob URL. No video, filename, step name or note is uploaded. There is no backend, analytics, runtime CDN, remote font, WebRTC, worker, WASM, service worker, or update-check request in the application. Generic template helpers remain available but no external asset is configured.

The app CSP allows inline application code/styles and local media Blob URLs; `connect-src 'none'`, `worker-src 'none'`, `object-src 'none'`, `frame-src 'none'`, `base-uri 'none'`, and `form-action 'none'` restrict unused capabilities. The self-extracting loader is verified separately; it is not a reason to broaden the expanded app's permissions.

## Analysis data

Only the language preference is persisted automatically in v0.3.0. Analysis stays in memory until an explicit `.tsd.json` download. The file contains the selected video's metadata, step definitions, boundaries, notes and display settings. It contains no video bytes, local absolute path, File/DOM object, Blob URL or history. A download handoff does not prove a disk write. Local analysis files can contain sensitive names and notes and are not encrypted by this app.

Schema validation checks allowed fields, primitive types, unique IDs, references, planned step order, increasing in-range integer boundaries, cycle/occurrence states, exclusion reasons, counts, Unicode-codepoint text limits, nesting and a 10 MiB UTF-8 budget. Unknown fields are errors. The importer is **not exposed in v0.3.0**; future import must validate before replacing state.

Procedure order and conditions are immutable snapshots; old cycles keep their original references. The selected review cycle does not receive recording or video-end commands for another cycle. Procedure drafts are not applied until validated and saved.

Commands are atomic: validation failure leaves the previous model unchanged. Undo uses validated differences, not permanent duplicated project snapshots. Replacement cancellation and loading failures preserve the previous analysis. Video-end observation is incomplete until explicitly resolved. Never label partly observed time as a complete step value.

User strings go into text nodes or form values, not `innerHTML`. Names resembling HTML remain literal text. Filenames are sanitized before downloads; fixed extensions do not allow directory writes. CSV formula handling is a later requirement and is not claimed implemented here.

## Verification

Tests distinguish actual network requests from attempted network API calls and CSP violations. Blocking a requested upload with CSP would not make the privacy test pass. See the revision's Actions artifact and [QA_RESULTS](docs/QA_RESULTS.md). Real mobile devices and large real video files have not been checked; emulation and upper-limit unit tests do not establish those guarantees.

## Reporting

Do not post private video, analysis data or sensitive vulnerability details in a public issue. Contact the repository owner through a private channel or GitHub private vulnerability reporting when enabled. Include the affected commit/version, a minimal non-sensitive reproduction, expected/actual behavior, and impact. Public development dependencies are pinned in `package-lock.json`; review any dependency change rather than silently updating it.
