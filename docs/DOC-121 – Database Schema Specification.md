# DOC-121 – Database Schema Specification

**Document ID:** DOC-121
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# 1. Purpose

DOC-121 defines the database-level structure required to support the StackScore domain model defined in [DOC-120 – Domain Model Specification](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md).

This document translates business objects, relationships, and lifecycle rules into a **business database specification** that can later guide Prisma schema design.

DOC-121 is a **database architecture specification only**. It does not define Prisma models, SQL migrations, or application code.

**Relationship to DOC-301:** [DOC-301 – Database Schema Specification](DOC-301%20%E2%80%93%20Database%20Schema%20Specification.md) describes the **v1 running implementation**. DOC-121 describes the **v2 target schema**. Until migration completes, DOC-301 governs application behavior; DOC-121 governs long-term database design.

---

# 2. Database Philosophy

The StackScore database is organized as a **client-centric historical system of record**.

* **Client** is the root foreign-key anchor for all engagement data.
* **Technology Profile** is the mutable current-state record; **snapshots** preserve history.
* **Immutability** applies to completed assessments and delivered reports.
* **Permanence** applies to completed projects and audit evidence.
* **Catalog data** is shared, versioned reference data — not duplicated per client.
* **Financial sensitivity** is stored where needed but exposed only through RBAC.
* **Soft archival** replaces destructive deletes for business records.
* **Tenant scope** is designed in from the start for future multi-organization support.

---

# 3. Entity Categories

| Category | Entities | Scope |
| -------- | -------- | ----- |
| Tenancy & security | Organization, User, Role, Audit Log | Global / tenant |
| Client hub | Client, Contact, Technology Profile, Technology Profile Snapshot, Note, Document | Per client |
| Assessment | Assessment, Assessment Question, Assessment Response, Capability | Client + catalog |
| Scoring & recommendations | Recommendation | Per client |
| Catalog | Service, Approved Technology, Solution Playbook, Capability (library) | Shared reference |
| Commercial | Technology Improvement Plan, Roadmap | Per client |
| Project & delivery | Project, Project Task, Managed Technology Program | Per client |
| Reporting | Technology Completion Report | Per client |
| Versioning | Version Record | Cross-cutting |

---

# 4. Core Client Entities

## Organization / Tenant

**Purpose**

Represents the MSP or organization operating StackScore. Enables future multi-tenant isolation when more than BobKat IT uses the platform.

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| name | String | Organization display name |
| slug | String | Unique tenant identifier |
| status | Enum | `active`, `suspended`, `archived` |
| settings | JSON | Tenant-level configuration |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| archivedAt | DateTime | Nullable — soft archive |

**Relationships**

* One Organization has many Users, Clients, and catalog records (when tenant-scoped)

**Required constraints**

* `slug` unique globally
* All client-scoped rows include `organizationId` (nullable or default single-tenant until multi-tenant activation)

**Archival behavior**

Soft-archive only. Never hard-delete tenants with client history.

**Versioning requirements**

Organization settings may version via Version Record for configuration audit.

---

## Client

**Purpose**

Root business entity representing a customer whose technology environment is assessed and improved.

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| organizationId | UUID | FK → Organization |
| companyName | String | Legal or trade name |
| clientType | Enum | `commercial`, `residential` |
| industry | String | Nullable |
| employeeCount | Integer | Nullable |
| deviceCount | Integer | Nullable |
| status | Enum | `prospect`, `active`, `inactive`, `archived` |
| primaryContactId | UUID | Nullable FK → Contact |
| locationCity | String | Nullable |
| locationState | String | Nullable |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| archivedAt | DateTime | Nullable |
| deletedAt | DateTime | Nullable — soft delete flag |

**Relationships**

* Belongs to Organization
* One active Technology Profile (1:1 enforced at application layer)
* Many Contacts, Assessments, Recommendations, Projects, Documents, Notes, Snapshots, TIPs, Roadmaps, Reports

**Required constraints**

* `organizationId` required when multi-tenant enabled
* Client cannot be hard-deleted if any completed Assessment or Project exists

**Archival behavior**

`archived` status + `archivedAt`; soft `deletedAt` for erroneous creates only (admin). Historical child records retained.

**Versioning requirements**

None on Client record itself; changes audited via Audit Log.

---

## Contact

**Purpose**

Individual associated with a Client (owner, manager, billing, technical liaison).

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| clientId | UUID | FK → Client |
| organizationId | UUID | Denormalized tenant scope |
| firstName | String | |
| lastName | String | |
| email | String | |
| phone | String | Nullable |
| role | String | e.g. owner, manager, IT liaison |
| isPrimary | Boolean | |
| userId | UUID | Nullable FK → User (portal link) |
| status | Enum | `active`, `inactive` |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| archivedAt | DateTime | Nullable |

**Relationships**

* Many-to-one Client
* Optional link to User for client portal

**Required constraints**

* `clientId` required
* At most one `isPrimary = true` per client (application or DB constraint)

**Archival behavior**

Soft-archive; retain for historical TIP/report contact references.

**Versioning requirements**

None.

---

## Technology Profile

**Purpose**

Mutable current-state record of client technology maturity, scores, risks, and engagement summary.

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| clientId | UUID | FK → Client — unique active profile |
| organizationId | UUID | Tenant scope |
| overallStackScore | Decimal | 0–100, system-calculated |
| maturityTier | Enum | Nascent, Foundational, Developing, Mature, Optimized |
| categoryScores | JSON | Seven v2 category scores |
| riskSummary | JSON | Critical/high/medium/low counts |
| currentAssessmentId | UUID | Nullable FK → latest completed Assessment |
| lastAssessedAt | DateTime | |
| nextRecommendedAssessmentAt | DateTime | Nullable |
| managedProgramId | UUID | Nullable FK → Managed Technology Program |
| trendDirection | Enum | `improving`, `stable`, `declining` |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Relationships**

* One-to-one with Client (active)
* References latest Assessment
* Aggregates open Recommendations and active Projects (via queries, not embedded)

**Required constraints**

* Exactly one active profile per `clientId`
* Scores updated only by scoring/reassessment services — no direct user write to score fields

**Archival behavior**

Profile row persists for client lifetime; not deleted. State changes tracked via Snapshots and Audit Log.

**Versioning requirements**

Current values mutable; historical values captured in Technology Profile Snapshot.

---

## Technology Profile Snapshot

**Purpose**

Immutable point-in-time archive of Technology Profile after assessment, project completion, or scheduled review.

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| clientId | UUID | FK → Client |
| technologyProfileId | UUID | FK → Technology Profile |
| organizationId | UUID | Tenant scope |
| triggerType | Enum | `assessment_completed`, `project_completed`, `scheduled_review`, `manual` |
| triggerAssessmentId | UUID | Nullable FK |
| triggerProjectId | UUID | Nullable FK |
| snapshotAt | DateTime | |
| overallStackScore | Decimal | Frozen |
| maturityTier | Enum | Frozen |
| categoryScores | JSON | Frozen |
| riskSummary | JSON | Frozen |
| metadata | JSON | Optional context |
| createdAt | DateTime | Insert-only |

**Relationships**

* Many per Client and Technology Profile
* Optional link to triggering Assessment or Project

**Required constraints**

* Insert-only — no UPDATE or DELETE in application layer
* `snapshotAt` required

**Archival behavior**

Permanent retention. Never soft-deleted.

**Versioning requirements**

Each snapshot is itself a version point; no separate Version Record required.

---

# 5. Assessment Entities

## Assessment

**Purpose**

Point-in-time structured evaluation of a client's technology environment.

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| clientId | UUID | FK → Client |
| organizationId | UUID | Tenant scope |
| technologyProfileId | UUID | FK → Technology Profile |
| assessorUserId | UUID | FK → User |
| assessmentType | Enum | `initial`, `reassessment`, `health_check` |
| status | Enum | `draft`, `in_progress`, `completed`, `archived` |
| questionSetVersionId | UUID | FK → Version Record (library version used) |
| completedAt | DateTime | Nullable until completed |
| executiveSummary | Text | Client-visible narrative |
| internalNotes | Text | Internal only |
| overallScore | Decimal | Set on completion |
| previousAssessmentId | UUID | Nullable — reassessment chain |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| archivedAt | DateTime | Nullable |

**Relationships**

* Many Responses, Category Scores (embedded JSON or child table), Recommendations
* Produces Technology Profile Snapshot on completion

**Required constraints**

* Immutable after `status = completed` — responses and scores locked
* `completedAt` required when completed

**Archival behavior**

`archived` status only; never hard-deleted.

**Versioning requirements**

`questionSetVersionId` pins assessment to library version active at start.

---

## Assessment Question

**Purpose**

Reusable library question used across assessments (catalog entity).

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| organizationId | UUID | Nullable — null = platform-wide library |
| capabilityId | UUID | FK → Capability |
| categoryCode | String | v2 technology category |
| questionText | Text | |
| helpText | Text | Nullable |
| weight | Decimal | Max points |
| riskLevel | Enum | low, medium, high, critical |
| displayOrder | Integer | |
| status | Enum | `draft`, `active`, `deprecated`, `retired` |
| currentVersionId | UUID | FK → Version Record |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| archivedAt | DateTime | Nullable |

**Relationships**

* Belongs to Capability
* Many Answer Options (child reference data)
* Referenced by Assessment Responses

**Required constraints**

* Retired questions cannot be added to new assessments
* Completed assessments retain reference to question version at time of response

**Archival behavior**

Soft-retire via `status` and `archivedAt`; historical responses retain FK.

**Versioning requirements**

**Required.** Text, weight, and options versioned via Version Record; responses store `questionVersionId`.

---

## Assessment Response

**Purpose**

Single answer to an Assessment Question within one Assessment.

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| assessmentId | UUID | FK → Assessment |
| questionId | UUID | FK → Assessment Question |
| questionVersionId | UUID | FK → Version Record |
| answerOptionId | UUID | Selected option |
| pointsAwarded | Decimal | Scored value |
| notes | Text | Internal assessor notes |
| evidence | Text/JSON | Internal evidence |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Relationships**

* Many-to-one Assessment
* References frozen question version

**Required constraints**

* Unique (`assessmentId`, `questionId`)
* No updates after parent Assessment completed

**Archival behavior**

Lives with parent Assessment; never independently deleted.

**Versioning requirements**

`questionVersionId` required — preserves scoring context.

---

## Capability

**Purpose**

Fine-grained assessment construct linking questions to recommendation triggers (catalog).

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| organizationId | UUID | Nullable |
| code | String | Unique capability code |
| name | String | Internal name |
| categoryCode | String | Technology category |
| description | Text | |
| status | Enum | `active`, `deprecated` |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Relationships**

* Many Assessment Questions
* Linked to Recommendation templates and Solution Playbooks

**Required constraints**

* `code` unique within organization scope

**Archival behavior**

Deprecate; retain for historical recommendation traceability.

**Versioning requirements**

Optional Version Record when capability definitions change materially.

---

# 6. Scoring & Recommendation Entities

## Recommendation

**Purpose**

Actionable improvement opportunity generated from assessment findings.

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| clientId | UUID | FK → Client |
| organizationId | UUID | Tenant scope |
| assessmentId | UUID | FK → originating Assessment |
| capabilityId | UUID | Nullable FK |
| categoryCode | String | Technology category |
| title | String | Business-facing title |
| description | Text | |
| priority | Enum | critical, high, medium, low, informational |
| status | Enum | open, accepted, in_progress, completed, deferred, dismissed |
| suggestedPlaybookId | UUID | Nullable FK → Solution Playbook |
| suggestedServiceId | UUID | Nullable FK → Service |
| expectedImpactPoints | Decimal | Nullable |
| actualImpactPoints | Decimal | Nullable — from reassessment only |
| dismissedReason | Text | Required if dismissed |
| projectId | UUID | Nullable FK → Project |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| archivedAt | DateTime | Nullable |

**Relationships**

* Client, Assessment, optional Project, Playbook, Service
* Included in TIP/Roadmap via junction tables

**Required constraints**

* `actualImpactPoints` writable only by reassessment service
* Dismissal requires reason and user attribution (Audit Log)

**Archival behavior**

Closed recommendations retained permanently; soft-archive for erroneous duplicates only.

**Versioning requirements**

None on recommendation instance; template rules versioned separately in catalog.

---

# 7. Catalog Entities

## Service

**Purpose**

Standardized professional service from the Service Catalog (DOC-100).

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| organizationId | UUID | Tenant scope |
| code | String | Unique service code |
| name | String | |
| description | Text | |
| defaultLaborHoursMin | Decimal | |
| defaultLaborHoursMax | Decimal | |
| category | String | |
| status | Enum | draft, active, deprecated |
| currentVersionId | UUID | FK → Version Record |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| archivedAt | DateTime | Nullable |

**Relationships**

* Referenced by Recommendations, Playbooks, TIP line items, Projects

**Required constraints**

* `code` unique per organization

**Archival behavior**

Deprecate and soft-archive; historical proposals retain service version reference.

**Versioning requirements**

**Required** for scope and labor default changes.

---

## Approved Technology

**Purpose**

Preferred product or technology type from the Technology Catalog (DOC-101).

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| organizationId | UUID | Tenant scope |
| code | String | |
| name | String | |
| technologyType | String | e.g. firewall, switch, endpoint |
| manufacturer | String | Nullable |
| model | String | Nullable |
| unitCost | Decimal | **Internal — RBAC protected** |
| unitPrice | Decimal | **Internal — RBAC protected** |
| marginPercent | Decimal | **Internal — RBAC protected** |
| status | Enum | draft, active, deprecated, retired |
| currentVersionId | UUID | FK → Version Record |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Relationships**

* Referenced by Playbooks, Projects, TIP product lines

**Required constraints**

* Cost/margin fields never exposed to technician or client roles

**Archival behavior**

Retire; retain FK integrity on historical projects.

**Versioning requirements**

**Required** when pricing or product identity changes.

---

## Solution Playbook

**Purpose**

Internal remediation package mapping capabilities to services and technologies (DOC-106).

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| organizationId | UUID | Tenant scope |
| code | String | e.g. PB-TECH-FOUNDATION |
| name | String | Internal only |
| purpose | Text | |
| targetCategoryCodes | JSON | Array of categories |
| status | Enum | draft, active, deprecated |
| currentVersionId | UUID | FK → Version Record |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| archivedAt | DateTime | Nullable |

**Relationships**

* Many-to-many with Service and Approved Technology (junction tables)
* Referenced by Recommendations and Projects

**Required constraints**

* Internal-only — not exposed in client-facing views

**Archival behavior**

Deprecate; projects retain playbook version at time of creation.

**Versioning requirements**

**Required** — playbook composition changes create new version.

---

# 8. Commercial Entities

## Technology Improvement Plan

**Purpose**

Client-facing strategic improvement proposal with investment summary (DOC-103).

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| clientId | UUID | FK → Client |
| organizationId | UUID | Tenant scope |
| technologyProfileId | UUID | FK |
| status | Enum | draft, presented, partially_approved, approved, superseded |
| versionNumber | Integer | Sequential per client |
| title | String | |
| executiveSummary | Text | |
| lineItems | JSON | Services, quantities, client-visible investment |
| internalLaborCost | Decimal | **RBAC protected** |
| internalProductCost | Decimal | **RBAC protected** |
| internalMargin | Decimal | **RBAC protected** |
| totalInvestment | Decimal | Client-visible total |
| approvedAt | DateTime | Nullable |
| approvedByContactId | UUID | Nullable |
| signatureData | Text/JSON | Nullable |
| estimatedStartDate | Date | Nullable |
| consultantUserId | UUID | FK → User |
| currentVersionId | UUID | FK → Version Record |
| documentId | UUID | Nullable FK → Document (PDF) |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| supersededAt | DateTime | Nullable |

**Relationships**

* Many-to-many Recommendations (junction)
* Generates Projects on approval

**Required constraints**

* Superseded versions immutable
* Internal cost fields excluded from client API responses

**Archival behavior**

Superseded plans archived, not deleted.

**Versioning requirements**

**Required** — each presentation revision increments `versionNumber` and Version Record.

---

## Roadmap

**Purpose**

Phased sequencing of technology improvements over time (DOC-104). Entity name: **Roadmap** (Technology Roadmap).

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| clientId | UUID | FK → Client |
| organizationId | UUID | Tenant scope |
| technologyProfileId | UUID | FK |
| status | Enum | draft, active, superseded |
| versionNumber | Integer | |
| phases | JSON | Immediate, short, mid, long, future — with initiative refs |
| currentVersionId | UUID | FK → Version Record |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| supersededAt | DateTime | Nullable |

**Relationships**

* Links to Recommendations and Projects by phase
* Feeds TIP updates

**Required constraints**

* One `active` roadmap per client recommended (application enforced)

**Archival behavior**

Superseded versions archived permanently.

**Versioning requirements**

**Required** on structural phase changes.

---

# 9. Project & Delivery Entities

## Project

**Purpose**

Approved business initiative executing recommendations (DOC-105).

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| clientId | UUID | FK → Client |
| organizationId | UUID | Tenant scope |
| technologyProfileId | UUID | FK |
| title | String | |
| businessObjective | Text | |
| status | Enum | draft, awaiting_client_approval, approved, procurement, scheduled, in_progress, validation, completed, reassessment, closed, cancelled |
| priority | Enum | |
| playbookId | UUID | Nullable FK |
| playbookVersionId | UUID | Nullable FK → Version Record |
| estimatedLaborHours | Decimal | |
| actualLaborHours | Decimal | Nullable |
| estimatedStartDate | Date | Nullable |
| estimatedEndDate | Date | Nullable |
| completedAt | DateTime | Nullable |
| expectedImpactPoints | Decimal | |
| actualImpactPoints | Decimal | Nullable — reassessment only |
| leadUserId | UUID | FK → User |
| approvedAt | DateTime | Nullable |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| archivedAt | DateTime | Nullable |

**Relationships**

* Many Tasks, many Recommendations (junction), optional Completion Report
* Many-to-many Services (junction)

**Required constraints**

* Completed/closed projects never hard-deleted
* `actualImpactPoints` set only from reassessment

**Archival behavior**

`cancelled` retains record; `closed` is terminal permanent state.

**Versioning requirements**

Playbook reference versioned at project creation.

---

## Project Task

**Purpose**

Executable work unit within a Project.

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| projectId | UUID | FK → Project |
| organizationId | UUID | Tenant scope |
| title | String | |
| taskType | Enum | procurement, scheduling, installation, configuration, validation, documentation, client_acceptance, profile_update, completion_report |
| status | Enum | pending, in_progress, completed, blocked, cancelled |
| assignedUserId | UUID | Nullable FK → User |
| displayOrder | Integer | |
| dueDate | Date | Nullable |
| completedAt | DateTime | Nullable |
| notes | Text | Nullable |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Relationships**

* Many-to-one Project
* Optional Notes and Document attachments

**Required constraints**

* `projectId` required

**Archival behavior**

Retained with parent Project.

**Versioning requirements**

None.

---

## Managed Technology Program

**Purpose**

Ongoing managed services engagement for a client.

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| clientId | UUID | FK → Client |
| organizationId | UUID | Tenant scope |
| status | Enum | proposed, active, suspended, terminated |
| servicePackage | JSON | Referenced Service IDs |
| coveredDeviceCount | Integer | Nullable |
| reviewCadence | Enum | monthly, quarterly, annual |
| nextReviewAt | DateTime | |
| startedAt | DateTime | Nullable |
| terminatedAt | DateTime | Nullable |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Relationships**

* Optional one-to-one display on Technology Profile
* Quarterly reviews link to Assessment or Snapshot

**Required constraints**

* At most one `active` program per client

**Archival behavior**

`terminated` records retained for history.

**Versioning requirements**

Service package changes audited via Audit Log.

---

# 10. Reporting Entities

## Technology Completion Report

**Purpose**

Client-facing deliverable after project completion (DOC-107).

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| clientId | UUID | FK → Client |
| organizationId | UUID | Tenant scope |
| projectIds | JSON | One or more completed projects |
| status | Enum | generated, delivered, archived |
| versionNumber | Integer | |
| beforeSnapshotId | UUID | FK → Technology Profile Snapshot |
| afterSnapshotId | UUID | FK → Technology Profile Snapshot |
| businessImpactSummary | Text | |
| beforeAfterNarrative | Text | |
| recommendedNextSteps | Text | |
| deliveredAt | DateTime | Nullable |
| documentId | UUID | FK → Document (PDF) |
| currentVersionId | UUID | FK → Version Record |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Relationships**

* Client, Projects, Snapshots, Document

**Required constraints**

* Immutable after `delivered`
* Permanently attached to client history

**Archival behavior**

Permanent retention.

**Versioning requirements**

**Required** if report regenerated before delivery; delivered version frozen.

---

## Document

**Purpose**

File artifact (PDF, contract, diagram, warranty) attached to client engagement.

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| clientId | UUID | FK → Client |
| organizationId | UUID | Tenant scope |
| documentType | Enum | tip, completion_report, contract, diagram, warranty, other |
| fileName | String | |
| storageKey | String | Object storage reference |
| mimeType | String | |
| fileSizeBytes | Integer | |
| linkedEntityType | String | Nullable polymorphic |
| linkedEntityId | UUID | Nullable |
| uploadedByUserId | UUID | FK → User |
| visibility | Enum | internal, client_visible |
| currentVersionId | UUID | Nullable FK → Version Record |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| archivedAt | DateTime | Nullable |

**Relationships**

* Client; optional link to Project, Assessment, TIP, Report

**Required constraints**

* `storageKey` unique per organization

**Archival behavior**

Soft-archive; binary retention per compliance policy.

**Versioning requirements**

New file upload creates Version Record when replacing prior document.

---

## Note

**Purpose**

Free-text annotation on client, project, or task activity.

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| organizationId | UUID | Tenant scope |
| clientId | UUID | FK → Client |
| projectId | UUID | Nullable FK |
| taskId | UUID | Nullable FK |
| authorUserId | UUID | FK → User |
| body | Text | |
| visibility | Enum | internal, client_visible |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| archivedAt | DateTime | Nullable |

**Relationships**

* Client required; optional Project or Task

**Required constraints**

* `clientId` required

**Archival behavior**

Soft-archive; audit trail of edits via Audit Log.

**Versioning requirements**

Optional edit history via Audit Log rather than Version Record.

---

# 11. User & Security Entities

## User

**Purpose**

Authenticated identity for staff and future client portal users.

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| organizationId | UUID | FK → Organization |
| email | String | Unique per organization |
| name | String | |
| passwordHash | String | |
| status | Enum | invited, active, suspended, deactivated |
| clientId | UUID | Nullable — for client portal users |
| contactId | UUID | Nullable FK → Contact |
| lastLoginAt | DateTime | Nullable |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Relationships**

* Many-to-many Role (junction `UserRole`)
* Creates Assessments, Projects, Notes, Audit entries

**Required constraints**

* `email` unique within `organizationId`
* Client portal users must have `clientId` set

**Archival behavior**

`deactivated` — no hard delete.

**Versioning requirements**

None.

---

## Role

**Purpose**

Named permission bundle (admin, consultant, technician, client).

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| organizationId | UUID | Nullable — platform roles |
| code | String | admin, consultant, technician, client |
| name | String | Display name |
| permissions | JSON | Permission flags per DOC-303 |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Relationships**

* Many-to-many User

**Required constraints**

* `code` unique per organization

**Archival behavior**

Deprecate role; reassign users before retirement.

**Versioning requirements**

Permission changes audited via Audit Log.

---

# 12. Audit & Versioning

## Audit Log

**Purpose**

Immutable record of significant system and user actions.

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| organizationId | UUID | Tenant scope |
| actorUserId | UUID | Nullable — system actions null |
| action | String | e.g. assessment.completed, tip.approved |
| entityType | String | Polymorphic target type |
| entityId | UUID | Polymorphic target id |
| clientId | UUID | Nullable — denormalized for queries |
| beforeState | JSON | Nullable |
| afterState | JSON | Nullable |
| ipAddress | String | Nullable |
| userAgent | String | Nullable |
| createdAt | DateTime | Insert-only |

**Relationships**

* References User, any auditable entity

**Required constraints**

* Insert-only — no UPDATE or DELETE

**Archival behavior**

Retained per compliance retention policy; never user-deletable.

**Versioning requirements**

N/A — audit entries are themselves historical records.

**Audited actions (minimum)**

* Assessment complete / archive
* Recommendation status change
* TIP approve / supersede
* Project create / complete / cancel
* Profile update from reassessment
* User role change
* Catalog publish / deprecate

---

## Version Record

**Purpose**

Cross-cutting version pointer for catalog items, plans, roadmaps, reports, and documents.

**Key fields**

| Field | Type | Notes |
| ----- | ---- | ----- |
| id | UUID | Primary key |
| organizationId | UUID | Tenant scope |
| entityType | String | e.g. AssessmentQuestion, SolutionPlaybook, TIP |
| entityId | UUID | Parent entity |
| versionNumber | Integer | Sequential per entity |
| snapshot | JSON | Frozen field state at version |
| changeSummary | Text | Nullable |
| createdByUserId | UUID | FK → User |
| createdAt | DateTime | Insert-only |
| effectiveFrom | DateTime | |
| effectiveTo | DateTime | Nullable |

**Relationships**

* Polymorphic parent entity
* Referenced by Assessment (`questionSetVersionId`), TIP, Playbook, etc.

**Required constraints**

* (`entityType`, `entityId`, `versionNumber`) unique
* Prior version `effectiveTo` set when new version published

**Archival behavior**

Versions never deleted.

**Versioning requirements**

Applies to: Assessment Question, Service, Approved Technology, Solution Playbook, TIP, Roadmap, Completion Report (pre-delivery), Document replacements, scoring rule catalogs.

---

# 13. Soft Delete / Archival Rules

| Entity | Hard delete | Soft delete / archive | Permanent retention trigger |
| ------ | ----------- | --------------------- | --------------------------- |
| Client | ❌ | `archived`, `deletedAt` | Any completed assessment |
| Assessment (completed) | ❌ | `archived` only | On completion |
| Technology Profile Snapshot | ❌ | N/A | Always |
| Project (completed/closed) | ❌ | `cancelled` retains row | On close |
| Technology Completion Report (delivered) | ❌ | N/A | On delivery |
| Recommendation (closed) | ❌ | soft-archive duplicates | On close |
| TIP / Roadmap (superseded) | ❌ | `superseded` | On supersede |
| Catalog entities | ❌ | `deprecated`, `archivedAt` | When referenced |
| User | ❌ | `deactivated` | Always |
| Audit Log | ❌ | N/A | Always |
| Draft Assessment | ⚠️ admin only | delete draft | Never if completed |

**Principle:** Prefer status transitions and `archivedAt` / `deletedAt` timestamps over `DELETE` statements.

---

# 14. Multi-Tenant Readiness

Design conventions for lightweight future multi-tenancy:

| Convention | Specification |
| ---------- | ------------- |
| Tenant key | `organizationId` on all business tables |
| Uniqueness | Composite unique indexes include `organizationId` (e.g. client email, service code) |
| Row isolation | All queries filter by `organizationId` from session context |
| Catalog scope | Platform-wide catalog (`organizationId` null) with optional tenant overrides |
| Single-tenant MVP | Default `organizationId` to BobKat IT seed row |
| Cross-tenant access | Forbidden at API and query layer |
| Storage | Object keys prefixed with `organizationId/` |

BobKat IT operates as the sole tenant initially; schema requires no redesign when additional tenants are added.

---

# 15. Relationship Summary

```text
Organization
  └── User ←→ Role
  └── Client (ROOT)
        ├── Contact
        ├── Technology Profile (1 active)
        │     └── Technology Profile Snapshot (many, immutable)
        ├── Assessment (immutable when completed)
        │     └── Assessment Response
        ├── Recommendation
        ├── Technology Improvement Plan (versioned)
        ├── Roadmap (versioned)
        ├── Project (permanent)
        │     └── Project Task
        ├── Technology Completion Report
        ├── Managed Technology Program
        ├── Document
        └── Note

Catalog (shared / tenant-scoped)
  ├── Capability
  ├── Assessment Question (versioned)
  ├── Service (versioned)
  ├── Approved Technology (versioned)
  └── Solution Playbook (versioned)

Cross-cutting
  ├── Audit Log
  └── Version Record
```

**Cardinality highlights**

* Client 1 — 1 Technology Profile (active)
* Client 1 — * Assessment
* Assessment 1 — * Assessment Response
* Client 1 — * Project
* Project * — * Recommendation
* Project 1 — * Project Task
* Completion Report * — 1 Client; * — * Project

---

# 16. Future Prisma Translation

This section guides implementation **without defining Prisma code**.

| DOC-121 concept | Prisma direction | v1 (DOC-301) status |
| --------------- | ---------------- | ------------------- |
| Organization | `Organization` model | Not implemented |
| Technology Profile | `TechnologyProfile` model | Partial — derived from latest assessment |
| Technology Profile Snapshot | `TechnologyProfileSnapshot` | Partial — `ClientScoreHistory` |
| Capability | `Capability` model | Not implemented |
| Solution Playbook | `SolutionPlaybook` + junctions | Not implemented |
| Technology Improvement Plan | `TechnologyImprovementPlan` | Not implemented |
| Roadmap | `TechnologyRoadmap` | Not implemented |
| Technology Completion Report | `TechnologyCompletionReport` | Not implemented |
| Managed Technology Program | `ManagedTechnologyProgram` | Not implemented |
| Role | `Role` + `UserRole` | Partial — enum on User |
| Audit Log | `AuditLog` | Not implemented |
| Version Record | `VersionRecord` | Not implemented |
| Client, Assessment, etc. | Extend existing models | Implemented in v1 |

**Implementation order (suggested):** Organization seed → Technology Profile entity → Snapshots → Audit Log → Version Record → catalog tables → commercial/planning tables → report entities.

Enforce immutability in **service layer** and **database triggers or check constraints** where practical (e.g. prevent UPDATE on completed assessment responses).

---

# 17. Related Documents

* [DOC-120 – Domain Model Specification](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md)
* [DOC-123 – Application Workflow Specification](DOC-123%20%E2%80%93%20Application%20Workflow%20Specification.md)
* [DOC-113 – Technology Profile Specification](DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md)
* [DOC-100 – Service Catalog Specification](DOC-100%20%E2%80%93%20Service%20Catalog.md)
* [DOC-101 – Approved Technology Catalog Specification](DOC-101%20%E2%80%93%20Approved%20Technology%20Cat.md)
* [DOC-102 – Pricing Engine Specification](DOC-102%20%E2%80%93%20Pricing%20Engine%20Specific.md)
* [DOC-103 – Technology Improvement Plan Specification](DOC-103%20%E2%80%93%20Technology%20Improvement%20Plan%20Specification.md)
* [DOC-104 – Technology Roadmap Specification](DOC-104%20%E2%80%93%20Technology%20Roadmap%20Specification.md)
* [DOC-105 – Project Generation Specification](DOC-105%20%E2%80%93%20Project%20Generation%20Specification.md)
* [DOC-107 – Technology Completion Report Specification](DOC-107%20%E2%80%93%20Technology%20Completion%20Report%20Specification.md)
* [DOC-118 – v1 to v2 Compatibility Reference](DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md)
* [DOC-301 – Database Schema Specification](DOC-301%20%E2%80%93%20Database%20Schema%20Specification.md) — v1 implementation
* [DOC-303 – RBAC & Security Specification](DOC-303%20RBAC%20&%20Security%20Specification.md)

---

# 18. Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-06-25 | BobKat IT | Initial database architecture — entity definitions, constraints, archival, versioning, multi-tenant readiness, and Prisma translation guidance |
