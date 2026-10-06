Time Study Desk / Video work analysis
===================================

Read README.md or README.ja.md for the current development scope.
Read AGENTS.md, APP_SPEC.md, and the plan under docs/superpowers/plans/ before editing.

v0.9.0 is the release-candidate integration stage. It retains the complete measurement/results/export flow, the v0.8 mobile/accessibility work, and the user-approved Time Study Desk icon.
The opening hierarchy and desktop workspace are refined to match current Browser Kitty apps, while standalone privacy/security, scale and documentation regressions are consolidated.
Real-device, screen-reader, published-HTTPS and large-real-media checks remain explicit release gates and must not be inferred from emulation.

Edit src/index.template.html, not generated HTML.
On Windows run build-standalone.bat, or the syntax/repository checks documented in README.
Use the freshly generated dist/index.html, dist/index.self-extract.html, or time-study-desk.html.
Keep videos local. No runtime library or WebRTC integration is used by this app.
Review the associated Actions run for exact build, test, and screenshot evidence.
The user merges the PR. Do not merge, publish a release/tag, or change Browser Kitty itself.
