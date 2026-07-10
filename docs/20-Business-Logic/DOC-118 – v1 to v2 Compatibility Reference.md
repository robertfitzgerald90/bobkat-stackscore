# DOC-118 – v1 to v2 Compatibility Reference

**Document ID:** DOC-118
**Version:** 1.0
**Status:** Approved
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# Purpose

This document defines compatibility mappings between the **v1 implementation** (running application) and the **v2 strategic architecture** (governing documentation). Use it during migration to avoid breaking assessments, scores, or recommendations.

**Implementation-active v1 sources until Phase 5:**

* [DOC-111A – Scoring Engine Appendix A](DOC-111A%20-%20Scoring%20Engine%20Specification.md)
* [DOC-115 – Question Scoring Matrix (v1 Legacy)](DOC-115%20-%20Question%20Scoring%20Matrix.md)
* [DOC-117 – Assessment Question Bank (v1 Legacy)](DOC-117%20%E2%80%93%20Assessment%20Question%20Bank%20%28v1%20Legacy%29.md).md)
* `data/RecommendationRuleCatalog.json` (v1.0.0)

**Long-term governing sources (v2):**

* [DOC-111 – Scoring Engine Specification](DOC-111%20%E2%80%93%20Scoring%20Engine%20Specific.md)
* [DOC-114 – Assessment Library Specification](DOC-114%20%E2%80%93%20Assessment%20Library%20Specification.md) + [DOC-114A–G](DOC-114B%20%E2%80%93%20Security%20Assessment%20Library.md)
* [DOC-112 – Recommendation Engine Specification](DOC-112%20%E2%80%93%20Recommendation%20Engine%20Specification.md)

---

# Category Taxonomy Mapping

| v1 Category (seed / app) | v1 Code | v2 Category (target) | Migration notes |
| ------------------------ | ------- | -------------------- | --------------- |
| Security & Protection | `security` | **Security** | Near 1:1 |
| Backup & Recovery | `backup` | **Business Continuity** | Merges with BCDR domain |
| Infrastructure & Network Health | `infrastructure` | **Infrastructure** | Near 1:1 |
| Endpoint & Asset Management | `endpoint` | **Operations** | Endpoint/lifecycle → Operations |
| Documentation & Operational Readiness | `documentation` | **Documentation** | Near 1:1 |
| Business Continuity & Disaster Recovery | `bcdr` | **Business Continuity** | Merges with Backup |
| Strategic Technology Management | `strategic` | **Strategic IT** | Rename only |
| *(none in v1)* | — | **Productivity** | Net-new questions in DOC-114D |

**Interim rule:** Display and scoring use v1 categories until v2 weights in DOC-110 are ratified and code wave C5 ships.

---

# Question ID Mapping (partial — expand during Phase 4)

| v1 ID | v1 Category | Example v2 ID (target) | Notes |
| ----- | ----------- | ---------------------- | ----- |
| Q01 | Security | SEC-001 | MFA for M365 users |
| Q02 | Security | SEC-002 | MFA for admin accounts |
| Q03 | Security | SEC-003 | Endpoint protection deployed |
| Q11 | Backup | BCP-001 | Server backups |
| Q19 | Infrastructure | INF-001 | Firewall age |
| Q31 | Endpoint | OPS-001 | Unsupported OS |
| Q46 | Strategic | SIT-001 | Technology roadmap |

Full Q01–Q50 mapping to be completed when DOC-114A–G questions are authored.

---

# Rating vs Maturity Tier (do not conflate)

## StackScore Rating (overall health band)

Used in v1 app and DOC-111A. Applies to **overall score** and per-category percent.

| Score | Rating enum | Display |
| ----- | ----------- | ------- |
| 90–100 | `exceptional` | Exceptional |
| 80–89 | `strong` | Strong |
| 70–79 | `stable` | Stable |
| 60–69 | `at_risk` | At Risk |
| Below 60 | `critical` | Critical |

## Maturity Tier (Technology Profile — DOC-113)

Applies to **category maturity** display. Renamed in Stage A to avoid collision with rating "Critical".

| Score | Maturity Tier |
| ----- | ------------- |
| 0–20 | **Nascent** |
| 21–40 | **Foundational** |
| 41–60 | **Developing** |
| 61–80 | **Mature** |
| 81–100 | **Optimized** |

---

# Service Name Alignment (DOC-100 canonical)

During Phase 2, align `RecommendationRuleCatalog.json` `services` array to [DOC-100 – Service Catalog](../10-Product/DOC-100%20%E2%80%93%20Service%20Catalog.md). Interim aliases:

| JSON catalog (v1) | DOC-100 canonical (target) |
| ----------------- | -------------------------- |
| Microsoft 365 Protection | Microsoft 365 Security & Protection |
| Managed Endpoint Security | Endpoint Security Management |
| Documentation & Assessment Services | Documentation Services |
| Security Hardening | Security Hardening Services |

---

# Technology Profile Proxy (v1)

Until DOC-113 is implemented as a first-class entity, the Technology Profile is **proxied by:**

| Profile component | v1 implementation |
| ----------------- | ------------------- |
| Client identity | `Client` model |
| Latest scores | Most recent completed `Assessment` |
| Category breakdown | `AssessmentCategoryScore` / denormalized assessment columns |
| History | `ClientScoreHistory` |
| Improvement opportunities | `AssessmentRecommendation` |
| Active remediation | `Project` |

---

# Legacy Redirect Stubs

| Stub file | Canonical target |
| --------- | ---------------- |
| `Vision.md` | DOC-001 |
| `TechnicalArchitecture.md` | DOC-300 |
| `DatabaseSchema.md` | DOC-301 |
| `API_Specification.md` | DOC-302 |
| `RBAC_Security_Spec.md` | DOC-303 |
| `ScoringSpecification.md` | DOC-111A (v1 appendix) |
| `ScoreCalculation.md` | DOC-111B |
| `AssessmentQuestions.md` | DOC-117 |
| `QuestionScoringMatrix.md` | DOC-115 |
| `RecommendationEngine.md` | DOC-112 |

---

# Feature Flags (documented for future implementation)

| Flag | v1 value | v2 value | Introduced |
| ---- | -------- | -------- | ---------- |
| `assessmentLibraryVersion` | `v1` | `v2` | Wave C4 |
| `scoringEngineVersion` | `v1` | `v2` | Wave C5 |

Completed v1 assessments must **never** be recalculated under v2 rules without an explicit admin migration job.

---

# Related Documents

* [DOC-000 – Documentation Architecture & Index](../DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md)
* [DOC-111 – Scoring Engine Specification](DOC-111%20%E2%80%93%20Scoring%20Engine%20Specific.md)
* [DOC-113 – Technology Profile Specification](DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md)

---

# Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-06-25 | BobKat IT | Stage A — initial compatibility reference |
