# DOC-160 – Portfolio Module Specification

**Document ID:** DOC-160  
**Version:** 1.0  
**Status:** Draft  
**Owner:** BobKat IT  
**Last Updated:** June 30, 2026

---

#Intention

The Portfolio is not a dashboard.

The Portfolio is the consultant's operational home.

Its purpose is to help the consultant determine which client deserves attention without requiring analysis.

The Portfolio should remain calm, compact, and intentionally boring.

Complexity belongs inside the Client Workspace.

---

# 1. Purpose

DOC-160 defines the StackScore **Portfolio** module — the default operational landing experience for consultants.

The Portfolio answers one question:

**Which client deserves my attention?**

It is a **client prioritization surface**, not a reporting dashboard, project register, or CRM. Consultants use the Portfolio to scan their book of business, compare client health at a glance, and enter the right client workspace with one click.

This document specifies experience architecture, card anatomy, readiness semantics, sort behavior, and navigation rules. It does not define UI components, API contracts, or implementation code.

---

# 2. Relationship to Other Documents

| Document | Relationship |
| -------- | ------------ |
| [DOC-006 – StackScore Product Constitution](../00-Governance/DOC-006%20%E2%80%93%20StackScore%20Product%20Constitution.md) | Governing product principles — consultant-first, reduce complexity, intelligent defaults |
| [DOC-007 – StackScore User Experience Constitution](../00-Governance/DOC-007%20%E2%80%93%20StackScore%20User%20Experience%20Constitution.md) | UX constitution — Portfolio purpose, cards before tables, Immediate Focus, Five Second Rule |
| [DOC-113 – Technology Profile Specification](../20-Business-Logic/DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md) | Source of client maturity, trend, and health data displayed on cards |
| [DOC-119 – Technology Maturity Scoring Engine](../20-Business-Logic/DOC-119%20-%20Technology%20Maturity%20Scoring%20Engine.md) | StackScore, projected score, maturity labels, and trend calculations |
| [DOC-127 – Dashboard Specification](../30-Architecture/DOC-127%20%E2%80%93%20Dashboard%20Specification.md) | Complementary global KPI surface — Portfolio is operational; Dashboard is executive |
| [DOC-150 – StackScore Technology Maturity Framework](../20-Business-Logic/DOC-150%20%E2%80%93%20StackScore%20Technology%20Maturity%20Framework.md) | Maturity language and pillar context underlying client health |
| [DOC-152 – Decision Intelligence Engine](../20-Business-Logic/DOC-152%20-%20Decision%20Intelligence%20Engine%20Version.md) | Recommendation prioritization, readiness logic, and default sort intelligence |
| [DOC-005 – UI & UX Standards](../00-Governance/DOC-005%20%E2%80%93%20UI%20&%20UX%20Standards.md) | Visual standards — calm layout, card components, color semantics |
| [DOC-122 – Roles & Permissions Specification](../30-Architecture/DOC-122%20%E2%80%93%20Roles%20&%20Permissions%20Specification.md) | Role-scoped client visibility on Portfolio |
| [DOC-123 – Application Workflow Specification](../30-Architecture/DOC-123%20%E2%80%93%20Application%20Workflow%20Specification.md) | Client Workspace and Immediate Focus entry workflows |

**Authority:** For Portfolio experience decisions, DOC-160 takes precedence over DOC-127 for consultant landing behavior. DOC-127 remains authoritative for Dashboard widgets and global KPI architecture.

---

# 3. Portfolio Philosophy

The Portfolio is the consultant's **operational console entry point**.

| Principle | Specification |
| --------- | ------------- |
| **One question** | Which client deserves my attention right now? |
| **Calm density** | Enough signal to decide; never overwhelming |
| **Cards, not tables** | Each client is a compact card — not a row in an administrative grid |
| **Action-oriented** | Every card leads to work — not passive browsing |
| **Backend intelligence** | Sorting, readiness, and focus counts are computed by services — not configured by the user |
| **Progressive disclosure** | Summary on Portfolio; detail in Client Workspace |

The Portfolio shall **not** become:

* A project table or task manager
* A CRM contact directory
* A clone of the Dashboard KPI page
* A configuration or administration screen

---

# 4. Portfolio vs Dashboard

StackScore provides two distinct home experiences:

| Surface | Primary question | Audience | Content |
| ------- | ---------------- | -------- | ------- |
| **Portfolio** | Which client deserves my attention? | Consultant (default landing) | Compact client cards, readiness, open work signals |
| **Dashboard** | How is my consulting practice performing? | Admin, Consultant, Read Only | Global KPIs, portfolio trends, Today's Focus, activity feeds |

### 4.1 Default landing page

| Role | Default landing page |
| ---- | -------------------- |
| **Consultant** | **Portfolio** |
| **Admin** | Dashboard (Portfolio available in navigation) |
| **Technician** | Technician Dashboard per DOC-127 |
| **Client** | Client Dashboard per DOC-127 |
| **Read Only** | Dashboard per DOC-127 |

After login, consultants shall land on **Portfolio**, not Dashboard.

Dashboard remains available in global navigation for practice-level KPIs and cross-client summaries.

---

# 5. Questions Each Card Must Answer

Every Portfolio client card shall help the consultant answer six questions within five seconds (DOC-007 Five Second Rule):

| # | Question | Card signal |
| - | -------- | ----------- |
| 1 | **Who is the client?** | Client name |
| 2 | **How healthy are they?** | Current StackScore, maturity status, trend sparkline |
| 3 | **Can meaningful work happen now?** | Readiness badge |
| 4 | **How much work is open?** | Open projects count |
| 5 | **How urgent is the work?** | Critical recommendations count |
| 6 | **How much improvement is possible?** | Projected StackScore, Immediate Focus count |

Cards present **conclusions**, not raw backend calculations. Complexity belongs in the Decision Intelligence Engine and Technology Profile services.

---

# 6. Client Card Specification

### 6.1 Layout

Cards are displayed in a **responsive grid** of compact cards.

| Attribute | Specification |
| --------- | ------------- |
| **Density** | Compact — target 2–4 cards per row on desktop; single column on mobile |
| **Visual tone** | Calm, card-based, minimal chrome (DOC-007 Principle 9) |
| **Interaction** | Entire card is clickable |
| **Hover / focus** | Subtle elevation or border — indicates navigability |
| **Empty portfolio** | Guided empty state with link to add or assign clients |

### 6.2 Card fields

Each client card shall display the following fields:

| Field | Description | Data source | Display rules |
| ----- | ----------- | ----------- | ------------- |
| **Client name** | Primary identifier | Client record | Prominent; truncate gracefully on narrow viewports |
| **Current StackScore** | Latest completed assessment overall score | Technology Profile / DOC-119 | Integer 0–100; color band per maturity rating; show em dash if never assessed |
| **Projected StackScore** | Score if open recommendations are completed | Recommendation projection per DOC-119 | Shown only when assessment exists and open recommendations exist; otherwise hidden or em dash |
| **Maturity status** | Human-readable maturity label | Technology Profile maturity tier / DOC-119 maturity levels | Badge or label — e.g. Mature, Developing, At Risk |
| **Trend sparkline** | Recent StackScore movement | Client score history snapshots | Mini sparkline (5–8 points); flat line if insufficient history; direction communicates story before numbers |
| **Open projects** | Count of active portfolio projects | Project Service — approved, scheduled, in progress, and proposed per product open-project rules | Integer; zero displayed as `0` |
| **Critical recommendations** | Count of open critical-priority recommendations | Recommendation Service | Integer; emphasize visually when > 0 |
| **Immediate Focus count** | Count of highest-priority actionable items for this client | Decision Intelligence Engine / Immediate Focus aggregation | Integer; surfaces what deserves attention inside the client workspace |
| **Readiness badge** | Whether meaningful consultant work can proceed now | Readiness Service (Section 7) | Single badge — Ready, Partial, Blocked, or Healthy |
| **Last assessment date** | Date of most recent completed assessment | Assessment record | Relative or short date format; "Never assessed" if no completed assessment |

### 6.3 Field priority (visual hierarchy)

When space is constrained (mobile), fields shall degrade in this order:

1. **Always visible:** Client name, Current StackScore, Readiness badge
2. **Secondary:** Critical recommendations, Immediate Focus count, Maturity status
3. **Tertiary:** Trend sparkline, Projected StackScore, Open projects, Last assessment date

Never remove Client name, Current StackScore, or Readiness badge on any viewport.

### 6.4 Cards shall not include

* Full recommendation lists
* Project tables or task lists
* Pricing, margin, or financial data
* Administrative edit controls
* Inline assessment or project creation forms
* Multi-step workflows

Those belong in Client Workspace, Project Register, or Dashboard — not on Portfolio cards.

---

# 7. Readiness States

The **Readiness badge** communicates whether meaningful consultant work can happen now for a client. Readiness is computed by backend services — not selected by the user.

| State | Label | Meaning | Typical signals |
| ----- | ----- | ------- | --------------- |
| **Ready** | Ready | High-value work is unblocked and should proceed | Open critical/high recommendations with no blocking dependencies; approved projects ready to start; reassessment not overdue |
| **Partial** | Partial | Some work is possible; other items are waiting | Mix of actionable recommendations and blocked projects; incomplete assessment in draft; dependencies unresolved on subset of work |
| **Blocked** | Blocked | Meaningful progress cannot proceed without resolution | All open work blocked by dependencies, approvals, or missing prerequisites; no completed assessment and draft not started when assessment is required |
| **Healthy** | Healthy | No urgent consultant action required | Strong maturity, no critical open recommendations, no overdue reassessment, no high-priority Immediate Focus items |

### 7.1 Readiness rules

| Rule | Specification |
| ---- | ------------- |
| **Single badge** | Exactly one readiness state per card |
| **Precedence** | When multiple signals apply, display the most actionable state: Blocked > Ready > Partial > Healthy |
| **Color semantics** | Align with DOC-007 — Healthy (green), Partial (yellow), Ready (green-blue / informational), Blocked (red or strong warning) |
| **Explainability** | Readiness reason is available on hover or in Client Workspace — not as paragraph text on the card |
| **No manual override** | Consultants do not manually set readiness on Portfolio cards |

### 7.2 Healthy vs Ready

| State | Distinction |
| ----- | ----------- |
| **Healthy** | Client is in good standing; consultant attention is not urgently required |
| **Ready** | Consultant should actively engage — work is available and unblocked |

A client may be healthy with open low-priority work. A client may be ready with moderate maturity but critical recommendations awaiting action.

---

# 8. Sort Options

Portfolio cards shall support the following sort modes. **Recommended** is the default.

| Sort mode | Label | Behavior |
| --------- | ----- | -------- |
| **Recommended** | Recommended | Default intelligent order from Decision Intelligence Engine — balances urgency, opportunity, readiness, and recency |
| **Needs Attention** | Needs Attention | Clients with critical recommendations, blocked readiness, declining trend, or overdue reassessment first |
| **Biggest Opportunity** | Biggest Opportunity | Largest gap between Current StackScore and Projected StackScore first |
| **Recently Active** | Recently Active | Most recent assessment completion, project activity, or profile update first |
| **Alphabetical** | A–Z | Client name ascending |

### 8.1 Sort rules

| Rule | Specification |
| ---- | ------------- |
| **Default** | Recommended — no user configuration required on first visit |
| **Persistence** | Last selected sort mode saved per user |
| **Scope** | Sort applies within the user's visible client portfolio per DOC-122 |
| **Tie-breaking** | Secondary sort by client name ascending |
| **Recommended algorithm** | Owned by Decision Intelligence Engine (DOC-152); Portfolio consumes ranked output |

### 8.2 Recommended sort factors (informational)

The Recommended sort may consider, in weighted combination:

* Critical and high-priority open recommendations
* Readiness state (Ready and Blocked before Healthy)
* Projected improvement magnitude
* StackScore trend direction (declining clients rise)
* Days since last assessment (overdue reassessment rises)
* Open Immediate Focus item count
* Recent consultant or system activity

Exact weighting is implementation detail of DOC-152 — not redefined here.

---

# 9. Navigation and Interaction

### 9.1 Card click behavior

| Action | Result |
| ------ | ------ |
| **Click client card** | Navigate to **Client Workspace** with **Immediate Focus** section in view (scrolled or tab-selected) |
| **Deep link** | `/clients/{clientId}` with Immediate Focus anchor or query parameter |

The consultant shall not land on a generic client profile tab, assessment history, or project list when entering from Portfolio. The entry point is always **Immediate Focus**.

### 9.2 Secondary navigation

| Element | Behavior |
| ------- | -------- |
| **Global navigation** | Portfolio, Dashboard, Clients, Projects, and other modules remain accessible |
| **Search** | Global client search may jump directly to Client Workspace |
| **Filters (future)** | Optional filters by readiness, maturity, or assigned consultant — must not replace sort modes |

### 9.3 One click deeper

Portfolio follows DOC-007 navigation ladder:

```text
Portfolio
  ↓  (card click)
Client Workspace — Immediate Focus
  ↓
Recommendation / Project / Assessment
  ↓
Detail / Deliverable
```

---

# 10. Data Sources

Portfolio cards aggregate read-only data from existing domain services. Portfolio does not introduce a parallel scoring or recommendation model.

| Field | Primary service | Supporting documents |
| ----- | --------------- | -------------------- |
| Client name | Client Service | DOC-120 |
| Current StackScore | Technology Profile Service | DOC-113, DOC-119 |
| Projected StackScore | Recommendation + Scoring Services | DOC-119, DOC-152 |
| Maturity status | Technology Profile Service | DOC-119, DOC-150 |
| Trend sparkline | Technology Profile / Score History | DOC-113, DOC-119 |
| Open projects | Project Service | DOC-105, DOC-120 |
| Critical recommendations | Recommendation Service | DOC-112, DOC-152 |
| Immediate Focus count | Decision Intelligence / Dashboard aggregation | DOC-152, DOC-127 |
| Readiness badge | Readiness evaluation (Decision Intelligence layer) | DOC-152, DOC-007 |
| Last assessment date | Assessment Service | DOC-109, DOC-120 |

Data shall refresh when domain events fire (`TechnologyProfileUpdated`, `ProjectCompleted`, `RecommendationStatusChanged`, `AssessmentCompleted`).

---

# 11. Page Structure

Portfolio follows the standard StackScore page layout (DOC-007 Principle 13), adapted for operational simplicity:

| Section | Content |
| ------- | ------- |
| **1. Page header** | Title: Portfolio; subtitle: "Which client deserves your attention?" |
| **2. Controls row** | Sort selector; optional search; client count summary |
| **3. Card grid** | Client cards per Section 6 |
| **4. Empty / loading states** | Calm messaging — no spinners that obscure layout |

Portfolio shall **not** include:

* Global KPI cards (those belong on Dashboard per DOC-127)
* Today's Focus strip (Dashboard and Client Workspace surfaces)
* Activity feeds or notification previews
* Charts spanning the full portfolio

---

# 12. Role and Visibility

| Role | Portfolio access | Default landing |
| ---- | ---------------- | --------------- |
| **Consultant** | All clients in scope per DOC-122 | **Yes** |
| **Admin** | All organization clients | No — Dashboard default; Portfolio in nav |
| **Technician** | Not applicable — assigned projects only per DOC-127 | No |
| **Client** | Not applicable — single client portal | No |
| **Read Only** | Read-only card data; no action CTAs beyond view | No |

Portfolio cards shall not expose fields the role cannot access. Redaction occurs at the service layer per DOC-122.

---

# 13. Anti-Patterns

The following are explicitly **out of scope** for Portfolio v1.0:

| Anti-pattern | Why it is excluded |
| ------------ | ------------------ |
| Project table on Portfolio | Tables are for administration (DOC-007); use Project Register |
| Inline CRM contact editing | Portfolio is prioritization, not record management |
| Dashboard KPI clone | Duplicates DOC-127; dilutes the single purpose of Portfolio |
| Bulk client actions | Administrative; belongs elsewhere |
| Configurable card field picker | Violates intelligent defaults (DOC-007 Principle 18) |
| Dense multi-line recommendation text on cards | Violates calm, compact card design |
| Manual drag-and-drop card ordering as primary sort | Sort modes and Recommended order are authoritative |

---

# 14. Acceptance Criteria

Before Portfolio v1.0 is considered complete:

| # | Criterion |
| - | --------- |
| 1 | Consultant login lands on Portfolio by default |
| 2 | Dashboard remains accessible and unchanged in purpose |
| 3 | Each card displays all fields defined in Section 6.2 (or graceful empty states) |
| 4 | Cards answer all six questions in Section 5 within five seconds |
| 5 | Readiness badge displays exactly one of: Ready, Partial, Blocked, Healthy |
| 6 | All five sort modes function per Section 8 |
| 7 | Card click opens Client Workspace focused on Immediate Focus |
| 8 | Layout is compact, calm, and card-based on desktop and mobile |
| 9 | Portfolio does not duplicate Dashboard KPI widgets |
| 10 | Portfolio does not render project tables or CRM-style contact grids |
| 11 | Data reflects Technology Profile and Decision Intelligence outputs — no fabricated values |
| 12 | Experience passes DOC-007 User Experience Acceptance Checklist |

---

# 15. Future Enhancements

* Assigned-consultant portfolio filtering
* Readiness reason tooltip with top blocking factor
* Saved portfolio views (e.g. "At-risk this week")
* Team portfolio for shared client books
* Portfolio-level summary strip (client count by readiness) — optional, must not replace card grid

---

# 16. Related Documents

* [DOC-000 – Documentation Architecture & Index](../DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md)
* [DOC-006 – StackScore Product Constitution](../00-Governance/DOC-006%20%E2%80%93%20StackScore%20Product%20Constitution.md)
* [DOC-007 – StackScore User Experience Constitution](../00-Governance/DOC-007%20%E2%80%93%20StackScore%20User%20Experience%20Constitution.md)
* [DOC-113 – Technology Profile Specification](../20-Business-Logic/DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md)
* [DOC-119 – Technology Maturity Scoring Engine](../20-Business-Logic/DOC-119%20-%20Technology%20Maturity%20Scoring%20Engine.md)
* [DOC-127 – Dashboard Specification](../30-Architecture/DOC-127%20%E2%80%93%20Dashboard%20Specification.md)
* [DOC-150 – StackScore Technology Maturity Framework](../20-Business-Logic/DOC-150%20%E2%80%93%20StackScore%20Technology%20Maturity%20Framework.md)
* [DOC-152 – Decision Intelligence Engine](../20-Business-Logic/DOC-152%20-%20Decision%20Intelligence%20Engine%20Version.md)

---

# 17. Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-06-30 | BobKat IT | Initial Portfolio module specification — default consultant landing, card anatomy, readiness states, sort modes, and navigation to Immediate Focus |
