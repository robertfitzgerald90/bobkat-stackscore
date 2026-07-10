# DOC-123 – Application Workflow Specification

**Document ID:** DOC-123
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# Purpose

The Application Workflow Specification defines how users interact with StackScore throughout the Technology Improvement Lifecycle (BTIL).

The objective is to document every major workflow, automation point, user interaction, and business process supported by the application.

This specification defines **application behavior only**. It does not define database schema or implementation details.

Workflows are grounded in the domain objects and lifecycle rules defined in [DOC-120 – Domain Model Specification](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md).

---

# Workflow Philosophy

StackScore exists to simplify and standardize technology consulting.

Humans make business decisions.

StackScore automates the administrative process surrounding those decisions.

Every workflow should reduce manual effort while preserving consultant oversight.

---

# Workflow Principles

* Every workflow begins and ends with the Technology Profile.
* The Technology Profile is the central business object.
* Business outcomes take precedence over technical tasks.
* Human approval is required before creating billable work.
* Automation should reduce administrative effort.
* Every completed implementation should improve the Technology Profile.
* Technology improvement is continuous.
* Historical records are preserved.

---

# Primary Workflow

The standard client lifecycle from onboarding through continuous improvement:

```text
New Client
    ↓
Technology Profile
    ↓
Assessment
    ↓
Recommendations
    ↓
Solution Playbooks
    ↓
Technology Improvement Plan
    ↓
Technology Roadmap
    ↓
Client Approval
    ↓
Projects
    ↓
Technology Completion Report
    ↓
Reassessment
    ↓
Updated Technology Profile
```

## Stage summary

| Stage | User action | System behavior | Primary output |
| ----- | ----------- | --------------- | -------------- |
| New Client | Consultant creates client and contacts | Initializes Client record and active Technology Profile | Client hub |
| Technology Profile | — | Profile shell ready for first assessment | Empty profile |
| Assessment | Consultant conducts assessment | Captures responses; on completion runs scoring | StackScore, category scores |
| Recommendations | Consultant reviews generated list | Recommendation Engine maps findings to opportunities | Open recommendations |
| Solution Playbooks | Consultant selects internal playbooks | Maps capabilities to services and catalog items | Scoped service packages |
| Technology Improvement Plan | Consultant builds client-facing plan | Pricing Engine produces investment summary | TIP document |
| Technology Roadmap | Consultant sequences initiatives | Organizes recommendations into phased priorities | Active roadmap |
| Client Approval | Client approves initiatives (full or partial) | Records approval, signature, and start date | Approved scope |
| Projects | Consultant generates projects | Creates project records and default tasks | Trackable work |
| Technology Completion Report | System/consultant delivers report | Summarizes business impact and profile change | Client deliverable |
| Reassessment | Consultant conducts reassessment | New immutable assessment; compares to prior state | Variance evidence |
| Updated Technology Profile | — | Profile and snapshot updated from reassessment | Improved maturity |

---

# Alternative Workflows

## Reassessment

For clients with an existing Technology Profile who require a fresh evaluation without restarting the engagement.

```text
Open Technology Profile
    ↓
Start Reassessment
    ↓
New Assessment (linked to prior history)
    ↓
Scoring & Recommendations
    ↓
Compare to Prior Profile / Snapshot
    ↓
Update Technology Profile
    ↓
Revise Roadmap & TIP as needed
```

Prior assessments remain immutable. Reassessment always creates a new assessment record.

---

## Existing Client New Project

For approved work that does not require a full new assessment cycle.

```text
Technology Profile
    ↓
Select Open Recommendation(s) or New Initiative
    ↓
Consultant Scopes Project
    ↓
Client Approval
    ↓
Project Execution
    ↓
Completion Report
    ↓
Reassessment (when qualifying work completed)
```

Consultant may add services manually; playbooks assist scoping but do not bypass approval.

---

## Quarterly Business Review

See [Quarterly Business Review Workflow](#quarterly-business-review-workflow). Typically for managed or active commercial clients on a scheduled review cadence.

---

## Managed Technology Program

```text
Technology Profile
    ↓
Enroll / Renew Managed Technology Program
    ↓
Ongoing Monitoring & Maintenance (external to StackScore or future integration)
    ↓
Scheduled Quarterly Review
    ↓
Periodic Reassessment or Health Check
    ↓
Roadmap & TIP Updates
```

Managed program status appears on the Technology Profile. StackScore tracks enrollment, review schedule, and review outcomes.

---

## Residential Services

Simplified lifecycle for residential clients with reduced planning artifacts.

```text
New Client
    ↓
Technology Profile
    ↓
Assessment (residential question set)
    ↓
Recommendations
    ↓
Scoped Proposal / TIP (abbreviated)
    ↓
Client Approval
    ↓
Project
    ↓
Completion Report
    ↓
Reassessment (as warranted)
```

Residential workflows may skip full Technology Roadmap phases when engagement scope is single-project.

---

## One-Time Consulting

Ad-hoc engagement without long-term roadmap commitment.

```text
New or Existing Client
    ↓
Assessment or Scoped Discovery
    ↓
Recommendations & TIP
    ↓
Single Project Approval
    ↓
Delivery & Completion Report
    ↓
Optional Reassessment
    ↓
Profile Updated or Engagement Closed
```

Roadmap and multi-phase planning are optional. Historical records remain on the Technology Profile.

---

# User Workflows

Roles align with [DOC-120 – Domain Model Specification](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md). **v1 implementation note:** MVP maps `admin` and `technician` per [DOC-303 – RBAC & Security Specification](DOC-303%20RBAC%20&%20Security%20Specification.md); `consultant` and `client` portal capabilities are target behavior described below.

## Administrator

**Purpose:** Platform configuration, catalog governance, user management, and full client visibility.

| Feature area | Capabilities |
| ------------ | ------------ |
| Users & roles | Create, edit, deactivate users; assign roles |
| Catalogs | Manage Service Catalog, Approved Technology, Solution Playbooks, assessment libraries |
| Clients | Full CRUD; deactivate clients |
| Technology Profile | View all profiles; no manual score override |
| Assessments | Full access including archive and administration |
| Recommendations | Full access including delete |
| Planning | TIP, Roadmap — view and edit all clients |
| Projects | Full lifecycle management |
| Reports | Completion reports, exports, executive dashboards |
| Administration | Seed data, audit log, at-risk dashboard, system configuration |

---

## Consultant

**Purpose:** Lead client engagements — assess, plan, approve scope, and oversee delivery.

| Feature area | Capabilities |
| ------------ | ------------ |
| Clients | Create and edit clients and contacts |
| Technology Profile | View and present; initiate reassessment |
| Assessments | Create, conduct, complete, edit executive summary |
| Recommendations | Review, prioritize, accept, defer, dismiss; add custom recommendations |
| Solution Playbooks | Select and customize (internal only) |
| Technology Improvement Plan | Build, present, record client approval |
| Technology Roadmap | Create and update phased plan |
| Projects | Create from approved scope; assign resources; monitor progress |
| Completion reports | Review, edit narrative, deliver to client |
| Pricing | View investment summaries; internal pricing visible per role policy |

Consultants **cannot** bypass client approval before billable project execution.

---

## Technician

**Purpose:** Execute assigned implementation work without access to strategic or financial systems.

| Feature area | Capabilities |
| ------------ | ------------ |
| Assigned projects | View assigned projects and tasks only |
| Tasks | Update status, notes, checklists, attachments, photos |
| Client context | Limited client contact and site information for execution |
| Completion | Mark task complete; contribute to project validation |

Technicians **cannot** access:

* Pricing, margins, or cost calculations
* Solution Playbooks or Recommendation Engine configuration
* Scoring Engine weights or assessment library administration
* TIP or Roadmap editing (unless explicitly granted consultant role)

---

## Client

**Purpose:** Review technology posture, approve initiatives, and track progress (future client portal).

| Feature area | Capabilities |
| ------------ | ------------ |
| Technology Profile | View current StackScore, maturity, and trends (client-safe summary) |
| Technology Improvement Plan | View and approve proposed initiatives |
| Technology Roadmap | View phased plan (read-only) |
| Projects | View status of approved work |
| Completion reports | View delivered reports |
| Assessments | View completed assessment executive summary (not internal notes) |

Clients **cannot** create assessments, edit recommendations, or access internal catalogs and playbooks.

---

# Automation Points

Automation assists users without replacing consultant judgment.

| Trigger | Automated action | Consultant oversight |
| ------- | ---------------- | -------------------- |
| Assessment completed | Run Scoring Engine; calculate category scores and StackScore | Review scores before presenting |
| Scores & responses finalized | Recommendation Engine generates recommendations | Accept, modify priority, defer, or dismiss |
| Recommendations selected | Suggest Solution Playbooks and mapped services | Customize scope and services |
| Playbooks & services selected | Assemble Technology Improvement Plan draft; invoke Pricing Engine for investment summary | Edit narrative, phases, and line items |
| TIP approved (full or partial) | Generate Project record(s) and default tasks | Confirm scope, assignments, and schedule |
| Project completed | Generate Technology Completion Report draft | Review and deliver to client |
| Completion report delivered | Prompt reassessment workflow | Schedule and conduct reassessment |
| Reassessment completed | Update Technology Profile; archive snapshot; refresh roadmap/TIP suggestions | Present results to client |

Automation shall **not**:

* Auto-approve client spend
* Auto-close recommendations without project completion or consultant action
* Manually override Technology Profile scores

---

# Notification Events

Future notification support (in-app, email, or integration) for:

| Event | Typical recipient | Purpose |
| ----- | ----------------- | ------- |
| Quarterly Reviews | Consultant, client | Schedule business review |
| Reassessments | Consultant | Due-date reminder for profile refresh |
| Warranty Expiration | Consultant, client | Follow-up on completed project warranties |
| Project Approval | Technician, consultant | Work authorized — begin procurement/scheduling |
| Project Completion | Consultant, client | Report ready; reassessment prompt |
| Technology Profile Updates | Consultant, client | Material score or maturity change |
| Roadmap Milestones | Consultant | Phase transition or dependency cleared |
| Managed Service Reviews | Consultant | Quarterly managed program check-in |

Notifications are informational — they do not replace workflow approval gates.

---

# Quarterly Business Review Workflow

```text
Quarterly Review
    ↓
Refresh Technology Profile
    ↓
Review Completed Projects
    ↓
Compare Historical Progress
    ↓
Review Technology Roadmap
    ↓
Generate Updated Recommendations
    ↓
Update Technology Improvement Plan
    ↓
Present Business Review
```

The Quarterly Business Review shall reinforce continuous technology improvement.

**Inputs:** Active Technology Profile, completed projects since last review, historical snapshots, open roadmap.

**Outputs:** Updated profile presentation, revised recommendations, updated TIP/Roadmap, QBR meeting record.

Managed Technology Program clients follow this workflow on a fixed cadence (typically quarterly).

---

# Workflow Business Rules

* Every workflow references the Technology Profile.
* No workflow bypasses reassessment following qualifying work.
* Every completed project contributes to the client's Technology Journey.
* Administrative automation shall minimize repetitive work.
* Business value shall remain the primary objective of every workflow.

---

# Future Workflow Expansion

Planned workflow support includes:

* **Automated Integrations** — RMM, PSA, and billing system sync for asset and ticket data
* **Client Self-Service** — Portal approval, document upload, and status tracking
* **Managed Service Automation** — Scheduled health checks and review packet generation
* **AI-Assisted Recommendations** — Draft narrative and prioritization suggestions with consultant approval
* **Scheduled Assessments** — Calendar-driven reassessment reminders and assessment templates
* **Multi-site Organizations** — Parent client with site-level profiles and consolidated reporting

Future workflows must comply with domain lifecycle rules in DOC-120.

---

# Related Documents

* [DOC-120 – Domain Model Specification](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md)
* [DOC-110 – StackScore Assessment Framework](../20-Business-Logic/DOC-110%20-%20StackScore%20Assessment%20Framework.md)
* [DOC-111 – Scoring Engine Specification](../20-Business-Logic/DOC-111%20%E2%80%93%20Scoring%20Engine%20Specific.md)
* [DOC-112 – Recommendation Engine Specification](../20-Business-Logic/DOC-112%20%E2%80%93%20Recommendation%20Engine%20Specification.md)
* [DOC-113 – Technology Profile Specification](../20-Business-Logic/DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md)
* [DOC-103 – Technology Improvement Plan Specification](../10-Product/DOC-103%20%E2%80%93%20Technology%20Improvement%20Plan%20Specification.md)
* [DOC-104 – Technology Roadmap Specification](../10-Product/DOC-104%20%E2%80%93%20Technology%20Roadmap%20Specification.md)
* [DOC-105 – Project Generation Specification](../10-Product/DOC-105%20%E2%80%93%20Project%20Generation%20Specification.md)
* [DOC-106 – Solution Playbook Specification](../10-Product/DOC-106%20%E2%80%93%20Solution%20Playbook%20Specification.md)
* [DOC-107 – Technology Completion Report Specification](../10-Product/DOC-107%20%E2%80%93%20Technology%20Completion%20Report%20Specification.md)
* [DOC-003 – BobKat Technology Improvement Lifecycle (BTIL)](../00-Governance/DOC-003%20-%20Bobkat%20Technology%20Improvement%20Lifecycle%20%28BTIL%29.md).md)
* [DOC-303 – RBAC & Security Specification](DOC-303%20RBAC%20&%20Security%20Specification.md)

---

# Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-06-25 | BobKat IT | Initial specification — primary and alternative workflows, role capabilities, automation points, notifications, and QBR workflow |
