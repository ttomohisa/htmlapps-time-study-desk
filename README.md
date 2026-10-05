# Time Study Desk

[日本語](README.ja.md)

Measure one work cycle in a local video, edit its step boundaries, and save the analysis as JSON. No registration, installation, video upload, or runtime third-party library is required.

**v0.2.0 — development build.** This version measures the first cycle only. It can save `.tsd.json`, but **cannot reopen those files yet**. Repeated cycles, analysis import, autosave, statistics and CSV are later milestones. It is not a v1.0 release.

## Screenshot

The app tests capture the actual Japanese, English and phone-width UI in `test-results/screenshots/` inside the `time-study-evidence-*` Actions artifact. The small geometric video is synthetic test material, not a real work-time observation. Repository images inherited from the starter are not evidence of this version.

## Features

- One local video: file picker or drag-and-drop, playback, seek, speed 0.25–2×, ±0.1 / ±1 second adjustment, mute and volume.
- Start a cycle, mark each step change, then explicitly finish. Temporary step names let you measure before typing. Finishing does not create an empty next step.
- Shared boundary editing by entering seconds, using the current video position or moving a slider. Adjacent durations change together. Invalid or non-increasing boundaries are rejected without changing the analysis.
- Rename steps and edit analysis, cycle, occurrence and interval notes. Undo/Redo retains up to 100 operations or 16 MiB of differences, whichever is reached first.
- Manually save versioned analysis JSON, including unfinished records and the last confirmed boundary. The video is not included. Failed or cancelled video replacement preserves the previous analysis.
- Japanese/English, light UI and phone navigation: Measure / Review / Results. “Results” shows this cycle's recorded durations, not multi-cycle statistics.

## Usage

Open a freshly built `dist/index.html` or `time-study-desk.html`, choose a video, seek to the work's starting position, and select **Start cycle here**. Select **Mark boundary** at each step change and **Finish cycle here** at the end. Use **Review** to correct boundaries and names. Choose **Save analysis** to download a `.tsd.json` file.

The filename is editable; the extension is fixed. A “Download started” message means the file was handed to the browser, not that a particular disk location was verified. Check the download yourself. There is **no autosave**, and closing this page loses unsaved work. Keep both the analysis file and its original video for later versions' resume support.

At the video end the cycle becomes **Incomplete**, never automatically Complete. Undo to correct the boundary and finish explicitly, or save the unfinished record. Returning from a hidden page requires an explicit resume from the last confirmed boundary; it does not invent a timed interruption.

## Privacy and limits

All video handling and analysis run in the browser. Videos use File references and Blob URLs rather than full JavaScript byte-array copies. No video, filename, step label or note is sent to a server. Only the language preference is stored automatically. User-triggered analysis downloads contain metadata, times and notes, but no video, local absolute path, Blob URL or undo history.

The readable app uses `connect-src 'none'`, `media-src blob:` and no worker, remote font, analytics or CDN. The self-extracting loader and the expanded app are tested separately. See [SECURITY.md](SECURITY.md).

Input policy: one non-empty video, at most 8 GiB and 24 hours, with a finite duration, video track and seekable positions. These are application limits, **not a guarantee that an 8 GiB file will play on every device**. Actual codec support is decided by the browser; the app does not convert media. Use normally recorded video: slow-motion, timelapse and edited speed changes are not converted back to real time.

Times are read from the video's `currentTime` and stored as integer microseconds. This is an arithmetic representation, **not microsecond or frame-accurate measurement**. Playback speed is not applied as a multiplier to measured durations. The result is an observed duration in this video, not a standard time or worker rating.

## Browser checks

The repository's Windows Actions workflow tests generated readable and self-extracting HTML directly through `file://` in Chromium. The exact tested revision and results belong to its associated run and PR, not a permanent “all browsers supported” claim. Local supplementary rendering is recorded separately in [QA_RESULTS](docs/QA_RESULTS.md).

Android/iPhone real devices, macOS Safari, Edge, Firefox, published HTTPS hosting and large real video files remain unverified. Phone-width emulation does not verify the mobile OS file picker or download flow. The self-extracting variant requires `DecompressionStream`.

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

[Schema 1](docs/SAVE_FORMAT.md) is independent of the app version and is intended to stay readable through v1.0.0. The `.tsd.json` fixture emitted at this milestone is retained under `tests/fixtures/`. Unknown fields and invalid references are rejected by the validator rather than silently discarded. Import UI is not implemented in v0.2.0.

This work does not publish a release, merge the PR, or add the app to the Browser Kitty site. The user merges the PR.

## License

MIT. See [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
