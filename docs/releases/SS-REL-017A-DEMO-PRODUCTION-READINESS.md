# SS-REL-017A — Public Demo Production Readiness

| Field | Value |
| --- | --- |
| Project | StackScore |
| Branch | `staging` |
| Date | 2026-10-30 |
| Priority | High |
| Type | Release preparation (validation + documentation only) |
| Constraints honored | No production deploy · no branch merge · no Stripe/billing/scoring/schema changes · no new functionality |
| Staging tip (local = `origin/staging`) | `aa90298` — *ss-retry demo* |
| Production baseline observed | `https://stackscore.tech/demo` — legacy green interactive demo (main lineage) |
| Staging URL | `https://staging.stackscore.tech` (Vercel Deployment Protection — anonymous browser blocked) |

### Recommendation

# **CONDITIONAL GO — not demo-only**

The redesigned public demo on `staging` is the **product-owner-approved** visual direction and is **technically ready as part of a controlled staging→production promotion**.

It is **not safe to release the demo in isolation**. The demo reuses the redesigned authenticated customer compositions and rides on the same staging commit graph that includes customer portal UX, security work, and **three Prisma migrations**.

**Do not deploy to production until explicit deployment approval** after the dependency / migration / rollback gates below are accepted.

---

## 1. Approved demo implementation

### Verdict (code inspection + automated suites)

| Check | Status | Evidence |
| --- | --- | --- |
| Customer presentation components reused | **PASS** | `/demo/(workspace)/*` mounts `CustomerExecutiveDashboard`, `CustomerExploreExperience`, `CustomerRoadmapExperience`, `CustomerProjectsExperience`, `CustomerProjectDetail`, `CustomerReportsExperience`, `CustomerRecommendationsView` |
| Purple-first StackScore branding | **PASS (code)** | Customer portal tokens + brand system on staging (`PublicDemoShell`, brand CSS); PO approved staging visually |
| Current eight-pillar taxonomy | **PASS** | `PUBLIC_DEMO_PILLAR_SCORES` keys = `TECHNOLOGY_PILLARS` (Identity & Access … Technology Strategy) |
| Fictional data isolated | **PASS** | `src/lib/public-demo/{fixtures,provider,scoring,constants}.ts` — no Prisma queries; ids prefixed `demo-` / workspace `public-demo-northstar` |
| Overview / Explore / Roadmap / Projects / Reports functional | **PASS (code + tests)** | Workspace routes under `src/app/demo/(workspace)/**` |
| Nav resembles customer portal | **PASS (code)** | `PUBLIC_DEMO_PRIMARY_NAV`: Overview, Explore, Roadmap, Projects, Reports + DEMO ENVIRONMENT + Sign in |
| No real customer data | **PASS** | Fixture-only provider; sample notice in shell |
| No authenticated actions for anonymous visitors | **PASS** | Read-only pages; booking CTAs off; Sign in → `/login`; legacy PDF API **410** |

### Exact commit containing the approved demo implementation

| Role | SHA | Subject | Date |
| --- | --- | --- | --- |
| **Approved tip (include R2 retirement)** | `aa902983a24749b2c696e51f75ccea55c5fe0966` | ss-retry demo | 2026-10-30 |
| Customer-composition mount (R1) | `361b01d339fad09eecf119b02ec7a49fc0113e20` | ss-fix demo | 2026-10-30 |
| Public experience / purple brand wave | `c889f6a7ea4617982ff4bb65cff2039a9d403295` | SS-Public Experience | 2026-10-30 |
| Whole-number scoring display fix | `9c1fec7` | SS-Fix WHole # Scoring | — |
| Brand / visual foundation | `1ea1e38` | SS-Reskin | — |

**Canonical release candidate for the demo surface:** `staging` @ **`aa90298`** (matches `origin/staging` at validation time).

Supporting docs (already on branch):

- `docs/web/SS-WEB-003-PUBLIC-DEMO-ALIGNMENT.md`
- `docs/web/SS-WEB-003-R1-DEMO-PARITY.md`
- `docs/web/SS-WEB-003-R2-LEGACY-DEMO-RETIREMENT.md`

---

## 2. Public demo content audit

| Forbidden content | Staging public-demo status |
| --- | --- |
| Fictional implementation prices | **Absent** from `getPublicDemo*` payloads (automated scrub) |
| Monthly service cost estimates | **Absent** |
| Speculative financial projections | **Absent** |
| Misleading projected official scores | **Absent** (`projectedScore` / effective score fields not in workspace JSON) |
| Legacy assessment pillars (e.g. Strategy & Governance) | **Absent** from demo fixtures; production still shows them (see §7) |
| Legacy proposal simulations | Retired routes redirect; TIP marketing page no longer mounts |

Guardrails: `src/lib/public-demo/legacy-routes.ts` + `tests/public-demo/ss-web-003-r2-legacy-retirement.test.ts`.

**Not in scope / unchanged:** authenticated billing, Stripe, TIP pricing for real clients, service catalog pricing.

**Note:** “Living execution plan” remains on demo Overview hub copy because it matches the **current customer portal** wording (`CustomerExecutiveDashboard`), not the retired marketing tour.

---

## 3. Route migration plan

### Production today (`main` / `https://stackscore.tech`)

| Entry | Current behavior |
| --- | --- |
| `/demo` | Renders legacy `ProductOverviewExperience` (green interactive tour) |
| `/demo/[section]` | Legacy deep links into marketing tour |
| `/demo/technology-improvement-plan` | TIP marketing demo |
| `/demo/recommendations-workspace` | Marketing recommendations demo |
| `/demo/stackscore-case-study` | Portfolio preview |
| `/demo/design-system/phase-*` | Design-system previews |
| `/product-overview` | Redirect → `/demo` |
| `/api/product-overview/pdf` | Generates interactive-demo PDF (financial/proposal era) |
| Marketing CTAs | `buildDemoHref` / `stackscore-routes.demo` → `/demo` |

### Staging target (`aa90298`)

| Entry | Target behavior |
| --- | --- |
| `/demo` | Redirect → `/demo/overview` |
| `/demo/overview\|explore\|roadmap\|projects\|reports` | Customer-parity read-only workspace |
| `/demo/projects/[projectId]` | Sample project detail |
| `/demo/opportunities` | Shared recommendations view (fictional) |
| `/demo/[section]` | Maps to customer-parity paths via `LEGACY_DEMO_SECTION_REDIRECTS` |
| Retired `/demo/technology-improvement-plan`, `stackscore-case-study`, `design-system/phase-*` | `permanentRedirect` → `/demo/overview` |
| `/demo/recommendations-workspace` | `permanentRedirect` → `/demo/opportunities` |
| `/product-overview` (+ next.config rewrites) | Still lands on `/demo` → Overview |
| `/api/product-overview/pdf` | **HTTP 410 Gone** + pointer to `/demo/overview` |

After production promotion, **no obsolete marketing demo UI remains reachable** on those public paths.

---

## 4. Release dependency graph

```text
                         ┌─────────────────────────────────────┐
                         │  Production public demo (desired)   │
                         │  /demo → customer-parity workspace  │
                         └──────────────────▲──────────────────┘
                                            │
              ┌─────────────────────────────┴─────────────────────────────┐
              │                                                           │
   ┌──────────┴──────────┐                                   ┌────────────┴────────────┐
   │ Public demo adapters│                                   │ Shared customer UX      │
   │ src/lib/public-demo │                                   │ customer-portal/*       │
   │ public-demo shell   │──────────────────────────────────▶│ Explore / Roadmap /     │
   │ retired redirects   │                                   │ Projects / Reports      │
   └──────────┬──────────┘                                   └────────────┬────────────┘
              │                                                           │
              │                              ┌────────────────────────────┤
              │                              │ Brand / scoring display    │
              │                              │ purple tokens, formatMaturityScore
              │                              └────────────────────────────┤
              ▼                                                           ▼
   ┌──────────────────────┐                         ┌─────────────────────────────────┐
   │ Does demo need DB?   │                         │ Shipping this app binary needs  │
   │ Runtime: NO (fixtures│                         │ the rest of staging tip:        │
   │ only; Prisma types)  │                         │ · Customer nav/projects/roadmap │
   └──────────────────────┘                         │ · Security (SEC-003…007)        │
                                                    │ · 3 Prisma migrations (below)   │
                                                    │ · Stripe/env/ops commits also   │
                                                    │   present on staging tip        │
                                                    └─────────────────────────────────┘
```

### Required commits

- **Minimum coherent tip:** entire `main..staging` range ending at **`aa90298`** (**46 commits** at validation time).
- Demo-specific cluster (not sufficient alone): `c889f6a` … `aa90298` (public experience + WEB-003 + R1/R2 + logo polish).
- Hard prerequisites already on the tip: customer experience commits (`44c7310` … `056e5c6`, Explore/Roadmap/Projects, etc.).

### Shared components (must ship with demo)

- `src/components/customer-portal/**` (Overview, Explore, Roadmap, Projects, Reports, recommendations)
- `src/components/public-demo/public-demo-shell.tsx`
- `src/lib/public-demo/**`
- Brand / portal chrome tokens used by shell
- `formatMaturityScore` / `getCustomerMaturityLabel` / `TECHNOLOGY_PILLARS`

### Environment variables

- **No new demo-specific env vars.**
- `.env.example` delta vs `main` is email asset base commentary only (`EMAIL_ASSET_BASE_URL` default guidance) — not required to *render* `/demo`.
- Production must keep existing `AUTH_*`, `DATABASE_URL`, `NEXT_PUBLIC_APP_URL` consistent with DEPLOY.md.

### Database migrations (on tip vs `main`)

| Migration | Purpose | Demo runtime need | Ship-with-app need |
| --- | --- | --- | --- |
| `20260425010000_auth_rate_limit_bucket` | Auth rate-limit buckets | No | **Yes** if promoting SEC stack |
| `20261030100000_project_tasks_milestones_recommendations` | Project tasks/milestones/recs | No for fixture demo | **Yes** — customer project UX on same tip |
| `20261030120000_project_customer_updates` | Project customer updates | No for fixture demo | **Yes** — project comms on same tip |

`prisma/schema.prisma` also differs (+147/−3 lines vs `main`).

### Dependencies on unreleased customer UX

**Yes — absolute.** The public demo intentionally mounts the redesigned authenticated customer compositions. Promoting the demo without those components (or with production’s older portal) would break parity or fail to build.

### Risks to existing production workflows

| Risk | Severity | Notes |
| --- | --- | --- |
| Full staging tip replace of production | **High** | 46 commits include admin, Stripe info, security, client workspace — not “demo-only” |
| Prisma migrate on production Neon | **High** | Must run via normal Vercel build / `db:migrate:deploy`; irreversible without forward-fix |
| Legacy demo bookmark / PDF clients | **Medium** | Redirects + 410 are intentional; marketing materials linking to old tour UX will change |
| Authenticated customer portal visual change | **High** | Same compositions go live for real clients — confirm customer UX is also approved for prod |
| Stripe / billing code present on tip | **Medium** | Do not assume staging Stripe config matches production; validate separately before promote |

**Conclusion:** A direct “demo-only” cherry-pick is **not recommended**. Treat this as a **platform promotion** with the demo as one public surface.

---

## 5. Security validation

| Control | Status |
| --- | --- |
| Anonymous access to `/demo/*` workspace | Intended public (middleware matcher does not special-case auth for demo) |
| Fictional-data-only | Provider fixtures; no tenant `clientId` queries |
| Read-only | No demo mutation APIs; booking CTAs disabled |
| Tenant isolation | Demo never loads real Client rows |
| No payment actions in demo | No checkout CTAs in public demo shell; Sign in only |
| Legacy financial PDF | **410** |
| Auth/RBAC unchanged for this ticket | No auth logic edits in this readiness pass |

Auth / isolation regression suites: **PASS** (see §6).

---

## 6. Automated test results

Executed on `staging` @ `aa90298` (2026-10-30).

| Suite | Result |
| --- | --- |
| `tests/public-demo/**` (R0 + R1 + R2) | **34/34 pass** |
| Explore (`ss-ux-016*`) | **19/19 pass** |
| Roadmap (`ss-ux-007`) | **6/6 pass** |
| Projects (`ss-ux-012`, `ss-ux-014`) | **15/15 pass** |
| Reports (`ss-ux-008`) | **5/5 pass** |
| Auth (`api-client-isolation`, `rate-limit`, `activation`, `password-policy`, `continue-snapshot-security`) | **63/63 pass** |
| Tenant / lifecycle isolation | **2/2 pass** |
| Dashboard (`active-projects`) | **4/4 pass** |
| **Total above** | **148/148 pass** |
| `npm run lint` | **0 errors** (22 preexisting warnings) |
| `npm run build` | **PASS** |
| `npx tsc --noEmit` | **FAIL (preexisting)** — see below |

### Preexisting / unrelated TypeScript fixture failures

Errors confined to test fixtures (not `src/` app compile — build succeeded):

- `tests/qbr/pdf-export.test.ts` — `instanceof` typing
- `tests/recommendations/ss-content-002-batch1-publication.test.ts` — `priority: string` vs `Priority`
- `tests/technology-improvement-plan/tip-*.test.ts` — outdated `TipReportData` / `RiskSummary` / `ratingLabel` shapes
- `tests/technology-profile/overview.test.ts` — incomplete `TipRecommendationView` stubs

Also documented earlier: `tests/api/route-registry.test.ts` can fail when registry lists routes missing from the filesystem (project milestone/task paths) — **unrelated to demo readiness**.

---

## 7. Browser validation

### Deployed staging (`https://staging.stackscore.tech/demo/overview`)

**BLOCKED** — Vercel Authentication login interstitial (Deployment Protection). Anonymous agent cannot capture the approved purple demo from staging URL.

Product owner has already reviewed and approved the staging visual direction (per ticket).

### Production baseline (`https://stackscore.tech/demo`) — captured

Confirms the live public experience is still the **legacy green** interactive tour:

- Green “Demo Environment” / “Start Exploring” entry modal
- Nav: Overview, Assessment, Execution Plan, **Proposal**, Implementation, Improvement, **Budget**, Reports
- Pillars shown: Strategy & Governance, Infrastructure, Cybersecurity, … (legacy taxonomy)
- Sample company Northstar Manufacturing with score presentation tied to that tour

Screenshot: [`assets/ss-rel-017a/production-legacy-demo-overview.png`](assets/ss-rel-017a/production-legacy-demo-overview.png)

### Local `localhost:3000/demo/overview`

**BLOCKED** — HTTP 500 from existing local `npm run dev` process (environment/runtime issue; not used as release evidence).

### Manual checklist (operator — post-approval / pre-promote)

Run against staging with Vercel bypass or authenticated Vercel session, then again on production immediately after promote:

1. Anonymous: `/demo` → Overview; nav Overview/Explore/Roadmap/Projects/Reports.
2. Desktop 1440 / tablet 768 / mobile 390 — no horizontal breakage.
3. No `$` amounts, Budget tab, Proposal simulator, or legacy pillars in page content.
4. Sign in → `/login`; no checkout from demo chrome.
5. Hit each retired path → redirect; `/api/product-overview/pdf` → 410.
6. Side-by-side authenticated customer Overview vs `/demo/overview` for composition parity.

**Viewport matrix for new demo:** pending operator capture (staging protection / local 500).

---

## 8. Deployment risks

1. **Scope creep of the tip** — promoting demo promotes admin/security/projects/Stripe-related staging commits.
2. **Migrations** — production Neon must accept the three pending migrations cleanly.
3. **Customer UX blast radius** — real clients receive the redesigned portal compositions.
4. **External links** — partners/bookmarks expecting the green tour or PDF will change behavior.
5. **Cannot cherry-pick** without rebuilding adapters against production portal (would recreate a parallel demo — rejected by SS-WEB-003 lineage).

---

## 9. Rollback plan

| Layer | Action |
| --- | --- |
| App | Vercel **Promote previous Production deployment** (instant rollback of UI/routes) |
| Demo UX | Prior production deployment restores green `ProductOverviewExperience` at `/demo` |
| Database | **Do not reverse migrations.** If migrate already applied, keep schema; roll back app only. Forward-fix if a schema defect appears |
| PDF clients | 410 remains until rolled back with app; communicate Gone if needed |
| Comms | Have a short note ready: “Public demo now mirrors the customer workspace; proposal/budget tour retired” |

---

## 10. Go / no-go recommendation

| Question | Answer |
| --- | --- |
| Is the staging demo the approved product direction? | **Yes** (PO review) |
| Is demo code + tests ready at `aa90298`? | **Yes** |
| Can demo ship without customer UX + migrations? | **No** |
| Is anonymous staging URL browser-verified in this pass? | **No** (Vercel protection) |
| Production deploy now? | **NO — wait for explicit approval** |

### Gate before production deploy

1. Explicit written approval to promote **`staging` @ `aa90298`** (or a newer tip that still contains this demo) to production — accepting the **full dependency chain**, not demo-only.
2. Confirm customer portal UX on that tip is also approved for production.
3. Confirm production Neon migration plan for the three pending migrations.
4. Operator completes the browser checklist on staging (with protection bypass) at 1440/768/390.
5. Stripe/billing/ops owners acknowledge unrelated tip commits will ship together (or carve a narrower release branch — out of scope for this document).

### Final call

**CONDITIONAL GO** for public demo replacement **as part of an approved staging→production platform promotion**.

**NO-GO** for isolated demo deploy, merge without approval, or production promotion from this readiness ticket alone.

---

## Appendix A — Production vs staging demo contrast

| Dimension | Production (`stackscore.tech`) | Staging tip `aa90298` |
| --- | --- | --- |
| Brand accent | Legacy green | Purple-first customer chrome |
| Shell | Interactive marketing tour | `PublicDemoShell` ≈ customer portal |
| Primary nav | Tour sections incl. Proposal / Budget | Overview · Explore · Roadmap · Projects · Reports |
| Pillars | Legacy eight (Strategy & Governance, …) | Current `TECHNOLOGY_PILLARS` |
| Data | Marketing demo profiles | Northstar fixtures via `public-demo` provider |
| PDF API | Generates demo PDF | 410 Gone |

## Appendix B — Commands run

```bash
git rev-parse HEAD   # aa902983a24749b2c696e51f75ccea55c5fe0966
npm test -- tests/public-demo tests/ux/ss-ux-007-customer-roadmap-experience.test.ts \
  tests/ux/ss-ux-008-premium-customer-reports.test.ts \
  tests/ux/ss-ux-012-customer-projects-dashboard.test.ts \
  tests/ux/ss-ux-014-customer-project-experience.test.ts \
  tests/ux/ss-ux-016-explore-intelligence-center.test.ts \
  tests/ux/ss-ux-016-r1-explore-layout.test.ts \
  tests/auth/api-client-isolation.test.ts tests/auth/rate-limit.test.ts \
  tests/auth/activation.test.ts tests/auth/password-policy.test.ts \
  tests/auth/continue-snapshot-security.test.ts \
  tests/technology-lifecycle/lifecycle-route-isolation.test.ts \
  tests/dashboard/active-projects.test.ts
npm run lint
npx tsc --noEmit
npm run build
```
