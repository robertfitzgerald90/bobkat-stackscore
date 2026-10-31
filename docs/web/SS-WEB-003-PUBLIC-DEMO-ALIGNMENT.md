# SS-WEB-003 — Public Demo Alignment & Interactive Product Showcase

**Project:** StackScore  
**Branch:** `staging`  
**Date:** 2026-10-30  
**Type:** Public demo / product experience  
**Status:** Implementation complete — staging validation  
**Dependencies:** SS-UX-012…018, SS-BRAND-002…004, SS-WEB-002  
**Out of scope:** SS-SNAP-001, production deploy/merge, scoring/billing/auth logic changes

---

## 1. Executive summary

The public `/demo` experience is now a **read-only customer-parity showcase** for fictional **Northstar Manufacturing**. Visitors browse Overview, Explore, Roadmap, Projects, and Reports without authentication, using the same customer presentation components and DTO shapes as the authenticated portal. Data comes from a dedicated `src/lib/public-demo` provider — no Prisma, no tenant context, no mutation endpoints.

---

## 2. Existing demo findings

| Area | Prior state |
| --- | --- |
| `/demo`, `/demo/[section]` | Marketing `ProductOverviewExperience` (phased interactive narrative) |
| Fixtures | `src/lib/product-overview/**`, `NORTHSTAR_INTERACTIVE_DEMO_SCENARIO` |
| Auth | Public via `auth.config.ts` (`pathname.startsWith("/demo")`) |
| Customer portal | Separate server DTO → props under `/clients/[id]/…` |
| Gap | Demo did not reuse customer Overview/Explore/Roadmap/Projects/Reports UI |

Specialized demos under `/demo/design-system/*`, `/demo/recommendations-workspace`, `/demo/stackscore-case-study`, and `/demo/technology-improvement-plan` remain as separate routes (outside the customer-parity workspace shell).

---

## 3. Component reuse classification

| Class | Components | Notes |
| --- | --- | --- |
| **A — Directly reusable** | `OverviewMaturityHero`, `OverviewPillarGrid`, `OverviewPriorityOpportunities`, `OverviewStrengthsExposure`, `OverviewRoadmapProgress`, `PillarSelector` / overview / strengths / intelligence tabs, `CustomerProjectsExperience`, `CustomerProjectDetail`, `ReportCard`, `formatMaturityScore`, `computeProjectProgress`, `getCustomerMaturityLabel`, brand logo | Props-only presentation |
| **B — Reusable with adapters** | `CustomerExploreExperience` (`overviewHref`), `CustomerRoadmapExperience` (`reportsHref`, `showBookingCta`), `DemoOverviewExperience`, `DemoReportsExperience`, public demo shell/nav | Path overrides; booking/assessment CTAs removed |
| **C — Not reusable** | `getCustomerOverview` et al., `(dashboard)` shell, Prisma loaders, booking/assessment mutation flows, authenticated PDF export routes | Never mounted for anonymous visitors |

---

## 4. Architecture implemented

```text
/demo → redirect /demo/overview
/demo/(workspace)/* → PublicDemoShell + customer presentation
         ↓
src/lib/public-demo/provider.ts (typed fictional DTOs)
         ↓
Customer / demo presentation components (read-only)
```

- **Data:** `src/lib/public-demo/{constants,fixtures,scoring,routes,provider}.ts`
- **Shell:** `src/components/public-demo/public-demo-shell.tsx` (customer-portal theme, DEMO ENVIRONMENT label, Sign in CTA)
- **Routes:** `/demo/overview|explore|roadmap|projects|reports|opportunities` (+ project/opportunity detail, sample report preview)
- **Legacy deep links:** `/demo/[section]` redirects into the new destinations

---

## 5. Fictional data design

| Field | Value |
| --- | --- |
| Organization | Northstar Manufacturing |
| Workspace id | `public-demo-northstar` (not a Prisma Client id) |
| Entity ids | Prefixed `demo-` |
| Scenario | Strong endpoints; inconsistent identity; moderate network; improving backup; documentation gaps; developing strategy |
| Notice | Persistent sample-data labeling in shell + reports |

No production or staging customer records were copied.

---

## 6. Scoring consistency

- Eight pillars use deterministic integer scores in `PUBLIC_DEMO_PILLAR_SCORES`.
- Maturity labels from production `getCustomerMaturityLabel` / DOC-119 bands.
- Overall StackScore = equal-weight mean of eight pillars (60 → Developing).
- Display via `formatMaturityScore` (whole numbers; SS-UX-018).
- Project progress via `computeProjectProgress` (null when zero tasks).
- Scoring engines and maturity thresholds were **not** modified.

---

## 7. Overview implementation

`DemoOverviewExperience` composes customer overview panels with demo hrefs. Omits assessment start/resume, booking, vCIO strip, and lifecycle hub links. Next action points into Explore (Identity & Access).

---

## 8. Explore implementation

Mounts `CustomerExploreExperience` with fixture `CustomerExploreDto` for all eight pillars (findings, strengths, attention, recommendations, roadmap/project links). Pillar selection uses the same `?pillar=` URL pattern as the authenticated app.

---

## 9. Roadmap implementation

Mounts `CustomerRoadmapExperience` with fictional phases/initiatives/projects. Booking CTA disabled; reports empty-state path points to `/demo/reports`.

---

## 10. Projects implementation

List + detail reuse customer project components. Progress is task-derived. No completion-report links, customer-update sends, or task mutation controls.

---

## 11. Reports implementation

`DemoReportsExperience` + `/demo/reports/sample` on-screen preview. Actions are preview-only under `/demo/*` — no authenticated PDF API hrefs.

---

## 12. Read-only enforcement

| Control | Mechanism |
| --- | --- |
| No DB | Provider is pure TypeScript fixtures |
| No tenant | Synthetic workspace id only |
| No mutations | No demo API routes; mutation CTAs removed |
| No privileged PDFs | Sample preview only |
| Path safety | All internal hrefs under `/demo/…` or `/login` |

---

## 13. Security validation

Automated tests in `tests/public-demo/ss-web-003-public-demo.test.ts` assert:

- Anonymous route surface and auth whitelist
- Demo id prefix / no `/api/v1` or client-tenant paths in workspace JSON
- Provider layer has no Prisma imports
- No assessment-start / customer-update / export-pdf / completion-report exposure in DTOs
- vCIO hidden; draft assessment null

---

## 14. Branding consistency

- `.customer-portal` theme + purple-first tokens from SS-BRAND-002…004
- Transparent Bobkat IT logo (`bkit-logo.png`) via `BrandLogo`
- **STACKSCORE / BY BOBKAT IT** in demo header
- Restrained **DEMO ENVIRONMENT** badge + sample notice
- Conversion: **Sign in to StackScore** (+ Bobkat IT attribution)

---

## 15. Responsive validation

| Width | Status |
| --- | --- |
| 1440 / 1024 / 768 / 390 / 320 | **BLOCKED** — no authenticated staging browser session in this pass |

Manual checklist included in §18 and the test matrix.

---

## 16. Accessibility findings

| Check | Status |
| --- | --- |
| Semantic nav / aria-current | Implemented in demo shell |
| Focusable Sign in / nav | Implemented |
| Score color + label (not color alone) | Inherited from customer components |
| Reduced-motion | Inherited from existing portal CSS |
| Live keyboard/browser AA pass | **BLOCKED** — manual |

---

## 17. Automated test results

| Suite | Result |
| --- | --- |
| `tests/public-demo/ss-web-003-public-demo.test.ts` | Pass (15) |
| `tests/layout/product-overview-layout.test.ts` | Pass |
| `tests/routing/critical-routes.test.ts` | Pass |
| Customer portal / UX-004 / interactive-demo-journey | Pass |
| `npm run lint` | Pass (0 errors; pre-existing warnings elsewhere) |
| `npm run build` | Pass |
| `npx tsc --noEmit` | Exit 2 — **baseline fixture failures only** (below) |

**Baseline TypeScript failures (pre-existing; not introduced by SS-WEB-003):**

- `tests/qbr/pdf-export.test.ts`
- `tests/recommendations/ss-content-002-batch1-publication.test.ts`
- `tests/technology-improvement-plan/tip-*.test.ts` (content quality, executive report, pdf, preview controls)
- `tests/technology-profile/overview.test.ts`

No `src/lib/public-demo`, `src/components/public-demo`, or `src/app/demo` TypeScript errors.

---

## 18. Browser validation results

**Status: BLOCKED** (no staging browser session available in this implementation pass).

Do not treat visual QA as passed. Manual checklist:

1. `/demo` → redirects to `/demo/overview`
2. Nav: Overview → Explore → Roadmap → Projects → Reports
3. Explore pillar switching updates intelligence
4. Open Identity Governance project; progress matches tasks
5. Reports → sample preview; no real PDF download
6. Sign in → `/login`
7. 390px / 320px: nav drawer usable; no horizontal overflow
8. Confirm DEMO ENVIRONMENT + sample labeling visible
9. Legacy `/demo/dashboard` redirects to overview

---

## 19. Files changed (primary)

| Path | Role |
| --- | --- |
| `src/lib/public-demo/**` | Fixtures, scoring, DTO provider, routes |
| `src/components/public-demo/**` | Shell + overview/reports/opportunity/sample adapters |
| `src/app/demo/(workspace)/**` | Customer-parity demo pages + layout |
| `src/app/demo/page.tsx` | Entry redirect |
| `src/app/demo/[section]/page.tsx` | Legacy deep-link redirects |
| `src/lib/interactive-demo/routes.ts` | `buildDemoHref` → new destinations |
| `src/components/customer-portal/explore/customer-explore-experience.tsx` | Optional `overviewHref` |
| `src/components/customer-portal/roadmap/customer-roadmap-experience.tsx` | Optional reports href / booking flag |
| `tests/public-demo/ss-web-003-public-demo.test.ts` | Architecture/content/security tests |
| `docs/web/SS-WEB-003-*.md` | This report + test matrix |

---

## 20. Known limitations

- Browser visual QA blocked until staging session review.
- Sample report is on-screen preview only (PDF engine not rebuilt).
- Legacy product-overview marketing components remain in-repo but are no longer the `/demo` entry experience.
- Specialized `/demo/*` design-system and case-study pages are unchanged.
- Equal-weight overall score is a presentation fixture aligned to eight pillar scores; production weighted category engines were not invoked (no assessment answer DB).

---

## 21. Production readiness assessment

| Criterion | Status |
| --- | --- |
| Customer-parity Overview/Explore/Roadmap/Projects/Reports | Met |
| Anonymous access | Met |
| Fictional deterministic data | Met |
| Read-only / no privileged ops | Met |
| Purple-first branding + transparent logo | Met |
| Whole-number scores / official maturity labels | Met |
| Automated tests | Pass |
| Lint / build | Pass |
| Browser visual QA | **Blocked** |
| Production deploy | **Do not deploy** |

**Verdict:** SS-WEB-003 implementation and automated validation are complete on `staging`. Complete the manual browser checklist before promotion. Do not begin SS-SNAP-001 without approval.
