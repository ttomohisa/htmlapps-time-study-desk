# QA matrix — staged acceptance

The complete release matrix is APP_SPEC.md section 17. v0.8.0 targets Mobile / Accessibility while retaining all earlier gates. Release-candidate real-device, screen-reader, multi-browser, large-media and performance requirements are not marked complete by emulation.

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
| AC22 / AC26 / AC27 | Runtime external-network boundary and source lifecycle regressions retained | Full release-candidate security sweep |
| AC23–24 partial | 320+ widths, phone Results cards, keyboard focus, help, both languages | Actual phone keyboards, screen readers, 200% zoom sweep |
| AC25 | Canonical PowerShell build/readable/self-extract/root checks in Windows CI | HTTPS variants and more browsers |
| AC28–29 | No real-device/large-media pass claimed | Release-candidate hardware and performance gate |
| AC30 | README/help/version/scope aligned for v0.6 | Final assets, release matrix and device coverage |

Record the exact OS/browser, variant, URL scheme and commit for each canonical test run. Do not substitute generated-file existence or viewport emulation for successful browser/real-device execution.
