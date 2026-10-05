# Third-Party Notices

Time Study Desk's generated runtime contains no bundled third-party library. It uses browser APIs and system fonts. `dependencies.json` and `dependencies.lock.json` have no runtime dependency entries.

Development-only tools locked in `package-lock.json`:

- `@playwright/test`, `playwright`, `playwright-core` 1.57.0 — Apache-2.0.
- Optional macOS `fsevents` 2.3.2 — MIT.

These tools are used for testing and are not embedded in the HTML. GitHub-maintained Actions referenced by the workflows retain their own licenses. Synthetic test media is described in `tests/fixtures/media/README.md` and is not embedded in the application.

Before adding a runtime dependency, record its exact version, license and source, update the dependency lock through the existing tooling, include required notices, and re-verify the generated single HTML and privacy boundary. An available package is not automatic permission to redistribute it.
