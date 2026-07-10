# DOC-200 – Client Lifecycle Architecture

**Document Owner:** Bobkat IT  
**Product:** StackScore  
**Status:** Draft  
**Version:** 1.1

---

# Purpose

The Client Lifecycle Architecture defines how organizations progress through their technology journey within StackScore.

Rather than treating technology assessments as isolated engagements, StackScore manages the complete lifecycle of a client's technology program—from initial discovery through continuous improvement.

This document establishes the operational model that governs every major module within the platform.

---

# Vision

StackScore is not an assessment platform.

StackScore is a Technology Program Management Platform.

Its purpose is to help consultants guide organizations through structured technology transformation using assessments, strategic planning, phased investment, implementation, reporting, and continuous improvement.

Every feature within StackScore should support this long-term consulting relationship.

---

# Core Philosophy

Technology maturity is not the destination.

Technology maturity is the measurement.

The true objective is helping organizations continuously improve technology in alignment with business objectives.

Technology should evolve through structured planning rather than isolated projects.

Every interaction should contribute toward the client's Technology Journey.

---

# Client Lifecycle

Every client progresses through the following lifecycle.

```text
Prospect (Client record)

↓

Assessment
  └── creates lightweight Technology Program (if none active)

↓

Planning Workshop
  └── configures Technology Program
  └── creates Technology Investment Roadmap

↓

Technology Investment Roadmap (phases of Projects)

↓

Projects (may include unscheduled backlog)

↓

Implementation (Project status in progress — not a separate object)

↓

Technology Journey (view over JourneyMilestone)

↓

Executive Business Reviews (EBR; evolves legacy QBR)

↓

Continuous Improvement
  (recurring Assessment + Workshop + Roadmap revision — not a separate module)
```

This lifecycle represents the standard consulting methodology implemented within StackScore.

**Program creation rule:** A lightweight active Technology Program is created at the client’s **first completed assessment** (or on explicit activation). The Planning Workshop does not create the program from scratch — it configures the program and produces the Roadmap. See DOC-120A and DEV-002 Phase 2.

---

# Lifecycle Stages

## Prospect

Purpose:

Introduce the organization into StackScore.

Objectives:

- Create client profile
- Schedule assessment
- Capture minimal business information

Deliverables:

- Client Record

---

## Assessment

Purpose:

Understand current technology maturity.

Objectives:

- Identify strengths
- Identify weaknesses
- Generate recommendations
- Calculate Technology Maturity

Deliverables:

- Assessment Report
- Technology Maturity Profile
- Recommendation Library

---

## Planning Workshop

Purpose:

Transform recommendations into a practical business strategy (DOC-205).

The Workshop **configures** the existing Technology Program and **creates** the Technology Investment Roadmap. It does not create the Program from scratch (Program is created at first assessment).

Primary planning path for new work. **TIP (DOC-103)** remains supported as a legacy coexistence path during migration (DOC-120A).

Objectives:

- Understand business priorities
- Understand budget
- Understand risk tolerance
- Identify strategic initiatives
- Prioritize investments

Deliverables:

- Configured Technology Program
- Approved Technology Investment Roadmap
- Project Priorities

---

## Technology Program

Purpose:

Provide long-term strategic oversight.

The Technology Program represents the complete consulting engagement rather than individual projects.

Created lightweight at first completed assessment. Configured by Planning Workshop.

It contains:

- Technology Journey
- Technology Investment Roadmap
- Projects
- Investments
- Progress
- Strategic Goals

---

## Technology Investment Roadmap

Purpose:

Organize Projects into logical implementation phases.

Canonical name: **Technology Investment Roadmap**. UI short label: **Roadmap**.

Roadmaps answer:

"What should happen next?"

Projects—not Recommendations—are organized within the Roadmap.

**Scheduled** projects belong to at most one active phase. Projects **may exist without a phase** (program backlog).

---

## Projects

Purpose:

Deliver measurable business outcomes.

Projects group multiple Recommendations into meaningful consulting engagements.

Projects create tangible value.

Projects produce documentation.

Projects generate executive reporting.

Projects become milestones within the Technology Journey.

---

## Technology Journey

Purpose:

Provide a historical record of organizational technology transformation.

The Technology Journey tells the story of:

- Assessments
- Projects
- Investments
- Business Outcomes
- Technology Improvements
- Strategic Milestones

The Technology Journey is intended to become the signature experience of StackScore.

---

## Executive Business Reviews (EBR)

Purpose:

Measure progress at the executive level (DOC-206).

Canonical name: **Executive Business Review (EBR)**.  
Legacy name: Quarterly Business Review (QBR) — remains readable during migration.

Review:

- Technology Score
- Business Outcomes
- Investments
- Roadmap Progress
- Future Priorities

EBRs reinforce continuous improvement rather than one-time consulting. Recommended cadence is quarterly.

---

## Continuous Improvement

Technology management is never complete.

Assessments continue.

Roadmaps evolve.

Projects change.

Business priorities shift.

StackScore exists to continuously adapt alongside the client's business.

---

# Primary Objects

The Client Lifecycle is built around several core objects.

## Client

The organization whose technology is being managed.

---

## Technology Program

Represents the complete consulting engagement.

**One active Technology Program per client.**

Created lightweight at first completed assessment (or explicit activation). Configured by Planning Workshop.

Owns:

- Technology Investment Roadmap
- Projects
- Journey milestones (Technology Journey view)
- Strategic Goals

Distinct from **Technology Profile**, which is the current maturity measurement snapshot (DOC-113).

---

## Assessment

Measures current technology maturity.

Generates recommendations.

---

## Recommendation

Identifies a technology improvement opportunity.

Recommendations answer:

"What should be improved?"

Recommendations remain diagnostic until incorporated into a Project.

---

## Project

Transforms recommendations into measurable business value.

Projects answer:

"How will these improvements be delivered?"

One Project may contain many Recommendations (DOC-203, DOC-120A).

---

## Technology Journey

Records completed improvements over time.

Provides historical context.

Demonstrates measurable progress.

**Implementation:** Technology Journey is a **view over JourneyMilestone** records — not a separate table (DOC-120A, DOC-202).

---

## Explicitly deferred

| Item | Disposition |
| ---- | ----------- |
| **ProjectTask / Tasks** | Deferred until delivery workflows require task-level tracking |
| **Deliverable as separate entity** | Use Document types |
| **BusinessOutcome as separate entity** | Use JourneyMilestone type and/or Project success fields |
| **Benchmark entities** | DOC-180 / DEV-002 Phase 8 |

---

# Relationships

```text
Client

↓

Technology Program

├── Assessments

├── Planning Workshop

├── Roadmap (Technology Investment Roadmap)

│     ↓

│   Projects (scheduled in phases; backlog allowed)

│     ↓

│ Recommendations

├── JourneyMilestone*  →  Technology Journey (view)

├── Executive Business Reviews

├── Reports / Documents

└── Activity (ActivityEvent)
```

Each object has a clearly defined responsibility.

Objects should complement one another rather than duplicate functionality.

---

# Client Workspace

The Client Workspace represents the operational home of every client.

It should answer three executive questions.

## Where are we today?

Current technology health.

Current phase.

Current investments.

Current risks.

---

## What have we accomplished?

Technology Journey.

Completed Projects.

Business Outcomes.

Technology Improvements.

---

## What happens next?

Roadmap.

Immediate Focus.

Upcoming Projects.

Future Investments.

Every screen within the Client Workspace should support one of these three questions.

---

# Design Principles

The Client Lifecycle should:

- Feel natural.
- Mirror real consulting engagements.
- Reduce planning effort.
- Emphasize measurable outcomes.
- Encourage continuous improvement.
- Hide unnecessary complexity.
- Support executive conversations.
- Produce tangible deliverables.

---

# Success Criteria

The Client Lifecycle Architecture succeeds when:

- Clients understand where they are.
- Clients understand what has improved.
- Clients understand what happens next.
- Consultants spend more time advising and less time organizing.
- Every completed engagement produces measurable value.

---

# Future Vision

StackScore should become the single source of truth for every client's technology journey.

Rather than managing isolated assessments, consultants manage long-term Technology Programs that continuously improve organizational capability through structured planning and measurable outcomes.

Every future StackScore module should reinforce this philosophy.

---

# Canonical Glossary

Use these terms uniformly across product, domain, and engineering documents.

| Term | Definition |
| ---- | ---------- |
| **Technology Profile** | Current maturity measurement snapshot for a client (scores, pillars, risk). Not the consulting engagement. |
| **Technology Program** | Complete consulting engagement container. One active program per client. Owns roadmap, projects, journey milestones, goals. |
| **Planning Workshop** | Consultant-led prioritization session that configures the Program and creates the Roadmap. Primary planning path. |
| **TIP** | Technology Improvement Plan (DOC-103). Legacy planning path; coexistence during migration. |
| **Technology Investment Roadmap** | Multi-phase plan of **Projects**. UI short label: **Roadmap**. |
| **Project** | Primary unit of value delivery. May include many Recommendations. |
| **Recommendation** | Diagnostic improvement opportunity. Supports Projects; does not schedule the Roadmap alone. |
| **Technology Journey** | Historical story of progress — a **view over JourneyMilestone** records. |
| **JourneyMilestone** | Significant journey event (what / why / what changed / what’s next). |
| **Activity / ActivityEvent** | Full auditable program activity feed. Distinct from Journey milestones. |
| **Executive Business Review (EBR)** | Canonical recurring executive review (DOC-206). |
| **QBR** | Quarterly Business Review — legacy name/implementation for EBR. |
| **Implementation** | Active project delivery (`in_progress` status) — not a separate domain object. |
| **Continuous Improvement** | Recurring Assessment + Workshop + Roadmap revision — not a separate module. |
| **Immediate Focus** | Highest-value work list/count (DOC-163). Overview component; not a top-level nav root. |
| **Document** | Stored client artifact. Project “deliverables” are Document types — not a separate Deliverable entity. |
| **Contact** | First-class consulting relationship record (Phase 7). Client primary contact fields retained for compatibility. |
| **Risk** | Tracked risk register entry. May seed from recommendations; not a second scoring model. |

---

# Related Documents

* [DOC-000 – Documentation Architecture & Index](DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md)
* [DOC-006 – StackScore Product Constitution](DOC-006%20%E2%80%93%20StackScore%20Product%20Constitution.md)
* [DOC-007 – StackScore User Experience Constitution](DOC-007%20%E2%80%93%20StackScore%20User%20Experience%20Constitution.md)
* [DOC-120A – Next Generation Domain Model Addendum](DOC-120A%20%E2%80%93%20Next%20Generation%20Domain%20Model%20Addendum.md)
* [DOC-161 – Client Workspace Specification](DOC-161%20%E2%80%93%20Client%20Workspace%20Specification.md)
* [DOC-201 – Client Workspace Framework](DOC-201%20%E2%80%93%20Client%20Workspace%20Framework.md)
* [DOC-202 – Technology Journey Framework](DOC-202%20%E2%80%93%20Technology%20Journey%20Framework.md)
* [DOC-203 – Project Definition Framework](DOC-203%20-%20Project%20Definition%20Framework.md)
* [DOC-204 – Technology Investment Roadmap Framework](DOC-204%20%E2%80%93%20Technology%20Investment%20Roadmap%20Framework.md)
* [DOC-205 – Planning Workshop & Strategic Prioritization Engine](DOC-205%20%E2%80%93%20Planning%20Workshop%20%26%20Strategic%20Prioritization%20Engine.md)
* [DOC-206 – Executive Business Review Framework](DOC-206%20%E2%80%93%20Executive%20Business%20Review%20Framework.md)
* [DEV-002 – Next Generation Migration Plan](DEV-002%20%E2%80%93%20Next%20Generation%20Migration%20Plan.md)
* [DEV-001 – Engineering Standards](DEV-001%20-%20Engineering%20Standards.md)

---

# Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-07-04 | BobKat IT | Initial Client Lifecycle Architecture |
| 1.1 | 2026-07-04 | BobKat IT | Consistency resolution — glossary, Program creation rule, EBR naming, Roadmap backlog, Journey as milestone view, deferred list |

---

# Cursor Development Guidance

This document defines the architectural philosophy of the Client Lifecycle.

Future development should prioritize lifecycle continuity over isolated features.

Assessments, Projects, Roadmaps, Reports, Technology Journey, and Executive Business Reviews should behave as connected components within a single consulting methodology rather than independent modules.

StackScore should always present technology as an ongoing business investment rather than a collection of technical tasks.

Implementation sequencing is governed by DEV-002. Entity contracts are governed by DOC-120A.