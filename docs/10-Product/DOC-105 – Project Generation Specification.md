# DOC-105 – Project Generation Specification

**Document ID:** DOC-105
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# Purpose

Project Generation defines how approved items from a Technology Improvement Plan or Roadmap become trackable **Projects** in StackScore during the BTIL **Implement** phase.

The v1 application supports manual project creation from recommendations. This specification defines automated and bulk generation rules for v2.

---

# Philosophy

Projects represent approved business initiatives designed to solve business problems and improve a client's Technology Profile.

Projects are not simply collections of technical tasks.

Every project should deliver measurable business value.

---

# Objectives

Project Generation shall:

* Convert approved initiatives into executable work.
* Standardize project delivery.
* Automatically generate implementation tasks.
* Track implementation progress.
* Measure expected versus actual outcomes.
* Update the client's Technology Profile through reassessment.

---

# Project Generation Rules (minimum)

* One primary project per approved improvement opportunity (consolidated recommendations may map to one project)
* Project inherits: title, priority, suggested service, linked recommendation(s), estimated impact
* Project follows the [Project Lifecycle](#project-lifecycle) status workflow
* Completing a project marks linked recommendation `completed` and prompts reassessment — see [Completion Workflow](#completion-workflow)
* `actualImpactPoints` measured only via reassessment (per [DOC-111A – Scoring Engine Specification](../20-Business-Logic/DOC-111A%20-%20Scoring%20Engine%20Specification.md) Appendix A) — see [Project Impact](#project-impact)

---

# Project Lifecycle

Projects shall follow the standard lifecycle:

Draft

↓

Awaiting Client Approval

↓

Approved

↓

Procurement

↓

Scheduled

↓

In Progress

↓

Validation

↓

Completed

↓

Reassessment

↓

Closed

---

# Automatic Task Generation

Each project may automatically generate default implementation tasks.

Examples include:

* Procurement
* Scheduling
* Installation
* Configuration
* Validation
* Documentation
* Client Acceptance
* Technology Profile Update
* Completion Report

Administrators may customize generated tasks.

---

# Project Components

Every project shall contain:

* Project ID
* Client
* Business Objective
* Related Recommendation(s)
* Related Solution Playbook
* Related Services
* Related Products
* Assigned Resources
* Priority
* Estimated Labor
* Estimated Timeline
* Status
* Target Technology Profile Improvement
* Administrative Notes

---

# Technician Experience

Technicians shall have access only to information required to execute assigned work.

Examples include:

* Assigned Projects
* Tasks
* Notes
* Attachments
* Photos
* Checklists
* Completion Status

Technicians shall not have access to:

* Pricing
* Internal costs
* Margins
* Solution Playbooks
* Recommendation Engine
* Scoring Engine

---

# Completion Workflow

Completing a project shall automatically:

* Mark associated work complete
* Generate a Completion Report
* Prompt reassessment
* Update the Technology Profile
* Close completed recommendations
* Archive project documentation

---

# Project Impact

Every project shall track:

* Expected Technology Profile Improvement
* Actual Technology Profile Improvement
* Expected StackScore Improvement
* Actual StackScore Improvement
* Variance

Project impact shall be measured through reassessment rather than manual adjustment.

---

# Project History

Completed projects become part of the client's permanent Technology Profile history.

Historical projects shall support:

* Executive reporting
* Historical trend analysis
* Case studies
* Business value reporting
* Quarterly reviews

Projects shall never be permanently deleted.

---

# v1 Implementation Note

Current app: manual project creation from assessment results UI. v1 project status workflow: `proposed` → `approved` → `scheduled` → `in_progress` → `completed` / `cancelled`. See [MVP_PRD.md](../50-Development/MVP_PRD.md) PJ-01–04.

---

# Business Rules

* Projects represent business initiatives rather than individual recommendations.
* Multiple recommendations may belong to a single project.
* Projects shall focus on business outcomes.
* Every completed project shall trigger reassessment.
* Historical project records shall remain immutable.
* Project success shall be measured through Technology Profile improvement.

---

# Related Documents

* [DOC-103 – Technology Improvement Plan Specification](DOC-103%20%E2%80%93%20Technology%20Improvement%20Plan%20Specification.md)
* [DOC-104 – Technology Roadmap Specification](DOC-104%20%E2%80%93%20Technology%20Roadmap%20Specification.md)
* [DOC-113 – Technology Profile Specification](../20-Business-Logic/DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md)
* [DOC-301 – Database Schema Specification](../30-Architecture/DOC-301%20%E2%80%93%20Database%20Schema%20Specification.md)

---

# Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 0.1 | 2026-06-25 | BobKat IT | Stage A stub — initial structure and project generation rules |
| 1.0 | 2026-06-25 | BobKat IT | Promoted to full specification; philosophy, objectives, lifecycle, task generation, technician experience, completion workflow, impact tracking, and business rules |
