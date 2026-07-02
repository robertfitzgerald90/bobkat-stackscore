# DOC-000 – Documentation Architecture & Index

**Document ID:** DOC-000
**Version:** 2.5
**Status:** Approved
**Owner:** BobKat IT
**Last Updated:** June 30, 2026

---

# Purpose

This document is the master registry for all StackScore documentation. It defines authority tiers, version lanes (v1 implementation vs v2 strategic target), and the governance hierarchy for future development.

**Operational guides** (`MVP_PRD.md`, `PROJECT_STATUS.md`, `DEVELOPMENT_GUIDE.md`) are excluded from the governance hierarchy — they describe scope and implementation status, not long-term architecture.

---

# Authority Hierarchy

```text
DOC-129 (Engineering Constitution — governs all development)
    │
DOC-006 (Product Constitution — governs product principles)
    │
DOC-000 (this index)
    │
    ├── Business Governance (DOC-001 – DOC-005, DOC-006)
    ├── Commercial Domain (DOC-100 – DOC-102, DOC-103 – DOC-107)
    ├── Client Hub (DOC-108, DOC-113)
    ├── Technology Maturity Framework (DOC-150 — authoritative pillar model)
    ├── Assessment Domain (DOC-109, DOC-110, DOC-111, DOC-112, DOC-114, DOC-114A–G)
    ├── v1 Legacy Appendices (DOC-111A, DOC-111B, DOC-115, DOC-117) — active until Phase 5
    ├── Domain Architecture (DOC-120 – DOC-124)
    ├── Architecture Diagrams (DOC-130)
    ├── Reporting Architecture (DOC-125 – DOC-126)
    ├── Experience Architecture (DOC-007, DOC-127)
    ├── Portfolio & Operations (DOC-160, DOC-161, DOC-162, DOC-163)
    ├── Integration Architecture (DOC-128)
    └── Technical Layer (DOC-300 – DOC-303)
```

If documents conflict, resolve in this order:

1. [DOC-129 – AI Development Rules & Engineering Constitution](DOC-129%20%E2%80%93%20AI%20Development%20Rules%20&%20Engineering%20Constitution.md) — engineering and implementation discipline
2. [DOC-006 – StackScore Product Constitution](DOC-006%20%E2%80%93%20StackScore%20Product%20Constitution.md) — product principles, UX, and feature acceptance
3. DOC-000 disposition table below
4. [DOC-118 – v1 to v2 Compatibility Reference](DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md)
5. Higher authority tier wins within the same domain
6. v2 strategic specs win long-term; v1 appendices win for **running application behavior** until Phase 5 cutover
7. **Documentation over code** — implementation must not override approved specs without a documented revision (DOC-129)

---

# Document Registry

## Engineering constitution

| ID | Title | Authority | Version lane | Status |
| -- | ----- | --------- | ------------ | ------ |
| [DOC-129](DOC-129%20%E2%80%93%20AI%20Development%20Rules%20&%20Engineering%20Constitution.md) | AI Development Rules & Engineering Constitution | **Governing (constitution)** | v2 | Draft |

### DOC-129 – AI Development Rules & Engineering Constitution

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-129 |
| **Title** | AI Development Rules & Engineering Constitution |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Mandatory engineering rules for all contributors and AI assistants; documentation-driven development and source of truth hierarchy. |
| **Depends on** | DOC-000 |
| **Used by** | All development activity; DOC-300, DOC-302; AI-assisted and human contributors |

## Product constitution

| ID | Title | Authority | Version lane | Status |
| -- | ----- | --------- | ------------ | ------ |
| [DOC-006](DOC-006%20%E2%80%93%20StackScore%20Product%20Constitution.md) | StackScore Product Constitution | **Governing (constitution)** | v2 | Draft |

### DOC-006 – StackScore Product Constitution

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-006 |
| **Title** | StackScore Product Constitution |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Permanent product principles governing every feature, workflow, screen, report, and enhancement; takes precedence over lower-level specs for product and UX decisions. |
| **Depends on** | DOC-001, DOC-002, DOC-003 |
| **Used by** | DOC-004, DOC-005, DOC-108, DOC-113, DOC-120, DOC-123, DOC-127, DOC-150; all product and feature design |

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

## Client hub

| ID | Title | Authority | Version lane | Status |
| -- | ----- | --------- | ------------ | ------ |
| [DOC-108](DOC-108%20%E2%80%93%20Business%20Profile%20Specification.md) | Business Profile Specification | Governing | v2 | Draft |
| DOC-113 | Technology Profile Specification | Governing | v2 | Draft |

## Technology Maturity Framework

| ID | Title | Authority | Version lane | Status |
| -- | ----- | --------- | ------------ | ------ |
| [DOC-150](DOC-150%20%E2%80%93%20StackScore%20Technology%20Maturity%20Framework.md) | StackScore Technology Maturity Framework | **Governing (framework)** | v2 | Draft |

### DOC-150 – StackScore Technology Maturity Framework

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-150 |
| **Title** | StackScore Technology Maturity Framework |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Authoritative framework for how StackScore evaluates technology environments — eight Technology Pillars, business questions, focus areas, assessment philosophy, scoring principles, and product design implications. |
| **Depends on** | DOC-001, DOC-002, DOC-004 |
| **Used by** | DOC-109, DOC-110, DOC-111, DOC-112, DOC-113, DOC-114, DOC-118, DOC-120, DOC-123, DOC-125, DOC-127, assessment libraries, reports, and planning features |

## Assessment & scoring

| ID | Title | Authority | Version lane | Status |
| -- | ----- | --------- | ------------ | ------ |
| [DOC-109](DOC-109%20%E2%80%93%20Assessment%20Design%20Specification.md) | Assessment Design Specification | Governing | v2 | Draft |
| DOC-110 | StackScore Assessment Framework | Governing | v2 (weights pending revision) | Informal — pillar model superseded by DOC-150 |
| DOC-111 | Scoring Engine Specification | **Governing (v2 target)** | v2 | Draft |
| DOC-111A | Scoring Engine — Appendix A (v1 Implementation) | Appendix — **active for app** | v1 | Deprecated at Phase 5 |
| DOC-111B | Scoring Methodology — Appendix B (Business Context) | Appendix — reference only | v1 | Partially superseded |
| DOC-112 | Recommendation Engine Specification | Governing | v2 + v1 appendix | Draft |
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

### DOC-109 – Assessment Design Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-109 |
| **Title** | Assessment Design Specification |
| **Version** | 2.0 |
| **Status** | Draft |
| **Purpose** | Defines the consultant experience of conducting a Technology Maturity Assessment — workflow, response types, UX principles, and consultant guidance. Does not define scoring or question content. |
| **Depends on** | DOC-006, DOC-108, DOC-150 |
| **Used by** | DOC-123, DOC-127, assessment capture UX, consultant training |

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

## Architecture diagrams

Canonical Mermaid diagrams explaining lifecycle, domain, services, data flow, and role access.

| ID | Title | Version | Authority | Version lane | Status |
| -- | ----- | ------- | --------- | ------------ | ------ |
| [DOC-130](DOC-130%20%E2%80%93%20Architecture%20Diagrams%20Specification.md) | Architecture Diagrams Specification | 1.0 | Governing (visual) | v2 | Draft |

### DOC-130 – Architecture Diagrams Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-130 |
| **Title** | Architecture Diagrams Specification |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Defines standard Mermaid architecture diagrams for lifecycle, domain model, Technology Profile relationships, service layer, data flow, and role access. |
| **Depends on** | DOC-108, DOC-113, DOC-120, DOC-121, DOC-123, DOC-124, DOC-129 |
| **Used by** | DOC-000, onboarding, architecture reviews, DOC-300 |

## Reporting architecture

Cross-cutting reporting engine standards governing report types, audiences, data sources, versioning, and export rules across client-facing and internal deliverables.

| ID | Title | Version | Authority | Version lane | Status |
| -- | ----- | ------- | --------- | ------------ | ------ |
| [DOC-125](DOC-125%20%E2%80%93%20Reporting%20Engine%20Specification.md) | Reporting Engine Specification | 1.0 | Governing (reporting) | v2 | Draft |
| [DOC-126](DOC-126%20%E2%80%93%20PDF%20Generation%20Specification.md) | PDF Generation Specification | 1.1 | Governing (document generation) | v2 | Draft |

### DOC-125 – Reporting Engine Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-125 |
| **Title** | Reporting Engine Specification |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Defines StackScore reporting architecture, report types, data sources, audience rules, lifecycle, and business reporting standards. |
| **Depends on** | DOC-005, DOC-103, DOC-104, DOC-107, DOC-113, DOC-120, DOC-122, DOC-124 |
| **Used by** | DOC-124 (Reporting Service), DOC-005, DOC-302, DOC-126 |

### DOC-126 – PDF Generation Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-126 |
| **Title** | PDF Generation Specification |
| **Version** | 1.1 |
| **Status** | Draft |
| **Purpose** | Defines PDF architecture, branding, formatting, and generation rules for all StackScore document exports. |
| **Depends on** | DOC-005, DOC-103, DOC-104, DOC-107, DOC-122, DOC-125 |
| **Used by** | DOC-124 (Document Service), DOC-005 |

## Experience architecture

Application experience standards for role-based dashboards and read-only analytics.

| ID | Title | Version | Authority | Version lane | Status |
| -- | ----- | ------- | --------- | ------------ | ------ |
| [DOC-127](DOC-127%20%E2%80%93%20Dashboard%20Specification.md) | Dashboard Specification | 1.0 | Governing (experience) | v2 | Draft |

### DOC-127 – Dashboard Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-127 |
| **Title** | Dashboard Specification |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Defines dashboard architecture, layouts, widgets, KPIs, and read-only portfolio analytics. |
| **Depends on** | DOC-005, DOC-113, DOC-122, DOC-123, DOC-124 |
| **Used by** | DOC-005, DOC-124 (Dashboard Service), DOC-300 |

## Portfolio & Operations

Consultant operational surfaces — portfolio prioritization, client workspace, decision ranking, and immediate focus intelligence.

| ID | Title | Version | Authority | Version lane | Status |
| -- | ----- | ------- | --------- | ------------ | ------ |
| [DOC-160](DOC-160%20%E2%80%93%20Portfolio%20Module%20Specification.md) | Portfolio Module Specification | 1.0 | Governing (experience) | v2 | Draft |
| [DOC-161](DOC-161%20%E2%80%93%20Client%20Workspace%20Specification.md) | Client Workspace Specification | 1.0 | Governing (experience) | v2 | Approved |
| [DOC-162](DOC-162%20%E2%80%93%20Portfolio%20Decision%20Engine.md) | Portfolio Decision Engine | 1.0 | Governing (operations) | v2 | Approved |
| [DOC-163](DOC-163%20%E2%80%93%20Immediate%20Focus%20Engine.md) | Immediate Focus Engine | 1.0 | Governing (operations) | v2 | Approved |

### DOC-160 – Portfolio Module Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-160 |
| **Title** | Portfolio Module Specification |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Defines the Portfolio module as the default consultant landing page — compact client cards, readiness states, sort modes, and navigation to Client Workspace Immediate Focus. |
| **Depends on** | DOC-006, DOC-007, DOC-113, DOC-119, DOC-122, DOC-127, DOC-150, DOC-152 |
| **Used by** | DOC-123, DOC-124 (Portfolio Service), DOC-127, DOC-161, DOC-162, DOC-163, DOC-300 |

### DOC-161 – Client Workspace Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-161 |
| **Title** | Client Workspace Specification |
| **Version** | 1.0 |
| **Status** | Approved |
| **Purpose** | Defines the Client Workspace as the operational center for a single client — compact header, KPI dashboard, Immediate Focus, assessment entry, and navigation hierarchy. |
| **Depends on** | DOC-006, DOC-007, DOC-109, DOC-113, DOC-119, DOC-160, DOC-163 |
| **Used by** | DOC-123, DOC-124, DOC-162, DOC-163, DOC-300 |

### DOC-162 – Portfolio Decision Engine

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-162 |
| **Title** | Portfolio Decision Engine |
| **Version** | 1.0 |
| **Status** | Approved |
| **Purpose** | Defines how StackScore determines portfolio priority — readiness evaluation, card field semantics, sort modes, and recommended ranking philosophy. |
| **Depends on** | DOC-006, DOC-007, DOC-113, DOC-119, DOC-150, DOC-152, DOC-160, DOC-163 |
| **Used by** | DOC-124 (Portfolio Service), DOC-160, DOC-161, DOC-300 |

### DOC-163 – Immediate Focus Engine

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-163 |
| **Title** | Immediate Focus Engine |
| **Version** | 1.0 |
| **Status** | Approved |
| **Purpose** | Defines how StackScore determines and presents immediate focus — ranked work items, focus counts, selection rules, and navigation for Portfolio and Client Workspace. |
| **Depends on** | DOC-006, DOC-007, DOC-113, DOC-119, DOC-150, DOC-152, DOC-160, DOC-161 |
| **Used by** | DOC-124, DOC-160, DOC-161, DOC-162, DOC-300 |

## Integration architecture

External platform connectivity standards — vendor-neutral connectors, sync rules, and security boundaries.

| ID | Title | Version | Authority | Version lane | Status |
| -- | ----- | ------- | --------- | ------------ | ------ |
| [DOC-128](DOC-128%20%E2%80%93%20Integration%20Specification.md) | Integration Specification | 1.0 | Governing (integration) | v2 | Draft |

### DOC-128 – Integration Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-128 |
| **Title** | Integration Specification |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Defines external integration architecture, connector model, vendor catalog, sync rules, and security for third-party platforms. |
| **Depends on** | DOC-120, DOC-122, DOC-123, DOC-124 |
| **Used by** | DOC-124 (Integration Service), DOC-302, DOC-303, DOC-127 |

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
* [DOC-125 – Reporting Engine Specification](DOC-125%20%E2%80%93%20Reporting%20Engine%20Specification.md)
* [DOC-126 – PDF Generation Specification](DOC-126%20%E2%80%93%20PDF%20Generation%20Specification.md)
* [DOC-127 – Dashboard Specification](DOC-127%20%E2%80%93%20Dashboard%20Specification.md)
* [DOC-160 – Portfolio Module Specification](DOC-160%20%E2%80%93%20Portfolio%20Module%20Specification.md)
* [DOC-161 – Client Workspace Specification](DOC-161%20%E2%80%93%20Client%20Workspace%20Specification.md)
* [DOC-162 – Portfolio Decision Engine](DOC-162%20%E2%80%93%20Portfolio%20Decision%20Engine.md)
* [DOC-163 – Immediate Focus Engine](DOC-163%20%E2%80%93%20Immediate%20Focus%20Engine.md)
* [DOC-128 – Integration Specification](DOC-128%20%E2%80%93%20Integration%20Specification.md)
* [DOC-108 – Business Profile Specification](DOC-108%20%E2%80%93%20Business%20Profile%20Specification.md)
* [DOC-129 – AI Development Rules & Engineering Constitution](DOC-129%20%E2%80%93%20AI%20Development%20Rules%20&%20Engineering%20Constitution.md)
* [DOC-130 – Architecture Diagrams Specification](DOC-130%20%E2%80%93%20Architecture%20Diagrams%20Specification.md)
* [DOC-150 – StackScore Technology Maturity Framework](DOC-150%20%E2%80%93%20StackScore%20Technology%20Maturity%20Framework.md)
* [DOC-006 – StackScore Product Constitution](DOC-006%20%E2%80%93%20StackScore%20Product%20Constitution.md)
* [DOC-109 – Assessment Design Specification](DOC-109%20%E2%80%93%20Assessment%20Design%20Specification.md)

---

# Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-06-25 | BobKat IT | Stage A — initial documentation registry |
| 1.1 | 2026-06-25 | BobKat IT | Registered DOC-107, DOC-120 (Domain Architecture tier), and dependency metadata |
| 1.2 | 2026-06-25 | BobKat IT | Registered DOC-121 (database architecture) and DOC-123 (workflow); DOC-301 v2 target note |
| 1.3 | 2026-06-25 | BobKat IT | Registered DOC-122 (roles & permissions); DOC-303 v2 target note |
| 1.4 | 2026-06-25 | BobKat IT | Registered DOC-124 (service layer); Domain Architecture tier DOC-120–124 complete |
| 1.5 | 2026-06-25 | BobKat IT | Registered DOC-125 (Reporting Architecture tier) |
| 1.6 | 2026-06-25 | BobKat IT | Registered DOC-126 (PDF / document generation architecture) |
| 1.7 | 2026-06-25 | BobKat IT | Registered DOC-127 (Experience Architecture — dashboard specification) |
| 1.8 | 2026-06-25 | BobKat IT | Registered DOC-128 (Integration Architecture tier) |
| 1.9 | 2026-06-25 | BobKat IT | Registered DOC-129 (Engineering Constitution); conflict resolution and hierarchy updated |
| 2.0 | 2026-06-26 | BobKat IT | Registered DOC-108 (Client hub) and DOC-130 (Architecture Diagrams) |
| 2.1 | 2026-06-23 | BobKat IT | Registered DOC-150 (Technology Maturity Framework) as authoritative pillar model; updated hierarchy and DOC-110 disposition |
| 2.2 | 2026-06-30 | BobKat IT | Registered DOC-006 (Product Constitution); updated conflict resolution hierarchy |
| 2.3 | 2026-06-30 | BobKat IT | Registered DOC-109 (Assessment Design Specification v2.0); updated DOC-150 cross-references |
| 2.4 | 2026-06-30 | BobKat IT | Registered DOC-160 (Portfolio Module Specification v1.0); updated Experience Architecture tier |
| 2.5 | 2026-06-30 | BobKat IT | Added Portfolio & Operations tier; registered DOC-161 (Client Workspace), DOC-162 (Portfolio Decision Engine), and DOC-163 (Immediate Focus Engine) |
