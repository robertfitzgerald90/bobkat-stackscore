# Acme Foundation — Customer Portal Review Guide

Development-only demo environment for evaluating the StackScore customer portal before onboarding a real nonprofit client.

## Quick Start

### Prerequisites

1. Database migrated and library seeded:

```bash
npm run db:setup
```

2. Create or reset the Acme Foundation demo dataset:

```bash
npm run seed:demo-client
# or
npm run demo:reset
```

Both commands are **idempotent** — they remove only Acme Foundation demo records and recreate the full dataset.

### Demo Login

| Field | Development default | Override |
|-------|---------------------|----------|
| Email | `acme.foundation.demo@bobkatit.com` | `DEMO_CLIENT_EMAIL` |
| Password | `AcmeDemo2026!` | `DEMO_CLIENT_PASSWORD` |

Log in at `/login` using the **client** role account. The user has normal client authorization — not admin.

Staff review login (unchanged):

- `admin@bobkatit.com` / `SEED_ADMIN_PASSWORD`
- `technician@bobkatit.com` / `SEED_ADMIN_PASSWORD`

### Stable Identifiers

| Entity | ID |
|--------|-----|
| Client | `a0000001-0000-4000-8000-000000000001` |
| Client user | `a0000001-0000-4000-8000-000000000002` |
| Baseline assessment | `a0000001-0000-4000-8000-000000000011` |
| Current assessment | `a0000001-0000-4000-8000-000000000012` |
| Improvement plan (TIP) | `a0000001-0000-4000-8000-000000000020` |

Marker in notes/metadata: `DEMO:ACME_FOUNDATION`

## Production Safety

- Demo seed is **blocked** when `NODE_ENV=production` unless `ALLOW_DEMO_SEED=true`.
- Demo seed is **never** invoked from `prisma/seed.ts` automatically.
- Seeded communication records use `isTest: true` and metadata noting they are not live provider telemetry.

---

## Routes to Review

### As Acme Foundation client (`role: client`)

| Area | Route |
|------|-------|
| Landing / overview | `/clients/a0000001-0000-4000-8000-000000000001/technology-profile` |
| Recommendations | `/clients/a0000001-0000-4000-8000-000000000001/recommendations` |
| Reports hub | `/clients/a0000001-0000-4000-8000-000000000001/executive-reports` |
| Executive assessment report | `/assessments/a0000001-0000-4000-8000-000000000012/report` |
| PDF export | `/api/v1/assessments/a0000001-0000-4000-8000-000000000012/export/pdf` |
| Support / booking CTA | `/support` |

**Note:** Client navigation currently exposes only **Overview**, **Recommendations**, and **Executive Reports**. Other workspace routes exist for staff but redirect or show placeholders for clients (see findings below).

### As admin / technician

| Area | Route |
|------|-------|
| Client workspace home | `/clients/a0000001-0000-4000-8000-000000000001/technology-profile` |
| Assessments list | `/clients/a0000001-0000-4000-8000-000000000001/assessments` |
| Assessment compare | `/clients/a0000001-0000-4000-8000-000000000001/assessments/compare` |
| Recommendations (staff view) | `/clients/a0000001-0000-4000-8000-000000000001/recommendations` |
| Roadmap / TIP | `/clients/a0000001-0000-4000-8000-000000000001/roadmap` |
| Improvement plan detail | `/clients/a0000001-0000-4000-8000-000000000001/improvement-plan/a0000001-0000-4000-8000-000000000020` |
| Projects | `/clients/a0000001-0000-4000-8000-000000000001/projects` |
| Technology stack | `/clients/a0000001-0000-4000-8000-000000000001/assets` |
| Activity timeline | `/clients/a0000001-0000-4000-8000-000000000001/activity` |
| Assessment results | `/assessments/a0000001-0000-4000-8000-000000000012/results` |
| Assessment report | `/assessments/a0000001-0000-4000-8000-000000000012/report` |

---

## Seeded Data Summary

### Organization

- **Acme Foundation** — nonprofit, 18 employees, 2 locations (Houston, TX primary)
- MSP-supported hybrid environment centered on Microsoft 365
- Assigned consultant: existing `technician@bobkatit.com` as assessor; admin as plan author

### Assessments (V2 scoring, 80 questions, real completion pipeline)

| Assessment | Timing | Target overall |
|------------|--------|----------------|
| Acme Foundation Baseline Assessment | ~6 months ago | ~46–52 |
| Acme Foundation Technology Maturity Assessment | ~3 weeks ago | ~64–70 |

Pillar targets are tuned via realistic Yes / Partially / No response patterns across the canonical V2 library, then completed through `completeAssessmentV2`.

### Recommendations (11 curated)

Mix of **open**, **accepted** (planned), **in_progress**, **completed**, and **deferred** priorities covering endpoint management, backup, monitoring, identity, documentation, patching, incident response, wireless segmentation, quarterly reviews, roadmap, and vendor lifecycle.

One **completed** recommendation demonstrates progress (three-year roadmap).

### Roadmap / Improvement Plan

- **Acme Foundation 2026 Technology Improvement Plan** (status: `generated`)
- Three published phases: Stabilize and Protect · Improve Visibility and Governance · Optimize and Modernize

### Projects

| Project | Status |
|---------|--------|
| Microsoft 365 Security Baseline | Completed |
| Endpoint Management Deployment | In progress (~60%) |
| Backup and Recovery Standardization | Approved / planned |

### Communications (seeded records only)

Account activation, assessment completed, roadmap ready, project created — all marked `isTest: true`.

### Activity timeline

Nine client-visible events from account creation through active project updates.

### Technology stack

Ubiquiti UniFi (active), NinjaOne (planned), Uptime Kuma (active) — from technology catalog.

---

## Data States Represented

| State | Represented |
|-------|-------------|
| Completed current assessment | Yes |
| Historical baseline assessment | Yes |
| Score improvement / trend | Yes |
| Open recommendations | Yes |
| Completed recommendation | Yes |
| Accepted / planned recommendations | Yes |
| In-progress recommendation | Yes |
| Deferred recommendation | Yes |
| Published roadmap (TIP) | Yes (staff view) |
| Active project | Yes |
| Completed project | Yes |
| Planned project | Yes |
| Client-visible timeline events | Yes |
| Technology catalog assignments | Partial (3 catalog items) |
| Client-visible roadmap UI | **No** (placeholder page) |
| Client-visible projects UI | **No** (redirect) |
| Client-visible assessments list | **No** (redirect) |
| QBR / progress report PDFs | Not seeded |
| Live email provider telemetry | Not seeded (by design) |

---

## Authorization Checks Performed (Code Review)

| Check | Result |
|-------|--------|
| Client cannot access another client's workspace | Enforced in `clients/[id]/layout.tsx` |
| Client recommendations scoped to own `clientId` | Enforced server-side |
| Client assessment report scoped to own client | Enforced server-side |
| Admin nav hidden for client role in shell | Uses `getVisibleWorkspaceNav` |
| TIP investment/margin hidden from client audience | `buildInvestmentForRole` zeros client totals |
| Demo user role is `client` only | Seed creates client role |
| `/clients` portfolio list for client users | Redirects to own workspace from dashboard |

**Manual QA still required:** Log in as Acme client and confirm admin sidebar links, internal notes, campaigns, and pricing are not exposed in UI or API responses.

---

## Customer Portal Review Findings

### First Impression

- **Customer executive dashboard** on Overview is the strongest client-facing surface — maturity score, pillar insights, and immediate focus render with seeded data.
- **Premium SaaS feel:** Partial — dark-blue shell is cohesive, but limited navigation makes the portal feel narrower than the underlying data supports.
- **Next action clarity:** Recommendations and Reports pages include CTAs to book a strategy session; Overview should be validated for a single primary CTA hierarchy.

### Navigation

- **Critical gap:** Client sidebar shows only Overview, Recommendations, Executive Reports (`CLIENT_VISIBLE_WORKSPACE_SECTIONS`).
- Assessments, Projects, Roadmap, Journey, Documents, Activity, and Technology Stack are **staff-only in nav** even when data exists.
- **Mobile:** Same three-item nav — workable but hides most seeded value.

### Dashboard

- Overall score, pillar breakdown, and trend should display improvement from baseline (~49) to current (~67).
- Top priorities surface through recommendations linked to profile KPIs.
- Consultation booking via `/support` — verify `NEXT_PUBLIC_BOOKING_URL` is configured.

### Assessment Experience

- **Client cannot open assessments list** — redirected to overview (`assessments/page.tsx`).
- Historical comparison available to **staff** at `/clients/.../assessments/compare`.
- Executive report and PDF **are** client-accessible via Executive Reports.

### Recommendations

- Client-specific `CustomerRecommendationsView` renders business-friendly fields from seeded recommendations.
- Status and priority variety is reviewable.
- Internal consultant notes on TIP are stored in `wizardState` — verify they do not leak into client recommendation views.

### Roadmap

- **Client roadmap page is a placeholder** (“delivered after strategy session”) — seeded TIP is **not** shown to clients.
- Staff roadmap page lists the generated improvement plan with full phase detail.

### Projects

- **Client projects page redirects** to overview — active/completed projects are **not client-reviewable** in current UI.
- Staff projects page shows all three seeded projects.

### Reports

- On-screen executive report uses live rendering pipeline — review typography, pillar charts, recommendation section, and historical context.
- PDF export uses same data path — review page breaks, logo, and spacing manually.

### Dark Mode

- Review Overview, Recommendations, and Report in dark / midnight theme.
- Watch for low-contrast badges, table borders, and chart labels on navy surfaces.

### Mobile

- Test executive dashboard and report download on narrow viewport.
- Command palette and sidebar collapse behavior are secondary for this review.

### Missing Value (Client Expectations)

Clients would reasonably expect but **cannot currently find**:

1. Published roadmap / improvement plan
2. Active and completed projects
3. Assessment history and score comparison
4. Technology stack inventory (assets page redirects/blocks clients)
5. Activity timeline (staff-only page)
6. Documents library

---

## Critical Defects (for Portal-Polish Sprint)

1. **Client navigation scope** — only 3 of 13 workspace sections visible despite substantial seeded data.
2. **Roadmap placeholder** — generated TIP exists but client sees “coming after strategy session.”
3. **Projects and assessments blocked** — hard redirects prevent client self-service review.
4. **Assessment compare** — trend story exists in data but not in client UI.

---

## Recommended Portal-Polish Sprint (Next)

1. Expand `CLIENT_VISIBLE_WORKSPACE_SECTIONS` to include assessments, projects, roadmap, assets, activity.
2. Replace client roadmap placeholder with read-only TIP / roadmap phase view (client audience).
3. Add `CustomerProjectsView` and wire `/clients/[id]/projects` for client role.
4. Add client-safe assessment history + compare summary (executive-level, not assessor detail).
5. Unify executive reports hub with direct links to improvement plan PDF when generated.
6. Mobile pass on pillar charts, recommendation cards, and report reader.
7. Dark-mode contrast audit on badges, charts, and PDF preview.

---

## Files Reference

| Path | Purpose |
|------|---------|
| `prisma/demo/acme-foundation/` | Demo seed modules |
| `scripts/seed-demo-client.ts` | CLI entry point |
| `src/lib/assessments/complete-v2.ts` | Extended transaction timeout for large completions |

## Reset

```bash
npm run demo:reset
```

Removes **only** Acme Foundation demo records (matched by stable client ID or `DEMO_CLIENT_EMAIL`). Does not touch other development clients.
