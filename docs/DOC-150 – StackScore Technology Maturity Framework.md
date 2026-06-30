# DOC-150 – StackScore Technology Maturity Framework

**Document ID:** DOC-150
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 23, 2026

---

# 1. Purpose

DOC-150 defines the **StackScore Technology Maturity Framework** — the authoritative model for how StackScore evaluates technology environments.

This document establishes:

* The **eight Technology Pillars** that structure every maturity evaluation
* The **business questions** each pillar answers for executives and operational leaders
* **Focus areas** and **desired outcomes** that guide assessment design
* **Assessment philosophy** and **scoring principles** that keep evaluations rigorous yet accessible
* **Recommendation principles** that translate findings into actionable improvement
* **Product design implications** for profiles, reports, projects, and planning features

StackScore evaluates technology maturity across eight foundational **Technology Pillars**. The framework is **vendor-agnostic** and aligned with common best practices and security frameworks such as **NIST**, **CMMC**, **CIS Controls**, and **ISO 27001** — without requiring clients to understand those frameworks directly.

This document does not define database schemas, API contracts, or implementation artifacts. It governs **what** StackScore measures, **why** it matters, and **how** product experiences should communicate maturity to business audiences.

---

# 2. Framework Philosophy

StackScore exists to answer a single executive question:

> **How well does technology support the business — and what should we improve next?**

The Technology Maturity Framework translates that question into eight durable pillars of evaluation. Each pillar is expressed in **business language first**. Technical detail supports the narrative; it does not replace it.

## Core beliefs

* **Business outcomes over technical jargon** — clients should understand findings without a security certification.
* **Simplicity without sacrificing rigor** — assessments must be completable by consultants in the field and explainable to business owners.
* **Recommendations driven by measurable risk** — every finding should connect to business impact, not checklist compliance alone.
* **Vendor-agnostic guidance** — maturity is evaluated by capability and outcome, not by product brand.
* **Continuous improvement over perfection** — the goal is measurable progress, not a one-time perfect score.
* **Transparency in every recommendation** — clients deserve to know what was found, why it matters, and what happens next.
* **Prioritize work based on business impact** — urgency follows risk and value, not arbitrary ordering.
* **Measure progress over time** — maturity scoring enables trend visibility across reassessments, projects, and reports.

## Alignment with industry frameworks

The eight Technology Pillars map conceptually to controls and domains found in NIST CSF, CIS Controls, CMMC practices, and ISO 27001 annexes. StackScore **does not** require clients to adopt or reference those frameworks. Consultants may use them internally when designing questions and recommendations.

The framework is **foundational** — it outlives any single assessment library version, scoring weight revision, or UI implementation.

---

# 3. The Eight Technology Pillars

StackScore organizes technology maturity evaluation into eight Technology Pillars:

| # | Technology Pillar | One-line summary |
| - | ----------------- | ---------------- |
| 1 | **Identity & Access** | Trust that only the right people access systems and data |
| 2 | **Endpoint Management** | Secure, standardized, consistently managed company devices |
| 3 | **Network & Connectivity** | Secure, reliable connectivity that supports operations |
| 4 | **Data Protection & Recovery** | Ability to recover from data loss, ransomware, or major outage |
| 5 | **Productivity & Collaboration** | Technology that enables efficient, secure employee work |
| 6 | **Security Operations** | Ability to detect, respond to, and reduce security risks |
| 7 | **Documentation & Knowledge** | Critical IT knowledge documented and transferable |
| 8 | **Technology Strategy** | Technology that supports growth while reducing long-term risk |

Every assessment question, recommendation, project, and report element should trace to **one or more** Technology Pillars.

---

# 4. Pillar Definitions

## 4.1 Identity & Access

**Business Question**

Can we trust that only the right people have access to our systems and data?

**Focus Areas**

* User account management
* Multi-Factor Authentication
* Password policies
* Administrative account management
* Least privilege
* Joiner/mover/leaver process
* Identity provider configuration
* Remote access controls

**Desired Outcome**

Only authorized users have appropriate access to systems and data, with strong identity controls and clear access lifecycle processes.

---

## 4.2 Endpoint Management

**Business Question**

Are company devices secure, standardized, and consistently managed?

**Focus Areas**

* Asset inventory
* Device lifecycle
* Patch management
* Endpoint protection
* Disk encryption
* Configuration standards
* Remote management
* Hardware health
* Operating system support

**Desired Outcome**

Every business device is secure, supported, visible, and managed consistently.

---

## 4.3 Network & Connectivity

**Business Question**

Is the network secure, reliable, and built to support business operations?

**Focus Areas**

* Firewall configuration
* Wireless infrastructure
* VPN
* Network segmentation
* Switching
* Internet redundancy
* DNS and DHCP
* Network monitoring
* Physical infrastructure

**Desired Outcome**

The network provides secure, reliable connectivity that supports daily operations and future growth.

---

## 4.4 Data Protection & Recovery

**Business Question**

Could the business recover from data loss, ransomware, or a major outage?

**Focus Areas**

* Backup strategy
* Restore testing
* Disaster recovery
* Business continuity
* Cloud storage
* Retention policies
* Critical data identification
* Recovery objectives

**Desired Outcome**

Business-critical data is protected, recoverable, and tested against realistic failure scenarios.

---

## 4.5 Productivity & Collaboration

**Business Question**

Does technology enable employees to work efficiently and securely?

**Focus Areas**

* Microsoft 365
* Email
* Teams
* SharePoint
* OneDrive
* File organization
* Collaboration
* Mobile productivity
* Software licensing
* Workflow efficiency

**Desired Outcome**

Employees have secure, reliable tools that improve communication, collaboration, and productivity.

---

## 4.6 Security Operations

**Business Question**

Can the business detect, respond to, and reduce security risks?

**Focus Areas**

* Monitoring
* Alerting
* Vulnerability management
* Security reviews
* Incident response
* Logging
* Threat visibility
* Risk management
* Security awareness

**Desired Outcome**

The organization has visibility into security risks and can respond appropriately before issues become major incidents.

---

## 4.7 Documentation & Knowledge

**Business Question**

Could another trusted IT professional successfully support this environment tomorrow?

**Focus Areas**

* Network documentation
* Asset documentation
* Standard Operating Procedures
* Password management
* Vendor information
* Licensing records
* Configuration documentation
* Knowledge transfer

**Desired Outcome**

Critical technology knowledge is documented, organized, and accessible to authorized personnel.

---

## 4.8 Technology Strategy

**Business Question**

Is technology helping the business grow while reducing long-term risk?

**Focus Areas**

* Technology roadmap
* Budget planning
* Hardware lifecycle
* Software lifecycle
* Risk prioritization
* Business alignment
* Project planning
* Technology maturity
* Continuous improvement

**Desired Outcome**

Technology investments are intentional, business-aligned, and continuously improved over time.

---

# 5. Business Questions

Each Technology Pillar is anchored by a single business question. Together, these questions form the executive-facing narrative of a StackScore engagement.

| Technology Pillar | Business Question |
| ----------------- | ----------------- |
| Identity & Access | Can we trust that only the right people have access to our systems and data? |
| Endpoint Management | Are company devices secure, standardized, and consistently managed? |
| Network & Connectivity | Is the network secure, reliable, and built to support business operations? |
| Data Protection & Recovery | Could the business recover from data loss, ransomware, or a major outage? |
| Productivity & Collaboration | Does technology enable employees to work efficiently and securely? |
| Security Operations | Can the business detect, respond to, and reduce security risks? |
| Documentation & Knowledge | Could another trusted IT professional successfully support this environment tomorrow? |
| Technology Strategy | Is technology helping the business grow while reducing long-term risk? |

Consultants and product experiences should **lead with these questions** when presenting pillar-level results — not internal labels, weights, or framework acronyms.

---

# 6. Desired Outcomes

Desired outcomes describe the **target state** for each pillar in language a business owner can endorse.

| Technology Pillar | Desired Outcome |
| ----------------- | --------------- |
| Identity & Access | Only authorized users have appropriate access to systems and data, with strong identity controls and clear access lifecycle processes. |
| Endpoint Management | Every business device is secure, supported, visible, and managed consistently. |
| Network & Connectivity | The network provides secure, reliable connectivity that supports daily operations and future growth. |
| Data Protection & Recovery | Business-critical data is protected, recoverable, and tested against realistic failure scenarios. |
| Productivity & Collaboration | Employees have secure, reliable tools that improve communication, collaboration, and productivity. |
| Security Operations | The organization has visibility into security risks and can respond appropriately before issues become major incidents. |
| Documentation & Knowledge | Critical technology knowledge is documented, organized, and accessible to authorized personnel. |
| Technology Strategy | Technology investments are intentional, business-aligned, and continuously improved over time. |

Recommendations and projects should articulate **which desired outcome** they advance and **how** completion will be evidenced.

---

# 7. Focus Areas

Focus areas are the **operational dimensions** assessed within each pillar. They guide assessment library design (DOC-114 series), recommendation templates (DOC-112), and project scoping (DOC-105).

| Technology Pillar | Focus Areas |
| ----------------- | ----------- |
| Identity & Access | User account management; MFA; password policies; administrative accounts; least privilege; joiner/mover/leaver; identity provider; remote access |
| Endpoint Management | Asset inventory; device lifecycle; patching; endpoint protection; encryption; configuration standards; remote management; hardware health; OS support |
| Network & Connectivity | Firewall; wireless; VPN; segmentation; switching; internet redundancy; DNS/DHCP; monitoring; physical infrastructure |
| Data Protection & Recovery | Backup strategy; restore testing; DR; business continuity; cloud storage; retention; critical data; recovery objectives |
| Productivity & Collaboration | Microsoft 365; email; Teams; SharePoint; OneDrive; file organization; collaboration; mobile productivity; licensing; workflow efficiency |
| Security Operations | Monitoring; alerting; vulnerability management; security reviews; incident response; logging; threat visibility; risk management; security awareness |
| Documentation & Knowledge | Network docs; asset docs; SOPs; password management; vendor info; licensing; configuration docs; knowledge transfer |
| Technology Strategy | Roadmap; budget; hardware lifecycle; software lifecycle; risk prioritization; business alignment; project planning; maturity; continuous improvement |

Detailed pillar definitions in Section 4 remain authoritative when focus area lists evolve.

---

# 8. Assessment Philosophy

Every Technology Pillar assessment should answer four questions:

1. **Why does this matter?** — Connect the pillar to business risk, reliability, or growth.
2. **Where are we today?** — Establish current maturity with evidence, not assumptions.
3. **What are the biggest risks?** — Prioritize gaps that create meaningful exposure or operational friction.
4. **What should we do next?** — Produce actionable recommendations with clear business impact.

## Assessment design principles

* Questions are **observable** — a consultant can verify the answer through interview, documentation review, or technical validation.
* Questions are **stable** — pillar structure changes rarely; question libraries evolve within pillars.
* Questions are **audience-appropriate** — client-facing summaries never expose internal scoring formulas or playbook identifiers.
* Reassessment measures **progress** — the same pillar questions, evaluated over time, demonstrate improvement.

Assessment libraries (DOC-114), legacy question banks (DOC-117), and the Assessment Framework (DOC-110) must align to these pillars. Where legacy structures differ, DOC-118 governs migration mapping.

---

# 9. Maturity Scoring

StackScore expresses pillar and overall maturity through **StackScore** — a normalized maturity score that supports comparison over time.

## Scoring principles

* **Pillar-level scores** reflect demonstrated capability and risk exposure within each Technology Pillar.
* **Overall StackScore** aggregates pillar results into a single maturity indicator for executive communication.
* **Ratings and tiers** translate numeric scores into business-friendly maturity labels (per DOC-111).
* **Critical exposure** may elevate risk regardless of numeric balance — some gaps are unacceptable at any score.
* **Trend matters** — score movement between assessments is as important as the absolute number.
* **Transparency without leakage** — clients see results and impact; internal weighting and margin logic stay internal.

Scoring engine behavior is specified in [DOC-111 – Scoring Engine Specification](DOC-111%20%E2%80%93%20Scoring%20Engine%20Specific.md). DOC-150 defines **what** is scored; DOC-111 defines **how** scores are calculated.

Legacy v1 scoring categories (DOC-111A, DOC-115) remain active for the running application until Phase 5 cutover per [DOC-118](DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md). New assessment design should target the eight Technology Pillars defined here.

---

# 10. Recommendation Principles

Recommendations translate assessment findings into improvement actions. Every recommendation shall:

1. **Map to one or more Technology Pillars** — no orphan findings.
2. **State business impact** — what risk is reduced or capability gained.
3. **Be prioritized** — critical, high, medium, or low based on measurable risk and value.
4. **Estimate maturity impact** — expected StackScore movement where quantifiable.
5. **Suggest a service or initiative type** — without exposing internal pricing or margins to clients.
6. **Be actionable** — clear enough to become a project, roadmap item, or TIP initiative.
7. **Be transparent** — the client can understand why it was recommended.

Recommendation engine rules are governed by [DOC-112 – Recommendation Engine Specification](DOC-112%20%E2%80%93%20Recommendation%20Engine%20Specification.md). DOC-150 provides the **pillar taxonomy** those rules must respect.

---

# 11. Relationship to Technology Profile

The [Technology Profile](DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md) is the living record of client maturity. DOC-150 defines the **dimensional model** that profile scores represent.

* Pillar scores appear on the Technology Profile as **Technology Maturity Profile** views where appropriate.
* Profile trends, journey milestones, and maturity tier labels derive from pillar-level and overall StackScore.
* Business Profile context (DOC-108) informs **how** pillar gaps matter — not **whether** pillars apply.

The Technology Profile is the aggregation root for assessments, recommendations, projects, and historical snapshots. All pillar evaluations ultimately update this record.

---

# 12. Relationship to Reports

Reports communicate maturity to audiences who may never open the application. Per [DOC-125 – Reporting Engine Specification](DOC-125%20%E2%80%93%20Reporting%20Engine%20Specification.md):

* Reports explain maturity in **plain business language** using Technology Pillar names and business questions.
* Assessment, progress, completion, QBR, and TIP reports reference **pillar movement** — not internal category codes.
* Executive summaries lead with **outcomes and risks**, then pillar highlights.
* Supplemental technical detail is separated from primary client deliverables.

PDF and browser report standards (DOC-126) apply presentation rules; DOC-150 applies **content framing**.

---

# 13. Relationship to Projects and Planning

Technology improvement is executed through projects, roadmaps, and Technology Improvement Plans (DOC-103, DOC-104, DOC-105).

* Every project should declare which **Technology Pillar(s)** it strengthens.
* Expected and actual **maturity impact** is measured against pillar scores and overall StackScore.
* Roadmap phasing groups initiatives by pillar balance, risk priority, and business alignment.
* Completion reports (DOC-107) demonstrate **pillar and profile improvement** delivered through completed work.

Planning features must not invent parallel taxonomies. If a feature improves technology maturity, it strengthens one or more of the eight pillars.

---

# 14. Product Design Implications

DOC-150 guides product behavior without mandating immediate architectural change.

## Language and UX

* User-facing language shall use **Technology Pillars**, not legacy "assessment category" labels, in new experiences.
* The Technology Profile should be presented as a **Technology Maturity Profile** where appropriate.
* Dashboards, reports, and client portal views lead with **business questions** and **desired outcomes**.

## Feature design

* Every feature should strengthen **one or more Technology Pillars** — or support measurement/planning of them.
* Assessment wizards, recommendation lists, project cards, and report sections should show **pillar affiliation**.
* Progress and trend visualizations are **pillar-aware** where data exists.

## Architecture restraint

* Do **not** dramatically change existing architecture unless a change is required to align with this framework.
* Legacy v1 category codes may persist in storage until Phase 5; map them to pillars at presentation and migration boundaries (DOC-118).
* New assessment libraries, APIs, and UI should target the eight-pillar model from inception.

## Documentation hierarchy

DOC-150 is the **authoritative Technology Maturity Framework** document. When pillar definitions conflict with informal notes or legacy specs, DOC-150 wins for v2 strategic design; DOC-118 governs running application behavior until cutover.

---

# 15. Future Enhancements

The following enhancements are anticipated but **not required** for Framework v1.0:

| Enhancement | Description |
| ----------- | ----------- |
| **Pillar weighting model** | Executive-weighted pillar importance by industry or compliance profile |
| **Maturity stage labels per pillar** | Foundational / Managed / Optimized stages within each pillar |
| **Benchmark comparisons** | Anonymous peer benchmarks by industry and size |
| **Automated evidence collection** | Integration-sourced signals per pillar (DOC-128) |
| **Client portal pillar dashboards** | Self-service pillar trend views for client role users |
| **Pillar-to-framework crosswalk** | Internal mapping tables for NIST, CIS, CMMC, ISO 27001 |
| **Localized pillar narratives** | Industry-specific examples without changing pillar structure |

Framework version increments require revision to this document and registration in DOC-000.

---

# 16. Related Documents

| ID | Title | Relationship |
| -- | ----- | ------------ |
| [DOC-001](DOC-001%20-%20Product%20Vision.md) | Product Vision | Strategic north star |
| DOC-001A | Product Constitution / Design Principles | Design principles (if created) |
| [DOC-002](DOC-002-Product%20Philosophy.md) | Product Philosophy | Product beliefs aligned to maturity framing |
| [DOC-108](DOC-108%20%E2%80%93%20Business%20Profile%20Specification.md) | Business Profile Specification | Business context for pillar prioritization |
| [DOC-110](DOC-110%20-%20StackScore%20Assessment%20Framework.md) | StackScore Assessment Framework | Legacy category framework; superseded for v2 pillar design |
| [DOC-111](DOC-111%20%E2%80%93%20Scoring%20Engine%20Specific.md) | Scoring Engine Specification | Score calculation mechanics |
| [DOC-112](DOC-112%20%E2%80%93%20Recommendation%20Engine%20Specification.md) | Recommendation Engine Specification | Recommendation generation rules |
| [DOC-113](DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md) | Technology Profile Specification | Profile aggregation and lifecycle |
| [DOC-114](DOC-114%20%E2%80%93%20Assessment%20Library%20Specification.md) | Assessment Library Specification | Question library meta-standard |
| [DOC-120](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md) | Domain Model Specification | Domain objects and relationships |
| [DOC-123](DOC-123%20%E2%80%93%20Application%20Workflow%20Specification.md) | Application Workflow Specification | BTIL workflow alignment |
| [DOC-129](DOC-129%20%E2%80%93%20AI%20Development%20Rules%20&%20Engineering%20Constitution.md) | AI Development Rules & Engineering Constitution | Documentation-driven development |
| [DOC-130](DOC-130%20%E2%80%93%20Architecture%20Diagrams%20Specification.md) | Architecture Diagrams Specification | Visual architecture reference |
| [DOC-118](DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md) | v1 to v2 Compatibility Reference | Legacy-to-pillar migration mapping |

---

# 17. Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-06-23 | BobKat IT | Initial Technology Maturity Framework — eight Technology Pillars, business questions, focus areas, assessment philosophy, scoring principles, and product design implications |
