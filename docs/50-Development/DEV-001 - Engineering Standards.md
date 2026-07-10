# DEV-001 – Engineering Standards

**Document Owner:** Bobkat IT  
**Product:** StackScore  
**Status:** Active  
**Version:** 1.1

---

# Purpose

Engineering standards for StackScore implementation. This document **supplements** [DOC-129 – AI Development Rules & Engineering Constitution](DOC-129%20%E2%80%93%20AI%20Development%20Rules%20&%20Engineering%20Constitution.md). It does not override DOC-129.

Implementation sequencing is governed by [DEV-002 – Next Generation Migration Plan](DEV-002%20%E2%80%93%20Next%20Generation%20Migration%20Plan.md).

Canonical product vocabulary: [DOC-200 § Canonical Glossary](DOC-200%20%E2%80%93%20Client%20Lifecycle%20Architecture.md#canonical-glossary).

---

# Self-Documenting Code

StackScore should be self-documenting whenever practical through clear naming and well-structured functions.

Comments should explain intent—not syntax.

Comments are required when implementing:

- Business rules
- Technology maturity calculations
- Weighted scoring
- Recommendation generation
- Decision engine logic
- Portfolio ranking
- Immediate Focus calculations
- Report generation
- Complex algorithms
- Non-obvious implementation decisions
- Domain rules from DOC-120A (Program creation, ProjectRecommendation, roadmap backlog, etc.)

Comments should answer:

- Why does this exist?
- What business problem does it solve?
- Which Product Document governs this logic?
- What assumptions does this code make?

Prefer comments such as:

"Implements DOC-119 weighted Technology Maturity scoring."

"Preserves historical assessment snapshots for trend analysis."

"Recommendation deduplication ensures reassessments update existing recommendations rather than creating duplicates."

"Creates lightweight TechnologyProgram on first completed assessment (DOC-200 / DOC-120A)."

Avoid comments that simply describe code mechanics.

Poor:

// Increment counter

Good:

// Count only recommendations eligible for Immediate Focus (DOC-163).

---

# Refactoring Standard

When implementing new functionality:

- Prefer extending existing services over creating duplicate logic.
- Remove obsolete code when replacing workflows.
- Avoid maintaining multiple implementations of the same business rule.
- If a section becomes difficult to understand, refactor it into smaller, clearly named functions before adding comments.
- Follow DEV-002 phase order — do not implement future-state concepts out of dependency order.

---

# Documentation Standard

Every significant architectural or business logic change should update the appropriate documentation.

Code should never become the only source of truth.

When implementing changes, determine whether one or more Product Documents require updates.

If documentation and implementation diverge, update the documentation before considering the feature complete.

DEV-002 Definition of Done requires DEV-001 compliance for new business logic.

---

# Related Documents

* [DOC-129 – AI Development Rules & Engineering Constitution](DOC-129%20%E2%80%93%20AI%20Development%20Rules%20&%20Engineering%20Constitution.md)
* [DEV-002 – Next Generation Migration Plan](DEV-002%20%E2%80%93%20Next%20Generation%20Migration%20Plan.md)
* [DOC-200 – Client Lifecycle Architecture](DOC-200%20%E2%80%93%20Client%20Lifecycle%20Architecture.md)
* [DOC-120A – Next Generation Domain Model Addendum](DOC-120A%20%E2%80%93%20Next%20Generation%20Domain%20Model%20Addendum.md)
* [DOC-000 – Documentation Architecture & Index](DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md)

---

# Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-07-04 | BobKat IT | Initial engineering standards |
| 1.1 | 2026-07-04 | BobKat IT | Consistency resolution — authority placement, DEV-002/DOC-129 links, glossary reference |
