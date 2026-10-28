# SS-REL-015 — Customer Trust Remediation

**Branch:** `staging`  
**Date:** 2026-10-28  
**Scope:** REL-014-C1, REL-014-C2, REL-014-H2, REL-014-H3  
**Restrictions honored:** staging only; no production deploy; no migrations; no scoring formula changes; no recommendation metadata changes; no dashboard/PDF visual redesign.

---

## 1. Files changed

### Core helpers / services
- `src/lib/assessments/customer-trust.ts` *(new)* — pillar strength selection, audience projection KPI gate, customer follow-through copy
- `src/lib/communications/workflows/triggers.ts` — email strengths from assessment pillars
- `src/lib/assessments/executive-summary.ts` — optional omit of catalog projected maturity language
- `src/lib/assessments/customer-facing-report.ts` — customer narrative + PDF suppress flag
- `src/lib/technology-profile/detail.ts` — TIP isolation + client projected KPI nulling
- `src/lib/reports/assessment-content.ts` — customer report section copy without projected KPIs
- `src/lib/pdf/types.ts` — `suppressCatalogProjectedMaturity`
- `src/lib/pdf/assessment-report.tsx` — suppress projected gauges/copy; impact wording

### Customer-facing UI
- `src/components/assessments/assessment-report-hero.tsx`
- `src/components/assessments/assessment-report-preview.tsx`
- `src/components/assessments/assessment-results.tsx`
- `src/components/customer-portal/customer-executive-dashboard.tsx`
- `src/components/technology-profile/tp-workspace-snapshot.tsx`
- `src/components/technology-profile/tp-open-opportunities.tsx`
- `src/components/technology-journey/journey-progress-summary.tsx`
- `src/components/client-roadmap/roadmap-kpi-strip.tsx`
- `src/components/client-roadmap/effective-score-journey.tsx`
- `src/components/client-roadmap/roadmap-dashboard.tsx`
- `src/components/client-roadmap/phase-workspace.tsx`

### Tests / deliverable
- `tests/reliability/ss-rel-015-customer-trust.test.ts` *(new)*
- `tests/assessments/executive-summary.test.ts`
- `tests/assessments/customer-facing-report.test.ts`
- `tests/communications/assessment-complete-email-filtering.test.ts`
- `docs/reliability/SS-REL-015-CUSTOMER-TRUST-REMEDIATION.md` *(this file)*

---

## 2. Projection surfaces identified

| Surface | Before | Customer remediation |
| --- | --- | --- |
| Assessment results (staff) | Projected Score KPI | Retained for staff planning |
| Assessment report preview / hero | Projected improvement + “Projected N” | Suppressed for customer / `suppressCatalogProjectedMaturity` |
| Customer executive dashboard | “Projected Improvement” + “Projected Business Outcome” | Replaced with opportunity count + recommended focus copy |
| Technology Profile / workspace KPIs | Projected from TIP or catalog fallback | Client projected KPI forced `null`; Opportunities shown instead |
| Journey ladder | Initial / Current / Projected / Target | Omits null projected/target steps |
| Client roadmap KPI strip | Projected StackScore | Consultant-only; customers see Remaining Opportunity |
| Effective score journey | Projected Final | Consultant-only |
| PDF assessment report | Projected StackScore gauges + roadmap milestones | Suppressed for customer PDF payloads |
| Assessment completion email | Executive summary could cite projected score | Customer narrative omits catalog projection figures |
| Executive narrative | “improve from X to Y” | Customer path uses reassessment follow-through paragraph |
| TIP / consultant planning | Projected maturity | Unchanged for staff |

Underlying `summary.projectedScore` / `calculateProjectedScore` math remains available for staff and internal compatibility.

---

## 3. Changes implemented

### REL-014-C1 — Misleading projected maturity
- Customer-facing presentation no longer treats catalog-impact projection as a future StackScore.
- Customer KPIs replaced with current StackScore, opportunity counts, priority recommendations, and roadmap progress where applicable.
- No arbitrary display cap or invented forecast added.

### REL-014-C2 — Incorrect email strengths
- Assessment-complete workflow selects strengths via `selectDemonstratedAssessmentStrengths` from category/pillar scores (≥55%).
- Strengths are omitted when no meaningful evidence exists (`summaryItems` already skips empty strengths).
- Priorities continue to come from critical/high client-safe recommendations.

### REL-014-H2 — Hidden TIP state
- `getTechnologyProfileDetail` does not load TIP wizard context for `audience === "client"`.
- Client projected / long-term KPIs resolve through `resolveAudienceProjectedMaturityKpi` → always `null`.
- `activeTip` remains null on client payloads; staff planning still receives TIP-derived projection when present.

### REL-014-H3 — Impact confusion
- Customer/recommendation copy shifted to **estimated priority impact** language.
- Explicit note on PDF/report that impact points are planning guidance, not guaranteed StackScore increases.
- Customer surfaces no longer present the sum of impact points as expected score improvement via projected KPIs.

---

## 4. Email strengths correction

**Before:** low/medium recommendation titles labeled as “Top Strengths”.  
**After:** demonstrated pillar names from completed assessment category scores.

Rules:
1. Strengths represent assessment performance only.
2. Not derived from remediation recommendations.
3. No invented positives below the evidence floor (55%).
4. Empty strengths → section omitted.
5. Queue/enqueue/review-required delivery behavior unchanged.

---

## 5. TIP isolation validation

| Check | Result |
| --- | --- |
| Client detail ignores unfinished TIP record for projection inputs | Pass (TIP input forced `null` for client audience) |
| Client `journeyScores.projectedScore` | `null` |
| Client workspace `kpis.projectedScore` | `null` |
| Client `activeTip` | `null` |
| Staff projection still available | Pass (ABC staff projected KPI still 100 when catalog model saturates) |
| Authorization boundaries | Unchanged (audience still from role) |

---

## 6. Automated test results

```text
vitest run \
  tests/reliability/ss-rel-015-customer-trust.test.ts \
  tests/assessments/executive-summary.test.ts \
  tests/assessments/customer-facing-report.test.ts \
  tests/communications/assessment-complete-email-filtering.test.ts \
  tests/communications/assessment-complete-email-filter.test.ts \
  tests/client-roadmap/customer-projection.test.ts

Test Files  6 passed (6)
Tests       32 passed (32)
```

Coverage highlights:
- Pillar strength selection / empty strengths
- Customer narrative omits “improve from X to Y”
- Client projected KPI null even when TIP/catalog would be 100
- Email workflow wired to `selectDemonstratedAssessmentStrengths`
- Profile detail wired to TIP isolation helper

---

## 7. ABC LLC regression results

Staging read-only observation (not hardcoded into app logic):

| Observation | Value |
| --- | --- |
| Official StackScore | **39** |
| Triggered / client-visible recommendations | **57** |
| Internal modeled projected score (catalog-impact, preserved) | **100** |
| Customer narrative cites projected 100 | **false** |
| Email strengths from assessment evidence | **Data Protection & Recovery** (only pillar ≥55) |
| Client profile projected KPI | **null** |
| Client workspace projected KPI | **null** |
| Client active TIP exposure | **null** |
| Staff projected KPI still functional | **100** |

Consistency: customer dashboard, PDF/report suppress flag, and email narrative all omit catalog projected maturity figures while retaining current StackScore and recommendation counts.

---

## 8. Remaining issues

1. **Stored historical `Assessment.executiveSummary` rows** may still contain older “projected 100” language for staff who view the stored field; customer display regenerates a safe narrative and does not overwrite history.
2. **REL-014-H1** (dual maturity label systems) intentionally out of scope.
3. **REL-014-H4** (empirical defensibility of impact points) unchanged — metadata not modified; presentation only.
4. **Marketing / product-overview demos** still show projected maturity for demo storytelling; not customer portal surfaces.
5. **Staff assessment results** continue to show projected score for consultant planning by design.
6. True future-state maturity simulation (recompute pillar scores after remediation) remains a longer-term product decision beyond this remediation.

---

## Acceptance checklist

- [x] Email strengths from pillars, not recommendations
- [x] Customer-facing numerical catalog projected maturity KPIs suppressed
- [x] Hidden TIP state cannot drive client projected KPIs
- [x] Impact wording clarified (not guaranteed StackScore increase)
- [x] Assessment scoring formulas unchanged
- [x] Recommendation metadata unchanged
- [x] No migrations / no production deploy
- [x] ABC LLC observations: 39 / 57 / internal 100; customer surfaces without misleading projected 100
