# DOC-161 – Client Workspace Specification

**Document ID:** DOC-161  
**Version:** 1.0  
**Status:** Approved  
**Owner:** BobKat IT  
**Last Updated:** June 30, 2026

---

#Intention

The Client Workspace is not a dashboard.

The Client Workspace is the operational center for a single client.

Its purpose is to help the consultant determine what deserves immediate focus without requiring analysis.

The Client Workspace should remain calm, compact, and operational.

Complexity belongs in supporting modules — not in the page header.

---

# 1. Purpose

DOC-161 defines the StackScore **Client Workspace** — the consultant's operational surface for one client, implemented on the Technology Profile route.

The Client Workspace answers one question:

**What deserves my immediate focus?**

It is a **client-level prioritization and awareness surface**, not an assessment administration screen, project register, or reporting dashboard. Consultants use the Client Workspace to understand client health, scan immediate work, and enter the right recommendation, project, or assessment with minimal friction.

This document specifies page hierarchy, header behavior, assessment entry rules, KPI layout, Immediate Focus presentation, and navigation. It does not define UI components, API contracts, or implementation code.

---

# 2. Objectives

| Objective | Specification |
| --------- | ------------- |
| **Single purpose** | Surface what deserves immediate consultant attention for one client |
| **Awareness before action** | Client health and KPIs appear before management utilities |
| **Intelligent defaults** | Assessment type and naming are system-determined — not user-selected (DOC-007 Principle 18) |
| **Progressive disclosure** | Summary on Client Workspace; detail in recommendations, projects, assessments, and reports |
| **Portfolio continuity** | Entry from Portfolio lands on Immediate Focus — not a generic profile tab |
| **Calm density** | Compact header and KPI row; no large assessment management panels |

---

# 3. Relationship to Other Documents

| Document | Relationship |
| -------- | ------------ |
| [DOC-006 – StackScore Product Constitution](DOC-006%20%E2%80%93%20StackScore%20Product%20Constitution.md) | Governing product principles — consultant-first, reduce complexity |
| [DOC-007 – StackScore User Experience Constitution](DOC-007%20%E2%80%93%20StackScore%20User%20Experience%20Constitution.md) | UX constitution — one purpose per screen, intelligent defaults, calm layout |
| [DOC-113 – Technology Profile Specification](DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md) | Underlying Technology Profile data model and maturity presentation |
| [DOC-160 – Portfolio Module Specification](DOC-160%20%E2%80%93%20Portfolio%20Module%20Specification.md) | Portfolio entry point — card click opens Client Workspace at Immediate Focus |
| [DOC-163 – Immediate Focus Engine](DOC-163%20%E2%80%93%20Immediate%20Focus%20Engine.md) | Ranking and display rules for Immediate Focus items and KPI count |
| [DOC-119 – Technology Maturity Scoring Engine](DOC-119%20-%20Technology%20Maturity%20Scoring%20Engine.md) | StackScore, projected score, and maturity calculations |
| [DOC-152 – Decision Intelligence Engine](DOC-152%20-%20Decision%20Intelligence%20Engine%20Version.md) | Recommendation prioritization and next-action guidance |
| [DOC-109 – Assessment Design Specification](DOC-109%20%E2%80%93%20Assessment%20Design%20Specification.md) | Assessment capture experience after Assess Client is invoked |
| [DOC-127 – Dashboard Specification](DOC-127%20%E2%80%93%20Dashboard%20Specification.md) | Complementary read-only analytics — not the Client Workspace |

**Authority:** For Client Workspace experience decisions, DOC-161 takes precedence over DOC-113 for page layout and operational entry behavior. DOC-113 remains authoritative for Technology Profile data semantics.

---

# 4. Page Hierarchy

The Client Workspace shall flow in this order:

| # | Section | Purpose |
| - | ------- | ------- |
| 1 | **Client header** | Identity, status, and single primary action (Assess Client) |
| 2 | **KPI dashboard** | At-a-glance client health signals |
| 3 | **Immediate Focus** | Ranked list of highest-value work items |
| 4 | **Technology Maturity Overview** | Maturity context, StackScore hero, and risk signals |
| 5 | **Navigation tabs** | Supporting client capabilities (not primary workspace focus) |
| 6 | **Supporting content** | Business snapshot, pillar scores, journey, documents, and related modules |

The consultant shall see **awareness before management**. Assessment history, comparisons, and administrative utilities belong in navigation — not in the page header.

---

# 5. Client Header

### 5.1 Layout

The Client Workspace header follows the same compact pattern as the Portfolio page header (DOC-160 §11).

| Region | Content |
| ------ | ------- |
| **Left** | Client name; client status badge; subtitle: *"What deserves your immediate focus?"* |
| **Right** | **Assess Client** — single primary action button |

### 5.2 Header rules

| Rule | Specification |
| ---- | ------------- |
| **One primary action** | Only **Assess Client** appears in the header — no New Assessment forms, reassessment panels, or secondary quick actions |
| **Visual weight** | Assess Client matches Portfolio **New Client** button importance — not oversized |
| **No hero banner** | No large marketing or assessment management panels in the header region |
| **Archived clients** | Assess Client hidden when client status is archived |

---

# 6. Assessment Behavior

Assessment capability remains available but shall not dominate the Client Workspace.

### 6.1 Assess Client — automatic determination

When the consultant clicks **Assess Client**, the system determines assessment type — the user does not choose.

| Condition | System action |
| --------- | ------------- |
| **Draft assessment in progress** | Continue existing draft assessment |
| **No completed assessments** | Create **Initial Assessment** |
| **One or more completed assessments** | Create **Reassessment** using latest completed assessment as baseline |

This follows DOC-007: *"The user should never make a decision that the system can determine automatically."*

### 6.2 Automatic assessment naming

Assessment names are generated by the system. The consultant does not name assessments before starting.

| Assessment type | Example name |
| --------------- | ------------ |
| Initial | Initial Assessment |
| Follow-up reassessment | Follow-up Assessment |
| Quarterly reassessment | Quarterly Assessment |
| Annual reassessment | Annual Assessment |

Reassessment type selection considers elapsed time since last completion and overdue reassessment window.

### 6.3 Assessment utilities — relocated

The following capabilities remain available but are **not** displayed as large header panels:

| Utility | Location |
| ------- | -------- |
| Assessment History | Navigation tabs |
| Compare Assessments | Navigation tabs (when two or more completed assessments exist) |

Assessment capture occurs in the Assessment Wizard per DOC-109 after Assess Client creates or resumes a draft.

### 6.4 Immutable assessment history

Reassessments create new assessment records. Prior completed assessments remain immutable snapshots — not overwritten.

---

# 7. KPI Dashboard

Immediately below the header, the Client Workspace displays a compact KPI row.

| KPI | Description | Display rules |
| --- | ----------- | ------------- |
| **StackScore** | Latest completed assessment overall score | Integer 0–100; color band per maturity rating; em dash if never assessed |
| **Projected** | Score if open recommendations are addressed | Shown when projection is available; em dash otherwise |
| **Open Projects** | Count of open portfolio projects | Integer; proposed through in progress per product open-project rules |
| **Critical Recs** | Count of open critical-priority recommendations | Integer; emphasized when > 0 |
| **Immediate Focus** | Count of urgent focus signals | Integer per DOC-163 |

KPIs present **conclusions** — not raw service calculations. Complexity belongs in scoring and decision intelligence services.

---

# 8. Immediate Focus

The Immediate Focus section is the operational heart of the Client Workspace.

### 8.1 Purpose

Immediate Focus answers: *What specific items deserve attention right now for this client?*

### 8.2 Layout

| Element | Specification |
| ------- | ------------- |
| **Section title** | Immediate Focus |
| **Item limit** | Top 3–5 ranked items |
| **Row structure** | Primary line: concise title + priority badge; secondary line: pillar · score impact · status · readiness · source |
| **Interaction** | Entire row clickable; arrow indicator on the right |
| **Project register link** | Secondary outline link to client-filtered Project Register |

### 8.3 Row click behavior

| Item type | Navigation target |
| --------- | ----------------- |
| **Project item** | Project Register — selected project |
| **Recommendation with linked project** | Project Register — linked project |
| **Recommendation only** | Client Recommendations — selected recommendation |

### 8.4 Empty states

| Condition | Message intent |
| --------- | -------------- |
| **No completed assessment** | Establish baseline first — complete initial assessment |
| **Assessed, no urgent items** | No urgent focus items — open work is complete or awaiting approval |

Ranking, selection, and exclusion rules are defined in [DOC-163 – Immediate Focus Engine](DOC-163%20%E2%80%93%20Immediate%20Focus%20Engine.md).

---

# 9. Technology Maturity Overview

Below Immediate Focus, the Client Workspace presents **Technology Maturity Overview** — analytical context for the client's maturity posture.

| Element | Specification |
| ------- | ------------- |
| **StackScore display** | Prominent current score with rating label |
| **Maturity signals** | Business goal, maturity tier, trend badges where available |
| **Risk exposure** | Critical exposure alert when applicable |
| **Assessment dates** | Last assessed; next recommended assessment when scheduled |
| **Empty state** | Guidance when no assessment has been completed |

This section provides **context** — not operational task lists. Recommendations and projects belong in Immediate Focus and navigation modules.

---

# 10. Navigation

Assessment and client-management utilities are presented as **navigation tabs** below Technology Maturity Overview.

### 10.1 Standard navigation items

| Tab | Purpose |
| --- | ------- |
| Business Profile | Client business context per DOC-108 |
| Recommendations | Client recommendation register |
| Project Register | Client-filtered project list |
| Quarterly Review | QBR workflow |
| Progress Report | Client progress reporting |
| Improvement Plan | Technology Improvement Plan workflow |
| Improvement Dashboard | Client improvement analytics |
| Compare Assessments | Assessment comparison (when eligible) |
| Assessment History | Immutable assessment record list |

### 10.2 Navigation rules

| Rule | Specification |
| ---- | ------------- |
| **Secondary placement** | Navigation follows KPI and Immediate Focus — not above them |
| **No duplicate primary actions** | Navigation does not replace Assess Client or Portfolio New Client |
| **Role visibility** | Tabs respect DOC-122 role boundaries |

---

# 11. Design Principles

| Principle | Application |
| --------- | ----------- |
| **One question** | What deserves my immediate focus? |
| **Portfolio mirror** | Client Workspace is the client-level counterpart to Portfolio |
| **Calm and compact** | No hero banners, no assessment admin panels, no table density |
| **Backend intelligence** | Focus ranking, readiness, and projections are computed — not configured |
| **Cards before tables** | Immediate Focus uses scannable rows — not administrative grids |
| **Intelligent defaults** | Assessment type and naming are automatic |
| **Progressive disclosure** | Detail in recommendations, projects, assessments, and reports |

---

# 12. Role and Visibility

| Role | Client Workspace access |
| ---- | ----------------------- |
| **Consultant / Admin** | Full workspace with Assess Client and navigation |
| **Client** | Trimmed Technology Profile — recommendations and internal work hidden per DOC-122 |
| **Read Only** | Read-only profile data; no Assess Client |
| **Technician** | Not applicable — project-scoped access per DOC-127 |

---

# 13. Anti-Patterns

| Anti-pattern | Why it is excluded |
| ------------ | ------------------ |
| Large assessment management panels in header | Distracts from operational purpose; violates calm layout |
| Manual assessment type selector | Violates intelligent defaults (DOC-007) |
| Manual assessment naming before start | Adds friction without value |
| Multiple primary header actions | Violates one-purpose screen design |
| Project tables in Immediate Focus | Use scannable focus rows |
| Duplicating Dashboard KPI widgets | Dashboard is practice-level analytics (DOC-127) |

---

# 14. Acceptance Criteria

Before Client Workspace v1.0 is considered complete:

| # | Criterion |
| - | --------- |
| 1 | Page header shows client name, status badge, subtitle, and Assess Client only |
| 2 | No large Initial Assessment or Reassessment panels in the header region |
| 3 | Assess Client automatically creates initial or reassessment — no type picker |
| 4 | Assessment names are system-generated |
| 5 | KPI row displays StackScore, Projected, Open Projects, Critical Recs, and Immediate Focus count |
| 6 | Immediate Focus shows up to five ranked items with two-line compact rows |
| 7 | Focus rows navigate to project or recommendation detail — no inline action buttons |
| 8 | Technology Maturity Overview appears below Immediate Focus |
| 9 | Assessment History and Compare Assessments appear in navigation tabs |
| 10 | Portfolio card click opens Client Workspace at Immediate Focus |
| 11 | Page hierarchy matches Section 4 |
| 12 | Experience passes DOC-007 User Experience Acceptance Checklist |

---

# 15. Related Documents

* [DOC-000 – Documentation Architecture & Index](DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md)
* [DOC-006 – StackScore Product Constitution](DOC-006%20%E2%80%93%20StackScore%20Product%20Constitution.md)
* [DOC-007 – StackScore User Experience Constitution](DOC-007%20%E2%80%93%20StackScore%20User%20Experience%20Constitution.md)
* [DOC-109 – Assessment Design Specification](DOC-109%20%E2%80%93%20Assessment%20Design%20Specification.md)
* [DOC-113 – Technology Profile Specification](DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md)
* [DOC-119 – Technology Maturity Scoring Engine](DOC-119%20-%20Technology%20Maturity%20Scoring%20Engine.md)
* [DOC-127 – Dashboard Specification](DOC-127%20%E2%80%93%20Dashboard%20Specification.md)
* [DOC-160 – Portfolio Module Specification](DOC-160%20%E2%80%93%20Portfolio%20Module%20Specification.md)
* [DOC-162 – Portfolio Decision Engine](DOC-162%20%E2%80%93%20Portfolio%20Decision%20Engine.md)
* [DOC-163 – Immediate Focus Engine](DOC-163%20%E2%80%93%20Immediate%20Focus%20Engine.md)

---

# 16. Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-06-30 | BobKat IT | Initial Client Workspace specification — page hierarchy, compact header, Assess Client behavior, KPI dashboard, Immediate Focus, navigation, and design principles |
