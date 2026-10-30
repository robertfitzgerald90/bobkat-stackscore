# SS-UX-011 — Customer Projects Module Discovery

**Branch:** `staging`  
**Date:** 2026-10-30  
**Type:** Discovery & architecture only — **no implementation**  
**Constraints honored:** No application code, schema, or production configuration changes in this ticket.

**Governing docs consulted:** DOC-105 (Project Generation), DOC-123 (Workflows), DOC-124 (Service Layer), DOC-201 / SS-UX-002 (customer nav), SS-UX-007 (roadmap projects panel).

---

## 1. Executive summary

StackScore already has a real **`Project`** entity (Client-scoped, recommendation-linked, staff-managed lifecycle) plus list/detail APIs, a staff Project Register, a thin customer list page, roadmap project summaries, and completion-report / email workflows.

What customers need for a fifth primary nav item (**Projects**) is largely **presentation and product wiring**, not a second project system — with important exceptions:

| Gap | Severity |
| --- | --- |
| No `ProjectTask` / milestone tables (DOC-105 / DOC-124 describe them; schema does not) | **High** — required for checklist progress |
| `Project.recommendationId` is **1:1 unique** (docs allow many recommendations → one project) | **High** — blocks multi-rec linking |
| Customer **cannot** create or edit projects (PATCH/POST are consultant/admin only) | **High** — product must decide write scope |
| Customer Projects page is list-only; no workspace; primary nav omits Projects | **Medium** |
| Deep links often point at staff `/projects` (customers are redirected away) | **Medium** — broken customer UX today |
| No dedicated customer activity feed for projects (only sparse `OrganizationActivityEvent` on share/complete) | **Medium** |
| Progress % not modeled; would invent values if derived without tasks | **Policy** — align with SS-UX-011 rules |

**Recommendation:** Reuse `Project` as the single execution entity. Add lean task (and optional milestone) models, soften recommendation linkage to many-to-many, build a customer-portal Projects experience parallel to Roadmap/Opportunities (DTO + experience + UI), and keep staff Project Register for operations/billing. Do **not** invent a parallel “CustomerProject” table.

---

## 2. Current architecture

### 2.1 Prisma — project-related models

#### `Project` (implemented)

| Field | Notes |
| --- | --- |
| `id`, `clientId` | Tenant boundary = **Client** |
| `recommendationId` | **Required + `@unique`** → exactly one project per recommendation |
| `title`, `description` | Description doubles as staff “notes” in serialize |
| `status` | `proposed` → `approved` → `scheduled` → `in_progress` → `completed` / `cancelled` |
| `priority` | Shared `Priority` enum |
| `categoryId` | Assessment category / pillar |
| `estimatedImpactPoints`, `actualImpactPoints` | Impact tracking; completion does not mutate official StackScore |
| `estimatedCost` | Staff/billing; scrub for customers |
| `assignedUserId` | Staff assignee (out of customer task scope) |
| `startDate`, `targetCompletionDate`, `completedAt` | Dates exist on model |
| Relations | `Document[]`, `Note[]`, `CommunicationMessage[]`, invoices/deposits, billing |

**Not on `Project` today:** objective, expected outcome, progress percent, milestones, tasks, multi-recommendation links, roadmap initiative FK.

#### Related models (adjacent, not tasks)

| Model | Relationship to projects |
| --- | --- |
| `AssessmentRecommendation` | Optional `project` (1:1 inverse of unique FK) |
| `ClientRoadmapInitiative` | Links to **recommendation**, not `Project` — roadmap↔project is **indirect** |
| `Note` | Optional `projectId`; `noteType` includes `project`; `visibility` internal / client_visible |
| `Document` | Optional `projectId` |
| `OrganizationActivityEvent` | Category `PROJECT`; visibility INTERNAL / CLIENT_VISIBLE |
| Demo UI only | `ProjectMilestoneTimeline` under product-overview — **not** backed by Prisma |

#### Missing relative to DOC-105 / DOC-124 / this ticket

- **`ProjectTask`** (or equivalent) — not in schema  
- **`ProjectMilestone`** — not in schema  
- **`ProjectRecommendation` join** — not in schema (blocked by unique FK)  
- Explicit customer-facing objective / outcome fields — not in schema (could start as structured text in `description` or additive columns)

### 2.2 API routes (no Server Actions)

| Route | Methods | Auth today |
| --- | --- | --- |
| `GET /api/v1/projects` | List + summary; clients scoped to own `clientId` | Session; client OK (read) |
| `GET /api/v1/projects/[id]` | Detail | Client OK if same tenant |
| `PATCH /api/v1/projects/[id]` | Status/notes/dates/assignee; completion syncs recommendation | **Consultant/admin only** |
| `DELETE /api/v1/projects/[id]` | Hard delete via records helper | **Admin only** |
| `POST …/cancel`, `deletion-preview` | Operational | Staff-oriented |
| `GET /api/v1/clients/[id]/projects` | Paginated client list | Client workspace access |
| `POST /api/v1/clients/[id]/projects` | Create from recommendation; sets rec → `accepted` | **Consultant/admin only** |

Service logic: `src/lib/projects/service.ts` (`updateProjectWithWorkflow`, `completeProjectWithNotifications`), schemas in `schemas.ts`, serialize in `serialize.ts`.

**Completion side effect (important):** completing a project sets the linked recommendation to `completed`. Creating a project sets recommendation to `accepted`. Ticket requirement “do not automatically mark recommendations complete when projects are created” is **already satisfied for create**; completion still closes the recommendation (aligns with DOC-105).

### 2.3 UI surfaces

| Surface | Audience | Capability |
| --- | --- | --- |
| `/projects` + `ProjectsDashboard` | Staff | Register, filters, sheet edit (status/notes), admin delete |
| `/clients/[id]/projects` | Customer + staff | Thin list (`WorkspaceProjectsList`); customer shell styling |
| Roadmap `RoadmapProjectsPanel` | Customer | Up to 8 non-cancelled projects; href → `/clients/{id}/projects` |
| Technology profile / journey | Mixed | Active/completed project summaries; some hrefs still `/projects?…` |
| `CreateProjectFromRecommendationButton` | Staff recommendations UI | POST create; “open” links to `/projects?selected=` |
| Completion report page | Mixed | `/clients/[id]/projects/[projectId]/completion-report` |
| Product Overview demo | Marketing/demo | Fake milestone timeline — **do not reuse as data model** |

### 2.4 Navigation & access

- **Customer primary nav (SS-UX-002):** Overview · Explore · Roadmap · Reports — **Projects not listed**.  
- Projects paths are under Roadmap `activePathPrefixes` (secondary reachability).  
- `CLIENT_VISIBLE_WORKSPACE_SECTIONS` **includes** `projects` → `/clients/{id}/projects` is allowed.  
- Auth config **redirects clients away from** `/projects` (staff register).  
- Stale path helpers: `clientProjectDetailPath` / list “Open in Project Register” still target `/projects?client=&selected=` — **broken for customers**.

### 2.5 Permissions summary

| Action | Customer (`role=client`) | Staff |
| --- | --- | --- |
| List own projects | Yes (API + page) | Yes |
| View project detail API | Yes (tenant check) | Yes |
| Create from recommendation | **No** | Yes |
| Update status / dates / notes | **No** | Yes |
| Delete | **No** | Admin |
| See estimated cost | Should scrub (pattern exists elsewhere; customer list currently selects cost — risk to verify/scrub in implementation) | Yes |

**Customer project editing is not supported today.** Any customer write path (tasks, notes, create-from-opportunity) is new product + API surface, not a toggle.

### 2.6 Recommendation ↔ project ↔ roadmap

```
AssessmentRecommendation 1──1 Project          (schema unique)
AssessmentRecommendation 1──* ClientRoadmapInitiative
ClientRoadmapInitiative *──1 ClientRoadmapPhase *──1 ClientRoadmap
```

- Creating a project does **not** create a roadmap initiative.  
- Roadmap panel loads projects by `clientId`, not by joining initiatives.  
- Multi-recommendation → one project is **documented** (DOC-105 / DOC-124) but **not implemented**.

### 2.7 Activity / history

- `OrganizationActivityEvent` with `category: PROJECT` used when projects are shared / completion workflows run — mostly **INTERNAL**.  
- `Note` can attach to projects with `client_visible` — underused for customer timelines.  
- No chronological customer “project activity” API.  
- Status changes via PATCH do **not** systematically write activity events.

---

## 3. Existing capabilities (reuse)

| Capability | Status | Reuse path |
| --- | --- | --- |
| Client-scoped Project entity | Exists | Keep as sole project aggregate |
| Status / priority / dates / impact fields | Exists | Surface on customer DTOs (extend `serialize` / new customer DTO) |
| List + summary counts | Exists (API + staff dashboard) | Customer dashboard can reuse status buckets (`OPEN` / `ACTIVE` / completed) |
| Create from recommendation (staff) | Exists | Pattern for customer create if authorized |
| Completion → recommendation complete + email | Exists | Keep; do not close rec on create |
| Customer list page + Roadmap panel | Exists | Evolve into primary Projects module |
| Completion report | Exists | Link from completed project workspace |
| Client tenancy helpers | Exists | `requireClientWorkspaceAccess`, auth section allowlist |
| Customer portal theme / shells | Exists | `ClientPageShell`, equal-card grids, status badges (SS-UX-003+) |
| Activity recording helper | Exists | `recordOrganizationActivity` — extend carefully |
| Financial scrub patterns | Exists | `src/lib/financial/customer-facing.ts` |

---

## 4. Missing capabilities

| Required experience | Gap |
| --- | --- |
| Primary nav **Projects** | Not in `getCustomerSidebarNav` |
| Dashboard: active / planned / completed counts, upcoming milestones, progress, target dates | Partial counts possible from status; **no milestones**; dates not in customer DTO; **no progress** |
| Project workspace (objective, outcome, checklist, next steps, timeline, history, linked recs/initiatives) | List only; no detail route for customers |
| Task management (title, status, due, notes; no assignees) | **No model / API / UI** |
| Progress from task completion; no invented % | Needs tasks + presentation rule |
| Create project from recommendation (customer) | Staff-only POST |
| Link **multiple** recommendations to one project | Blocked by unique FK |
| Preserve rec visibility on create (not auto-complete) | Create OK; need to avoid over-aggressive `accepted` if customer-driven create is softer |
| Related roadmap initiatives | Join via shared recommendation IDs — queryable, not surfaced |
| Customer-safe deep links | Fix paths away from `/projects` |
| Activity history without write storms | Design event policy (below) |

---

## 5. Recommended customer experience

### 5.1 Navigation

Promote **Projects** as fifth primary item:

`Overview | Explore | Roadmap | Projects | Reports`

- Href: `/clients/{clientId}/projects`  
- Remove `/projects` from Roadmap-only active prefixes; give Projects its own `activePathPrefixes` (list + future detail + completion-report).  
- Staff nav unchanged (`/projects` register remains operational).

### 5.2 Projects dashboard

Single customer page composition (DTO-driven, like Roadmap/Opportunities):

1. **Summary strip** — Planned (`proposed`/`approved`), Active (`scheduled`/`in_progress`), Completed (`completed`). Exclude cancelled from defaults.  
2. **Upcoming milestones** — from new milestone model or, until then, next `targetCompletionDate` among open projects as a lightweight stand-in labeled honestly (not “milestones” if empty).  
3. **Project cards** — status, priority, progress (task-derived or “—”), target completion date.  
4. Empty state — point to Opportunities / Roadmap; no invented work.

### 5.3 Project workspace

Route suggestion: `/clients/{clientId}/projects/[projectId]` (customer shell).

Sections:

- Header: name, status, priority, dates  
- Description / objective / expected outcome (fields or structured copy)  
- Progress (tasks complete / total; hide % if zero tasks)  
- Task checklist (customer-editable **if** product allows; otherwise read-only staff-maintained)  
- Completed work / next steps (derived from completed vs open tasks + optional notes)  
- Milestones & timeline  
- Activity (CLIENT_VISIBLE events + client_visible notes)  
- Related recommendations (one or many)  
- Related roadmap initiatives (same recommendation IDs)  
- Link to completion report when `completed`

### 5.4 Lightweight — explicitly out of scope

No assignees, resource mgmt, time tracking, Gantt, billing UI, playbook internals, or StackScore mutation from task progress.

---

## 6. Data model recommendations

### 6.1 Prefer reuse

Keep **`Project`** as the only project aggregate. Avoid `CustomerProject` / parallel tables.

### 6.2 Schema changes required before full CX (propose for a later implementation ticket)

**A. Recommendation linkage (required for multi-rec)**

1. Introduce `ProjectRecommendation` join: `(projectId, recommendationId)` unique.  
2. Migrate existing `Project.recommendationId` into join rows.  
3. Either drop unique FK or keep a nullable `primaryRecommendationId` for backward compatibility during transition.  
4. Update create/complete workflows to operate on **all** linked recommendations (completion still closes linked recs per DOC-105 — confirm product intent for multi-rec).

**B. Tasks (required for checklist + progress)**

```
ProjectTask
  id, projectId, clientId
  title
  status: not_started | in_progress | completed
  dueDate?, notes?
  sortOrder
  completedAt?
  createdAt, updatedAt
```

- No `assigneeUserId` for customer module (staff may add later without blocking CX).  
- Progress = `completed / total` when `total > 0`; else display non-percent empty (“No tasks yet”) — **never invent**.

**C. Milestones (recommended, can phase)**

```
ProjectMilestone
  id, projectId, clientId
  title
  targetDate?
  completedAt?
  sortOrder
```

Alternatively v1: treat task due dates + project `targetCompletionDate` as timeline without a new table — weaker UX but fewer migrations.

**D. Objective / outcome (optional columns)**

`businessObjective String?`, `expectedOutcome String?` on `Project`, or reuse description + recommendation structured sections until copy needs diverge.

### 6.3 Activity history — write policy

Avoid per-keystroke and per-toggle floods:

| Event | Record? | Visibility |
| --- | --- | --- |
| Project created | Yes | CLIENT_VISIBLE |
| Status transitions (proposed→…→completed) | Yes | CLIENT_VISIBLE |
| Milestone completed | Yes | CLIENT_VISIBLE |
| Task completed | Optional batch / daily digest **or** only milestone-level; prefer **not** every task if volume is high | CLIENT_VISIBLE if recorded |
| Task title edits | No | — |
| Staff internal notes | INTERNAL only | INTERNAL |

Reuse `recordOrganizationActivity` with `sourceRecordType: "Project"`, `sourceRecordId`. Customer feed filters `visibility: CLIENT_VISIBLE` and `category: PROJECT` (optionally include linked COMMUNICATIONS).

### 6.4 Progress vs status vs StackScore

- **Status** remains lifecycle enum (human / workflow).  
- **Progress** is task math only.  
- Completing all tasks should **not** auto-flip project to `completed` unless product later opts in.  
- Never write `overallStackScore` from project/task updates (reassessment only — DOC-105 / DOC-111A).

---

## 7. Authorization considerations

| Decision | Recommendation |
| --- | --- |
| Tenant boundary | Always `project.clientId === session.user.clientId` for role=client |
| Staff register | Remain at `/projects`; never expose as customer primary |
| Customer create from opportunity | **Product choice.** Default architecture: allow create → `proposed` without closing recommendation; link rec(s); staff still advances lifecycle / billing gates |
| Customer edit project fields | Limit to tasks + optional client_visible notes; status transitions that trigger deposits/billing stay staff-only (`assertProjectDepositGate`) |
| Customer task writes | New route handlers under `/api/v1/clients/[id]/projects/[projectId]/tasks` with workspace access checks — **no Server Actions** |
| Financials | Never show `estimatedCost` / invoices on customer Projects DTOs |
| Recommendation visibility | Continue `isClientDeliverableRecommendation` / stub scrubbing on linked titles |

**Editing today:** customers cannot edit; implementing customer task CRUD is net-new authorization, not “already supported.”

---

## 8. Phased implementation plan

### Phase 0 — Discovery (this ticket)

Complete. No code.

### Phase 1 — Nav + customer dashboard (read-only)

- Add Projects to `getCustomerSidebarNav`.  
- Customer DTO/experience service (counts, dates, status, linked rec title).  
- Fix deep links to `/clients/{id}/projects` and detail route.  
- Scrub cost on customer projections.  
- **No schema migration.**

### Phase 2 — Project workspace (read-only)

- Detail page with description, dates, status, linked recommendation, roadmap initiatives (join), completion report link.  
- Activity feed from existing CLIENT_VISIBLE events (may be sparse initially).

### Phase 3 — Schema: tasks (+ optional milestones) + multi-rec

- Migrations for `ProjectTask`, join table, optional milestones / objective fields.  
- Staff can populate tasks; progress appears for customers.  
- Update create/complete services for multi-rec.

### Phase 4 — Customer writes (narrow)

- Customer task status toggles / checklist (if approved).  
- Optional “Create project from opportunity” with authz + soft recommendation status rules.  
- Activity events on create/status/milestone per write policy.

### Phase 5 — Polish & reports

- Upcoming milestones dashboard.  
- Equal-height cards, a11y, empty states.  
- Regression tests (authz isolation, no StackScore mutation, progress rules).  
- Staging validation only until promote.

---

## 9. Risks and dependencies

| Risk / dependency | Notes |
| --- | --- |
| Unique `recommendationId` migration | Data backfill + API/clients that assume 1:1 |
| Deposit gate on schedule/in_progress | Customer must not bypass billing gates via status edits |
| Completion closes recommendations | Multi-rec completion semantics need product sign-off |
| Path helper debt | Customer links to `/projects` currently fail auth redirect |
| DOC-105 richer lifecycle vs app enums | App uses shorter status set; map CX labels carefully; don’t expand enums casually |
| Demo milestone component | Easy to misuse; keep demo-only |
| Staff Project Register drift | Two UIs must share service layer to avoid duplicate business rules |
| SS-UX-002 nav contract | Fifth item is an intentional IA change from four-item primary nav |
| Activity volume | Task-complete events can spam; follow write policy |

---

## 10. Acceptance criteria (for future implementation tickets)

Implementation of the customer Projects module is complete when:

1. Projects appears as the fifth primary customer nav item and lands on a Client-scoped dashboard.  
2. Dashboard shows truthful active / planned / completed counts from real `Project` rows.  
3. Project workspace shows identity, status, priority, dates, description/objective/outcome, related recommendations, and related roadmap initiatives when present.  
4. Tasks support title + Not Started / In Progress / Complete + optional due date/notes; no assignees/time tracking.  
5. Progress % appears only when tasks exist; otherwise a clear non-percent empty state.  
6. Project status remains independent of task completion math.  
7. Official StackScore is unchanged by project/task mutations.  
8. Customers can create projects from recommendations **only if** product enables it — without auto-completing recommendations on create.  
9. Multiple recommendations can link to one project (after schema work).  
10. Tenant isolation: customers never see other clients’ projects; staff register remains staff-only.  
11. Activity history uses CLIENT_VISIBLE events without excessive writes.  
12. Financial/internal fields remain scrubbed on customer DTOs.  
13. Automated tests cover empty/active/completed projects, progress rules, and authz.  
14. Staging validation precedes any production deploy.

---

## 11. Capability matrix (quick reference)

| # | Discovery item | Finding |
| --- | --- | --- |
| 1 | Prisma models | `Project` solid; no Task/Milestone; 1:1 rec FK |
| 2 | API / server actions | Route handlers only; list/detail client-readable; mutate staff-only |
| 3 | Create/edit | Staff create from rec; staff PATCH; no customer write |
| 4 | Tasks / milestones | Spec’d in DOC-105/124; **not in schema** |
| 5 | Activity/history | `OrganizationActivityEvent` + `Note`; sparse PROJECT usage |
| 6 | Permissions | Client read own; staff write; `/projects` blocked for clients |
| 7 | Rec ↔ project | 1:1 unique; create → accepted; complete → completed |
| 8 | Roadmap ↔ project | Indirect via recommendation; panel lists client projects |
| 9 | Customer screens | Thin `/clients/[id]/projects` + roadmap panel; no workspace |
| 10 | Reusable pieces | `src/lib/projects/*`, workspace list, roadmap panel, client-ui, activity recorder |

---

## 12. Review ask

Please confirm before implementation:

1. **Customer write scope** — read-only first, or checklist + create-from-opportunity in scope for v1?  
2. **Multi-recommendation** — required in first schema migration, or Phase 1 read-only with 1:1?  
3. **Milestones** — first-class table vs target dates only for v1?  
4. **On create** — keep recommendation → `accepted` for customer-created projects, or leave status unchanged?

Reply with decisions; implementation should start only after this discovery is accepted.
