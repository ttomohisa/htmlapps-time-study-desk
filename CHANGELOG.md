# Changelog

App versions use Semantic Versioning; the analysis format has its own integer schema version.

## 0.2.0 — 2026-10-05 — First Measurement (development)

- Record the first cycle with shared integer-microsecond boundaries, temporary step names and an explicit finish that creates no extra step.
- Guard capture against loading, seeking, background state, out-of-range or non-increasing positions. Keep video-end records incomplete rather than automatically complete them.
- Add atomic boundary edits, a slider alternative, editable names/notes, and difference-based Undo/Redo bounded to 100 operations / 16 MiB.
- Export compact UTF-8 `.tsd.json` using format `time-study-desk`, schema 1. Preserve unfinished cursors; exclude video bytes, Blob URLs and undo history. Use the same byte budget for validation and export.
- Preserve analysis through failed/cancelled video replacement. Reset the analysis and history only after successful confirmed replacement.
- Add Measure / Review / Results phone navigation, nearby measuring controls, keyboard guards, Japanese/English text, and explicit future-import/no-autosave notices.
- Incorporate the supplied formal specification and staged plan; replace starter README/security copy with the actual app scope.
- Add tests for first-cycle invariants, editing/history, schema validation, actual JSON downloads, cancellation, incomplete video end and phone layouts.

Still unavailable: repeated cycles/procedure editing, interruptions and missing-observation tools, analysis import/reconnection, autosave, aggregate statistics and CSV. Those retain their original later milestones. This is not a formal release.

## 0.1.0 — 2026-10-05 — Foundation / Video (development)

- Introduce local video selection, drag-and-drop, playback, seeking, speed and audio controls.
- Preserve a previous video until a replacement candidate has loaded and been confirmed; reject stale asynchronous results and release unused Blob URLs.
- Add the DOM-free time core, locked development-only test tools and Windows generated-HTML acceptance tests.
- Retain the template's readable/self-extracting build pipeline and no-network runtime boundary.

Template history remains available in Git; template version numbers are not Time Study Desk release versions.
