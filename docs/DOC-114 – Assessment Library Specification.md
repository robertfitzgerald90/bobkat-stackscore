# DOC-114 – Assessment Library Specification

**Document ID:** DOC-114
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# Purpose

The Assessment Library defines every assessment question available within StackScore.

It is the authoritative source for all measurable technology maturity criteria.

The Assessment Library works in conjunction with:

* DOC-110 – Assessment Framework
* DOC-111 – Scoring Engine Specification
* DOC-112 – Recommendation Engine Specification

The Assessment Library defines **what is measured**.

The Scoring Engine defines **how it is scored**.

---

# Objectives

The Assessment Library exists to:

* Standardize every assessment.
* Eliminate subjective evaluations.
* Ensure repeatable Technology Profile calculations.
* Maintain a complete catalog of measurable technology capabilities.
* Provide the source data for future automation.

---

# Assessment Categories

The Assessment Library is organized into the following categories.

* Infrastructure
* Security
* Business Continuity
* Productivity
* Documentation
* Strategic IT
* Operations

Questions shall belong to one primary category.

---

# Question Standard

Every assessment question shall contain the following information.

| Field                     | Description                                        |
| ------------------------- | -------------------------------------------------- |
| Question ID               | Unique identifier                                  |
| Question                  | Assessment prompt presented to the assessor        |
| Technology Category       | Primary category measured                          |
| Capability                | Technology capability being evaluated              |
| Response Type             | Binary, Ternary, or Maturity                       |
| Allowed Answers           | Valid response options                             |
| Evidence Required         | Optional supporting evidence                       |
| Related Recommendation    | Recommendation generated when criteria are not met |
| Related Service           | BobKat IT professional service                     |
| Related Solution Playbook | Internal Solution Playbook                         |
| Related Technologies      | Common technologies used to resolve the finding    |
| Notes                     | Administrative guidance                            |

---

# Response Models

The Assessment Library supports three response types.

## Binary

* No
* Yes

---

## Ternary

* No
* Partial
* Yes

---

## Maturity

* Not Implemented
* Planning
* Partially Implemented
* Mostly Implemented
* Fully Implemented

Each question shall use one response model.

---

# Assessment Question Template

Every question shall follow this structure.

Question ID

Question

Purpose

Technology Category

Capability

Response Type

Allowed Answers

Evidence Required

Recommendation

Related Service

Related Solution Playbook

Related Technologies

Administrative Notes

---

# Example Assessment Record

Question ID

SEC-001

Question

Is Multi-Factor Authentication enabled for all interactive users?

Purpose

Evaluate identity protection maturity.

Technology Category

Security

Capability

Identity Protection

Response Type

Ternary

Allowed Answers

No

Partial

Yes

Evidence Required

Administrative confirmation or system verification.

Recommendation

Deploy Multi-Factor Authentication.

Related Service

MFA Deployment

Related Solution Playbook

Cybersecurity

Related Technologies

Microsoft Entra ID

Cisco Duo

Okta

Administrative Notes

Applies only to interactive user accounts.

---

# Question Management Rules

* Question IDs shall never be reused.
* Questions shall remain version controlled.
* Deprecated questions shall remain archived.
* Existing assessments shall preserve historical question versions.
* New questions shall not alter historical Technology Profiles.

---

# Evidence Collection

Where practical, assessment answers should be supported by evidence.

Examples include:

* Screenshots
* Configuration exports
* Inventory reports
* Policy documentation
* Management platform verification

Future platform integrations may automatically collect supporting evidence.

---

# Future Automation

The Assessment Library is designed to support automated scoring.

Examples include:

* NinjaOne
* Microsoft Graph
* Microsoft Entra ID
* Microsoft 365
* Ubiquiti UniFi
* Aruba Central
* Cisco Meraki
* Vulnerability Management Platforms

When automated evidence is available, manual assessment may be bypassed.

---

# Relationship to Other Modules

Assessment Library

↓

Scoring Engine

↓

Technology Profile

↓

Recommendation Engine

↓

Solution Playbooks

↓

Technology Improvement Plan

---

# Business Rules

* Every assessment question shall measure exactly one capability.
* Every capability shall belong to one Technology Category.
* Every question shall reference one or more recommendations.
* Every recommendation shall reference one or more services.
* Every service may belong to one or more Solution Playbooks.
* Assessment questions shall remain vendor-agnostic whenever possible.

---

# Acceptance Criteria

The Assessment Library is complete when:

* Every Technology Profile category is fully represented.
* Every assessment question follows the standard template.
* Every question maps to a measurable capability.
* Every question produces deterministic scoring through the Scoring Engine.
* Every question supports future automation.

---

# Related Documents

* [DOC-000 – Documentation Architecture & Index](DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md)
* DOC-110 – Assessment Framework
* DOC-111 – Scoring Engine Specification
* DOC-112 – Recommendation Engine Specification
* DOC-113 – Technology Profile Specification
* [DOC-117 – Assessment Question Bank (v1 Legacy)](DOC-117%20%E2%80%93%20Assessment%20Question%20Bank%20(v1%20Legacy).md)
* DOC-106 – Solution Playbook Specification
* [DOC-118 – v1 to v2 Compatibility Reference](DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md)

---

# Revision History

| Version | Date       | Author    | Changes                                  |
| ------- | ---------- | --------- | ---------------------------------------- |
| 1.0     | 2026-06-25 | BobKat IT | Initial Assessment Library Specification |
