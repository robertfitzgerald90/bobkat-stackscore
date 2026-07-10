# DOC-007 – StackScore User Experience Constitution

**Document Owner:** Bobkat IT  
**Product:** StackScore  
**Status:** Approved  
**Version:** 1.0

---

# Purpose

The StackScore User Experience Constitution defines how every screen, workflow, dashboard, report, and interaction should feel to the user.

While the Product Constitution (DOC-006) defines what StackScore is, this document defines how StackScore should be experienced.

The objective is not simply to build functional software.

The objective is to build software that helps consultants make better decisions with less effort.

Every design decision should reinforce:

- Clarity
- Confidence
- Simplicity
- Consistency
- Focus

StackScore should feel calm, intentional, and intelligent.

---

# Core Principle

## Reduce Complexity While Increasing Capability

Every enhancement should make StackScore more capable without making it more difficult to use.

As functionality increases, cognitive load should decrease.

Users should spend their time making decisions—not figuring out how the software works.

---

# Principle 1 — Backend Intelligence, Frontend Simplicity

Business intelligence belongs in the backend.

User understanding belongs in the frontend.

The backend may perform:

- Weighted scoring
- Decision engine calculations
- Recommendation prioritization
- Dependency evaluation
- Trend analysis
- Capacity calculations
- Readiness determination
- Historical comparisons
- Business impact calculations

The frontend should present only meaningful conclusions.

Examples include:

- Immediate Focus
- Ready
- Blocked
- Improving
- Declining
- High Priority
- Projected Improvement

The user should rarely need to interpret raw data.

The software should do the thinking.

---

# Principle 2 — Every Screen Has One Purpose

Every screen must answer a single primary question.

Examples:

## Portfolio

**Which client deserves my attention?**

---

## Client Workspace

**What deserves my immediate focus?**

---

## Project Register

**How do I manage implementation work?**

---

## Dashboard

**How is my consulting practice performing?**

---

## Reports

**How do I communicate value?**

---

If a screen begins answering multiple unrelated questions, redesign the experience.

---

# Principle 3 — Five Second Rule

A user should understand the purpose of any screen within five seconds.

The highest-value information should always be visible immediately.

If a screen requires explanation, it is too complicated.

---

# Principle 4 — Progressive Disclosure

Do not show everything.

Reveal information in logical layers.

Recommended flow:

Summary

↓

Key Metrics

↓

Immediate Focus

↓

Actions

↓

Details

↓

History

Users should drill deeper only when they choose.

---

# Principle 5 — Dashboard First

Every major module should begin with a dashboard or workspace.

Dashboards provide situational awareness.

Details remain one click away.

Avoid beginning workflows with large administrative tables.

---

# Principle 6 — KPI Driven Design

Important information should be represented through concise KPI cards.

Examples:

- Technology Maturity
- Open Projects
- Critical Findings
- Immediate Focus
- Recommendation Count
- Projected Improvement

KPIs should answer business questions—not simply display numbers.

---

# Principle 7 — Trends Over Snapshots

Numbers without context provide limited value.

Whenever practical, include trend indicators.

Preferred trend visuals:

- Sparklines
- Direction arrows
- Trend badges
- Projected improvement

A user should immediately understand whether a metric is improving or declining.

Examples:

Technology Maturity

71

▁▂▄▅▆

Critical Findings

8

▇▆▅▃▂

The sparkline should communicate the story before the user reads supporting text.

---

# Principle 8 — Color Communicates Status

Color exists to communicate meaning.

Never use color purely for decoration.

Recommended meanings:

🟢 Healthy / Ready

🟡 Attention Required

🟠 High Priority

🔴 Critical

🔵 Informational

Color should reinforce information—not replace it.

---

# Principle 9 — Cards Before Tables

Cards communicate understanding.

Tables communicate administration.

Use cards for:

- Dashboards
- Portfolio
- Client summaries
- Technology Maturity
- KPIs

Use tables for:

- Project Register
- Recommendation management
- Administrative tasks
- Searching
- Bulk updates

---

# Principle 10 — One Click Deeper

Every summary should naturally lead to additional detail.

Example navigation:

Portfolio

↓

Client Workspace

↓

Immediate Focus

↓

Project

↓

Deliverables

↓

History

Users should never wonder where to click next.

---

# Principle 11 — Immediate Focus

StackScore should continuously answer:

**What deserves my attention next?**

Do not overwhelm users with every possible task.

Surface only the highest-value work.

Users should rarely need to manually prioritize projects.

The system should intelligently surface the next logical work based upon:

- Technology maturity
- Business impact
- Risk
- Dependencies
- Readiness
- Consultant workflow

---

# Principle 12 — Single Pane of Glass

StackScore should become the operational console for Bobkat IT.

The consultant should rarely need to leave the application to determine:

- Client health
- Technology maturity
- Recommendations
- Projects
- Immediate focus
- Business progress
- Reports

Specialized systems remain responsible for specialized work.

Examples:

- NinjaOne
- Microsoft 365
- UniFi

StackScore coordinates those systems.

---

# Principle 13 — Consistency Builds Confidence

Every major page should follow a familiar structure.

Recommended page layout:

1. Page Header

2. KPI Dashboard

3. Immediate Focus

4. Primary Content

5. Supporting Information

6. History

Consistency reduces cognitive load.

---

# Principle 14 — Reports Tell Stories

Reports should communicate a narrative.

Every report should answer:

Where are we today?

↓

Why does it matter?

↓

What should happen next?

↓

What progress has been made?

The objective is communication—not data export.

---

# Principle 15 — Every Click Creates Value

Users should never navigate simply to locate information.

Every click should answer a more detailed question.

Navigation should feel predictable and purposeful.

---

# Principle 16 — The Consultant Comes First

StackScore is designed around the workflow of a technology consultant.

Every experience should support the natural consulting process.

Portfolio

↓

Client Workspace

↓

Technology Maturity

↓

Immediate Focus

↓

Project Register

↓

Project Object

↓

Reports

↓

Reassessment

Technology exists to support this workflow—not replace it.

---

# Principle 17 — Operational Simplicity

Operational screens should remain calm and focused.

The Portfolio should answer only three questions:

- Which client deserves my attention?
- How healthy is that client?
- Can meaningful work be completed now?

The Client Workspace should answer:

- What deserves my immediate focus?

The Dashboard should answer:

- How is the business performing overall?

Avoid combining operational and executive information on the same screen.

---

# Principle 18 — Intelligent Defaults

Users should rarely configure the software before using it.

Whenever possible, StackScore should intelligently determine:

- Recommended client order
- Immediate Focus
- Visit readiness
- Priority
- Recommendation order
- Dashboard summaries

Configuration should be optional—not required.

---

# User Experience Acceptance Checklist

Before implementing any new interface, answer the following questions.

1. Does this reduce cognitive load?

2. Does it simplify decision making?

3. Does it surface the next best action?

4. Does it follow the Five Second Rule?

5. Does it hide unnecessary backend complexity?

6. Does it follow the standard page structure?

7. Does it use progressive disclosure?

8. Does it improve consistency?

9. Would a first-time user immediately understand its purpose?

10. Does it make StackScore feel calmer rather than busier?

If the answer is mostly yes, proceed.

If the answer is mostly no, redesign.

---

# Cursor Development Guidance

When designing or refactoring StackScore interfaces:

- Prioritize clarity over density.
- Prefer backend intelligence over frontend complexity.
- Prefer dashboards over raw tables.
- Prefer trends over isolated metrics.
- Prefer cards over administrative grids.
- Prefer recommendations over manual prioritization.
- Prefer intelligent defaults over excessive configuration.

Every interface should help the user answer four questions:

- Which client deserves my attention?
- What deserves my immediate focus?
- Why does it matter?
- What business value will this create?

If a design does not improve one of those answers, reconsider the implementation.

---

# Closing Statement

StackScore should feel less like traditional business software and more like an operating console.

The application should quietly perform complex analysis behind the scenes while presenting clear, focused, and actionable information.

Power should come from intelligent design—not visual complexity.

The ultimate measure of success is not how much information StackScore can display.

It is how quickly a consultant can understand a situation, make a confident decision, and create measurable business value.