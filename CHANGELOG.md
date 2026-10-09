# Changelog

App versions use Semantic Versioning; the analysis format has its own integer schema version.

## 1.0.1 — 2026-10-09 — Safe source changes and exact seeking

- Make JSON import, new-video selection and original-video reconnect share one latest-choice guard. Late reads, decoder failures and replacement confirmations cannot overwrite a newer choice; stale reconnect candidates are released.
- Distinguish genuine playback completion from a paused seek to the video end, so seeking alone never appends an incomplete boundary.
- Add a local seconds-based Go to position control with Enter support, explicit range validation and paused seeking. It never edits measured boundaries or prevents saving valid analysis data.
- Fix the missing English Save settings label and give the EN/JA switch a destination tooltip in the current UI language.
- Keep schemaVersion 1, the approved icon, local processing, export formats and existing workbench unchanged. Bump the app once from 1.0.0 to 1.0.1.

## 1.0.0 — 2026-10-09 — Release preparation

- Rebuild Japanese and English README around the PDF Organizer's practical quick-start, features, instructions, privacy/limitations and development format. Describe actual desktop workbench and phone flow rather than stale early-v0.9 layout.
- Align application, package, generated UI and test metadata at 1.0.0 while preserving independent schemaVersion 1 and the original v0.2.0 saved-analysis fixture.
- Add readable/self-extract end-to-end regression: import historical schema-1 JSON → export v1 JSON → reopen → CSV. Keep browser-local processing and the same JSON/CSV rules.
- Audit README/platform claims against actual files and CI evidence. Real mobile hardware, screen readers, other browsers and large real videos are still explicitly unverified; do not call an unperformed check "passed".
- No tag, published release, Browser Kitty main-site change or PR merge in release preparation.

## 0.9.0 — 2026-10-06 — Release Candidate

- Rework the opening hierarchy after comparison with the current PDF Pipeline Builder: concise task-oriented heading/body, `完全ローカル処理 / Fully local processing`, and a smaller 22–28px hero scale.
- Make Open analysis a readable but secondary action in the dark empty-video state, and render an explicit Help-dot circle so the question-mark punctuation is not lost by stroke rendering.
- Replace the two-column desktop desk with a wide centered single workspace; move supporting cards below it, inset Measure/Review/Results as distinct cards, and add clear spacing between measurement and record sections.
- Carry the v0.8 mobile/accessibility work into the mainline candidate, including short-phone bottom-tab clearance, keyboard/focus/background behavior, and the user-approved Time Study Desk SVG.
- Add release-candidate regressions for runtime network/CSP behavior, standalone/root relationships, hostile imported/user text, and a synthetic 1,000-cycle / 10,000-span summary.
- Keep schemaVersion 1 and the local-data boundary unchanged. Real-device, screen-reader, published-HTTPS, multi-browser and large-real-media checks remain explicit release gates.

## 0.8.0 — 2026-10-06 — Mobile / Accessibility (development)

- Refine the phone Measure / Review / Results flow with explicit controlled-panel relationships, fixed-bottom navigation clearance and scroll padding so focused controls can move above the bottom bar.
- Mark background playback suspension as a polite status message without creating a work interruption, and retain explicit resume/no-autoplay behavior.
- Complete keyboard/focus regressions for Space vs measurement actions, native text-field Undo vs project Undo, dialog focus return, Help reachability, keyboard-only saving and 200%-equivalent narrow layouts.
- Keep playback pause distinct from recorded work interruption in Japanese/English help and status copy; add a lightweight live announcement for screen changes without announcing every media-time update.
- Replace `assets/favicon.svg` with the user-approved 64×64 Time Study Desk SVG and keep the browser favicon and upper-left brand icon sourced from that exact file.
- Retain schemaVersion 1, local-only media/data handling, CSV safety and all earlier measurement/statistics/export behavior. Android/iPhone hardware, soft keyboards and screen-reader user testing remain release-candidate gates.

## 0.7.0 — 2026-10-06 — CSV / Export (development)

- Export the selected procedure as a localized time-table CSV and summary CSV, and export interval detail for either the selected procedure or the whole analysis. Each user action downloads one file only.
- Keep missing numeric values blank rather than zero, retain not-performed/unobserved/incomplete/excluded states and reasons, and emit no-span occurrence-status and between-cycle detail rows.
- Use UTF-8 BOM, CRLF, comma separators and quoted cells. Interval detail uses the fixed ASCII column order defined by the product spec.
- Prefix spreadsheet-formula-like user text with an apostrophe in CSV only; JSON and in-memory source strings remain unchanged. Keep filename sanitization and fixed output suffixes for JSON and all three CSV types.
- Add unit and browser regressions for CSV round trips, formula-like text, filenames, failed CSV preparation and one-file download behavior.
- Repair four merged-v0.6 browser tests whose selectors did not distinguish the desktop table from responsive result cards, and make connected evidence tests navigate explicitly to Results. The v0.7 PR CI is the canonical verification for those repairs.

## 0.6.0 — 2026-10-06 — Results / Review (development)

- Add a single pure `summarize(project, procedureId)` engine for count-aware cycle totals and phase statistics. Complete/included cycles form the overall population; each phase keeps its own denominator.
- Preserve not-performed, unobserved, incomplete, out-of-procedure and manually excluded states instead of treating them as zero. Manual cycle exclusion requires a reason and remains reversible.
- Add cycle elapsed mean/median/min/max, recorded-phase/interruption/unobserved means, phase means with n, a zero-origin SVG bar chart, and a step × cycle time table.
- Add numeric evidence links. Selecting a cycle total, phase value or exception range opens Review at the exact interval and seeks without autoplay. Split/rework phase evidence exposes each constituent segment; explicit range playback stops near the saved end.
- Keep results readable when the original video is detached. The video can be reconnected using the existing v0.5 checks before evidence playback.
- Add F1–F5 fixture statistics/invariant coverage plus result/evidence browser tests. CSV export remains v0.7.0 work.

## 0.5.0 — 2026-10-06 — Save / Resume (development)

- Reopen `.tsd.json` only after a 10 MiB pre-check, JSON parsing and strict schema-1 validation. Invalid, future-version or corrupt files leave the current analysis unchanged.
- Open restored/imported analysis detached from video, preserving results and edits while disabling measurement/evidence actions until the source is reconnected.
- Reconnect a local source only after metadata compatibility checks and explicit confirmation. Filename/mtime differences are warnings; size/dimensions, >100 ms duration mismatch, or a candidate shorter than recorded evidence are rejected. Metadata matching never claims file identity.
- Add browser-local IndexedDB autosave for analysis only, with a device-side default-on preference, 750 ms debounce / 5 s maximum delay, restore card, app-specific data deletion and honest unavailable/quota status.
- Use monotonically increasing saved revisions. A stale tab cannot overwrite a newer revision and keeps manual JSON export available. Clearing browser data waits for in-flight work and invalidates delayed saves so data is not resurrected.
- Preserve schemaVersion 1, the v0.2.0 compatibility fixture, video bytes outside persistent storage, the no-network runtime boundary and direct-file standalone tests. Persistence tests use the same generated HTML on a loopback-only development origin because `file://` storage is feature-detected rather than assumed.
- Add unit and browser coverage for import/reconnect, source matching, restore, disabled/unavailable autosave, clear races and multi-tab conflicts. Statistics and CSV remain later milestones.

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
