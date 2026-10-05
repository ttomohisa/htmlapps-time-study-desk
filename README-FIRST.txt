Time Study Desk / Video work analysis
===================================

Read README.md or README.ja.md for the current development scope.
Read AGENTS.md, APP_SPEC.md, and the plan under docs/superpowers/plans/ before editing.

v0.5.0 reopens validated analysis JSON, reconnects the original video, and autosaves analysis data locally.
Repeated cycles, exceptions, preserved procedures, interval editing and manual JSON export are retained.
Statistics and CSV are not implemented yet.

Edit src/index.template.html, not generated HTML.
On Windows run build-standalone.bat, or the syntax/repository checks documented in README.
Use the freshly generated dist/index.html, dist/index.self-extract.html, or time-study-desk.html.
Keep videos local. No runtime library or WebRTC integration is used by this app.
Review the associated Actions run for exact build, test, and screenshot evidence.
The user merges the PR. Do not merge, publish a release/tag, or change Browser Kitty itself.
