# SS-ADMIN-007 — Defect Register

**Branch:** `staging`  
**Date:** 2026-10-30  
**Scope:** Administrative platform end-to-end validation (SS-ADMIN-001…006 + related UX/auth)

Status values: `Open` · `Remediated` · `Accepted limitation` · `Blocked / deferred`

---

## Confirmed product defects (P0 / P1)

**None.**

No cross-tenant exposure, authentication bypass, scoring corruption, unauthorized billing/lead exposure, or broken primary admin workflows were confirmed after authenticated staging-session probing and automated suites.

---

## DEF-007-001 — Pre-existing TypeScript test-fixture drift

| Field | Detail |
| --- | --- |
| Severity | **P2 — Medium** |
| Area | Tooling / tests (`tsc --noEmit`) |
| Description | `npx tsc --noEmit` fails on outdated fixtures after product type evolution. |
| Reproduction | `npx tsc --noEmit` on `staging` |
| Exact failures (this run) | `tests/qbr/pdf-export.test.ts` (`instanceof`); `tests/recommendations/ss-content-002-batch1-publication.test.ts` (`priority: string` vs `Priority`); `tests/technology-improvement-plan/tip-content-quality.test.ts` (`ratingLabel`); `tip-executive-report.test.ts` (`RiskSummary.criticalExposure`); `tip-pdf.test.ts` (missing `TipReportData` fields); `tip-preview-controls.test.ts` (`EventTarget` mocks); `tests/technology-profile/overview.test.ts` (incomplete `TipRecommendationView`) |
| Classification | **Pre-existing test fixture debt** (carries DEF-017-001). **Not** a new ADMIN-007 regression. |
| Remediation this ticket | Fixed **in-scope** ADMIN-005/006 `PageContext` partials via `buildPageContext` (tsc errors for those files cleared). Broader TIP/QBR repairs deferred. |
| Status | **Open** (deferred stabilization) |

---

## DEF-007-002 — Local `.next` corruption when `next build` runs against live `next dev`

| Field | Detail |
| --- | --- |
| Severity | **P3 — Low** (local tooling) |
| Area | Developer environment |
| Description | Concurrent production build while Turbopack dev served authenticated routes returned HTTP 500 / empty bodies; `/api/auth/csrf` returned `Internal Server Error`. After kill port 3000 + delete `.next` + restart, routes recovered. Clean `npm run build` alone exited 0. |
| Reproduction | Run `npm run build` while `next dev --turbopack` is active on the same `.next` directory; then fetch staff pages. |
| Classification | Environment / tooling (same class as DEF-017-002). Not a staging product defect. |
| Status | **Remediated** (environment recovery); document as operator caution |

---

## DEF-007-003 — Live customer email / project-update publish not exercised

| Field | Detail |
| --- | --- |
| Severity | **P2 — Medium** (validation coverage gate) |
| Area | Communications / SS-UX-015 |
| Description | Ticket forbids real customer emails; `RESEND_API_KEY` absent from local env. Live test-send/publish not re-run. |
| Reproduction | N/A — policy + missing provider key |
| Evidence substitute | Automated `ss-ux-015-project-communications` **15/15 PASS**; ADMIN-006 asserts PROJECTS_SHARED / PROJECT_COMPLETED unchanged |
| Status | **Blocked / deferred** (carries DEF-017-005) |

---

## DEF-007-004 — Staff interactive browser viewport / a11y matrix incomplete

| Field | Detail |
| --- | --- |
| Severity | **P2 — Medium** (coverage gap, not confirmed UI defect) |
| Area | Responsive / accessibility |
| Description | Staff routes validated via authenticated HTTP HTML markers and automated nav suites. Full interactive MCP walk of staff sidebar at 1440/1024/768/390/320 with keyboard/focus audit was not completed (staff password not typed into browser tooling; HTTP session used instead). Customer Overview/Projects browser checks **PASS**. |
| Status | **Blocked / deferred** for operator visual sign-off |

---

## Remediated during SS-ADMIN-007

| ID | Severity | Area | Description | Resolution |
| --- | --- | --- | --- | --- |
| DEF-007-R1 | P2 | Tests | ADMIN-005/006 passed incomplete objects to `canClientAccessPath` (`PageContext`) causing `tsc` errors | Use `buildPageContext({…})` in both test files; Vitest 17/17 green |

---

## Blocked validation (not defects)

| Item | Reason |
| --- | --- |
| Live Resend delivery | Policy + missing API key |
| Exhaustive Needs Attention row audit vs DB | Sampled via composition tests; not every staging alert row opened |
| Dual-customer peer isolation browser | Single demo customer session; API suite covers isolation |
| Staff MCP visual chrome | Credentials available for HTTP session; browser fill avoided to keep secrets out of tool transcripts |

---

## No P0 / P1 open items

Release blocker bar for SS-ADMIN-007 product defects: **clear**. Remaining items are coverage gates and pre-existing fixture debt.
