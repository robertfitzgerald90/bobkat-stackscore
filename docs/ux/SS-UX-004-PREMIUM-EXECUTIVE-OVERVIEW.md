# SS-UX-004 — Premium Executive Overview Dashboard

**Branch:** `staging`  
**Date:** 2026-10-29  
**Status:** Implemented (staging only — no production deploy)  
**Precedents:** [SS-UX-001](./SS-UX-001-CUSTOMER-EXPERIENCE-ARCHITECTURE.md) §4, [SS-UX-002](./SS-UX-002-CUSTOMER-NAVIGATION-UNIFIED-LANDING.md), [SS-UX-003](./SS-UX-003-CUSTOMER-PORTAL-VISUAL-FOUNDATION.md)

**Constraints honored:** No migrations, scoring changes, recommendation catalog changes, PDF redesign, Explore drilldown implementation, staff dashboard redesign, customer projected maturity, or production deploy.

---

## 1. Dashboard architecture

Customer Overview (`/clients/{id}/technology-profile`) now renders a premium executive composition:

1. **Maturity hero** — company, official StackScore, DOC-119 label, assessed date, plain-language explanation, primary CTA  
2. **vCIO strip** (entitled only) — compact engagement summary, not a second home  
3. **Next recommended action** — single prominent action from customer next-action logic  
4. **Eight-pillar plane** — responsive 4×2 / 2 / 1 grid linking to Explore `?pillar=`  
5. **Priority opportunities** — top 3–5 active recommendations (critical/high first)  
6. **Strengths & exposure** — demonstrated (≥ Developing 55) or clearly labeled comparative relatives; lowest pillars as exposure  
7. **Roadmap progress** — official StackScore vs roadmap completion % with reassessment footnote  
8. **Workspace hub** — contextual links (Explore, Roadmap, Reports, lifecycle, vCIO when shown)

Visual system: SS-UX-003 `.customer-portal` theme, industrial major panels, phosphor accents, shell watermark unchanged.

Staff technology-profile view remains `TechnologyProfileDetailView` (unchanged).

```
technology-profile/page.tsx (client)
  → getCustomerOverview(clientId, role, companyName)
      → getTechnologyProfileDetail (audience-trimmed)
      → getClientRoadmapDashboard (optional)
      → getClientVcioEntitlement
      → buildCustomerOverviewFromDetail (pure)
  → <CustomerExecutiveDashboard overview={dto} />
```

---

## 2. Data service / DTO changes

| Module | Role |
| --- | --- |
| `src/lib/customer-portal/overview-dto.ts` | Types + pure `buildCustomerOverviewFromDetail` (unit-testable, no Prisma) |
| `src/lib/customer-portal/overview.ts` | `getCustomerOverview` service composition + re-exports |

### `CustomerOverviewDto` fields

- Official StackScore + DOC-119 maturity label + explanation  
- Assessment date labels  
- Eight canonical pillars (score, maturity, Explore href)  
- Priority opportunities (title, priority, detail href)  
- Demonstrated / comparative strengths  
- Roadmap progress + footnote  
- Next action  
- vCIO summary (`show` false for `NO_ACCESS`)

### Rules enforced in service layer

- Customer-active recommendation statuses for opportunity counts  
- `takeTopRecommendations` deterministic priority ordering (cap 5)  
- `selectDemonstratedAssessmentStrengths` (≥55 Developing)  
- Comparative relatives only when no demonstrated strengths, labeled distinctly  
- Roadmap % from `getClientRoadmapDashboard.metrics.completionPercent` when present; else journey progress  
- `resolveAudienceProjectedMaturityKpi` not used for customer KPI — projected maturity never assembled into DTO  
- No demo fixtures / marketing-demo imports  

Path helper: `clientExplorePillarPath(clientId, pillarCode)` → `/clients/{id}/explore?pillar={code}`.

---

## 3. Component inventory

| Component | Path |
| --- | --- |
| Dashboard shell | `src/components/customer-portal/customer-executive-dashboard.tsx` |
| Maturity hero | `…/overview/overview-maturity-hero.tsx` |
| Pillar grid | `…/overview/overview-pillar-grid.tsx` |
| Priorities | `…/overview/overview-priority-opportunities.tsx` |
| Strengths / exposure | `…/overview/overview-strengths-exposure.tsx` |
| Roadmap progress | `…/overview/overview-roadmap-progress.tsx` |
| vCIO strip | `…/overview/overview-vcio-strip.tsx` |
| Explore `?pillar=` | `src/app/(dashboard)/clients/[id]/explore/page.tsx` |

Shared primitives reused: `ClientPageShell`, `ClientSectionHeader`, `ClientEmptyState`, `ClientNextActionCard`, `ClientStatusBadge`, `CLIENT_*` / industrial tokens, `WorkspaceHubLinks`.

---

## 4. Demo patterns reused (presentation only)

| Demo / instrument idea | Customer implementation |
| --- | --- |
| Compact org + score hero density | `OverviewMaturityHero` + industrial surface |
| `PillarScoreGrid` 4×2 clickable tiles | `OverviewPillarGrid` with production `TECHNOLOGY_PILLARS` / scores |
| Instrument mono metrics | `CLIENT_METRIC_VALUE` / score color helpers |
| Corner / industrial framing | SS-UX-003 `customer-industrial-panel` on hero + roadmap |

**Not reused:** `northstarDemoDashboard`, `DemoPillar` IDs, `TechnologyScoreCard` projected toggle, marketing-demo fixtures, `useProductOverview`.

---

## 5. Customer authorization validation

| Control | Status |
| --- | --- |
| Page ownership (`user.clientId === route id`) | Preserved on Overview + Explore |
| Middleware JWT tenant check (SS-UX-002) | Unchanged |
| `getTechnologyProfileDetail(..., role)` client trim | Unchanged foundation |
| Recommendation visibility / active filters | Applied in DTO |
| vCIO strip gated on entitlement ≠ `NO_ACCESS` | Assessment-only customers do not see metrics strip |
| Staff Overview path | Still staff detail view; no customer DTO forced |

---

## 6. Responsive implementation

| Breakpoint | Pillars | Hero / sections |
| --- | --- | --- |
| Mobile | 1 column | Stacked hero + CTAs |
| Tablet (`sm`) | 2 columns | Two-column strengths/exposure |
| Desktop (`xl`) | 4×2 | Side-by-side score panel |

Focus-visible rings via portal theme; progress bars / links keyboard reachable; `motion-reduce` respected on transitions; watermark remains shell-level decorative (non-blocking).

---

## 7. Automated test results

```
vitest run
  tests/ux/ss-ux-004-premium-executive-overview.test.ts
  tests/ux/ss-ux-003-customer-portal-visual.test.ts
  tests/ux/ss-ux-002-customer-navigation.test.ts
  tests/customer-portal/next-action.test.ts
  tests/branding/assets.test.ts

Result: 5 files, 29 tests passed
```

SS-UX-004 coverage includes:

- Eight canonical pillars + Explore links  
- Priority cap / critical-first ordering  
- Demonstrated vs comparative strength rules  
- Roadmap footnote / no projected maturity in DTO  
- vCIO strip hidden for `NO_ACCESS`  
- Page wiring to `getCustomerOverview` (no demo imports)

---

## 8. ABC LLC staging regression (read-only)

Observed via `getCustomerOverview` + `getClientRecommendations` (no writes):

| Check | Result |
| --- | --- |
| Official StackScore | **39** |
| DOC-119 maturity | **Initial** |
| Pillars rendered | **8** canonical codes |
| Customer-visible recommendations | **57** |
| Priorities shown on Overview | **5** (capped; not full catalog) |
| Demonstrated strengths | Data Protection & Recovery |
| Customer projected maturity KPI | **null** |
| vCIO strip | Hidden (`NO_ACCESS` / assessment-only for this fixture) |
| Demo fixtures in data path | **None** |

---

## 9. Manual visual checklist

- [ ] Overview hero reads charcoal + phosphor; watermark subtle behind content  
- [ ] StackScore + Initial maturity + assessed date accurate for ABC LLC  
- [ ] Eight pillars; each opens Explore with correct `?pillar=` highlight  
- [ ] 3–5 priorities only; links open recommendation detail  
- [ ] Strengths use Developing+ evidence; comparative label never claims demonstrated maturity  
- [ ] Roadmap % distinct from StackScore; footnote visible  
- [ ] Next action matches real customer state  
- [ ] Entitled vCIO customer sees compact strip only (not competing dashboard)  
- [ ] Empty / in-progress assessment states (no fabricated scores)  
- [ ] Mobile / tablet / desktop; keyboard focus; no horizontal overflow  
- [ ] Staff workspace Overview/detail unchanged  
- [ ] Roadmap & Reports routes still work from hub links  

---

## 10. Remaining issues

1. **Explore drilldowns** still foundation-only — `?pillar=` selection/highlight only (full detail deferred).  
2. **Next-action ordering** still prefers assessment report before recommendations (existing `deriveCustomerNextAction`); product may later prefer roadmap continuation earlier.  
3. **ABC roadmap %** observed **0** when no customer-visible roadmap completion — journey fallback / empty roadmap semantics preserved.  
4. **Manual browser checklist** on staging preview still required.  
5. No production deployment from this ticket.

---

## Acceptance summary

| Requirement | Status |
| --- | --- |
| Premium executive Overview composition | Done |
| Service-layer DTO (no UI scoring) | Done |
| Real customer-authorized data only | Done |
| Eight pillars → Explore links | Done |
| Priorities 3–5, no full catalog | Done |
| Demonstrated strengths ≥55 | Done |
| Roadmap vs StackScore distinction | Done |
| Next action + empty states | Done |
| Compact vCIO strip when entitled | Done |
| SS-UX-003 theme preserved | Done |
| No projected maturity / no demo fixtures | Done |
| Staging only | Honored |
