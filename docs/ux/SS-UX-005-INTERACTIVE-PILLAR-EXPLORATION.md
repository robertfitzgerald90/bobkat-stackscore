# SS-UX-005 — Interactive Technology Pillar Exploration

**Branch:** `staging`  
**Date:** 2026-10-29  
**Status:** Implemented (staging only — no production deploy)  
**Precedents:** [SS-UX-003](./SS-UX-003-CUSTOMER-PORTAL-VISUAL-FOUNDATION.md), [SS-UX-004](./SS-UX-004-PREMIUM-EXECUTIVE-OVERVIEW.md)

**Constraints honored:** No migrations, scoring changes, recommendation catalog changes, automatic roadmap modifications, PDF redesign, staff dashboard redesign, customer projected maturity, or production deploy.

---

## 1. Architecture

```
/clients/{id}/explore?pillar={code}
  → page ownership check (customer)
  → getCustomerExplore(clientId, role, companyName, pillar)
      → getTechnologyProfileDetail (scores / pillar insights)
      → per pillar: assessment responses (category.code) + getClientRecommendations({ pillarCode })
      → buildCustomerPillarDetail (pure)
  → <CustomerExploreExperience /> (client)
      → eight PillarTile grid (equal height)
      → desktop: adjacent PillarDetailPanel
      → mobile: full-screen detail dialog
      → router.push(?pillar=) for history / deep links
```

Visual system: SS-UX-003 customer portal theme + shared `PillarTile` with Overview grid.

---

## 2. Data sources

| Need | Source |
| --- | --- |
| Pillar score / status | `buildPillarInsights` via `getTechnologyProfileDetail` |
| DOC-119 maturity | `getCustomerMaturityLabel(score)` |
| Question evidence | `AssessmentResponse` where `question.category.code === pillarCode` |
| Recommendations | `getClientRecommendations(clientId, { pillarCode }, role)` + visibility filters |
| Complexity | Explicit `SolutionPlaybookCatalog.serviceMappings` → playbook `effortLevel` |
| Roadmap / rec links | Existing customer paths (`clientRecommendationDetailPath`, roadmap, `?pillar=` on recommendations) |

No duplicate scoring engines. No demo fixtures.

---

## 3. Pillar detail DTO

| Module | Role |
| --- | --- |
| `src/lib/customer-portal/pillar-detail-dto.ts` | Pure builders / types |
| `src/lib/customer-portal/pillar-explore.ts` | Authorized assembly |
| `src/lib/customer-portal/complexity.ts` | Playbook effort → Easy/Moderate/Complex |

### `CustomerPillarDetailDto`

- Canonical code, name, business question  
- Official score + DOC-119 label + plain-language summary  
- Strength (`demonstrated` \| `comparative` \| `none`) + optional evidence  
- Weakness + assessment evidence + related opportunity link  
- Opportunities (title, priority, status, complexity, href)  
- Next actions (≤3)  
- Links to full recommendation list / Roadmap  
- Complexity footnote  

### `CustomerExploreDto`

- Pillar tiles (8)  
- `detailsByCode` for all pillars (supports instant switching)  
- Selected pillar from `?pillar=`  

---

## 4. Evidence-selection methodology

### Demonstrated strength

- Pillar score must be ≥ Developing (`MEANINGFUL_STRENGTH_MIN_PERCENT` = 55).  
- Prefer high-ratio assessment answers (≥70% of max, non-critical) as supporting evidence.  
- Never use recommendation titles as strength evidence.  
- If unsupported:  
  `"No demonstrated strength identified at the current maturity level."`  
- Optional comparative response when below threshold — labeled **Relative performance**.

### Biggest weakness

1. Critical-flagged responses first (lowest score ratio).  
2. Else lowest-scoring response in the pillar.  
3. Else highest-priority customer-visible opportunity for the pillar.  
4. Links to related opportunity when available.

---

## 5. Complexity mapping coverage

| Rule | Behavior |
| --- | --- |
| Explicit `suggestedService` in `serviceMappings` | Map playbook `low/medium/high` → Easy / Moderate / Complex |
| Missing / unmapped service | **Not classified** |
| Default `strategic_it` fallback (TIP helper) | **Not used** for customer complexity |
| Priority / impact points | Never used for complexity |
| Pillar-wide complexity score | Not computed |

Footnote shown on Explore: playbook effort bands, not a custom environment estimate.

ABC LLC observation: several Identity & Access opportunities currently map to **Not classified** when `suggestedService` is absent or unmapped — expected.

---

## 6. Interactive UI implementation

| Surface | Implementation |
| --- | --- |
| Grid | Shared `PillarTile` + `CLIENT_EQUAL_CARD_GRID` (`auto-rows-fr`, `h-full` tiles) |
| Selection | Highlighted tile; `aria-pressed` / `aria-current` |
| Desktop | Grid + adjacent detail panel |
| Mobile | Full-screen detail dialog (close returns to grid; URL kept) |
| Deep links | `?pillar=` validated against `TECHNOLOGY_PILLARS` |
| History | `router.push(..., { scroll: false })` updates query |
| Keyboard | Focusable tiles/buttons/links; portal focus rings |

Overview pillar grid now reuses the same `PillarTile` / equal-height grid tokens.

---

## 7. Authorization validation

| Control | Status |
| --- | --- |
| Explore page `user.clientId === route id` | Preserved |
| Middleware JWT tenant check (SS-UX-002) | Unchanged |
| Recommendations via role-aware `getClientRecommendations` | Preserved |
| Profile detail audience trim | Preserved |
| Staff Explore | Allowed via staff role (no customer ownership gate); same Explore UI with staff-visible rec filters as role permits |
| Cross-tenant customer access | `notFound()` |

---

## 8. Roadmap progress investigation

### Sources

| Metric | Code | Meaning |
| --- | --- | --- |
| Journey `progressPercent` | `computeJourneyProgress` in `technology-profile/journey.ts` | 3 milestones (assessment / recs-or-projects / maintain). One completed assessment ≈ **33%**. |
| Roadmap `metrics.completionPercent` | `computeRoadmapProgressMetrics` | `initiativesCompleted / initiativesTotal` (0 if total=0). |

### SS-UX-004 behavior (pre-fix)

`getCustomerOverview` preferred roadmap completion whenever a roadmap **row** existed — including empty initiative sets → **0%**, hiding journey **33%**.

### ABC LLC staging (this pass)

| Observation | Value |
| --- | --- |
| Journey progress | **33** |
| Roadmap exists | **true** |
| `initiativesTotal` | **13** |
| Roadmap completion % | **0** (0 of 13 completed) |
| Overview displayed % after fix | **0** |

### Conclusion

- **33%** and **0%** are different concepts (journey milestones vs initiative completion).  
- For ABC, **0% roadmap completion is correct** given 13 incomplete initiatives — not a display bug for this fixture.  
- **Genuine defect** still existed for clients with a roadmap shell and **zero** initiatives: Overview showed 0% instead of journey progress.

### Correction applied

Use roadmap completion **only when `initiativesTotal > 0`**; otherwise fall back to journey `progressPercent`.  
Does **not** change `computeRoadmapProgressMetrics` or stored roadmap data.

---

## 9. Automated test results

```
vitest run
  tests/ux/ss-ux-005-interactive-pillar-exploration.test.ts
  tests/ux/ss-ux-004-premium-executive-overview.test.ts
  tests/ux/ss-ux-003-customer-portal-visual.test.ts
  tests/ux/ss-ux-002-customer-navigation.test.ts

Result: 4 files, 29 tests passed
```

SS-UX-005 coverage: pillar codes, complexity mapping, evidence strength rules, Explore wiring, equal-height tokens, roadmap initiativesTotal gate.

---

## 10. ABC LLC staging regression (read-only)

| Check | Result |
| --- | --- |
| StackScore | **39** |
| DOC-119 maturity | **Initial** |
| Pillars | **8** canonical |
| Customer-visible recommendations | **57** |
| Identity & Access opportunities (sample) | 6 shown on pillar detail |
| Projected maturity KPI | **null** |
| Strength kind (Identity) | comparative (score below Developing) |

---

## 11. Manual visual checklist

- [ ] Eight pillars; equal card heights in a row  
- [ ] Selecting a pillar updates detail without leaving Explore  
- [ ] `?pillar=` deep link opens correct selection  
- [ ] Browser back/forward restores prior pillar  
- [ ] Keyboard focus visible on tiles and links  
- [ ] Strength / weakness copy evidence-based; no fabricated claims  
- [ ] Opportunities filtered to pillar; complexity Easy/Moderate/Complex or Not classified  
- [ ] Mobile full-screen detail usable; no horizontal overflow  
- [ ] Overview pillar tiles aligned consistently  
- [ ] Staff surfaces unchanged aside from shared tile/token reuse  
- [ ] Cross-tenant customer URL rejected  

---

## 12. Remaining issues

1. Customer recommendation **list** still does not scroll to `?selected=` (staff view does) — deep links open the list filtered by pillar where applicable.  
2. Many opportunities may show **Not classified** until `suggestedService` values match playbook mappings — by design.  
3. Mobile detail close does not clear `?pillar=` (history preserved); product may prefer clearing on dismiss.  
4. Loading all eight pillar details per Explore request is intentional for snappy switching; watch performance if response payloads grow.  
5. Manual browser checklist still required on staging preview.  
6. No production deployment from this ticket.

---

## Acceptance summary

| Requirement | Status |
| --- | --- |
| Interactive eight-pillar Explore | Done |
| Pillar detail service / DTO | Done |
| Evidence-based strength / weakness | Done |
| Customer-visible opportunities + complexity | Done |
| Deep links + history | Done |
| Equal-height grids (Explore + Overview) | Done |
| Roadmap progress investigation + empty-roadmap fix | Done |
| No projected maturity / staging only | Honored |
