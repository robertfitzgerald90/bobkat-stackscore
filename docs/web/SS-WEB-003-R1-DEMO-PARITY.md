# SS-WEB-003-R1 — Public Demo Customer Experience Parity

**Project:** StackScore  
**Branch:** `staging`  
**Date:** 2026-10-30  
**Parent:** SS-WEB-003  
**Status:** Implementation complete — visual side-by-side QA blocked  
**Type:** Corrective presentation parity

---

## 1. Executive summary

SS-WEB-003 delivered fictional data and read-only routes, but Overview/Reports/shell were still **demo-specific approximations**. R1 mounts the **same customer page compositions** (`CustomerExecutiveDashboard`, `CustomerExploreExperience`, `CustomerRoadmapExperience`, `CustomerProjectsExperience`, `CustomerProjectDetail`, `CustomerReportsExperience`, `CustomerRecommendationsView`) behind typed demo adapters, and aligns the demo chrome with customer portal sidebar/header tokens.

---

## 2. Root cause of legacy presentation

| Cause | Detail |
| --- | --- |
| Parallel Overview | `DemoOverviewExperience` recomposed overview children instead of `CustomerExecutiveDashboard` |
| Parallel Reports | `DemoReportsExperience` duplicated Reports layout/copy |
| Parallel shell | Custom aside/header did not use `executive-os` + `AppSidebar` customer tokens / watermark |
| Hardcoded client paths | Customer compositions embedded `/clients/[id]/…` builders — needed centralized href adapters, not forked UI |

---

## 3. Customer / demo component comparison

| Area | Customer component | Prior demo component | Difference | Required change (R1) |
| --- | --- | --- | --- | --- |
| Overview | `customer-executive-dashboard.tsx` | `demo-overview-experience.tsx` | Parallel composition | Mount shared dashboard + workspace/href adapters |
| Explore | `explore/customer-explore-experience.tsx` | Same (already) | Already shared | Keep + `overviewHref` |
| Roadmap | `roadmap/customer-roadmap-experience.tsx` | Same (already) | Already shared | Keep + booking off |
| Projects list | `projects/customer-projects-experience.tsx` | Same (already) | Already shared | Keep |
| Project detail | `projects/customer-project-detail.tsx` | Same (already) | Already shared | Keep |
| Reports | `reports/customer-reports-experience.tsx` | `demo-reports-experience.tsx` | Parallel composition | Mount shared Reports + booking/overview adapters |
| Opportunities | `customer-recommendations-view.tsx` | `demo-opportunities-list.tsx` | Parallel list | Mount shared recommendations view + `basePath` |
| Shell / nav | `dashboard-shell.tsx` + `app-sidebar.tsx` | Custom `public-demo-shell.tsx` | Different chrome | Rebuild shell with customer tokens + watermark |
| Data | `getCustomer*` Prisma loaders | `getPublicDemo*` fixtures | Expected | Keep fictional provider |

---

## 4. Shared presentation architecture

```text
CustomerExperience compositions (props-only)
        ↑
   Demo route pages
        ↑
 public-demo provider + presentation adapters
 (fictional DTOs, /demo hrefs, booking off)
```

Optional props added to shared compositions (no card-level demo branching):

- `CustomerExecutiveDashboard`: `workspaceLinks`, `recommendationsHref`, `showBookingCta`
- `CustomerReportsExperience`: `overviewHref`, `showBookingCta`
- `CustomerRecommendationsView`: `basePath`
- Existing: Explore `overviewHref`, Roadmap `reportsHref` / `showBookingCta`

---

## 5. Overview changes

`/demo/overview` → `CustomerExecutiveDashboard` with `getPublicDemoWorkspaceLinks()` and booking disabled. Same section order as authenticated Overview (hero, vCIO strip when shown, next action, pillars, priorities, strengths, roadmap progress, workspace hub). Demo workspace hub omits lifecycle/vCIO (vcio.show=false).

Removed: `demo-overview-experience.tsx`.

---

## 6. Explore changes

Unchanged mount of `CustomerExploreExperience` (Intelligence Center). Still uses production DTO shape from fixtures.

---

## 7. Roadmap changes

Unchanged mount of `CustomerRoadmapExperience` with demo reports href and booking off.

---

## 8. Projects changes

Unchanged mounts of list + `CustomerProjectDetail` with task-derived progress.

---

## 9. Reports changes

`/demo/reports` → `CustomerReportsExperience` with sample metadata / preview actions under `/demo/reports/sample`. Booking CTA hidden.

Removed: `demo-reports-experience.tsx`.

---

## 10. Navigation changes

`PublicDemoShell` now uses:

- `executive-os` + `.customer-portal`
- Sidebar `bg-sidebar` / `EXECUTIVE_OS_SIDEBAR_LINK*` / `customer-nav-active-rail`
- `CustomerPortalWatermark`
- Customer-style header (page title + Sign in; no user menu)
- Persistent **DEMO ENVIRONMENT** badge
- Same primary destinations: Overview, Explore, Roadmap, Projects, Reports

---

## 11. Fictional data adapters

- `src/lib/public-demo/provider.ts` — DTOs
- `src/lib/public-demo/presentation.ts` — workspace hub + page titles
- `getPublicDemoOpportunitiesDto` — `buildCustomerOpportunitiesDto` + demo href remap

No Prisma, no tenant session, no mutation APIs.

---

## 12. Read-only enforcement

- Booking/assessment CTAs suppressed via adapters
- Report actions stay on `/demo/…` preview paths
- Project `completionReportHref` null
- Shell exposes Sign in only (no privileged menus)

---

## 13. Automated tests

| Suite | Result |
| --- | --- |
| `tests/public-demo/ss-web-003-r1-demo-parity.test.ts` | Added — shared composition assertions |
| Existing `ss-web-003-public-demo.test.ts` | Retained |
| Customer portal / UX-004 | Run in validation pass |

---

## 14. Visual comparison results

| Pair | Status |
| --- | --- |
| Customer Overview ↔ Demo Overview | **BLOCKED** — no authenticated staging browser |
| Explore / Roadmap / Projects / Detail / Reports | **BLOCKED** |
| Screenshots | Not captured |

### Manual side-by-side QA checklist

1. Open customer Overview and `/demo/overview` at 1440px — same section order and card chrome.  
2. Repeat Explore (pillar + tabs), Roadmap, Projects list/detail, Reports at 1440 / 768 / 390.  
3. Confirm only expected differences: Northstar sample data, DEMO ENVIRONMENT, Sign in, no booking.  
4. Confirm sidebar active rail / watermark match customer portal styling.

---

## 15. Remaining differences (expected)

- Fictional organization and scores
- DEMO ENVIRONMENT indicator + sample notice
- Sign in instead of account menu
- No Technology Lifecycle / vCIO hub entries (not entitled in sample)
- Sample report preview (no real PDF)
- Opportunities live under `/demo/opportunities` (not `/clients/…/recommendations`)

---

## 16. Known limitations

- Browser visual parity not confirmed in this pass  
- Demo shell is a presentation twin of customer chrome, not a literal mount of `DashboardShell` (requires auth user)  
- Baseline TIP/QBR `tsc` fixture failures remain unrelated

---

## 17. Production readiness assessment

| Experience | Shared presentation | Functional parity | Visual parity | Status |
| --- | --- | --- | --- | --- |
| Overview | Yes — `CustomerExecutiveDashboard` | Yes (read-only) | Pending browser | Code complete |
| Explore | Yes — `CustomerExploreExperience` | Yes | Pending | Code complete |
| Roadmap | Yes — `CustomerRoadmapExperience` | Yes | Pending | Code complete |
| Projects | Yes — list + detail | Yes | Pending | Code complete |
| Reports | Yes — `CustomerReportsExperience` | Yes (sample preview) | Pending | Code complete |
| Opportunities | Yes — `CustomerRecommendationsView` | Yes | Pending | Code complete |
| Navigation | Customer tokens / watermark | Yes | Pending | Code complete |

**Verdict:** R1 presentation parity is implemented on `staging`. Do not declare final visual parity until the side-by-side browser checklist passes. Do not deploy to production. Do not start SS-SNAP-001 without approval.
