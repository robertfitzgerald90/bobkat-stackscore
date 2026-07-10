# DOC-124 – Service Layer Specification

**Document ID:** DOC-124
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# 1. Purpose

DOC-124 defines the application service layer for StackScore.

The service layer translates application workflows ([DOC-123](DOC-123%20%E2%80%93%20Application%20Workflow%20Specification.md)) into business operations and ensures that business logic lives in **services** rather than pages, components, or raw API handlers.

DOC-124 is a **service architecture specification only**. It does not define code, API route implementations, or database migrations.

---

# 2. Service Layer Philosophy

StackScore should be built around **business services**, not pages.

* **UI and API are thin** — they authenticate, authorize, validate input shape, and delegate to services.
* **Services own business rules** — lifecycle transitions, immutability, and domain invariants enforced in one place.
* **Technology Profile is central** — every client-facing workflow routes through profile-aware services.
* **Events coordinate automation** — services emit domain events; listeners trigger downstream steps without duplicating logic.
* **Permissions are enforced early** — Authorization Service gates every service entry point.

---

# 3. Service Design Principles

1. **Single responsibility** — each service has one clear business capability.
2. **Explicit inputs and outputs** — services accept typed command/query objects; return domain results or errors.
3. **No bypass** — services do not skip peer services (e.g. API must not write assessment scores without Scoring Service).
4. **Idempotent where possible** — event handlers and integration calls safe to retry.
5. **Transactional boundaries** — one business operation per transaction; cross-service flows use events or orchestrated sagas.
6. **Tenant-aware** — all operations scoped by `organizationId` from session context.
7. **Auditable** — permission-sensitive operations invoke Audit Service.
8. **Version-aware** — catalog and document services respect Version Record rules from DOC-121.

---

# 4. Service Boundary Rules

| Layer | May do | Must not do |
| ----- | ------ | ----------- |
| **UI / pages** | Render state, collect input, call services | Enforce business rules, calculate scores, mutate domain state directly |
| **API routes** | Auth, parse request, call Authorization + service | Duplicate validation across routes |
| **Services** | Business logic, orchestration, emit events | Render UI, return HTTP status codes |
| **Data access** | Persist/load entities per service instruction | Enforce business rules independently |

**Cross-cutting services** (Authentication, Authorization, Audit, Notification) are invoked by all domain services — not duplicated within them.

---

# 5. Service Dependency Rules

```text
Authentication Service
Authorization Service
        │
        ▼
Client Service ──► Technology Profile Service ◄── (hub for most reads)
        │
        ├── Assessment Service ──► Scoring Service ──► Recommendation Service
        ├── Solution Playbook Service ◄── Service Catalog Service
        │                              ◄── Approved Technology Catalog Service
        ├── Pricing Service
        ├── Technology Improvement Plan Service
        ├── Roadmap Service
        ├── Project Service ──► Project Task Service
        ├── Technology Completion Report Service
        ├── Managed Technology Program Service
        ├── Reporting Service / Dashboard Service
        ├── Document Service / Note Service
        └── Integration Service (external)

Audit Service ◄── all write operations
Notification Service ◄── event listeners
```

**Rules:**

* Services call **downstream** dependencies only — avoid circular calls (use events to break cycles).
* **Technology Profile Service** is the read aggregator for client hub views; mutating profile scores flows through Assessment/Scoring/Reassessment paths only.
* **Pricing Service** never called from Technician-scoped operations.
* **Catalog services** are read-heavy; writes require Admin authorization.

---

# 6. Domain Event Model

Domain events are immutable records emitted after successful service operations. Event consumers may be in-process listeners or future queue workers.

| Event | Typical producer | Typical consumers |
| ----- | ---------------- | ----------------- |
| `ClientCreated` | Client Service | Technology Profile Service, Audit Service, Notification Service |
| `TechnologyProfileCreated` | Technology Profile Service | Dashboard Service, Audit Service |
| `AssessmentCompleted` | Assessment Service | Scoring Service, Audit Service, Notification Service |
| `RecommendationsGenerated` | Recommendation Service | Technology Profile Service, Notification Service |
| `PlaybookSelected` | Solution Playbook Service | Recommendation Service, TIP Service |
| `TIPGenerated` | Technology Improvement Plan Service | Document Service, Audit Service |
| `TIPApproved` | Technology Improvement Plan Service | Project Service, Audit Service, Notification Service |
| `RoadmapUpdated` | Roadmap Service | Technology Profile Service, Audit Service |
| `ProjectGenerated` | Project Service | Project Task Service, Notification Service, Audit Service |
| `ProjectCompleted` | Project Service | Technology Completion Report Service, Audit Service, Notification Service |
| `CompletionReportGenerated` | Technology Completion Report Service | Document Service, Notification Service |
| `ReassessmentRequested` | Project Service / Technology Profile Service | Notification Service, Assessment Service |
| `TechnologyProfileUpdated` | Technology Profile Service | Dashboard Service, Reporting Service, Notification Service |
| `QuarterlyReviewDue` | Managed Technology Program Service | Notification Service, Dashboard Service |

**Event payload (minimum):** `eventId`, `eventType`, `organizationId`, `clientId`, `actorUserId`, `entityType`, `entityId`, `timestamp`, `metadata`.

Events do not replace Audit Service — both are emitted for complementary purposes.

---

# 7. Core Services

Each service defines: **Purpose**, **Primary responsibilities**, **Inputs**, **Outputs**, **Dependencies**, **Events emitted**, and **Business rules enforced**.

---

## Authentication Service

**Purpose**

Manage user identity, session lifecycle, and credential validation.

**Primary responsibilities**

* Validate credentials and issue sessions
* Enforce password policy and account status
* Invalidate sessions on logout, deactivation, or password change
* Resolve current user and organization context for downstream services

**Inputs**

* Login credentials, session token, password change commands

**Outputs**

* Authenticated session context (`userId`, `organizationId`, `roles`)
* Authentication success/failure result

**Dependencies**

* User persistence (DOC-121)
* DOC-303 authentication mechanics

**Events emitted**

* None (login failures/successes logged via Audit Service directly)

**Business rules enforced**

* Inactive users cannot authenticate
* Generic failure messages — no email enumeration
* Session max duration per DOC-303

---

## Authorization Service

**Purpose**

Evaluate whether the current actor may perform an action on a module/resource.

**Primary responsibilities**

* Resolve role and delegation flags per DOC-122
* Check module permission matrix (view, create, edit, approve, archive, export, administer)
* Apply scoped access (assigned projects, client portal `clientId`)
* Redact financial fields for unauthorized callers

**Inputs**

* Session context, action, resource type, resource id, optional field mask

**Outputs**

* Allow / deny decision with reason code
* Field-level redaction instructions

**Dependencies**

* Authentication Service
* DOC-122 permission matrix

**Events emitted**

* `PermissionDenied` (internal metric / audit when configured)

**Business rules enforced**

* Every service entry point must call Authorization before mutation
* Technician cannot access pricing or playbooks
* Client isolated to linked client record

---

## Client Service

**Purpose**

Manage Client root aggregate lifecycle and client hub metadata.

**Primary responsibilities**

* Create, update, archive clients
* Manage client status transitions (prospect → active → inactive)
* Coordinate Technology Profile initialization on client create

**Inputs**

* CreateClientCommand, UpdateClientCommand, ArchiveClientCommand

**Outputs**

* Client entity, operation result

**Dependencies**

* Authorization Service, Technology Profile Service, Audit Service, Contact Service

**Events emitted**

* `ClientCreated`
* `ClientArchived`

**Business rules enforced**

* Client is root — no orphan engagement data
* Cannot hard-delete clients with completed assessments or projects
* New active client receives Technology Profile

---

## Contact Service

**Purpose**

Manage individuals associated with a Client.

**Primary responsibilities**

* CRUD contacts, designate primary contact
* Link contacts to portal User accounts (future)

**Inputs**

* CreateContactCommand, UpdateContactCommand, SetPrimaryContactCommand

**Outputs**

* Contact entity

**Dependencies**

* Authorization Service, Client Service, Audit Service

**Events emitted**

* `ContactCreated`, `ContactUpdated`

**Business rules enforced**

* Contact belongs to exactly one Client
* At most one primary contact per client

---

## Technology Profile Service

**Purpose**

Own the active Technology Profile — aggregation, governed updates, and snapshots.

**Primary responsibilities**

* Create profile on client onboarding
* Aggregate hub view data (scores, risks, open recommendations, active projects)
* Apply profile updates from reassessment/scoring pipeline only
* Create immutable Technology Profile Snapshots
* Calculate trend direction from snapshot history

**Inputs**

* CreateProfileCommand, ApplyReassessmentResultCommand, CreateSnapshotCommand, GetProfileQuery

**Outputs**

* Technology Profile DTO, Snapshot entity, trend metrics

**Dependencies**

* Authorization Service, Assessment Service, Scoring Service, Recommendation Service, Project Service, Roadmap Service, Audit Service

**Events emitted**

* `TechnologyProfileCreated`
* `TechnologyProfileUpdated`
* `TechnologyProfileSnapshotCreated`

**Business rules enforced**

* Exactly one active profile per client
* Scores not manually overridden
* Updates only via reassessment or verified qualifying work pipeline
* Snapshots are insert-only

---

## Assessment Service

**Purpose**

Manage assessment lifecycle from draft through completion.

**Primary responsibilities**

* Create assessments (initial, reassessment, health check)
* Capture and validate responses against question library version
* Complete assessments and lock immutability
* Maintain reassessment chain (`previousAssessmentId`)

**Inputs**

* StartAssessmentCommand, SaveResponseCommand, CompleteAssessmentCommand, ArchiveAssessmentCommand

**Outputs**

* Assessment entity, response collection, completion result

**Dependencies**

* Authorization Service, Client Service, Technology Profile Service, Scoring Service (on complete), Audit Service

**Events emitted**

* `AssessmentStarted`
* `AssessmentCompleted`

**Business rules enforced**

* Completed assessments immutable
* Responses reference pinned question version
* Reassessment creates new assessment — never edits prior

---

## Scoring Service

**Purpose**

Calculate category scores, StackScore, maturity tier, and risk summary per DOC-111.

**Primary responsibilities**

* Execute scoring engine against assessment responses
* Persist category scores and overall score
* Trigger recommendation generation pipeline
* Support v1/v2 engine selection per DOC-118 during migration

**Inputs**

* ScoreAssessmentCommand (`assessmentId`)

**Outputs**

* ScoreResult (category scores, overall, maturity tier, risk summary)

**Dependencies**

* Assessment Service (read responses), Recommendation Service, Technology Profile Service, Audit Service

**Events emitted**

* `ScoresCalculated` (internal — leads to RecommendationsGenerated)

**Business rules enforced**

* Scoring only on completed or completing assessment
* Weights from active scoring rules — not caller-supplied
* Cannot re-score completed assessment without new assessment

---

## Recommendation Service

**Purpose**

Generate and manage improvement recommendations from assessment results.

**Primary responsibilities**

* Run Recommendation Engine rules (DOC-112)
* Create, update priority/status, defer, dismiss recommendations
* Link recommendations to playbooks and services
* Close recommendations on project completion

**Inputs**

* GenerateRecommendationsCommand, UpdateRecommendationCommand, DismissRecommendationCommand, LinkPlaybookCommand

**Outputs**

* Recommendation entities, generation summary

**Dependencies**

* Authorization Service, Assessment Service, Scoring Service, Solution Playbook Service, Service Catalog Service, Audit Service

**Events emitted**

* `RecommendationsGenerated`
* `RecommendationStatusChanged`

**Business rules enforced**

* Dismissal requires reason
* `actualImpactPoints` set only via reassessment
* Multiple recommendations may map to one project

---

## Solution Playbook Service

**Purpose**

Internal playbook selection and composition (DOC-106).

**Primary responsibilities**

* Resolve playbook suggestions for recommendations
* Map capabilities to services and approved technologies
* Return scoped playbook packages for consultant customization
* Administer playbook catalog (Admin only)

**Inputs**

* SuggestPlaybookQuery, ApplyPlaybookCommand, AdministerPlaybookCommand

**Outputs**

* Playbook package (internal), service/technology line suggestions

**Dependencies**

* Authorization Service, Service Catalog Service, Approved Technology Catalog Service, Audit Service

**Events emitted**

* `PlaybookSelected`

**Business rules enforced**

* Playbook names never returned to client-facing callers
* Deprecated playbooks not used for new engagements

---

## Service Catalog Service

**Purpose**

Manage DOC-100 professional service definitions.

**Primary responsibilities**

* CRUD catalog services (Admin)
* Query active services for recommendations, TIP, projects
* Version service definitions

**Inputs**

* Catalog CRUD commands, ListServicesQuery

**Outputs**

* Service entities

**Dependencies**

* Authorization Service, Audit Service, Version Record persistence

**Events emitted**

* `ServiceCatalogUpdated`

**Business rules enforced**

* Pricing not stored in catalog — delegated to Pricing Service
* Deprecated services hidden from new proposals

---

## Approved Technology Catalog Service

**Purpose**

Manage DOC-101 approved technology/product catalog.

**Primary responsibilities**

* CRUD approved technology entries (Admin)
* Query products for playbooks, TIP, projects
* Protect cost/margin fields per DOC-122

**Inputs**

* Catalog CRUD commands, ListTechnologiesQuery

**Outputs**

* Approved Technology entities (redacted per role)

**Dependencies**

* Authorization Service, Audit Service

**Events emitted**

* `TechnologyCatalogUpdated`

**Business rules enforced**

* Financial fields redacted for non-Admin/non-delegated Consultant

---

## Pricing Service

**Purpose**

Calculate investment summaries, labor, and product pricing per DOC-102.

**Primary responsibilities**

* Price service line items and product quantities
* Produce client-visible investment totals
* Retain internal cost/margin calculations (protected)
* Support TIP and project estimates

**Inputs**

* PriceLineItemsCommand, GenerateInvestmentSummaryCommand

**Outputs**

* PricingResult (client slice + internal slice)

**Dependencies**

* Authorization Service, Service Catalog Service, Approved Technology Catalog Service, Audit Service

**Events emitted**

* `PricingCalculated`

**Business rules enforced**

* Admin-only by default; Consultant requires delegation
* Client and Technician callers receive investment total only
* Formulas not exposed in API responses

---

## Technology Improvement Plan Service

**Purpose**

Author, present, approve, and version client-facing TIPs (DOC-103).

**Primary responsibilities**

* Assemble TIP from profile, recommendations, playbooks, pricing
* Manage draft → presented → approved lifecycle
* Record client approval and signature
* Supersede prior versions on revision
* Trigger project generation on approval

**Inputs**

* GenerateTIPCommand, PresentTIPCommand, ApproveTIPCommand, SupersedeTIPCommand

**Outputs**

* TIP entity, PDF render request

**Dependencies**

* Authorization Service, Technology Profile Service, Recommendation Service, Solution Playbook Service, Pricing Service, Project Service, Document Service, Audit Service

**Events emitted**

* `TIPGenerated`
* `TIPApproved`
* `TIPSuperseded`

**Business rules enforced**

* No internal pricing in client export
* Partial approval supported
* Approved TIP required before billable project generation (unless one-time workflow exception documented in DOC-123)

---

## Roadmap Service

**Purpose**

Manage phased Technology Roadmap documents (DOC-104).

**Primary responsibilities**

* Create and update roadmap phases
* Sequence recommendations with dependency resolution
* Version and supersede roadmaps
* Sync roadmap state to Technology Profile view

**Inputs**

* CreateRoadmapCommand, UpdatePhasesCommand, SupersedeRoadmapCommand

**Outputs**

* Roadmap entity

**Dependencies**

* Authorization Service, Technology Profile Service, Recommendation Service, Project Service, Audit Service

**Events emitted**

* `RoadmapUpdated`
* `RoadmapSuperseded`

**Business rules enforced**

* Living document — supersede rather than mutate delivered versions
* Business priorities determine phase order

---

## Project Service

**Purpose**

Manage project lifecycle from draft through closed (DOC-105).

**Primary responsibilities**

* Generate projects from approved TIP/recommendations
* Transition status through full lifecycle
* Link recommendations and playbooks
* Complete projects and trigger completion report + reassessment prompt
* Track expected vs actual impact (via reassessment)

**Inputs**

* GenerateProjectCommand, ApproveProjectCommand, CompleteProjectCommand, CloseProjectCommand

**Outputs**

* Project entity, lifecycle transition result

**Dependencies**

* Authorization Service, Technology Profile Service, Recommendation Service, Solution Playbook Service, Project Task Service, Technology Completion Report Service, Audit Service, Notification Service

**Events emitted**

* `ProjectGenerated`
* `ProjectApproved`
* `ProjectCompleted`
* `ReassessmentRequested`

**Business rules enforced**

* Human approval before billable execution
* Completed projects never deleted
* Completion closes linked recommendations and prompts reassessment

---

## Project Task Service

**Purpose**

Manage executable tasks within projects.

**Primary responsibilities**

* Auto-generate default task lists from project type/playbook
* Assign tasks to technicians
* Track task status, notes, attachments
* Support validation and client acceptance tasks

**Inputs**

* GenerateTasksCommand, AssignTaskCommand, CompleteTaskCommand, UpdateTaskCommand

**Outputs**

* Project Task entities

**Dependencies**

* Authorization Service, Project Service, Document Service, Note Service, Audit Service

**Events emitted**

* `TaskAssigned`
* `TaskCompleted`

**Business rules enforced**

* Technicians may only mutate assigned tasks
* Task visibility excludes pricing and playbooks

---

## Technology Completion Report Service

**Purpose**

Generate and deliver client completion reports (DOC-107).

**Primary responsibilities**

* Assemble report from completed project(s) and profile snapshots
* Calculate before/after business impact narrative
* Produce recommended next steps from roadmap/recommendations
* Deliver report and attach to client history

**Inputs**

* GenerateCompletionReportCommand, DeliverReportCommand

**Outputs**

* Completion Report entity, PDF render request

**Dependencies**

* Authorization Service, Project Service, Technology Profile Service, Roadmap Service, Recommendation Service, Document Service, Audit Service

**Events emitted**

* `CompletionReportGenerated`
* `CompletionReportDelivered`

**Business rules enforced**

* Business-outcome focus — minimize technical jargon
* Immutable after delivery
* Variance from reassessment, not manual entry

---

## Managed Technology Program Service

**Purpose**

Manage ongoing managed services enrollment and review cadence.

**Primary responsibilities**

* Enroll, suspend, terminate managed programs
* Schedule quarterly reviews
* Emit review due notifications

**Inputs**

* EnrollProgramCommand, UpdateProgramCommand, ScheduleReviewCommand

**Outputs**

* Managed Technology Program entity

**Dependencies**

* Authorization Service, Client Service, Technology Profile Service, Service Catalog Service, Notification Service, Audit Service

**Events emitted**

* `ManagedProgramEnrolled`
* `ManagedProgramTerminated`
* `QuarterlyReviewDue`

**Business rules enforced**

* At most one active program per client
* Review cadence drives notification schedule

---

## Reporting Service

**Purpose**

Produce analytical and executive reports across clients and time.

**Primary responsibilities**

* Generate trend, QBR, and portfolio reports
* Compare snapshots and assessment history
* Export PDF/CSV with role-based redaction

**Inputs**

* GenerateReportQuery (type, clientId, date range, filters)

**Outputs**

* Report data, export file handles

**Dependencies**

* Authorization Service, Technology Profile Service, Assessment Service, Project Service, Roadmap Service, Document Service

**Events emitted**

* `ReportExported` (audited)

**Business rules enforced**

* Financial reports Admin-only
* Client exports exclude internal fields

---

## Dashboard Service

**Purpose**

Aggregate real-time metrics for operational dashboards.

**Primary responsibilities**

* At-risk client lists, open recommendations, project pipeline
* Profile trend widgets, maturity distribution
* Consultant workload and review due counts

**Inputs**

* DashboardQuery (scope, filters)

**Outputs**

* Dashboard DTO (cards, counts, lists)

**Dependencies**

* Authorization Service, Technology Profile Service, Recommendation Service, Project Service, Managed Technology Program Service

**Events emitted**

* None (read-only)

**Business rules enforced**

* Scoped by organization and role (technician sees assigned work only when assignment enabled)

---

## Notification Service

**Purpose**

Deliver in-app and future email notifications for workflow events.

**Primary responsibilities**

* Subscribe to domain events and schedule notifications
* Manage notification preferences per user
* Track delivery status

**Inputs**

* Domain events, ScheduleNotificationCommand, MarkReadCommand

**Outputs**

* Notification records

**Dependencies**

* Authorization Service, Audit Service (optional), Integration Service (email future)

**Events emitted**

* `NotificationSent`

**Business rules enforced**

* Notifications informational — never auto-approve actions
* Client notifications exclude internal content

---

## Document Service

**Purpose**

Store and retrieve file artifacts linked to clients and engagements.

**Primary responsibilities**

* Upload, version, archive documents
* Link documents to TIP, reports, projects, assessments
* Enforce visibility (internal vs client_visible)
* Generate storage keys with tenant prefix

**Inputs**

* UploadDocumentCommand, LinkDocumentCommand, ArchiveDocumentCommand, GetDocumentQuery

**Outputs**

* Document metadata, secure download URL

**Dependencies**

* Authorization Service, Audit Service, object storage (future)

**Events emitted**

* `DocumentUploaded`
* `DocumentArchived`

**Business rules enforced**

* Client role sees `client_visible` only
* Completion reports and approved TIPs may be client-visible

---

## Note Service

**Purpose**

Manage annotations on clients, projects, and tasks.

**Primary responsibilities**

* Create, edit, archive notes
* Enforce visibility flags
* Attribute notes to author

**Inputs**

* CreateNoteCommand, UpdateNoteCommand, ArchiveNoteCommand

**Outputs**

* Note entity

**Dependencies**

* Authorization Service, Audit Service

**Events emitted**

* `NoteCreated`, `NoteUpdated`

**Business rules enforced**

* Internal notes never in client API responses
* Edit history captured in Audit Service

---

## Audit Service

**Purpose**

Append-only audit trail for permission-sensitive actions (DOC-121, DOC-122).

**Primary responsibilities**

* Record audit entries from all services
* Query audit log (Admin only)
* Support export for compliance

**Inputs**

* LogAuditEntryCommand, QueryAuditLogCommand

**Outputs**

* Audit Log entries

**Dependencies**

* Authorization Service (Admin view only)

**Events emitted**

* None

**Business rules enforced**

* Insert-only — no update or delete
* Required events per DOC-122 Section 15

---

## Integration Service

**Purpose**

Boundary for external system integration (RMM, PSA, email, billing).

**Primary responsibilities**

* Receive and normalize external webhooks
* Push client/project status to external systems (future)
* Abstract third-party failures from domain services

**Inputs**

* Webhook payloads, SyncCommand

**Outputs**

* Integration result, normalized events

**Dependencies**

* Authorization Service (service accounts), relevant domain services

**Events emitted**

* `IntegrationSyncCompleted`, `IntegrationFailed`

**Business rules enforced**

* External data never bypasses Technology Profile update rules
* Idempotent webhook processing

---

# 8. Service Interaction Examples

## Primary client lifecycle

```text
1. ClientService.create()
      → TechnologyProfileService.create()
      → emit ClientCreated, TechnologyProfileCreated

2. AssessmentService.start() → save responses → complete()
      → emit AssessmentCompleted

3. ScoringService.score(assessmentId)
      → RecommendationService.generate()
      → TechnologyProfileService.applyScores()
      → emit RecommendationsGenerated, TechnologyProfileUpdated

4. SolutionPlaybookService.suggest() + PricingService.price()
      → TechnologyImprovementPlanService.generate()
      → emit TIPGenerated

5. TechnologyImprovementPlanService.approve()
      → ProjectService.generate()
      → emit TIPApproved, ProjectGenerated

6. ProjectTaskService.generateDefaults()
      → technician executes tasks
      → ProjectService.complete()
      → emit ProjectCompleted, ReassessmentRequested

7. TechnologyCompletionReportService.generate() → deliver()
      → emit CompletionReportGenerated, CompletionReportDelivered

8. AssessmentService.startReassessment() → complete()
      → ScoringService.score()
      → TechnologyProfileService.applyReassessment() + snapshot()
      → emit TechnologyProfileUpdated
```

## Quarterly Business Review

```text
ManagedTechnologyProgramService emits QuarterlyReviewDue
      → NotificationService notifies consultant
      → ReportingService.generateQBR()
      → TechnologyProfileService.refreshAggregate()
      → RecommendationService.refreshFromProfile()
      → RoadmapService.update()
      → TechnologyImprovementPlanService.supersede()
```

## Technician task completion

```text
ProjectTaskService.complete(taskId)
      → AuthorizationService (assigned task only)
      → ProjectService.evaluateAllTasksComplete()
      → if complete: transition to validation
      → no PricingService or PlaybookService calls
```

---

# 9. Validation Responsibilities

| Validation type | Owner |
| --------------- | ----- |
| Request shape / types | API layer (schema validation) |
| Authorization | Authorization Service |
| Domain invariants (lifecycle, immutability) | Respective domain service |
| Cross-entity rules (one profile per client) | Technology Profile Service or orchestrating service |
| Financial visibility | Authorization Service + Pricing Service |
| Catalog version pins | Assessment Service, Playbook Service |
| Tenant scope | All services — reject missing `organizationId` |

Services return **domain errors** (e.g. `AssessmentImmutable`, `ApprovalRequired`) — API layer maps to HTTP status codes.

---

# 10. Error Handling Principles

1. **Fail fast on authorization** — deny before side effects.
2. **Transactional consistency** — failed mid-operation rolls back; events emitted only after commit.
3. **No silent bypass** — illegal transitions return explicit errors, not warnings.
4. **Idempotent retries** — safe for event consumers and integration webhooks.
5. **User-safe messages** — client-facing errors avoid internal details; log full context server-side.
6. **Compensation** — multi-step sagas (TIP approve → project generate) define rollback or manual recovery on partial failure.

---

# 11. Audit Logging Responsibilities

Every **write** service operation invokes `AuditService.log()` for actions listed in DOC-122 Section 15.

| Service | Audited operations |
| ------- | ------------------ |
| Client Service | create, archive |
| Assessment Service | complete, archive |
| Recommendation Service | status change, dismiss |
| TIP Service | present, approve, supersede |
| Project Service | create, approve, complete |
| Technology Profile Service | reassessment apply, snapshot |
| Catalog services | publish, deprecate |
| Authorization Service | delegation grant/revoke |
| Pricing Service | export financial workbook |

Read-only services (Dashboard) do not audit routine queries unless exporting sensitive data.

---

# 12. Future Technical Translation

| Specification | Implementation direction |
| ------------- | ------------------------- |
| Service modules | `src/services/<name>/` or domain packages per service |
| API routes | Thin handlers: `auth → authorize → service.method()` |
| Events | In-process event bus initially; message queue when scale requires |
| Transactions | Prisma `$transaction` per service command |
| Testing | Unit test services with mocked persistence; integration test workflows |
| v1 gap | Current app embeds logic in API routes — migrate incrementally per DOC-118 phases |

No code, routes, or migrations are defined by this document.

**v1 implementation note:** Running application implements partial service boundaries (assessment, scoring, recommendations, projects in API modules). Full service extraction is a migration objective — DOC-124 is the target architecture.

---

# 13. Related Documents

* [DOC-120 – Domain Model Specification](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md)
* [DOC-121 – Database Schema Specification](DOC-121%20%E2%80%93%20Database%20Schema%20Specification.md)
* [DOC-122 – Roles & Permissions Specification](DOC-122%20%E2%80%93%20Roles%20&%20Permissions%20Specification.md)
* [DOC-123 – Application Workflow Specification](DOC-123%20%E2%80%93%20Application%20Workflow%20Specification.md)
* [DOC-118 – v1 to v2 Compatibility Reference](../20-Business-Logic/DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md)
* [DOC-300 – Technical Architecture](DOC-300%20-%20Technical%20Architecture.md)
* [DOC-302 – API Specification](DOC-302%20-%20API%20Specification.md)
* [DOC-003 – BobKat Technology Improvement Lifecycle (BTIL)](../00-Governance/DOC-003%20-%20Bobkat%20Technology%20Improvement%20Lifecycle%20%28BTIL%29.md).md)

---

# 14. Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-06-25 | BobKat IT | Initial service layer architecture — twenty-four services, domain events, interaction examples, and technical translation guidance |
