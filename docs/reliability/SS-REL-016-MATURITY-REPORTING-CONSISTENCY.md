# SS-REL-016 — Maturity and Reporting Consistency

**Branch:** `staging`  
**Date:** 2026-10-28  
**Follows:** SS-REL-015 Customer Trust Remediation  
**Addresses:** REL-014-H1 (DOC-119 vs Rating), recommendation count semantics, roadmap vs maturity language  
**Restrictions honored:** staging only; no production deploy; no migrations; no scoring/threshold/metadata changes; no dashboard/PDF visual redesign.

---

## 1. Files changed

### New helpers
- `src/lib/assessments/customer-reporting.ts` — DOC-119 customer maturity labels, recommendation count semantics, terminology constants, roadmap progress footnote

### Core services / reports
- `src/lib/assessments/results-summary.ts` — `overallMaturityLabel`, `activeImprovementOpportunityCount`, `recommendationCounts`
- `src/lib/assessments/customer-trust.ts` — strengths methodology review notes (threshold unchanged at 55)
- `src/lib/reports/assessment-content.ts` — customer maturity + opportunity wording
- `src/lib/reports/progress/index.ts` — progress report maturity from DOC-119 score (not Prisma enum display names)
- `src/lib/pdf/assessment-report.tsx` — customer PDF uses DOC-119 maturity; opportunity counts
- `src/lib/communications/workflows/email-data.ts` — `StackScore` instead of “Technology Health Score”

### Customer-facing UI
- `src/components/customer-portal/customer-executive-dashboard.tsx`
- `src/components/executive-os/executive-briefing-panel.tsx`
- `src/components/assessments/assessment-report-hero.tsx`
- `src/components/assessments/assessment-report-preview.tsx`
- `src/components/client-roadmap/roadmap-kpi-strip.tsx`
- `src/components/client-roadmap/effective-score-journey.tsx`
- `src/components/technology-journey/journey-progress-summary.tsx`

### Tests / deliverable
- `tests/reliability/ss-rel-016-maturity-reporting.test.ts` *(new)*
- `tests/pdf/assessment-paper-safe-pilot.test.ts`
- `docs/reliability/SS-REL-016-MATURITY-REPORTING-CONSISTENCY.md` *(this file)*

---

## 2. Maturity terminology changes

| Before (customer) | After (customer) |
| --- | --- |
| Legacy Rating: Critical / At Risk / Stable / Strong / Exceptional | DOC-119: Initial / Basic / Developing / Managed / Mature / Optimized |
| “Technology Health” KPI for the 0–100 score | **StackScore** with DOC-119 maturity sublabel |
| “Technology health” report chrome | **Technology maturity** |
| Progress report Prisma tier names (Nascent / Foundational / …) | DOC-119 label from numeric StackScore |
| Dual Rating + DOC-119 on same customer score | Rating retained for staff/internal; customers use DOC-119 |

**Unchanged:** maturity thresholds, assessment scoring formulas, Prisma `Rating` / `MaturityTier` enums and storage.

---

## 3. Recommendation count definitions

Shared helper: `countCustomerRecommendations` / `CUSTOMER_ACTIVE_OPPORTUNITY_STATUSES`.

| Term | Status semantics |
| --- | --- |
| **Identified** | Client-visible rows excluding `declined` / `archived` |
| **Open** | `status === open` only |
| **Accepted** | `status === accepted` |
| **In progress** | `status === in_progress` |
| **Completed** | `status === completed` |
| **Improvement opportunities (active)** | `open` + `accepted` + `in_progress` |

Notes:
- Non-completed is **not** treated as open (`deferred` is tracked separately, not active).
- Assessment summary keeps `openRecommendationsCount` as open-only and adds `activeImprovementOpportunityCount`.
- Customer visibility / authorization filters remain fail-closed (unchanged publication policy).

---

## 4. Roadmap progress terminology

| Concept | Customer meaning |
| --- | --- |
| **StackScore** | Official maturity from the latest completed assessment |
| **Roadmap Progress** | Completion status of approved improvement initiatives |
| **Improvement Opportunities** | Active assessment recommendations |

Customer roadmap surfaces:
- Label official score as **Official StackScore**
- Show **Roadmap Progress** % instead of catalog projected maturity
- Clarify that initiative completion does not rewrite official StackScore and does not guarantee a specific maturity increase
- Consultant planning (effective / projected StackScore) preserved

Catalog-based projected maturity remains suppressed on customer surfaces (SS-REL-015).

---

## 5. Strengths methodology review

Inspected `MEANINGFUL_STRENGTH_MIN_PERCENT = 55` in `customer-trust.ts`.

| Option | Assessment |
| --- | --- |
| Absolute DOC-119 threshold (Developing+) | **Current — recommended to keep** |
| Relative pillar rankings only | Can frame weak pillars as “strengths”; not evidence-based |
| Dual: demonstrated vs comparatively stronger | Useful UX later; needs product approval |

**Decision for SS-REL-016:** keep absolute floor at **55 (Developing)**. No threshold change. Documented that switching to relative-only or dual framing requires separate approval. Low-risk terminology only: comments clarify alignment with DOC-119 Developing.

---

## 6. Automated test results

```text
vitest run \
  tests/reliability/ss-rel-016-maturity-reporting.test.ts \
  tests/reliability/ss-rel-015-customer-trust.test.ts \
  tests/assessments/customer-facing-report.test.ts \
  tests/assessments/executive-summary.test.ts \
  tests/reports/assessment-content.test.ts \
  tests/reports/progress-report.test.ts \
  tests/communications/assessment-complete-email-filtering.test.ts

Test Files  7 passed (7)
Tests       38 passed (38)
```

---

## 7. ABC LLC regression results

Staging read-only observation (not hardcoded into application logic):

| Check | Result |
| --- | --- |
| Official StackScore | **39** |
| Customer DOC-119 maturity | **Initial** |
| Legacy Rating (staff/internal) | Critical (preserved, not shown as customer maturity) |
| Triggered / client-visible recommendations | **57** |
| Counts: open / active opportunities | **57 / 57** |
| Narrative uses Initial maturity | **true** |
| Narrative projected gain language | **false** |
| Email strengths (evidence-based) | **Data Protection & Recovery** |
| Client projected KPI | **null** |
| Staff projected KPI | **100** (consultant planning intact) |
| Journey roadmap progress % | **33** (distinct from StackScore) |

---

## 8. Remaining issues

1. **Staff assessment results / internal profile widgets** may still show Rating badges alongside DOC-119 — intentional for internal compatibility.
2. **Lifecycle “Technology Health” bands** (Healthy / Watch / At Risk) remain a separate risk-band system, not DOC-119 maturity — out of scope for this pass.
3. **Marketing / invitation copy** may still say “Technology Health” in non-portal surfaces.
4. **QBR PDF “Technology Health” section titles** not fully renamed (avoid PDF redesign); customer assessment PDF/report paths were updated.
5. **Dual strengths framing** (demonstrated vs comparative) deferred pending product approval.
6. Profile field `openRecommendationCount` still stores the active opportunity set (open+accepted+in_progress); naming is historical — presentation now labels it Improvement Opportunities.

---

## Acceptance checklist

- [x] Customer maturity labels use DOC-119 six classifications
- [x] Legacy Rating not presented as customer maturity
- [x] Recommendation counts have defined open / active / completed semantics
- [x] Roadmap progress distinguished from official StackScore
- [x] Catalog projected maturity remains suppressed for customers
- [x] Strengths threshold reviewed; unchanged at Developing (55)
- [x] No scoring formula / migration / metadata changes
- [x] ABC LLC: 39 / 57 / Initial; projected KPI null for client; staff planning intact
