# SS-WEB-003-R2 — Retire Legacy Demo and Enforce Actual Platform Parity

**Project:** StackScore  
**Branch:** `staging`  
**Date:** 2026-10-30  
**Priority:** P0  
**Parent:** SS-WEB-003 / SS-WEB-003-R1  
**Status:** Implementation complete — visual browser comparison blocked

---

## 1. Root cause

SS-WEB-003-R1 mounted customer compositions under `/demo/(workspace)/*`, but **obsolete marketing demos remained live** as sibling routes under `/demo/*` and via `/api/product-overview/pdf`. Visitors (or stale bookmarks) could still open:

- TIP marketing tour with pricing / investment figures
- Recommendations workspace marketing frame
- Portfolio case-study green/legacy visuals
- Design-system phase previews
- Speculative interactive-demo PDF generation

That made the “public demo” appear to still be the legacy product showcase even when `/demo` itself redirected to Overview.

---

## 2. Public demo route inventory

| Route | Pre-R2 renderer | Post-R2 |
| --- | --- | --- |
| `/demo` | Redirect → `/demo/overview` | Unchanged |
| `/demo/overview` | `CustomerExecutiveDashboard` | Unchanged (source of truth) |
| `/demo/explore` | `CustomerExploreExperience` | Unchanged |
| `/demo/roadmap` | `CustomerRoadmapExperience` | Unchanged |
| `/demo/projects` | `CustomerProjectsExperience` | Unchanged |
| `/demo/projects/[projectId]` | `CustomerProjectDetail` | Unchanged |
| `/demo/reports` | `CustomerReportsExperience` | Unchanged |
| `/demo/reports/sample` | Sample preview | Unchanged |
| `/demo/opportunities` | `CustomerRecommendationsView` | Unchanged |
| `/demo/[section]` | Legacy deep-link redirects | Unchanged |
| `/demo/technology-improvement-plan` | TIP marketing demo | **→ `/demo/overview`** |
| `/demo/recommendations-workspace` | Marketing recommendations demo | **→ `/demo/opportunities`** |
| `/demo/stackscore-case-study` | Portfolio visuals preview | **→ `/demo/overview`** |
| `/demo/design-system/phase-1..3` | Design-system previews | **→ `/demo/overview`** |
| `/product-overview` | Redirect → `/demo` (next.config) | Unchanged |
| `/api/product-overview/pdf` | Generated financial demo PDF | **HTTP 410 Gone** |

Landing / nav CTAs (`buildDemoHref`, Explore Demo) continue to resolve to `/demo` → Overview.

---

## 3. Legacy components identified

Still in-repo (not publicly routed after R2):

- `src/components/product-overview/**`
- `src/components/marketing-demo/**`
- `src/components/portfolio/stackscore/**`
- `src/app/demo/technology-improvement-plan/tip-demo-page-client.tsx` (orphaned client; page redirects)

Public presentation no longer mounts these for `/demo` visitors.

---

## 4. Legacy routes retired

Canonical map: `src/lib/public-demo/legacy-routes.ts` → `RETIRED_PUBLIC_DEMO_REDIRECTS`.

Each retired `page.tsx` uses `permanentRedirect` only (no legacy UI import).

---

## 5. Current shared components used

Unchanged from R1 — authenticated customer compositions:

- Overview: `CustomerExecutiveDashboard`
- Explore: `CustomerExploreExperience`
- Roadmap: `CustomerRoadmapExperience`
- Projects: `CustomerProjectsExperience` + `CustomerProjectDetail`
- Reports: `CustomerReportsExperience`
- Opportunities: `CustomerRecommendationsView`
- Shell: `PublicDemoShell` (customer portal tokens)

---

## 6. Fictional data architecture

`src/lib/public-demo/{fixtures,provider,presentation,scoring}.ts` — deterministic Northstar data, no Prisma, no tenant queries. Fixture copy scrubbed of currency markers and “budget/spend” phrasing where it implied financial demo content.

---

## 7. Scoring validation

- Eight current pillars (`TECHNOLOGY_PILLARS`)
- Single official StackScore = equal-weight mean of pillar scores
- Labels via `getCustomerMaturityLabel`
- Whole-number display via `formatMaturityScore`
- No projected / effective score fields in workspace JSON

---

## 8. Financial information removal

| Action | Detail |
| --- | --- |
| Retired TIP / product-overview PDF surfaces | Removed public pricing/investment demos |
| Payload scrub tests | Forbid `$digit`, `/month`, ROI, monthly recurring, etc. |
| Fixture copy | No currency amounts; no speculative spend language |

Authenticated billing/TIP pricing elsewhere **unchanged**.

---

## 9. Security validation

- Anonymous `/demo/*` customer-parity routes remain public
- No mutation endpoints added
- PDF API returns **410** (no financial PDF generation)
- Demo DTOs use `demo-` / `public-demo-northstar` ids only

---

## 10. Automated test results

| Suite | Result |
| --- | --- |
| `tests/public-demo/ss-web-003-r2-legacy-retirement.test.ts` | **7/7 pass** |
| `tests/public-demo/ss-web-003-r1-demo-parity.test.ts` | **12/12 pass** |
| `tests/public-demo/ss-web-003-public-demo.test.ts` | **15/15 pass** |
| `tests/portfolio/stackscore-case-study.test.ts` | **3/3 pass** (redirect expectations) |
| `tests/api/public-endpoint-guardrails.test.ts` | **9/9 pass** (PDF → 410) |
| `npm run lint` | **0 errors** (22 preexisting warnings unrelated to R2) |
| `npm run build` | **pass** |

### Preexisting failures (not introduced by R2)

| Check | Notes |
| --- | --- |
| `npx tsc --noEmit` | Exit 2 — TIP/QBR/recommendations/technology-profile fixture type drift in `tests/**` |
| `tests/api/route-registry.test.ts` | Registry lists 124 paths vs 112 filesystem routes (missing project milestone/task/delivery routes on disk) |

---

## 11. Browser validation results

**BLOCKED / visual parity pending** — no authenticated staging browser session in this pass.

Do not claim visual parity solely from unit tests.

### Manual validation steps

1. Hit each retired path; confirm redirect to Overview or Opportunities.  
2. Confirm `/api/product-overview/pdf` returns 410.  
3. Side-by-side customer vs `/demo/*` at 1440 / 768 / 390 for Overview, Explore, Roadmap, Projects, Detail, Reports.  
4. Search page source for `$`, “monthly recurring”, “projected score”, “Strategy & Governance”.  
5. Confirm purple customer chrome + DEMO ENVIRONMENT; no green legacy tour UI.  
6. Confirm “Living execution plan” copy matches the authenticated customer Overview hub (current product language — not a legacy marketing tour).

---

## 12. Screenshots

Not captured (browser blocked). Attach staging captures here after manual QA.

---

## 13. Remaining differences (expected)

- Fictional Northstar data
- DEMO ENVIRONMENT + Sign in
- Sample report preview (no real PDF)
- No lifecycle/vCIO hub (sample entitlement)
- In-repo legacy marketing components (`product-overview`, `marketing-demo`, `portfolio/stackscore`) remain for non-public reuse but are not mounted by public `/demo` routes

---

## 14. Production readiness

| Gate | Status |
| --- | --- |
| Legacy public demos redirected / 410 | Met |
| Live demo uses customer compositions | Met (code + build) |
| Financial speculative content removed from public demo payloads | Met (automated) |
| Scoring consistency | Met (automated) |
| Browser visual comparison | **Pending** |
| Production deploy | **Do not deploy** (staging only) |

**Verdict:** R2 retires obsolete public demo surfaces and keeps the served `/demo` experience on the customer-parity path. **Not complete for promotion** until the manual browser checklist confirms visual parity with the authenticated customer portal.
