# DOC-163 – Immediate Focus Engine

**Document ID:** DOC-163  
**Version:** 1.0  
**Status:** Approved  
**Owner:** BobKat IT  
**Last Updated:** June 30, 2026

---

#Intention

Immediate Focus is not a task manager.

Immediate Focus is the highest-value work surface for a single client.

The Immediate Focus Engine determines what deserves attention now — and presents it in a scannable, actionable form.

---

# 1. Purpose

DOC-163 defines how StackScore **determines and presents immediate focus** — the ranked work items and focus counts shown on Portfolio cards and in the Client Workspace.

The Immediate Focus Engine answers one question:

**What deserves my immediate focus?**

It specifies inputs, exclusions, selection rules, ranking, display requirements, and navigation. It does not define UI components or API contracts.

This document complements:

* [DOC-160 – Portfolio Module Specification](DOC-160%20%E2%80%93%20Portfolio%20Module%20Specification.md) — focus count on portfolio cards
* [DOC-161 – Client Workspace Specification](DOC-161%20%E2%80%93%20Client%20Workspace%20Specification.md) — focus list in Client Workspace

---

# 2. Objectives

| Objective | Specification |
| --------- | ------------- |
| **Surface highest-value work** | Show the top 3–5 items a consultant should act on now |
| **Reduce noise** | Exclude low-priority and duplicate items |
| **Enable fast scanning** | Two-line compact rows with consistent metadata |
| **Preserve context** | Each item shows pillar, impact, status, readiness, and source relationship |
| **Single count signal** | Portfolio cards and Client Workspace KPI share the same focus count logic |
| **Click to work** | Rows navigate to project or recommendation — not passive display |

---

# 3. Inputs

Immediate Focus decisions consume the following inputs per client.

| Input | Source | Used for |
| ----- | ------ | -------- |
| **Open recommendations** | Recommendation Service — open, accepted, in progress | Item candidates; critical/high counts |
| **Open projects** | Project Service — proposed, approved, scheduled, in progress | Item candidates |
| **Recommendation–project linkage** | Project and Recommendation join | Dedupe; readiness; navigation target |
| **Draft assessment** | Assessment Service | Focus count increment |
| **Reassessment overdue** | Technology Profile `nextRecommendedAssessmentAt` | Focus count increment |
| **Priority** | Recommendation and project records | Ranking weight |
| **Estimated impact points** | Recommendation and project records | Ranking weight |
| **Project status** | Project Service | Readiness label; inclusion rules |
| **Recommendation status** | Recommendation Service | Inclusion and display label |
| **Technology pillar** | Category / pillar mapping (DOC-150) | Metadata line |

Deferred recommendations are excluded from open recommendation inputs.

---

# 4. Exclusions

The following are **not** Immediate Focus items.

| Exclusion | Reason |
| --------- | ------ |
| **Completed or declined recommendations** | No open work |
| **Cancelled projects** | Not active improvement |
| **Low-priority recommendations without linked proposed project** | Below focus threshold — medium and low priority excluded unless project is proposed |
| **Recommendations linked to active in-flight projects** | Work already represented by project item — deduplicated |
| **Duplicate project + recommendation pair** | Single item represents the work |

### 4.1 Dedupe rule

When a recommendation has a linked project in an **active** status (approved, scheduled, in progress), the recommendation does not appear as a separate focus item. The project item represents the work.

When a linked project is **proposed**, both may surface — the recommendation shows **Blocked** readiness until the project is approved.

---

# 5. Selection Rules

### 5.1 Focus count (badge and KPI)

The Immediate Focus **count** increments for:

| Signal | Count |
| ------ | ----- |
| Draft assessment in progress | +1 |
| Reassessment overdue | +1 |
| Each open critical-priority recommendation | +1 |
| Each open high-priority recommendation | +1 |

The count appears on Portfolio cards and the Client Workspace KPI row. It represents **urgent signals** — not the number of displayed focus rows.

### 5.2 Focus item candidates — projects

A project is eligible when:

* Status is proposed, approved, scheduled, or in progress (open project), **and**
* At least one of: active status (approved/scheduled/in progress), critical/high priority, or proposed status

### 5.3 Focus item candidates — recommendations

A recommendation is eligible when:

* Status is open, accepted, or in progress, **and**
* Not deduplicated by an active linked project (Section 4.1), **and**
* At least one of: no linked project, linked project is proposed, or critical/high priority

Medium and low priority recommendations without a proposed project are excluded.

### 5.4 Item limit

After ranking, the engine returns the **top five** focus items maximum. Fewer items display when fewer qualify.

---

# 6. Ranking Considerations

Focus items receive a composite sort score. Higher score ranks first.

### 6.1 Priority weight

| Priority | Relative weight |
| -------- | --------------- |
| Critical | Highest |
| High | High |
| Medium | Medium |
| Low | Lowest |

### 6.2 Project status weight

| Status | Relative weight |
| ------ | --------------- |
| In progress | Highest |
| Scheduled | High |
| Approved | Medium |
| Proposed | Lower |

### 6.3 Impact points

Estimated impact points add to sort score — higher impact rises in the list.

### 6.4 Recommendation-only bonus

Recommendations without a linked project receive a small ranking bonus — unconverted recommendations surface slightly above equivalent project-only items.

### 6.5 Merge and slice

Project candidates and recommendation candidates are merged, sorted by composite score descending, and sliced to the item limit.

---

# 7. Display Requirements

### 7.1 Row layout

Each Immediate Focus item uses a two-line compact row.

| Line | Content |
| ---- | ------- |
| **Primary** | Concise title; priority badge |
| **Secondary** | Technology pillar · +score impact · status · readiness · source |

Example secondary line:

`Security Operations · +10 pts · Approved · Ready · From recommendation`

### 7.2 Title rules

| Rule | Specification |
| ---- | ------------- |
| **Concise titles** | Assessment question suffixes stripped from recommendation titles |
| **No duplicate title/description** | Title does not repeat as description text |
| **Truncate gracefully** | Long titles truncate on narrow viewports |

### 7.3 Metadata fields

| Field | Source |
| ----- | ------ |
| **Technology pillar** | Recommendation category / pillar mapping |
| **Score impact** | Estimated impact points when available |
| **Status** | Project status or recommendation status label |
| **Readiness** | Ready, Blocked, Awaiting approval, or formatted status |
| **Source** | From recommendation, Recommendation, or Project |

### 7.4 Readiness labels

| Condition | Readiness label |
| --------- | --------------- |
| Project in progress / approved / scheduled | Ready |
| Project proposed | Awaiting approval |
| Recommendation without project | Ready |
| Recommendation with proposed project | Blocked |

### 7.5 Visual hierarchy

| Element | Treatment |
| ------- | ----------- |
| **Title** | Strongest — primary scan target |
| **Priority badge** | Adjacent to title |
| **Metadata line** | Smaller, muted |
| **Arrow indicator** | Right edge — indicates navigability |

---

# 8. Navigation Behavior

| Item type | Click target |
| --------- | ------------ |
| **Project** | Project Register — client filter, selected project |
| **Recommendation with project** | Project Register — linked project |
| **Recommendation only** | Client Recommendations — selected recommendation scroll/highlight |

Rows are fully clickable. No inline action buttons (Improvement, View Results, Run Reassessment) appear on focus rows.

Portfolio entry and focus row navigation both target Client Workspace Immediate Focus anchor where applicable.

---

# 9. UX Principles

| Principle | Application |
| --------- | ----------- |
| **One question** | What deserves my immediate focus? |
| **Calm and compact** | Two-line rows; no table density |
| **Backend intelligence** | Ranking and count are computed — not user-configured |
| **Preserve meaning** | Priority, pillar, impact, status, readiness, and source always visible |
| **Click to work** | Rows navigate to operational destinations |
| **No duplicate noise** | Dedupe project-linked recommendations |

---

# 10. Acceptance Criteria

Before Immediate Focus Engine v1.0 is considered complete:

| # | Criterion |
| - | --------- |
| 1 | Focus count matches Section 5.1 rules on Portfolio cards and Client Workspace KPI |
| 2 | Focus list shows maximum five ranked items per Section 5.4 |
| 3 | Project-linked active recommendations are deduplicated per Section 4.1 |
| 4 | Medium/low recommendations without proposed projects are excluded per Section 5.3 |
| 5 | Row layout matches Section 7.1 — primary title + metadata line |
| 6 | Concise titles strip assessment question suffixes per Section 7.2 |
| 7 | Rows navigate per Section 8 — no inline operational buttons |
| 8 | Readiness labels match Section 7.4 |
| 9 | Portfolio card focus count equals Client Workspace focus count for the same client |
| 10 | Empty states guide baseline assessment or confirm no urgent items |

---

# 11. Related Documents

* [DOC-000 – Documentation Architecture & Index](../DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md)
* [DOC-006 – StackScore Product Constitution](../00-Governance/DOC-006%20%E2%80%93%20StackScore%20Product%20Constitution.md)
* [DOC-007 – StackScore User Experience Constitution](../00-Governance/DOC-007%20%E2%80%93%20StackScore%20User%20Experience%20Constitution.md)
* [DOC-113 – Technology Profile Specification](../20-Business-Logic/DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md)
* [DOC-119 – Technology Maturity Scoring Engine](../20-Business-Logic/DOC-119%20-%20Technology%20Maturity%20Scoring%20Engine.md)
* [DOC-150 – StackScore Technology Maturity Framework](../20-Business-Logic/DOC-150%20%E2%80%93%20StackScore%20Technology%20Maturity%20Framework.md)
* [DOC-152 – Decision Intelligence Engine](../20-Business-Logic/DOC-152%20-%20Decision%20Intelligence%20Engine%20Version.md)
* [DOC-160 – Portfolio Module Specification](DOC-160%20%E2%80%93%20Portfolio%20Module%20Specification.md)
* [DOC-161 – Client Workspace Specification](DOC-161%20%E2%80%93%20Client%20Workspace%20Specification.md)
* [DOC-162 – Portfolio Decision Engine](DOC-162%20%E2%80%93%20Portfolio%20Decision%20Engine.md)

---

# 12. Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-06-30 | BobKat IT | Initial Immediate Focus Engine specification — inputs, exclusions, selection, ranking, display, and navigation rules |
