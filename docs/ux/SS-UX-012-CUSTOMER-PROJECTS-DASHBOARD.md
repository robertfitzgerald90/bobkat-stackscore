# SS-UX-012 — Customer Projects Dashboard & Navigation

**Branch:** `staging`  
**Date:** 2026-10-30  
**Scope:** Phase 1 customer Projects foundation (nav, dashboard, detail).  
**Constraints honored:** No production deploy; no schema migrations; no new project entities; no status mutations; no scoring/catalog/notification changes; staff Project Register unchanged.

Precedent: [SS-UX-011](./SS-UX-011-CUSTOMER-PROJECTS-DISCOVERY.md).

---

## 1. Implementation summary

Delivered a read-only customer Projects module on the existing `Project` entity:

1. **Primary nav** — Projects is the fifth item: Overview · Explore · Roadmap · **Projects** · Reports.  
2. **Dashboard** — `/clients/{clientId}/projects` with planned/active/completed/upcoming-target counts, filters, cards, empty states.  
3. **Detail workspace** — `/clients/{clientId}/projects/{projectId}` with objective, status, dates, related recommendations/initiatives, activity when present, compact “Coming next” placeholders.  
4. **Link hygiene** — Customer project deep links use workspace routes; staff register remains `/projects`.  
5. **Security** — Tenant ownership checks; DTOs omit costs, assignees, and non-deliverable recommendations; activity is CLIENT_VISIBLE only and scoped to the project id.

Progress percentages are **never invented** (`progressPercent: null` until tasks exist). Cards show status instead.

---

## 2. Files changed

| File | Role |
| --- | --- |
| `src/lib/navigation/sidebar-nav.ts` | Fifth primary nav item + active prefixes |
| `src/lib/clients/paths.ts` | Customer list/detail paths; staff register helpers clarified |
| `src/lib/navigation/page-titles.ts` | Titles for Projects list/detail |
| `src/lib/customer-portal/projects-dto.ts` | Pure DTO builders + view filters |
| `src/lib/customer-portal/projects-experience.ts` | Authorized Prisma assembly (no cost select) |
| `src/lib/customer-portal/roadmap-dto.ts` | Project hrefs → customer detail |
| `src/components/customer-portal/projects/customer-projects-experience.tsx` | Dashboard UI |
| `src/components/customer-portal/projects/customer-project-detail.tsx` | Detail UI |
| `src/app/(dashboard)/clients/[id]/projects/page.tsx` | Customer experience + staff list retained |
| `src/app/(dashboard)/clients/[id]/projects/[projectId]/page.tsx` | Detail page |
| `src/components/client-workspace/workspace-projects-list.tsx` | Staff list links to workspace + register |
| `src/components/customer-portal/customer-executive-dashboard.tsx` | Workspace hub link to Projects |
| `tests/ux/ss-ux-012-customer-projects-dashboard.test.ts` | New coverage |
| `tests/ux/ss-ux-002-customer-navigation.test.ts` | Five-item nav expectations |
| `tests/ux/ss-ux-003-customer-portal-visual.test.ts` | Nav label list updated |
| `docs/ux/SS-UX-012-CUSTOMER-PROJECTS-DASHBOARD.md` | This report |

---

## 3. Data sources

| UI element | Source |
| --- | --- |
| Project cards / counts | `Project` rows for `clientId` (cancelled excluded from default views) |
| Planned | `proposed`, `approved` |
| Active | `scheduled`, `in_progress` |
| Completed | `completed` |
| Upcoming target dates | Non-completed visible projects with `targetCompletionDate >= today` |
| Pillar | `Project.category` → pillar display |
| Description / objective | `Project.description` (customer-safe project field; not internal `Note`) |
| Expected outcome | Linked recommendation `businessImpact` when deliverable |
| Related recommendation | `Project.recommendationId` when `isClientDeliverableRecommendation` |
| Related initiatives | `ClientRoadmapInitiative` for that recommendation id |
| Activity | `OrganizationActivityEvent` with `visibility=CLIENT_VISIBLE` and `sourceRecordId=projectId` |
| Progress % | Always `null` in this ticket (no `ProjectTask` model) |

Staff Project Register (`/projects`) and create/update APIs are untouched.

---

## 4. Security validation

| Check | Result |
| --- | --- |
| Customer ownership on list/detail pages | `clientUser.clientId !== routeClientId` → `notFound()` |
| Detail query scoped | `findFirst({ where: { id, clientId } })` |
| Cancelled projects | Hidden from customer detail (`null` → 404) |
| Cost / billing fields | Not selected into customer experience |
| Internal notes | `Note` table not queried |
| Internal activity | `includeInternal: false` |
| Non-deliverable recommendations | Filtered via visibility helper before DTO |
| Staff `/projects` | Still blocked for `role=client` in auth config |
| No client-side-only auth | Server page + service enforce tenant |

---

## 5. Automated test results

```
vitest run tests/ux/ss-ux-012-customer-projects-dashboard.test.ts \
  tests/ux/ss-ux-002-customer-navigation.test.ts \
  tests/ux/ss-ux-003-customer-portal-visual.test.ts \
  tests/ux/ss-ux-007-customer-roadmap-experience.test.ts
```

**Result:** SS-UX-012 **7/7 PASS**; related nav/roadmap suites **PASS**.

Coverage includes counts/filters, no fabricated progress, customer-safe links, completion-report href, deliverable recommendation gating, and page wiring without mutations.

---

## 6. Browser validation

**Account:** staging demo `pinnacle.engineering.demo@bobkatit.com` (Pinnacle Engineering).  
**App:** local `http://localhost:3000` + staging Neon.

| Check | Result |
| --- | --- |
| Projects in primary nav (5 items) | **PASS** |
| Dashboard metrics (Planned 2 / Active 3 / Completed 0 / Upcoming 1) | **PASS** |
| Filters All / Planned / Active / Completed present | **PASS** |
| Cards show status instead of invented % | **PASS** |
| Detail workspace loads; Projects remains current | **PASS** |
| Related roadmap initiative shown when linked | **PASS** |
| Compact Coming next placeholders (not large empty panels) | **PASS** |
| Staff register redesign | **N/A** — not modified |

Cross-tenant isolation exercised via page ownership pattern + unit expectations (same pattern as SS-UX-002/006).

---

## 7. Known limitations

1. **No tasks / milestones** — placeholders only; progress % always absent.  
2. **1:1 recommendation linkage** — multi-rec projects still blocked by schema (SS-UX-011).  
3. **Sparse activity** — few CLIENT_VISIBLE project-scoped events today.  
4. **Project.description** may contain staff narrative including words like “Progress: …” — that is stored copy, not a computed progress metric.  
5. **Staff tech-profile widgets** may still deep-link to `/projects?selected=` (staff-appropriate); customer paths corrected for roadmap DTO, workspace list, and Projects module.

---

## 8. Next implementation dependencies

| Ticket theme | Depends on |
| --- | --- |
| Task checklist + progress % | `ProjectTask` migration + APIs |
| Milestones UI | `ProjectMilestone` (or agreed date-only interim) |
| Multi-recommendation projects | Join table migration |
| Customer notifications / updates feed | Staff-triggered communication + CLIENT_VISIBLE activity policy |
| Customer create-from-opportunity | Explicit product decision (read-only for now) |

---

## 9. Production readiness impact

Safe on **staging** for review. No migrations or production deploy. Promote only after task/milestone tickets (or an explicit accept of placeholder CX) and staff smoke of `/projects` register.
