# QA results — v1.0.0 release preparation

## Current milestone — v1.0.0

- Base: merged main `84e0461395d78d8f9d6472587965fca58735921c`; source tree verified byte-identical to the previously tested v0.9.0 head.
- Local baseline on Node 22.16.0: **79/79 unit tests passed** before version changes.
- Release regression added for both standalone variants: v0.2.0 schema-1 JSON import → v1.0.0 export → reimport → time-table CSV, without attaching video. Earlier unit schema-1 fixture checks are retained.
- README Japanese/English is reorganized using the current PDF Organizer README as a structural reference, without copying product-specific claims.
- Version/metadata, readable and self-extract builds, CSP, favicon, generated root copy, keyboard/mobile workflow, CSV and network controls must be confirmed for the new v1.0.0 HEAD by GitHub Actions; **results are pending until that workflow succeeds**.
- Release criterion still not satisfied on real hardware: Android/iPhone, physical soft keyboards, VoiceOver/TalkBack/NVDA, Safari/Firefox/Edge, large real video, initial spreadsheet-import programs and published HTTPS interactions are **not yet verified**. Record them as remaining release checks, not as passed.
- No application tag/release/Pages publishing, Browser Kitty main-site update or PR merge is performed by this branch.

---

# Historical QA results — v0.9.0 Release Candidate

## Current milestone — v0.9.0

This candidate carries forward the validated v0.8 mobile/accessibility work, adopts the user-provided Time Study Desk SVG as the favicon/brand source, and adds the UI hierarchy/layout pass plus T17/T18 automated coverage. Canonical Windows generated-HTML results are recorded in the v0.9 Draft PR after it runs; do not infer success before that run completes.

### Local checks completed before PR CI

- Actual-source unit suite: **79 passing, 0 failed/skipped** on Node 22.16.0.
- Synthetic scale regression validates **1,000 cycles / 10,000 spans** and summarizes all records without truncation; the observed local runtime is test-runner evidence only, not a general performance guarantee.
- User-provided favicon bytes are retained exactly (SHA-256 `f29a9790b5a9272b065bd13dcf59d9d4da5fc29bf7430c3881670d63e1766f45`).
- New generated-HTML tests cover the revised hero/local-processing copy, secondary saved-analysis action, wide centered desktop workspace, explicit Help dot, runtime network/CSP observation, hostile text/import handling, and readable/self-extract/root relationships.
- Real Android/iPhone, screen readers, published HTTPS, Safari/Firefox/Edge and large real video files remain **unverified**.

---

# Historical QA results — v0.8.0 Mobile / Accessibility

## Current milestone — v0.8.0

Scope: T15–T16. The v0.8 work is stacked on the verified v0.7 branch until v0.7 is merged. It preserves schema 1, measurement/statistics/CSV behavior and the local-only runtime boundary.

### Local evidence

- Node 22.16.0: actual-source unit suite **78/78 passed** after adding an exact approved-icon regression.
- New browser regressions cover phone primary-control clearance, safe scrolling above the fixed bottom navigation, background pause without synthetic interruption, Space-vs-measurement separation, text Undo vs project Undo, Help/dialog focus return, controlled mobile panels, keyboard-only save reachability and 200%-equivalent narrow rendering.
- Supplementary Chromium with Japanese locale passed the new v0.8 status/navigation/icon assertions at 320×568, including no page horizontal overflow and no page errors. This supplementary in-memory rendering is not the canonical generated-HTML CI.
- The user-provided `Time Study Desk_light_optimized.svg` is used byte-for-byte as `assets/favicon.svg`; its SHA-256 is `f29a9790b5a9272b065bd13dcf59d9d4da5fc29bf7430c3881670d63e1766f45`. The build uses the same source for favicon and the upper-left brand image.

### Explicit limits

Android/iPhone hardware, soft keyboards, screen-reader user testing, Safari/Firefox/Edge, published HTTPS, large real media and release-scale performance remain unverified. 320–430px/short-landscape/zoom automation does not establish real-device accessibility conformance. Canonical Windows generated-HTML results and artifacts belong to the v0.8 Draft PR CI once created.

---

## Historical QA results — v0.7.0 CSV / Export

## Current milestone — v0.7.0 CSV / Export

Base: merged main `add3cf7eb5480d6f6625b0f1a26cbddc9700286a`. The v0.7 branch starts from that exact commit.

### Important inherited finding

PR #5 was merged with its standalone build green and unit suite green, but its final Windows app-test workflow had **4 Chromium E2E failures**. The failures were in the newly added Results/evidence tests: responsive desktop-table and phone-card renderings shared data attributes, so broad Playwright selectors matched both; the connected-evidence test also attempted to click a Results value while the desktop workspace was still on Review. Summary mathematics were not failing. v0.7 narrows those tests to the desktop table and explicitly switches to Results before evidence interaction. These repairs must pass in the v0.7 canonical CI and are not retroactively reported as a v0.6 pass.

### T13–T14 local evidence

- Node 22.16.0: full actual-source unit suite **75 passed, 0 failed, 0 skipped** after CSV implementation and v0.7 version alignment.
- New unit coverage verifies UTF-8 BOM, CRLF, all-cell quoting, independent CSV parsing, Unicode/newlines/quotes, blank versus real zero, F1 between-cycle gaps, F2 not-performed status/denominator, F5 exclusion reason, fixed ASCII interval-detail keys and occurrence-status rows.
- Spreadsheet-formula-like text (`=`, spaced `@`, full-width symbols, leading tab/newline class) is prefixed in CSV only; original project/JSON text remains unchanged. Existing filename sanitization is tested with path-like, reserved and empty names.
- Supplemental Chromium rendering verified actual time-table/summary/interval downloads, edited safe filenames, Japanese/English headers, F5 exclusion reason, formula-like text in downloaded CSV, CSV preparation failure without analysis loss, and no observed HTTP request from app operations.
- Supplemental 320 px rendering had no page-level horizontal overflow in the CSV Results area.
- Supplemental v0.6 evidence regression: detached 77–127 s evidence remained readable; connected evidence explicitly switched to Results, sought paused and explicit interval playback stopped near the saved 3.4 s end.

The supplemental browser checks use locally substituted generated HTML because direct local `file://` navigation is administratively blocked. They are **not** the canonical Windows PowerShell build/self-extract/direct-file evidence. The v0.7 Draft PR CI is the release evidence for generated variants and all E2E.

### Remaining gates

Excel and a second spreadsheet application's initial import have not been manually verified in this environment and must not be claimed. Android/iPhone real devices, Safari/Firefox/Edge, published HTTPS, actual large media, screen readers, soft-keyboard behavior, 200% zoom and release-scale performance remain later gates. No merge, tag/release publication or Browser Kitty site change is part of this milestone.

---

## Current milestone — v0.6.0 Results / Review

Scope: T11–T12. Base is the user-merged v0.5.0 main. The implementation adds pure procedure-scoped summaries, reasoned cycle exclusion, result tables/chart and evidence navigation without changing schemaVersion 1.

### Local implementation evidence

- Added the fixed F1–F5 aggregation fixtures and watched the new summary tests fail before `summarize` / exclusion support existed. The full actual-source unit suite is **69 passing, 0 failing, 0 skipped** after implementation.
- F1 overall mean/median/min/max, F2 not-performed denominator, F3 partial-unobserved denominator, F4 incomplete exclusion and F5 reasoned exclusion match APP_SPEC expectations. Zero/one/even/all-excluded populations and different-procedure separation are covered.
- T12 browser tests were added before the Results workspace existed and failed on the missing workspace. Supplemental real Chromium rendering then passed result counts, phase n, F1–F5 state labels, 320px page overflow, reason-required exclusion, detached 77–127 s evidence, phase-3 constituent ranges, and explicit connected range playback stopping near the stored end.
- The table, statistic cards and SVG chart all consume `TsdCore.summarize`; UI code does not maintain a second average formula.
- Detached evidence selection displays exact saved ranges and never autoplays. Connected evidence seeks paused; explicit playback is bounded by the selected interval.

Supplemental rendering uses manually substituted generated HTML because local direct `file://` Chromium navigation is administratively blocked and PowerShell is unavailable. Canonical Windows build/readable/self-extract/file browser evidence must be taken from this revision's GitHub Actions run before handoff.

### Remaining gates

CSV is v0.7.0. Android/iPhone real devices, Safari/Firefox/Edge, published HTTPS interaction, actual large video files, screen readers, soft-keyboard behavior and release-scale performance remain unverified. No merge, tag/release publication or Browser Kitty site modification is part of this milestone.

---

## Current milestone — 2026-10-06

T09–T10 of the approved plan, based on live merged main `c669389b42a9944766f817641f497bc54ff518ba` (PR #3), tree `3c044e0dc2f7545ff0660b173dd9adfb24dd34f8`. Work is on `feat/time-study-desk-v0.5`; main is not edited directly. The schema remains 1 and the v0.2.0 compatibility fixture is unchanged.

### Local tests actually run

Environment: Linux, Node 22.16.0; supplementary Python Playwright with system Chromium using in-memory page rendering because direct URL navigation is restricted by the execution environment.

- Baseline: **54 unit tests passed** before v0.5 changes. New T09 tests first failed because `parseProject` / `matchSource` did not exist. Current full unit suite: **59 passing, zero failed/skipped**.
- Import tests cover current schema round trip, the retained v0.2.0 fixture, malformed JSON, unsupported future schema, bad references/unknown keys/prototype-related keys and raw UTF-8 files over 10 MiB.
- Source matching covers the exact 100,000 µs tolerance boundary, size/dimension mismatch, filename/mtime warnings and candidates shorter than recorded evidence. The API deliberately has no “same file” success claim.
- Supplementary Chromium passed actual JSON download → page reset → detached import → same-video candidate → explicit confirmation → paused reconnection. A wrong-dimension video was rejected while the imported cycles stayed intact; a renamed same-byte candidate produced warnings before confirmation.
- JavaScript syntax checks pass for the complete substituted app script, all test `.mjs` files and the loopback test server.
- IndexedDB persistence behavior is not claimed from the in-memory supplementary page because its opaque origin correctly reports storage unavailable. Canonical persistence/competition cases are committed as generated-HTML Playwright tests using the loopback-only development origin and must be confirmed by Windows CI before this milestone is considered complete.

### Persistence design under test

- Analysis-only autosave defaults on as a device-side preference, uses a 750 ms debounce / 5 s maximum delay, and displays success only after the IndexedDB transaction completes.
- Stored revisions are checked inside the save transaction; stale tabs receive conflict instead of overwriting newer data.
- Restore is explicit. Imported/restored analysis is detached from video and cannot record/seek until explicit source reconnection.
- App-specific clear invalidates queued writes, awaits an in-flight save, clears only this app's stores, and makes the current in-memory analysis dirty again so closing after deleting the durable recovery copy cannot look fully saved.
- `file://` persistence is feature-detected rather than promised. The persistence test origin is development infrastructure only; the distributed app remains a standalone HTML with no server dependency.

### Remaining verification for this branch

Windows PowerShell build/standalone checks, direct-file readable/self-extracting browser tests, loopback IndexedDB tests, exact browser test count/artifact hashes and screenshots are pending the new Draft PR CI. Android/iPhone real devices, Safari/Firefox/Edge, published HTTPS, large real media and screen readers remain later release gates.

Statistics are v0.6.0 and CSV v0.7.0. No merge, tag/release or Browser Kitty site change is part of this milestone.

---

## Historical v0.4.0 evidence

## Source and scope — 2026-10-06

T07–T08 of the approved plan, based on live merged main `edea5a805714b98e06e70b8398f9969103700500` (PR #2), tree `c687d55fb6eecbccbcabbe9cbf3203547d0eebf7`. The source snapshot was checked against that complete Git tree, including tracked `dist/.gitkeep` and repository newline normalization. Changes were made in a disposable feature-branch checkout, not on main.

The schema, time representation, privacy boundary and future release milestones are unchanged. Previous v0.2/v0.3 results are in their commits and PRs; they are not evidence that a new revision passes.

## Local tests actually run

Environment: Linux, Node 22.16.0; supplementary Python Playwright with Chromium 144.0.7559.96.

- Baseline: 38 unit tests passed before changes.
- New exception/interval tests failed for missing commands before implementation. Current full unit suite: **54 passing, zero failed/skipped**.
- Covered F1's split occurrence (5 seconds work + 15 interruption + 5 work), F2's not-performed step without zero time, F3's known 4 seconds plus 5 unobserved, all-kind video-end incomplete state, explicit same-boundary completion, and exception Undo.
- Covered split/merge conservation, reassignment without silently resolving orphan evidence, explicit state validation, one-cycle rework preserving the procedure, cycle deletion/Undo, invalid IDs/times/adjacency, and the interval-note limit.
- Supplementary real-browser UI: actual local video selection, interruption/unobserved capture, final skip, video end during interruption, explicit resolution/finish, splitting, merging, reassignment, added occurrence, deletion/Undo, and actual JSON download passed.
- Japanese/English advanced review at 320/390/768/1360 px had no page-width overflow in the supplementary checks. Existing full width/primary-control regressions remain in the canonical browser suite.
- The additional exception/edit/save workflow produced zero observed HTTP requests, network API attempts, CSP violations or page errors in the supplementary check.
- Source self-review found that a no-op assignment offered Undo for an earlier command. A public-UI failing test reproduced it; Undo is now offered only for a nonempty edit patch. An overlong interval note's misleading error code was likewise reproduced and corrected.
- `git diff --check` passed. The original v0.2.0 saved-data fixture is unchanged and still validates.

Supplementary rendering substitutes source placeholders and uses `page.setContent`. It is **not** a canonical PowerShell build, direct `file://` startup or self-extraction test. Local PowerShell is unavailable and direct-file navigation is blocked by the execution environment. These limits were not bypassed.

## Canonical CI evidence

The unchanged Windows app workflow builds the readable and self-extracting HTML with the repository's PowerShell pipeline, runs all unit/browser tests, and captures actual screenshots. The final PR records its precise run, tested SHA, results and artifact hashes after completion. Do not infer CI success for a later HEAD from this document.

New generated-HTML tests cover both variants for exception capture, interval editing and privacy. Existing video lifecycle, repeat/procedure, download, locale, layout and CSP tests remain enabled. The current browser-version assertion is 0.4.0; the old schema-1 fixture retains its original appVersion.

## Recorded implementation decisions

- A final skipped/resolved occurrence does not invent a zero-second span or auto-complete the cycle. The existing schema-1 cursor may be neutral `unobserved/null` at the last boundary until explicit completion; this is not a timed interval or an inferred missing duration. Resume is disabled for this neutral cursor.
- Reviewing live occurrence states, assignments or inserting an extra occurrence suspends that recording. Reassignment which removes complete evidence makes an occurrence pending. It never silently changes it to not-performed or measured.
- Interval merging preserves the time range. Different assignments/notes require confirmation, guarded by project identity/revision. Undo restores the original boundaries and records.
- Known parts of an unobserved occurrence remain recorded but do not masquerade as the entire measured step. Unknown spans can be assigned to no step without deleting their duration.
- The plan's video-end browser cases are included in `exceptions.spec.mjs` instead of a separate `media-end.spec.mjs`; the behavior is tested, not omitted.
- Review in this session is self-review with tests, not independent review or user acceptance.

## Remaining gates

Android/iPhone real devices, Safari/Firefox/Edge, published HTTPS interaction, actual large video files, screen readers, soft-keyboard behavior and release-scale performance remain unverified. Viewport emulation is not real-device file-picker/download evidence.

Analysis import/original-video reconnection/autosave remain v0.5.0; aggregate statistics v0.6.0; CSV v0.7.0. Their interfaces or schema fields do not mean they are implemented. No merge, release/tag publication or Browser Kitty site modification is part of this milestone.
