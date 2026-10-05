# Changelog

App versions use Semantic Versioning; the analysis format has its own integer schema version.

## 0.4.0 — 2026-10-06 — Exceptions / Editing (development)

- Record and resume interruptions/unobserved intervals with shared integer boundaries. Preserve known portions and the same step occurrence across an interruption.
- Distinguish not performed from zero seconds. Keep video-end and final-skip observations incomplete until explicitly resolved and finished.
- Add step-state review, interval splitting, adjacent merging, reassignment, one-cycle extras/rework, and cycle deletion with Undo.
- Conserve total time and revalidate evidence after edits. Orphaned or reinterpreted evidence becomes pending instead of silently inventing completeness.
- Confirm changes when merging different assignments/notes; guard stale confirmations. Preserve old procedures and schema-1 saved data.
- Add Japanese/English compact exception controls and scrollable review panels. Fix no-op assignment offering an unrelated Undo and report interval-note limits accurately.
- Expand unit and generated-HTML workflow/privacy tests. JSON import, autosave, statistics and CSV remain later milestones.

## 0.3.0 — 2026-10-05 — Repeat / Procedure (development)

- Repeat an existing procedure without re-entering names. Start and finish each cycle explicitly; the final step uses Finish rather than creating another step or cycle.
- List cycles chronologically with separate gap durations. Guard overlapping starts, expanding intervals and simultaneous open cycles. Separate the currently recording cycle from the selected review cycle, including at video end.
- Preserve historical procedures when changing order or start/end conditions. Rename shared phases without replacing their IDs; register/classify/archive phases without deleting observations.
- Add a transactional procedure editor with keyboard-accessible order controls, cancellation, Unicode limits and Japanese/English phone layouts. Known initial step names can be entered on separate lines as one reversible edit.
- Preserve schema 1 and the v0.2.0 saved-data fixture. Exclude display selection from Undo while repairing references if their procedure is undone.
- Close a stale procedure draft only after confirmed successful video replacement; cancellation keeps both analysis and draft.
- Expand unit, generated-HTML browser, privacy and screenshot coverage. Import, autosave, aggregate statistics and CSV are still not available.

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
