# DOC-310 – Commercial Platform Architecture

**Status:** Authoritative for Phase 6 commercial / BI composition  
**Audience:** Engineers extending StackScore as Bobkat IT’s operating platform

---

## 1. Purpose

StackScore is the connected operating system for Bobkat IT consulting. Assessments, roadmaps, proposals, implementation, managed services, QBRs, renewals, and analytics share one client record and feed each other through modular engines.

This document describes:

- Engine responsibilities
- Customer lifecycle data flow
- Commercial intelligence composition
- Notification and automation extension points
- Integration readiness principles

---

## 2. Engine responsibilities

| Engine | Location | Responsibility |
| ------ | -------- | -------------- |
| Assessment Engine | `src/lib/assessments/`, scoring packages | Capture maturity answers, score pillars, preserve history |
| Recommendation Engine | assessment completion + templates | Produce prioritized recommendations |
| Technology Roadmap Engine | `src/lib/technology-improvement-plan/roadmap-engine/`, `src/lib/client-roadmap/` | Phase planning + living execution roadmap |
| Proposal Engine | `src/lib/phase-proposals/` | Phase-scoped commercial proposals + versioning |
| Reporting Engine | `src/lib/reports/`, `src/lib/qbr/`, `src/lib/pdf/` | Executive narratives and PDF output |
| Lifecycle Engine | `src/lib/technology-lifecycle/` | Health, budget, refresh, opportunities |
| Notification Engine | `src/lib/notifications/` | Actionable in-app operational signals |
| Analytics / Commercial Intelligence | `src/lib/commercial-intelligence/` | Funnel, forecasts, BI KPIs, Customer 360 |
| Automation Catalog | `src/lib/automation/` | Declares workflow readiness (not a job runner) |

Engines must not embed vendor-specific PSA/RMM/CRM logic. Integrations should adapt at the edges.

---

## 3. Customer lifecycle data flow

```text
Marketing Lead / Prospect / Snapshot Lead
        ↓
Assessment Purchase (Stripe)
        ↓
Technology Maturity Assessment (immutable history)
        ↓
Living Technology Roadmap (ClientRoadmap)
        ↓
Phase Proposal (PhaseProposal versions)
        ↓
Client Approval → Phase Approved
        ↓
Implementation (phase/project status)
        ↓
Managed Services (RecurringService / Subscription)
        ↓
Quarterly Business Review (QBR snapshot JSON)
        ↓
Annual Reassessment → refreshed roadmap
```

Nothing in this chain should be a disconnected document. Report PDFs are projections of structured domain state.

---

## 4. Database relationships (commercial core)

- `Client` is the hub.
- `Assessment` + `ClientScoreHistory` + `TechnologyProfileSnapshot` preserve maturity history.
- `ClientRoadmap` → `ClientRoadmapPhase` → `ClientRoadmapInitiative` track delivery.
- `PhaseProposal` versions commercial scope per phase.
- `RecurringService` / `Subscription` capture MRR.
- `LifecycleOpportunity` captures emerging work.
- `OperationalNotification` stores actionable consultant alerts.
- `QuarterlyBusinessReview.snapshotJson` stores AI-ready report payloads.

---

## 5. Proposal / roadmap / implementation lifecycles

### Proposal
`draft → internal_review → sent → viewed → approved|rejected|expired|superseded`

Approval syncs the linked roadmap phase to `approved`.

### Roadmap phase
`planned → awaiting_approval → approved → in_progress → completed`  
(plus `deferred` / `cancelled`)

### Implementation
`projectStartedAt` / `projectCompletedAt` and initiative recommendation status track delivery. Post-completion opportunity evaluation runs through the Lifecycle Engine.

---

## 6. Reporting architecture

The Reporting Library (`getReportLibrary`) catalogs executive surfaces and maps each to an owning engine:

- Technology Roadmap → Roadmap Engine
- QBR → QBR / Reporting Engine
- Health / Budget / Lifecycle → Lifecycle Engine
- Managed Services → Lifecycle + Billing
- Annual Technology → Assessment history + Lifecycle
- Phase Proposal → Proposal Engine

Reports consume centralized roadmap/lifecycle data; they do not recompute investment logic ad hoc.

---

## 7. API architecture (Phase 6 surfaces)

| Route | Purpose |
| ----- | ------- |
| `GET /api/v1/clients/:id/360` | Customer 360 aggregate |
| `GET /api/v1/insights` | Org BI dashboard |
| `GET /api/v1/notifications` | List / refresh actionable notifications |
| `PATCH /api/v1/notifications/:id` | Mark read / dismiss |
| Existing module APIs | Roadmap, proposals, QBR, lifecycle, billing |

UI entry points:

- `/clients/:id/360` — Customer 360 (consultants)
- `/insights` — Business Intelligence + notifications
- `/consulting` — operational consulting workspace
- `/clients/:id/lifecycle` — continuous maturity command center

---

## 8. Automation readiness

`src/lib/automation/workflow-registry.ts` documents intended operational workflows and current readiness (`connected` / `partial` / `planned` / `manual`).

Future job runners (cron, queue workers, PSA adapters) should call existing engine services rather than duplicating business rules.

---

## 9. AI enablement

Do not embed model calls in engines yet. Prefer structured JSON already persisted:

- `PhaseProposal.snapshotJson`
- `QuarterlyBusinessReview.snapshotJson` (+ budget/risks/recommendations JSON)
- `ClientRoadmapInitiative.effectivenessJson`
- `LifecycleOpportunity.metadataJson`
- `OperationalNotification.metadataJson`

These payloads are the primary AI consumption surface.

---

## 10. Integration principles

Favor reusable interfaces over vendor coupling:

- Billing money helpers → Stripe/QuickBooks adapters later
- Calendar booking → Cal.com adapter later
- Project create → HaloPSA adapter later
- Asset sync → NinjaOne / Ubiquiti adapters later
- CRM sync → HubSpot / Salesforce via proposal + opportunity DTOs
- BI export → Power BI via insights API DTOs

---

## 11. Scalability notes

Commercial intelligence queries are composition read models. As volume grows:

1. Add materialized summary tables for org KPIs.
2. Index hot paths already present (`clientId + status`, proposal/phase indexes).
3. Keep Customer 360 per-client aggregation; avoid N+1 by batching in insights.
4. Multi-tenant readiness: keep all commercial queries scoped by `clientId` / org boundaries.

---

## 12. Related documents

- DOC-200 Client Lifecycle Architecture
- DOC-201 Client Workspace Framework
- DOC-204 Technology Investment Roadmap Framework
- DOC-206 Executive Business Review Framework
- DOC-125 Reporting Engine Specification
- DOC-128 Integration Specification
- BILLING_MODULE_AUDIT (operations)
