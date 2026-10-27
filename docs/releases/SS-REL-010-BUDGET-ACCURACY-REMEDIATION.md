# SS-REL-010 — Technology Budget Accuracy Remediation

| Field | Value |
| --- | --- |
| Status | **Complete (staging code + tests; not production-deployed)** |
| Date | 2026-10-26 |
| Branch | `staging` @ `12a7733` (+ local remediation) |
| Related | [`SS-REL-009-TECHNOLOGY-BUDGET-AUDIT.md`](SS-REL-009-TECHNOLOGY-BUDGET-AUDIT.md) |
| Constraints | No production deploy, no migrations, no Stripe/scoring/recommendation-priority changes, no destructive data edits |

---

## Root cause (from SS-REL-009)

1. TIP/roadmap phases store **both** `monthlyRecurringInvestment` and `annualRecurringInvestment = monthly × 12`.
2. `computeLifecycleBudget` set `annualServices = roadmapAnnual + monthly × 12` and three-year as `monthly × 36 + annual × 3`, producing **~2× annual** and **~6 years** of recurring.
3. The customer UI labeled TIP estimates as generic “Planned / Monthly / Annual / 3-Year Investment,” implying committed spend when only proposed modeling existed.

---

## Changes made

### 1. Corrected recurring math — `src/lib/technology-lifecycle/budget.ts`

| Rule | Implementation |
| --- | --- |
| No monthly/annual double-count | `effectivePhaseAnnualRecurring = max(annual, monthly × 12)` per phase |
| Annual-only preserved | When monthly = 0, use annual |
| Three-year = three years | `… + annualServices × 3` only (no extra `monthly × 36`) |
| Billing vs roadmap | `max(contracted, proposed)` — never sum overlapping sources |
| Documented | File-level calculation rules comment block |

### 2. Financial categories on `LifecycleBudgetPlan`

| Category | Fields |
| --- | --- |
| Actual / completed | `completedInvestment` |
| Approved | `approvedInvestment` (`approved` \| `in_progress`) |
| Proposed estimates | `proposedInvestment`, `proposedMonthlyServices`, `proposedAnnualServices` |
| Contracted services | `contractedMonthlyServices`, `contractedAnnualServices` |
| Deferred | `deferredInvestment` |
| Legacy aggregate | `plannedInvestment` = approved + proposed (QBR compatibility) |
| Presentation | `hasVerifiedFinancials`, `hasProposedEstimates`, `presentationMode` |

TIP `planned` / `awaiting_approval` phases are **proposed**, never approved.

### 3. Customer presentation — `lifecycle-dashboard.tsx`

| Mode | UI |
| --- | --- |
| `empty` | Professional empty state + links to recommendations & roadmap |
| `estimates_only` | Empty/scoping message **plus** clearly labeled **Preliminary estimates only** panel |
| `verified` | Completed / approved / contracted / refresh first; proposed estimates only in a labeled secondary panel |

Does **not** show speculative TIP totals as committed budget KPIs.

### 4. Preserved

- TIP / recommendation pricing engines unchanged  
- Roadmap phase investment fields unchanged  
- Billing recurring services / tech refresh budgets still inputs  
- QBR still reads `plannedInvestment` / corrected recurring  
- Assessment scoring untouched  

---

## Staging validation — ABC LLC

Read-only recompute against staging Neon (no data writes):

| Check | Result |
| --- | --- |
| Completed assessments | **1** (score **39** unchanged) |
| Recommendations present | **Yes** |
| Roadmap phases | **4** (all `planned`) |
| `presentationMode` | **`estimates_only`** |
| `approvedInvestment` | **0** |
| `proposedMonthlyServices` | 32,319 |
| `proposedAnnualServices` / `annualServices` | **387,828** (= monthly × 12, **not** 775,656) |
| `estimatedThreeYearInvestment` | **1,264,480.88** (= proposed one-time + annual × 3, **not** 2,427,965) |
| Double annual | **Fixed** (`noDoubleAnnual: true`) |
| Six-year artifact | **Fixed** (`notSixYear: true`) |

Customer-facing panel will show the scoping empty state and preliminary estimates only—not approved/contracted KPIs.

---

## Automated tests

```text
npm test -- tests/technology-lifecycle
→ 2 files / 22 tests PASSED
```

Coverage includes:

1. Monthly→annual conversion / no twin double-count  
2. Three-year = 3 × annual  
3. Annual-only charges  
4. Billing vs roadmap `max` (no sum)  
5. Deferred exclusion  
6. Empty presentation  
7. Proposed vs approved classification  
8. Tenant isolation (pure inputs + route contract)  
9. Existing completed / approved / contracted records  

---

## Remaining risks

| Risk | Mitigation / follow-up |
| --- | --- |
| TIP default dollars remain large even as “preliminary” | Staff should refine investment draft before customer-facing estimates feel “quote-like”; optional future: hide preliminary amounts until consultant publishes |
| `max(annual, monthly×12)` if annual were a *partial* independent fee below monthly×12 | Current TIP always sets annual ≥ monthly×12 when both set; monitor manual edits |
| QBR PDF still uses legacy `plannedInvestment` aggregate | Correct recurring math applies; consider QBR copy “proposed vs approved” in a later ticket |
| Production still serves old calculation until deploy | Staging-only for this ticket; promote after operator review |
| No migration of stored phase fields | Intentional — storage can keep monthly+annual twins; aggregation is fixed at read time |

---

## Files touched

| Path | Change |
| --- | --- |
| `src/lib/technology-lifecycle/budget.ts` | Correct math + categories + docs |
| `src/lib/technology-lifecycle/types.ts` | Extended `LifecycleBudgetPlan` |
| `src/lib/technology-lifecycle/index.ts` | Exports |
| `src/components/technology-lifecycle/lifecycle-dashboard.tsx` | Empty state + labeled estimates |
| `tests/technology-lifecycle/budget.test.ts` | Expanded assertions |
| `tests/technology-lifecycle/lifecycle-route-isolation.test.ts` | Route/UI contract |

---

## Safety

No production deployment, migrations, Stripe changes, scoring changes, recommendation priority changes, or destructive data updates.
