# QA matrix — staged acceptance

The complete release matrix is APP_SPEC.md section 17. Only the v0.5.0 subset is targeted here; later requirements are not marked complete merely because a data-model field exists.

| Area | Current evidence target | Remaining work |
|---|---|---|
| AC01–02 | Existing shell/media tests, actual-source unit tests, generated HTML Chromium CI | Additional browsers, actual large files |
| AC03–04 / AC06 | Integer media time, four steps without a fifth, non-increasing rejection, UI capture guards | Real-device timing observations |
| AC05 / AC13 | Three explicit cycles, separate gaps, shared phase identities, immutable procedure order/conditions, draft cancellation, literal labels, new-procedure Undo | Full statistics and later exception editing |
| AC07 / AC14 editing | Shared boundary, split/merge, reassignment, extra occurrence, cycle deletion, Undo/Redo; exact range/ID preservation | Later aggregate phase comparisons |
| AC08–10 model | F1 interruption 5+15+5, F2 not-performed, F3 partial observation; known time retained and kinds separated | Statistical averages in v0.6 |
| AC12 | End in interruption/unobserved stays incomplete; explicit state review and same-boundary finish; final skip never auto-completes | Real-device background and file workflow |
| AC15 | JSON save → strict import → detached results → explicit original-video reconnect; v0.2 schema-1 fixture retained | Real-device file picker/reconnect |
| AC16–17 | Metadata match is not identity; wrong/short video rejected; malformed/future/corrupt/oversize analysis rejected atomically | More browser engines |
| AC21 JSON portion | Edited/sanitized filename and honest download handoff | CSV v0.7 |
| AC22 / AC26 / AC27 | Existing lifecycle and network/CSP tests; new literal name and replacement tests | Full later-feature regression |
| AC23–24 partial | 320+ widths, nearby phone controls, keyboard focus, help, both languages | Actual phone keyboards, screen readers, 200% zoom sweep |
| AC25 | Canonical PowerShell build/readable/self-extract/root checks in Windows CI | HTTPS variants and more browsers |
| AC28–29 | No real-device/large-media pass claimed | Release-candidate hardware and performance gate |
| AC18 | IndexedDB success/unavailable/disabled/clear and stale-tab revision conflict; manual export remains available | Real browser storage policies / mobile |
| AC30 | README/help/version/scope aligned for v0.5 | Final assets, release matrix and device coverage |

Record the exact OS/browser, variant, URL scheme and commit for each canonical test run. Do not substitute a generated file's existence for successful browser execution.