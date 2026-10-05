# QA matrix — staged acceptance

The complete release matrix is APP_SPEC.md section 17. Only the v0.2.0 subset is targeted here; later requirements are not marked complete merely because a data-model field exists.

| Area | Current evidence target | Remaining work |
|---|---|---|
| AC01–02 | Existing shell/media tests, actual-source unit tests, generated HTML Chromium CI | Additional browsers, actual large files |
| AC03–04 / AC06 | Integer media time, four steps without a fifth, non-increasing rejection, UI capture guards | Real-device timing observations |
| AC07 basic | Shared boundary, decimal/current-position/slider editing, Undo/Redo | Split/merge/reassignment in v0.4 |
| AC12 partial | Video end saved as incomplete with pending occurrence; explicit resume | Rich resolution tools in v0.4 |
| AC15 export portion | Actual schema-1 JSON download, unfinished cursor, no video/URL/history | Import/reconnect v0.5 |
| AC17 validator portion | Corrupt schema/state/reference/ID/text/size rejection | Atomic import UI v0.5 |
| AC21 JSON portion | Edited/sanitized filename and honest download handoff | CSV v0.7 |
| AC22 / AC26 / AC27 | Existing lifecycle and network/CSP tests; new literal name and replacement tests | Full later-feature regression |
| AC23–24 partial | 320+ widths, nearby phone controls, keyboard focus, help, both languages | Actual phone keyboards, screen readers, 200% zoom sweep |
| AC25 | Canonical PowerShell build/readable/self-extract/root checks in Windows CI | HTTPS variants and more browsers |
| AC28–29 | No real-device/large-media pass claimed | Release-candidate hardware and performance gate |
| AC30 | README/help/version/scope aligned for v0.2 | Final assets, release matrix and device coverage |

Record the exact OS/browser, variant, URL scheme and commit for each canonical test run. Do not substitute a generated file's existence for successful browser execution.
