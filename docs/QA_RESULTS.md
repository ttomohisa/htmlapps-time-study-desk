# QA results — v0.2.0 First Measurement

This records the local implementation check on 2026-10-05. The associated GitHub Actions run and Draft PR #1 carry the current commit's Windows build/browser evidence; do not infer a new HEAD's CI state from this static file.

## Local evidence

Base: existing `feat/time-study-desk-v1`, upstream `b3278a74a6f0206122479a97fabb1fa2870ce087`. The exact source snapshot from run 37283275475 was used because the local environment cannot resolve GitHub for git transport. The latest template main was rechecked as `cb908779682fa315ccd0f1eb58549f6c208f36f0`; no template pipeline replacement was made.

- Node 22.16.0 on Linux: original 12 unit tests passed before edits. New tests failed before implementation. The updated full unit suite has **26 passing tests**.
- Pure tests cover first-cycle boundaries, no fifth step, integer time, atomic rejection, unfinished video-end state, phase-count limit, reversible shared-boundary edits, note/name limits, 100-operation/byte-limited differences, schema/ID/reference/state validation, exact decimal entry, signed source modification timestamps, and a valid near-limit analysis whose actual exported file must fit the same 10 MiB budget.
- Supplementary real Chromium rendering with Python Playwright: actual video input, four marks, shared-boundary edits, Undo/Redo, invalid move protection, literal HTML-like names, actual JSON download and filename, unfinished export, failed/cancelled replacement, video-end incomplete export, and Japanese/English layouts at 320/360/390/430/768/1360 px passed.
- A 320×740 top-of-page primary-button check initially reproduced a button behind the bottom tabs. Compact loaded-video layout and nearby controls fixed it; the regression is in the browser tests.
- Supplementary rendering injects a substituted source HTML into a page. It is **not** the canonical PowerShell build, direct-file startup or self-extracting validation. A test harness string-evaluation attempt hit the app's CSP; the harness was corrected to use locator assertions, without changing CSP.

A simulated hidden/visible transition exposed a disabled resume control on return. Both transition directions now refresh the capture guards; the regression checks explicit seek-back and no autoplay. This simulation is not an actual phone background-switch test.

## Canonical workflow

The existing `Time Study Desk app tests` workflow runs Windows PowerShell syntax checks, the PowerShell repository/build verification, actual-source unit tests, and generated readable/self-extracting HTML tests through `file://` in Chromium. Its artifact contains the source snapshot, generated files, environment, HTML report and screenshots. These results are separate from supplementary Linux rendering and must be checked at the final code revision.

The browser suite adds first-measurement, save, cancellation, incomplete-end and phone controls regressions. Existing source lifecycle, empty/corrupt/audio files, code injection, network API attempt/CSP, localization and layout tests remain enabled.

## Scope and rulings

T03–T04 implement v0.2.0, not later releases. Minimal close-incomplete/resume behavior is brought forward from T07 so a v0.2.0 export cannot silently invent completion at video end or on page return. Interruption, unobserved/not-performed handling and rich interval reassignment still belong to v0.4.0. Schema 1 and the supplied timing/aggregation rules are unchanged.

The supplied specification and plan are incorporated as the design baseline. Their creation-time statements are historical; this document and the commit's CI/PR record report implementation status. README/security text now describes the app instead of the starter. Review is an in-session self-review, not an independent reviewer or user acceptance test.

## Not verified / not implemented

Android/iPhone real hardware, macOS Safari, Edge, Firefox, published HTTPS hosting, actual large videos and screen-reader user testing remain unverified. Phone-size emulation and numeric upper-limit tests do not prove those paths. Mandatory real-device checks remain gates for v1.0.0.

Repeated cycles/procedure changes, exceptions, import/reconnection, autosave/conflicts, aggregate statistics and CSV are **not implemented in v0.2.0**. No release/tag, merge, or Browser Kitty site change is part of this milestone.
