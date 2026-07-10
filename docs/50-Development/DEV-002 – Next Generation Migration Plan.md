# DEV-002 – Next Generation Migration Plan

**Document Owner:** Bobkat IT  
**Product:** StackScore  
**Status:** Active  
**Version:** 1.1

---

# Purpose

This document defines the phased implementation plan for migrating StackScore from its current assessment-centric architecture to the next-generation Technology Program Management Platform defined by the 200-series documentation.

This is an implementation roadmap—not a product specification.

Its purpose is to guide development while minimizing rework, protecting production stability, and preserving the existing user experience wherever possible.

**Sequencing authority:** DEV-002 is the single source of truth for **implementation phase order**. DOC-120A defines **entities and relationships** and must use the same phase numbers and names as this document. DOC-200–206 define **product intent**.

---

# Guiding Principles

The migration should:

- Be incremental.
- Preserve working functionality.
- Avoid unnecessary database migrations.
- Maintain backward compatibility whenever practical.
- Build upon existing modules instead of replacing them.
- Follow documented architecture before introducing new features.

The goal is continuous evolution—not a complete rewrite.

---

# Architectural Authority

Development shall follow the following hierarchy:

1. DOC-129 – Engineering Constitution
2. DOC-006 – Product Constitution
3. DOC-007 – UX Constitution
4. DOC-200–206 – Technology Program Architecture (product intent)
5. DOC-120A – Domain Model Addendum (entity/relationship contract)
6. **DEV-002 – this document (implementation sequencing)**
7. DOC-160–163 – Current Portfolio & Client Workspace (preserve until replaced)
8. DEV-001 – Engineering Standards (comments, refactoring, docs-as-deliverable)
9. Existing implementation documents (DOC-103–105, DOC-120, etc.) until a phase intentionally supersedes them

**Conflict rules:**

| Concern | Wins |
| ------- | ---- |
| Product intent (what the platform is) | DOC-200–206 |
| Entity names, fields, cardinality | DOC-120A |
| Build order and phase exit criteria | **DEV-002** |
| Current Portfolio / Immediate Focus behavior | DOC-160–163 until a phase replaces it |
| Commenting and documentation discipline | DEV-001 (supplements DOC-129) |

If implementation conflicts with architecture, the architecture should generally take precedence unless an explicit migration exception exists in this document.

Canonical vocabulary is defined in [DOC-200 § Canonical Glossary](../40-Modules/DOC-200%20%E2%80%93%20Client%20Lifecycle%20Architecture.md#canonical-glossary).

---

# Current State

StackScore currently includes:

- Portfolio
- Dashboard
- Client Workspace (operational — DOC-161)
- Assessments
- Recommendations
- Technology Improvement Plan (TIP) — legacy planning path
- Quarterly Business Reviews (QBR) — legacy executive review path
- Project Register
- Reports
- Business Profile
- Documents

These modules remain operational and continue serving as the foundation for future development.

---

# Future State

StackScore will evolve into a Technology Program Management Platform centered around:

```text
Client
  └── Technology Program (lightweight at first assessment)
        ├── Planning Workshop (configures program + creates roadmap)
        ├── Technology Investment Roadmap (phases of Projects)
        ├── Projects (many Recommendations each)
        ├── Technology Journey (view over JourneyMilestone)
        ├── Executive Business Reviews (EBR; evolves QBR)
        └── Continuous Improvement (recurring assessment + workshop + roadmap revision)
```

Supporting workspace modules (Phase 7): Contacts, Assets, Risks, Billing, Activity, Enhanced Documents.

---

# Migration Strategy

Development will occur in controlled phases.

Each phase should produce usable software.

Avoid long-lived development branches that provide no customer value.

**Do not implement future-state concepts out of dependency order.**

---

# Phase 1 – Client Workspace Foundation

**Status:** Next

**Objectives:**

- Introduce Client Workspace shell and primary navigation per DOC-201.
- Establish Overview as the operational home.
- Preserve Immediate Focus and KPI snapshot per DOC-161 / DOC-163.
- Preserve Portfolio behavior (DOC-160–162).
- Route existing modules into workspace navigation (stubs allowed for empty modules).

**Deliverables:**

- Workspace navigation (Overview, Technology Journey, Roadmap, Projects, Assessments, Recommendations, Assets, Documents, Contacts, Billing, Executive Reports, Risks, Activity)
- Overview minimum: health KPIs, Immediate Focus, maturity context (DOC-161 hierarchy preserved above-the-fold)
- Consistent page hierarchy

**Acceptance criteria:**

- Shell/nav follows DOC-201.
- Overview content minimum follows DOC-161 (KPIs + Immediate Focus).
- Portfolio and Immediate Focus ranking unchanged.

**Dependencies:** None

**Domain objects:** None required

---

# Phase 2 – Technology Program Foundation

**Objectives:**

Introduce the Technology Program object and begin recording Journey milestones for program-level events.

**TechnologyProgram creation rule (canonical):**

> Create a lightweight **active** TechnologyProgram when a client completes their **first assessment**, or on explicit program activation if no assessment exists yet.  
> **One active TechnologyProgram per client.**  
> Planning Workshop (Phase 4) **configures** the program and creates the Roadmap — it does not create the program from scratch.

**Responsibilities of TechnologyProgram:**

- Own Roadmap (when created)
- Own Projects (when linked)
- Own Journey milestones
- Own Strategic Goals

Initially this object may remain lightweight.

**JourneyMilestone (early writes):**

- May be written in Phase 2 for: program created, assessment completed, TIP generated, QBR completed.
- Full Technology Journey **UI / storytelling experience** ships in Phase 5.
- Technology Journey is a **view over JourneyMilestone** — not a separate table.

**Deliverables:**

- TechnologyProgram entity
- Client ownership; one active program per client
- JourneyMilestone entity + generation for early events
- Backfill active program for existing non-archived clients

**Dependencies:** Phase 1

**Domain objects:** TechnologyProgram, JourneyMilestone (DOC-120A)

---

# Phase 3 – Project Architecture Redesign

**Priority:** Highest

**Objectives:**

Transform Projects into true consulting engagements (DOC-203).

**Current:**

```text
Recommendation → Project (1:1 via recommendationId)
```

**Future:**

```text
Project → ProjectRecommendation* → Recommendation (1:N)
```

**Deliverables:**

- ProjectRecommendation join table
- Backfill one join row per existing project (`isPrimary = true`)
- Dual-read then join-authoritative reads (DOC-120A §7)
- Multi-recommendation project support
- Executive summary, deliverables (as Document types), financial fields, success metrics on Project
- Workflows: create project from recommendation; add recommendation to existing project

**Exit criteria before dropping `Project.recommendationId`:**

- Every Project has ≥1 ProjectRecommendation
- No feature depends solely on unique `recommendationId` for reads
- Explicit approval to execute Stage C (drop legacy FK)

**Dependencies:** Phase 2 (Technology Program)

**Domain objects:** Evolve Project; introduce ProjectRecommendation

---

# Phase 4 – Planning Workshop & Technology Investment Roadmap

**Objectives:**

- Deliver Planning Workshop (DOC-205) as the primary path from assessment findings to program configuration and roadmap.
- Schedule **Projects** (not recommendations) into investment phases (DOC-204).

**Planning Workshop:**

- Inputs: assessment results, maturity, recommendations, risk, existing projects, journey history
- Outputs: configures TechnologyProgram; creates Roadmap version
- TIP remains fully supported (coexistence); optional import of TIP `wizardState` as draft prioritization only — **do not auto-create projects from TIP phases**

**Roadmap membership rule (canonical):**

> **Scheduled** projects belong to at most one active RoadmapPhase.  
> Projects **may exist without a phase** (program backlog / unscheduled).  
> DOC-204 “belong to one phase” applies to **scheduled** projects only.

**Deliverables:**

- PlanningWorkshop entity and workflow
- Roadmap, RoadmapPhase, RoadmapPhaseProject
- Investment planning and phase progression (manual phase activation initially)
- Budget visibility (project financial fields + optional investment lines later)
- Phase score outlook using **existing** projection rules (DOC-119 / DOC-152) — not a new forecasting entity

**Dependencies:** Phase 3 (Project redesign)

**Domain objects:** PlanningWorkshop, Roadmap, RoadmapPhase, RoadmapPhaseProject

---

# Phase 5 – Technology Journey Experience

**Objectives:**

Introduce the milestone-based historical storytelling UI (DOC-202).

Milestones may already exist from Phase 2+; this phase completes the signature Journey experience.

**Deliverables:**

- Journey timeline UI (what / why / what changed / what’s next)
- Business outcomes and technology improvements presentation
- Investment history narrative
- Links from completed projects and EBRs into milestones

**Dependencies:** Phase 2 (milestone entity); Phase 3–4 enrich content (projects, roadmap)

**Domain objects:** JourneyMilestone (UI and generation rules complete)

---

# Phase 6 – Executive Business Reviews

**Objectives:**

Transform Quarterly Business Reviews into **Executive Business Reviews (EBR)** (DOC-206).

**Canonical name:** Executive Business Review (EBR).  
**Legacy name:** Quarterly Business Review (QBR) — remains readable; optional `legacyQbrId` on EBR.

**Deliverables:**

- ExecutiveBusinessReview entity
- EBR as review + executive report (not a second Dashboard product)
- Business outcome reporting, roadmap progress, journey summaries, future priorities
- EBR may summarize periods that include pre-EBR QBR documents

**Dependencies:** Phase 5 (Journey experience) preferred; Phase 2 program minimum

**Domain objects:** ExecutiveBusinessReview; preserve QBR

---

# Phase 7 – Supporting Modules

**Objectives:**

Expand Client Workspace modules (DOC-201).

**Modules:**

- Contacts (first-class; backfill from Client primary contact fields)
- Assets
- Risks (may seed from critical recommendations; not a second scoring model)
- Billing (BillingAgreement / InvestmentLine)
- Activity (ActivityEvent feed — full audit trail; distinct from Journey milestones)
- Enhanced Documents

**Dependencies:** Phase 1 (workspace shell)

**Domain objects:** Contact, Asset, Risk, BillingAgreement, InvestmentLine, ActivityEvent

---

# Phase 8 – Benchmark Intelligence

**Status:** Deferred

**Objectives:** Industry averages, benchmarks, predictive scoring (DOC-180).

Do not begin until meaningful customer data exists.

**Domain objects:** None in DOC-120A (deferred)

---

# Explicitly Deferred (do not implement in Phases 1–7)

| Item | Disposition |
| ---- | ----------- |
| **ProjectTask / Tasks** | Deferred until delivery workflows require task-level tracking |
| **Deliverable as separate entity** | Use **Document** types |
| **BusinessOutcome as separate entity** | Use JourneyMilestone type and/or Project success fields |
| **TechnologyJourney table** | Journey is a **view over JourneyMilestone** |
| **Benchmark / industry baseline entities** | Phase 8 / DOC-180 |
| **Full CRM contact graph** | Contacts support consulting relationships only |

---

# Development Priorities

When deciding between two implementation options, prioritize:

1. Architectural consistency
2. Business value
3. Simplicity
4. Reusability
5. Performance
6. Visual refinement

---

# Migration Rules

The migration should avoid:

- Breaking existing assessments.
- Breaking Portfolio.
- Breaking Immediate Focus.
- Breaking historical reports.

Existing workflows should remain functional until intentionally replaced.

TIP and QBR remain fully supported until Phases 4 and 6 respectively declare the new primary write path (DOC-120A §6).

---

# Refactoring Philosophy

Refactoring is encouraged when it simplifies architecture, reduces duplicate logic, improves maintainability, or better aligns with documented architecture.

Avoid refactoring solely for stylistic reasons.

Follow [DEV-001 – Engineering Standards](DEV-001%20-%20Engineering%20Standards.md).

---

# Documentation Requirements

Every completed phase should include:

- Documentation updates (DOC-120A, affected 200-series, DOC-000 as needed)
- Architecture validation against DOC-200–206 and DOC-120A
- Cursor context refresh
- Compliance with DEV-001 (intent comments; docs match code)

Documentation remains part of the deliverable.

---

# Definition of Done

A migration phase is complete when:

- Functionality is implemented per this phase’s deliverables and exit criteria.
- Documentation is updated and matches reality.
- Existing workflows remain operational.
- No architectural regressions exist.
- DEV-001 standards are met for new business logic.
- Manual testing passes.

Implementation is not complete until documentation matches reality.

---

# Long-Term Vision

The end state of StackScore is not an assessment platform.

It is a Technology Program Management Platform that enables consultants to guide organizations through continuous technology improvement using structured planning, measurable business outcomes, executive reporting, and long-term strategic partnership.

---

# Success Metrics

This migration is successful when:

- Every module feels connected.
- Projects become the primary delivery object.
- The Client Workspace becomes the operational home.
- Technology Journey tells the client's story.
- Executive Business Reviews become largely automatic.
- Consultants spend more time advising and less time organizing information.

---

# Related Documents

* [DOC-000 – Documentation Architecture & Index](../DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md)
* [DOC-200 – Client Lifecycle Architecture](../40-Modules/DOC-200%20%E2%80%93%20Client%20Lifecycle%20Architecture.md) (glossary + product intent)
* [DOC-201 – Client Workspace Framework](../40-Modules/DOC-201%20%E2%80%93%20Client%20Workspace%20Framework.md)
* [DOC-202 – Technology Journey Framework](../40-Modules/DOC-202%20%E2%80%93%20Technology%20Journey%20Framework.md)
* [DOC-203 – Project Definition Framework](../40-Modules/DOC-203%20-%20Project%20Definition%20Framework.md)
* [DOC-204 – Technology Investment Roadmap Framework](../40-Modules/DOC-204%20%E2%80%93%20Technology%20Investment%20Roadmap%20Framework.md)
* [DOC-205 – Planning Workshop & Strategic Prioritization Engine](../40-Modules/DOC-205%20%E2%80%93%20Planning%20Workshop%20&%20Strategic%20Prioritization%20Engine.md)
* [DOC-206 – Executive Business Review Framework](../40-Modules/DOC-206%20%E2%80%93%20Executive%20Business%20Review%20Framework.md)
* [DOC-120A – Next Generation Domain Model Addendum](../30-Architecture/DOC-120A%20%E2%80%93%20Next%20Generation%20Domain%20Model%20Addendum.md)
* [DOC-160 – Portfolio Module Specification](../40-Modules/DOC-160%20%E2%80%93%20Portfolio%20Module%20Specification.md)
* [DOC-161 – Client Workspace Specification](../40-Modules/DOC-161%20%E2%80%93%20Client%20Workspace%20Specification.md)
* [DEV-001 – Engineering Standards](DEV-001%20-%20Engineering%20Standards.md)
* [DOC-180 – Benchmark Intelligence Framework](../40-Modules/DOC-180%20-%20Benchmark%20Intelligence%20Framework.md)

---

# Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-07-04 | BobKat IT | Initial migration plan |
| 1.1 | 2026-07-04 | BobKat IT | Consistency resolution — sequencing authority, Planning Workshop in Phase 4, Journey early writes vs Phase 5 UI, Program creation rule, roadmap backlog, EBR naming, deferred list, DEV-001/DOC-120A alignment |
