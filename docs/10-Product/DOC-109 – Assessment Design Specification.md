# DOC-109 – Assessment Design Specification

**Document ID:** DOC-109
**Version:** 2.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 30, 2026

---

# 1. Purpose

DOC-109 defines the **consultant experience** of conducting a StackScore **Technology Maturity Assessment**.

This document does **not** define the scoring engine, question bank, or recommendation rules. Those concerns belong to DOC-111, DOC-112, DOC-114, and related assessment library specifications.

Instead, DOC-109 defines:

* **How** an assessment should be conducted in the field
* **What** information should be collected and in what order
* **How** the application should support the consultant during the assessment
* **Why** the assessment experience is designed the way it is

The assessment is the **foundation of StackScore**. Every recommendation, maturity score, Technology Improvement Plan, roadmap, report, and project originates from assessment data.

> **Good data in produces good recommendations out.**

When consultants capture accurate, contextual responses — supported by thoughtful notes and evidence where appropriate — the platform can produce trustworthy maturity scores and business-outcome-focused recommendations. When assessment data is rushed, assumed, or incomplete, every downstream artifact suffers.

This document guides **future software development** and **consultant best practices**. Implementation must align with DOC-006 (Product Constitution), DOC-150 (Technology Maturity Framework), and DOC-129 (Engineering Constitution).

---

# 2. Assessment Philosophy

A StackScore Technology Maturity Assessment should feel like a **professional business conversation** — not an audit, compliance checklist, or technical interrogation.

The consultant's primary job is to **understand the client's business** while naturally collecting the information required to evaluate technology maturity. Questions should open dialogue, not close it.

## Guiding beliefs

* **Business context first** — technology is always discussed in terms of business outcomes, risk, and operational impact.
* **Conversation over checkbox** — the assessment supports discovery; it does not replace the consultant's judgment.
* **Clarity over completeness theater** — a well-understood partial answer with notes is better than a guessed Yes/No.
* **Respect for the client's time** — progressive disclosure and one-question-at-a-time pacing reduce fatigue.
* **Repeatability** — assessments should be conductable again later to measure progress, not treated as one-time events.

The consultant should leave the client feeling that StackScore helped them **see their technology clearly** — not that they were graded on a test they did not understand.

---

# 3. Technology Maturity Framework

The assessment is organized into **eight Technology Pillars** defined in [DOC-150 – StackScore Technology Maturity Framework](../20-Business-Logic/DOC-150%20%E2%80%93%20StackScore%20Technology%20Maturity%20Framework.md).

| # | Technology Pillar |
| - | ----------------- |
| 1 | Identity & Access |
| 2 | Endpoint Management |
| 3 | Network & Connectivity |
| 4 | Data Protection & Recovery |
| 5 | Productivity & Collaboration |
| 6 | Security Operations |
| 7 | Documentation & Knowledge |
| 8 | Technology Strategy |

Each pillar begins with a **Business Question**. The Business Question frames the discussion **before** individual assessment questions begin. It answers *why* the pillar matters to the business and orients both consultant and client before technical detail is explored.

| Technology Pillar | Business Question |
| ----------------- | ----------------- |
| **Identity & Access** | Can we trust that only the right people have access to our systems and data? |
| **Endpoint Management** | Are company devices secure, standardized, and consistently managed? |
| **Network & Connectivity** | Is the network secure, reliable, and built to support business operations? |
| **Data Protection & Recovery** | Could the business recover from data loss, ransomware, or a major outage? |
| **Productivity & Collaboration** | Does technology enable employees to work efficiently and securely? |
| **Security Operations** | Can the business detect, respond to, and reduce security risks? |
| **Documentation & Knowledge** | Could another trusted IT professional successfully support this environment tomorrow? |
| **Technology Strategy** | Is technology helping the business grow while reducing long-term risk? |

Assessment questions, notes, evidence, pillar scores, and recommendations must trace to one or more Technology Pillars. Pillar naming and business questions in the application must remain consistent with DOC-150.

---

# 4. Assessment Workflow

The end-to-end assessment flow proceeds in the following order:

```text
Business Profile
        ↓
Technology Pillar
        ↓
Business Question
        ↓
Assessment Questions
        ↓
Consultant Notes
        ↓
Evidence (optional)
        ↓
Pillar Score
        ↓
Recommendations
        ↓
Technology Maturity Profile
```

## Stage descriptions

| Stage | Purpose |
| ----- | ------- |
| **Business Profile** | Capture essential business context (industry, goals, priorities) before technology evaluation begins. See [DOC-108 – Business Profile Specification](DOC-108%20%E2%80%93%20Business%20Profile%20Specification.md). |
| **Technology Pillar** | Select or advance through one of the eight pillars; each pillar is a bounded unit of evaluation. |
| **Business Question** | Display the pillar's business question to frame the conversation before questions appear. |
| **Assessment Questions** | Collect structured responses one at a time within the pillar. |
| **Consultant Notes** | Capture context, clarifications, and client quotes that structured answers alone cannot express. |
| **Evidence (optional)** | Record how the answer was determined — interview, observation, documentation review, or technical validation. |
| **Pillar Score** | Computed maturity result for the pillar after questions in that pillar are complete (scoring rules per DOC-111). |
| **Recommendations** | Generated improvement opportunities derived from responses (rules per DOC-112). |
| **Technology Maturity Profile** | Consolidated executive view of overall StackScore and pillar maturity across the client engagement. See DOC-113. |

The Business Profile may be completed or refreshed before the first pillar begins. It is not repeated for every pillar unless business context has changed.

Assessment completion updates the client's **Technology Maturity Profile** and triggers scoring, recommendation generation, and downstream planning workflows per DOC-123.

---

# 5. Assessment Experience

The application must support a focused, resumable consultant workflow.

## Required behaviors

| Behavior | Requirement |
| -------- | ----------- |
| **One pillar at a time** | The interface presents a single Technology Pillar as the active context. Pillars may be navigated in a defined order; the consultant should not be overwhelmed by all pillars simultaneously during question capture. |
| **One question at a time** | Within a pillar, only one assessment question is primary on screen at a time. |
| **Progress within the pillar** | Show position within the current pillar (e.g., question 4 of 12) so the consultant and client understand remaining scope. |
| **Backward and forward navigation** | Allow the consultant to review and revise prior responses within the active assessment without losing data. |
| **Auto-save responses** | Every answer, note, and evidence selection persists automatically — no manual save required for routine progress. |
| **Resume later** | Incomplete assessments remain in progress; the consultant can exit and return without restarting. |

## Completion and review

After all pillars are addressed (or per product rules for partial completion), the consultant reviews results before finalizing. Executive summary and presentation-oriented views are separate from the capture experience and are governed by DOC-113 and reporting specifications.

---

# 6. Response Types

## Primary answer values

Every assessment question supports one of the following structured responses:

| Answer | Meaning |
| ------ | ------- |
| **Yes** | The capability or control is in place and meets the intent of the question. |
| **Partially** | Some elements exist but gaps remain; improvement is warranted. |
| **No** | The capability or control is absent or materially deficient. |
| **Not Applicable** | The question does not apply to this client's environment; use sparingly and document why in notes. |

Partial and Not Applicable responses should trigger consultant notes when context is non-obvious.

## Consultant Notes

**Optional Consultant Notes** are available for **every** question.

Notes capture:

* Client explanations in their own words
* Exceptions, compensating controls, or timeline context
* Follow-up items or verification needed later
* Clarification when the structured answer alone would mislead downstream scoring

Notes are **consultant-facing** by default. Client-visible report content must not expose raw internal notes without explicit product rules per DOC-122 and DOC-125.

## Evidence (optional)

Consultants may record **how** an answer was determined using one of the following evidence types:

| Evidence Type | When to use |
| ------------- | ----------- |
| **Interview** | Answer based on conversation with client stakeholder |
| **Observation** | Answer based on direct review during site visit or screen share |
| **Documentation** | Answer based on policies, diagrams, runbooks, or vendor reports |
| **Technical Validation** | Answer based on tool output, configuration review, or hands-on verification |

Evidence is optional for v2.0 design. Its presence improves auditability and reassessment quality but must not block assessment completion when unavailable.

---

# 7. Consultant Guidance

The consultant is the quality gate for assessment data. The application supports the workflow; the consultant ensures the data is trustworthy.

## The consultant should

* **Ask conversational questions** — read the assessment prompt as a starting point, then adapt language to the client's industry and maturity.
* **Avoid unnecessary technical jargon** — translate controls into business risk and operational impact.
* **Clarify responses when needed** — if an answer is ambiguous, ask a follow-up before recording Yes or No.
* **Record important context** — use notes for anything that would change how a recommendation should be interpreted.
* **Avoid making assumptions** — when uncertain, choose Partially or defer with a note rather than guessing.
* **Focus on business outcomes** — tie each pillar back to the Business Question and the client's stated goals from the Business Profile.

## The consultant should not

* Rush through pillars to finish quickly at the expense of accuracy
* Treat Not Applicable as a shortcut to skip uncomfortable topics
* Record answers without stakeholder input when the question requires client knowledge
* Present the assessment as a pass/fail audit — it is a maturity conversation

---

# 8. Assessment Design Principles

These principles govern assessment **experience design** and **consultant practice**. They apply to every pillar, question presentation, and future enhancement.

| Principle | Description |
| --------- | ----------- |
| **Vendor agnostic** | Questions and guidance evaluate capabilities and outcomes, not product brands. |
| **Business outcome focused** | Every interaction should connect to risk, reliability, productivity, or growth — not checklist compliance alone. |
| **Progressive disclosure** | Reveal one pillar and one question at a time; avoid dumping the full assessment on screen. |
| **One question at a time** | Minimize parallel decisions; the consultant focuses on the current question. |
| **Minimize cognitive load** | Simple layouts, clear labels, obvious navigation, and visible save status. |
| **Encourage discussion** | Business Questions and notes fields invite conversation rather than silent form-filling. |
| **Support repeat assessments** | Design for reassessment, comparison, and trend visibility over time. |
| **Consistent terminology** | Use Technology Pillar, Business Question, StackScore, and Technology Maturity Profile per DOC-150 and DOC-006. |
| **Explain "why this matters"** | Each question or pillar context should help the consultant articulate business impact when needed. |

---

# 9. User Experience Principles

Each active Technology Pillar screen should present the following elements clearly:

| Element | Purpose |
| ------- | ------- |
| **Business Question** | Anchor the pillar in business language before technical questions |
| **Progress** | Show position within the pillar and overall assessment completion |
| **Current Question** | Single primary question with response controls |
| **Optional Notes** | Always available, never required unless product rules dictate |
| **Navigation** | Back, forward, and pillar-level movement without data loss |
| **Save Status** | Visible confirmation that responses are persisted (auto-save) |

## Experience tone

The interface should feel **calm**, **focused**, and **intentional**.

* No cluttered dashboards during question capture
* No alarming compliance-style language during data entry
* Clear typography and spacing per DOC-005 UI & UX Standards
* Consultant-first layout — optimized for laptop or tablet use during client meetings

Assessment capture UX is distinct from **results**, **reports**, and **Technology Maturity Profile** presentation. Capture is quiet and sequential; results are analytical and shareable.

---

# 10. Future Enhancements

The following ideas are **documented for future consideration only**. They are **not** in scope for the current implementation and must not be built without a revised DOC-109 and registration in DOC-000.

| Enhancement | Description |
| ----------- | ----------- |
| **AI-assisted note summarization** | Condense lengthy consultant notes into executive-ready context |
| **Suggested follow-up questions** | Context-aware prompts when Partially or ambiguous answers are recorded |
| **Evidence attachments** | Upload files linked to specific question responses |
| **Photo uploads** | Capture rack, firewall label, or whiteboard photos as evidence |
| **Voice dictation** | Hands-free note capture during site visits |
| **Assessment templates** | Pre-configured question sets for industry or engagement type |
| **Industry-specific question sets** | Tailored libraries per vertical without breaking pillar structure |

Future enhancements must preserve vendor agnosticism, business-outcome focus, and consultant-first design per DOC-006.

---

# 11. Related Documents

| ID | Title | Relationship |
| -- | ----- | ------------ |
| [DOC-006](../00-Governance/DOC-006%20%E2%80%93%20StackScore%20Product%20Constitution.md) | StackScore Product Constitution | Governing product principles for consultant-first, low-cognitive-load UX |
| [DOC-110](../20-Business-Logic/DOC-110%20-%20StackScore%20Assessment%20Framework.md) | StackScore Assessment Framework | Legacy category framework; pillar model superseded by DOC-150 |
| [DOC-111](../20-Business-Logic/DOC-111%20%E2%80%93%20Scoring%20Engine%20Specific.md) | Scoring Engine Specification | Defines how responses become pillar scores and StackScore |
| [DOC-150](../20-Business-Logic/DOC-150%20%E2%80%93%20StackScore%20Technology%20Maturity%20Framework.md) | StackScore Technology Maturity Framework | Authoritative eight-pillar model and business questions |
| DOC-151 | *(planned)* | Assessment experience companion specifications |
| DOC-152 | *(planned)* | Assessment content and question design standards |
| [DOC-129](../30-Architecture/DOC-129%20%E2%80%93%20AI%20Development%20Rules%20&%20Engineering%20Constitution.md) | AI Development Rules & Engineering Constitution | Engineering governance for implementation |

### Additional references

* [DOC-108 – Business Profile Specification](DOC-108%20%E2%80%93%20Business%20Profile%20Specification.md) — pre-assessment business context
* [DOC-112 – Recommendation Engine Specification](../20-Business-Logic/DOC-112%20%E2%80%93%20Recommendation%20Engine%20Specification.md) — recommendation generation from assessment data
* [DOC-113 – Technology Profile Specification](../20-Business-Logic/DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md) — Technology Maturity Profile presentation
* [DOC-114 – Assessment Library Specification](../20-Business-Logic/DOC-114%20%E2%80%93%20Assessment%20Library%20Specification.md) — question bank meta-standard
* [DOC-123 – Application Workflow Specification](../30-Architecture/DOC-123%20%E2%80%93%20Application%20Workflow%20Specification.md) — assessment lifecycle in the application
* [DOC-005 – UI & UX Standards](../00-Governance/DOC-005%20%E2%80%93%20UI%20&%20UX%20Standards.md) — visual and interaction standards

---

# Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 2.0 | 2026-06-30 | BobKat IT | Initial v2.0 specification — consultant experience, Technology Pillar workflow, response types, UX principles, and future enhancements aligned with DOC-150 |
