# DOC-120A – Next Generation Domain Model Addendum

**Document ID:** DOC-120A  
**Version:** 1.1  
**Status:** Draft  
**Owner:** BobKat IT  
**Last Updated:** July 4, 2026  
**Parent document:** [DOC-120 – Domain Model Specification](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md)  
**Sequencing authority:** [DEV-002 – Next Generation Migration Plan](../50-Development/DEV-002%20%E2%80%93%20Next%20Generation%20Migration%20Plan.md)

---

# 1. Purpose

DOC-120A defines the **future StackScore domain entities and relationships** required to support the Client Lifecycle Architecture (DOC-200–206) **before** any database or application code changes are made.

This addendum extends DOC-120. It does not replace the current domain model for running application behavior.

| Document | Authority |
| -------- | --------- |
| **DOC-120** | Current domain model — authoritative for implemented objects |
| **DOC-120A** | Next-generation domain model — authoritative for Technology Program Management entities |
| **DOC-121 / DOC-301** | Database schema — updated only when implementation phases begin |

**Rule:** No Prisma schema, migration, or application code is defined or authorized by this document alone. Implementation follows **DEV-002** phase order. This document defines entities and relationships; phase numbers in Section 10 must match DEV-002.

Canonical vocabulary: [DOC-200 § Canonical Glossary](../40-Modules/DOC-200%20%E2%80%93%20Client%20Lifecycle%20Architecture.md#canonical-glossary).

---

# 2. Architectural Context

StackScore is evolving from an assessment-centric product into a **Technology Program Management Platform** (DOC-200).

```text
Client
  └── TechnologyProgram
        ├── Assessments
        ├── PlanningWorkshop
        ├── Roadmap
        │     └── RoadmapPhase
        │           └── RoadmapPhaseProject
        │                 └── Project
        │                       └── ProjectRecommendation → Recommendation
        ├── JourneyMilestone
        ├── ExecutiveBusinessReview
        ├── ActivityEvent
        ├── Asset
        ├── Contact
        ├── Risk
        └── BillingAgreement
              └── InvestmentLine
```

**Primary questions the model must support:**

| Question | Primary objects |
| -------- | --------------- |
| Where are we today? | TechnologyProgram, Technology Profile, Risk, Immediate Focus inputs |
| What have we accomplished? | JourneyMilestone, completed Project, ExecutiveBusinessReview |
| What happens next? | Roadmap, RoadmapPhase, Project, PlanningWorkshop |

---

# 3. Object Classification

### 3.1 Existing objects to preserve (no structural change required for lifecycle)

| Object | Notes |
| ------ | ----- |
| **Client** | Remains root aggregate |
| **User / Role** | Identity and access unchanged |
| **Technology Profile** | Continues as current maturity snapshot |
| **Technology Profile Snapshot / ClientScoreHistory** | Historical score evidence |
| **Assessment** | Immutable completed assessments |
| **AssessmentResponse / AssessmentCategoryScore** | Assessment evidence |
| **AssessmentRecommendation** | Diagnostic recommendation (client-level, deduped) |
| **RecommendationTemplate / catalogs** | Shared reference data |
| **Document** | Client documents; extend foreign keys as new owners appear |
| **Note** | Internal notes; may feed ActivityEvent later |

### 3.2 Existing objects to evolve

| Object | Current state | Future state |
| ------ | ------------- | ------------ |
| **Project** | Exactly one `recommendationId` (1:1) | Many recommendations via **ProjectRecommendation** (1:N); optional program/phase ownership; executive, financial, and success-metric fields |
| **TechnologyImprovementPlan (TIP)** | Primary planning artifact | Supported during migration; superseded operationally by **PlanningWorkshop** + **TechnologyProgram** + **Roadmap** |
| **QuarterlyBusinessReview (QBR)** | Recurring review record | Supported during migration; evolves into or is replaced by **ExecutiveBusinessReview** |
| **Document** | Links to assessment, project, TIP, QBR | Additional optional FKs: program, roadmap, workshop, EBR, milestone |
| **Contact** (fields on Client) | Primary contact fields on Client | First-class **Contact** records; Client primary contact fields retained for compatibility |

### 3.3 New objects to introduce

| Object | Phase (DEV-002 / Section 10) |
| ------ | ---------------------------- |
| **TechnologyProgram** | Phase 2 |
| **JourneyMilestone** | Phase 2 (writes); Phase 5 (full Journey UI) |
| **ProjectRecommendation** | Phase 3 |
| **PlanningWorkshop** | Phase 4 |
| **Roadmap** | Phase 4 |
| **RoadmapPhase** | Phase 4 |
| **RoadmapPhaseProject** | Phase 4 |
| **ExecutiveBusinessReview** | Phase 6 |
| **ActivityEvent** | Phase 7 |
| **Asset** | Phase 7 |
| **Contact** (first-class) | Phase 7 |
| **Risk** | Phase 7 |
| **BillingAgreement** | Phase 7 |
| **InvestmentLine** | Phase 7 |

### 3.4 Objects to defer

| Object | Reason |
| ------ | ------ |
| **ProjectTask / Tasks** | Defer until delivery workflows require task-level tracking |
| **Deliverable as separate entity** | Use **Document** types |
| **BusinessOutcome as separate entity** | Use JourneyMilestone type and/or Project success fields |
| **TechnologyJourney table** | Journey is a **view over JourneyMilestone** |
| **Benchmark / industry baseline entities** | DOC-180 — Phase 8; deferred until sufficient assessment data exists |
| **Managed Technology Program (commercial catalog sense)** | Distinct from client-scoped TechnologyProgram; commercial-domain future work |
| **Full CRM Contact graph** | Contacts support consulting relationships only — not a general CRM |

---

# 4. Entity Specifications

Field lists are **domain-level**, not Prisma types. Required fields must exist for a valid record. Optional fields may be null during early phases.

---

## 4.1 TechnologyProgram

| Attribute | Value |
| --------- | ----- |
| **Purpose** | Represents the complete consulting engagement for a client — owns roadmap, projects, journey, and strategic goals |
| **Ownership** | Client (exactly one active program per client recommended; historical programs may be archived) |
| **Source** | DOC-200 |

**Relationships**

| Direction | Related object | Cardinality |
| --------- | -------------- | ----------- |
| Owned by | Client | N : 1 |
| Owns | Roadmap | 1 : 0..1 (active) |
| Owns | Project | 1 : N |
| Owns | JourneyMilestone | 1 : N |
| Owns | PlanningWorkshop | 1 : N |
| Owns | ExecutiveBusinessReview | 1 : N |
| References | Assessment (baseline / latest) | N : 0..1 each |

**Required fields**

| Field | Description |
| ----- | ----------- |
| `id` | Unique identifier |
| `clientId` | Owning client |
| `status` | e.g. draft, active, paused, completed, archived |
| `title` | Program display name |
| `createdAt` / `updatedAt` | Audit timestamps |

**Optional fields**

| Field | Description |
| ----- | ----------- |
| `strategicGoals` | Narrative or structured goals |
| `baselineAssessmentId` | Assessment that initiated the program |
| `latestAssessmentId` | Most recent completed assessment |
| `startedAt` / `completedAt` | Program lifecycle dates |
| `createdByUserId` | Consultant who opened the program |

**Creation rule (canonical — also DEV-002 Phase 2, DOC-200, DOC-205):**

> Create a lightweight **active** TechnologyProgram when a client completes their **first assessment**, or on explicit program activation if no assessment exists yet.  
> **One active TechnologyProgram per client.**  
> Planning Workshop (Phase 4) **configures** the program and creates the Roadmap — it does not create the program from scratch.

**Migration notes**

* Existing clients without a program receive one in a backfill migration (Phase 2).
* TIP records remain; they may link to `technologyProgramId` optionally during coexistence.

---

## 4.2 Roadmap

| Attribute | Value |
| --------- | ----- |
| **Purpose** | Strategic Technology Investment Roadmap for a program — organizes **Projects** into phases |
| **Ownership** | TechnologyProgram |
| **Source** | DOC-204 |

**Relationships**

| Direction | Related object | Cardinality |
| --------- | -------------- | ----------- |
| Owned by | TechnologyProgram | N : 1 |
| Owns | RoadmapPhase | 1 : N |
| Produced by | PlanningWorkshop | 0..1 : 1 (optional link) |

**Required fields**

| Field | Description |
| ----- | ----------- |
| `id` | Unique identifier |
| `technologyProgramId` | Owning program |
| `clientId` | Denormalized client for query efficiency |
| `status` | draft, approved, active, superseded, archived |
| `title` | Roadmap name |
| `version` | Monotonic version for supersession |
| `createdAt` / `updatedAt` | Audit timestamps |

**Optional fields**

| Field | Description |
| ----- | ----------- |
| `approvedAt` | When executives approved the roadmap |
| `planningWorkshopId` | Workshop that produced this version |
| `executiveSummary` | Business narrative |

**Migration notes**

* TIP `wizardState` roadmap phases are **not** automatically identical to RoadmapPhase; Phase 4 may import TIP phase labels as draft phases without inventing projects.
* DOC-104 remains authoritative for current TIP roadmap behavior until Phase 4 ships.

---

## 4.3 RoadmapPhase

| Attribute | Value |
| --------- | ----- |
| **Purpose** | A logical investment phase within a roadmap (e.g. Phase 1 – Security Foundation) |
| **Ownership** | Roadmap |
| **Source** | DOC-204 |

**Relationships**

| Direction | Related object | Cardinality |
| --------- | -------------- | ----------- |
| Owned by | Roadmap | N : 1 |
| Links | Project via RoadmapPhaseProject | N : N |

**Required fields**

| Field | Description |
| ----- | ----------- |
| `id` | Unique identifier |
| `roadmapId` | Owning roadmap |
| `name` | Phase label |
| `displayOrder` | Sort order within roadmap |
| `status` | planned, active, completed, deferred |

**Optional fields**

| Field | Description |
| ----- | ----------- |
| `businessObjective` | Why this phase exists |
| `targetStartDate` / `targetEndDate` | Planning window |
| `expectedOutcomes` | Narrative outcomes |

---

## 4.4 RoadmapPhaseProject

| Attribute | Value |
| --------- | ----- |
| **Purpose** | Join table placing a Project into a RoadmapPhase |
| **Ownership** | RoadmapPhase + Project |
| **Source** | DOC-204 |

**Relationships**

| Direction | Related object | Cardinality |
| --------- | -------------- | ----------- |
| References | RoadmapPhase | N : 1 |
| References | Project | N : 1 |

**Required fields**

| Field | Description |
| ----- | ----------- |
| `id` | Unique identifier |
| `roadmapPhaseId` | Phase |
| `projectId` | Project |
| `displayOrder` | Order within phase |

**Optional fields**

| Field | Description |
| ----- | ----------- |
| `dependencyNotes` | Phase-level dependency narrative |

**Rules (canonical roadmap membership — also DEV-002 Phase 4, DOC-204):**

* **Scheduled** projects belong to at most one **active** roadmap phase (enforced at service layer).
* Projects **may exist without a phase** (program backlog / unscheduled).
* “Every project belongs to one phase” applies only to **scheduled** projects.

---

## 4.5 Project (evolved) and ProjectRecommendation

### Current Project model (preserve until Phase 3)

| Field | Current behavior |
| ----- | ---------------- |
| `recommendationId` | **Required, unique** — exactly one recommendation per project |

### Future Project model

| Attribute | Value |
| --------- | ----- |
| **Purpose** | Primary unit of value delivery — a consulting engagement that may implement many recommendations |
| **Ownership** | Client; optionally TechnologyProgram |
| **Source** | DOC-203 |

**Relationships (future)**

| Direction | Related object | Cardinality |
| --------- | -------------- | ----------- |
| Owned by | Client | N : 1 |
| Owned by | TechnologyProgram | N : 0..1 |
| Links | Recommendation via ProjectRecommendation | 1 : N |
| Links | RoadmapPhase via RoadmapPhaseProject | N : N |
| Owns | Document, Note | 1 : N |

**Required fields (future Project)**

| Field | Description |
| ----- | ----------- |
| `id` | Unique identifier |
| `clientId` | Owning client |
| `title` | Project name |
| `status` | proposed, approved, scheduled, in_progress, completed, cancelled (existing enum may extend) |
| `priority` | Priority |
| `createdAt` / `updatedAt` | Audit timestamps |

**Optional fields (future Project)**

| Field | Description |
| ----- | ----------- |
| `technologyProgramId` | Owning program |
| `executiveSummary` | Business-language overview |
| `businessObjective` | Why the project exists |
| `strategicAlignment` | Link to program goals |
| `expectedOutcomes` | Expected business outcomes |
| `pillarCodes` | Technology pillars impacted |
| `estimatedTimeline` | Planning narrative or dates |
| `dependencies` | Narrative dependencies |
| `consultantNotes` | Internal notes |
| `laborEstimate` / cost fields | Financial investment (DOC-203 §Financial) |
| `successMetrics` | Structured or JSON success criteria |
| `estimatedImpactPoints` / `actualImpactPoints` | Existing score impact fields retained |
| `startDate` / `targetCompletionDate` / `completedAt` | Existing schedule fields retained |
| `assignedUserId` | Existing assignee retained |
| `categoryId` | May become optional when multi-pillar projects exist |

### ProjectRecommendation (new join)

| Attribute | Value |
| --------- | ----- |
| **Purpose** | Associates many Recommendations with one Project |
| **Ownership** | Project + AssessmentRecommendation |
| **Source** | DOC-203 |

**Required fields**

| Field | Description |
| ----- | ----------- |
| `id` | Unique identifier |
| `projectId` | Project |
| `recommendationId` | AssessmentRecommendation |
| `displayOrder` | Order within project scope |

**Optional fields**

| Field | Description |
| ----- | ----------- |
| `inclusionNotes` | Why this recommendation is in scope |
| `isPrimary` | Marks the originating recommendation after migration |

**Transition rules (current → future)**

| Step | Action |
| ---- | ------ |
| 1 | Introduce `ProjectRecommendation` table |
| 2 | Backfill one join row per existing Project using current `recommendationId`; set `isPrimary = true` |
| 3 | Application reads recommendations through the join (with fallback to `recommendationId` during dual-read) |
| 4 | Application writes only through the join |
| 5 | Drop unique constraint and column `Project.recommendationId` only after dual-read is removed |

**Rules**

* A recommendation may belong to at most one **active** (non-cancelled, non-completed) project.
* Completed projects retain join rows as historical evidence.
* Immediate Focus and Portfolio continue to use recommendation and project status — ranking logic is unchanged by this addendum.

---

## 4.6 JourneyMilestone

| Attribute | Value |
| --------- | ----- |
| **Purpose** | Significant Technology Journey event — tells what happened, why it mattered, what changed, and what is next |
| **Ownership** | TechnologyProgram (and Client) |
| **Source** | DOC-202 |

**Relationships**

| Direction | Related object | Cardinality |
| --------- | -------------- | ----------- |
| Owned by | TechnologyProgram | N : 1 |
| Owned by | Client | N : 1 |
| May reference | Assessment, Project, PlanningWorkshop, ExecutiveBusinessReview, Document | 0..1 each |

**Required fields**

| Field | Description |
| ----- | ----------- |
| `id` | Unique identifier |
| `clientId` | Client |
| `technologyProgramId` | Program |
| `milestoneType` | assessment, project_completion, business_outcome, investment, strategic, compliance, program, review |
| `title` | What happened |
| `occurredAt` | Milestone date |
| `createdAt` | Record created |

**Optional fields**

| Field | Description |
| ----- | ----------- |
| `whyItMattered` | Business objective narrative |
| `whatChanged` | Outcomes narrative or structured deltas |
| `whatsNext` | Next-step narrative |
| `stackScoreBefore` / `stackScoreAfter` | Score movement |
| `sourceAssessmentId` / `sourceProjectId` / etc. | Provenance links |

**Migration notes**

* Phase 2 writes milestones for program created, assessment completed, TIP generated, and QBR completed.
* Phase 5 delivers the full Technology Journey UI (DOC-202 storytelling).
* Technology Journey is a **view over JourneyMilestone** — not a separate table.
* Existing journey timeline builders remain valid inputs for milestone generation.

---

## 4.7 PlanningWorkshop

| Attribute | Value |
| --------- | ----- |
| **Purpose** | Captures the consultant-led prioritization session that **configures** the Technology Program and **creates** the Technology Investment Roadmap |
| **Ownership** | TechnologyProgram / Client |
| **Source** | DOC-205 |

**Relationships**

| Direction | Related object | Cardinality |
| --------- | -------------- | ----------- |
| Owned by | Client | N : 1 |
| Owned by | TechnologyProgram | N : 0..1 |
| References | Assessment (inputs) | N : 0..1 |
| Produces | Roadmap | 0..1 : 1 |
| May link | TechnologyImprovementPlan | 0..1 : 0..1 (coexistence) |

**Required fields**

| Field | Description |
| ----- | ----------- |
| `id` | Unique identifier |
| `clientId` | Client |
| `status` | draft, in_progress, completed, archived |
| `title` | Workshop name |
| `createdByUserId` | Facilitating consultant |
| `createdAt` / `updatedAt` | Audit timestamps |

**Optional fields**

| Field | Description |
| ----- | ----------- |
| `technologyProgramId` | Program |
| `sourceAssessmentId` | Assessment inputs |
| `businessDiscovery` | Structured notes (goals, challenges, priorities, budget, risk tolerance) |
| `prioritizationState` | Ranked initiatives / recommendation groupings |
| `completedAt` | Workshop completion |
| `legacyTipId` | Link to TIP during migration |

**Migration notes**

* TIP remains fully supported (Section 6).
* New workshops may optionally import TIP `wizardState` as a starting prioritization draft.
* DOC-103 remains authoritative for TIP until Phase 4 declares PlanningWorkshop primary.

---

## 4.8 ExecutiveBusinessReview

| Attribute | Value |
| --------- | ----- |
| **Purpose** | Recurring executive review of Technology Program progress, investment value, and next priorities |
| **Ownership** | TechnologyProgram / Client |
| **Source** | DOC-206 |

**Relationships**

| Direction | Related object | Cardinality |
| --------- | -------------- | ----------- |
| Owned by | Client | N : 1 |
| Owned by | TechnologyProgram | N : 0..1 |
| May link | QuarterlyBusinessReview | 0..1 : 0..1 (coexistence) |
| May produce | Document | 1 : 0..1 |
| May produce | JourneyMilestone | 1 : 0..1 |

**Required fields**

| Field | Description |
| ----- | ----------- |
| `id` | Unique identifier |
| `clientId` | Client |
| `title` | Review title |
| `status` | draft, ready, completed, archived |
| `reviewPeriodStart` / `reviewPeriodEnd` | Period covered |
| `createdByUserId` | Author |
| `createdAt` / `updatedAt` | Audit timestamps |

**Optional fields**

| Field | Description |
| ----- | ----------- |
| `technologyProgramId` | Program |
| `executiveSummary` | Narrative |
| `progressSummary` | Accomplishments |
| `investmentSummary` | Value delivered |
| `nextPriorities` | Forward look |
| `stackScoreStart` / `stackScoreEnd` | Period scores |
| `legacyQbrId` | Link to QBR during migration |
| `generatedAt` | Report generation time |

**Migration notes**

* QBR remains supported (Section 6).
* Phase 6 may create EBR rows from existing QBR records (`legacyQbrId`) without deleting QBR.

---

## 4.9 ActivityEvent

| Attribute | Value |
| --------- | ----- |
| **Purpose** | Auditable history of Technology Program activity |
| **Ownership** | Client / TechnologyProgram |
| **Source** | DOC-201 |

**Required fields**

| Field | Description |
| ----- | ----------- |
| `id` | Unique identifier |
| `clientId` | Client |
| `eventType` | assessment, project, recommendation, document, meeting, report, consultant, system |
| `title` | Short description |
| `occurredAt` | Event time |
| `createdAt` | Record created |

**Optional fields**

| Field | Description |
| ----- | ----------- |
| `technologyProgramId` | Program |
| `actorUserId` | Who performed the action |
| `entityType` / `entityId` | Polymorphic reference |
| `metadata` | Structured details |

**Migration notes**

* Phase 7; may be populated prospectively from domain events without backfilling full history.
* ActivityEvent is the full audit trail; JourneyMilestone is significant story only.
* Notes remain; ActivityEvent is not a replacement for confidential internal notes.

---

## 4.10 Asset

| Attribute | Value |
| --------- | ----- |
| **Purpose** | Operational awareness of client technology assets |
| **Ownership** | Client |
| **Source** | DOC-201 |

**Required fields**

| Field | Description |
| ----- | ----------- |
| `id` | Unique identifier |
| `clientId` | Client |
| `name` | Asset name |
| `assetType` | server, workstation, network, cloud, application, other |
| `status` | active, retired, unknown |
| `createdAt` / `updatedAt` | Audit timestamps |

**Optional fields**

| Field | Description |
| ----- | ----------- |
| `technologyProgramId` | Program |
| `description` | Details |
| `criticality` | Business criticality |
| `relatedProjectIds` | Soft links or join table later |

**Migration notes**

* Phase 7; no existing asset inventory to migrate.

---

## 4.11 Contact

| Attribute | Value |
| --------- | ----- |
| **Purpose** | Organizational relationships supporting consulting (not full CRM) |
| **Ownership** | Client |
| **Source** | DOC-201 |

**Required fields**

| Field | Description |
| ----- | ----------- |
| `id` | Unique identifier |
| `clientId` | Client |
| `name` | Contact name |
| `roleType` | primary, decision_maker, executive_sponsor, technical, vendor, emergency, other |
| `createdAt` / `updatedAt` | Audit timestamps |

**Optional fields**

| Field | Description |
| ----- | ----------- |
| `email` / `phone` / `title` | Contact details |
| `isPrimary` | Maps to current Client primary contact |
| `notes` | Relationship notes |

**Migration notes**

* Phase 7 backfill: create one Contact from `Client.primaryContactName` / email / phone with `roleType = primary` and `isPrimary = true`.
* Client primary contact fields remain for compatibility until UI fully adopts Contact.

---

## 4.12 Risk

| Attribute | Value |
| --------- | ----- |
| **Purpose** | Continuous visibility into organizational technology risk trends |
| **Ownership** | Client / TechnologyProgram |
| **Source** | DOC-201 |

**Required fields**

| Field | Description |
| ----- | ----------- |
| `id` | Unique identifier |
| `clientId` | Client |
| `title` | Risk title |
| `category` | cybersecurity, business_continuity, infrastructure, compliance, operational, other |
| `status` | open, mitigating, accepted, closed |
| `severity` | low, medium, high, critical |
| `createdAt` / `updatedAt` | Audit timestamps |

**Optional fields**

| Field | Description |
| ----- | ----------- |
| `technologyProgramId` | Program |
| `description` | Details |
| `sourceRecommendationId` | Originating recommendation |
| `sourceAssessmentId` | Originating assessment |
| `mitigationProjectId` | Mitigating project |

**Migration notes**

* Phase 7; may seed open risks from critical recommendations without requiring a full risk engine.
* Risk is not a second scoring model — assessment scores remain DOC-119.

---

## 4.13 BillingAgreement and InvestmentLine

| Attribute | Value |
| --------- | ----- |
| **Purpose** | Investment transparency — agreements and line items tied to program/projects |
| **Ownership** | Client / TechnologyProgram |
| **Source** | DOC-201, DOC-203 |

### BillingAgreement

**Required fields:** `id`, `clientId`, `name`, `status` (draft, active, expired, cancelled), `createdAt` / `updatedAt`  

**Optional fields:** `technologyProgramId`, `startDate`, `endDate`, `notes`

### InvestmentLine

**Required fields:** `id`, `billingAgreementId`, `clientId`, `label`, `amount`, `createdAt`  

**Optional fields:** `projectId`, `lineType` (labor, hardware, software, licensing, services, recurring, other), `isRecurring`, `occurredAt`

**Migration notes**

* Phase 7; no existing billing tables. Project financial fields are estimates; BillingAgreement / InvestmentLine are commercial investment tracking.

---

# 5. Relationship Summary

```text
Client
 ├── TechnologyProfile (preserve)
 ├── Assessment* (preserve)
 ├── AssessmentRecommendation* (preserve)
 ├── TechnologyProgram (new)
 │    ├── PlanningWorkshop* (new)
 │    ├── Roadmap (new)
 │    │    └── RoadmapPhase* (new)
 │    │         └── RoadmapPhaseProject* (new) ──► Project
 │    ├── Project* (evolve)
 │    │    └── ProjectRecommendation* (new) ──► AssessmentRecommendation
 │    ├── JourneyMilestone* (new)
 │    ├── ExecutiveBusinessReview* (new)
 │    ├── ActivityEvent* (new)
 │    └── Risk* / Asset* / BillingAgreement* (new)
 ├── Contact* (new; Client fields preserved)
 ├── TechnologyImprovementPlan* (preserve during migration)
 └── QuarterlyBusinessReview* (preserve during migration)
```

---

# 6. Coexistence: TIP and QBR

### 6.1 TechnologyImprovementPlan

| Phase | Support |
| ----- | ------- |
| **Now – Phase 3** | Full support; primary planning UX |
| **Phase 4** | Full support; PlanningWorkshop becomes preferred path for new programs |
| **Phase 4+** | Read/edit existing TIP; optional `legacyTipId` on PlanningWorkshop; no forced deletion |
| **Later** | Archive-only TIP creation if product decides to retire DOC-103 path |

**Rules**

* Do not delete TIP tables or break existing TIP documents.
* Roadmap created from PlanningWorkshop does not invalidate TIP PDFs already generated.
* Portfolio and Immediate Focus do not depend on TIP.

### 6.2 QuarterlyBusinessReview (legacy name for Executive Business Review)

Canonical product name: **Executive Business Review (EBR)** (DOC-206). QBR is the legacy implementation name.

| Phase | Support |
| ----- | ------- |
| **Now – Phase 5** | Full support for QBR |
| **Phase 6** | Full support; **EBR preferred** for new reviews |
| **Phase 6+** | Existing QBR readable; optional `legacyQbrId` on EBR |
| **Later** | QBR creation may be disabled if EBR fully replaces it |

**Rules**

* Do not delete QBR tables or documents.
* EBR reports may reference the same Document patterns as QBR.
* EBR may summarize periods that include pre-EBR QBR documents.

---

# 7. Project Model Transition (detail)

### 7.1 Current (implemented)

```text
Project.recommendationId  →  AssessmentRecommendation (1:1, unique)
```

Creating a project from a recommendation sets recommendation status to `accepted`.

### 7.2 Future (DOC-203)

```text
Project
  └── ProjectRecommendation (1:N)
        └── AssessmentRecommendation
```

### 7.3 Compatibility strategy

| Stage | Read path | Write path | Schema |
| ----- | --------- | ---------- | ------ |
| **A – Introduce join** | Prefer join; fallback `recommendationId` | Write join + keep `recommendationId` in sync for primary | Add `ProjectRecommendation` |
| **B – Join authoritative** | Join only | Join only; sync primary `recommendationId` for legacy reports | Keep column |
| **C – Remove legacy FK** | Join only | Join only | Drop `recommendationId` unique FK |

**Data backfill (Stage A)**

```text
For each Project:
  insert ProjectRecommendation(projectId, recommendationId, displayOrder=0, isPrimary=true)
```

**Service rules during transition**

* Immediate Focus, Portfolio, and recommendation lists continue to use AssessmentRecommendation and Project status fields.
* “Create project from recommendation” creates Project + primary ProjectRecommendation row.
* “Add recommendation to project” inserts additional ProjectRecommendation rows (Phase 3+ UI).

---

# 8. Ownership and Lifecycle Rules

| Rule | Specification |
| ---- | ------------- |
| **Client root** | All client-scoped objects reference `clientId` |
| **Program scope** | Active TechnologyProgram is the default container for roadmap, journey, and EBR |
| **Assessment immutability** | Unchanged — completed assessments are snapshots |
| **Recommendation identity** | Client-level dedupe (DOC-152) unchanged |
| **Project evidence** | Completed projects and their recommendation joins are retained |
| **Roadmap flexibility** | Roadmaps may be superseded by a new version; prior versions archived |
| **No score editing** | StackScore still changes only via assessment or verified qualifying work |

---

# 9. Out of Scope for This Addendum

* Prisma schema definitions
* API routes and DTOs
* UI component design
* Ranking or scoring algorithm changes
* DOC-180 benchmark entities
* Deleting TIP or QBR

---

# 10. Phased Migration Strategy

**Sequencing authority:** [DEV-002 – Next Generation Migration Plan](../50-Development/DEV-002%20%E2%80%93%20Next%20Generation%20Migration%20Plan.md). Phase numbers and names below **must match DEV-002**. This section lists domain objects per phase only.

| Phase | Domain work | Objects |
| ----- | ----------- | ------- |
| **1 – Client Workspace Foundation** | No new entities; route existing objects under workspace nav | Preserve all |
| **2 – Technology Program Foundation** | TechnologyProgram (creation rule §4.1); JourneyMilestone early writes; backfill programs | **New:** TechnologyProgram, JourneyMilestone |
| **3 – Project Architecture Redesign** | ProjectRecommendation; dual-read/write; backfill joins; defer drop of `recommendationId` | **Evolve:** Project; **New:** ProjectRecommendation |
| **4 – Planning Workshop & Technology Investment Roadmap** | PlanningWorkshop configures program + creates Roadmap; phases; TIP coexistence; backlog allowed | **New:** PlanningWorkshop, Roadmap, RoadmapPhase, RoadmapPhaseProject |
| **5 – Technology Journey Experience** | Full Journey UI over JourneyMilestone | JourneyMilestone (UI complete) |
| **6 – Executive Business Reviews** | ExecutiveBusinessReview; link legacy QBR | **New:** ExecutiveBusinessReview; **Preserve:** QBR |
| **7 – Supporting Modules** | ActivityEvent, Asset, Contact, Risk, BillingAgreement, InvestmentLine | **New:** all listed; **Evolve:** Client contact fields (compat) |
| **8 – Benchmark Intelligence** | Deferred | DOC-180 only |

### Phase exit criteria (domain)

| Phase | Exit criteria |
| ----- | ------------- |
| 2 | Every non-archived client has an active TechnologyProgram; milestones exist for completed assessments |
| 3 | Every Project has ≥1 ProjectRecommendation; no feature depends solely on unique `recommendationId` for reads |
| 4 | New programs can obtain a Roadmap of Projects via Planning Workshop without requiring TIP; unscheduled projects allowed |
| 5 | Journey UI presents milestones with what / why / what changed / what’s next |
| 6 | New executive reviews can be created as EBR while QBR remains readable |
| 7 | DOC-201 nav modules have backing entities (even if UI is minimal) |

---

# 11. Alignment with DOC-120

| DOC-120 concept | DOC-120A disposition |
| --------------- | -------------------- |
| Client root | Preserved |
| Technology Profile primary | Preserved as maturity snapshot; Program becomes engagement container |
| Assessment immutability | Preserved |
| Project as initiative | Evolved to multi-recommendation engagement |
| TIP / Roadmap planning artifacts | TIP preserved; Roadmap redefined as project-phased investment plan |
| Contact (mentioned in DOC-120 map) | Elevated to first-class entity in Phase 7 |
| Project Task | Remains deferred |

Where DOC-120 and DOC-120A conflict on **future** program-management structure, **DOC-120A governs** for Technology Program, Roadmap, and Project–Recommendation cardinality. DOC-120 remains authoritative for currently implemented behavior until each phase ships. **DEV-002 governs build order.**

---

# 12. Related Documents

* [DOC-000 – Documentation Architecture & Index](../DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md)
* [DOC-120 – Domain Model Specification](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md)
* [DOC-121 – Database Schema Specification](DOC-121%20%E2%80%93%20Database%20Schema%20Specification.md)
* [DOC-103 – Technology Improvement Plan Specification](../10-Product/DOC-103%20%E2%80%93%20Technology%20Improvement%20Plan%20Specification.md)
* [DOC-104 – Technology Roadmap Specification](../10-Product/DOC-104%20%E2%80%93%20Technology%20Roadmap%20Specification.md)
* [DOC-105 – Project Generation Specification](../10-Product/DOC-105%20%E2%80%93%20Project%20Generation%20Specification.md)
* [DOC-200 – Client Lifecycle Architecture](../40-Modules/DOC-200%20%E2%80%93%20Client%20Lifecycle%20Architecture.md)
* [DOC-201 – Client Workspace Framework](../40-Modules/DOC-201%20%E2%80%93%20Client%20Workspace%20Framework.md)
* [DOC-202 – Technology Journey Framework](../40-Modules/DOC-202%20%E2%80%93%20Technology%20Journey%20Framework.md)
* [DOC-203 – Project Definition Framework](../40-Modules/DOC-203%20-%20Project%20Definition%20Framework.md)
* [DOC-204 – Technology Investment Roadmap Framework](../40-Modules/DOC-204%20%E2%80%93%20Technology%20Investment%20Roadmap%20Framework.md)
* [DOC-205 – Planning Workshop & Strategic Prioritization Engine](../40-Modules/DOC-205%20%E2%80%93%20Planning%20Workshop%20&%20Strategic%20Prioritization%20Engine.md)
* [DOC-206 – Executive Business Review Framework](../40-Modules/DOC-206%20%E2%80%93%20Executive%20Business%20Review%20Framework.md)
* [DOC-160 – Portfolio Module Specification](../40-Modules/DOC-160%20%E2%80%93%20Portfolio%20Module%20Specification.md)
* [DOC-161 – Client Workspace Specification](../40-Modules/DOC-161%20%E2%80%93%20Client%20Workspace%20Specification.md)
* [DEV-002 – Next Generation Migration Plan](../50-Development/DEV-002%20%E2%80%93%20Next%20Generation%20Migration%20Plan.md)
* [DEV-001 – Engineering Standards](../50-Development/DEV-001%20-%20Engineering%20Standards.md)
* [DOC-301 – Database Schema Specification](DOC-301%20%E2%80%93%20Database%20Schema%20Specification.md)

---

# 13. Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-07-04 | BobKat IT | Initial next-generation domain model addendum — Technology Program entities, Project 1:N transition, TIP/QBR coexistence, and phased migration strategy |
| 1.1 | 2026-07-04 | BobKat IT | Consistency resolution — align phases to DEV-002, Program creation rule, roadmap backlog, Journey as milestone view, EBR naming, deferred list |
