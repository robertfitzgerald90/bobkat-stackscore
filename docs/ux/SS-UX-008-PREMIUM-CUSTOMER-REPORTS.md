# SS-UX-008 — Premium Customer Reports Experience

**Branch:** `staging`  
**Date:** 2026-10-29  
**Status:** Implemented (staging only — no production deploy)  
**Precedents:** [SS-UX-003](./SS-UX-003-CUSTOMER-PORTAL-VISUAL-FOUNDATION.md), [SS-UX-007](./SS-UX-007-CUSTOMER-ROADMAP-EXPERIENCE.md)

**Constraints honored:** No migrations, scoring changes, recommendation catalog modifications, PDF redesign, report-generation engine changes, entitlement rule changes, staff reports hub redesign, projected maturity KPI, or production deploy.

---

## 1. Reporting architecture

```
/clients/{id}/executive-reports
  → customer ownership check (JWT clientId must match the route)
  → getCustomerReportsExperience
      → getClientAssessmentHistory (existing)
      → loadProgressReport (existing; null until a completed assessment exists)
      → listQuarterlyBusinessReviews (existing)
      → getClientVcioEntitlement (existing; not modified)
      → getLatestDraftAssessmentForClientUser (existing resume path)
      → buildCustomerReportsExperience (pure)
  → <CustomerReportsExperience />

Staff path unchanged: WorkspaceSectionHeader + WorkspaceHubLinks
  (business reviews, progress report, improvement dashboard, improvement plans, latest results)
```

| Module | Role |
| --- | --- |
| `src/lib/customer-portal/reports-experience.ts` | Assembly only |
| `src/lib/customer-portal/reports-dto.ts` | Pure cards, actions, and guide |
| `src/components/customer-portal/reports/customer-reports-experience.tsx` | Customer hub |
| `src/components/customer-portal/reports/report-card.tsx` | Shared report card |
| `src/app/(dashboard)/clients/[id]/executive-reports/page.tsx` | Customer/staff split |

No new report engine. PDF bytes still come from the existing assessment and business-review export routes.

---

## 2. Existing report sources

| Need | Existing source | Hub use |
| --- | --- | --- |
| Completed assessments | `getClientAssessmentHistory` | Latest card + history |
| On-screen assessment report | `/assessments/{id}/report` | View report |
| Assessment PDF | `GET /api/v1/assessments/{id}/export/pdf` | Download PDF |
| Progress narrative | `loadProgressReport` → `/clients/{id}/progress-report` | Executive reports, view only |
| Published business reviews | `QuarterlyBusinessReview` status `generated` | Business reviews |
| Business review page | `/clients/{id}/quarterly-review/{qbrId}` | Open business review |
| Business review PDF | `GET /api/v1/clients/{id}/qbr/{qbrId}/pdf` | Download PDF |
| vCIO entitlement | `getClientVcioEntitlement` | Show or hide the reviews section |
| Draft resume | `getLatestDraftAssessmentForClientUser` | Empty-state resume link |
| Opportunities / roadmap | Existing customer routes | Guide links only |

Not linked from the customer hub: staff improvement dashboard, improvement-plan wizard, assessment `/results` (not on the customer route allowlist), or any URL that does not already exist.

The progress report has no PDF route. The hub does not add one.

---

## 3. Reports hub implementation

Customer landing at the existing Reports route, using SS-UX-003 shells (`ClientPageShell`, `ClientPageHeader`, `ClientSectionHeader`, `ClientEmptyState`, `CLIENT_EQUAL_CARD_GRID`, `CLIENT_SURFACE_CARD`). The portal watermark and charcoal theme stay on the dashboard shell.

Sections, in order:

1. **What each report covers** — short distinction among assessment, opportunities, roadmap progress, and business review. No scores and no forecasts.
2. **Latest assessment report** — newest completed assessment, or the existing empty state with resume / overview.
3. **Assessment history** — other completed assessments, newest first. Shown once a latest report exists. Empty copy when there are no earlier reports.
4. **Executive reports** — Technology Progress Report when `loadProgressReport` returns data. Omitted otherwise.
5. **Business reviews** — omitted for assessment-only customers with no published reviews. Entitled customers see the section, including an empty state when none are published.

Draft and archived assessments are not report cards. Draft business reviews are not listed. The featured assessment is not repeated in history.

---

## 4. Report metadata mapping

| Card | Title | Type | Period | Completed | Company | Actions |
| --- | --- | --- | --- | --- | --- | --- |
| Assessment | `assessmentName` | Assessment report | `formatAssessmentType` | `completedAt` | Client company name | View report, Download PDF |
| Progress | Technology Progress Report | Executive report | `reportPeriodLabel` | Not shown (report is generated on view, not a stored completion) | Client company name | View report |
| Business review | Stored review title | Business review | `reviewPeriodLabel` | `generatedAt` when present | Client company name | Open business review, Download PDF |

Guide actions:

| Topic | Link |
| --- | --- |
| Technology maturity assessment | Latest report when one exists |
| Improvement opportunities | `/clients/{id}/recommendations` |
| Roadmap progress | `/clients/{id}/roadmap` |
| Business review | `/clients/{id}/quarterly-reviews` only when that section is visible |

---

## 5. Authorization validation

| Check | Behavior |
| --- | --- |
| Signed out | Existing page redirect to `/login` |
| Customer on another client's URL | `notFound()` before the hub loads |
| Customer route allowlist | Hub stays on `executive-reports`, which is already client-visible. Child links use report, progress-report, quarterly-review, quarterly-reviews, recommendations, and roadmap — all already allowed |
| Assessment PDF | Existing `requireAssessmentAccess` |
| Business review PDF | Existing `requireClientWorkspaceAccess` plus client-role draft hiding in `getQuarterlyBusinessReview` |
| Staff hub | Same links as before this ticket |

---

## 6. Entitlement handling

`getClientVcioEntitlement` and `subscriptionAllowsVcioAccess` are unchanged.

The business-review section is included when `hasSubscription` is true (active, grace, payment action, or read-only) **or** when at least one `generated` review already exists. That matches the current quarterly-reviews page, which still lists published reviews for the owning client.

Assessment-only customers with no published reviews do not get a business-review section or a business-review guide link.

No create, edit, or draft-review actions are added for customers.

---

## 7. Automated test results

```
npm test -- tests/ux/ss-ux-008-premium-customer-reports.test.ts
npx eslint src/lib/customer-portal/reports-dto.ts src/lib/customer-portal/reports-experience.ts src/components/customer-portal/reports/report-card.tsx src/components/customer-portal/reports/customer-reports-experience.tsx src/app/(dashboard)/clients/[id]/executive-reports/page.tsx tests/ux/ss-ux-008-premium-customer-reports.test.ts
```

Result: **5** tests passed. ESLint reported no issues on the touched files.

Coverage: newest-first history, latest card excluded from history, draft/archived omitted, no duplicate card ids, assessment PDF and business-review PDF hrefs, progress report view without a download, assessment-only section hidden, entitled empty state, resume link only when nothing is completed, customer ownership check and staff hub still present in the page, no projected-score copy in the DTO.

---

## 8. ABC LLC staging regression

This ticket does not read or write StackScore, maturity, or recommendation rows.

| Check | Expected |
| --- | --- |
| Official StackScore | **39** (unchanged; not rendered on this hub) |
| DOC-119 maturity | **Initial** (unchanged; not rendered as a forecast) |
| Customer-visible recommendations | **57** (unchanged; guide only links to the existing opportunities route) |
| Projected maturity KPI | **None** on the reports hub |
| Existing PDF routes | Unchanged handlers |

Live ABC confirmation remains a staging preview item.

---

## 9. Manual browser checklist

Not run in this pass (browser verification deferred).

- [ ] Latest completed assessment shows view and PDF actions
- [ ] Earlier completed assessments list newest first and omit the latest card
- [ ] Assessment PDF download still uses `/api/v1/assessments/{id}/export/pdf`
- [ ] Another customer's `/clients/{id}/executive-reports` is not found
- [ ] Assessment-only workspace has no business-review actions
- [ ] Grace or read-only vCIO workspace still lists published reviews
- [ ] Empty assessment and empty business-review states read clearly
- [ ] Desktop, tablet, and mobile: cards stack, no horizontal overflow
- [ ] Keyboard focus is visible on view and download controls
- [ ] Staff Executive Reports hub links are unchanged
- [ ] No projected StackScore on the customer reports page

---

## 10. Remaining issues

1. The Technology Progress Report is computed when opened. It is not a stored historical PDF, so the hub offers view only.
2. Customer middleware does not allow `/assessments/{id}/results`, so the hub does not add a separate assessment-details action. View report is the customer assessment deliverable.
3. Published business reviews remain visible when a subscription row is missing but generated reviews exist, matching the existing reviews page.
4. Manual ABC and responsive checks are still open on staging preview.
5. No production deployment from this ticket.
