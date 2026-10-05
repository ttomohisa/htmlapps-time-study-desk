# QA results — v0.4.0 Exceptions / Editing

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
