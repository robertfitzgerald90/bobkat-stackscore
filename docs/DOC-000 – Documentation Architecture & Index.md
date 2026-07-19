# DOC-000 – Documentation Architecture & Index

**Document ID:** DOC-000
**Version:** 2.9
**Status:** Approved
**Owner:** BobKat IT
**Last Updated:** July 9, 2026

---

# Purpose

This document is the master registry for all StackScore documentation. It defines authority tiers, version lanes (v1 implementation vs v2 strategic target), and the governance hierarchy for future development.

**Operational guides** in [`50-Development/`](50-Development/) (`MVP_PRD.md`, `PROJECT_STATUS.md`, `DEVELOPMENT_GUIDE.md`) are excluded from the governance hierarchy — they describe scope and implementation status, not long-term architecture.

All new governing specifications must be placed in the folder that matches their DOC series (see **Folder structure** below). [DOC-000](DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md) remains the master index; [`README.md`](README.md) provides a navigational overview.

---

# Folder structure

StackScore documentation is organized by concern. Paths are relative to `docs/`.

| Folder | DOC series | Purpose |
| ------ | ---------- | ------- |
| [`00-Governance/`](00-Governance/) | DOC-001 – DOC-007 | Product vision, philosophy, BTIL, design principles, constitutions |
| [`10-Product/`](10-Product/) | DOC-100 – DOC-109 | Commercial domain, deliverables, assessment design |
| [`20-Business-Logic/`](20-Business-Logic/) | DOC-110 – DOC-119, DOC-131 – DOC-135, DOC-150 – DOC-153, DOC-151A–H | Scoring, assessment libraries, maturity framework, intelligence engines |
| [`30-Architecture/`](30-Architecture/) | DOC-120 – DOC-130, DOC-300 – DOC-303, DOC-310 | Domain model, schema, workflow, services, reporting, technical layer, commercial platform |
| [`40-Modules/`](40-Modules/) | DOC-160 – DOC-163, DOC-180, DOC-200 – DOC-206 | Portfolio, client workspace, lifecycle architecture |
| [`50-Development/`](50-Development/) | DEV-001, DEV-002 | Engineering standards, migration plan, operational guides (non-governing) |
| [`60-Operations/`](60-Operations/) | DOC-021 | Deployment strategy, changelogs, runbooks |
| [`70-Data/`](70-Data/) | — | Machine-readable documentation mirrors |
| [`90-Archive/`](90-Archive/) | — | Retired notes (not authoritative) |
| `docs/` (root) | DOC-000 | Master index and legacy redirect stubs (`Superceded-*.md`) |

**Linking rule:** Cross-references must use paths relative to the source file (e.g. from `10-Product/` to DOC-113: `../20-Business-Logic/DOC-113 – Technology Profile Specification.md`).

---

# Authority Hierarchy

```text
DOC-129 (Engineering Constitution — governs all development)
    │
DOC-006 (Product Constitution — governs product principles)
DOC-007 (UX Constitution — governs experience principles)
    │
DOC-000 (this index)
    │
    ├── Business Governance (DOC-001 – DOC-005)
    ├── Commercial Domain (DOC-100 – DOC-102, DOC-103 – DOC-107)
    ├── Client Hub (DOC-108, DOC-113)
    ├── Technology Maturity Framework (DOC-150 — authoritative pillar model)
    ├── Assessment Domain (DOC-109 – DOC-112, DOC-114, DOC-114A–G, DOC-119)
    ├── Assessment Libraries v2 (DOC-151A–H)
    ├── Decision Intelligence (DOC-152, DOC-153)
    ├── StackScore Intelligence Engines (DOC-131 – DOC-135)
    ├── v1 Legacy Appendices (DOC-111A, DOC-111B, DOC-115, DOC-117) — active until Phase 5
    ├── Domain Architecture (DOC-120, DOC-120A, DOC-121 – DOC-124)
    ├── Architecture Diagrams (DOC-130)
    ├── Reporting Architecture (DOC-125 – DOC-126)
    ├── Experience Architecture (DOC-007, DOC-127)
    ├── Portfolio & Operations (DOC-160 – DOC-163) — current operational experience
    ├── Client Lifecycle Architecture (DOC-200 – DOC-206) — strategic program model
    ├── Engineering & Migration (DEV-001, DEV-002)
    ├── Future Intelligence (DOC-180 — deferred)
    ├── Integration Architecture (DOC-128)
    ├── Environment & Deployment (DOC-021)
    └── Technical Layer (DOC-300 – DOC-303)
```

If documents conflict, resolve in this order:

1. [DOC-129 – AI Development Rules & Engineering Constitution](30-Architecture/DOC-129%20%E2%80%93%20AI%20Development%20Rules%20&%20Engineering%20Constitution.md) — engineering and implementation discipline
2. [DOC-006 – StackScore Product Constitution](00-Governance/DOC-006%20%E2%80%93%20StackScore%20Product%20Constitution.md) — product principles, UX, and feature acceptance
3. [DOC-007 – StackScore User Experience Constitution](00-Governance/DOC-007%20%E2%80%93%20StackScore%20User%20Experience%20Constitution.md) — experience principles
4. DOC-000 disposition table below
5. [DOC-200 – Client Lifecycle Architecture](40-Modules/DOC-200%20%E2%80%93%20Client%20Lifecycle%20Architecture.md) — long-term program model and **canonical glossary**
6. [DOC-120A – Next Generation Domain Model Addendum](30-Architecture/DOC-120A%20%E2%80%93%20Next%20Generation%20Domain%20Model%20Addendum.md) — future entity/relationship contract
7. [DEV-002 – Next Generation Migration Plan](50-Development/DEV-002%20%E2%80%93%20Next%20Generation%20Migration%20Plan.md) — **implementation sequencing** (phase order)
8. [DEV-001 – Engineering Standards](50-Development/DEV-001%20-%20Engineering%20Standards.md) — comments, refactoring, docs-as-deliverable (supplements DOC-129)
9. [DOC-118 – v1 to v2 Compatibility Reference](20-Business-Logic/DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md)
10. Higher authority tier wins within the same domain
11. **Strategic vs operational:** DOC-200–206 = product intent. DOC-120A = entities/relationships. DEV-002 = build order. DOC-160–163 = current Portfolio/Workspace until a phase replaces them. DOC-103–105 = TIP/roadmap/project generation until Phases 3–4 supersede them. DOC-120 = currently implemented domain behavior.
12. v2 strategic specs win long-term; v1 appendices win for **running application behavior** until Phase 5 cutover
13. **Documentation over code** — implementation must not override approved specs without a documented revision (DOC-129)

---

# Document Registry

## Engineering constitution

| ID | Title | Authority | Version lane | Status |
| -- | ----- | --------- | ------------ | ------ |
| [DOC-129](30-Architecture/DOC-129%20%E2%80%93%20AI%20Development%20Rules%20&%20Engineering%20Constitution.md) | AI Development Rules & Engineering Constitution | **Governing (constitution)** | v2 | Draft |

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
| [DOC-006](00-Governance/DOC-006%20%E2%80%93%20StackScore%20Product%20Constitution.md) | StackScore Product Constitution | **Governing (constitution)** | v2 | Draft |
| [DOC-007](00-Governance/DOC-007%20%E2%80%93%20StackScore%20User%20Experience%20Constitution.md) | StackScore User Experience Constitution | **Governing (constitution)** | v2 | Draft |

### DOC-006 – StackScore Product Constitution

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-006 |
| **Title** | StackScore Product Constitution |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Permanent product principles governing every feature, workflow, screen, report, and enhancement; takes precedence over lower-level specs for product and UX decisions. |
| **Depends on** | DOC-001, DOC-002, DOC-003 |
| **Used by** | DOC-004, DOC-005, DOC-007, DOC-108, DOC-113, DOC-120, DOC-123, DOC-127, DOC-150, DOC-160–163, DOC-200–206; all product and feature design |

### DOC-007 – StackScore User Experience Constitution

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-007 |
| **Title** | StackScore User Experience Constitution |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Permanent UX principles — one purpose per screen, intelligent defaults, cards before tables, Portfolio and Client Workspace philosophy. |
| **Depends on** | DOC-006 |
| **Used by** | DOC-127, DOC-160–163, DOC-200–206; all experience design |

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
| [DOC-108](10-Product/DOC-108%20%E2%80%93%20Business%20Profile%20Specification.md) | Business Profile Specification | Governing | v2 | Draft |
| DOC-113 | Technology Profile Specification | Governing | v2 | Draft |

## Technology Maturity Framework

| ID | Title | Authority | Version lane | Status |
| -- | ----- | --------- | ------------ | ------ |
| [DOC-150](20-Business-Logic/DOC-150%20%E2%80%93%20StackScore%20Technology%20Maturity%20Framework.md) | StackScore Technology Maturity Framework | **Governing (framework)** | v2 | Draft |

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
| [DOC-109](10-Product/DOC-109%20%E2%80%93%20Assessment%20Design%20Specification.md) | Assessment Design Specification | Governing | v2 | Draft |
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
| [DOC-119](20-Business-Logic/DOC-119%20-%20Technology%20Maturity%20Scoring%20Engine.md) | Technology Maturity Scoring Engine | Governing (scoring) | v2 | Draft |

## Assessment libraries (v2 pillars)

Pillar-specific assessment content aligned to DOC-150 Technology Pillars.

| ID | Title | Authority | Version lane | Status |
| -- | ----- | --------- | ------------ | ------ |
| [DOC-151A](20-Business-Logic/DOC-151A%20-%20Identity%20&%20Access.md) | Identity & Access | Governing (library) | v2 | Draft |
| [DOC-151B](20-Business-Logic/DOC-151B%20-%20Endpoint%20Management.md) | Endpoint Management | Governing (library) | v2 | Draft |
| [DOC-151C](20-Business-Logic/DOC-151C%20-%20Network%20&%20Connectivity.md) | Network & Connectivity | Governing (library) | v2 | Draft |
| [DOC-151D](20-Business-Logic/DOC-151D%20-%20Data%20Protection%20&%20Recovery.md) | Data Protection & Recovery | Governing (library) | v2 | Draft |
| [DOC-151E](20-Business-Logic/DOC-151E%20-%20Productivity%20&%20Collaboration.md) | Productivity & Collaboration | Governing (library) | v2 | Draft |
| [DOC-151F](20-Business-Logic/DOC-151F%20-%20Security%20Operations.md) | Security Operations | Governing (library) | v2 | Draft |
| [DOC-151G](20-Business-Logic/DOC-151G%20-%20Documentation%20&%20Knowledge.md) | Documentation & Knowledge | Governing (library) | v2 | Draft |
| [DOC-151H](20-Business-Logic/DOC-151H%20-%20Technology%20Strategy.md) | Technology Strategy | Governing (library) | v2 | Draft |

## Decision intelligence

| ID | Title | Authority | Version lane | Status |
| -- | ----- | --------- | ------------ | ------ |
| [DOC-152](20-Business-Logic/DOC-152%20-%20Decision%20Intelligence%20Engine%20Version.md) | Decision Intelligence Engine | Governing (intelligence) | v2 | Draft |
| [DOC-153](20-Business-Logic/DOC-153%20-%20Recommendation%20Library%20Version.md) | Recommendation Library | Governing (catalog) | v2 | Draft |

## StackScore intelligence engines

Cross-cutting engines that extend assessment and recommendation behavior into continuous improvement, roadmap execution, analytics, and executive intelligence.

| ID | Title | Authority | Version lane | Status |
| -- | ----- | --------- | ------------ | ------ |
| [DOC-131](20-Business-Logic/DOC-131%20%E2%80%93%20Technology%20Maturity%20Engine%20Specification.md) | Technology Maturity Engine | Governing (engine) | v2 | Draft |
| [DOC-132](20-Business-Logic/DOC-132%20%E2%80%93%20Recommendation%20Lifecycle%20Engine%20Specification.md) | Recommendation Lifecycle Engine | Governing (engine) | v2 | Draft |
| [DOC-133](20-Business-Logic/DOC-133%20%E2%80%93%20Roadmap%20&%20Project%20Synchronization%20Specification.md) | Roadmap & Project Synchronization | Governing (engine) | v2 | Draft |
| [DOC-134](20-Business-Logic/DOC-134%20%E2%80%93%20Historical%20Analytics%20&%20Trend%20Engine%20Specification.md) | Historical Analytics & Trend Engine | Governing (engine) | v2 | Draft |
| [DOC-135](20-Business-Logic/DOC-135%20%E2%80%93%20Technology%20Intelligence%20Engine%20Specification.md) | Technology Intelligence Engine | Governing (engine) | v2 | Draft |

### DOC-131 – Technology Maturity Engine Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-131 |
| **Title** | Technology Maturity Engine Specification |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Core intelligence layer governing how maturity is measured, projected, tracked, and improved over time. |
| **Depends on** | DOC-111, DOC-119, DOC-150 |
| **Used by** | DOC-132, DOC-133, DOC-134, DOC-135, DOC-113, DOC-125 |

### DOC-132 – Recommendation Lifecycle Engine Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-132 |
| **Title** | Recommendation Lifecycle Engine Specification |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Governs recommendation lifecycle from planning through completion and maturity impact. |
| **Depends on** | DOC-112, DOC-131, DOC-152 |
| **Used by** | DOC-133, DOC-163, DOC-124 |

### DOC-133 – Roadmap & Project Synchronization Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-133 |
| **Title** | Roadmap & Project Synchronization Specification |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Connects recommendations to roadmap phases and project execution with maturity feedback. |
| **Depends on** | DOC-104, DOC-105, DOC-131, DOC-132, DOC-204 |
| **Used by** | DOC-201, DOC-204, DOC-206, DEV-002 |

### DOC-134 – Historical Analytics & Trend Engine Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-134 |
| **Title** | Historical Analytics & Trend Engine Specification |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Captures and visualizes technology maturity evolution over time. |
| **Depends on** | DOC-113, DOC-131, DOC-119 |
| **Used by** | DOC-127, DOC-206, DOC-180 |

### DOC-135 – Technology Intelligence Engine Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-135 |
| **Title** | Technology Intelligence Engine Specification |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Strategic decision layer — insights, investment prioritization, and executive guidance. |
| **Depends on** | DOC-131, DOC-132, DOC-134, DOC-152 |
| **Used by** | DOC-162, DOC-163, DOC-180 |

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
| [DOC-120](30-Architecture/DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md) | Domain Model Specification | 1.0 | Governing (domain) | v2 | Draft |
| [DOC-120A](30-Architecture/DOC-120A%20%E2%80%93%20Next%20Generation%20Domain%20Model%20Addendum.md) | Next Generation Domain Model Addendum | 1.0 | Governing (domain — strategic) | v2 strategic | Draft |
| [DOC-121](30-Architecture/DOC-121%20%E2%80%93%20Database%20Schema%20Specification.md) | Database Schema Specification | 1.0 | Governing (database) | v2 | Draft |
| [DOC-122](30-Architecture/DOC-122%20%E2%80%93%20Roles%20&%20Permissions%20Specification.md) | Roles & Permissions Specification | 1.0 | Governing (security) | v2 | Draft |
| [DOC-123](30-Architecture/DOC-123%20%E2%80%93%20Application%20Workflow%20Specification.md) | Application Workflow Specification | 1.0 | Governing (workflow) | v2 | Draft |
| [DOC-124](30-Architecture/DOC-124%20%E2%80%93%20Service%20Layer%20Specification.md) | Service Layer Specification | 1.0 | Governing (services) | v2 | Draft |

### DOC-120 – Domain Model Specification

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-120 |
| **Title** | Domain Model Specification |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Defines StackScore core business objects, ownership model, relationships, lifecycle rules, and domain boundaries. |
| **Depends on** | DOC-001, DOC-003, DOC-100–107, DOC-110–114, DOC-118 |
| **Used by** | DOC-120A, DOC-121, DOC-122, DOC-123, DOC-124, DOC-301 |

### DOC-120A – Next Generation Domain Model Addendum

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-120A |
| **Title** | Next Generation Domain Model Addendum |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Defines future domain entities and relationships for the 200-series Technology Program Management architecture — TechnologyProgram, Roadmap, ProjectRecommendation, JourneyMilestone, PlanningWorkshop, EBR, and supporting objects — before schema or application changes. |
| **Depends on** | DOC-120, DOC-200–206, DOC-103–105 |
| **Used by** | DOC-121, DOC-301 (when implementation phases begin), DOC-123, DOC-124, DOC-300 |
| **Authority** | Governs future program-management structure; DOC-120 remains authoritative for currently implemented behavior until each migration phase ships. Phase order must match DEV-002. |

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

Domain architecture tier (DOC-120 – DOC-124) is fully specified at Draft v1.0. DOC-120A extends DOC-120 for the next-generation Client Lifecycle domain model.

## Architecture diagrams

Canonical Mermaid diagrams explaining lifecycle, domain, services, data flow, and role access.

| ID | Title | Version | Authority | Version lane | Status |
| -- | ----- | ------- | --------- | ------------ | ------ |
| [DOC-130](30-Architecture/DOC-130%20%E2%80%93%20Architecture%20Diagrams%20Specification.md) | Architecture Diagrams Specification | 1.0 | Governing (visual) | v2 | Draft |

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
| [DOC-125](30-Architecture/DOC-125%20%E2%80%93%20Reporting%20Engine%20Specification.md) | Reporting Engine Specification | 1.0 | Governing (reporting) | v2 | Draft |
| [DOC-126](30-Architecture/DOC-126%20%E2%80%93%20PDF%20Generation%20Specification.md) | PDF Generation Specification | 1.1 | Governing (document generation) | v2 | Draft |

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
| [DOC-127](30-Architecture/DOC-127%20%E2%80%93%20Dashboard%20Specification.md) | Dashboard Specification | 1.0 | Governing (experience) | v2 | Draft |

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
| [DOC-160](40-Modules/DOC-160%20%E2%80%93%20Portfolio%20Module%20Specification.md) | Portfolio Module Specification | 1.0 | Governing (experience) | v2 | Draft |
| [DOC-161](40-Modules/DOC-161%20%E2%80%93%20Client%20Workspace%20Specification.md) | Client Workspace Specification | 1.0 | Governing (experience) | v2 | Approved |
| [DOC-162](40-Modules/DOC-162%20%E2%80%93%20Portfolio%20Decision%20Engine.md) | Portfolio Decision Engine | 1.0 | Governing (operations) | v2 | Approved |
| [DOC-163](40-Modules/DOC-163%20%E2%80%93%20Immediate%20Focus%20Engine.md) | Immediate Focus Engine | 1.0 | Governing (operations) | v2 | Approved |

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

## Client Lifecycle Architecture

Strategic program-management model. StackScore is a **Technology Program Management Platform** — not an assessment-only product. DOC-200–206 define the long-term consulting lifecycle; DOC-160–163 remain authoritative for current Portfolio and Client Workspace operational experience until lifecycle modules ship.

| ID | Title | Version | Authority | Version lane | Status |
| -- | ----- | ------- | --------- | ------------ | ------ |
| [DOC-200](40-Modules/DOC-200%20%E2%80%93%20Client%20Lifecycle%20Architecture.md) | Client Lifecycle Architecture | 1.0 | **Governing (lifecycle)** | v2 strategic | Draft |
| [DOC-201](40-Modules/DOC-201%20%E2%80%93%20Client%20Workspace%20Framework.md) | Client Workspace Framework | 1.0 | Governing (lifecycle experience) | v2 strategic | Draft |
| [DOC-202](40-Modules/DOC-202%20%E2%80%93%20Technology%20Journey%20Framework.md) | Technology Journey Framework | 1.0 | Governing (lifecycle) | v2 strategic | Draft |
| [DOC-203](40-Modules/DOC-203%20-%20Project%20Definition%20Framework.md) | Project Definition Framework | 1.0 | Governing (lifecycle) | v2 strategic | Draft |
| [DOC-204](40-Modules/DOC-204%20%E2%80%93%20Technology%20Investment%20Roadmap%20Framework.md) | Technology Investment Roadmap Framework | 1.0 | Governing (lifecycle) | v2 strategic | Draft |
| [DOC-205](40-Modules/DOC-205%20%E2%80%93%20Planning%20Workshop%20&%20Strategic%20Prioritization%20Engine.md) | Planning Workshop & Strategic Prioritization Engine | 1.0 | Governing (lifecycle) | v2 strategic | Draft |
| [DOC-206](40-Modules/DOC-206%20%E2%80%93%20Executive%20Business%20Review%20Framework.md) | Executive Business Review Framework | 1.0 | Governing (lifecycle) | v2 strategic | Draft |

### DOC-200 – Client Lifecycle Architecture

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-200 |
| **Title** | Client Lifecycle Architecture |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Defines the end-to-end client consulting lifecycle — Prospect through Continuous Improvement — primary objects, and the **canonical glossary** for program-management vocabulary. |
| **Depends on** | DOC-006, DOC-007 |
| **Used by** | DOC-201–206, DOC-120A, DEV-002, DOC-123, DOC-124, DOC-300 |

### DOC-201 – Client Workspace Framework

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-201 |
| **Title** | Client Workspace Framework |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Strategic Client Workspace as Technology Program headquarters — Overview, Journey, Roadmap, Projects, Assessments, Recommendations, Assets, Documents, Contacts, Billing, Executive Reports, Risks, Activity. |
| **Depends on** | DOC-200, DOC-006, DOC-007 |
| **Used by** | DOC-161 (operational subset), DOC-202–206, DOC-300 |
| **Relationship to DOC-161** | DOC-161 governs the current operational Client Workspace (Immediate Focus, KPIs, Assess Client). DOC-201 is the long-term navigation and module framework. |

### DOC-202 – Technology Journey Framework

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-202 |
| **Title** | Technology Journey Framework |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Living historical record of organizational technology evolution — milestones, business outcomes, investment story. |
| **Depends on** | DOC-200, DOC-201 |
| **Used by** | DOC-203, DOC-206, DOC-125 |

### DOC-203 – Project Definition Framework

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-203 |
| **Title** | Project Definition Framework |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Projects as primary units of value delivery — one Project may contain many Recommendations; executive overview, planning, scope, financials, success metrics, reporting. |
| **Depends on** | DOC-200, DOC-204 |
| **Used by** | DOC-105 (until superseded), DOC-201, DOC-204, DOC-206 |
| **Relationship to DOC-105** | DOC-105 governs current project generation (1:1 recommendation). DOC-203 is the strategic multi-recommendation project model. |

### DOC-204 – Technology Investment Roadmap Framework

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-204 |
| **Title** | Technology Investment Roadmap Framework |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Multi-phase investment roadmap organizing **Projects** (not recommendations) into strategic phases. |
| **Depends on** | DOC-200, DOC-203, DOC-205 |
| **Used by** | DOC-104 (until superseded), DOC-201, DOC-206 |
| **Relationship to DOC-104** | DOC-104 governs current TIP-oriented roadmap. DOC-204 is the strategic project-phased investment roadmap. |

### DOC-205 – Planning Workshop & Strategic Prioritization Engine

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-205 |
| **Title** | Planning Workshop & Strategic Prioritization Engine |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Transforms assessment findings into a Technology Program — business discovery, prioritization, phased roadmap creation. |
| **Depends on** | DOC-200, DOC-203, DOC-204 |
| **Used by** | DOC-103 (until superseded), DOC-201 |
| **Relationship to DOC-103** | DOC-103 governs current TIP workflow. DOC-205 is the strategic Planning Workshop that produces the Technology Program and Roadmap. |

### DOC-206 – Executive Business Review Framework

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-206 |
| **Title** | Executive Business Review Framework |
| **Version** | 1.0 |
| **Status** | Draft |
| **Purpose** | Recurring executive review of the Technology Program — progress, investment value, journey, and next priorities. |
| **Depends on** | DOC-200, DOC-202, DOC-203, DOC-204 |
| **Used by** | DOC-125, DOC-201 |
| **Relationship to QBR** | Current Quarterly Business Review is an early implementation. DOC-206 defines the strategic EBR as the primary recurring executive meeting. |

## Engineering & Migration

Implementation standards and next-generation migration sequencing. Not product specifications.

| ID | Title | Version | Authority | Version lane | Status |
| -- | ----- | ------- | --------- | ------------ | ------ |
| [DEV-001](50-Development/DEV-001%20-%20Engineering%20Standards.md) | Engineering Standards | 1.1 | Governing (engineering practice) | Operational | Active |
| [DEV-002](50-Development/DEV-002%20%E2%80%93%20Next%20Generation%20Migration%20Plan.md) | Next Generation Migration Plan | 1.1 | Governing (implementation sequencing) | Operational | Active |

### DEV-001 – Engineering Standards

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DEV-001 |
| **Title** | Engineering Standards |
| **Version** | 1.1 |
| **Status** | Active |
| **Purpose** | Intent-based comments, refactoring, and documentation-as-deliverable standards. Supplements DOC-129. |
| **Depends on** | DOC-129, DEV-002, DOC-200 |
| **Used by** | All implementation work; DEV-002 Definition of Done |

### DEV-002 – Next Generation Migration Plan

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DEV-002 |
| **Title** | Next Generation Migration Plan |
| **Version** | 1.1 |
| **Status** | Active |
| **Purpose** | Phased implementation roadmap from assessment-centric StackScore to Technology Program Management Platform. Single source of truth for build order. |
| **Depends on** | DOC-200–206, DOC-120A, DOC-160–163, DEV-001 |
| **Used by** | All next-generation implementation; DOC-120A §10 must match DEV-002 phases |

## Future intelligence (deferred)

| ID | Title | Version | Authority | Version lane | Status |
| -- | ----- | ------- | --------- | ------------ | ------ |
| [DOC-180](40-Modules/DOC-180%20-%20Benchmark%20Intelligence%20Framework.md) | Benchmark Intelligence Framework | 0.1 | Future (deferred) | Long-term | Draft — implementation deferred |

### DOC-180 – Benchmark Intelligence Framework

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-180 |
| **Title** | Benchmark Intelligence Framework |
| **Version** | 0.1 |
| **Status** | Future (Deferred) |
| **Purpose** | Long-term vision for industry benchmarks, maturity baselines, and predictive analytics from anonymized assessment data. |
| **Depends on** | DOC-150, DOC-119, DOC-152 |
| **Used by** | Future intelligence features — not in current implementation scope |

## Environment & deployment

| ID | Title | Version | Authority | Version lane | Status |
| -- | ----- | ------- | --------- | ------------ | ------ |
| [DOC-021](60-Operations/DOC-021%20%E2%80%93%20Environment%20&%20Deployment%20Strategy.md) | Environment & Deployment Strategy | 0.1 | Governing (infrastructure) | Operational | Planned |

### DOC-021 – Environment & Deployment Strategy

| Attribute | Value |
| --------- | ----- |
| **Document ID** | DOC-021 |
| **Title** | Environment & Deployment Strategy |
| **Version** | 0.1 |
| **Status** | Planned |
| **Purpose** | Development, preview, and production environment separation, database connections, and deployment risk controls. |
| **Depends on** | DOC-129, DOC-300 |
| **Used by** | Operations, CI/CD, DOC-300 |

## Integration architecture

External platform connectivity standards — vendor-neutral connectors, sync rules, and security boundaries.

| ID | Title | Version | Authority | Version lane | Status |
| -- | ----- | ------- | --------- | ------------ | ------ |
| [DOC-128](30-Architecture/DOC-128%20%E2%80%93%20Integration%20Specification.md) | Integration Specification | 1.0 | Governing (integration) | v2 | Draft |

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
| [`70-Data/RecommendationRuleCatalog.json`](70-Data/RecommendationRuleCatalog.json) | Reference mirror | Documentation copy; runtime uses `data/` |

## Operational (non-governing)

Located in [`50-Development/`](50-Development/).

| File | Purpose |
| ---- | ------- |
| [`50-Development/MVP_PRD.md`](50-Development/MVP_PRD.md) | MVP scope and user stories |
| [`50-Development/PROJECT_STATUS.md`](50-Development/PROJECT_STATUS.md) | Implementation status snapshot |
| [`50-Development/DEVELOPMENT_GUIDE.md`](50-Development/DEVELOPMENT_GUIDE.md) | Local developer setup |

## Legacy redirect stubs

Eight `Superceded-*.md` stubs at the `docs/` root redirect legacy filenames to canonical DOC specifications:

| Stub | Legacy name | Canonical target |
| ---- | ----------- | ---------------- |
| [`Superceded-Vision.md`](Superceded-Vision.md) | `Vision.md` | DOC-001 |
| [`Superceded-ScoringSpecification.md`](Superceded-ScoringSpecification.md) | `ScoringSpecification.md` | DOC-111 / DOC-111A |
| [`Superceded-ScoreCalculation.md`](Superceded-ScoreCalculation.md) | `ScoreCalculation.md` | DOC-111B |
| [`Superceded-QuestionScoringMatrix.md`](Superceded-QuestionScoringMatrix.md) | `QuestionScoringMatrix.md` | DOC-115 |
| [`Superceded-RecommendationEngine.md`](Superceded-RecommendationEngine.md) | `RecommendationEngine.md` | DOC-112 |
| [`Superceded-TechnicalArchitecture.md`](Superceded-TechnicalArchitecture.md) | `TechnicalArchitecture.md` | DOC-300 |
| [`Superceded-DatabaseSchema.md`](Superceded-DatabaseSchema.md) | `DatabaseSchema.md` | DOC-301 |
| [`Superceded-RBAC_Security_Spec.md`](Superceded-RBAC_Security_Spec.md) | `RBAC_Security_Spec.md` | DOC-303 |

See also [DOC-118 – v1 to v2 Compatibility Reference](20-Business-Logic/DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md#legacy-redirect-stubs).

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

* [DOC-118 – v1 to v2 Compatibility Reference](20-Business-Logic/DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md)
* [DOC-001 – Product Vision](00-Governance/DOC-001%20-%20Product%20Vision.md)
* [DOC-003 – BTIL](00-Governance/DOC-003%20-%20Bobkat%20Technology%20Improvement%20Lifecycle%20%28BTIL%29.md).md)
* [DOC-120 – Domain Model Specification](30-Architecture/DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md)
* [DOC-120A – Next Generation Domain Model Addendum](30-Architecture/DOC-120A%20%E2%80%93%20Next%20Generation%20Domain%20Model%20Addendum.md)
* [DEV-001 – Engineering Standards](50-Development/DEV-001%20-%20Engineering%20Standards.md)
* [DEV-002 – Next Generation Migration Plan](50-Development/DEV-002%20%E2%80%93%20Next%20Generation%20Migration%20Plan.md)
* [DOC-121 – Database Schema Specification](30-Architecture/DOC-121%20%E2%80%93%20Database%20Schema%20Specification.md)
* [DOC-122 – Roles & Permissions Specification](30-Architecture/DOC-122%20%E2%80%93%20Roles%20&%20Permissions%20Specification.md)
* [DOC-124 – Service Layer Specification](30-Architecture/DOC-124%20%E2%80%93%20Service%20Layer%20Specification.md)
* [DOC-125 – Reporting Engine Specification](30-Architecture/DOC-125%20%E2%80%93%20Reporting%20Engine%20Specification.md)
* [DOC-126 – PDF Generation Specification](30-Architecture/DOC-126%20%E2%80%93%20PDF%20Generation%20Specification.md)
* [DOC-127 – Dashboard Specification](30-Architecture/DOC-127%20%E2%80%93%20Dashboard%20Specification.md)
* [DOC-007 – StackScore User Experience Constitution](00-Governance/DOC-007%20%E2%80%93%20StackScore%20User%20Experience%20Constitution.md)
* [DOC-160 – Portfolio Module Specification](40-Modules/DOC-160%20%E2%80%93%20Portfolio%20Module%20Specification.md)
* [DOC-161 – Client Workspace Specification](40-Modules/DOC-161%20%E2%80%93%20Client%20Workspace%20Specification.md)
* [DOC-162 – Portfolio Decision Engine](40-Modules/DOC-162%20%E2%80%93%20Portfolio%20Decision%20Engine.md)
* [DOC-163 – Immediate Focus Engine](40-Modules/DOC-163%20%E2%80%93%20Immediate%20Focus%20Engine.md)
* [DOC-200 – Client Lifecycle Architecture](40-Modules/DOC-200%20%E2%80%93%20Client%20Lifecycle%20Architecture.md)
* [DOC-201 – Client Workspace Framework](40-Modules/DOC-201%20%E2%80%93%20Client%20Workspace%20Framework.md)
* [DOC-202 – Technology Journey Framework](40-Modules/DOC-202%20%E2%80%93%20Technology%20Journey%20Framework.md)
* [DOC-203 – Project Definition Framework](40-Modules/DOC-203%20-%20Project%20Definition%20Framework.md)
* [DOC-204 – Technology Investment Roadmap Framework](40-Modules/DOC-204%20%E2%80%93%20Technology%20Investment%20Roadmap%20Framework.md)
* [DOC-205 – Planning Workshop & Strategic Prioritization Engine](40-Modules/DOC-205%20%E2%80%93%20Planning%20Workshop%20&%20Strategic%20Prioritization%20Engine.md)
* [DOC-206 – Executive Business Review Framework](40-Modules/DOC-206%20%E2%80%93%20Executive%20Business%20Review%20Framework.md)
* [DOC-119 – Technology Maturity Scoring Engine](20-Business-Logic/DOC-119%20-%20Technology%20Maturity%20Scoring%20Engine.md)
* [DOC-152 – Decision Intelligence Engine](20-Business-Logic/DOC-152%20-%20Decision%20Intelligence%20Engine%20Version.md)
* [DOC-180 – Benchmark Intelligence Framework](40-Modules/DOC-180%20-%20Benchmark%20Intelligence%20Framework.md)
* [DOC-021 – Environment & Deployment Strategy](60-Operations/DOC-021%20%E2%80%93%20Environment%20&%20Deployment%20Strategy.md)
* [DOC-128 – Integration Specification](30-Architecture/DOC-128%20%E2%80%93%20Integration%20Specification.md)
* [DOC-108 – Business Profile Specification](10-Product/DOC-108%20%E2%80%93%20Business%20Profile%20Specification.md)
* [DOC-129 – AI Development Rules & Engineering Constitution](30-Architecture/DOC-129%20%E2%80%93%20AI%20Development%20Rules%20&%20Engineering%20Constitution.md)
* [DOC-130 – Architecture Diagrams Specification](30-Architecture/DOC-130%20%E2%80%93%20Architecture%20Diagrams%20Specification.md)
* [DOC-150 – StackScore Technology Maturity Framework](20-Business-Logic/DOC-150%20%E2%80%93%20StackScore%20Technology%20Maturity%20Framework.md)
* [DOC-006 – StackScore Product Constitution](00-Governance/DOC-006%20%E2%80%93%20StackScore%20Product%20Constitution.md)
* [DOC-109 – Assessment Design Specification](10-Product/DOC-109%20%E2%80%93%20Assessment%20Design%20Specification.md)

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
| 2.6 | 2026-07-04 | BobKat IT | Registered Client Lifecycle Architecture (DOC-200–206); DOC-007, DOC-119, DOC-151A–H, DOC-152, DOC-153, DOC-180, DOC-021; clarified strategic vs operational authority |
| 2.7 | 2026-07-04 | BobKat IT | Registered DOC-120A (Next Generation Domain Model Addendum) for 200-series entities and Project 1:N transition |
| 2.8 | 2026-07-04 | BobKat IT | Consistency resolution — registered DEV-001/DEV-002; authority split (intent / entities / sequencing); DOC-200 glossary |
| 2.9 | 2026-07-09 | BobKat IT | Documented folder hierarchy; registered DOC-131–135; updated paths for reorganized structure; legacy stub registry |
