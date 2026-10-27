# SS-REL-011 — Customer Financial Experience Cleanup

| Field | Value |
| --- | --- |
| Status | **Complete (staging code + tests; not production-deployed)** |
| Date | 2026-10-26 |
| Branch | `staging` |
| Related | [`SS-REL-010-BUDGET-ACCURACY-REMEDIATION.md`](SS-REL-010-BUDGET-ACCURACY-REMEDIATION.md), [`SS-REL-009-TECHNOLOGY-BUDGET-AUDIT.md`](SS-REL-009-TECHNOLOGY-BUDGET-AUDIT.md) |
| Constraints | No production deploy, no migrations, no destructive data edits; scoring / recommendation engine / Stripe / invoicing unchanged |

---

## Objective

Remove automatically generated TIP/roadmap financial estimates from the StackScore **customer** experience.

Assessments identify technology improvement opportunities. They must not present speculative implementation quotations as customer-facing investment figures.

---

## Policy

| Audience | Speculative TIP / proposed estimates | Verified / contracted / completed / approved | Invoices, subscriptions, Stripe |
| --- | --- | --- | --- |
| Customer (`role === client`) | **Hidden** (API scrub + UI) | May remain when amounts exist | **Preserved** |
| Staff (admin / technician) | **Visible** (internal planning) | Visible | Preserved |

Formal phase proposals (scoped quotations) remain available where already authorized — this release targets **auto-generated** TIP modeling, not approved commercial documents.

---

## Changes made

### 1. Shared scrub layer — `src/lib/financial/customer-facing.ts`

- `shouldHideSpeculativeFinancials(role)` — customer portal gate
- `scrubBudgetPlanForCustomer` — zeros proposed one-time / monthly / annual / deferred / three-year; keeps verified fields
- `scrubLifecycleDashboardForCustomer` — budget + phase + opportunity estimates
- `scrubRoadmapDashboardForCustomer` / `scrubRoadmapPhaseDetailForCustomer` — KPI and phase investment fields
- `scrubQbrBudgetForecastForCustomer` — drops speculative QBR forecast; keeps completed when present

### 2. API / service sanitization (tenant + role preserved)

| Service | Behavior for customers |
| --- | --- |
| `getTechnologyLifecycleDashboard` | Returns scrubbed dashboard |
| `getClientRoadmapDashboard` / `getClientRoadmapPhaseDetail` | Returns scrubbed metrics / phases |
| `getQuarterlyBusinessReview` | Scrubs `budgetForecast` + phase investment fields (on-screen + PDF export path) |

Lifecycle and roadmap routes already pass `user.role` and enforce client workspace access — scrubbing adds no new tenancy holes.

### 3. Customer UI — Technology Improvement Planning

`LifecycleDashboard` / lifecycle page:

- Customers see **Technology Improvement Planning** (no preliminary estimate panel)
- Copy clarifies costs are scoped with Bobkat IT
- Links to **recommendations** and **technology roadmap**
- Verified completed / approved / contracted / refresh amounts still shown when present
- Staff retain **Technology Budget Planning** with preliminary estimates (SS-REL-010 presentation modes)

### 4. Other customer surfaces scrubbed

| Surface | Change |
| --- | --- |
| Roadmap KPI strip | Hides Remaining Investment / Monthly Services KPIs for non-consultants |
| Roadmap phase cards / phase workspace | Hides One-Time / Monthly estimate wells for customers |
| QBR on-screen investment section | Omits zeroed speculative cards; empty state without quotations |
| QBR PDF | Same non-zero filtering + customer-safe empty copy |
| VCIO feature label | “Technology Improvement Planning” (entitlement key unchanged) |

### 5. Explicitly preserved

- Recommendation engine and assessment scoring  
- TIP generation / pricing engines (staff-only PDF already gated by `requireConsultantOrAdmin`)  
- Stripe Checkout, Billing Portal, invoices, payment history, subscriptions  
- Staff consulting workspace and internal budget math (`computeLifecycleBudget`)  
- Phase proposal investment summaries (formal scoped proposals)

---

## Validation

| Check | Result |
| --- | --- |
| Customer lifecycle widget shows no proposed / monthly / annual / 3-year TIP quotes | Pass (UI + scrub) |
| Customer can open recommendations and roadmap | Pass (links retained) |
| Billing / invoices unchanged | Pass (not modified) |
| Staff budget planning still shows preliminary estimates | Pass |
| Automated tests | `tests/financial/customer-facing.test.ts` + existing budget tests |

---

## Test coverage

```
npm test -- tests/financial/customer-facing.test.ts tests/technology-lifecycle/budget.test.ts
```

Asserts:

- Client role triggers scrub; staff does not  
- Proposed and three-year fields zeroed for customers  
- Verified/contracted amounts retained  
- Roadmap / QBR scrub helpers clear speculative fields  

---

## Out of scope / follow-ups

- No production deploy from this release  
- No schema migrations  
- Demo / product-overview marketing surfaces may still show sample investment copy for sales demos (not live customer portal data)  
- VCIO checklist item “Establish Technology Budget” refers to client-entered planning records, not TIP auto-quotes  

---

## Rollback

Revert the SS-REL-011 commit set on `staging`. Scrub helpers are additive; no data migration to undo.
