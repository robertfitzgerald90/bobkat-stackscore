# SS-UX-001 — Customer Experience Architecture & Design Audit

**Branch:** `staging` (read-only)  
**Date:** 2026-10-28  
**Status:** Architecture & UX plan — **no implementation in this ticket**  
**Visual reference:** StackScore Interactive Demo (`/demo`) — charcoal + phosphor aesthetic  
**Precedents:** SS-REL-015 (customer trust), SS-REL-016 (DOC-119 maturity / reporting consistency)

---

## Purpose

Transform the existing customer portal into a premium, executive-friendly technology maturity platform while:

- Preserving all current customer functionality
- Keeping consultant/staff surfaces separated
- Reusing shared services and audience-aware helpers
- Avoiding catalog-based projected maturity on customer views
- Using the demo as a **visual reference only** (not assessment data)

---

## 1. Current portal inventory

### 1.1 Portal mode and shell

| Concern | Location | Behavior |
| --- | --- | --- |
| Customer mode | `src/lib/navigation/portal-mode.ts` | `role === "client"` |
| Shell | `DashboardShell` + `AppSidebar` | Shared `(dashboard)` layout |
| Staff workspace chrome | `ClientWorkspaceShell` / `ClientWorkspaceNav` | **Hidden** for customers |
| Sidebar items | `getCustomerSidebarNav` in `src/lib/navigation/sidebar-nav.ts` | 10 primary items |

### 1.2 Primary navigation today (customer sidebar)

| # | Label | Path |
| --- | --- | --- |
| 1 | Executive Briefing | `/clients/{id}/technology-profile` |
| 2 | Recommendations | `/clients/{id}/recommendations` |
| 3 | Technology Lifecycle | `/clients/{id}/lifecycle` |
| 4 | vCIO Dashboard | `/clients/{id}/vcio` |
| 5 | Living Execution Plan | `/clients/{id}/roadmap` |
| 6 | Business Reviews | `/clients/{id}/quarterly-reviews` |
| 7 | Projects | `/clients/{id}/projects` |
| 8 | Reports | `/clients/{id}/executive-reports` |
| 9 | Subscription & Billing | `/clients/{id}/billing` |
| 10 | Account | `/account` |

### 1.3 Landing / redirect behavior

```
/login (client)
  → /dashboard
    → onboarding incomplete? → /onboarding
    → vCIO entitlement active? → /clients/{id}/vcio
    → else → /clients/{id}/technology-profile  (CustomerExecutiveDashboard)

technology-profile + vCIO active → redirect → /vcio
/assessments/{id}/results (client) → redirect → technology-profile
/clients/{id} → technology-profile
```

**Confusion:** For vCIO subscribers, sidebar “Executive Briefing” immediately redirects to vCIO — two nav items, one destination.

### 1.4 Route → component → data map (customer)

| Route | Primary UI | Data / services | Auth notes |
| --- | --- | --- | --- |
| `/clients/{id}/technology-profile` | `CustomerExecutiveDashboard` | `getTechnologyProfileDetail` | Own `clientId`; vCIO redirect |
| `/clients/{id}/recommendations` | `CustomerRecommendationsView` | `getClientRecommendations` | Fail-closed visibility |
| `/clients/{id}/lifecycle` | `LifecycleDashboard` | `getTechnologyLifecycleDashboard` | Client-visible section |
| `/clients/{id}/vcio` | vCIO KPI page + panels | Prisma aggregate + `getClientVcioEntitlement` | Readable without full write access |
| `/clients/{id}/roadmap` (+ phase) | `RoadmapDashboard`, `PhaseWorkspace` | `getClientRoadmapDashboard` / phase detail | Consultant financials scrubbed |
| `/clients/{id}/quarterly-reviews` | Review cards | Generated QBRs only for clients | Empty without subscription |
| `/clients/{id}/projects` | `WorkspaceProjectsList` | Prisma + deliverable title filter | Visible section |
| `/clients/{id}/executive-reports` | Report hub card | Current assessment id | Links to on-screen report |
| `/assessments/{id}/report` | `AssessmentReportPreview` | `buildAudienceAssessmentReportData` | Own assessment |
| `/assessments/{id}` | `AssessmentWizard` (customer) | Prisma assessment | Onboarding required |
| `/clients/{id}/billing` | Billing + vCIO subscription panels | `loadBillingPage` | Billing section |
| `/account` | Appearance / account | Session | Global allowlist |
| `/support` | Help + booking | Support config | Allowlist |

### 1.5 Authorization layers

| Layer | Mechanism | Gap |
| --- | --- | --- |
| Middleware | `CLIENT_VISIBLE_WORKSPACE_SECTIONS` allowlist | Does **not** enforce `user.clientId === route clientId` |
| Page / API | Per-route `clientId` match / `requireClientWorkspaceAccess` | Defense-in-depth at app layer |
| Command palette | `canClientAccessPath` | Stricter; omits Lifecycle & Projects vs sidebar |
| vCIO write | `requireVcioFeatureWriteAccess` | Pages often still render read-only |

**Client-visible sections:** `overview`, `lifecycle`, `vcio`, `roadmap`, `quarterly-reviews`, `projects`, `recommendations`, `executive-reports`, `billing`.

### 1.6 Conditional vCIO features

| Access state | Customer experience |
| --- | --- |
| No access | vCIO page + alerts; Business Reviews empty |
| Payment / read-only | Historical data; edits blocked |
| Grace / full | Dashboard + Executive Briefing redirect to vCIO; write APIs allowed |

**Broken CTA:** vCIO “Complete Budget Planning” links to `/clients/{id}/assets`, which is **not** client-visible (middleware sends customers back to technology-profile).

### 1.7 Duplicated / confusing functionality

1. Executive Briefing vs vCIO home (redirect overlap for subscribers).
2. Reports hub vs `/assessments/{id}/report` vs PDF export (same deliverable, multiple entries).
3. Recommendations list vs roadmap initiatives vs projects (overlapping “what to do next”).
4. Lifecycle vs Journey vs Technology Profile (staff Journey redirects; customers still see Lifecycle).
5. Assessment results URL allowed at edge but redirects clients — dead end from email CTAs.
6. Ten primary nav items — cognitive overload for executives.
7. Billing + Account in primary nav alongside maturity work.

### 1.8 Assessment / report / PDF access today

- On-screen report: `/assessments/{id}/report` (`isCustomerView`, DOC-119 labels, projected maturity suppressed per SS-REL-015/016).
- PDF: `/api/v1/assessments/{id}/export/pdf` (audience-aware).
- Executive reports page: thin hub pointing at current assessment report.

---

## 2. Demo design analysis

### 2.1 What produces the visual design

| Layer | Path | Role |
| --- | --- | --- |
| Experience shell | `src/components/product-overview/product-overview-experience.tsx` | `/demo` composition |
| Theme | `.midnight` + `funnel-instrument` (`globals.css`, `funnel-instrument-theme.css`) | Charcoal surfaces, phosphor primary `#3ecf7a` |
| Tokens | `src/lib/client-ui/tokens.ts`, `polish-classes.ts` | Shared with portal polish |
| Hero “dashboard” | Compact `DemoDashboard` in `product-overview-hero.tsx` | Org header + score + **8-pillar grid** |
| Journey section | `DemoJourneyOverviewSection` (`#product-overview-dashboard`) | Not the full dashboard |
| Richer pillars | `AssessmentSection` | Status-colored 8-tile grid |
| Instrument POC | `src/components/design-system/instrument/*` | Sharper sandbox; mostly static |

**Accent note:** Demo uses **phosphor emerald**, not violet. Authenticated app default remains Bobkat blue. Proposed redesign should introduce a **customer portal theme scope** (not Bobkat marketing metal aesthetic).

### 2.2 Static vs live

| Tier | Content |
| --- | --- |
| Fixtures | `northstarDemoDashboard`, scenario TS, marketing-demo Acme data |
| Personalization | Company name / industry patches in client state |
| Session-local | Interactive phase completion / effective score simulation |
| **Not used on `/demo`** | Prisma assessments, real recommendations, real roadmaps |

### 2.3 Reuse vs recreate

| Reuse | Recreate / bridge |
| --- | --- |
| `PillarScoreGrid` layout pattern | Demo pillar IDs (`cybersecurity`, …) ≠ v2 codes |
| `TechnologyScoreCard` presentation ideas | Full non-compact `DemoDashboard` (implemented but unwired) |
| `CLIENT_*` tokens, card hover patterns | Marketing-demo 6-pillar TIP fixtures |
| Production `TECHNOLOGY_PILLARS` + `buildPillarInsights()` | Direct fixture binding to customer data |
| `assessment-results` / score panel patterns | Violet accents (not in demo code — optional product choice) |

### 2.4 Eight-pillar layout → real data

**Canonical pillars** (`src/lib/technology-maturity/pillars.ts`):

1. Identity & Access  
2. Endpoint Management  
3. Network & Connectivity  
4. Data Protection & Recovery  
5. Productivity & Collaboration  
6. Security Operations  
7. Documentation & Knowledge  
8. Technology Strategy  

**Binding approach (recommended):**

```
Assessment / TechnologyProfile
  → buildPillarInsights() / PillarScoreSnapshot
  → adapter → portal pillar tiles (DOC-119 labels, score, status color)
  → click → pillar detail DTO (lib service, not UI scoring)
```

Do **not** map demo marketing pillar names 1:1; use v2 codes as IDs.

### 2.5 Responsive behavior (demo)

- Pillars: 1 → `sm:2` → `xl:4`
- Compact dashboard hides secondary cards on small screens
- Sticky shell + mobile sheet menu
- Gaps: tablet is mostly Tailwind stacking; no dedicated tablet composition; hero still uses blue radial glow under phosphor theme

---

## 3. Proposed information architecture

### 3.1 Primary navigation (simplified)

| Nav | Purpose | Maps from today’s routes |
| --- | --- | --- |
| **Overview** | Executive maturity summary | `technology-profile` / Executive Briefing (+ vCIO summary strip when entitled) |
| **Explore** | Eight pillars + drilldowns | New surface; absorbs pillar insights currently buried in briefing / staff results |
| **Roadmap** | Prioritized actions + implementation tracking | Merges customer mental model of Recommendations + Living Execution Plan + (optionally) Projects as nested views |
| **Reports** | History, PDFs, QBRs, assessment report | `executive-reports` + assessment report + quarterly reviews as tabs/sections |

### 3.2 Secondary navigation

| Item | Location |
| --- | --- |
| Account | Secondary / user menu (`/account`) |
| Billing & subscription | Secondary (`/clients/{id}/billing`) |
| Support | Secondary / help (`/support`) |
| Assessment wizard (in progress) | Contextual CTA, not primary nav |
| vCIO onboarding | Contextual when entitlement requires it |

### 3.3 Conditional / entitled surfaces (not removed)

| Feature | Placement in new IA |
| --- | --- |
| vCIO Dashboard KPIs | Overview “Engagement” module when entitled; else hidden |
| Business Reviews (QBR) | Reports → Business Reviews |
| Projects | Roadmap → Projects (or Roadmap sub-nav) |
| Lifecycle | Overview secondary module **or** Explore “lifecycle lens” — must not disappear; default: Overview accordion / Reports history companion |
| Phase proposals | Roadmap deep link (keep route; add from Roadmap) |

### 3.4 Route preservation matrix

| Existing route | Action | Replacement / home in new IA |
| --- | --- | --- |
| `/technology-profile` | Keep; become Overview | Overview |
| `/vcio` | Keep; entitled Overview module + deep link | Overview (engaged) |
| `/recommendations` | Keep; become Roadmap → Opportunities | Roadmap |
| `/roadmap` (+ phases) | Keep | Roadmap |
| `/projects` | Keep | Roadmap → Projects |
| `/lifecycle` | Keep | Overview or Explore companion |
| `/executive-reports` | Keep | Reports hub |
| `/quarterly-reviews`, `/quarterly-review/{id}` | Keep | Reports → Reviews |
| `/billing*`, `/account`, `/support` | Keep | Secondary |
| `/assessments/{id}`, `/report` | Keep | Contextual + Reports |
| `/assessments/{id}/results` | Keep redirect | Overview |
| `/portal/*` | Keep redirects | Legacy aliases |

**Rule:** No route deletion in implementation tickets without an explicit redirect to its IA home.

### 3.5 Staff separation

- Staff DOC-201 workspace nav and TIP wizard remain unchanged.
- Customer IA must not expose stub recommendations, unfinished TIP state, or catalog projected maturity (SS-REL-015/016).
- Consultant financial speculation remains consultant-only.

---

## 4. Executive overview specification

### 4.1 Goals

Answer in one viewport:

1. What is our official StackScore and maturity level?
2. Where are we strong / exposed across eight pillars?
3. What should we do next (few priorities, not 57 cards)?
4. How is roadmap work progressing (without rewriting StackScore)?

### 4.2 Content blocks (premium composition)

| Block | Content | Source | Rules |
| --- | --- | --- | --- |
| **Hero maturity** | StackScore number + DOC-119 label + assessment date | Profile / latest completed assessment | No Rating labels; no projected maturity |
| **Eight pillars** | Compact score tiles | `buildPillarInsights` | Click → Explore detail |
| **Priority opportunities** | Top 3–5 critical/high active opportunities | Filtered recommendations | Not full catalog dump |
| **Demonstrated strengths** | Pillars ≥ Developing (55) | `selectDemonstratedAssessmentStrengths` | Omit section if empty |
| **Comparatively stronger areas** | Relative top pillars when no demonstrated strengths | New helper (requires dual-framing approval from SS-REL-016) | Labeled distinctly from strengths |
| **Roadmap progress** | % + current phase name | Roadmap metrics / journey | Footnote: official StackScore updates on reassessment |
| **Reassessment context** | Last assessed + next recommended | Profile | Clear CTA |
| **Next step** | Single primary action | `deriveCustomerNextAction` / booking | One job |

### 4.3 Explicit exclusions

- Catalog-impact projected StackScore KPIs
- Full 57-recommendation list on landing
- Staff TIP wizard state
- Financial speculation for customers
- Distressed metal / Bobkat marketing aesthetic

### 4.4 Visual hierarchy (first viewport)

1. Brand / product presence + StackScore hero  
2. One supporting sentence (maturity meaning)  
3. CTA group (View report / Start next action)  
4. Eight-pillar plane as dominant visual structure  

Avoid first-viewport stat clutter beyond maturity + next action.

### 4.5 vCIO overlay (entitled only)

Compact engagement strip: review cadence, unlocks, link into existing vCIO routes — **not** a second competing home page. Prefer Overview as the single landing for all customers.

---

## 5. Pillar drilldown specification

### 5.1 Interaction

- Overview / Explore: select pillar tile → detail panel (drawer on mobile, split pane or route `/explore/{pillarCode}` on desktop).
- Deep-linkable for share/support.

### 5.2 Detail contents

| Field | Source | Notes |
| --- | --- | --- |
| Pillar name | `TECHNOLOGY_PILLARS` | Canonical |
| Maturity score | Pillar percent / snapshot | Official assessment evidence |
| DOC-119 classification | `getCustomerMaturityLabel(score)` | Same vocabulary as overview |
| Plain-language summary | `businessQuestion` + score-band copy | Lib-authored, not LLM-invented in UI |
| Biggest demonstrated strength | High-scoring questions / pillar ≥55 | Evidence-based; omit if unsupported |
| Biggest weakness | Lowest evidence / critical flags in pillar | Assessment answers + pillar score |
| Implementation complexity | See §5.3 | Must not invent from priority/impact |
| Improvement opportunities | Active recs mapped to pillar | Audience-filtered |
| Recommended next actions | Top 1–3 by priority within pillar | Link to Roadmap |

### 5.3 Implementation complexity — methodology decision

**Investigated sources**

| Source | What it provides | Usable for Easy / Moderate / Complex? |
| --- | --- | --- |
| Recommendation `priority` | Risk urgency | **No** — not effort |
| `estimatedImpactPoints` | Catalog planning weight | **No** — not effort |
| `SolutionPlaybookCatalog.effortLevel` | `low` / `medium` / `high` + week ranges per **service playbook** | **Partial** — coarse, service-mapped via `suggestedService` |
| Playbook `estimatedEffortWeeks` | Band strings (e.g. `4-8`) | Supporting context only |
| Recommendation catalog | No per-template effort field | Gap |
| Schema / Prisma | No effort/complexity enums on recommendations | Gap |
| TIP dependency graph | Priority scoring mentions blocking dependency conceptually; no customer-ready dependency model found | Not ready |

**Recommendation (requires product approval before build):**

1. **Preferred short-term (if approved):** Map playbook `effortLevel` → customer labels:  
   - `low` → Easy  
   - `medium` → Moderate  
   - `high` → Complex  
   Resolve playbook via existing `resolvePlaybookIdForService(suggestedService)`.  
   Show complexity **per opportunity** (or modal average for pillar) with footnote: “Based on BobKat service playbook effort bands, not a custom estimate for your environment.”

2. **If playbook mapping rejected:** Omit complexity from customer UI until a governed catalog field exists (per-template effort + optional dependencies). Do **not** derive from priority or impact points.

3. **Longer-term (separate content ticket):** Author `implementationComplexity` on recommendation templates + optional dependency codes; version in catalog governance.

**Unresolved until approval:** Whether pillar-level complexity is max, mode, or omitted when mixed playbooks exist.

### 5.4 Evidence rules (strengths / weaknesses)

- Strengths: absolute DOC-119 Developing+ (SS-REL-016) unless dual framing approved.
- Weaknesses: lowest pillar scores and/or critical exposure in pillar questions.
- Never use remediation titles as “strengths.”

---

## 6. Data architecture

### 6.1 Principles

- UI stays thin; DTOs assembled in `src/lib/**`.
- Prefer existing audience-aware helpers (`customer-facing-report`, `customer-reporting`, `customer-trust`, visibility filters).
- No duplicate scoring or recommendation engines in components.
- Preserve Client tenant isolation and fail-closed client deliverables.

### 6.2 Proposed service composition

| Portal need | Preferred service / builder | Notes |
| --- | --- | --- |
| Overview aggregate | Extend or wrap `getTechnologyProfileDetail` | Already audience-trimmed for clients |
| Pillar tiles + detail | `buildPillarInsights` + new `buildCustomerPillarDetail` | Answers via assessment responses query |
| Priority opportunities | `getClientRecommendations` + `countCustomerRecommendations` | Active statuses only |
| Strengths | `selectDemonstratedAssessmentStrengths` | Absolute threshold |
| Comparative areas | New optional helper | Gated by product approval |
| Roadmap progress | `getClientRoadmapDashboard` | Official vs progress language |
| Reports list | Profile current assessment + documents + QBR list | Existing loaders |
| Entitlements | `getClientVcioEntitlement` / `getVcioFeatureAccess` | Conditional modules |
| Account / billing | `loadBillingPage` + session | Secondary nav |

### 6.3 Suggested DTO sketch (implementation later)

```ts
// Conceptual — not implemented in SS-UX-001
type CustomerOverviewDto = {
  stackScore: number | null;
  maturityLabel: string | null; // DOC-119
  assessedAt: string | null;
  nextRecommendedAssessmentAt: string | null;
  pillars: CustomerPillarTile[];
  priorityOpportunities: CustomerOpportunitySummary[]; // max 5
  demonstratedStrengths: string[];
  comparativeStrongerAreas?: string[]; // optional
  roadmapProgressPercent: number | null;
  nextAction: CustomerNextAction;
  entitlements: { vcio: VcioAccessState };
};

type CustomerPillarDetailDto = {
  code: TechnologyPillarCode;
  name: string;
  score: number | null;
  maturityLabel: string | null;
  summary: string;
  demonstratedStrength: string | null;
  biggestWeakness: string | null;
  opportunities: CustomerOpportunitySummary[];
  complexityByOpportunity?: Array<{ id: string; label: "Easy" | "Moderate" | "Complex"; source: "playbook" }>;
};
```

### 6.4 Authorization

- All loaders take `role` + `clientId`; clients only own tenant.
- Recommendation presentation always through `filterClientDeliverableRecommendations` / role presenters.
- Middleware tenant match should be hardened in a dedicated reliability ticket (noted in risks) — out of UX redesign scope but relevant.

---

## 7. Design system recommendations

### 7.1 Direction

| Attribute | Recommendation |
| --- | --- |
| Base | Premium dark charcoal (demo midnight / funnel-instrument) |
| Accents | Restrained phosphor emerald; optional soft violet for secondary highlights only if contrast-validated |
| Typography | Strong hierarchy; metric mono (`instrument-mono` / tabular nums); avoid default Inter-only look |
| Surfaces | Clean cards, subtle borders, restrained depth — not heavy multi-shadow |
| Radius | Prefer tighter instrument radii for “instrumented SaaS” feel |
| Motion | 2–3 intentional transitions (pillar hover, drawer open, score reveal) |
| Brand | StackScore product presence as hero signal on Overview |
| **Do not** | Apply Bobkat IT distressed metal-show marketing aesthetic inside the app |

### 7.2 Theme strategy

1. Introduce a **customer portal theme scope** (e.g. `.customer-portal` or reuse `.midnight` under customer layout) so staff Bobkat-blue tooling can remain.
2. Reuse `CLIENT_*` tokens; extend rather than fork.
3. Extract a production `PillarTile` / `MaturityHero` from demo patterns without importing demo fixtures.

### 7.3 Accessibility

- Contrast AA for emerald-on-charcoal text and badges
- Focus rings on pillar tiles and drawers
- Keyboard drilldown (Enter/Space)
- Reduced-motion respect (`motion-reduce` already in tokens)
- Mobile: single-column Overview; pillar drawer full-screen

### 7.4 Responsive targets

| Breakpoint | Overview | Explore |
| --- | --- | --- |
| Mobile | StackScore hero → next action → pillar list | Full-screen detail |
| Tablet | 2-column pillars | Split or drawer |
| Desktop | 4×2 pillar plane + side priorities | Persistent detail pane |

---

## 8. Phased implementation backlog

Complexity scale: **S** (<2d) · **M** (2–5d) · **L** (1–2w) · **XL** (>2w)

### Priority 1 — Navigation architecture

#### UX-001-T1 — Customer primary nav restructure
- **Objective:** Implement Overview / Explore / Roadmap / Reports primary IA; move billing/account/support to secondary.
- **Affected:** `sidebar-nav.ts`, `app-sidebar.tsx`, `page-titles.ts`, command palette `client-portal.ts`, middleware allowlist if new sections added.
- **Data:** None (routing only).
- **Auth:** Preserve `CLIENT_VISIBLE_WORKSPACE_SECTIONS`; add aliases/redirects; no feature removal.
- **Acceptance:** Four primary items; secondary contains billing/account/support; all old URLs redirect to IA homes; vCIO entitled users still reach engagement surfaces.
- **Tests:** Sidebar nav unit tests; middleware path tests; redirect tests.
- **Complexity:** M

#### UX-001-T2 — Unify customer landing
- **Objective:** Single Overview landing for assessment-only and vCIO-entitled customers (vCIO as module, not competing home).
- **Affected:** `dashboard/page.tsx`, `technology-profile/page.tsx`, vCIO redirects.
- **Data:** `getClientVcioEntitlement`.
- **Auth:** Entitlement gates modules, not entire home.
- **Acceptance:** No Executive Briefing → vCIO bounce loop; sidebar Overview always lands on Overview.
- **Tests:** Redirect matrix for entitlement states.
- **Complexity:** M

### Priority 2 — Executive overview

#### UX-001-T3 — Customer Overview composition
- **Objective:** Premium Overview matching §4 (StackScore, DOC-119, 8 pillars, top opportunities, strengths, roadmap progress, next action).
- **Affected:** `customer-executive-dashboard.tsx` (or replacement), executive-os components, possibly new `customer-overview/*`.
- **Data:** `getTechnologyProfileDetail`, recommendations filter, roadmap dashboard summary.
- **Auth:** Client audience only; suppress projected maturity.
- **Acceptance:** No projected maturity; ≤5 priority opportunities; demonstrated strengths omit when empty; DOC-119 labels only.
- **Tests:** Overview DTO / presentation tests; ABC fixture smoke (39 / Initial / no projected 100).
- **Complexity:** L

#### UX-001-T4 — Customer portal theme scope
- **Objective:** Apply charcoal + phosphor theme to customer shell without restyling staff app.
- **Affected:** Customer layout / globals theme scope, tokens.
- **Data:** None.
- **Auth:** N/A.
- **Acceptance:** Customer pages match design direction; staff pages unchanged; contrast checks pass.
- **Tests:** Visual smoke / token class presence tests where practical.
- **Complexity:** M

### Priority 3 — Pillar drilldowns

#### UX-001-T5 — Explore pillars grid + detail route/panel
- **Objective:** Interactive 8-pillar experience with deep links.
- **Affected:** New Explore page/components; adapter from `buildPillarInsights`.
- **Data:** Profile pillar snapshots; recommendations by pillar; optional assessment answers for evidence blurbs.
- **Auth:** Own client; client deliverable filter.
- **Acceptance:** All eight v2 pillars; DOC-119 labels; evidence-based strength/weakness; mobile drawer.
- **Tests:** Pillar adapter unit tests; visibility tests.
- **Complexity:** L

#### UX-001-T6 — Complexity methodology (approval-gated)
- **Objective:** If approved, map playbook `effortLevel` → Easy/Moderate/Complex on opportunities; else omit.
- **Affected:** Lib helper near playbooks; Explore detail UI.
- **Data:** `SolutionPlaybookCatalog` via `resolvePlaybookIdForService`.
- **Auth:** N/A.
- **Acceptance:** Never uses priority/impact as complexity; footnote present; missing service → “Not classified”.
- **Tests:** Mapping table tests; no-invention guards.
- **Complexity:** S–M (after approval)

### Priority 4 — Recommendation exploration

#### UX-001-T7 — Roadmap → Opportunities experience
- **Objective:** Executive-friendly exploration of improvement opportunities with status semantics (open / accepted / in progress / completed).
- **Affected:** `customer-recommendations-view.tsx`, Roadmap IA entry.
- **Data:** `getClientRecommendations`, `countCustomerRecommendations`.
- **Auth:** Fail-closed stubs.
- **Acceptance:** Clear counts; no catalog projected sum-as-score; links to pillar context.
- **Tests:** Count semantics + visibility regressions.
- **Complexity:** M

### Priority 5 — Roadmap integration

#### UX-001-T8 — Roadmap progress + phase tracking polish
- **Objective:** Align Roadmap UI with Official StackScore vs Roadmap Progress language; integrate projects/phases under Roadmap.
- **Affected:** `roadmap-dashboard`, `phase-workspace`, projects entry points.
- **Data:** `getClientRoadmapDashboard`.
- **Auth:** Consultant financials remain consultant-only.
- **Acceptance:** Customers understand progress ≠ reassessment; projected maturity stays suppressed.
- **Tests:** Customer projection / labeling tests (extend SS-REL-015/016).
- **Complexity:** M

### Priority 6 — Reports experience

#### UX-001-T9 — Reports hub consolidation
- **Objective:** One Reports home: assessment history, on-screen report, PDF, QBRs.
- **Affected:** `executive-reports`, quarterly-reviews linking, email CTAs ideally → Reports/Overview.
- **Data:** Profile assessment ids, QBR list, PDF route.
- **Auth:** Own client; generated QBRs only.
- **Acceptance:** No duplicate competing report entry points in primary nav; all legacy links work.
- **Tests:** Hub link resolution; PDF audience suppress flag.
- **Complexity:** M

### Priority 7 — Responsive & accessibility validation

#### UX-001-T10 — Responsive + a11y pass
- **Objective:** Validate mobile/tablet/desktop compositions and accessibility.
- **Affected:** Overview, Explore, Roadmap, Reports.
- **Data:** N/A.
- **Auth:** N/A.
- **Acceptance:** Keyboard pillar drilldown; focus states; contrast; no horizontal overflow; reduced motion.
- **Tests:** Playwright/smoke where available; checklist in deliverable update.
- **Complexity:** M

### Supporting / hardening (parallel)

#### UX-001-T11 — Fix client-invisible vCIO assets CTA
- **Objective:** Replace `/assets` CTA with a client-visible target (billing/roadmap/support).
- **Complexity:** S

#### UX-001-T12 — Middleware tenant match for `/clients/{id}`
- **Objective:** Enforce `session.clientId` at edge (reliability; recommended alongside UX).
- **Complexity:** M

---

## 9. Risks and unresolved design decisions

| ID | Risk / decision | Recommendation |
| --- | --- | --- |
| D1 | Dual home (Briefing vs vCIO) | Resolve in T2 — single Overview |
| D2 | Comparative vs demonstrated strengths | Needs product approval (SS-REL-016) |
| D3 | Implementation complexity source | Playbook effort mapping vs omit until catalog field |
| D4 | Violet accent in product brief vs demo phosphor-only | Prefer phosphor; violet optional secondary after contrast QA |
| D5 | Lifecycle placement in 4-item nav | Keep route; park under Overview/Reports companion |
| D6 | Theme split staff blue vs customer charcoal | Scoped theme required to avoid staff regression |
| D7 | Middleware lacks tenant check | Reliability ticket T12 |
| D8 | Email still points at `/results` | Point to Overview/Reports in communications follow-up |
| D9 | Demo pillar taxonomy drift | Never bind demo fixture IDs to production |
| D10 | Scope creep into PDF visual redesign | Out of scope; keep report data consistency only |

---

## Appendix A — Current vs proposed nav (executive view)

```text
TODAY (10 items)                    PROPOSED (4 primary)
─────────────────                   ────────────────────
Executive Briefing                  Overview
Recommendations                       ├─ (vCIO module if entitled)
Technology Lifecycle                  └─ lifecycle companion
vCIO Dashboard                      Explore (8 pillars)
Living Execution Plan               Roadmap
Business Reviews                      ├─ Opportunities
Projects                              ├─ Plan / phases
Reports                               └─ Projects
Subscription & Billing              Reports
Account                               ├─ Assessment report / PDF
                                      └─ Business reviews
                                    ── secondary ──
                                    Billing · Account · Support
```

---

## Appendix B — Acceptance anchors (ABC LLC staging)

When implementation begins, regress against ABC LLC observations (not hardcoded in app logic):

- Official StackScore **39** / DOC-119 **Initial**
- **57** triggered recommendations available in exploration — **not** all on Overview
- No customer projected maturity **100**
- Email strengths remain evidence-based
- Consultant workflows unchanged

---

## Appendix C — Out of scope for SS-UX-001

- Application code changes (this ticket is read-only)
- Database migrations / scoring / recommendation metadata edits
- Production deployment
- PDF visual redesign
- Bobkat marketing site restyle
- Removing customer features without IA remapping

---

**End of SS-UX-001**
