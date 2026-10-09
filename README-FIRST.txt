Time Study Desk / Video work analysis
===================================

Read README.md or README.ja.md for the current development scope.
Read AGENTS.md, APP_SPEC.md, and the plan under docs/superpowers/plans/ before editing.

v1.0.1 adds safer overlapping source choices and playback-only exact seconds seeking. It retains the complete local video workbench, repeated-cycle measurement, results and CSV workflow, the v0.8 mobile/accessibility work, and the user-approved Time Study Desk icon.
The schemaVersion remains 1. Android/iPhone hardware, screen readers, other browsers and large media are not represented as tested.
Real-device, screen-reader, published-HTTPS and large-real-media checks remain explicit release gates and must not be inferred from emulation.

Edit src/index.template.html, not generated HTML.
On Windows run build-standalone.bat, or the syntax/repository checks documented in README.
Use the freshly generated dist/index.html, dist/index.self-extract.html, or time-study-desk.html.
Keep videos local. No runtime library or WebRTC integration is used by this app.
Review the associated Actions run for exact build, test, and screenshot evidence.
The user merges the PR. Do not merge, publish a release/tag, or change Browser Kitty itself.
