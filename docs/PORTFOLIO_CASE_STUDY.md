# StackScore Portfolio Case Study

> Repository-analysis artifact, prepared August 9, 2026. This document describes evidence in the repository, not independently verified production usage. Capability labels mean: **IMPLEMENTED** = executable code, persistence, and a usable route/API are present; **PARTIALLY IMPLEMENTED** = meaningful code exists but a workflow, integration, UI, or verification gap remains; **PLANNED / DOCUMENTED** = described in specifications or registries without an end-to-end implementation; **NOT FOUND** = no supporting implementation was found.

## Executive Product Summary

StackScore is a technology-advisory operating platform built around a repeatable consulting lifecycle: discover a client's business context, assess its technology environment, turn findings into a measurable maturity profile, prioritize improvements, package them into an investment roadmap and proposals, execute projects, and demonstrate progress through reassessment and executive reviews.

The repository began as an internal assessment tool for BobKat IT, but the current implementation is materially broader. It combines an assessment/scoring system, recommendation lifecycle, client and advisor workspaces, Technology Improvement Plans (TIPs), living roadmaps, phase proposals, project tracking, executive reporting, billing, subscription onboarding, outbound communications, lead funnels, and commercial intelligence. It is best understood as a vertical operating system for a technology consultancy—not a generic questionnaire or CRUD database.

The clearest strategic idea is that one structured source of client truth is reused across the engagement. Assessment responses become scores and findings; findings become recommendations; recommendations become roadmap initiatives and investment estimates; approved work becomes proposals/projects; completed activity and later assessments become score history, maturity snapshots, lifecycle opportunities, and quarterly business reviews. This is the business architecture described by the BobKat Technology Improvement Lifecycle (BTIL) and increasingly embodied in code.

Current implementation evidence includes 112 page routes, 112 API route handlers, 70 Prisma models, 30 committed migrations, and 111 test files. Those counts indicate breadth, not production readiness. On the current checkout, 455 of 468 tests pass; 13 tests fail across seven files, largely because tests and current presentation/pricing constants have drifted, plus two DOM tests run in a Node environment. Therefore, this case study should say “substantial working product” or “advanced custom platform,” not “fully production-hardened SaaS.”

Primary evidence: `README.md`; `docs/00-Governance/DOC-001 - Product Vision.md`; `docs/00-Governance/DOC-003 - Bobkat Technology Improvement Lifecycle (BTIL).md`; `docs/50-Development/MVP_PRD.md`; `src/app/`; `src/lib/`; `prisma/schema.prisma`; `prisma/migrations/`; `tests/`.

## Business Problem

The product addresses a consulting-delivery problem rather than merely a data-entry problem:

- Technology assessments performed through spreadsheets and handwritten notes are inconsistent, difficult to compare, and dependent on individual consultant judgment.
- Technical findings are hard for executives to interpret, prioritize, fund, and connect to business outcomes.
- Recommendations often become disconnected documents; scope, pricing, proposals, projects, follow-up, and proof of improvement require duplicate work across systems.
- A consultancy needs a repeatable service method that preserves professional judgment while enforcing common standards and approval gates.
- A client needs continuity: a living view of technology health, not a one-time report that immediately becomes stale.
- The advisory firm also needs commercial continuity from lead capture and paid assessment through recurring vCIO services, invoices, client communications, and quarterly reviews.

StackScore responds by turning a consulting methodology into a system of record and execution. It standardizes evidence collection and deterministic scoring, translates findings into business language, makes recommended work traceable to source assessments, and carries the same client context into plans, proposals, projects, reports, billing, and reassessment.

Evidence: `docs/50-Development/MVP_PRD.md` (problem statement, personas, success measures); `docs/00-Governance/DOC-001 - Product Vision.md` (mission and product purpose); `docs/00-Governance/DOC-003 - Bobkat Technology Improvement Lifecycle (BTIL).md` (Discover–Assess–Plan–Implement–Measure cycle); `src/lib/assessments/index.ts`; `src/lib/recommendations/sync.ts`; `src/lib/client-roadmap/materialize.ts`; `src/lib/technology-profile/index.ts`.

## Product Vision

The documented vision is to make StackScore the central operating platform for BobKat IT and to standardize the full technology-improvement lifecycle while retaining flexibility for each organization. The important product choice is that the Technology Profile—not a ticket, invoice, or sales opportunity—is the central client object. The platform is intended to capture information once and reuse it throughout advisory delivery.

The repository supports two concentric product scopes:

1. **Assessment-first operating core — IMPLEMENTED.** Client discovery, guided assessments, deterministic scoring, critical-exposure detection, recommendation generation, executive results, PDF reporting, score history, and reassessment.
2. **Consulting and commercial operating system — PARTIALLY IMPLEMENTED.** TIPs, living roadmaps, proposals, projects, client portal, QBRs, billing, vCIO subscriptions, communications, lead management, and lifecycle intelligence are substantial, but some transitions and third-party extensions remain manual, partial, or unverified.

The long-term claim “manage the entire technology lifecycle” is a valid product vision. It should not be presented as uniformly complete today.

Evidence: `docs/00-Governance/DOC-001 - Product Vision.md`; `docs/00-Governance/DOC-003 - Bobkat Technology Improvement Lifecycle (BTIL).md`; `docs/00-Governance/DOC-006 – StackScore Product Constitution.md`; `docs/30-Architecture/DOC-129 – AI Development Rules & Engineering Constitution.md`; `src/components/client-workspace/technology-journey-section.tsx`; `src/lib/technology-profile/`.

## Target Users

| Persona | Need served | Repository status and evidence |
|---|---|---|
| Technology assessor / technician | Conduct a consistent assessment, save progress, review evidence, and produce findings | **IMPLEMENTED.** `/assessments/[id]`, `src/components/assessments/assessment-wizard.tsx`, response APIs, completion orchestration |
| Account manager / vCIO advisor | Explain technology health in business language, prioritize investment, create plans and run reviews | **IMPLEMENTED / PARTIAL by module.** Client workspace, TIP, roadmap, phase proposals, consulting workspace, QBR and vCIO routes |
| Administrator / operations lead | Manage users, assessment library, communications, billing, prospects, leads, and portfolio health | **IMPLEMENTED with varying depth.** `/admin/*`, `/portfolio`, `/insights`, `/snapshot-leads`, `/website-leads` |
| Client executive / buyer | See their organization's profile, roadmap, projects, billing, next actions, proposals, and reviews | **PARTIALLY IMPLEMENTED.** Client-scoped authorization and portal-mode pages exist, but portal completeness and real-world validation are not established |
| Prospect / assessment purchaser | Take a free snapshot, receive an invitation, purchase an assessment, activate an account | **IMPLEMENTED / PARTIAL operationally.** Public snapshot and offer pages, Stripe checkout/fulfillment, activation email and lead conversion code exist; production configuration is external |
| Consultancy leadership | See cross-client risk, readiness, revenue funnel, delivery status, and opportunities | **IMPLEMENTED as internal dashboards/derived intelligence.** `/portfolio`, `/insights`, `/clients/[id]/360`, `src/lib/commercial-intelligence/` |

The original MVP explicitly targeted internal BobKat staff. Later schema, access helpers, pages, and tests demonstrate an emerging client-facing experience. It would be inaccurate to describe the system as proven multi-tenant SaaS: the model is single advisory organization with client-scoped users, not tenant isolation among independent service providers.

Evidence: `docs/50-Development/MVP_PRD.md`; `prisma/schema.prisma` (`UserRole`, `User.clientId`); `src/lib/api/access.ts`; `src/lib/auth/client-access.ts`; `src/lib/navigation/portal-mode.ts`; `src/app/(dashboard)/portal/`; `src/app/(dashboard)/clients/[id]/`.

## End-to-End Product Journey

1. **Attract and qualify — IMPLEMENTED / PARTIAL.** A prospect can encounter public assessment marketing, complete a lightweight Technology Snapshot, or arrive through the website-leads integration. Staff can review, annotate, invite, deduplicate, and convert snapshot leads/prospects. Evidence: `/technology-snapshot`, `/assessment-offer`, `/assessment-invitation`, `/api/v1/public/technology-snapshot`, `/api/integrations/website-leads`, `src/lib/communications/outreach/`, `src/lib/technology-snapshot/`.
2. **Purchase and provision — IMPLEMENTED, environment-dependent.** Stripe Checkout supports a paid technology assessment and vCIO offer. Signed webhooks perform idempotent fulfillment, create/associate customer records and assessments, initialize subscriptions/onboarding, and send activation or readiness messages. Evidence: `/api/checkout/create-session`, `/api/checkout/vcio`, `/api/webhooks/stripe`, `src/lib/stripe/fulfillment/`, `src/lib/vcio/initialization.ts`, `StripeWebhookEvent`.
3. **Discover the business — IMPLEMENTED.** Client and business-profile records capture organization size, locations, business goal, compliance context, support model, environment type, priority, and technology vision. Evidence: `/clients/new`, `/clients/[id]/business-profile`, related APIs, `Client` model, `src/lib/business-profile/`.
4. **Assess — IMPLEMENTED.** Staff or an entitled client works through active questions by category; answers auto-save, draft scores preview, and completion is blocked until required questions are answered. Completed assessments lock response editing. Evidence: assessment wizard and APIs; `src/lib/assessments/index.ts`; `src/lib/assessments/complete-v2.ts`.
5. **Score and interpret — IMPLEMENTED.** The engine calculates category/pillar scores and an overall 0–100 StackScore, derives rating/maturity labels, identifies critical exposure, produces strengths/risks, and writes score history/profile snapshots. Evidence: `src/lib/scoring/`; `src/lib/technology-maturity/`; `src/lib/technology-profile/`; scoring tests.
6. **Recommend — IMPLEMENTED.** Rule catalogs map assessment answers to recommendations; the engine consolidates and deduplicates findings across assessments, assigns priority and impact, and preserves trigger lineage. Evidence: `data/RecommendationCatalogV2.json`; `data/RecommendationRuleCatalog.json`; `src/lib/recommendations/`; recommendation models and tests.
7. **Plan investment — IMPLEMENTED / PARTIAL.** Advisors select recommendations and playbooks, estimate one-time and recurring investment, build a phased roadmap, preview a TIP, generate/publish/approve it, and produce a PDF. A completed assessment can also materialize a draft living roadmap. Some pricing is catalog/default-based rather than a fully configurable commercial pricing engine. Evidence: `/clients/[id]/improvement-plan`, `/clients/[id]/proposals/[tipId]`, TIP APIs/services, roadmap engine and tests.
8. **Approve and execute — IMPLEMENTED / PARTIAL.** Roadmap phases and initiatives have governed statuses. Phase proposals snapshot scope and investment, version revisions, generate PDFs, and support client approval/rejection. Projects can be created and tracked; proposal approval updates roadmap state, but automatic project/task creation from every approved proposal is explicitly only a hook/partial workflow. Evidence: phase proposal, roadmap, and project routes/services; `src/lib/automation/workflow-registry.ts`.
9. **Operate and communicate — IMPLEMENTED / PARTIAL.** Communications have templates, versions, previews, queue/review states, campaign/prospect history, delivery/open/click tracking via Resend webhooks, and a daily cron for reminders and scheduled queue items. Several trigger definitions remain manual or missing. Evidence: `/admin/communications/*`, `src/lib/communications/`, `/api/cron/communications`, `vercel.json`.
10. **Measure and advise — IMPLEMENTED / PARTIAL.** Reassessment starts from prior context, history and comparison APIs show score movement, completed projects can affect effective-score views, and QBRs assemble score movement, work completed, risks, priorities, and budget into client-facing browser/PDF reports. vCIO subscription entitlements and onboarding gate advisory features. Evidence: reassessment/comparison components and services, QBR routes/services, vCIO routes/services.

## Major Functional Domains

| Domain | Status | What exists |
|---|---|---|
| Client and business profiles | **IMPLEMENTED** | Client CRUD/archive/restore, contacts, business context, technology vision and compliance inputs |
| Assessment library and delivery | **IMPLEMENTED** | Admin metadata, v1 50-question library, v2 catalog/taxonomy, guided wizard, response evidence, completion controls |
| Scoring and maturity | **IMPLEMENTED** | Versioned v1/v2 engines, weighted scores, maturity labels, critical flags, live preview, snapshots |
| Recommendations | **IMPLEMENTED** | Catalog-driven triggers, dedupe/consolidation, lifecycle statuses, projected impact and cross-assessment lineage |
| Technology Profile | **IMPLEMENTED** | Current scores, maturity tier, category/pillar details, timeline and profile snapshots |
| Improvement planning / TIP | **IMPLEMENTED with constraints** | Selection, playbooks, pricing calculations, phased roadmap, report readiness, generate/publish/approval and PDF |
| Living roadmap | **IMPLEMENTED / PARTIAL** | Materialization, phases, initiatives, status rules, metrics, effective score, activity events; some downstream automation partial |
| Proposals | **IMPLEMENTED / PARTIAL** | TIP proposal workflow plus versioned phase proposals, PDF, send/view/approve/reject states; no e-signature provider |
| Projects | **IMPLEMENTED** | Create/update/cancel, assignment/status, recommendation linkage, completion reporting; deeper PSA/task integration absent |
| Executive reporting | **IMPLEMENTED** | Assessment, TIP, phase proposal, QBR, invoice PDFs; progress/completion browser reports; shared report design system |
| Billing | **IMPLEMENTED / PARTIAL** | Profiles, invoices/line items, deposits, payments/applications, recurring services, PDF/email, Stripe checkout/webhooks; not a full accounting ledger |
| vCIO advisory | **IMPLEMENTED / PARTIAL** | Subscription plans/entitlements, checkout, Stripe synchronization, adaptive onboarding, planning notes, welcome email, quarterly review records |
| Communications | **IMPLEMENTED / PARTIAL** | Template registry/versioning, preview/test send, queues, campaigns, contacts, tracked messages/events, Resend webhook, scheduled processing |
| Lead and funnel operations | **IMPLEMENTED** | Public snapshot, website lead API, prospects, imports, invitations, conversion previews/actions and attribution |
| Portfolio/commercial intelligence | **IMPLEMENTED as deterministic analytics** | Cross-client prioritization, readiness, funnel forecast, customer 360, success signals and operational insights |
| Technology catalog/lifecycle | **IMPLEMENTED / PARTIAL** | Standards catalog and client deployments, alignment/health/lifecycle statuses, refresh/budget/opportunity calculations; vendor asset sync absent |
| Documents | **PARTIALLY IMPLEMENTED** | Generated document records and PDFs; a general upload/storage workflow was not found |

## Assessment & Scoring Engine

### Methodology

StackScore supports two explicitly versioned assessment engines (`ScoringEngineVersion.v1` and `.v2`), which is an important maturity signal because historical assessments do not need to be silently reinterpreted when methodology changes.

**v1 — IMPLEMENTED.** Seven legacy categories have fixed overall weights: security 20%, backup 20%, infrastructure 15%, endpoint 15%, documentation 10%, BCDR 10%, and strategic 10%. Each category percentage is earned points divided by possible weighted points. Weighted category contributions are summed and rounded half up. Rating bands are Exceptional ≥90, Strong ≥80, Stable ≥70, At Risk ≥60, and Critical <60. Critical exposure is independent of the aggregate score and is triggered by selected answer options. Evidence: `src/lib/scoring/index.ts`; `prisma/seed-data.ts`; `docs/20-Business-Logic/DOC-111A - Scoring Engine Specification.md`.

**v2 — IMPLEMENTED.** The newer framework normalizes standardized answers, handles “not applicable,” computes pillar completion and scores, produces an overall StackScore only under completion rules, maps to maturity levels, and snapshots pillar values. The v2 library and metadata validation coexist with legacy guards and a compatibility reference, showing deliberate methodology migration. Evidence: `src/lib/scoring/v2/`; `src/lib/assessment-library/v2-catalog.ts`; `src/lib/assessment-library/legacy-guards.ts`; `data/v2-question-library.json`; `docs/20-Business-Logic/DOC-118 – v1 to v2 Compatibility Reference.md`.

### Completion behavior

Assessment completion is more than updating a status. The service checks draft state and answer completeness, calculates scores, evaluates critical flags, generates and synchronizes recommendations, builds an executive summary, persists category scores and denormalized assessment values in a transaction, records client score history, synchronizes the Technology Profile, and attempts to materialize a draft roadmap. v2 additionally produces pillar snapshots and uses v2 trigger evaluation. Evidence: `src/lib/assessments/index.ts`; `src/lib/assessments/complete-v2.ts`; `/api/v1/assessments/[id]/complete`.

### Interpretation and reporting

Live previews expose answered/total counts, partial category results, critical finding counts, recommendation previews, top risks, and projected score. Completed views expose customer responses, answer badges, finding severity, score summaries, category breakdowns, and executive narratives. PDF export is implemented at `/api/v1/assessments/[id]/export/pdf` using `src/lib/pdf/assessment-report.tsx`.

### Accuracy boundaries

- The score is a proprietary rules-based maturity indicator, not an externally accredited certification or independently validated benchmark.
- Critical exposure is a configured business rule, not probabilistic risk modeling.
- Projected score adds configured recommendation impact and caps at 100; it is a planning estimate, not a guaranteed outcome.
- The documentation contains both legacy and target specifications; current behavior must be described by `scoringEngineVersion` and the active code path.

Tests: `tests/scoring/index.test.ts`; `tests/scoring/v2.test.ts`; `tests/assessments/auto-assessment.test.ts`; `tests/assessment-library/`; `tests/reports/assessment-content.test.ts`.

## Recommendations & Improvement Planning

### Recommendation logic — IMPLEMENTED

Recommendations are generated deterministically from versioned JSON/catalog rules, not from free-form AI. Assessment answers carry trigger metadata. The engine evaluates eligible triggers, assigns priority and estimated impact, and calculates a projected score. The sync layer deduplicates at the client level, links one recommendation to multiple assessment triggers, updates still-actionable records, and avoids creating parallel duplicates across reassessments. Consolidation rules reduce multiple related findings into a more useful strategic recommendation.

Evidence: `data/RecommendationRuleCatalog.json`; `data/RecommendationCatalogV2.json`; `docs/70-Data/RecommendationRuleCatalog.json`; `src/lib/recommendations/engine.ts`; `src/lib/recommendations/generate.ts`; `src/lib/recommendations/v2-engine.ts`; `src/lib/recommendations/dedupe.ts`; `src/lib/recommendations/sync.ts`; `RecommendationTemplate`, `AssessmentRecommendation`, and `RecommendationAssessmentTrigger` models.

### Recommendation lifecycle — IMPLEMENTED

Recommendations have open, accepted, in-progress, completed, deferred, declined, and archived states. APIs support detail updates, archive, and deletion previews. Client views show recommendations and improvement workspaces. Projects and roadmap initiatives retain recommendation lineage. Evidence: `/api/v1/recommendations/[id]`; `/api/v1/recommendations/[id]/archive`; `/clients/[id]/recommendations`; `/clients/[id]/improvement`; `src/lib/projects/service.ts`.

### Technology Improvement Plan — IMPLEMENTED with partial commercialization

TIP is a structured advisory deliverable with a persisted workflow (`profile → recommendations → playbooks → investment → roadmap → preview → complete`), status/version fields, selected recommendations, pricing snapshots, roadmap JSON, report generation, publication, approval/revision states, and supersession. The roadmap engine groups work into configured phases and separates one-time, monthly recurring, and annual recurring investment. Report-readiness validation and pagination/PDF tests show attention to client deliverable quality.

Evidence: `TechnologyImprovementPlan` model; `/clients/[id]/improvement-plan`; `/clients/[id]/improvement-plan/[tipId]`; `/clients/[id]/proposals/[tipId]`; TIP APIs; `src/lib/technology-improvement-plan/`; `src/lib/reports/tip-*`; `src/lib/pdf/tip-report.tsx`; `tests/technology-improvement-plan/`.

Constraint: `src/lib/technology-improvement-plan/pricing.ts` and roadmap pricing catalogs contain defaults and explicit assumptions. This is meaningful investment modeling, but it should not be claimed as a fully configurable CPQ or authoritative accounting price book.

## Roadmap & Execution Management

**Living roadmap — IMPLEMENTED.** A completed assessment can materialize a draft `ClientRoadmap` with ordered phases and recommendation-linked initiatives. The roadmap records baseline/projected/effective scores, one-time and recurring investment, status, activation/completion timestamps, and snapshot content. Phase status transitions have permission rules and durable `ClientRoadmapPhaseEvent` history. The UI exposes a dashboard, KPI strip, timeline, phase cards, and phase workspace.

**Execution synchronization — PARTIALLY IMPLEMENTED.** Roadmap initiatives can be updated; proposal approval changes phase state; project services manage execution; completed projects and phases inform effective-score and lifecycle views. The operational automation registry accurately labels “proposal to implementation” partial and automatic project/task creation or PSA synchronization planned. Therefore, describe a connected planning-to-execution model, not fully touchless orchestration.

**Project lifecycle — IMPLEMENTED.** Projects carry proposed, approved, scheduled, in-progress, completed, and cancelled states, assignment, dates, investment and outcome fields, and optional recommendation/roadmap linkage. Completion can synchronize linked recommendation state and trigger completion communications/reporting.

Evidence: `/clients/[id]/roadmap`; `/clients/[id]/roadmap/phases/[phaseId]`; roadmap APIs; `src/lib/client-roadmap/materialize.ts`; `src/lib/client-roadmap/service.ts`; `src/lib/client-roadmap/effective-score.ts`; `src/lib/client-roadmap/permissions.ts`; `src/lib/projects/service.ts`; `/projects`; `/clients/[id]/projects`; `src/lib/automation/workflow-registry.ts`; roadmap/project models and tests.

## Reassessment / Continuous Improvement

Reassessment is a first-class product concept rather than overwriting the original assessment.

- New assessments have initial, quarterly, annual, and follow-up types.
- Completed responses are immutable; change occurs through a new assessment cycle.
- Reassessment services and forms carry forward client context while preserving separate evidence and dates.
- Score history and Technology Profile snapshots preserve point-in-time states.
- History and comparison APIs validate that two assessments belong to the same client and build category/pillar deltas.
- Maturity timelines and score/category trend charts visualize movement.
- Completion synchronizes the current profile, while scheduled reviews and project completion can create additional snapshots.
- Client recommendation dedupe prevents the same unresolved issue from proliferating on each cycle, while trigger lineage records which assessments observed it.

Status: **IMPLEMENTED.** The strategic claim should be “supports repeat assessment and historical comparison.” It should not claim automated telemetry-based continuous scoring; the score is updated through assessments and specific application events.

Evidence: `src/lib/assessments/reassessment.ts`; `src/components/clients/reassessment-form.tsx`; `/clients/[id]/assessments/history`; `/clients/[id]/assessments/compare`; related APIs; `src/lib/assessments/comparison.ts`; `src/lib/technology-profile/timeline.ts`; `src/components/analytics/maturity-timeline.tsx`; `ClientScoreHistory`; `TechnologyProfileSnapshot`; comparison and technology-profile tests.

## Executive Reporting & Advisory Capabilities

### Executive reporting — IMPLEMENTED

The application has a shared report vocabulary and document styling rather than one ad hoc export. It produces:

- assessment executive reports in browser and PDF;
- Technology Improvement Plan reports in browser and PDF;
- versioned phase proposal PDFs;
- Quarterly Business Review browser reports and dedicated PDFs;
- invoice PDFs;
- progress and project-completion browser reports;
- a product-overview PDF.

The reports translate technical evidence into overall score, maturity, strengths, risks, recommendation priorities, business impact, phased investment, projected improvement, completed work, score movement, next-quarter priorities, and budget views. PDF components include shared cover pages, KPI cards, tables, timelines, callouts, headers/footers, fonts, pagination, and print-specific layouts.

Evidence: assessment `/report` and export route; QBR and TIP routes; `src/lib/pdf/`; `src/lib/reports/`; `src/styles/*report*.css`; PDF/report tests.

### QBR / executive business review — IMPLEMENTED

QBR creation is period-aware and idempotent per client/quarter. The service assembles profile and score movement, completed projects, open risks/recommendations, assessment activity, roadmap phases, budget forecast, business goals, and technology vision. Draft summaries can be edited; generation freezes snapshot JSON, creates a document record, and creates a scheduled-review profile snapshot. Client users can only access generated reviews.

Evidence: `/clients/[id]/quarterly-reviews`; `/clients/[id]/quarterly-review/[qbrId]`; QBR APIs; `src/lib/qbr/service.ts`; `src/lib/qbr/report-data.ts`; `src/lib/qbr/executive-summary.ts`; `QuarterlyBusinessReview`; QBR tests.

### vCIO/advisory workspace — IMPLEMENTED / PARTIAL

The platform supports vCIO checkout, subscription entitlements, an adaptive onboarding record, business/environment/planning inputs, planning notes, welcome emails, feature unlocks, and quarterly review records. Staff have an admin vCIO view; clients have portal onboarding and vCIO pages. Billing events synchronize subscription/invoice/payment activity.

This is a substantive advisory-service workflow, but it is not an autonomous “virtual CIO.” Strategic language is generated from deterministic templates and stored advisor inputs. Some notification triggers and implementation handoffs remain partial.

Evidence: `/vcio-offer`; `/api/checkout/vcio`; `/admin/vcio`; `/clients/[id]/vcio`; `/portal/vcio`; vCIO APIs; `src/lib/vcio/`; `Subscription`, `VcioOnboarding`, `VcioQuarterlyReview`, `SubscriptionInvoice`, and `SubscriptionPaymentAttempt`.

## Commercial / Client Capabilities

### Client-facing workspace — PARTIALLY IMPLEMENTED

The `client` role is connected to one `Client` through `User.clientId`, access helpers enforce that scope, navigation has portal mode, and client-facing pages cover overview/briefing, technology profile/journey, recommendations, projects, documents, roadmaps, proposals, QBRs, billing, and vCIO onboarding. Proposal approval rules explicitly differ for consultant and client roles.

The repository therefore supports a real emerging client experience. However, two workspace pages (`activity` and `risks`) use a generic `WorkspaceStub`, tests currently expose a client command-palette regression, and no independent end-to-end portal validation is present. Call it a client portal/workspace “implemented across core journeys, with remaining gaps,” not universally complete.

Evidence: `src/app/(dashboard)/clients/[id]/`; `src/app/(dashboard)/portal/`; `src/components/client-workspace/`; `src/lib/api/access.ts`; `src/lib/navigation/portal-mode.ts`; `src/lib/client-roadmap/permissions.ts`; `tests/client-workspace/`; `tests/customer-portal/`.

### Proposals — IMPLEMENTED / PARTIAL

TIP proposals have generate/publish/approval states. Phase proposals are stronger evidence of commercial depth: immutable snapshots preserve scope at the time of proposal, numbers and versions are allocated, a revision supersedes the prior active proposal, a PDF document is attached, and sent/viewed/approved/rejected/expired transitions update timestamps and roadmap phase state. Client approval records an in-app signature JSON and comments.

No external e-signature, tax engine, CRM quote sync, or legal-contract workflow was found.

Evidence: `/clients/[id]/proposals/[tipId]`; `/clients/[id]/phase-proposals/[proposalId]`; proposal APIs; `src/lib/proposals/service.ts`; `src/lib/phase-proposals/service.ts`; `src/lib/phase-proposals/snapshot.ts`; proposal models and tests.

### Invoicing and billing — IMPLEMENTED / PARTIAL

The billing domain includes client billing profiles, invoice numbering and statuses, line items with category/kind, calculations for subtotal/discount/tax/deposit/paid/balance, payment application, deposits, recurring services, delivery history, PDF generation, invoice emails, a billing audit trail, Stripe Checkout for invoices, and webhook reconciliation. Client and admin billing views are separate, and portal creation uses server-side access checks.

This is more than a decorative invoice screen. Still, it is not a general ledger, revenue-recognition system, payroll tool, or demonstrated replacement for QuickBooks/Xero. Accounting integrations were not found.

Evidence: `/clients/[id]/billing`; invoice routes/pages; `/admin/billing`; `/portal/billing`; `src/lib/billing/`; `src/lib/pdf/invoice-document.tsx`; billing models/migration; `tests/billing/`; `docs/60-Operations/BILLING_MODULE_AUDIT.md`.

### Sales funnel and customer communications — IMPLEMENTED / PARTIAL

The platform manages website leads, Technology Snapshot leads, prospects, campaign recipients, invitations, contacts, tracked messages/events, attribution, conversion previews, and client activity. It can import prospects from CSV and prevent duplicate outreach. Resend delivery webhooks update communication state. Analytics pages aggregate communication events.

This resembles a purpose-built consulting funnel, not a full general CRM. The product constitution intentionally limits the Business Profile so StackScore does not become a CRM.

Evidence: `/website-leads`; `/snapshot-leads`; `/admin/communications/prospects`; `/admin/communications/campaigns`; corresponding APIs; `src/lib/website-leads/`; `src/lib/technology-snapshot/`; `src/lib/communications/outreach/`; `docs/standards/PRD-201 — Communications Platform.md`.

## Application Architecture

StackScore is a full-stack TypeScript application built with Next.js 15 App Router and React 19. Server Components perform much of the authenticated data loading; client components handle interactive workspaces and forms; REST-style Next.js route handlers under `/api/v1` expose domain operations. Business logic is organized into domain service libraries rather than concentrated in pages.

The runtime architecture is:

```text
Browser / client portal / public funnel
                 |
        Next.js pages + middleware
                 |
      Route handlers / server actions
                 |
 Domain services and deterministic engines
  | scoring | recommendations | TIP/roadmap |
  | projects | QBR | billing | communications |
                 |
            Prisma ORM
                 |
       PostgreSQL (local / Neon target)

External boundaries: Stripe, Resend/Svix, GA4, Vercel cron/analytics
```

Architectural strengths:

- Domain-oriented `src/lib/*` boundaries keep scoring, recommendations, roadmap, billing, communications, QBR, and auth logic reusable and testable.
- Version fields and snapshots preserve historical meaning across changing scoring, recommendations, proposals, plans, and reports.
- Database transactions protect multi-write operations such as assessment completion, proposal creation, and report generation.
- Thin, resource-oriented APIs separate permission/validation from business services.
- Shared PDF/report components create a coherent deliverable platform.
- Zod validates external and form inputs; Prisma provides typed, parameterized persistence.
- The environment targets Vercel plus PostgreSQL/Neon and includes migration-aware build/deploy scripts.

Limitations:

- This remains a modular monolith, appropriate to the current scope, not a distributed microservice platform.
- Some older architecture docs describe target state or obsolete gaps and should not be treated as current implementation truth.
- No queue infrastructure exists; scheduled communications run through Vercel cron, and many workflows execute synchronously.
- No CI workflow file was found in the repository inventory.

Evidence: `package.json`; `next.config.ts`; `vercel.json`; `src/app/`; `src/lib/`; `src/lib/db/connection.ts`; `prisma.config.ts`; `scripts/vercel-build.mjs`; `docs/30-Architecture/DOC-300 - Technical Architecture.md`.

## Data Architecture

The relational model is organized around `Client` as the aggregate root and `TechnologyProfile` as the current advisory truth.

Important relationships:

- A `Client` has many assessments, recommendations, projects, score-history rows, profile snapshots, plans, roadmaps, proposals, QBRs, technologies, communications, billing records, subscriptions, and lifecycle opportunities.
- A `User` is admin, technician, or client; a client user may be linked one-to-one to a client record.
- An `Assessment` belongs to a client and assessor, has responses and category scores, and triggers recommendations.
- `AssessmentResponse` links a question to a selected answer option and records scored evidence.
- `AssessmentRecommendation` is client-scoped; `RecommendationAssessmentTrigger` provides many-to-many lineage back to assessments/responses.
- A `TechnologyProfile` is one-to-one with the client; `TechnologyProfileSnapshot` preserves assessment-completed, project-completed, scheduled-review, or manual states.
- A `TechnologyImprovementPlan` stores workflow state, selections, pricing, roadmap and report snapshots.
- A `ClientRoadmap` contains ordered phases; phases contain initiatives linked to recommendations/projects and have events/proposals.
- `PhaseProposal` snapshots a phase and relates to a document and approval actor.
- `Project` can connect recommendations, roadmap initiatives, client, and assignee.
- Commercial entities separate invoices, line items, payments, payment applications, deposits, recurring services, subscriptions, provider invoices, and payment attempts.
- Communications separate templates/versions, messages, provider events, queue items, campaigns, recipients, contacts, and organization activity.
- Technology standards separate categories, technologies, products, capabilities, outcomes, pillar mappings, and client deployments.

Sophisticated data choices include source-version fields, snapshot JSON for immutable deliverables, explicit status enums, idempotency keys, unique constraints for provider events and deduplication, audit/event tables, and soft lifecycle states rather than uncontrolled deletion.

Evidence: `prisma/schema.prisma`; all files in `prisma/migrations/`; `docs/30-Architecture/DOC-301 – Database Schema Specification.md`; `docs/30-Architecture/DOC-310 – Commercial Platform Architecture.md`.

## Authentication & Authorization

### Authentication — IMPLEMENTED

Auth.js/NextAuth v5 uses a credentials provider and JWT sessions. Email is normalized, input is schema-validated, inactive users are rejected, and bcrypt compares password hashes. JWT refresh checks the database so disabling a user invalidates future access. Account activation and password-reset flows use persisted tokens. Middleware controls protected page access and safe callback-url helpers reduce open-redirect risk.

Evidence: `src/lib/auth/config.ts`; `src/lib/auth/auth.config.ts`; `src/middleware.ts`; `/api/auth/[...nextauth]`; activation/reset APIs and forms; `src/lib/auth/activation.ts`; `src/lib/auth/password-reset.ts`; auth tests.

### Authorization — IMPLEMENTED with audit caveats

Roles are `admin`, `technician`, and `client`. Staff can operate across client records; client users are restricted to their linked client. API access helpers enforce assessment and workspace ownership. Admin/user/billing/communications modules add role-specific guards; command-palette entries and navigation are filtered by permission. Client report visibility is state-aware—for example, draft QBRs are hidden and proposal transition rules differ by role.

Security-related implementation also includes webhook signature verification for Stripe and Resend/Svix, API-secret authentication and rate limiting for website lead ingestion, Zod validation, ORM parameterization, safe URL sanitization, deletion previews, archive/restore workflows, billing/admin audit events, and Stripe event idempotency.

Important caveats:

- The documented general API and login rate limits are not comprehensively evident; the website-lead integration has an in-memory limiter, but no platform-wide durable rate limiter was found.
- MFA and enterprise SSO are **PLANNED / DOCUMENTED**, not implemented.
- Audit coverage exists for billing, admin actions, communications, roadmap phase events, and organization activity, but a complete security audit-log UI/coverage for every sensitive action was not established.
- Authorization is application-layer, single-consultancy/client-scoped access—not row-level multi-tenant database isolation.

Evidence: `src/lib/api/access.ts`; `src/lib/users/guards.ts`; `src/lib/billing/access.ts`; `src/lib/communications/auth.ts`; `src/lib/command-center/permissions.ts`; `src/lib/client-roadmap/permissions.ts`; webhook routes; `AdminAuditEvent`, `BillingAuditEvent`, `OrganizationActivityEvent`, `StripeWebhookEvent`.

## Integrations

| Integration | Status | Evidence and boundary |
|---|---|---|
| PostgreSQL / Neon | **IMPLEMENTED** | Prisma PostgreSQL datasource, adapter, migrations and environment/deployment docs |
| Stripe | **IMPLEMENTED, configuration-dependent** | Assessment and vCIO checkout, invoice checkout, signature-verified webhooks, purchase fulfillment, subscription/invoice/payment synchronization and event dedupe |
| Resend | **IMPLEMENTED, configuration-dependent** | Email sending, message recording, test sends, delivery event webhook; Svix verifies webhook signatures |
| Vercel | **IMPLEMENTED as deployment target** | Analytics/Speed Insights packages, build script and daily cron declaration |
| Google Analytics 4 | **IMPLEMENTED / configuration-dependent** | GA component/event helpers and funnel/product event tests; measurement ID and enable flag required |
| BobKat website lead intake | **IMPLEMENTED** | Secret-protected JSON API, validation, dedupe, rate limiting and lead audit/service logic |
| Cal.com | **PARTIAL** | Configurable external booking links; no calendar API synchronization |
| Microsoft 365 / Graph | **PLANNED / DOCUMENTED** | Future integration specification only; no adapter/runtime found |
| NinjaOne | **PLANNED / DOCUMENTED** | Catalog entry and future asset-sync boundary, but no API integration found |
| Ubiquiti UniFi | **PLANNED / DOCUMENTED** | Technology catalog content exists, but no device/network API integration found |
| Accounting platform | **NOT FOUND** | No QuickBooks, Xero, or general-ledger connector found |
| PSA/ticketing platform | **PLANNED / DOCUMENTED** | Automation registry mentions future PSA project creation; no adapter found |

Evidence: `.env.example`; `package.json`; `/api/webhooks/stripe`; `/api/webhooks/resend`; `/api/integrations/website-leads`; `src/lib/stripe/`; `src/lib/billing/stripe-webhook.ts`; `src/lib/email/`; `src/lib/analytics/`; `docs/30-Architecture/DOC-128 – Integration Specification.md`; technology catalog docs.

## Automation & Intelligence

### Implemented automation

- Assessment completion atomically scores, detects critical exposure, generates/synchronizes recommendations, writes history, updates the profile, and materializes a roadmap.
- Stripe webhooks fulfill purchases, synchronize billing/subscription state, provision onboarding, and deduplicate provider events.
- Communications can be rendered, queued for review, scheduled, sent, retried/recorded, and updated from delivery webhooks.
- A protected daily cron scans quarterly-review reminders and processes scheduled queue items.
- Proposal generation snapshots scope, versions documents, and moves roadmap state; proposal approval synchronizes the phase.
- Project/phase completion can trigger profile snapshots, recommendation updates, lifecycle opportunity scans, notifications, and client communications.
- Portfolio and commercial-intelligence engines deterministically rank readiness, immediate focus, customer success, funnel forecasts, and client insights.

Evidence: `src/lib/assessments/`; `src/lib/automation/workflow-registry.ts`; `src/lib/communications/automation-registry.ts`; `src/lib/communications/queue/service.ts`; `src/lib/communications/workflows/triggers.ts`; `/api/cron/communications`; `src/lib/commercial-intelligence/`; `src/lib/portfolio/`; `src/lib/notifications/`.

### Partially implemented or manual automation

The repository itself publishes honest readiness metadata. Roadmap-review scheduling and first-QBR scheduling are partial; proposal-to-implementation is partial; proposal-ready messaging is manual; project-share messaging lacks a trigger; several vCIO failure/cancellation emails lack triggers. Implementation onboarding and managed-service activation are planned. Evidence: `src/lib/automation/workflow-registry.ts`; `src/lib/communications/automation-registry.ts`.

### AI capabilities

**Runtime generative AI — NOT FOUND.** No OpenAI, Anthropic, Gemini, model SDK, prompt orchestration, embeddings, RAG, or model calls were found in application code or dependencies. “AI insights” language in product/demo presentation must not be used as evidence of implemented AI. Executive summaries, recommendations, prioritization, and forecasts are deterministic rules/templates.

**AI-assisted development governance — DOCUMENTED.** `DOC-129` establishes documentation-first rules for human and AI coding assistants: do not invent business logic, preserve domain boundaries, use human approval gates, and update governing specifications. This is evidence of an intentional AI-assisted engineering process, not evidence that AI is a product feature. Repository evidence alone cannot prove which lines were authored by AI or quantify productivity gains.

## Sophisticated Business Rules

1. **Versioned scoring coexistence.** Each assessment selects v1 or v2, preserving historical meaning while the assessment taxonomy evolves.
2. **Critical exposure outside aggregate scoring.** A seemingly acceptable average cannot hide configured critical answer conditions.
3. **Completion invariants.** Only drafts can complete; required answers must exist; scoring, recommendations, history, summary and status are treated as one business operation.
4. **Client-level recommendation identity.** The same unresolved risk across reassessments is synchronized/deduplicated while retaining assessment-trigger lineage.
5. **Projected score constraints.** Recommendation impacts are accumulated and capped at 100, keeping improvement estimates bounded.
6. **Immutable deliverable snapshots.** Generated TIPs, QBRs and phase proposals preserve data as presented rather than silently changing with live records.
7. **Proposal versioning and supersession.** A revised active phase proposal retains its proposal number, increments version, and supersedes the previous version.
8. **Role- and state-dependent proposal transitions.** Consultants and client users have different allowed actions; client approval/rejection only applies after send/view states.
9. **Roadmap phase transition audit.** Status changes record actor, from/to state and notes; proposal approval synchronizes phase approval.
10. **Effective-score logic.** Roadmap/project completion can express realized or pending improvement separately from baseline and projected scores.
11. **Quarter-bound QBR idempotency.** Creating a review for the same client and quarter returns the existing record; generated reports become immutable and client-visible.
12. **Commercial money separation.** One-time, monthly recurring, and annual recurring investments are not conflated; invoices separately track subtotal, discounts, tax, deposits, payments and balance.
13. **Payment application.** Payments can be applied to invoices rather than simply toggling an invoice paid flag.
14. **Provider-event idempotency.** Stripe event IDs and business-specific idempotency keys prevent duplicate fulfillment and communications.
15. **Human approval before commitment.** Communication queues, TIP publication, proposal approval, and roadmap states encode review gates before client or billable actions.
16. **Visibility-aware client experience.** Internal notes/activity and draft deliverables remain staff-only while generated/client-visible material is scoped to the linked client.

Evidence: corresponding services under `src/lib/scoring`, `assessments`, `recommendations`, `technology-improvement-plan`, `client-roadmap`, `phase-proposals`, `qbr`, `billing`, `communications`; `prisma/schema.prisma`; `docs/30-Architecture/DOC-129 – AI Development Rules & Engineering Constitution.md`.

## Technically Difficult Problems Solved

- **Evolving a scoring methodology without corrupting history.** Versioned engines, compatibility guards, per-assessment versioning and snapshots permit migration from legacy categories to a newer pillar model.
- **Maintaining traceability across a long consulting lifecycle.** Assessment answers, recommendation triggers, client recommendations, plan selections, roadmap initiatives, proposals and projects remain relationally connected.
- **Coordinating multi-entity completion safely.** Assessment completion and proposal generation use transactions, followed by profile/roadmap synchronization with explicit error handling.
- **Avoiding recommendation duplication across time.** Client-level dedupe keys and trigger relationships reconcile repeated findings from multiple assessments.
- **Generating credible executive deliverables from live business state.** Multiple browser/PDF reports share data assemblers, presentation models, typography, page furniture and pagination logic.
- **Reconciling external payments idempotently.** Checkout fulfillment, subscription state, invoice/payment attempts and webhook events must tolerate retries without duplicate business state.
- **Supporting staff and clients in one codebase.** Role, client scope, portal mode, document state and action permissions must align across pages, APIs, navigation, and commands.
- **Turning a strategic plan into governed execution.** Roadmap phases, proposals, approval events, initiatives, projects, score effects and lifecycle opportunities form a stateful chain rather than independent CRUD tables.
- **Building auditable communications.** Template versions, recipient resolution, idempotency, queue review, provider delivery events, campaign activity and organization timelines create a traceable outbound system.
- **Separating current truth from historical truth.** Live profiles coexist with assessment history, snapshots, generated report snapshots, proposal versions and audit events.

## Product Depth Indicators

- The product has multiple interacting state machines: assessment, recommendation, project, TIP, roadmap phase, proposal, invoice, communication queue, subscription, onboarding and QBR.
- It contains both operational and executive views of the same source data.
- It serves internal staff, client executives and prospects with different scopes and journeys.
- It preserves history through migrations, snapshots, versions, events and audit records.
- It has domain engines for scoring, recommendations, roadmap creation, pricing, lifecycle health, funnel forecasting and portfolio prioritization.
- It generates decision artifacts—not just records—including executive summaries, recommendations, plans, roadmaps, proposals, QBRs, forecasts and PDFs.
- It integrates revenue and delivery: paid acquisition, fulfillment, advisory onboarding, proposals, invoices and recurring subscriptions connect to the client lifecycle.
- It codifies approval, visibility, and idempotency rules needed for real business operations.
- It includes public acquisition experiences, authenticated operational workspaces, client-facing views, administration and reporting.
- Its tests target business behavior—scoring, dedupe, roadmap rules, pricing, permissions, report pagination, Stripe fulfillment—not merely component rendering.

The strongest evidence that this exceeds CRUD is the chain of derived and synchronized state: one completed assessment produces scores, critical findings, summary, recommendation lineage, score history, profile state, and roadmap materialization, which then feeds investment modeling, approvals, execution, billing and later comparison.

## Business Value

For the consultancy, StackScore can reduce delivery variance, preserve institutional knowledge, shorten assessment-to-proposal time, reduce duplicate entry, make follow-up visible, and create a repeatable advisory service. It also creates an operating backbone for paid assessments and recurring vCIO relationships.

For clients, it can replace disconnected technical findings with a clear baseline, prioritized action, phased investment, visible ownership, executive-ready updates, and evidence of movement over time. The value proposition is not “a score.” It is a disciplined way to decide what to do next, obtain approval, execute, and revisit the decision with better evidence.

These are intended/enabled values. The repository does not contain production adoption metrics, measured time savings, revenue lift, customer satisfaction data, or independently validated outcomes. Portfolio materials should distinguish expected business value from proven KPI impact.

## Evidence of Technology Strategy

- A documented north star translates consulting philosophy into a Discover–Assess–Plan–Implement–Measure lifecycle.
- The architecture prioritizes the Technology Profile and business outcomes over tools and tickets.
- The product deliberately starts with a modular monolith and managed services (Vercel, PostgreSQL, Stripe, Resend), matching the scale and operating capacity of a small consultancy.
- The v1-to-v2 approach treats methodology change as a governed migration with compatibility, not an invisible rewrite.
- Human approval gates constrain automation where client commitments and billable work are involved.
- Public snapshot, paid assessment, proposals, projects, billing, subscription onboarding and QBRs demonstrate a strategy spanning acquisition, delivery, retention and expansion.
- Integration boundaries are explicit: implement high-value payment/email/lead connections now, preserve future vendor adapters without pretending they exist.

Evidence: product governance docs; `docs/20-Business-Logic/DOC-118 – v1 to v2 Compatibility Reference.md`; `src/lib/automation/workflow-registry.ts`; `src/lib/technology-profile/`; `src/lib/stripe/`; `src/lib/vcio/`.

## Evidence of Systems Architecture

- A 70-model relational domain connects evidence, decisions, execution, commercial activity and historical snapshots.
- Domain services isolate scoring, recommendation, report, roadmap, billing, communications and authorization logic.
- Transactions, unique constraints, idempotency keys, event records and versioned snapshots handle consistency and retries.
- A shared reporting/PDF subsystem separates data assembly from presentation and supports multiple deliverable types.
- Client-scoped access is enforced at APIs/services and reflected in navigation and state visibility.
- External integration adapters validate signatures/secrets and translate provider events into internal domain state.
- The test suite covers high-risk decision logic and integration boundaries.

Evidence: `prisma/schema.prisma`; `src/lib/`; `src/app/api/`; `src/lib/pdf/`; `tests/`; migrations.

## Evidence of Product Leadership

- The repository contains a coherent product constitution, lifecycle, personas, outcomes, user stories, domain specifications, design principles and operational readiness docs.
- The application evolved beyond the original MVP while retaining compatibility and traceability.
- Capability registries explicitly label connected, partial, planned and manual automation instead of masking gaps.
- The UI is structured around distinct executive, advisor, administrator, client and prospect experiences.
- Commercial workflow is designed alongside delivery workflow, showing awareness that a useful internal product must support the business model.
- Report quality, client language, approval gates, and reassessment demonstrate attention to service experience—not only engineering completion.
- The repository also shows real product-management debt: stale status docs, partial stubs and failing drift tests. A credible story includes that complexity and the discipline needed to reconcile it.

## Evidence of AI-Assisted Development

The defensible story is about **AI-assisted engineering discipline**, not an AI-powered product.

`docs/30-Architecture/DOC-129 – AI Development Rules & Engineering Constitution.md` defines how AI coding assistants should operate: read governing documentation, do not invent scoring or commercial rules, reuse services, respect permissions and approval gates, and update specifications with approved changes. The unusually extensive documentation, machine-readable catalogs, modular services and behavior-focused tests are all well suited to controlled AI-assisted delivery.

Repository evidence does **not** establish which code was produced with AI, how much faster development was, or whether an AI agent followed the constitution in practice. No runtime model integration is implemented. Appropriate wording is: “I designed a documentation-first architecture and governance system suitable for AI-assisted development, using explicit business rules and tests to keep generated changes aligned.” Avoid “StackScore uses AI to generate recommendations” or “AI built the application autonomously.”

## Recommended Portfolio Story

### Primary headline

**StackScore: Turning Technology Consulting into a Measurable Operating System**

### 1-sentence description

I designed and built a custom advisory platform that converts structured technology assessments into executive insight, prioritized investment roadmaps, governed execution, and measurable improvement over time.

### 50-word description

StackScore transforms technology consulting from disconnected spreadsheets and reports into a repeatable operating lifecycle. The platform assesses technology maturity, generates traceable recommendations, builds phased investment plans and proposals, tracks execution, supports billing and vCIO services, and uses reassessment and executive reviews to demonstrate progress continuously—all from one connected client record.

### 150-word executive description

StackScore is a custom technology-advisory operating platform created to solve a business problem: inconsistent assessments rarely translate cleanly into executive decisions, funded initiatives, and measurable outcomes. I defined a repeatable lifecycle—Discover, Assess, Plan, Implement, Measure—and encoded it into a connected system. Structured assessment evidence produces a versioned StackScore, maturity profile, critical-risk flags, and traceable recommendations. Advisors can turn those findings into Technology Improvement Plans, phased investment roadmaps, versioned proposals, projects, and executive reports. Client workspaces, billing, communications, paid-assessment fulfillment, vCIO onboarding, and quarterly reviews extend the platform across acquisition, delivery, and retention. Architecturally, StackScore uses domain services, a relational model, transactions, snapshots, audit events, role-based client scoping, and idempotent payment and email integrations. The result demonstrates how I translate an ambiguous professional-service workflow into product strategy, business rules, system architecture, and an executable custom application—not simply how I assemble a web interface. It connects strategy, architecture, delivery, governance, and commerce.

### Full case-study narrative

Technology consultancies often diagnose well but operate inconsistently. One consultant uses a spreadsheet, another uses notes, and a third writes a bespoke report. Even when the technical findings are sound, clients struggle to understand priority, investment, ownership, and whether completed work improved anything. The consultancy loses time re-entering the same context into proposals, project trackers, invoices, and quarterly presentations.

I framed StackScore as a business operating problem rather than a questionnaire problem. The product needed a repeatable consulting method, a durable client truth, and a chain of evidence from observation to outcome. I defined the BobKat Technology Improvement Lifecycle—Discover, Assess, Plan, Implement, Measure—and made the Technology Profile the center of that lifecycle.

During discovery, StackScore captures only the business context that improves technology decisions: scale, locations, compliance context, support model, goals, priorities, and technology vision. During assessment, a guided, resumable workflow records structured responses and supporting evidence. A versioned deterministic scoring engine converts those responses into pillar/category scores and a 0–100 StackScore while separately surfacing critical exposures that should not disappear inside an average.

Completing an assessment is an orchestration event. The platform validates completeness, calculates and persists scores, produces an executive summary, generates catalog-driven recommendations, consolidates repeated findings, records history, updates the living Technology Profile, and materializes a draft roadmap. This preserves traceability: an executive recommendation can be followed back to the assessment answers that caused it.

The planning layer moves beyond a diagnostic report. An advisor selects recommendations, maps them to solution playbooks, separates one-time and recurring investment, organizes work into phases, previews a Technology Improvement Plan, and generates a client deliverable. The living roadmap adds status governance and effective-score tracking. Versioned phase proposals snapshot the exact scope and investment presented to a client, support review and approval, and synchronize roadmap state. Projects then carry approved work into execution.

StackScore also recognizes that advisory delivery is a commercial lifecycle. Public Technology Snapshots, website leads, prospect campaigns, paid assessment checkout, account activation, invoices, payment reconciliation, recurring services, and vCIO subscriptions connect demand generation to delivery. Client-facing workspaces expose appropriate reports, next actions, roadmaps, projects, billing and quarterly reviews while preserving internal-only material.

Executive reporting closes the loop. Assessment reports, improvement plans, proposals, progress views, completion reports and quarterly business reviews reuse the same underlying records. QBRs combine score movement, completed work, open risks, roadmap priorities, and budget into an executive conversation. Reassessment preserves the old baseline, creates a new profile snapshot, compares movement, and begins the next improvement cycle.

The system architecture reflects the risk of that business logic. Domain services separate scoring, recommendations, plans, roadmaps, billing, communications and reports. PostgreSQL relations preserve lineage; transactions protect multi-entity changes; snapshots and versions preserve what clients actually saw; audit/event tables record sensitive transitions; role and client-scope checks protect client data; Stripe and Resend webhooks are signature-verified and idempotent.

The product is substantial but not finished in every dimension. External device-management, productivity-suite, PSA and accounting integrations remain planned; some automation handoffs are manual or partial; two client workspace sections are stubs; there is no runtime generative AI; and the current test suite has 13 failures from presentation/configuration drift and test-environment issues. Those boundaries are part of the portfolio story: StackScore demonstrates the ability to define a product vision, choose scope, evolve architecture, encode complex business rules, and be precise about the difference between a working capability and a roadmap claim.

## Recommended Portfolio Visuals

1. **Executive client briefing / Technology Profile.** Show the current StackScore, maturity tier, pillar scores, immediate focus and technology journey on `/clients/[id]` or `/clients/[id]/technology-profile`. It matters because this is the product's central object. It proves technical evidence can be translated into executive decision context.
2. **Assessment wizard in progress.** Show category navigation, answered/total progress, an evidence/notes state, live score preview and a critical finding. It proves guided data collection, draft persistence, validation and real-time decision logic.
3. **Completed assessment executive report.** Show overall score, critical exposure, strengths, risks, priority recommendations and projected improvement. It proves the product produces a client-ready outcome rather than a questionnaire dump.
4. **Assessment history and side-by-side comparison.** Show two dated assessments with category deltas and trend indicators. It proves reassessment, historical preservation and measurable continuous improvement.
5. **Recommendation workspace with lineage and lifecycle.** Show prioritized recommendations, business impact, status, source category/assessment and linked next action. It proves catalog-driven advice, deduplication and traceability.
6. **Technology Improvement Plan builder and preview.** Show recommendation selection, playbooks, one-time/recurring investment and the executive PDF preview. It proves findings can become a structured, priced advisory deliverable.
7. **Living roadmap timeline.** Show phases, initiative counts, status, investment, expected/effective score movement and next action. It proves strategic sequencing and execution governance.
8. **Versioned phase proposal approval.** Show scope snapshot, proposal number/version, investment, PDF and client approve/reject state. It proves commercial controls, immutable client commitments and role-aware workflow.
9. **Quarterly Business Review.** Show score movement, completed work, open risks, next-quarter priorities and budget forecast. It proves an ongoing vCIO/executive advisory relationship.
10. **Client 360 / portfolio intelligence.** Show cross-client risk/readiness or one client's commercial and delivery timeline. It proves management visibility across acquisition, delivery, health and revenue.
11. **Billing dashboard and invoice detail.** Show line items, deposits/payments, balance, status, PDF and delivery state. It proves operational depth beyond advisory presentation.
12. **Communications automation console.** Show template/version, queue review, automation readiness and delivery analytics. It proves governed outbound operations and honest differentiation of connected versus partial automation.

Avoid using the `activity` or `risks` stub pages as portfolio visuals. Use seeded/demo data only when clearly labeled, and remove real client/contact/payment information from screenshots.

## Recommended Architecture Diagrams

1. **Business lifecycle and value chain.** Discover → Assess → Profile → Recommend → Plan → Approve → Implement → Measure → Repeat, with acquisition and billing wrapping the lifecycle. This should be the primary portfolio diagram.
2. **Domain relationship map.** Center `Client` and `TechnologyProfile`; show assessment/evidence, recommendation lineage, TIP/roadmap/proposal/project, report/QBR, commercial, communication and technology-lifecycle aggregates.
3. **Assessment completion sequence.** User/API → validation → scoring engine → recommendation engine → transaction → score history → Technology Profile → draft roadmap → communication queue. This makes the orchestration complexity visible.
4. **Plan-to-execution state diagram.** Recommendation states, TIP workflow, roadmap phase states, proposal version/approval and project states, including human approval gates.
5. **System/container architecture.** Browser experiences → Next.js modular monolith → domain services → Prisma/PostgreSQL, with Stripe, Resend/Svix, GA4 and Vercel cron boundaries.
6. **Historical truth model.** Live Technology Profile versus assessment history, profile snapshots, recommendation triggers, generated report snapshots and proposal versions. This explains how the platform avoids rewriting history.
7. **Security and client-scope diagram.** Admin/technician/client roles, linked-client boundary, staff-only fields, public integration boundary, session auth and signed webhooks.
8. **Commercial lifecycle diagram.** Snapshot/website lead → prospect/invitation → purchase/fulfillment → client/assessment → proposal → invoice/payment → subscription/vCIO/QBR.

## Recruiter Positioning

### 30-second explanation

I built StackScore to turn an inconsistent consulting process into a measurable operating system. It captures business and technical evidence, calculates a versioned maturity score, generates traceable recommendations, turns them into phased plans and proposals, tracks execution, and demonstrates progress through reassessment and executive reviews. The strongest part is the translation from business methodology into product architecture—not the particular web framework.

### 2-minute technical explanation

StackScore is a domain-oriented full-stack application for technology advisory delivery. A guided assessment captures structured evidence against a versioned question library. The completion service validates the assessment and orchestrates deterministic scoring, critical-risk detection, recommendation generation and deduplication, executive-summary creation, score-history persistence, Technology Profile synchronization, and draft-roadmap materialization.

The planning domain turns recommendations into a Technology Improvement Plan with playbooks, separated one-time and recurring pricing, phased initiatives, projected score improvement and PDF output. Living roadmaps, versioned phase proposals, approval state, projects, completion reports and QBRs preserve traceability into execution. Commercial domains add leads, campaigns, paid-assessment fulfillment, invoices, subscriptions and vCIO onboarding.

Architecturally it is a Next.js/TypeScript modular monolith over Prisma/PostgreSQL. The hard controls are transactions for multi-entity operations, snapshots and versions for historical truth, role/client-scope authorization, deterministic domain engines, signature-verified Stripe and Resend webhooks, event idempotency, and business-behavior tests. I deliberately avoided claiming runtime AI: AI is governed as a development accelerator through documentation-first rules, while client-facing decisions remain explainable and rules-based.

### 5 strongest resume bullets

- Conceived and architected StackScore, a custom technology-advisory operating platform spanning assessment, strategic planning, proposals, execution, executive reporting, billing, communications, and recurring vCIO service delivery.
- Translated a consulting methodology into versioned scoring and recommendation engines that preserve evidence lineage, surface critical exposure, deduplicate findings across reassessments, and convert technical observations into executive priorities.
- Designed a 70-model relational domain architecture with transactional orchestration, immutable report/proposal snapshots, state-machine governance, audit events, client-scoped authorization, and idempotent payment and communication integrations.
- Built the assessment-to-execution value chain: guided evidence capture, Technology Profiles, phased improvement plans, living roadmaps, versioned client proposals, projects, PDFs, score history, and quarterly business reviews.
- Established documentation-first governance for AI-assisted development, using explicit product constitutions, machine-readable rule catalogs, service boundaries, approval gates, migrations, and business-focused tests to control change in a complex domain.

Use “designed and built” only if that accurately reflects personal authorship. Do not attach performance or revenue numbers without external evidence.

## Prospective Client Positioning

StackScore is a practical example of turning a complex service process into one connected business system. It begins by capturing the information that matters, applies consistent decision rules, guides employees through the right workflow, produces polished client deliverables, controls approvals, tracks work and money, and preserves a history of results.

For a prospective client, its significance is not that every organization needs technology scoring. It demonstrates the ability to:

- learn how a specialized organization actually works;
- distinguish the core business lifecycle from incidental tasks;
- convert expert judgment into consistent rules without removing human approval;
- design different experiences for staff, executives, clients and prospects;
- connect operational data to proposals, projects, billing and reporting;
- integrate payments, email and external lead intake safely;
- preserve auditability and historical truth as the system changes;
- deliver an application that supports both daily operations and leadership decisions.

A concise client explanation: “StackScore takes a process that used to live across spreadsheets, notes, reports, proposals and billing tools and turns it into one guided workflow. It shows how I can understand your organization's unique operating model, design the right controls and data relationships, and build a custom system that makes the work more consistent, visible and measurable.”

## Implementation Evidence

The table below is the claim ledger for portfolio reuse.

| Capability / claim | Classification | Principal implementation evidence |
|---|---|---|
| Product mission and BTIL lifecycle | **PLANNED / DOCUMENTED and partially embodied** | `docs/00-Governance/DOC-001 - Product Vision.md`; `DOC-003`; `DOC-006`; routes/services below |
| Client/business discovery | **IMPLEMENTED** | `/clients`, `/clients/new`, `/clients/[id]/business-profile`; client/business-profile APIs; `Client`; `src/lib/business-profile/` |
| Guided assessment and autosave | **IMPLEMENTED** | `/assessments/[id]`; `assessment-wizard.tsx`; questions/response APIs; `Assessment`, `AssessmentResponse` |
| v1 and v2 assessment libraries | **IMPLEMENTED** | admin assessment library; `src/lib/assessment-library/`; `data/v2-question-library.json`; seed files |
| Versioned scoring | **IMPLEMENTED** | `ScoringEngineVersion`; `src/lib/scoring/index.ts`; `src/lib/scoring/v2/`; scoring tests |
| Critical-exposure warning | **IMPLEMENTED** | `AnswerOption.triggersCriticalFlag`; assessment completion services; result/report components |
| Atomic assessment completion | **IMPLEMENTED** | `src/lib/assessments/index.ts`; `complete-v2.ts`; complete API |
| Executive summary generation | **IMPLEMENTED, deterministic** | `src/lib/assessments/executive-summary.ts`; completion services; executive-summary tests |
| Rule-generated recommendations | **IMPLEMENTED, deterministic** | recommendation JSON catalogs; `src/lib/recommendations/`; recommendation models/tests |
| Cross-assessment recommendation dedupe/lineage | **IMPLEMENTED** | `sync.ts`, `dedupe.ts`; `RecommendationAssessmentTrigger`; dedupe tests |
| Projected score | **IMPLEMENTED as estimate** | `calculateProjectedScore`; recommendation projection functions; previews and tests |
| Technology Profile and snapshots | **IMPLEMENTED** | profile routes/pages; `src/lib/technology-profile/`; profile models/tests |
| Reassessment/history/comparison | **IMPLEMENTED** | reassessment service/form; history/compare routes and APIs; comparison and timeline tests |
| TIP builder and lifecycle | **IMPLEMENTED** | improvement-plan pages/APIs; `TechnologyImprovementPlan`; `src/lib/technology-improvement-plan/` |
| TIP pricing and roadmap engine | **IMPLEMENTED with catalog/default constraints** | TIP pricing and `roadmap-engine/`; service pricing catalog; pricing/roadmap tests |
| Living client roadmap | **IMPLEMENTED** | roadmap pages/APIs; roadmap models; `src/lib/client-roadmap/`; tests |
| Fully automatic proposal-to-project flow | **PARTIALLY IMPLEMENTED** | `src/lib/automation/workflow-registry.ts` labels partial/planned handoffs |
| Projects | **IMPLEMENTED** | project pages/APIs; `Project`; `src/lib/projects/service.ts`; completion report |
| TIP proposals | **IMPLEMENTED** | proposal page/APIs; `src/lib/proposals/service.ts`; TIP status fields |
| Versioned phase proposals and client approval | **IMPLEMENTED** | phase-proposal pages/APIs; model; service/snapshot/PDF; tests |
| E-signature provider | **NOT FOUND** | In-app signature JSON only in `phase-proposals/service.ts` |
| Assessment/TIP/proposal/QBR/invoice PDFs | **IMPLEMENTED** | export APIs; `src/lib/pdf/`; report/PDF tests |
| Progress/completion reports | **IMPLEMENTED in browser; dedicated PDF not established** | respective client routes; `src/lib/reports/progress/`, `completion/` |
| QBR generation | **IMPLEMENTED** | QBR pages/APIs; model; `src/lib/qbr/`; QBR tests |
| Client portal/workspace | **PARTIALLY IMPLEMENTED** | client role/scope helpers; portal and client workspace pages; two stub pages; portal tests |
| vCIO subscription/onboarding | **IMPLEMENTED / PARTIAL operationally** | vCIO offer/checkout/pages/APIs; `src/lib/vcio/`; subscription/onboarding models/tests |
| Manual invoices/payments/deposits/recurring services | **IMPLEMENTED** | billing pages/APIs/models/services/tests |
| Stripe payments/subscriptions | **IMPLEMENTED, configuration-dependent** | checkout routes; webhook; Stripe/billing/vCIO services; fulfillment tests |
| General accounting | **NOT FOUND** | No ledger or accounting connector |
| Email templates, queue and tracking | **IMPLEMENTED** | communications admin pages/APIs; `src/lib/communications/`; communication models/tests |
| Fully connected communications automation | **PARTIALLY IMPLEMENTED** | automation registry explicitly includes connected, scheduled, manual and missing-trigger states |
| Daily scheduled communications | **IMPLEMENTED, deployment-dependent** | `vercel.json`; `/api/cron/communications`; `CRON_SECRET` |
| Lead capture and conversion | **IMPLEMENTED** | snapshot/website lead pages/APIs; lead/prospect services and models |
| Website integration security | **IMPLEMENTED with in-memory limiting** | website lead integration route; auth/rate-limit/sanitize/schema services |
| Portfolio and client 360 intelligence | **IMPLEMENTED, deterministic** | `/portfolio`, `/insights`, `/clients/[id]/360`; `src/lib/portfolio/`; `commercial-intelligence/` |
| Technology catalog and client deployments | **IMPLEMENTED** | catalog pages/APIs; catalog/deployment models; `src/lib/technology-catalog/` |
| Automated vendor asset discovery | **NOT FOUND / PLANNED** | future integration docs only |
| Credentials authentication | **IMPLEMENTED** | Auth.js config/route; bcrypt; activation/reset flows |
| Admin/technician/client authorization | **IMPLEMENTED** | role enum; access/guard/permission services; route checks/tests |
| MFA / SSO | **PLANNED / DOCUMENTED** | RBAC/security spec; no provider/runtime found |
| Comprehensive platform rate limiting | **NOT FOUND** | only website-lead limiter located |
| Audit trails | **PARTIALLY IMPLEMENTED** | admin, billing, activity, phase-event and provider-event models/services; not universal |
| General file uploads/object storage | **NOT FOUND / PLANNED** | `Document` stores generated URLs; no upload/storage service found |
| Runtime generative AI | **NOT FOUND** | no model SDK/dependency/calls; deterministic logic only |
| AI-assisted development governance | **PLANNED / DOCUMENTED** | `docs/30-Architecture/DOC-129 – AI Development Rules & Engineering Constitution.md` |
| Tests/product maturity | **PARTIAL** | 111 test files; current run: 455 passed, 13 failed (468 total) |
| Production scale/load validation | **NOT FOUND** | older limits state 1–3 internal users; no load tests found |

## Gaps / Claims to Avoid

- Do not call StackScore an AI-powered recommendation or advisory engine. The implemented intelligence is deterministic and catalog/rule-driven; no runtime model integration was found.
- Do not claim automated integrations with Microsoft 365, NinjaOne, UniFi, a PSA, QuickBooks, Xero, or other asset/accounting platforms. They are documented future boundaries or catalog entries.
- Do not claim multi-tenant SaaS isolation. The architecture supports one consultancy's staff plus client-scoped users; it is not an independent-tenant platform.
- Do not claim every client portal section is complete. Activity and risks currently render a generic workspace stub, and the present test suite includes a client command-visibility regression.
- Do not claim fully automated proposal-to-project delivery, managed-service activation, implementation onboarding, or every email trigger. The registries mark several as partial, manual, missing-trigger, or planned.
- Do not call the pricing subsystem a full CPQ or the billing subsystem a full accounting/ERP replacement. Pricing includes configured defaults; billing lacks a general ledger and accounting integration.
- Do not claim legally binding electronic signatures. Proposal approval records an in-app signature payload, not a third-party e-signature workflow.
- Do not claim universal audit logging, durable platform-wide rate limiting, MFA, SSO, field-level database encryption, penetration testing, SOC 2, HIPAA compliance, or other certification without evidence outside this repository.
- Do not claim automated real-time infrastructure monitoring or continuous score updates. Reassessments and application events drive profile/history changes; external telemetry integrations are absent.
- Do not claim benchmark comparisons against an external customer population. Benchmark/intelligence frameworks are documented, but no external benchmark dataset or production cohort validation was found.
- Do not claim a general document-management system or file upload/storage layer. Generated documents and URLs are persisted; object storage/upload is not established.
- Do not repeat stale repository docs as current truth. `docs/50-Development/PROJECT_STATUS.md` and `KNOWN_LIMITATIONS.md` describe an earlier MVP and incorrectly list several now-coded domains as absent. Use them as history, not current status.
- Do not claim all tests pass. On August 9, 2026, 455/468 passed and 13 failed across seven files. No application code was changed during this analysis.
- Do not claim production adoption, customer count, assessment volume, revenue growth, conversion improvement, time savings, uptime, or ROI. The repository contains goals/demo data, not verified outcome metrics.
- Do not claim the full product was authored unaided or autonomously by AI. Repository evidence supports an AI-development governance approach, not attribution or productivity measurement.
- Do not call every documented feature implemented. Product and architecture documents intentionally include target-state specifications; an executable route, service, persistence path and appropriate UI/test evidence are required before using an implementation claim.
