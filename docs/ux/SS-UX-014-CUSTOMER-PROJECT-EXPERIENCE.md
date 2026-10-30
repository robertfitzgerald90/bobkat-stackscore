# SS-UX-014 — Customer Project Tracking Experience

**Branch:** `staging`  
**Date:** 2026-10-30  
**Database:** Staging Neon only — **no schema migrations** in this ticket.  
**Builds on:** [SS-UX-012](./SS-UX-012-CUSTOMER-PROJECTS-DASHBOARD.md), [SS-UX-013](./SS-UX-013-PROJECT-TASKS-MILESTONES.md).

**Constraints honored:** No production deploy; no customer writes/emails; no StackScore scoring or recommendation catalog changes; no unrelated redesigns; reuse existing Project / task / milestone models.

---

## 1. Implementation summary

Refined the customer project detail into a transparent tracking workspace:

1. **Overview** — objective, status, priority, pillar, start/target dates, task-derived progress %, completed/total task counts, next upcoming milestone.
2. **Tasks** — every customer-visible task, grouped **In Progress / Up Next / Completed**, with expandable details (`<details>`). Completed work stays visible.
3. **Milestone timeline** — vertical timeline with target/completion dates and overdue indication.
4. **Activity** — real CLIENT_VISIBLE project events only (task/milestone completed, project completed, etc.); no fabricated history.
5. **Related improvements** — multi-recommendation links + roadmap initiatives with navigation.
6. **Visual** — charcoal industrial panel, phosphor accents, compact metric wells; removed oversized “coming next” placeholder.

Staff Project Register delivery panel unchanged functionally; validated interactively in this ticket (SS-UX-013 leftover).

---

## 2. Files changed

| File | Role |
| --- | --- |
| `src/lib/customer-portal/projects-dto.ts` | Task groups, next milestone, overdue, activity kind filter |
| `src/components/customer-portal/projects/customer-project-detail.tsx` | Refined overview / tasks / timeline / activity / related |
| `tests/ux/ss-ux-014-customer-project-experience.test.ts` | New coverage |
| `tests/ux/ss-ux-012-customer-projects-dashboard.test.ts` | Updated for `taskGroups` / `nextMilestone` |
| `docs/ux/SS-UX-014-CUSTOMER-PROJECT-EXPERIENCE.md` | This report |

No Prisma migrations. Experience loader already selected customer-safe fields (SS-UX-013).

---

## 3. Progress & grouping rules

| Rule | Behavior |
| --- | --- |
| Progress % | `round(completed / total × 100)` when tasks exist |
| Zero tasks | `progressPercent: null` — UI shows status-based label, never invents % |
| Task groups | `in_progress` → In Progress; `not_started` → Up Next; `completed` → Completed |
| Next milestone | Earliest incomplete by target date (then list order); overdue if target &lt; today |
| Activity | Filtered to known project event types; staff-internal types excluded |
| Internal notes | Never selected into customer DTOs / UI |

---

## 4. Security validation

| Check | Result |
| --- | --- |
| Customer read-only | Detail UI has no POST/PATCH forms |
| Tenant scope | Existing `getCustomerProjectDetail(clientId, projectId)` ownership |
| Internal notes | Not in customer select; staff panel still shows them |
| Recommendations | Deliverable visibility filter preserved |
| Activity | CLIENT_VISIBLE feed + event-type allowlist |

---

## 5. Automated tests

```
npm test -- tests/ux/ss-ux-014-customer-project-experience.test.ts \
  tests/ux/ss-ux-013-project-tasks-milestones.test.ts \
  tests/ux/ss-ux-012-customer-projects-dashboard.test.ts
```

| Suite | Result |
| --- | --- |
| `ss-ux-014-customer-project-experience.test.ts` | 8 passed |
| `ss-ux-013-project-tasks-milestones.test.ts` | 15 passed |
| `ss-ux-012-customer-projects-dashboard.test.ts` | 7 passed |
| **Total** | **30 passed** |

Covers: zero/partial/100% task progress, empty milestones, overdue + next milestone, multi-rec, activity filtering, internal-note exclusion, UI wiring.

---

## 6. Browser validation

**Environment:** local Next.js + staging Neon; branch `staging`.

### Customer (prior + this ticket)

| Check | Result |
| --- | --- |
| Project detail overview | Progress from tasks; metric wells; next milestone when present |
| Grouped tasks / expandable details | Present in refined UI |
| Milestone timeline | Vertical timeline; overdue styling when applicable |
| Internal notes | Not shown on customer surface |

### Staff Project Register (SS-UX-013 interactive completion)

Signed in as `admin@bobkatit.com` → `/projects?selected=026b8854-…` (Formalize administrative account controls):

| Action | Result |
| --- | --- |
| Delivery panel load | Progress shown; staff internal notes visible |
| Create task | “SS-UX-014 staff: Document admin break-glass process” persisted |
| Reorder tasks | Move up/down persisted (order changed after reload) |
| Complete task | Progress moved **50% → 33% (1/3) → 67% (2/3)** |
| Complete milestone | “Admin controls formalized” → Complete / Reopen |
| Create milestone | “SS-UX-014 staff: Break-glass docs reviewed” persisted (appears as next open milestone) |
| Recommendation lifecycle | Primary link unchanged (`accepted`); no silent catalog/status side effects observed |
| Customer detail after staff edits | **67%** / 2 of 3 tasks; grouped Up Next + Completed; timeline + activity; **no** internal notes |

---

## 7. Remaining limitations

1. **Project status-change activity** — only recorded when an activity event already exists; staff status edits do not yet emit a dedicated `project_status_changed` event.
2. **Published project updates / emails** — still out of scope.
3. **Staff task description editor** — create UI is title-first; description/internal notes can be expanded later.
4. **Production** — not deployed; staging-only.

---

## 8. Stop for review

Customer tracking experience and staff delivery-panel browser validation are complete on staging. Awaiting review before further tickets.
