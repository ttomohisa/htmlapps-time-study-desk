# QA matrix — staged acceptance

The complete release matrix is APP_SPEC.md section 17. v1.0.0 is the release preparation and saved-data compatibility stage; Automated standalone/privacy/security and synthetic scale coverage can close only the rows they actually exercise; real-device, screen-reader, multi-browser, published-HTTPS and large-real-media requirements stay unverified until run on those targets.

| Area | Current evidence target | Remaining work |
|---|---|---|
| AC01–02 | Existing shell/media tests, actual-source unit tests, generated HTML Chromium CI | Additional browsers, actual large files |
| AC03–07 / AC13 | Integer media time, repeated cycles, immutable procedures, reversible shared-boundary/interval editing | Real-device timing observations |
| AC08–10 | Fixed F1–F5 summaries: interruption, not-performed, partial observation, incomplete and reasoned exclusion with explicit denominators | Retained regression |
| AC11 / AC14 | Mean/median/min/max and cycle/phase populations come from one `summarize` result; no phase-mean summation | Additional browser engines and user review |
| AC12 | Video-end/incomplete rules retained; no automatic completion | Real-device background workflow |
| AC15 evidence | Result numbers open exact saved ranges; detached analysis keeps results readable; reconnect gates playback | Real-device file picker/reconnect |
| AC16–18 | Strict import/source match plus IndexedDB unavailable/disabled/clear/conflict paths | Real browser storage policies / mobile |
| AC19–21 | Three CSV types, blank vs zero, states/reasons, UTF-8 BOM/CRLF/quoted cells, edited/sanitized names, actual one-file downloads and failure handoff | Excel/other spreadsheet manual import remains release verification |
| AC22 / AC26 / AC27 | Consolidated runtime network-attempt/CSP/security/standalone tests plus source-lifecycle regressions | Additional browser engines / published HTTPS |
| AC23–24 partial | 320+ widths, short-phone primary controls, 200%-equivalent zoom, keyboard focus, help, both languages | Actual phone keyboards and screen readers |
| AC25 | Canonical PowerShell build/readable/self-extract/root checks in Windows CI | HTTPS variants and more browsers |
| AC28–29 | Synthetic 1,000-cycle / 10,000-span summary regression; no real-media/real-device pass claimed | PC ~2 GiB / phone ~500 MiB real media and Android/iPhone hardware |
| AC30 | README/help/version/scope aligned for v0.9; user-approved favicon source retained | Final screenshots and unresolved device/browser coverage |

Record the exact OS/browser, variant, URL scheme and commit for each canonical test run. Do not substitute generated-file existence or viewport emulation for successful browser/real-device execution.
