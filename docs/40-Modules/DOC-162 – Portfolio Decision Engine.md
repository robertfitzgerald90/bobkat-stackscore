# DOC-162 – Portfolio Decision Engine

**Document ID:** DOC-162  
**Version:** 1.0  
**Status:** Approved  
**Owner:** BobKat IT  
**Last Updated:** June 30, 2026

---

#Intention

The Portfolio does not ask consultants to analyze their book of business.

The Portfolio presents conclusions.

The Portfolio Decision Engine is the backend intelligence that determines which clients deserve consultant attention and in what order.

---

# 1. Purpose

DOC-162 defines how StackScore **determines portfolio priority** — the readiness, ranking, and card signals that power the Portfolio module (DOC-160).

The Portfolio Decision Engine answers one question:

**Which client deserves my attention?**

It specifies decision inputs, readiness evaluation, card field semantics, sort modes, and recommended ranking philosophy. It does not define UI components or API contracts.

This document complements [DOC-160 – Portfolio Module Specification](DOC-160%20%E2%80%93%20Portfolio%20Module%20Specification.md) (experience) and [DOC-152 – Decision Intelligence Engine](../20-Business-Logic/DOC-152%20-%20Decision%20Intelligence%20Engine%20Version.md) (recommendation intelligence).

---

# 2. Portfolio Philosophy

| Principle | Specification |
| --------- | ------------- |
| **Conclusions, not calculations** | Cards show readiness, scores, and counts — not raw service payloads |
| **Backend intelligence** | Sort order and readiness are computed — not manually configured per card |
| **Calm density** | Enough signal to decide; never overwhelming |
| **Action-oriented ranking** | Higher-ranked clients are those where meaningful consultant work should happen now |
| **No duplicate models** | Portfolio consumes Technology Profile, Project, and Recommendation services — no parallel scoring |

The Portfolio Decision Engine shall **not**:

* Replace the Dashboard analytics surface (DOC-127)
* Expose CRM or financial decision logic
* Allow per-user card field configuration
* Override DOC-119 scoring rules

---

# 3. Decision Inputs

Portfolio decisions aggregate read-only inputs from existing domain services.

| Input | Source | Used for |
| ----- | ------ | -------- |
| **Current StackScore** | Technology Profile / completed assessment | Card score, maturity label, at-risk detection |
| **Projected StackScore** | Open recommendation projection (DOC-119, DOC-152) | Biggest Opportunity sort; improvement magnitude |
| **Score trend** | Client score history snapshots | Needs Attention signals; sparkline |
| **Open recommendations** | Recommendation Service | Critical count; readiness; focus count |
| **Open projects** | Project Service | Open project count; readiness; blocked detection |
| **Draft assessment** | Assessment Service | Readiness; Immediate Focus count |
| **Reassessment overdue** | Technology Profile `nextRecommendedAssessmentAt` | Readiness; Needs Attention; focus count |
| **Last assessment date** | Assessment Service | Recently Active sort; staleness weighting |
| **Last improvement activity** | Completed projects and recommendations | Recently Active and Recommended staleness |

All inputs respect role visibility per DOC-122.

---

# 4. Readiness States

Readiness communicates whether meaningful consultant work can proceed now for a client. Exactly one readiness badge is assigned per portfolio card.

| State | Label | Meaning |
| ----- | ----- | ------- |
| **Ready** | Ready | Actionable work is unblocked and should proceed |
| **Partial** | Partial | Some work is possible; other items are waiting |
| **Blocked** | Blocked | Meaningful progress cannot proceed without resolution |
| **Healthy** | Healthy | No urgent consultant action required |

### 4.1 Evaluation signals

| Signal | Classification |
| ------ | -------------- |
| Open recommendations or projects exist | Open work present |
| Active projects or actionable recommendations (no blocking project) | Actionable work |
| Proposed projects or recommendations blocked by proposed project status | Blocked work |
| Critical or high-priority open recommendations | Urgent work |
| Draft assessment in progress | Urgent work |
| Reassessment window overdue | Urgent work |

**Actionable project statuses:** approved, scheduled, in progress.  
**Blocked project status:** proposed (awaiting approval).

### 4.2 Precedence

When multiple signals apply, display the most actionable state:

**Blocked > Ready > Partial > Healthy**

### 4.3 Healthy vs Ready

| State | Distinction |
| ----- | ----------- |
| **Healthy** | Client is in good standing; urgent consultant attention is not required |
| **Ready** | Consultant should actively engage — work is available and unblocked |

A client may be healthy with open low-priority work. A client may be ready with moderate maturity but critical recommendations awaiting action.

---

# 5. Portfolio Card Fields

Each portfolio card is built from decision inputs. Field definitions align with DOC-160 §6.2.

| Field | Computation summary |
| ----- | ------------------- |
| **Client name** | Client record |
| **Current StackScore** | Latest Technology Profile overall score |
| **Projected StackScore** | Current score plus open recommendation projection cap per category |
| **Maturity status** | Profile maturity tier or score-derived label |
| **Trend sparkline** | Last 5–8 score history points |
| **Open projects** | Count of proposed, approved, scheduled, and in-progress projects |
| **Critical recommendations** | Count of open recommendations with critical priority |
| **Immediate Focus count** | Per DOC-163 — urgent focus signals for this client |
| **Readiness badge** | Readiness evaluation (Section 4) |
| **Last assessment date** | Most recent completed assessment date |
| **Recommended sort score** | Weighted ranking input for Recommended sort (Section 7) |

Cards present conclusions. Raw recommendation lists, project tables, and administrative controls do not appear on cards.

---

# 6. Sorting Methods

Portfolio supports five sort modes. **Recommended** is the default.

| Sort mode | Label | Behavior |
| --------- | ----- | -------- |
| **Recommended** | Recommended | Intelligent order from Portfolio Decision Engine (Section 7) |
| **Needs Attention** | Needs Attention | Readiness precedence (Blocked, Partial, Ready, Healthy); then critical recommendations; tie-break by name |
| **Biggest Opportunity** | Biggest Opportunity | Largest projected StackScore gap first; tie-break by name |
| **Recently Active** | Recently Active | Most recent assessment date first; tie-break by name |
| **Alphabetical** | A–Z | Client name ascending |

### 6.1 Sort rules

| Rule | Specification |
| ---- | ------------- |
| **Default** | Recommended on first visit |
| **Scope** | Sort applies within the user's visible client portfolio per DOC-122 |
| **Tie-breaking** | Secondary sort by client name ascending unless mode defines otherwise |
| **Client-side application** | Sort mode is applied to pre-built card data — ranking scores are precomputed |

---

# 7. Recommended Ranking Philosophy

The **Recommended** sort produces a single numeric priority score per client. Higher score = higher portfolio priority.

### 7.1 Weighted factors

| Factor | Rationale |
| ------ | --------- |
| **Readiness state** | Blocked clients surface before healthy clients |
| **Critical recommendations** | Urgent remediation rises to the top |
| **Projected improvement** | Larger StackScore opportunity increases priority |
| **Open projects** | Active improvement work signals engagement |
| **Assessment staleness** | Overdue reassessment increases priority |
| **Improvement staleness** | Long idle periods increase priority |

### 7.2 Readiness weights (informational)

| Readiness | Weight contribution |
| --------- | ------------------- |
| Blocked | Highest |
| Ready | High |
| Partial | Medium |
| Healthy | Low |

Exact numeric weighting is implementation detail — tuned to align with DOC-160 §8.2 until DOC-152 owns the full cross-portfolio algorithm.

### 7.3 Design intent

Recommended sort balances:

* **Urgency** — critical work and blocked states
* **Opportunity** — projected improvement magnitude
* **Recency** — stale assessments and idle improvement activity

The consultant should not configure these weights. The engine presents a sensible default order on every visit.

---

# 8. UX Principles

| Principle | Application |
| --------- | ----------- |
| **Five Second Rule** (DOC-007) | Each card answers six portfolio questions within five seconds |
| **Cards before tables** | Portfolio is a card grid — not an administrative client table |
| **Backend intelligence** | Readiness and sort are computed services |
| **One click deeper** | Card click opens Client Workspace Immediate Focus (DOC-161) |
| **Calm density** | Compact cards; no KPI clone of Dashboard |
| **Intelligent defaults** | Recommended sort requires no configuration |

---

# 9. Relationship to Dashboard

| Surface | Question | Decision engine role |
| ------- | -------- | -------------------- |
| **Portfolio** | Which client deserves my attention? | Full card building, readiness, and sort |
| **Dashboard** | How is my practice performing? | Aggregate KPIs and read-only client analytics — no operational ranking |

Portfolio and Dashboard consume similar underlying data but serve different purposes. Portfolio ranking does not appear on Dashboard.

---

# 10. Acceptance Criteria

Before Portfolio Decision Engine v1.0 is considered complete:

| # | Criterion |
| - | --------- |
| 1 | Each client card receives exactly one readiness badge per Section 4 |
| 2 | Readiness precedence follows Blocked > Ready > Partial > Healthy |
| 3 | All card fields in Section 5 are populated from domain services — no fabricated values |
| 4 | Immediate Focus count on cards matches DOC-163 count rules |
| 5 | All five sort modes function per Section 6 |
| 6 | Recommended sort uses weighted factors per Section 7 |
| 7 | Projected StackScore uses DOC-119 / DOC-152 projection rules |
| 8 | Portfolio does not duplicate Dashboard KPI widgets |
| 9 | Card click navigates to Client Workspace Immediate Focus |
| 10 | Role visibility redaction occurs at the service layer per DOC-122 |

---

# 11. Related Documents

* [DOC-000 – Documentation Architecture & Index](../DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md)
* [DOC-006 – StackScore Product Constitution](../00-Governance/DOC-006%20%E2%80%93%20StackScore%20Product%20Constitution.md)
* [DOC-007 – StackScore User Experience Constitution](../00-Governance/DOC-007%20%E2%80%93%20StackScore%20User%20Experience%20Constitution.md)
* [DOC-113 – Technology Profile Specification](../20-Business-Logic/DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md)
* [DOC-119 – Technology Maturity Scoring Engine](../20-Business-Logic/DOC-119%20-%20Technology%20Maturity%20Scoring%20Engine.md)
* [DOC-127 – Dashboard Specification](../30-Architecture/DOC-127%20%E2%80%93%20Dashboard%20Specification.md)
* [DOC-150 – StackScore Technology Maturity Framework](../20-Business-Logic/DOC-150%20%E2%80%93%20StackScore%20Technology%20Maturity%20Framework.md)
* [DOC-152 – Decision Intelligence Engine](../20-Business-Logic/DOC-152%20-%20Decision%20Intelligence%20Engine%20Version.md)
* [DOC-160 – Portfolio Module Specification](DOC-160%20%E2%80%93%20Portfolio%20Module%20Specification.md)
* [DOC-161 – Client Workspace Specification](DOC-161%20%E2%80%93%20Client%20Workspace%20Specification.md)
* [DOC-163 – Immediate Focus Engine](DOC-163%20%E2%80%93%20Immediate%20Focus%20Engine.md)

---

# 12. Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-06-30 | BobKat IT | Initial Portfolio Decision Engine specification — decision inputs, readiness states, card fields, sort modes, and recommended ranking philosophy |
