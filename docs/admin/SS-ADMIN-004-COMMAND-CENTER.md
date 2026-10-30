# SS-ADMIN-004 — Administrative Command Center

**Project:** StackScore  
**Branch:** `staging`  
**Date:** 2026-10-30  
**Status:** Implemented on staging  
**Type:** Administrative UX / operational intelligence  
**Baseline:** SS-ADMIN-001–003

---

## 1. Executive summary

`/dashboard` is now an operational **Command Center** with six sections: Business Pulse, Needs Attention, Client Portfolio, Project Delivery, Recent Activity, and Quick Actions.

Implementation **composes existing services** (`getDashboardSummary`, lead summary stats, `computeProjectProgress`, `getRecentOrganizationActivity`, subscription/recurring-service counts). No schema changes, no scoring changes, no lead-model merge, no customer Overview redesign.

---

## 2. Existing services reused

| Concern | Source |
| --- | --- |
| Client portfolio rows / official scores | `getDashboardSummary` → `buildPortfolioClientCard` |
| Active projects KPI | `countDashboardActiveProjects` / `OPEN_PROJECT_STATUSES` |
| Project progress % | `computeProjectProgress` (task completion only) |
| Snapshot lead stats | `getTechnologySnapshotLeadSummaryStats` |
| Website new leads | `countNewWebsiteLeads` |
| Activity feed | `getRecentOrganizationActivity` |
| Recurring clients | Distinct `Subscription` (`stackscore_vcio`, active/trialing) ∪ `RecurringService` (active/pending_activation) |
| Assessment counts | `prisma.assessment.count` by `draft` / `completed` |

---

## 3. Files changed

| File | Role |
| --- | --- |
| `src/lib/dashboard/command-center.ts` | Composition loader |
| `src/lib/dashboard/command-center-types.ts` | DTOs |
| `src/lib/dashboard/command-center-rules.ts` | Pure KPI/attention/quick-action rules |
| `src/lib/dashboard/index.ts` | Exports |
| `src/components/dashboard/dashboard-view.tsx` | Six-section UI |
| `src/app/(dashboard)/dashboard/page.tsx` | Role-aware load + customer redirect |
| `tests/dashboard/ss-admin-004-command-center.test.ts` | Automated coverage |
| `docs/admin/SS-ADMIN-004-COMMAND-CENTER.md` | This deliverable |

---

## 4. Data source mapping

| Section | Data |
| --- | --- |
| Business Pulse | Dashboard KPIs + assessment counts + lead stats (admin) + recurring distinct clients |
| Needs Attention | Draft assessments, overdue tasks/milestones, draft customer updates, lead follow-ups (admin), portfolio immediate-focus clients |
| Client Portfolio | `dashboard.clients` (official score; unassessed = “—” / Not assessed) |
| Project Delivery | Active projects + `computeProjectProgress` + overdue aggregates |
| Recent Activity | `OrganizationActivityEvent` via existing feed |
| Quick Actions | Static role-filtered route list |

---

## 5. KPI definitions

| Metric | Definition |
| --- | --- |
| Total Clients | Non-archived `Client` count (from dashboard summary) |
| Active Assessments | `Assessment.status = draft` |
| Completed Assessments | `Assessment.status = completed` |
| Active Projects | Dashboard active statuses (proposed→in_progress) |
| Open Leads (admin) | Snapshot (`new` + `follow_up`) + Website (`NEW`). **Prospect omitted.** |
| Recurring Service Clients | Distinct clients with active/trialing vCIO subscription **or** active/pending recurring service |

---

## 6. Needs Attention rules

Only persisted signals. Ordered by `sortAt` ascending (overdue/age), then title.

| Signal | Rule |
| --- | --- |
| Assessment draft | Status draft → `/assessments/{id}` |
| Overdue task | `dueDate < now` and not completed on active project |
| Overdue milestone | `targetDate < now` and `completedAt` null |
| Customer update draft | `ProjectCustomerUpdate.status = draft` |
| Lead follow-up | Admin: snapshot `follow_up` count and website `NEW` count |
| Client focus | `immediateFocusCount > 0` from portfolio card |

Empty state: positive “nothing requires attention” copy — no fabricated alerts.

---

## 7. Client Portfolio behavior

- Official StackScore from portfolio card / technology profile path (not projected improvement).
- Unassessed clients show “—” and “Not assessed”.
- Links to `/clients/{id}/technology-profile`.
- Admin link to full `/portfolio`.
- Compact maturity distribution retained from prior dashboard.

---

## 8. Project Delivery behavior

- Reuses task-based `computeProjectProgress` (null when zero tasks).
- Overdue task/milestone counts scoped to active projects.
- Recently completed = completed in last 30 days.
- Rows link to client workspace project detail.

---

## 9. Recent Activity sources

`getRecentOrganizationActivity` only. No new audit system. Items show title, client, timestamp, and existing href when available.

---

## 10. Role-aware visibility

| Role | Behavior |
| --- | --- |
| Admin | Full pulse including Open Leads; lead attention; Review Leads action |
| Technician | No Open Leads metric; no lead attention; no Review Leads action |
| Customer | Redirected to customer Overview (unchanged) |

---

## 11. Performance considerations

- Bounded lists (attention 8, portfolio 10, projects 6, activity 8).
- Parallel `Promise.all` for pulse enrichments.
- Aggregations via `count` / limited `findMany` — no assessment response payloads.
- Avoids calling full Insights/Consulting workspace loaders on this page.

---

## 12. Automated test results

| Suite | Result |
| --- | --- |
| `tests/dashboard/ss-admin-004-command-center.test.ts` | **Pass** (7) |
| `tests/dashboard/active-projects.test.ts` | **Pass** |
| SS-ADMIN-002 / 003 / customer nav | **Pass** |
| Auth isolation + assessment scoring suites | **Pass** |
| ESLint (touched files) | **Clean** |
| `tsc --noEmit` | Pre-existing fixture failures only (TIP/QBR/recommendations) |
| `npm run build` | **Pass** |

---

## 13. Browser validation results

| Check | Status |
| --- | --- |
| Admin / technician visual Command Center | **Blocked** — no staff staging session in agent environment |
| Customer Overview preservation | **Unit-covered** (redirect + customer nav); visual blocked |
| Responsive viewports | Structure responsive; live sweep blocked |

---

## 14. Known limitations / intentional omissions

1. **Prospect** not included in Open Leads (Communications domain; models not merged).
2. **No AI / synthetic health scores.**
3. **Consulting Workspace / Insights** remain full modules — Command Center does not duplicate their pipelines.
4. Activity feed limited to organization activity events already recorded.
5. Portfolio list capped; deeper analysis stays on `/portfolio`.

---

## 15. Recommendations for SS-ADMIN-005

1. Optional per-user notification strip from `listOperationalNotifications` if product wants personalized alerts.
2. Technician-safe website/snapshot lead counts if ops need limited visibility.
3. Dedicated “Open Leads” breakdown panel linking Snapshot vs Website without a combined KPI.
4. Visual identity reskin (green industrial tokens) after IA/Command Center settle.
5. Soften N+1 profile enrichment by extending `getDashboardSummary` with `lastAssessedAt` on rows.

**Do not start SS-ADMIN-005 without explicit approval.**

---

## Implementation summary

Command Center composes existing dashboard, lead, project-progress, activity, and subscription data into six actionable sections with role-aware lead visibility; business logic modules are unchanged; validation docs note blocked browser checks and pre-existing `tsc` fixture debt.
