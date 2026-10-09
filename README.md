# Time Study Desk

[![App tests](https://github.com/ttomohisa/htmlapps-time-study-desk/actions/workflows/test-app.yml/badge.svg)](https://github.com/ttomohisa/htmlapps-time-study-desk/actions/workflows/test-app.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Single HTML](https://img.shields.io/badge/distribution-single%20HTML-16624F)](https://github.com/ttomohisa/htmlapps-time-study-desk/actions)

[日本語版 README](README.ja.md)

**Mark work steps while watching a video and compare durations across repeated cycles.** Click a result to return to its exact recorded video range. No account or installation is needed, and the app does not upload selected videos or analysis data.

## Demo and screenshots

When GitHub Pages is enabled, [open Time Study Desk](https://ttomohisa.github.io/htmlapps-time-study-desk/). If Pages is not configured, download the generated HTML from a successful GitHub Actions build artifact.

On desktop, Measure puts the video and main action side by side; Edit records shows a video editor and a step inspector; Results separates statistics from saving and cycle management. Mobile uses Measure / Edit records / Results navigation. **Screenshots of the current tested build** are in \`test-results/screenshots/\` inside the \`time-study-evidence-*\` artifact of [app test runs](https://github.com/ttomohisa/htmlapps-time-study-desk/actions/workflows/test-app.yml). The tiny video is synthetic test footage, not a real work-time observation.

## Features

- **Mark steps in one video** — Record the start, step boundaries and end while playing/seeking. You can start the first cycle without naming the steps in advance.
- **Compare repeated cycles** — Reuse a procedure, explicitly start each cycle, and keep gaps between cycles out of work time.
- **Keep observation exceptions distinct** — Record interruptions, unobserved portions and steps not performed without converting unknowns to zero seconds.
- **Correct records** — Adjust shared boundaries, split/merge/reassign intervals, resolve statuses, edit notes and undo/redo.
- **See the underlying evidence** — View cycle and step statistics with their own denominators (n), a time table, chart and links back to video ranges.
- **Save and export on-device** — Analysis-only JSON, browser-local autosave when supported, and time-table/summary/interval-detail CSV.

## Quick start

### Web version

If GitHub Pages is configured, [open the app](https://ttomohisa.github.io/htmlapps-time-study-desk/). Downloading the initial HTML requires a network request; after loading, user data is processed locally by the app.

### Standalone file

Download a successful build artifact from [GitHub Actions](https://github.com/ttomohisa/htmlapps-time-study-desk/actions/workflows/build-standalone.yml) and open \`dist/index.html\`. It is a standalone HTML file. The smaller \`dist/index.self-extract.html\` also runs without runtime downloads but requires browser \`DecompressionStream\` support. Neither requires an application server or runtime library installation.

### Typical workflow

1. **Choose a video** using the file picker or drag-and-drop.
2. **Measure** — Seek to the start and press **Start cycle here**. Press **Mark boundary** whenever the step changes, then **Finish cycle here** at the end.
3. **Repeat** — The app stays on Measure and offers **Start next cycle here**, **Edit record** or **View results**. It never automatically starts the next cycle.
4. **Edit records** — Select a cycle, change step names, boundaries, intervals and statuses. Changing procedure order or start/end conditions creates a new procedure while preserving older cycles.
5. **Results** — Choose a procedure, inspect totals, per-step means and the time table. A reason is required when excluding a completed cycle from statistics.
6. **Save** — Download \`.tsd.json\` or one of the three CSV views.

### Interruptions, unknowns and not performed

Under **More recording options**, start an interruption or unobserved period and use **Resume step** when it ends. Pausing the video is **not** the same as recording a work interruption. Mark **Not performed** only when no work or unobserved span is already assigned. Incomplete cycles do not silently become complete.

### Editing and video evidence

A shared boundary affects the durations of both adjacent steps. Split, merge and reassignment preserve observed time rather than inventing or dropping it. When sufficient evidence for a step is removed, that step becomes unresolved.

Click a recorded number in Results to open its range in Edit records. The player seeks to the start **without autoplay**. Playback of the selected range requires an explicit **Play this interval** click and is not guaranteed frame-accurate.

### Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| \`Space\` when player focused | Play / pause |
| \`←\` / \`→\` when player focused | Seek by 0.1 seconds |
| \`Shift\` + arrow | Seek by 1 second |
| \`Ctrl\` / \`⌘\` + \`Z\` | Undo record operation (native text Undo inside text fields) |
| \`Ctrl\` / \`⌘\` + \`Shift\` + \`Z\` | Redo record operation |
| \`Esc\` | Close a dialog |

## Saving, restoring and CSV

An **analysis JSON (\`.tsd.json\`)** contains steps, procedures, cycles, boundaries, statuses and notes, **not the video**. On import the app validates the complete file before replacing the current analysis. Reconnect the source video separately. Size, dimensions and duration are compared, but matching metadata is not proof of file identity, so confirmation is still required.

**Autosave** stores the analysis only in the browser's IndexedDB when available. It is enabled by default, but availability depends on the browser and local settings. Stale tabs cannot silently overwrite newer recovery data. Browser storage is not promised to be durable or encrypted: download an additional JSON copy for anything important.

**CSV** exports time table, summary or interval detail separately, one file per action. CSV uses UTF-8 BOM, CRLF and quoted cells; missing values remain distinct from zero. States, exclusions and reasons are preserved. User text at risk of spreadsheet formula interpretation is escaped in CSV only. See [CSV format](docs/CSV_FORMAT.md). A “Download started” notification means browser handoff, not verified disk persistence.

## Privacy and processing location

Generated HTML uses a CSP including \`connect-src 'none'\`. The app has no analytics, external API, remote CDN, fonts or ad scripts at runtime. Video uses local File and Blob URL references. Autosave stays in IndexedDB; JSON/CSV output is a local download. The app does not transmit the video, filenames, step names or notes.

Visiting GitHub Pages or GitHub itself requires requests to deliver the page and repository. For disconnected use, open a downloaded standalone HTML. Details are in [SECURITY.md](SECURITY.md).

## Limitations and test coverage

- One non-empty, seekable video; application limits are 8 GiB and 24 hours. The browser must support the file's codec; there is no transcoding.
- Video \`currentTime\` is rounded and stored as integer microseconds. **This is not a microsecond- or frame-accuracy claim.** Slow motion/time-lapse and edited speed changes are not reconstructed into real time.
- Observed time in a video is not a standard time, worker performance rating or staffing calculation.
- Automated Chromium testing covers narrow widths, Japanese/English, keyboard, JSON compatibility, CSV and generated HTML. **Real Android/iPhone devices, soft keyboards, screen readers, Safari/Firefox/Edge and actual large-media end-to-end runs remain unverified.**
- \`file://\` IndexedDB availability is browser-dependent. The self-extracting variant requires \`DecompressionStream\`.
- Schema **1** is separate from app version **1.0.0**. A retained v0.2.0 schema-1 fixture is used for compatibility regression.

## Development and build

Edit \`src/index.template.html\`, not generated HTML. On Windows run \`build-standalone.bat\`, or use PowerShell:

\`\`\`powershell
pwsh -NoProfile -File ./scripts/check-powershell-syntax.ps1
pwsh -NoProfile -File ./scripts/check-repository.ps1
\`\`\`

Build outputs are \`dist/index.html\`, \`dist/index.self-extract.html\` and the readable-equivalent \`time-study-desk.html\`. Node.js 22 and Playwright 1.57.0 are used **only for development/testing**:

\`\`\`text
npm ci
npx playwright install chromium
npm run test:unit
npm run test:e2e -- --project=chromium
\`\`\`

Product requirements are in [APP_SPEC.md](APP_SPEC.md), save format in [docs/SAVE_FORMAT.md](docs/SAVE_FORMAT.md), and verification evidence in [docs/QA_RESULTS.md](docs/QA_RESULTS.md). See the matching GitHub Actions run for exact test results and screenshots.

## Issues and license

Report non-sensitive bugs and feature requests via [Issues](https://github.com/ttomohisa/htmlapps-time-study-desk/issues). Do not upload private videos or analysis data to public issues. For contributions, see [CONTRIBUTING.md](CONTRIBUTING.md).

[MIT License](LICENSE) © 2026 ttomohisa.