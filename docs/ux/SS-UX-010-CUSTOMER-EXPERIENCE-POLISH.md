# SS-UX-010 — Customer Experience Polish & Reporting Remediation

**Branch:** `staging`  
**Date:** 2026-10-30  
**Scope:** Defect remediation from SS-UX-009 (D2, D3) plus Technology Progress Report contrast and Assessment Report recommendation structure.  
**Constraints honored:** Staging only; no production deploy; no migrations; no scoring, catalog, roadmap status, or report-engine changes; no new customer features; no staff dashboard redesign.

---

## 1. Defects addressed

| ID | Defect | Resolution |
| --- | --- | --- |
| D2 | Overview “Roadmap Progress” used journey milestone % when initiatives were absent or preferred journey over initiative completion | Overview now uses initiative `completionPercent` only. Empty / no-roadmap states show “Not started” / “No roadmap established”. Journey Progress is a separate metric. |
| Progress Report contrast | White/light text on white surfaces, faint metadata, phosphor-green cover clash in customer portal | Customer view uses charcoal document + phosphor accents; staff path unchanged. |
| Assessment Report recommendations | Structured catalog text rendered as one continuous paragraph | Recommendations parse via SS-UX-006 `presentRecommendationDescription` into Finding / Recommended Action / Expected Outcome / Implementation Considerations; Business Benefit separate. |
| D3 | Explore mounted desktop + mobile detail panels, duplicating content in the accessibility tree | After layout resolve, only one detail surface is mounted (desktop panel **or** mobile dialog). |

---

## 2. Root causes

1. **D2:** SS-UX-005 Overview intentionally fell back to `detail.journey.progressPercent` when `initiativesTotal === 0`, while Roadmap always used initiative completion. Labels both said “Roadmap Progress,” producing inconsistent percentages.
2. **Progress Report:** `ProgressReportPreview` used a hard-coded white document shell without `documentTheme`, while `.customer-portal` CSS variables set near-white foreground — producing light-on-light text. Cover used `bg-primary` (phosphor) on a paper document, visually disconnected from the industrial customer theme.
3. **Assessment recommendations:** `RecommendationCard` passed `description` (and sometimes `businessImpact`) as a single `ReportDataCard` description blob instead of sectioned presentation.
4. **D3:** Desktop adjacent panel and mobile full-screen dialog each rendered `PillarDetailPanel` for the same selection; CSS `hidden`/`lg:` alone was insufficient guarantee against duplicate accessible copies.

---

## 3. Files changed

| File | Change |
| --- | --- |
| `src/lib/customer-portal/overview-dto.ts` | `resolveOverviewRoadmapProgress`; roadmap empty-state + journey fields on DTO |
| `src/lib/customer-portal/overview.ts` | Wire initiative-only Roadmap Progress (no journey substitute) |
| `src/components/customer-portal/overview/overview-roadmap-progress.tsx` | Empty-state display; separate Journey Progress card; equal-height metrics |
| `src/components/customer-portal/customer-executive-dashboard.tsx` | Pass `journey` into overview progress section |
| `src/components/reports/progress-report-preview.tsx` | `isCustomerView` charcoal/phosphor presentation |
| `src/app/(dashboard)/clients/[id]/progress-report/page.tsx` | Pass `isCustomerView` via `isCustomerMode` |
| `src/styles/customer-portal-theme.css` | Customer progress-report contrast tokens |
| `src/components/assessments/assessment-report-preview.tsx` | Structured recommendation sections + Business Benefit |
| `src/components/customer-portal/explore/customer-explore-experience.tsx` | Single mounted detail surface after `matchMedia` layout resolve |
| `tests/ux/ss-ux-010-customer-experience-polish.test.ts` | New regression coverage |
| `tests/ux/ss-ux-004-premium-executive-overview.test.ts` | Align with initiative/journey split |
| `docs/ux/SS-UX-010-CUSTOMER-EXPERIENCE-POLISH.md` | This report |

---

## 4. Visual changes

- Overview progress row: three equal-height metric wells — Official StackScore, Roadmap Progress (percent or empty label), Journey Progress.
- Customer Technology Progress Report: frost/charcoal document, phosphor-accent cover gradient (not solid bright green paper header), consistent metric cards, readable section headings and metadata.
- Assessment Report recommendation cards: labeled section hierarchy; priority badge and pillar hint preserved.
- Staff progress/assessment presentation paths preserved (`isCustomerView` / existing document theme).

---

## 5. Accessibility changes

- Explore: desktop panel unmounted on mobile layout; mobile dialog unmounted on desktop layout — one accessible detail copy.
- Keyboard selection, `?pillar=` deep links, and history `router.push` retained.
- Progress report / overview text colors scoped for WCAG AA-oriented bone-on-charcoal / ash-on-charcoal combinations in the customer shell.
- Roadmap empty state announced via progressbar `aria-label` when initiatives are absent.

---

## 6. Automated test results

```
vitest run tests/ux/ss-ux-010-customer-experience-polish.test.ts \
  tests/ux/ss-ux-004-premium-executive-overview.test.ts \
  tests/ux/ss-ux-005-interactive-pillar-exploration.test.ts \
  tests/ux/ss-ux-006-customer-improvement-opportunities.test.ts \
  tests/ux/ss-ux-007-customer-roadmap-experience.test.ts \
  tests/ux/ss-ux-008-premium-customer-reports.test.ts
```

**Result:** all suites **PASS** (SS-UX-010: 9 tests; related UX suites green).

Coverage includes empty / draft / active / completed roadmap progress resolution; structured recommendation parsing wiring; Explore single-surface mount; customer progress-report flag.

---

## 7. Browser validation

**Account:** dedicated staging demo `pinnacle.engineering.demo@bobkatit.com` (Pinnacle Engineering).  
**App:** local `http://localhost:3000` against staging Neon.

| Check | Result | Notes |
| --- | --- | --- |
| Staging branch | **PASS** | `git branch --show-current` → `staging` |
| Staging Neon read (ABC LLC) | **PASS** | Service read: Official StackScore **39**; maturity **Initial**; roadmap initiatives **13**; completion **0%**; Overview↔Roadmap progress **match**; Journey Progress **33%** (separate) |
| Overview Roadmap vs Journey (demo) | **PASS** | Roadmap Progress **Not started**; Journey Progress **67%** (Improve) — not substituted |
| Explore single detail (desktop + deep link) | **PASS** | `?pillar=identity_access` → one Identity & Access article; no duplicate dialog in a11y tree |
| Technology Progress Report contrast | **PASS** | Charcoal document, phosphor accents, readable headings/metrics; no solid bright-green paper cover |
| Customer-visible opportunities count | **OBSERVED** | Overview `activeOpportunityCount` = **10** (active statuses). Full customer-visible recommendation inventory may be larger via Opportunities/Reports; not hardcoded. |
| Staff UI unchanged | **PASS** | Progress report staff path retains prior `ReportCover` / white document; assessment staff `documentTheme` unchanged |
| No projected StackScore guarantees introduced | **PASS** | Impact line retains “not a guaranteed StackScore increase”; no projected maturity wiring added |

Mobile Explore dialog + Assessment Report structured sections: covered by unit/wiring tests; mobile viewport dialog re-check optional on device.

---

## 8. Remaining issues

1. Mobile Explore dialog open/close at &lt;1024px still worth a quick device pass before production promote.
2. Assessment Report remains light executive document theme (intentional staff/print parity); only recommendation body structure changed — not a full customer charcoal restyle of the assessment PDF preview.
3. Opportunity “active” count on Overview may differ from total customer-visible recommendations on Opportunities (status filtering) — pre-existing semantics, not introduced here.

---

## 9. Production readiness impact

| Item | Impact |
| --- | --- |
| Safe to keep on `staging` | Yes |
| Requires production deploy | No (explicitly out of scope) |
| Migrations | None |
| Scoring / catalog / roadmap mutations | None |
| Customer auth / PDF routes | Untouched aside from presentation wiring |
| Promote readiness | **Improved** for Overview/Roadmap consistency and report readability; complete interactive visual QA on staging before production cut |

---

## ABC LLC expected observations (read-only)

| Observation | Staging evidence |
| --- | --- |
| Official StackScore | 39 |
| DOC-119 maturity | Initial |
| Customer-visible roadmap initiatives | 13 |
| Roadmap completion | 0% (Overview matches Roadmap) |
| Journey Progress (separate) | 33% |
