# DOC-201 – Client Workspace Framework

**Document Owner:** Bobkat IT  
**Product:** StackScore  
**Status:** Draft  
**Version:** 1.0

---

# Purpose

The Client Workspace is the operational center of every client engagement within StackScore.

Once a consultant enters a Client Workspace, the surrounding consulting firm becomes secondary.

The Client Workspace should become the single source of truth for understanding, planning, implementing, measuring, and continuously improving an organization's technology.

Every major interaction with a client should occur from within the Client Workspace.

---

# Vision

The Client Workspace is not a dashboard.

It is the operational headquarters of the client's Technology Program.

Every page, report, project, recommendation, document, and assessment should contribute toward telling the story of the client's technology journey.

The consultant should never need to search multiple areas of the application to understand the client's current state.

---

# Primary Questions

The Client Workspace should continuously answer three executive questions.

## Where are we today?

Current technology health.

Current risks.

Current Technology Program status.

Current investment.

Current priorities.

---

## What have we accomplished?

Technology Journey.

Completed Projects.

Business Outcomes.

Technology Improvements.

Investment Delivered.

Risk Reduction.

---

## What happens next?

Technology Roadmap.

Upcoming Projects.

Immediate Focus.

Strategic Initiatives.

Future Investments.

---

# Design Philosophy

The Client Workspace should feel calm.

It should reduce cognitive load.

It should emphasize strategic decision making rather than operational administration.

Technology should be presented as an ongoing business investment rather than isolated technical work.

---

# Navigation Structure

Every Client Workspace should provide the following primary navigation.

```
Overview ⭐

Technology Journey

Roadmap

Projects

Assessments

Recommendations

Assets

Documents

Contacts

Billing

Executive Reports

Risks

Activity
```

Future modules should integrate into this structure rather than introducing additional top-level navigation.

**Immediate Focus** is an Overview component (DOC-161 / DOC-163) — not a separate top-level nav item.

**Relationship to DOC-161:** DOC-161 governs the current operational Client Workspace (KPIs, Immediate Focus, Assess Client). DOC-201 is the long-term navigation and module framework. Phase 1 (DEV-002): shell/nav from DOC-201; Overview minimum content from DOC-161.

Canonical vocabulary: [DOC-200 § Canonical Glossary](DOC-200%20%E2%80%93%20Client%20Lifecycle%20Architecture.md#canonical-glossary).

---

# Overview

Purpose

Provide a complete executive snapshot of the client's Technology Program.

The Overview should answer:

"What is the current state of this client's technology?"

The Overview should prioritize:

- Technology Health
- Business Progress
- Current Initiative
- Investment Status
- Immediate Focus

rather than administrative actions.

Above-the-fold minimum (DOC-161): client header, KPI row, Immediate Focus list.

---

# Technology Journey

Purpose

Provide a visual history of organizational technology transformation.

The Technology Journey records:

- Assessments
- Completed Projects
- Business Outcomes
- Technology Improvements
- Investment Milestones
- Strategic Achievements

The Technology Journey should tell the story of the client's partnership with Bobkat IT.

---

# Roadmap

Purpose

Organize Projects into strategic implementation phases.

The Roadmap represents the client's Technology Investment Portfolio.

Projects—not Recommendations—are scheduled within the Roadmap.

Roadmap phases should remain flexible.

Possible structures include:

- Phase 1–4
- Quarterly
- Annual
- Strategic Initiatives

The Roadmap should clearly communicate:

- Current Phase
- Future Investments
- Expected Technology Improvements
- Business Objectives

---

# Projects

Purpose

Projects represent the primary unit of value delivery.

Projects should focus on:

- Business Objectives
- Technology Outcomes
- Deliverables
- Reporting
- Financial Investment
- Success Metrics

Projects group multiple Recommendations into meaningful consulting engagements.

---

# Assessments

Purpose

Measure technology maturity.

Generate Recommendations.

Track historical progress.

Assessments measure progress.

They do not define the client relationship.

---

# Recommendations

Purpose

Identify technology improvement opportunities.

Recommendations answer:

"What should be improved?"

Recommendations remain diagnostic until incorporated into a Project.

Recommendations should support Projects rather than dominate the client experience.

---

# Assets

Purpose

Maintain operational awareness.

Examples:

- Servers
- Workstations
- Network Equipment
- Cloud Services
- Critical Applications

Assets should connect naturally to Projects and Technology Journey milestones.

---

# Documents

Purpose

Provide permanent client documentation.

Examples:

- Network Diagrams
- Disaster Recovery Plans
- Standard Operating Procedures
- Policies
- Executive Reports
- Deliverables
- Contracts
- Technical Documentation

The Client Workspace should become the authoritative repository for all client documentation.

---

# Contacts

Purpose

Manage organizational relationships.

Includes:

- Primary Contacts
- Decision Makers
- Executive Sponsors
- Technical Contacts
- Vendors
- Emergency Contacts

Relationships should support consulting rather than CRM functionality.

---

# Billing

Purpose

Provide investment transparency.

Examples:

- Active Agreements
- Project Investment
- Licensing
- Recurring Services
- Budget Tracking

Billing should reinforce technology as a strategic investment.

---

# Executive Reports

Purpose

Provide executive-ready reporting.

Reports should focus on:

- Technology Progress
- Business Outcomes
- Investment
- Risk Reduction
- Technology Journey
- Roadmap Progress

Reports should require minimal explanation during executive meetings.

---

# Risks

Purpose

Provide continuous visibility into organizational technology risk.

Risks should evolve throughout the Technology Journey.

Examples:

- Cybersecurity
- Business Continuity
- Infrastructure
- Compliance
- Operational Risk

Risk reporting should emphasize trends rather than isolated findings.

---

# Activity

Purpose

Provide an auditable history of the client's Technology Program.

Examples:

- Assessments
- Projects
- Documentation
- Meetings
- Recommendations
- Reports
- Consultant Activity

Activity should reinforce transparency.

---

# Information Hierarchy

Every page within the Client Workspace should follow the same hierarchy.

Business Context

↓

Technology Context

↓

Implementation

↓

Supporting Information

This hierarchy should remain consistent across all modules.

---

# User Experience Principles

The Client Workspace should:

- Minimize navigation.
- Surface meaningful information first.
- Hide implementation complexity.
- Encourage executive conversations.
- Support consultants during meetings.
- Reward exploration through progressively richer information.

Every screen should contribute to the client's Technology Journey.

---

# Success Criteria

The Client Workspace succeeds when:

- Consultants immediately understand the client's current state.
- Executives immediately understand business progress.
- Projects feel connected to long-term strategy.
- Reports require minimal explanation.
- Every module reinforces the Technology Program.

---

# Future Vision

The Client Workspace should eventually become the digital representation of the client's complete technology partnership.

Opening the Client Workspace should feel similar to opening a modern ERP or financial platform.

The consultant should immediately understand:

- Current Health
- Progress
- Investments
- Risks
- Opportunities
- Next Actions

without searching throughout the application.

---

# Related Documents

* [DOC-200 – Client Lifecycle Architecture](DOC-200%20%E2%80%93%20Client%20Lifecycle%20Architecture.md)
* [DOC-161 – Client Workspace Specification](DOC-161%20%E2%80%93%20Client%20Workspace%20Specification.md)
* [DOC-163 – Immediate Focus Engine](DOC-163%20%E2%80%93%20Immediate%20Focus%20Engine.md)
* [DOC-202 – Technology Journey Framework](DOC-202%20%E2%80%93%20Technology%20Journey%20Framework.md)
* [DOC-203 – Project Definition Framework](DOC-203%20-%20Project%20Definition%20Framework.md)
* [DOC-204 – Technology Investment Roadmap Framework](DOC-204%20%E2%80%93%20Technology%20Investment%20Roadmap%20Framework.md)
* [DOC-205 – Planning Workshop & Strategic Prioritization Engine](DOC-205%20%E2%80%93%20Planning%20Workshop%20%26%20Strategic%20Prioritization%20Engine.md)
* [DOC-206 – Executive Business Review Framework](DOC-206%20%E2%80%93%20Executive%20Business%20Review%20Framework.md)
* [DOC-120A – Next Generation Domain Model Addendum](DOC-120A%20%E2%80%93%20Next%20Generation%20Domain%20Model%20Addendum.md)
* [DEV-002 – Next Generation Migration Plan](DEV-002%20%E2%80%93%20Next%20Generation%20Migration%20Plan.md)

---

# Cursor Development Guidance

The Client Workspace is the operational center of StackScore.

Future development should strengthen the Client Workspace rather than introduce competing navigation paths.

All major client functionality should naturally connect through the Client Workspace.

The consultant should always feel they are managing a Technology Program—not navigating disconnected software modules.

The Client Workspace should make technology management feel like portfolio management.

Organizations should understand their technology in the same way they understand financial investments—through measurable progress, strategic planning, phased execution, and continuous improvement.