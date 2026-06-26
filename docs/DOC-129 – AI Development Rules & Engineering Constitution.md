# DOC-129 – AI Development Rules & Engineering Constitution

**Document ID:** DOC-129
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# Purpose

DOC-129 establishes the mandatory engineering rules that govern all future development of StackScore.

This document serves as the **constitutional authority** for AI-assisted development and human development alike.

When documentation conflicts with implementation, **documentation shall be treated as the source of truth** until intentionally revised through the change management process defined herein.

This document governs **development practices**. It is not application logic. It applies to all contributors, including AI coding assistants.

---

# Core Philosophy

StackScore is **documentation-driven software**.

Business architecture is defined **before** implementation.

AI shall **implement documented requirements** rather than invent business logic.

---

# Development Principles

1. **Documentation First** — architecture and behavior are specified before code.
2. **Domain Driven Design** — code reflects the domain model in [DOC-120](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md).
3. **Business Before Technology** — features serve BTIL outcomes, not technical curiosity.
4. **Single Source of Truth** — one canonical definition per concept; no duplicate specs.
5. **Simplicity Over Cleverness** — prefer the smallest correct solution.
6. **Consistency Over Novelty** — match existing patterns before introducing new ones.
7. **Business Value First** — every change must improve client outcomes or operational delivery.
8. **Technology Profile First** — the Technology Profile is central to all client-facing work.
9. **Human Approval Before Automation** — billable work and client commitments require human gates.
10. **Long-Term Maintainability** — favor decisions that reduce future migration cost.

---

# Source of Truth Hierarchy

When determining application behavior, follow this order:

| Priority | Document |
| -------- | -------- |
| 1 | **DOC-129** – AI Development Rules (this constitution) |
| 2 | [DOC-001 – Product Vision](DOC-001%20-%20Product%20Vision.md) |
| 3 | [DOC-002 – Product Philosophy](DOC-002%20-%20Product%20Philosophy.md) |
| 4 | [DOC-003 – BTIL](DOC-003%20-%20Bobkat%20Technology%20Improvement%20Lifecycle%20(BTIL).md) |
| 5 | [DOC-120 – Domain Model](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md) |
| 6 | [DOC-123 – Application Workflows](DOC-123%20%E2%80%93%20Application%20Workflow%20Specification.md) |
| 7 | [DOC-121 – Database Specification](DOC-121%20%E2%80%93%20Database%20Schema%20Specification.md) |
| 8 | [DOC-124 – Service Layer](DOC-124%20%E2%80%93%20Service%20Layer%20Specification.md) |
| 9 | Business documents (DOC-100–119, DOC-125–128) per [DOC-000](DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md) |
| 10 | Existing source code |

**Source code shall never become the authoritative source** when it conflicts with approved documentation.

**Migration note:** During v1 → v2 transition, [DOC-118 – v1 to v2 Compatibility Reference](DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md) documents where running application behavior intentionally diverges from v2 target specs until Phase 5 cutover. New work follows v2 documentation; legacy behavior is changed only through documented migration phases.

---

# Mandatory Development Rules

Contributors **must**:

* Never invent business logic undocumented in governing specs.
* Never bypass the Technology Profile as the central client object.
* Never duplicate business logic across services — use [DOC-124](DOC-124%20%E2%80%93%20Service%20Layer%20Specification.md) service boundaries.
* Never embed pricing logic in UI components — delegate to Pricing Service.
* Never expose internal pricing or margins to unauthorized roles per [DOC-122](DOC-122%20%E2%80%93%20Roles%20&%20Permissions%20Specification.md).
* Never modify scoring rules without updating [DOC-111](DOC-111%20%E2%80%93%20Scoring%20Engine%20Specific.md) / [DOC-111A](DOC-111A%20-%20Scoring%20Engine%20Specification.md) and migration notes as applicable.
* Never create new business workflows without documentation in [DOC-123](DOC-123%20%E2%80%93%20Application%20Workflow%20Specification.md).
* Never bypass audit logging for critical actions per DOC-122 and [DOC-121](DOC-121%20%E2%80%93%20Database%20Schema%20Specification.md).
* Never create undocumented database entities — align with DOC-121 target or document gap in DOC-118.
* Never silently change application behavior — document, review, then implement.

---

# AI Development Expectations

## AI shall

* Read relevant documentation before implementing features.
* Follow documented workflows (DOC-123).
* Reuse existing services (DOC-124) rather than duplicating logic in routes or components.
* Preserve architectural consistency with DOC-120, DOC-121, DOC-122.
* Ask for clarification when documentation conflicts.
* Prefer extending existing architecture over introducing new patterns.
* Update documentation when architectural changes are approved.

## AI shall not

* Invent new terminology that conflicts with the domain model.
* Introduce duplicate concepts (e.g. parallel entity names for Client, Profile, Assessment).
* Create conflicting workflows or bypass approval gates.
* Ignore documented business rules in commercial, scoring, or permission specs.
* Circumvent role-based permissions for convenience.
* Treat source code as authoritative when it contradicts approved documentation.
* Modify application behavior without identifying the governing document.

---

# Engineering Standards

| Standard | Requirement |
| -------- | ----------- |
| **Commits** | Small, focused commits with clear purpose |
| **Documentation** | Update governing docs alongside architectural changes |
| **Compatibility** | Backward compatibility where practical during migration |
| **Naming** | Match domain language from DOC-120; consistent casing per codebase conventions |
| **Services** | Business logic in services; thin API routes and UI |
| **Architecture** | Domain-driven; client-scoped data respects `organizationId` and lifecycle rules |
| **Tests** | Meaningful tests for business behavior when requested or when risk is high |
| **Secrets** | Never commit credentials; follow DOC-303 |

The Business Profile shall remain intentionally lightweight. StackScore is not a CRM. Business information is collected only when it improves technology consulting decisions.
---

# Documentation Requirements

Any change affecting the following **must** include corresponding documentation updates before or with implementation:

* Business rules
* Workflows
* Technology Profile behavior
* Scoring
* Pricing
* Reporting and PDFs
* Permissions and roles
* Integrations
* Dashboards and UX standards (DOC-005, DOC-127)
* Database schema intent (DOC-121)

Register new documents in [DOC-000](DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md). Do not create parallel undocumented spec files.

---

# Change Management

Architectural changes shall follow:

```text
Business Need
    ↓
Documentation Update
    ↓
Review
    ↓
Implementation
    ↓
Validation
    ↓
Release
```

**Implementation shall not precede approved architecture.**

Emergency production fixes may patch code first but require **retroactive documentation** within one business cycle.

DOC-000 revision history and document version numbers track intentional spec changes.

---

# Quality Standards

All new features should satisfy:

| Criterion | Question |
| --------- | -------- |
| **Business purpose** | What client or operational problem does this solve? |
| **Workflow** | Which DOC-123 workflow does this support? |
| **Permissions** | Which DOC-122 roles may access this? |
| **Reporting** | Does DOC-125 / DOC-126 require updates? |
| **Technology Profile** | How does this read or update the profile per DOC-113? |
| **Audit** | What actions must be logged? |
| **UX** | Does this match DOC-005 and DOC-127? |
| **Integration** | If external systems involved, does DOC-128 apply? |

---

# Future Development

Future contributors should **extend** StackScore by enhancing existing systems rather than replacing them.

The platform evolves through **continuous improvement** while preserving architectural consistency across:

* Domain model (DOC-120)
* Service layer (DOC-124)
* Documentation registry (DOC-000)
* BTIL lifecycle (DOC-003)

Greenfield rewrites of working modules require explicit architectural approval and migration plan.

---

# Closing Principle

Every implementation should answer three questions **before code is written**:

1. **What business problem does this solve?**
2. **Which document defines this behavior?**
3. **How does this improve the client's Technology Profile or Technology Journey?**

If these questions cannot be answered, **implementation should pause** until documentation is updated.

---

# Related Documents

* [DOC-000 – Documentation Architecture & Index](DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md) — master registry
* [DOC-001 – Product Vision](DOC-001%20-%20Product%20Vision.md)
* [DOC-002 – Product Philosophy](DOC-002%20-%20Product%20Philosophy.md)
* [DOC-003 – BTIL](DOC-003%20-%20Bobkat%20Technology%20Improvement%20Lifecycle%20(BTIL).md)
* [DOC-118 – v1 to v2 Compatibility Reference](DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md)
* [DOC-120 – Domain Model Specification](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md)
* [DOC-121 – Database Schema Specification](DOC-121%20%E2%80%93%20Database%20Schema%20Specification.md)
* [DOC-122 – Roles & Permissions Specification](DOC-122%20%E2%80%93%20Roles%20&%20Permissions%20Specification.md)
* [DOC-123 – Application Workflow Specification](DOC-123%20%E2%80%93%20Application%20Workflow%20Specification.md)
* [DOC-124 – Service Layer Specification](DOC-124%20%E2%80%93%20Service%20Layer%20Specification.md)
* [DOC-300 – Technical Architecture](DOC-300%20-%20Technical%20Architecture.md)

---

# Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-06-25 | BobKat IT | Initial Engineering Constitution — development principles, source of truth hierarchy, AI rules, and change management |
