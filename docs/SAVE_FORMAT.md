# Time Study Desk analysis JSON — schema 1

The normative model and invariants are in [APP_SPEC.md](../APP_SPEC.md), sections 9–11 and appendix B. This document describes the v1.0.0 exporter/importer, browser-local recovery, derived-results and CSV-export behavior.

## Envelope

UTF-8 compact JSON, extension `.tsd.json`:

```text
format: "time-study-desk"
schemaVersion: 1
appVersion: "1.0.0"
projectId, createdAt, updatedAt, title, note
source: { name, size, lastModified, durationUs, width, height }
phases: []
procedures: []
cycles: []
settings: { language, selectedProcedureId, outputBaseName }
```

All listed fields are present even before the first measurement. The app version and schema version are independent. The v0.2.0 schema-1 fixture in `tests/fixtures/v0.2.0-first-cycle.tsd.json` is retained for future import compatibility tests. The fixture is artificial and uses deterministic IDs.

## Time and boundaries

Time is a non-negative safe integer in microseconds, obtained by rounding the video position multiplied by 1,000,000. This representation does not assert microsecond measurement accuracy. Every `spans[i]` lies between `boundaries[i]` and `boundaries[i+1]`; the boundary array has one more entry than the span array. Boundaries are strictly increasing and within the saved video duration.

For free initial measurement, `procedureId` is null until the first cycle is completed. With predefined step names, the procedure already exists before measurement begins. Completion creates a procedure referencing the observed phase IDs without adding a new blank phase. A cycle's planned occurrences must match its procedure's phase-ID sequence. Names are editable without changing their IDs.

An `open` or `incomplete` cycle keeps its cursor. Export never turns the unfinished continuation into a measured span. The current playback position, elapsed wall time, DOM, File references, Blob URLs, video bytes, undo history and derived statistics are not serialized. Reaching the video end can record the observed portion as an incomplete span whose occurrence remains pending; it is not a measured complete step.

## Validation and byte budget

The validator rejects unknown keys (including prototype-related keys), invalid types or IDs, broken references, inconsistent states, non-increasing/out-of-range boundaries, overlapping cycles and limits. Limits include 50 phases, 20 procedures, 1,000 cycles, 10,000 spans, nesting depth 20 and 10 MiB of UTF-8 JSON. Text limits count Unicode codepoints. Compact export uses the same byte representation as validation; formatting overhead cannot make an accepted project too large to save.

Validation builds a fresh allow-listed JSON object. Commands commit only validated states. Undo/Redo applies checked differences and revalidates them; histories are bounded but never serialized.

## Export, import and source reconnection

v1.0.0 can reopen schema-1 `.tsd.json`. It checks the raw file size before reading, then parses and validates the full allow-listed object. Malformed JSON, unsupported schema versions, unknown fields, invalid references/states, or values beyond the existing limits reject the whole import and leave the current analysis unchanged. Import never executes embedded text or treats JSON as HTML.

A successful import opens detached from video. Measurement and evidence seeking remain unavailable until the source is explicitly reconnected. The app compares saved metadata against the candidate: size and dimensions must match, duration difference must be at most 100,000 µs, and the candidate must reach every recorded boundary. Filename/mtime changes are warnings. A metadata match is not proof of identity and always requires confirmation. Reconnection never autoplays or rewrites saved times.

Save filenames are editable and sanitized, with `.tsd.json` fixed by the app. The success notice says the download was started, not that disk persistence was verified. No upload is performed.

## Browser-local autosave

When enabled and available, IndexedDB database `time-study-desk` stores one analysis recovery snapshot in `snapshots` and recovery/revision metadata in `meta`. Video bytes and runtime objects are never stored. The preference is device-side and defaults on; an imported JSON file cannot silently change it. Confirmed edits are queued after 750 ms and continuous edits force an attempt within five seconds.

Each stored project has a monotonically increasing revision. `save(project, expectedRevision)` checks the expected revision in the same transaction; a mismatch returns a conflict and does not overwrite the newer snapshot. A success status is shown only after transaction completion. Storage unavailable/quota/conflict states remain visible while manual JSON export remains usable.

The restore card never automatically replaces a new session's state. Browser-data deletion clears only this app's stores. Pending timers are invalidated and any in-flight save is awaited before clear so an older queued write cannot recreate deleted recovery data. `file://` storage behavior is not assumed; the app probes the environment and falls back to manual JSON saving when persistence is unavailable.

## v1.0.0 derived results and CSV

The file schema is unchanged. Counts, means, medians, minima/maxima, phase denominators, cycle table values, chart geometry and evidence selections are derived from validated `cycles`, `boundaries`, `spans`, `occurrences`, `phases` and `procedures`; these derived values are **not serialized**.

A summary is scoped to one procedure. Overall statistics include only complete, non-excluded cycles. Phase statistics use their own subset of those cycles where the phase value is fully determined. Not-performed, unobserved, pending/incomplete and not-in-procedure states remain states rather than zero values. A reason is required when a complete cycle is manually excluded, and the row remains saved.

Evidence navigation stores no extra media payload. It derives exact interval start/end times from saved integer boundaries. Aggregate phase evidence may contain multiple constituent phase segments around interruption/rework; the UI exposes those segments rather than implying one continuous clip. Selecting a result never autoplays.

CSV is another derived view of the same schema-1 data and is not part of the JSON envelope. Time-table and summary CSV are scoped to the selected procedure. Interval detail can be scoped to the selected procedure or the whole analysis. Missing numeric values stay blank, state-only occurrences remain explicit rows, and between-cycle gaps are derived rather than added to cycle time. CSV safety transformations apply only to the exported text representation; they never rewrite the schema-1 project. See [CSV_FORMAT.md](CSV_FORMAT.md).

## v0.3.0 repeated-cycle behavior

New cycles copy a procedure's phase-ID order into new planned occurrences, retaining phase identities but not reusing occurrence IDs. Historical procedure IDs, phase order and start/end conditions remain unchanged when a new procedure is created. Display-name corrections do not change those structural fields.

Each observation has explicit start/end boundaries. Chronological numbers and between-cycle gaps are derived, not persisted, and gaps are not added to a cycle's duration. Overlapping observations and concurrent open cycles are rejected. Review selection never changes the recording target.

Initial multiline names are one atomic creation operation. Display language and selected procedure are not part of history; Undo repairs a selected-procedure reference only if its target no longer exists. All existing schema-1 invariants and the original v0.2.0 fixture are retained and are import-regression inputs.


## v0.4.0 exceptions and review

No field or schema version changed. Span kinds are `phase`, `interruption` and `unobserved`; occurrence states are `pending`, `measured`, `not-performed` and `unobserved`. Interrupted work resumes the same occurrence. Partially observed work keeps its known phase spans, with `resolution: unobserved`, rather than claiming a full measured duration.

Not-performed occurrences have no phase/unobserved spans and no invented zero-time boundary. Skipping the final occurrence keeps the cycle incomplete until explicit finish. When all occurrences are resolved but finish has not been confirmed, the existing schema-1 cursor can be neutral `{kind:"unobserved",occurrenceId:null,note:""}` at the last confirmed boundary. This cursor is not a timed span; it is not included in the breakdown and cannot be resumed as an inferred step.

`closeIncomplete` records the observed continuation using its actual kind, including interruption/unobserved. Explicit state review can then resolve remaining occurrences and finish at the same final boundary. It does not add a zero-duration span. An unknown span may be unassigned (`occurrenceId: null`); affected occurrences still require their own explicit review.

Split and merge retain the overall range. Reassignment that removes evidence does not guess a replacement state: a measured occurrence with no phase evidence, or one whose last unobserved evidence was reinterpreted, becomes pending. Completed cycles with unresolved occurrences become incomplete. Reviewing live assignments/states suspends that cycle; recording never continues invisibly.

One-cycle extra/rework occurrences use `planned: false`; the procedure's planned phase sequence remains unchanged. Deleting a cycle preserves phase/procedure definitions. All of these changes are reversible using the existing bounded difference history. History is still not serialized.
