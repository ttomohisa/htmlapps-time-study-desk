# Time Study Desk

[日本語](README.ja.md)

Mark step boundaries while watching a work video, compare repeated cycles and step times, and jump from a result back to its evidence. No registration or installation is required; video and analysis data are processed fully locally. No runtime third-party library is used.

**v0.9.0 — release candidate.** It retains the v0.8.0 workflow, refines the information hierarchy and desktop layout, and integrates CSP/network, readable/self-extracting standalone, scale-data and documentation checks. Real Android/iPhone, screen-reader, published-HTTPS and large-real-media checks remain explicitly unverified.

## Screenshot

The app tests capture the actual Japanese, English and phone-width UI in `test-results/screenshots/` inside the `time-study-evidence-*` Actions artifact. The small geometric video is synthetic test material, not a real work-time observation. Repository images inherited from the starter are not evidence of this version.

## Features

- One local video: file picker or drag-and-drop, playback, seek, speed 0.25–2×, ±0.1 / ±1 second adjustment, mute and volume.
- Mark the first cycle with temporary step names, or enter known names on separate lines before measuring. Start each later cycle explicitly with the chosen procedure. The main action becomes Finish on the final step; the app never starts the next cycle automatically.
- Keep a chronological cycle list with per-cycle durations and separate gaps. Select any earlier cycle for review without redirecting current recording into it.
- Rename shared steps across all cycles. Changing the step order or start/end conditions creates a new procedure; earlier cycles keep the old procedure. Registered steps can be classified or removed from new choices without deleting earlier observations.
- Record interruptions and unobserved intervals separately. Returning from an interruption continues the same step occurrence; partially observed steps keep their known portions without pretending to be fully measured.
- Mark a step **Not performed** only when it has no recorded work or unobserved time. This is a state, not a zero-second measurement. Skipping the last step does not automatically complete the cycle.
- Split intervals, merge adjacent intervals, change assignments and add a one-cycle extra step or rework occurrence. Total time is conserved; different assignments/notes require confirmation before merging. Earlier procedures remain unchanged.
- Resolve an incomplete step explicitly in Review, then finish at the last confirmed boundary. Removing a step's recorded evidence makes it pending, not silently not-performed. Delete a cycle with Undo; original video and step definitions remain.
- Shared boundary editing by entering seconds, using the current video position or moving a slider. Adjacent durations change together. Invalid or non-increasing boundaries are rejected without changing the analysis.
- Rename steps and edit analysis, cycle, occurrence and interval notes. Undo/Redo retains up to 100 operations or 16 MiB of differences, whichever is reached first.
- Manually save and reopen versioned analysis JSON. Import validates schema, IDs, references, boundaries, text/count limits and the 10 MiB byte budget before replacing the current analysis.
- Reconnect the original video separately. Size, dimensions and duration (within 100 ms) are checked; matching metadata never claims identity and still requires explicit confirmation. A candidate shorter than recorded evidence is rejected.
- Autosave analysis data only to IndexedDB with a device-side on/off setting (default on). Successful transactions advance a revision; a stale tab reports a conflict instead of overwriting a newer revision. Browser-stored analysis can be restored or explicitly deleted.
- Japanese/English, light UI and phone navigation: Measure / Edit records / Results. Results summarizes one procedure at a time with recorded/included/excluded/incomplete counts, cycle statistics, per-step means with their own n, a zero-origin SVG bar chart, and a step × cycle table. Not-performed, unobserved and incomplete records are not treated as zero.
- Phone layouts use one fixed bottom navigation bar with focus-safe clearance. The buttons expose the screen they control, screen changes get a restrained status announcement, Space on a measurement button does not also toggle playback, text-field Undo stays native, and dialogs return focus to their trigger when closed.
- Export one CSV at a time: time table, summary, or interval detail. CSV uses UTF-8 BOM, CRLF, quoted cells, explicit missing values and state/reason columns. Spreadsheet-formula-like user text is exported as literal text rather than a formula.

### v0.9.0 UI pass

The opening screen now follows the same information hierarchy as other Browser Kitty apps: what the tool does, what the user can do, and where processing happens. On desktop the video/measurement workspace uses one wide centered column instead of leaving an empty right rail. Before a video is chosen, analysis navigation is hidden and Open analysis remains a tertiary path below Choose video. After a video is chosen, Measure is the only workspace shown until measurement starts; then Measure / Edit records / Results become available.

## Usage

Open a freshly built `dist/index.html` or `time-study-desk.html`, choose a video, seek to the work's starting position, and select **Start cycle here**. Select **Mark boundary** at each step change and **Finish cycle here** at the end. After a cycle finishes, the app stays on **Measure** and offers **Start next cycle here**, **Edit record**, and **View results**. Use **Edit records** to select and correct a cycle. **Results** contains count-aware statistics, the step × cycle table, cycle breakdown/exclusion controls, plus the existing cycle/procedure management cards. The editor changes nothing until saved; cancelling leaves the original procedure intact. Choose **Save analysis** to download a `.tsd.json` file, or use the CSV buttons below it to download one time-table, summary, or interval-detail file at a time.

The filename is editable; the extension is fixed. A “Download started” message means the file was handed to the browser, not that a particular disk location was verified. Check the download yourself. Autosave starts enabled when IndexedDB is actually available; it stores analysis only, never video. If storage is unavailable or full, the warning remains visible and manual JSON saving still works.

At the video end the recording cycle becomes **Incomplete**, never automatically Complete, even when an older cycle is selected for review. Undo to correct the boundary and finish explicitly, or save the unfinished record. Returning from a hidden page requires an explicit resume from the last confirmed boundary; it does not invent a timed interruption.

An incomplete repeated cycle can be left as-is while preparing the next cycle; it remains in the saved analysis. Resuming an earlier incomplete cycle is disabled while another cycle is open. A new cycle or boundary edit cannot overlap an existing observation.

### Exceptions and review

During measurement, expand **More recording options** to mark an interruption, an unobserved interval or a step not performed. End an interruption/unobserved interval with **Resume step**. The recording menu is not the player's pause control.

In **Edit records**, expand **Split, merge and assign intervals**. Choose the interval and its assignment before applying a change. A split uses a video time strictly inside that interval. A merge keeps the selected assignment and note; confirm when that changes the adjoining record. Split first, add an extra occurrence, then assign the relevant span when recording one-cycle rework.

Each step's **Review occurrence state** control lets you confirm measured, not performed or unobserved, or leave it unresolved. Invalid combinations (such as measured with an unobserved span) are rejected. Editing live assignments suspends that cycle. Once every step is resolved and a positive interval exists, **Mark this cycle complete** explicitly completes it without inventing extra time.

### Results and video evidence

Choose the procedure to summarize in **Results**. Overall elapsed statistics use only complete, non-excluded cycles. Recorded-step, interruption and unobserved means use that same cycle population; a step mean uses only cycles where that step has a fully determined value. The displayed n therefore belongs to each statistic, and step means are never added together to invent the overall mean.

Not performed is a state rather than zero seconds. A partly unobserved step keeps its known recorded portion but is excluded from that step's mean. Incomplete cycles remain visible but do not enter the standard statistics. Excluding a complete cycle requires a reason and leaves the row visible.

Select a numeric cycle/step/exception value to open **Edit records** at the saved evidence range. The player seeks to the start and stays paused. **Play this interval** starts only after an explicit click and stops near the saved end; this does not claim frame-accurate stopping. If the analysis is detached from its video, the exact time range remains readable and playback stays disabled until a compatible source is reconnected.

### CSV export

The output base name is shared by JSON and CSV. The app fixes each suffix: `.tsd.json`, `-time-table.csv`, `-summary.csv`, or `-intervals.csv`. Invalid path/control characters and reserved names are sanitized; the app does not write to a user-supplied directory.

**Time table CSV** has one row per recorded cycle for the selected procedure, including status, inclusion/exclusion reason, start/end, elapsed/breakdown values, and seconds + state columns for each planned step. **Summary CSV** uses the same `TsdCore.summarize()` populations as the on-screen results and includes each statistic's own `n`. **Interval detail CSV** uses fixed ASCII keys and can cover the selected procedure or the whole analysis; it keeps span rows, no-span occurrence-status rows, exclusions/incomplete cycles, and between-cycle gaps.

CSV is UTF-8 with BOM, CRLF, commas, and every cell quoted. Missing numeric values are empty rather than `0`; a real zero remains `0`. User text that could be interpreted as a spreadsheet formula is prefixed with an apostrophe in CSV only. The original text remains unchanged in the analysis JSON. See [CSV_FORMAT.md](docs/CSV_FORMAT.md). A “Download started” message is only browser handoff, not proof that a particular spreadsheet program or disk destination accepted the file.

### Reopen, reconnect and autosave

Use **Open analysis** to select a `.tsd.json` file. The file is read locally and the current analysis is replaced only after full validation and confirmation. A reopened or restored analysis is deliberately detached from video: results, names and JSON saving remain available, while measurement and evidence seeking stay disabled.

Select **Reconnect original video** to choose the source again. A matching candidate is still presented for confirmation; filename or modification-time changes are warnings, while size/dimension mismatch, more than 100 ms duration difference, or a video shorter than an existing boundary is rejected without changing the analysis. Reconnection never autoplays.

Autosave is a single-analysis recovery aid, not a project library. Edits are debounced for 750 ms with a five-second maximum delay. Another tab with a newer saved revision causes a conflict and automatic writes stop; use manual JSON export to preserve the stale tab. **Delete browser analysis data** clears only this app's analysis stores, not the original video or downloaded files.

## Privacy and limits

All video handling and analysis run in the browser. Videos use File references and Blob URLs rather than full JavaScript byte-array copies. No video, filename, step label or note is sent to a server. Analysis autosave uses browser-local IndexedDB and never stores video. Language and the autosave preference are device-side settings. User-triggered JSON contains metadata, times and notes, but no video, local absolute path, Blob URL or undo history. Browser storage is not advertised as permanent or encrypted retention.

The readable app uses `connect-src 'none'`, `media-src blob:` and no worker, remote font, analytics or CDN. The self-extracting loader and the expanded app are tested separately. See [SECURITY.md](SECURITY.md).

Input policy: one non-empty video, at most 8 GiB and 24 hours, with a finite duration, video track and seekable positions. These are application limits, **not a guarantee that an 8 GiB file will play on every device**. Actual codec support is decided by the browser; the app does not convert media. Use normally recorded video: slow-motion, timelapse and edited speed changes are not converted back to real time.

Times are read from the video's `currentTime` and stored as integer microseconds. This is an arithmetic representation, **not microsecond or frame-accurate measurement**. Playback speed is not applied as a multiplier to measured durations. The result is an observed duration in this video, not a standard time or worker rating.

## Browser checks

The repository's Windows Actions workflow tests generated readable and self-extracting HTML directly through `file://` in Chromium for the main standalone workflow. Persistence tests use the same generated HTML from a loopback-only development server so IndexedDB has a stable origin; the app does not require that server at runtime. `file://` storage support is feature-detected rather than promised. Exact tested revisions belong to their Actions run/PR.

Windows CI and supplementary Chromium cover 320/360/390/430 px, short landscape layouts, 200%-equivalent narrow rendering, keyboard interaction, dialog-end reachability and focus return. Android/iPhone hardware, soft keyboards, screen-reader user testing, macOS Safari, Edge, Firefox, published HTTPS hosting and large real video files remain unverified. Emulation does not verify the mobile OS file picker or download flow. The self-extracting variant requires `DecompressionStream`.

## Development and build

Edit **`src/index.template.html`**, never a generated HTML. Product requirements are in [APP_SPEC.md](APP_SPEC.md); the [implementation plan](docs/superpowers/plans/2026-10-05-time-study-desk.md) defines the later milestones. The existing template build pipeline and reusable component contracts are retained.

On Windows, double-click `build-standalone.bat`, or run:

```powershell
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-powershell-syntax.ps1
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repository.ps1
```

PowerShell 7 equivalents:

```powershell
pwsh -NoProfile -File ./scripts/check-powershell-syntax.ps1
pwsh -NoProfile -File ./scripts/check-repository.ps1
```

The build produces `dist/index.html`, `dist/index.self-extract.html`, and the byte-identical readable root copy `time-study-desk.html`, with dependency/size manifests. Build before using a checkout's generated files; source changes do not regenerate them automatically.

Development-only tests (Node 22 is used by CI):

```text
npm ci
npx playwright install chromium
npm run test:unit
npm run test:e2e -- --project=chromium
```

Unit tests extract the real `TSD:CORE` block, not a copy of its implementation. Browser tests use generated HTML. Test media is not embedded in the app. The Actions artifact includes tested source, both HTML variants, the root copy, environment information, browser reports and screenshots.

## Save format and project status

[Schema 1](docs/SAVE_FORMAT.md) is independent of the app version and is intended to stay readable through v1.0.0. The v0.2.0 `.tsd.json` compatibility fixture is retained under `tests/fixtures/`. Unknown fields and invalid references are rejected rather than silently discarded. v0.9.0 imports schema 1, keeps the v0.2.0 fixture as a compatibility regression, and requires explicit original-video reconnection. Autosave stores schema-1 analysis data only; statistics, evidence ranges and CSV are derived at runtime and are not serialized.

This work does not publish a release, merge the PR, or add the app to the Browser Kitty site. The user merges the PR.

## License

MIT. See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
