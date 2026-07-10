# DOC-111 – Scoring Engine Specification

**Document ID:** DOC-111
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# Purpose

The Scoring Engine defines the mathematical and business rules used to calculate a client's Technology Profile.

It is the authoritative source for:

* Score calculations
* Point allocation
* Category weighting
* Technology maturity
* Recommendation triggers
* Service impact
* Historical score tracking

No other document shall define or override scoring behavior for the **v2 target architecture**.

During the v1 → v2 migration, [Appendix A – v1 Implementation (DOC-111A)](DOC-111A%20-%20Scoring%20Engine%20Specification.md) remains **implementation-active** for the running application until Phase 5 cutover. See [DOC-118 – v1 to v2 Compatibility Reference](DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md).

---

# Philosophy

StackScore is designed to produce objective, repeatable, and explainable assessments.

The same environment assessed by different consultants should produce the same Technology Profile.

Scores shall never depend on subjective judgement.

Points are earned only through measurable criteria.

---

# Scoring Principles

The Scoring Engine follows five principles.

## 1. Objective

Every question must have clearly defined scoring criteria.

No interpretation should be required.

---

## 2. Repeatable

Multiple assessors evaluating the same environment should reach the same result.

---

## 3. Explainable

Every point awarded must be traceable back to:

* Assessment Question
* Selected Answer
* Technology Capability

---

## 4. Deterministic

The same answers always produce the same score.

No randomness.

No hidden calculations.

---

## 5. Auditable

Every Technology Profile score shall be reproducible from stored assessment data.

---

# Scoring Architecture

Assessment Question

↓

Answer

↓

Capability

↓

Technology Category

↓

Technology Profile

↓

Overall StackScore

Every point awarded originates from an assessment answer.

---

# Technology Categories

The Scoring Engine evaluates seven categories.

* Infrastructure
* Security
* Business Continuity
* Productivity
* Documentation
* Strategic IT
* Operations

Each category contributes to the overall Technology Profile according to the Assessment Framework.

---

# Answer Types

Every assessment question shall use one of the following response models.

## Binary

No

Yes

---

## Ternary

No

Partial

Yes

---

## Maturity

Not Implemented

Planning

Partially Implemented

Mostly Implemented

Fully Implemented

Every question shall define its response model within the Assessment Question Bank (DOC-114).

---

# Point Allocation

Each answer option has a fixed point value.

Point values shall never be estimated during an assessment.

Points shall remain constant unless the Scoring Engine specification is formally revised.

---

# Capability Model

Assessment questions measure technology capabilities—not products.

Examples:

Identity Protection

Network Resilience

Business Continuity

Documentation

Monitoring

Technology Lifecycle

Capabilities determine maturity.

Products merely enable capabilities.

---

# Recommendation Triggers

Recommendations are generated when predefined capability thresholds are not met.

Recommendations are triggered automatically.

Consultants may add additional recommendations but may not suppress critical recommendations without justification.

---

# Service Mapping

Each capability maps to one or more professional services.

Example

Capability

Identity Protection

↓

Recommended Service

Multi-Factor Authentication Deployment

↓

Solution Playbook

Cybersecurity

Service mappings are maintained independently of scoring values.

---

# Technology Profile Updates

Technology Profile scores change only when:

* Assessment answers change
* Verified project completion satisfies capability requirements
* A reassessment is performed

Scores shall never be edited manually.

---

# Historical Tracking

Every completed assessment creates a permanent Technology Profile snapshot.

Historical scores remain immutable.

Future assessments generate new snapshots.

This enables trend analysis and progress reporting.

---

# Validation Rules

The Scoring Engine shall validate:

* Every question has a defined point value.
* Every answer belongs to a valid response model.
* Every capability maps to one technology category.
* Every recommendation maps to one or more services.
* Every service maps to at least one Solution Playbook.

---

## Scoring Data Model

Every assessment question shall conform to a standardized scoring model.

The Scoring Engine defines the structure of scoring data. The actual assessment questions and values are maintained within DOC-114 – Assessment Question Bank.

Every assessment question shall define the following attributes:

| Field                     | Description                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| Question ID               | Unique identifier (e.g. SEC-001)                                                                        |
| Question                  | Assessment question presented to the assessor                                                           |
| Response Type             | Binary, Ternary, or Maturity                                                                            |
| Answer                    | Available response option                                                                               |
| Points Awarded            | Fixed point value for the selected answer                                                               |
| Capability                | Technology capability being measured                                                                    |
| Technology Category       | Infrastructure, Security, Business Continuity, Productivity, Documentation, Strategic IT, or Operations |
| Recommendation Trigger    | Determines whether a recommendation should be generated                                                 |
| Related Service           | Primary BobKat IT service that resolves the finding                                                     |
| Related Solution Playbook | Internal Solution Playbook containing the recommended service                                           |
| Notes                     | Administrative notes (optional)                                                                         |

The Scoring Engine defines the schema. Individual assessment records are maintained separately within the Assessment Question Bank.

---

## Scoring Example

The following example demonstrates the standard scoring model.

| Question ID | Question                                              | Answer  | Points | Capability          | Technology Category | Recommendation Trigger | Related Service | Related Solution Playbook |
| ----------- | ----------------------------------------------------- | ------- | -----: | ------------------- | ------------------- | ---------------------- | --------------- | ------------------------- |
| SEC-001     | Is Multi-Factor Authentication enabled for all users? | No      |      0 | Identity Protection | Security            | Yes                    | MFA Deployment  | Cybersecurity             |
| SEC-001     | Is Multi-Factor Authentication enabled for all users? | Partial |      5 | Identity Protection | Security            | Review                 | MFA Deployment  | Cybersecurity             |
| SEC-001     | Is Multi-Factor Authentication enabled for all users? | Yes     |     10 | Identity Protection | Security            | No                     | None            | None                      |

This example illustrates the required structure for every assessment question within StackScore.

---

## Scoring Rules

The following rules govern every assessment within StackScore.

* Every assessment question shall have a unique Question ID.
* Every answer shall award a fixed number of points.
* Point values shall never be modified during an assessment.
* Points shall only be awarded through predefined answer selections.
* Manual score adjustments are prohibited.
* Every capability shall belong to one Technology Category.
* Every recommendation shall map to one or more BobKat IT services.
* Every service may belong to one or more internal Solution Playbooks.
* The same assessment answers shall always produce the same Technology Profile.
* All scoring changes shall be version controlled and documented.
* Historical assessment scores shall remain immutable after completion.
* Technology Profile improvements shall only occur following reassessment or verified completion of qualifying work.

---

## Question Identification Standard

Assessment questions shall follow a standardized identifier format.

| Prefix | Category            |
| ------ | ------------------- |
| INF    | Infrastructure      |
| SEC    | Security            |
| BCP    | Business Continuity |
| PRD    | Productivity        |
| DOC    | Documentation       |
| SIT    | Strategic IT        |
| OPS    | Operations          |

Example identifiers:

* INF-001
* SEC-004
* BCP-002
* OPS-011

Question identifiers shall never be reused.

# Administrative Controls

Only administrators may:

* Modify scoring rules
* Create capabilities
* Revise point allocations
* Create recommendation mappings

All scoring changes shall be versioned.

---

# Implementation Appendices (v1 — active until Phase 5)

| Appendix | Document | Role | Sunset |
| -------- | -------- | ---- | ------ |
| **Appendix A** | [DOC-111A – v1 Scoring Implementation](DOC-111A%20-%20Scoring%20Engine%20Specification.md) | **Active** for running application | Phase 5 (TBD) |
| **Appendix B** | [DOC-111B – Scoring Methodology Reference](DOC-111B%20-%20Scoring%20Methodology%20Reference.md) | Business context; partially superseded | Reference only |
| **Appendix C** | [DOC-115 – Question Scoring Matrix (v1 Legacy)](DOC-115%20-%20Question%20Scoring%20Matrix.md) | **Active** weights/scores for Q01–Q50 | Phase 5 (TBD) |

---

# Related Documents

* [DOC-000 – Documentation Architecture & Index](DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md)
* [DOC-110 – Assessment Framework](DOC-110%20-%20StackScore%20Assessment%20Framework.md)
* [DOC-112 – Recommendation Engine Specification](DOC-112%20%E2%80%93%20Recommendation%20Engine%20Specification.md)
* [DOC-113 – Technology Profile Specification](DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md)
* [DOC-114 – Assessment Library Specification](DOC-114%20%E2%80%93%20Assessment%20Library%20Specification.md)
* [DOC-117 – Assessment Question Bank (v1 Legacy)](DOC-117%20%E2%80%93%20Assessment%20Question%20Bank%20(v1%20Legacy).md)
* [DOC-106 – Solution Playbook Specification](DOC-106%20%E2%80%93%20Solution%20Playbook%20Specification.md)
* [DOC-118 – v1 to v2 Compatibility Reference](DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md)

---

# Business Rules

* Points are fixed.
* Scores are deterministic.
* Recommendations are rule-based.
* Technology Profiles are immutable once an assessment is completed.
* Manual score adjustments are prohibited.
* Services inherit recommendation logic from capabilities.
* Solution Playbooks inherit services.
* Technology Improvement Plans inherit Solution Playbooks.

---

# Acceptance Criteria

The Scoring Engine is considered complete when:

* Every assessment answer has a defined score.
* Every score is reproducible.
* Every recommendation can be explained.
* Every Technology Profile is mathematically consistent.
* Every completed project can demonstrate measurable improvement through reassessment.

---

# Revision History

| Version | Date       | Author    | Changes                              |
| ------- | ---------- | --------- | ------------------------------------ |
| 1.0     | 2026-06-25 | BobKat IT | Initial Scoring Engine Specification |
