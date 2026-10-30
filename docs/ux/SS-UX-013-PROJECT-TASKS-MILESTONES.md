# SS-UX-013 — Project Tasks, Milestones & Recommendation Relationships

**Branch:** `staging`  
**Date:** 2026-10-30  
**Database:** Staging Neon (`ep-patient-credit-atddo1zm`) — migrate deploy applied; production untouched.  
**Constraints honored:** No production deploy; reuse existing `Project`; no customer writes; no customer emails; no assessment scoring or recommendation catalog changes; no parallel Project entity; no staff dashboard redesign.

Precedent: [SS-UX-012](./SS-UX-012-CUSTOMER-PROJECTS-DASHBOARD.md).

---

## 1. Architecture summary

Extended the existing `Project` model with lightweight delivery tracking:

| Concern | Approach |
| --- | --- |
| Tasks | `ProjectTask` — tenant-scoped (`clientId` + `projectId`); customer `description` vs staff `internalNotes` |
| Milestones | `ProjectMilestone` — tenant-scoped; target + completion timestamps |
| Multi-recommendation | `ProjectRecommendation` join; legacy `Project.recommendationId` retained as primary FK |
| Progress | Pure `computeProjectProgress` — completed / total tasks × 100; `null` when zero tasks |
| Staff UI | `ProjectDeliveryPanel` embedded in existing Project Register detail |
| Customer UI | Read-only tasks/milestones/progress on Projects detail; no write APIs for clients |
| Activity | CLIENT_VISIBLE events only on task/milestone **completion** (not every edit) |
| Lifecycle | Task/milestone/link ops never change recommendation status or StackScore; project complete still syncs **primary** recommendation only |

---

## 2. Schema changes

### Enum

```prisma
enum ProjectTaskStatus {
  not_started
  in_progress
  completed
}
```

### ProjectTask

- `id`, `projectId`, `clientId`, `title`
- `description` (customer-visible) · `internalNotes` (staff-only)
- `status` (`ProjectTaskStatus`) · `dueDate` · `sortOrder` · `completedAt`
- `createdAt` / `updatedAt`
- Indexes: `(projectId, sortOrder)`, `clientId`, `status`

### ProjectMilestone

- `id`, `projectId`, `clientId`, `title`, `description`
- `targetDate` · `completedAt` · `sortOrder`
- `createdAt` / `updatedAt`
- Indexes: `(projectId, sortOrder)`, `clientId`

### ProjectRecommendation

- `id`, `projectId`, `clientId`, `recommendationId`, `isPrimary`, `createdAt`
- `@@unique([projectId, recommendationId])`
- `@@unique([recommendationId])` — a recommendation belongs to at most one project
- Legacy `Project.recommendationId @unique` **kept** for compatibility

Migration: `prisma/migrations/20261030100000_project_tasks_milestones_recommendations/`

---

## 3. Migration and rollback details

### Pre-migration inspection (staging)

| Metric | Value |
| --- | --- |
| Projects | 5 |
| Distinct `recommendationId` | 5 (unique; no dupes) |
| Orphan join rows after backfill | 0 |
| Tasks / milestones | 0 (new) |

### Forward

1. Create enum + three tables + FKs/indexes.
2. Backfill `ProjectRecommendation` from `Project.recommendationId` with `isPrimary = true`.
3. `ON CONFLICT (recommendationId) DO NOTHING`.
4. **Do not** drop `Project.recommendationId`.

Applied with `npx prisma migrate deploy` against staging Neon only. Schema status: up to date (32 migrations).

### Create-project path

`POST /api/v1/clients/[id]/projects` calls `ensurePrimaryProjectRecommendationLink` so new projects seed the join table.

### Rollback strategy

1. Stop writing to new tables (feature flag / revert app code).
2. `DROP TABLE "ProjectRecommendation"`, `"ProjectMilestone"`, `"ProjectTask"`; `DROP TYPE "ProjectTaskStatus"`.
3. Legacy `Project.recommendationId` remains intact — no data loss for existing projects.
4. Do **not** reverse on production (never applied there).

### Unresolved contract (documented)

Removing `Project.recommendationId` requires a later ticket after all consumers read from `ProjectRecommendation` and a multi-rec completion policy is product-approved.

---

## 4. Staff interface changes

Embedded in the existing Project Register (`projects-dashboard` → selected project):

**`ProjectDeliveryPanel`**

- Create / edit / status / due date / reorder / delete tasks (including internal notes).
- Create / edit / complete / reorder / delete milestones.
- Link additional recommendations; unlink non-primary with confirmation.
- Progress readout: percent when tasks exist; otherwise non-percentage empty state.

### APIs (consultant/admin only)

| Method | Path |
| --- | --- |
| GET | `/api/v1/projects/[id]/delivery` |
| GET/POST | `/api/v1/projects/[id]/tasks` |
| PATCH/DELETE | `/api/v1/projects/[id]/tasks/[taskId]` |
| POST | `/api/v1/projects/[id]/tasks/reorder` |
| GET/POST | `/api/v1/projects/[id]/milestones` |
| PATCH/DELETE | `/api/v1/projects/[id]/milestones/[milestoneId]` |
| POST | `/api/v1/projects/[id]/milestones/reorder` |
| POST/DELETE | `/api/v1/projects/[id]/recommendations` |

All guarded with `requireConsultantOrAdmin`.

---

## 5. Progress calculation rules

Implemented in `src/lib/projects/progress.ts`:

1. `progressPercent = round(completedTasks / totalTasks × 100)` when `totalTasks > 0`.
2. `progressPercent = null` when zero tasks (UI shows status-based empty state, never invents `0%` or `100%`).
3. Completing all tasks does **not** auto-complete the project.
4. Milestone completion does **not** auto-complete the project.
5. Project status remains staff-driven via existing workflows.
6. Task/milestone changes never mutate StackScore / assessment scores.

Exposed on staff delivery bundle and customer list/detail DTOs.

---

## 6. Recommendation lifecycle safeguards

| Action | Recommendation status |
| --- | --- |
| Link recommendation | Unchanged |
| Create/update/complete task | Unchanged |
| Create/complete milestone | Unchanged |
| Complete project (staff) | **Primary** (`Project.recommendationId`) → `completed` (legacy compatibility) |
| Complete project | Additional join links → **not** auto-completed |
| Reopen project | Primary → `in_progress`; additional links untouched |

**Unresolved product decision:** explicit multi-recommendation completion policy (e.g. complete all linked / complete selected / complete none beyond primary). Until then, only the primary legacy FK is synced.

---

## 7. Security validation

| Check | Result |
| --- | --- |
| Task/milestone/rec write APIs | Staff only (`requireConsultantOrAdmin`) |
| Customer pages | Ownership `clientId` match; cancelled projects 404 |
| Customer task select | Omits `internalNotes` |
| Customer projections | `toCustomerVisibleTask` / `toCustomerVisibleMilestone` strip staff fields |
| Costs / assignees / billing | Not selected into customer experience |
| Hidden recommendations | Filtered via `isClientDeliverableRecommendation` |
| Activity | `includeInternal: false`; completion events only |
| Tenant scope | Tasks/milestones/links store and query `clientId` |

---

## 8. Automated test results

```
npm test -- tests/ux/ss-ux-013-project-tasks-milestones.test.ts tests/ux/ss-ux-012-customer-projects-dashboard.test.ts
```

| Suite | Result |
| --- | --- |
| `ss-ux-013-project-tasks-milestones.test.ts` | 15 passed |
| `ss-ux-012-customer-projects-dashboard.test.ts` | 7 passed (updated for tasks/milestones DTO) |

Coverage includes: progress / zero-task; customer projections & internal-note exclusion; multi-rec DTO; reorder contracts; lifecycle source safeguards; legacy migration compatibility; staff API guards; no StackScore mutation paths; staff panel wiring.

---

## 9. Browser validation

**Environment:** local Next.js + staging Neon DB; branch `staging`.

| Surface | Result |
| --- | --- |
| Staging migrate status | Up to date; 5 projects ↔ 5 primary join rows; 0 orphans |
| Delivery service smoke (staging) | Created 2 tasks + 1 milestone on ABC project; progress `50%` (1/2); internal notes stored on staff task |
| Customer project detail | Shows **50% (1/2 tasks)** bar; both tasks with customer descriptions; milestone open; activity “Task completed…”; **no** staff internal notes |
| Customer Projects list | Remains functional (counts/filters/cards; planned 2 / active 3) |
| Staff Project Register delivery panel | Wired in `projects-dashboard` + consultant/admin APIs; interactive staff browser login not completed in this session (client session active) |

Note: first post-migration page load failed with `prisma.projectTask` undefined until `prisma generate` + dev server restart — expected after schema expand.

---

## 10. Remaining dependencies

1. **Customer notifications / daily project summaries** — model ready (`project_task_completed`, `project_milestone_completed`); email UI not implemented.
2. **Project update publish** — placeholder remains on customer detail (`showUpdatesPlaceholder`).
3. **Drop legacy `Project.recommendationId`** — after consumers migrate and multi-rec completion policy is decided.
4. **Richer staff task editor** — current panel is lightweight (title/status/due/notes); optional description polish.
5. **Production migration** — explicitly out of scope for this ticket.

---

## Key files

| Path | Role |
| --- | --- |
| `prisma/schema.prisma` | Models + enum |
| `prisma/migrations/20261030100000_project_tasks_milestones_recommendations/` | Expand + backfill |
| `src/lib/projects/progress.ts` | Progress pure function |
| `src/lib/projects/delivery-dto.ts` | Staff/customer DTO shapes + projections |
| `src/lib/projects/delivery-service.ts` | CRUD, reorder, link/unlink, activity |
| `src/lib/projects/task-schemas.ts` | Zod |
| `src/lib/projects/service.ts` | Primary-only completion sync |
| `src/components/projects/project-delivery-panel.tsx` | Staff UI |
| `src/lib/customer-portal/projects-dto.ts` | Customer DTO builders |
| `src/lib/customer-portal/projects-experience.ts` | Authorized assembly |
| `src/components/customer-portal/projects/customer-project-detail.tsx` | Customer tasks/milestones UI |
| `tests/ux/ss-ux-013-project-tasks-milestones.test.ts` | Automated coverage |
| `docs/ux/SS-UX-013-PROJECT-TASKS-MILESTONES.md` | This report |
