# DOC-000 – Documentation Architecture & Index

**Document ID:** DOC-000
**Version:** 1.4
**Status:** Approved
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# Purpose

This document is the master registry for all StackScore documentation. It defines authority tiers, version lanes (v1 implementation vs v2 strategic target), and the governance hierarchy for future development.

**Operational guides** (`MVP_PRD.md`, `PROJECT_STATUS.md`, `DEVELOPMENT_GUIDE.md`) are excluded from the governance hierarchy — they describe scope and implementation status, not long-term architecture.

---

# Authority Hierarchy

```text
DOC-000 (this index)
    │
    ├── Business Governance (DOC-001 – DOC-005)
    ├── Commercial Domain (DOC-100 – DOC-102, DOC-103 – DOC-107)
    ├── Client Hub (DOC-113)
    ├── Assessment Domain (DOC-110, DOC-111, DOC-112, DOC-114, DOC-114A–G)
    ├── v1 Legacy Appendices (DOC-111A, DOC-111B, DOC-115, DOC-117) — active until Phase 5
    ├── Domain Architecture (DOC-120 – DOC-124)
    └── Technical Layer (DOC-300 – DOC-303)
```

If documents conflict, resolve in this order:

1. DOC-000 disposition table below
2. [DOC-118 – v1 to v2 Compatibility Reference](DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md)
3. Higher authority tier wins within the same domain
4. v2 strategic specs win long-term; v1 appendices win for **running application behavior** until Phase 5 cutover

---

# Document Registry

## Business governance

| ID | Title | Authority | Version lane | Status |
| -- | ----- | --------- | ------------ | ------ |
| DOC-001 | Product Vision | Governing | v2 | Draft |
| DOC-002 | Product Philosophy | Governing | v2 | Draft |
| DOC-003 | BobKat Technology Improvement Lifecycle (BTIL) | Governing | v2 | Draft |
| DOC-004 | Design Principles | Governing | v2 | Draft |
| DOC-005 | UI & UX Standards | Governing (canonical visual specs) | v2 | Draft |

## Commercial domain

| ID | Title | Authority | Version lane | Status |
| -- | ----- | --------- | ------------ | ------ |
| DOC-100 | Service Catalog Specification | Governing | v2 | Draft |
| DOC-101 | Approved Technology Catalog Specification | Governing | v2 | Draft |
| DOC-102 | Pricing Engine Specification | Governing | v2 | Draft |
| DOC-103 | Technology Improvement Plan Specification | Governing | v2 | Draft |
| DOC-104 | Technology Roadmap Specification | Governing | v2 | Draft |
| DOC-105 | Project Generation Specification | Governing | v2 | Draft |
| DOC-106 | Solution Playbook Specification | Governing | v2 | Draft |
| DOC-107 | Technology Completion Report Specification | Governing | v2 | Draft |

## Assessment & scoring

| ID | Title | Authority | Version lane | Status |
| -- | ----- | --------- | ------------ | ------ |
| DOC-110 | StackScore Assessment Framework | Governing | v2 (weights pending revision) | Informal |
| DOC-111 | Scoring Engine Specification | **Governing (v2 target)** | v2 | Draft |
| DOC-111A | Scoring Engine — Appendix A (v1 Implementation) | Appendix — **active for app** | v1 | Deprecated at Phase 5 |
| DOC-111B | Scoring Methodology — Appendix B (Business Context) | Appendix — reference only | v1 | Partially superseded |
| DOC-112 | Recommendation Engine Specification | Governing | v2 + v1 appendix | Draft |
| DOC-113 | Technology Profile Specification | Governing | v2 | Draft |
| DOC-114 | Assessment Library Specification | Governing (meta-standard) | v2 | Draft |
| DOC-114A | Infrastructure Assessment Library | Governing | v2 | Draft (outline) |
| DOC-114B | Security Assessment Library | Governing | v2 | Draft (outline) |
| DOC-114C | Business Continuity Assessment Library | Governing | v2 | Draft (outline) |
| DOC-114D | Productivity Assessment Library | Governing | v2 | Draft (outline) |
| DOC-114E | Documentation Assessment Library | Governing | v2 | Draft (outline) |
| DOC-114F | Strategic IT Assessment Library | Governing | v2 | Draft (outline) |
| DOC-114G | Operations Assessment Library | Governing | v2 | Draft (outline) |
| DOC-115 | Question Scoring Matrix (v1 Legacy) | Appendix — **active for app** | v1 | Deprecated at Phase 5 |
| DOC-117 | Assessment Question Bank (v1 Legacy) | Appendix — **active for app** | v1 | Deprecated at Phase 5 |
| DOC-118 | v1 to v2 Compatibility Reference | Governing (migration) | Both | Approved |

## Domain architecture

Authoritative specifications that translate business architecture into software domain concepts. These documents guide schema, API, service layer, and workflow design without defining implementation artifacts directly.

| ID | Title | Version | Authority | Version lane | Status |
| -- | ----- | ------- | --------- | ------------ | ------ |
| [DOC-120](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md) | Domain Model Specification | 1.0 | Governing (domain) | v2 | Draft |
| [DOC-121](DOC-121%20%E2%80%93%20Database%20Schema%20Specification.md) | Database Schema Specification | 1.0 | Governing (database) | v2 | Draft |
| [DOC-122](DOC-122%20%E2%80%93%20Roles%20&%20Permissions%20Specification.md) | Roles & Permissions Specification | 1.0 | Governing (security) | v2 | Draft |
| [DOC-123](DOC-123%20%E2%80%93%20Application%20Workflow%20Specification.md) | Application Workflow Specification | 1.0 | Governing (workflow) | v2 | Draft |
| [DOC-124](DOC-124%20%E2%80%93%20Service%20Layer%20Specification.md) | Service Layer Specification | 1.0 | Governing (services) | v2 | Draft |

### DOC-120 – Domain Model Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-120 |
| **Title** | Domain Model Specification |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Defines StackScore core business objects, ownership model, relationships, lifecycle rules, and domain boundaries. |
| **Depends on** | DOC-001, DOC-003, DOC-100–107, DOC-110–114, DOC-118 |
| **Used by** | DOC-121, DOC-122, DOC-123, DOC-124, DOC-301 |

### DOC-121 – Database Schema Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-121 |
| **Title** | Database Schema Specification |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Defines the database-level structure required to support the StackScore domain model; guides future Prisma schema design. |
| **Depends on** | DOC-120 |
| **Used by** | DOC-301, DOC-122, DOC-124 |

### DOC-122 – Roles & Permissions Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-122 |
| **Title** | Roles & Permissions Specification |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Defines user roles, permission boundaries, access rules, and security expectations across StackScore modules. |
| **Depends on** | DOC-120, DOC-121 |
| **Used by** | DOC-303, DOC-302, DOC-124 |

### DOC-124 – Service Layer Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-124 |
| **Title** | Service Layer Specification |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Defines the application service layer — business services, dependencies, domain events, and orchestration rules that implement DOC-123 workflows against the DOC-120 domain model. |
| **Depends on** | DOC-120, DOC-121, DOC-122, DOC-123 |
| **Used by** | DOC-300, DOC-302 |

Domain architecture tier (DOC-120 – DOC-124) is fully specified at Draft v1.0.

## Technical layer

| ID | Title | Authority | Version lane | Status |
| -- | ----- | --------- | ------------ | ------ |
| DOC-300 | Technical Architecture | Governing | v1 + v2 | Implementation guide |
| DOC-301 | Database Schema Specification | Governing | v1 + v2 | Schema spec (v1 implementation; see DOC-121 for v2 target) |
| DOC-302 | API Specification | Governing | v1 + v2 | API spec (see DOC-124 for v2 service delegation) |
| DOC-303 | RBAC & Security Specification | Governing | v1 + v2 | Security spec (v1 enforcement; see DOC-122 for v2 target) |

## Machine-readable artifacts

| Artifact | Authority | Notes |
| -------- | --------- | ----- |
| `data/RecommendationRuleCatalog.json` | Governing (v1 rules) | Canonical runtime source |
| `docs/RecommendationRuleCatalog.json` | Deprecated mirror | Remove after link audit |

## Operational (non-governing)

| File | Purpose |
| ---- | ------- |
| `MVP_PRD.md` | MVP scope and user stories |
| `PROJECT_STATUS.md` | Implementation status snapshot |
| `DEVELOPMENT_GUIDE.md` | Local developer setup |

## Legacy redirect stubs

Ten `*.md` stubs (e.g. `Vision.md`, `ScoringSpecification.md`) redirect to canonical DOC files. See [DOC-118](DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md#legacy-redirect-stubs).

---

# Migration Phases (summary)

| Phase | Milestone | v1 appendices |
| ----- | --------- | ------------- |
| **Stage A** | Registry, renames, stubs (this release) | Remain active |
| Stage B | v2 conceptual foundation | Remain active |
| C1–C3 | Catalog, profile, TIP (additive) | Remain active |
| C4–C6 | Parallel v2 question libraries | Dual-track |
| **Phase 5 (C7)** | v1 bank read-only for new work | **Sunset DOC-111A, DOC-115, DOC-117** |
| C9 | Archive v1 appendices | Read-only historical |

Target Phase 5 date: **TBD** (set when C4 pilot library ships).

---

# Related Documents

* [DOC-118 – v1 to v2 Compatibility Reference](DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md)
* [DOC-001 – Product Vision](DOC-001%20-%20Product%20Vision.md)
* [DOC-003 – BTIL](DOC-003%20-%20Bobkat%20Technology%20Improvement%20Lifecycle%20(BTIL).md)
* [DOC-120 – Domain Model Specification](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md)
* [DOC-121 – Database Schema Specification](DOC-121%20%E2%80%93%20Database%20Schema%20Specification.md)
* [DOC-122 – Roles & Permissions Specification](DOC-122%20%E2%80%93%20Roles%20&%20Permissions%20Specification.md)
* [DOC-124 – Service Layer Specification](DOC-124%20%E2%80%93%20Service%20Layer%20Specification.md)

---

# Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-06-25 | BobKat IT | Stage A — initial documentation registry |
| 1.1 | 2026-06-25 | BobKat IT | Registered DOC-107, DOC-120 (Domain Architecture tier), and dependency metadata |
| 1.2 | 2026-06-25 | BobKat IT | Registered DOC-121 (database architecture) and DOC-123 (workflow); DOC-301 v2 target note |
| 1.3 | 2026-06-25 | BobKat IT | Registered DOC-122 (roles & permissions); DOC-303 v2 target note |
| 1.4 | 2026-06-25 | BobKat IT | Registered DOC-124 (service layer); Domain Architecture tier DOC-120–124 complete |
