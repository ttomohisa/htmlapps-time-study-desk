# Time Study Desk CSV format — v0.7.0

The normative rules are in [APP_SPEC.md](../APP_SPEC.md), section 12. CSV is a derived export of validated schema-1 analysis data; exporting CSV does not change the project, JSON schema, stored revision, boundaries, occurrence states or source text.

## Common encoding and download behavior

Every CSV uses UTF-8 with a BOM, comma separators and CRLF line endings. Every cell is enclosed in double quotes; embedded double quotes are doubled. Numeric seconds use `.` as the decimal separator, no thousands separator and at most six fractional digits. Missing numeric values are empty cells; a known zero is `0`.

One user action produces one file. The app does not automatically download three files or create a ZIP. The common editable base name is sanitized before the app appends one fixed suffix:

- `{base}-time-table.csv`
- `{base}-summary.csv`
- `{base}-intervals.csv`

A download-started message means the file was handed to the browser. It does not prove that a particular filesystem destination or spreadsheet application accepted it.

## Time table CSV

Scope: the selected procedure. One row represents one recorded cycle, including complete, excluded and incomplete cycles. It contains procedure ID/name, start/end conditions, cycle ID/number/status, statistics inclusion, exclusion reason, start/end, elapsed/recorded-phase/interruption/unobserved seconds, followed by two columns for every planned phase: phase seconds and phase state.

Phase seconds are blank for not-performed, unobserved/partly observed, unresolved or not-in-procedure states rather than being coerced to zero. A partly unobserved phase keeps its known recorded portion in the state text. Same-name phases are disambiguated in headers with the shortest unique ID fragment.

Headers and state labels follow the selected UI language.

## Summary CSV

Scope: the selected procedure. Rows contain overall breakdown metrics followed by phase rows. The values use the same `TsdCore.summarize(project, procedureId)` result as the on-screen Results view; CSV does not recompute a different average.

Overall rows expose `n`, mean, median, minimum and maximum for elapsed, recorded-phase, interruption and unobserved time. Phase rows expose their own `n`, mean, median, minimum and maximum plus counts for not-performed, unobserved and not-in-procedure states. Different denominators are preserved; phase means are not added together to manufacture the overall mean.

Headers and metric labels follow the selected UI language.

## Interval detail CSV

Scope is explicitly either the selected procedure (default) or the whole analysis. The header is fixed ASCII and stays in this exact order:

```text
row_type, procedure_id, cycle_id, cycle_number, cycle_status, included_in_cycle_stats, exclusion_reason, span_id, occurrence_id, phase_id, phase_name, span_kind, start_seconds, end_seconds, duration_seconds, occurrence_state, note
```

`row_type=span` records saved intervals. An occurrence with no span, such as not-performed, is retained as `row_type=occurrence-status` instead of disappearing or becoming a zero-second span. `row_type=between-cycles` records the derived gap between adjacent scoped cycles with `included_in_cycle_stats=false`; it is never assigned to either cycle. Excluded and incomplete cycles remain present with their state/reason.

Fields not applicable to a row are empty.

## Spreadsheet-formula-like user text

CSV cannot guarantee how every spreadsheet or later re-save will interpret text. For the initial exported file, the app treats user-authored strings separately from app-generated numeric seconds. If a text value begins with tab/newline controls, or after BOM/leading whitespace-control characters its first meaningful character is one of `=`, `+`, `-`, `@` or the specified full-width equivalents, the CSV representation receives a leading apostrophe before normal CSV quoting.

This transformation applies only to CSV. The original project strings remain unchanged in memory, JSON export and browser-local recovery.

## Verification scope

Automated tests parse generated CSV with an independent test parser and verify BOM/CRLF, quoting, Unicode/newlines/quotes, missing versus zero, fixed detail keys, F1 gap rows, F2 not-performed denominator behavior, F5 exclusion reasons, formula-like text and edited filenames. Manual import in Excel and a second spreadsheet application remains a release-candidate verification item unless explicitly recorded in the PR evidence.
