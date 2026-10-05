# Time Study Desk analysis JSON — schema 1

The normative model and invariants are in [APP_SPEC.md](../APP_SPEC.md), sections 9–11 and appendix B. This document describes the v0.2.0 exporter; it does not imply the import UI exists.

## Envelope

UTF-8 compact JSON, extension `.tsd.json`:

```text
format: "time-study-desk"
schemaVersion: 1
appVersion: "0.2.0"
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

A first-cycle `procedureId` is null until the first cycle is completed. Completion creates a procedure referencing the observed phase IDs without adding a new blank phase. A cycle's planned occurrences must match its procedure's phase-ID sequence. Names are editable without changing their IDs.

An `open` or `incomplete` cycle keeps its cursor. Export never turns the unfinished continuation into a measured span. The current playback position, elapsed wall time, DOM, File references, Blob URLs, video bytes, undo history and derived statistics are not serialized. Reaching the video end can record the observed portion as an incomplete span whose occurrence remains pending; it is not a measured complete step.

## Validation and byte budget

The validator rejects unknown keys (including prototype-related keys), invalid types or IDs, broken references, inconsistent states, non-increasing/out-of-range boundaries, overlapping cycles and limits. Limits include 50 phases, 20 procedures, 1,000 cycles, 10,000 spans, nesting depth 20 and 10 MiB of UTF-8 JSON. Text limits count Unicode codepoints. Compact export uses the same byte representation as validation; formatting overhead cannot make an accepted project too large to save.

Validation builds a fresh allow-listed JSON object. Commands commit only validated states. Undo/Redo applies checked differences and revalidates them; histories are bounded but never serialized.

## Export versus resume

v0.2.0 supports manual export, including work in progress, but **cannot reopen a saved file**. Import, original-video comparison/reconnection and autosave remain v0.5.0 work. Keep the original video separately; its metadata in JSON does not prove identity. A future successful import must never autoplay or start recording automatically.

Save filenames are editable and sanitized, with `.tsd.json` fixed by the app. The success notice says the download was started, not that disk persistence was verified. No upload is performed.
