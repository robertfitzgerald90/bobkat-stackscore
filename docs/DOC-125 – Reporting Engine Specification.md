# DOC-125 – Reporting Engine Specification

**Document ID:** DOC-125
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# 1. Purpose

DOC-125 defines StackScore's reporting architecture, report types, data sources, audience rules, report lifecycle, and business reporting standards.

This document governs **what** reports exist, **who** may see them, **what data** they include, and **how** they are versioned and retained. It does not define rendering code, PDF libraries, or database migrations.

Individual deliverable specs (e.g. [DOC-103 – TIP](DOC-103%20%E2%80%93%20Technology%20Improvement%20Plan%20Specification.md), [DOC-107 – Completion Report](DOC-107%20%E2%80%93%20Technology%20Completion%20Report%20Specification.md)) remain authoritative for detailed section content; DOC-125 provides the **reporting engine** framework that unifies them.

---

# 2. Reporting Philosophy

Reports exist to communicate **business value** and support **executive decision-making**.

* Every report answers a clear business question.
* Data originates from the **Technology Profile** and its related records — not ad-hoc queries in UI components.
* Client-facing reports tell a **story of improvement**, not a dump of assessment mechanics.
* Technical depth belongs in **supplemental** reports for qualified audiences.
* Historical reports are **evidence** of the client's Technology Journey.

---

# 3. Reporting Principles

1. **Business value first** — outcomes over technical task lists.
2. **Profile-centric** — Technology Profile is the default aggregation root.
3. **Audience-appropriate** — content filtered per DOC-122 before render.
4. **No financial leakage** — client reports never expose margins, costs, or formulas.
5. **No methodology leakage** — playbook names and scoring internals stay internal.
6. **Versioned and preserved** — superseded reports archived, not deleted.
7. **Consistent presentation** — visual standards per [DOC-005 – UI & UX Standards](DOC-005%20%E2%80%93%20UI%20&%20UX%20Standards.md).
8. **Supplemental when needed** — raw assessment detail separated from primary deliverables.
9. **Journey closing** — every exported PDF ends with the Technology Journey closing page per [DOC-126](DOC-126%20%E2%80%93%20PDF%20Generation%20Specification.md#11-technology-journey-closing-page).

---

# 4. Report Audiences

| Audience | Description | Typical reports |
| -------- | ----------- | --------------- |
| **Executive / Business Owner** | Strategic decision-makers | Profile summary, QBR, completion reports, roadmap |
| **Client User** | Portal user linked to client | Approved TIP, project status, completion reports, profile trends |
| **Consultant** | Engagement lead | All client-facing reports plus internal planning views |
| **Internal Admin** | Operations and pricing authority | Profitability, admin operations, full exports |
| **Technician** | Field execution | Project status (assigned), task context only |
| **Read Only User** | Executive/internal viewer | Trends, QBR, profile — no financial internals unless granted |

Audience rules are enforced by [DOC-122 – Roles & Permissions Specification](DOC-122%20%E2%80%93%20Roles%20&%20Permissions%20Specification.md) before the Reporting Service renders output.

---

# 5. Report Categories

| Category | Visibility | Examples |
| -------- | ---------- | -------- |
| **Client-facing strategic** | Client, executive, consultant | TIP, roadmap, completion report, QBR |
| **Client-facing operational** | Client, consultant | Project status, profile summary |
| **Internal consulting** | Consultant, admin | Recommendation summary, assessment executive report |
| **Internal financial** | Admin (delegated consultant subsets) | Profitability, proposal health |
| **Internal operations** | Admin | Admin operations, catalog health |
| **Supplemental technical** | Consultant, admin | Assessment detail appendix |
| **Historical / analytical** | Consultant, admin, read-only | Trend reports, snapshot comparisons |

---

# 6. Standard Report Types

Each report type defines: **Purpose**, **Primary audience**, **Business question answered**, **Source data**, **Required sections**, **Optional sections**, **Export formats**, **Visibility rules**, **Versioning requirements**.

---

## Technology Profile Report

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Present current technology maturity, risks, and improvement posture for a client. |
| **Primary audience** | Executive / Business Owner, Client User, Consultant |
| **Business question** | *What is the current health of our technology environment?* |
| **Source data** | Technology Profile, latest Assessment (summary), open Recommendations, active Projects, Roadmap summary |
| **Required sections** | Cover/summary, overall StackScore, maturity tier, category scores, risk summary, trend indicator, key opportunities |
| **Optional sections** | Managed program status, industry benchmark (future), consultant notes (internal view only) |
| **Export formats** | In-app view, PDF |
| **Visibility rules** | Client sees client-safe summary; internal notes excluded |
| **Versioning** | Point-in-time PDF snapshotted on generation; profile itself is living |

---

## StackScore Assessment Report

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Communicate assessment results in business language after completion. |
| **Primary audience** | Executive / Business Owner, Consultant, Client User (executive summary only) |
| **Business question** | *What did we learn about our technology strengths and gaps?* |
| **Source data** | Completed Assessment, category scores, executive summary, Recommendation list (titles/priorities) |
| **Required sections** | Executive summary, overall StackScore, category breakdown, top risks, top opportunities |
| **Optional sections** | Comparison to prior assessment, maturity tier change, critical flags narrative |
| **Export formats** | In-app view, PDF |
| **Visibility rules** | Client: executive summary + scores; no internal notes, evidence, or question-level detail |
| **Versioning** | Immutable per completed assessment; new reassessment = new report instance |

---

## Technology Improvement Plan

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Client-facing strategic improvement proposal with investment summary. |
| **Primary audience** | Executive / Business Owner, Client User, Consultant |
| **Business question** | *What should we improve, why, and what is the investment?* |
| **Source data** | Technology Profile, Recommendations, Services, Pricing Service output (client slice), Roadmap phases |
| **Required sections** | Per [DOC-103](DOC-103%20%E2%80%93%20Technology%20Improvement%20Plan%20Specification.md): executive summary, recommendations (business language), phased priorities, investment summary, approval block |
| **Optional sections** | Profile projection, business outcomes summary, supplemental appendix reference |
| **Export formats** | In-app view, PDF |
| **Visibility rules** | Investment total visible; no labor rates, margins, or playbook names |
| **Versioning** | **Required** — version number per presentation; superseded versions archived |

---

## Technology Roadmap Report

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Show phased technology improvement plan over time. |
| **Primary audience** | Executive / Business Owner, Client User, Consultant |
| **Business question** | *When should we address each priority?* |
| **Source data** | Technology Roadmap, Technology Profile, Recommendations, Projects |
| **Required sections** | Business objectives per phase, initiative list, projected profile progression, timeline phases |
| **Optional sections** | Dependency notes (business language), budget ranges per phase (client-visible totals only) |
| **Export formats** | In-app view, PDF |
| **Visibility rules** | Client-safe; no internal dependency engine identifiers |
| **Versioning** | **Required** — roadmap version archived on supersede |

---

## Technology Completion Report

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Document completed work and measurable improvement after projects. |
| **Primary audience** | Executive / Business Owner, Client User, Consultant |
| **Business question** | *What value did we receive from this investment?* |
| **Source data** | Completed Project(s), Technology Profile Snapshots (before/after), Recommendations closed, Roadmap |
| **Required sections** | Per [DOC-107](DOC-107%20%E2%80%93%20Technology%20Completion%20Report%20Specification.md): executive summary, business impact, profile comparison, completed initiatives, before/after, warranty, next steps, closing statement |
| **Optional sections** | Business metrics (devices modernized, coverage improved) |
| **Export formats** | In-app view, PDF, future email delivery |
| **Visibility rules** | Fully client-facing; business language only |
| **Versioning** | Immutable after delivery; permanent client history attachment |

---

## Business Impact Summary

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Concise before/after improvement narrative for executives. |
| **Primary audience** | Executive / Business Owner, Consultant, Read Only User |
| **Business question** | *How much did our technology posture improve?* |
| **Source data** | Technology Profile Snapshots, Assessment comparison, completed Projects, Reassessment results |
| **Required sections** | Previous Technology Profile, updated Technology Profile, StackScore improvement, category improvements, risks reduced, business benefits, completed initiatives, recommended next steps |
| **Optional sections** | Variance (expected vs actual), maturity tier change chart |
| **Export formats** | In-app view, PDF, embedded in QBR and completion reports |
| **Visibility rules** | Client-facing when included in delivered reports; standalone internal view may add consultant notes |
| **Versioning** | Generated per event (project completion, reassessment, QBR); archived with parent report |

---

## Quarterly Business Review Report

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Periodic executive review of technology progress and forward plan. |
| **Primary audience** | Executive / Business Owner, Consultant, Read Only User |
| **Business question** | *Are we making progress and what should we focus on next quarter?* |
| **Source data** | Technology Profile, Snapshots, Projects since last review, Recommendations, Roadmap, Managed Technology Program, Business Impact Summary |
| **Required sections** | Current Technology Profile, score trend, completed work since last review, remaining recommendations, roadmap progress, upcoming priorities, managed program status, Business Impact Summary |
| **Optional sections** | Industry context, budget forecast, multi-year journey chart |
| **Export formats** | In-app view, PDF, future email delivery |
| **Visibility rules** | Client presentation variant excludes internal notes; consultant prep view may include internal commentary |
| **Versioning** | One QBR instance per review cycle; archived permanently |

---

## Historical Trend Report

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Analyze StackScore and maturity progression over time. |
| **Primary audience** | Consultant, Internal Admin, Read Only User, Executive / Business Owner |
| **Business question** | *How has our technology maturity changed over time?* |
| **Source data** | Technology Profile Snapshots, Assessment history, completed Projects |
| **Required sections** | Timeline chart, StackScore trend, category trend table, milestone markers (projects/assessments) |
| **Optional sections** | Portfolio view (multi-client, admin), exportable datasets |
| **Export formats** | In-app view, PDF, CSV |
| **Visibility rules** | Client user: own client only; admin: portfolio |
| **Versioning** | Generated on demand; export timestamp recorded |

---

## Recommendation Summary Report

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Consolidated view of open and closed improvement opportunities. |
| **Primary audience** | Consultant, Internal Admin |
| **Business question** | *What work remains and what is the priority order?* |
| **Source data** | Recommendations, Technology Profile, linked Projects, Playbooks (internal) |
| **Required sections** | Priority-sorted list, status, business objective, category, estimated investment, linked project |
| **Optional sections** | Playbook mapping (internal), consolidation groups, dismiss reasons |
| **Export formats** | In-app view, PDF, CSV |
| **Visibility rules** | Internal — playbook names visible to consultant/admin only |
| **Versioning** | Point-in-time export; living data in application |

---

## Project Status Report

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Track implementation progress for active and recent projects. |
| **Primary audience** | Consultant, Technician (assigned), Client User (summary), Executive / Business Owner |
| **Business question** | *What is the status of our approved technology initiatives?* |
| **Source data** | Projects, Project Tasks, related Recommendations |
| **Required sections** | Project list, status, priority, timeline, percent complete, business objective |
| **Optional sections** | Task detail (technician), approval dates, expected impact |
| **Export formats** | In-app view, PDF |
| **Visibility rules** | Technician: assigned projects only; client: no internal task notes; no pricing |
| **Versioning** | Live report; PDF export timestamped |

---

## Managed Technology Program Report

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Summarize ongoing managed services engagement and review history. |
| **Primary audience** | Executive / Business Owner, Consultant, Internal Admin |
| **Business question** | *What value are we receiving from managed services?* |
| **Source data** | Managed Technology Program, Technology Profile maintenance history, review schedule, covered services |
| **Required sections** | Program status, covered scope, review cadence, last review date, profile maintenance summary |
| **Optional sections** | Device coverage metrics, upcoming review agenda |
| **Export formats** | In-app view, PDF |
| **Visibility rules** | Client-facing summary; contract/pricing detail admin-only |
| **Versioning** | Per review cycle snapshot |

---

## Supplemental Assessment Detail Report

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Question-level assessment responses for technical stakeholders. |
| **Primary audience** | Consultant, Internal Admin |
| **Business question** | *What specific findings support the executive summary?* |
| **Source data** | Completed Assessment, Assessment Responses, Questions (versioned), evidence notes |
| **Required sections** | Assessment metadata, category-grouped responses, scores per question, critical flags |
| **Optional sections** | Assessor evidence, internal notes, comparison to prior assessment responses |
| **Export formats** | In-app view, PDF, CSV |
| **Visibility rules** | **Not client-facing** by default; separate from primary TIP/assessment report per DOC-103 |
| **Versioning** | Immutable per assessment; tied to question version |

---

## Internal Profitability Report

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Analyze margin, labor efficiency, and pricing health across proposals and projects. |
| **Primary audience** | Internal Admin |
| **Business question** | *Are our engagements profitable and priced correctly?* |
| **Source data** | TIP internal pricing, Projects (estimated vs actual labor), Pricing Engine, Approved Technology costs |
| **Required sections** | Margin by engagement, labor variance, product margin summary, proposal health indicators |
| **Optional sections** | Consultant performance, catalog utilization, discount exceptions |
| **Export formats** | In-app view, CSV, PDF |
| **Visibility rules** | **Admin only** — never client, technician, or read-only unless explicitly granted |
| **Versioning** | Point-in-time analytical export; audit logged |

---

## Admin Operations Report

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Platform health, catalog status, user activity, and at-risk clients. |
| **Primary audience** | Internal Admin, Super Admin |
| **Business question** | *Is the platform and consulting pipeline operating effectively?* |
| **Source data** | Dashboard Service aggregates, Audit Log, catalog versions, client pipeline, overdue reviews |
| **Required sections** | At-risk clients, overdue reassessments, open critical recommendations, catalog deprecation warnings, user activity summary |
| **Optional sections** | Tenant usage, integration sync status, audit export |
| **Export formats** | In-app view, CSV |
| **Visibility rules** | Admin / Super Admin only |
| **Versioning** | Live dashboard; scheduled exports archived |

---

# 7. Client-Facing Reporting Rules

Client-facing reports **must**:

* Use business language and outcome framing
* Source data from Technology Profile and approved deliverables
* Show investment **totals** only where pricing is included
* Include measurable improvement when available
* Be presentation-ready per DOC-005

Client-facing reports **must never include**:

* Internal margins
* Vendor cost / unit cost
* Labor cost breakdown
* Markup calculations
* Pricing formulas
* Solution Playbook names or codes
* Admin-only notes
* Scoring configuration internals
* Recommendation engine rule identifiers
* Assessor evidence and internal response notes

---

# 8. Internal Reporting Rules

Internal reports **may include**:

* Margin and profitability analysis
* Labor estimates vs actuals
* Pricing health and proposal health scores
* Playbook mappings and catalog codes
* Admin-only notes and audit context
* Scoring and recommendation traceability

Internal reports are still subject to **DOC-122** role checks — consultants do not automatically receive profitability reports.

---

# 9. Business Impact Reporting

Business Impact Summary is a **cross-cutting report component** embedded in completion reports, QBR, and reassessment presentations.

**Required elements:**

* Previous Technology Profile (snapshot or prior assessment state)
* Updated Technology Profile
* StackScore improvement (absolute and directional trend)
* Category improvements (business-labeled)
* Risks reduced (count and narrative)
* Business benefits (reliability, security, productivity, continuity, visibility)
* Completed initiatives (projects/services delivered)
* Recommended next steps (from Roadmap and open Recommendations)

Narrative must explain **why the improvement matters** to the business, not which products were installed.

---

# 10. Technology Profile Reporting

Technology Profile is the **default report anchor**:

* All client-facing strategic reports include a profile summary section or explicit profile reference.
* Profile reports pull **current** state from Technology Profile Service; historical comparisons pull **Snapshots**.
* Category labels use v2 taxonomy per DOC-113.
* Maturity tier and StackScore Rating distinctions per DOC-118 must be labeled clearly in reports.

Profile reports do not replace Snapshots — PDF exports at a point in time should record `snapshotId` or `generatedAt` metadata.

---

# 11. Historical Reporting

* **Snapshots** are the authoritative source for point-in-time historical comparison.
* Trend reports chain snapshots and completed assessment dates — never rewrite past PDFs.
* Completed projects appear as **milestones** on historical timelines.
* QBR and trend reports compare *since last review* using stored review dates.
* Retention: delivered client reports and snapshots are **permanent** per DOC-121.

---

# 12. Supplemental Technical Reporting

* Supplemental Assessment Detail Report is **opt-in** — not bundled in primary client deliverables.
* Generated on demand for consultants preparing QBR or technical handoffs.
* May be shared with client technical contacts only through explicit consultant action (future portal control).
* Label clearly: *Supplemental Technical Appendix — Internal Use* unless client release is intentional.

---

# 13. Report Versioning & Retention

| Report class | Versioning | Retention |
| ------------ | ---------- | --------- |
| TIP | Increment version on each presentation; supersede prior | Archive all approved versions |
| Roadmap | Version on structural change | Archive superseded |
| Completion Report | Version until delivered; then frozen | Permanent |
| Assessment Report | One per completed assessment | Permanent |
| QBR | One per review cycle | Permanent |
| Profitability / Admin ops | Export timestamp | Per compliance policy |
| On-demand trends | `generatedAt` metadata | Optional archive |

Version metadata: `reportType`, `versionNumber`, `clientId`, `generatedAt`, `generatedByUserId`, `sourceEntityIds`, `documentId` (PDF).

---

# 14. Report Access Control

Access enforced in order:

1. **Authentication** — valid session
2. **Authorization Service** — DOC-122 module matrix
3. **Report-type policy** — this document's visibility rules
4. **Field redaction** — strip internal fields before render
5. **Client scope** — portal users filtered to `clientId`

| Report type | Client | Consultant | Technician | Read Only | Admin |
| ----------- | ------ | ---------- | ---------- | --------- | ----- |
| Profile / Assessment (executive) | ✅ | ✅ | ❌ | ✅ | ✅ |
| TIP / Roadmap / Completion | ✅ | ✅ | ❌ | ◐ | ✅ |
| Project Status | ◐ | ✅ | 🔒 | ◐ | ✅ |
| QBR / Business Impact | ✅ | ✅ | ❌ | ✅ | ✅ |
| Recommendation Summary | ❌ | ✅ | ❌ | ◐ | ✅ |
| Supplemental Assessment | ❌ | ✅ | ❌ | ❌ | ✅ |
| Profitability | ❌ | Ⓢ | ❌ | ❌ | ✅ |
| Admin Operations | ❌ | ❌ | ❌ | ❌ | ✅ |

🔒 assigned only · ◐ redacted · Ⓢ delegated

---

# 15. Export Requirements

| Format | Requirements |
| ------ | ------------ |
| **In-app view** | Responsive per DOC-005; role-redacted fields |
| **PDF** | Branded template, cover page, generation date, version label, page numbers; stored via Document Service |
| **CSV** | Trend, recommendation, profitability, admin exports; column headers business-friendly; financial columns admin-only |
| **Future email delivery** | Links to portal or encrypted attachment; audit logged; client-visible content only |

All exports of sensitive financial reports invoke **Audit Service** per DOC-122.

---

# 16. Reporting Service Responsibilities

Per [DOC-124 – Service Layer Specification](DOC-124%20%E2%80%93%20Service%20Layer%20Specification.md), the **Reporting Service** shall:

* Resolve report type and audience from request context
* Gather data from Technology Profile Service and related domain services
* Apply visibility rules and field redaction (DOC-125 + DOC-122)
* Delegate PDF persistence to Document Service
* Record version metadata and audit exports
* Emit `ReportGenerated` and `ReportExported` events

Reporting Service **must not** query persistence directly from UI routes — API calls Reporting Service only.

**Dashboard Service** provides live metrics; Reporting Service produces formal deliverables and exports.

---

# 17. Future Enhancements

* Scheduled report delivery (QBR, review reminders)
* Custom report builder for admin
* Multi-client portfolio benchmarking
* Embedded charts in client portal
* Report templates per industry vertical
* AI-generated executive narrative with consultant approval
* Digital signature integration on PDF exports
* White-label branding per tenant

---

# 18. Related Documents

* [DOC-005 – UI & UX Standards](DOC-005%20%E2%80%93%20UI%20&%20UX%20Standards.md)
* [DOC-103 – Technology Improvement Plan Specification](DOC-103%20%E2%80%93%20Technology%20Improvement%20Plan%20Specification.md)
* [DOC-104 – Technology Roadmap Specification](DOC-104%20%E2%80%93%20Technology%20Roadmap%20Specification.md)
* [DOC-107 – Technology Completion Report Specification](DOC-107%20%E2%80%93%20Technology%20Completion%20Report%20Specification.md)
* [DOC-113 – Technology Profile Specification](DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md)
* [DOC-120 – Domain Model Specification](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md)
* [DOC-122 – Roles & Permissions Specification](DOC-122%20%E2%80%93%20Roles%20&%20Permissions%20Specification.md)
* [DOC-123 – Application Workflow Specification](DOC-123%20%E2%80%93%20Application%20Workflow%20Specification.md)
* [DOC-124 – Service Layer Specification](DOC-124%20%E2%80%93%20Service%20Layer%20Specification.md)
* [DOC-126 – PDF Generation Specification](DOC-126%20%E2%80%93%20PDF%20Generation%20Specification.md)
* [DOC-003 – BobKat Technology Improvement Lifecycle (BTIL)](DOC-003%20-%20Bobkat%20Technology%20Improvement%20Lifecycle%20(BTIL).md)

---

# 19. Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-06-25 | BobKat IT | Initial reporting engine specification — fourteen report types, audience rules, versioning, and service responsibilities |
| 1.1 | 2026-06-25 | BobKat IT | Technology Journey closing page required on all PDF exports (DOC-126) |
