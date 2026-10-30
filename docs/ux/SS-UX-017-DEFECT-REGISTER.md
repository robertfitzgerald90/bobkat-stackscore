# SS-UX-017 — Defect Register

**Branch:** `staging`  
**Date:** 2026-10-30  
**Scope:** Customer platform end-to-end validation

Status values: `Open` · `Remediated` · `Accepted limitation` · `Blocked / deferred`

---

## DEF-017-001 — Repository TypeScript failures in unrelated test fixtures

| Field | Detail |
| --- | --- |
| Severity | **P2 — Medium** |
| Affected | Test typing only (`tests/technology-improvement-plan/*`, `tests/qbr/pdf-export.test.ts`, `tests/recommendations/ss-content-002-batch1-publication.test.ts`, `tests/technology-profile/overview.test.ts`) |
| Description | `npx tsc --noEmit` fails on outdated test fixtures after product type evolution (TIP report fields, Priority unions, EventTarget mocks, ratingLabel removal, etc.). |
| Reproduction | `npx tsc --noEmit` on `staging` |
| Root cause | Test fixtures drifted from production types; predate SS-UX-016-R1. Runtime/build path already typechecks via `next build`. |
| Remediation | Fixed in-scope fixtures: `next-action`, `env`, `responsive-layout`, `ss-ux-002`, `ss-rel-015`, `category-scores`. Remaining TIP/QBR/content fixtures deferred (not customer-runtime). |
| Test evidence | Remediated files pass Vitest; `npm run build` previously exit 0 on staging. |
| Status | **Partial remediate** — remaining listed as outstanding limitation |

---

## DEF-017-002 — Local `.next` corruption after production build during validation

| Field | Detail |
| --- | --- |
| Severity | **P3 — Low** (local tooling) |
| Affected | `npm run dev` |
| Description | After `npm run build`, turbopack dev server returned HTTP 500 (`ENOENT` on `_buildManifest.js.tmp.*`). |
| Reproduction | Run production build while/after active `next dev`; refresh Explore. |
| Root cause | Shared `.next` directory contention between build and turbopack. |
| Remediation | Killed port 3000, deleted `.next`, restarted `npm run dev` — recovered. |
| Test evidence | App responded after restart; Explore/Overview/Projects loaded. |
| Status | **Remediated** (environment) |

---

## DEF-017-003 — Explore inactive-tab accessibility concern (SS-UX-016-R1)

| Field | Detail |
| --- | --- |
| Severity | **P3 — Low** (investigated; not confirmed product defect) |
| Affected | Explore `PillarIntelligenceTabs` |
| Description | R1 noted inactive tab panels may remain in the accessibility tree. |
| Reproduction | Open Explore → switch to Recommendations while inspecting a11y snapshot. |
| Root cause | Base UI Tabs unmount inactive panels by default (`keepMounted` false). Prior observation conflated What's Working / What Needs Attention “Recorded answer” rows with Assessment Findings tab content. CDP confirmed single `role=tabpanel` after switch. |
| Remediation | None required for layout; documented clarification. No redesign. |
| Test evidence | CDP panel count = 1; selected tab updates; findings content leaves DOM. |
| Status | **Accepted limitation / clarified** |

---

## DEF-017-004 — Customer demo login credentials not available in local `.env`

| Field | Detail |
| --- | --- |
| Severity | **P2 — Medium** (validation coverage gap, not product failure) |
| Affected | Phase 2 customer-session browser validation |
| Description | `DEMO_CLIENT_EMAIL` / `DEMO_CLIENT_PASSWORD` absent from local env; cannot sign in as `pinnacle.engineering.demo@bobkatit.com` this session without secrets. |
| Reproduction | Attempt customer login without demo password configured. |
| Root cause | Staging safety — demo password not stored in committed env; prior SS-UX-009 used interactive credential. |
| Remediation | Not applied (no secret invention). Staff session + API isolation suites used as partial substitute. |
| Test evidence | Customer login marked **BLOCKED** in validation matrix. |
| Status | **Blocked / deferred** — release gate for dedicated demo credential re-check |

---

## DEF-017-005 — Live customer-update send/publish not re-exercised

| Field | Detail |
| --- | --- |
| Severity | **P2 — Medium** (release gate) |
| Affected | SS-UX-015 Project Communications |
| Description | Ticket forbids real customer emails. Prepare/test/send-publish live path not re-run this session. |
| Reproduction | N/A — policy blocked |
| Root cause | Staging outbound policy + missing Resend key in local `.env` (`RESEND_API_KEY` absent). |
| Remediation | Deferred; automated `ss-ux-015-project-communications` **15/15 PASS**. Prior SS-UX-015 doc covered test-send path. |
| Status | **Blocked / deferred** — controlled release gate |

---

## No P0 defects found

No confirmed cross-tenant exposure or unauthorized customer mutation during API isolation suites or staff workspace browsing.
