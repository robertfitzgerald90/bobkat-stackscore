# SS-REL-009 — Technology Budget Calculation Audit

| Field | Value |
| --- | --- |
| Status | **Investigation complete — read-only; no remediation implemented** |
| Date | 2026-10-26 |
| Branch | `staging` @ `12a7733` |
| Staging sample | ABC LLC (latest fulfilled purchase client) |
| Observed UI | Completed $0 · Planned $100,997 · Deferred $0 · Monthly $32,319 · Annual $775,656 · Refresh $0 · 3-Year $2,427,965 |

### Exact root cause (short)

**Double-counting of the same recurring dollars.** TIP/roadmap pricing stores **both** `monthlyRecurringInvestment` and `annualRecurringInvestment = monthly × 12` on every phase. `computeLifecycleBudget` then sets:

- `annualServices = roadmapAnnual + monthlyServices × 12` → **2×** true annual recurring  
- `estimatedThreeYearInvestment = … + monthlyServices × 36 + roadmapAnnual × 3` → **6×** monthly (≈ **two** three-year runs), which equals `annualServices × 3 + planned` and matches the UI.

Amounts are **algorithmic TIP estimates** (impact-weighted labor/hardware/services draft + margin), **not** customer-entered budgets or contracted billing. Tenant scoping is correct (client-scoped roadmap); figures are not cross-tenant.

---

## 1. Data sources (Phase 1)

| Item | Location |
| --- | --- |
| UI widget | `LifecycleDashboard` → “Technology Budget Planning” (`src/components/technology-lifecycle/lifecycle-dashboard.tsx`) |
| Page | `src/app/(dashboard)/clients/[id]/lifecycle/page.tsx` (customer must own `clientId`) |
| API | `GET /api/v1/clients/[id]/lifecycle` → `getTechnologyLifecycleDashboard` |
| Calculator | `computeLifecycleBudget` (`src/lib/technology-lifecycle/budget.ts`) |
| Aggregation inputs | Active/draft `ClientRoadmap` → `ClientRoadmapPhase` investment fields; optional `ClientRecurringService` (billing); optional `ClientTechnology` refresh budgets |
| Upstream cost origin | TIP roadmap engine: `resolveRecommendationCostProfiles` / `sumCostProfiles` → materialize into phase decimals (`recommendation-pricing.ts`, `defaults.ts`) |

### Lineage

```
Assessment recommendations (open)
  → TIP investment draft (auto defaults from Σ impact points)
  → per-recommendation cost profiles (one-time / monthly / annual=monthly×12)
  → phase rollups on ClientRoadmapPhase
  → computeLifecycleBudget (+ optional billing monthly, tech refresh)
  → LifecycleDashboard currency rows
```

| Source | Used for displayed sample? |
| --- | --- |
| Assessment answers (scores) | Indirectly (drive recommendations → impact weights) |
| Recommendation catalog / suggested service rules | Yes (cost type one_time / recurring / mixed) |
| Seeded TIP investment defaults | Yes (`laborCents` floor from impact × 15_000¢, hardware 25%, services 40%, margin) |
| Customer-entered budget | **No** — 0 client technologies with budget; 0 recurring services |
| Approved / actual spend | **No** — phase `actualCost` / initiative `actualOneTimeCost` unused in this widget; all phases `planned` |

### Tenant isolation

- Dashboard loaded with `clientId` from route; customer mode requires `session.user.clientId === id`.
- Roadmap / phases / recurring services / technologies queried by that `clientId`.
- **No evidence of shared cross-tenant budget totals** in this path.

---

## 2. Calculation formulas (Phase 2)

From `computeLifecycleBudget(phases, refreshItems, activeMonthlyServices)`:

| Display field | Formula |
| --- | --- |
| Completed Investment | Σ `oneTimeInvestment` where phase status ∈ completed |
| Planned Investment | Σ `oneTimeInvestment` where status ∈ planned, awaiting_approval, approved, in_progress |
| Deferred Investment | Σ `oneTimeInvestment` where status = deferred |
| Monthly Services | `max(activeMonthlyFromBilling, Σ monthlyRecurringInvestment)` over non-deferred/non-cancelled phases |
| Annual Services | `Σ annualRecurringInvestment` (same phase filter) **`+ monthlyServices × 12`** |
| Future Refresh Budget | Σ annualized `ClientTechnology.budgetAmountCents` (period / replacement window) |
| Estimated 3-Year Investment | `completed + planned + monthlyServices × 36 + roadmapAnnual × 3 + futureRefresh` |

Billing monthly (`ClientRecurringService`) feeds only the `max(...)` for Monthly Services; staging sample billing = **0**.

### Why Monthly $32,319 vs Annual $775,656

Staging phase sums (all `planned`, each `annual === monthly × 12`):

| Phase | One-time | Monthly | Annual |
| --- | --- | --- | --- |
| Critical Stabilization | 32,906.23 | 10,530 | 126,360 |
| High Priority Improvements | 39,993.75 | 12,798 | 153,576 |
| Operational Maturity | 15,187.50 | 4,860 | 58,320 |
| Strategic Enhancements | 12,909.40 | 4,131 | 49,572 |
| **Totals** | **100,996.88** | **32,319** | **387,828** |

Then:

```
monthlyServices = 32,319
roadmapAnnual   = 387,828   (= 32,319 × 12)
annualServices  = 387,828 + 32,319 × 12 = 775,656   ← DOUBLE annualization
```

So Annual is **not** “monthly × 12”; it is **monthly × 12 counted twice** (once via stored annual fields, once via explicit ×12).

### Three-year identity

Operator check: `$775,656 × 3 + $100,997 = $2,427,965` — **holds** (rounding to dollars).

Code path for this sample (`completed=0`, `refresh=0`):

```
3yr = planned + monthly×36 + roadmapAnnual×3
    = 100,996.88 + 32,319×36 + 387,828×3
    = 100,996.88 + 1,163,484 + 1,163,484
    = 2,427,964.88
```

Because `roadmapAnnual = monthly×12`, this is also:

```
planned + monthly×72  ≈  six years of monthly recurring + one-time planned
```

So the “3-year” label is **intentional in code structure** but **arithmetically wrong** whenever annual fields are monthly×12 duplicates (the normal TIP output). Reconciling as `annualServices×3 + planned` **embeds the same double-count**.

---

## 3. Data quality (Phase 3)

| Question | Finding |
| --- | --- |
| Recommendation costs duplicated? | **Yes across monthly vs annual fields** on every phase; not duplicate rows of the same phase. |
| Recurring counted multiple times? | **Yes** — in Annual Services and again in 3-year via monthly×36 **and** annual×3. |
| Monthly + annual combined incorrectly? | **Yes** — `annualServices = roadmapAnnual + monthly×12`. |
| Annual includes extra categories? | Only phase annual fields + re-annualized monthly; no separate billing annual in sample. |
| Prices hardcoded? | **Partially** — service cost-type rules hardcoded; dollar magnitudes from TIP default investment formula + margin, allocated by impact points — **not** SKU quotes or customer inputs. |
| Recs auto-create budget entries? | Materialized into **roadmap phase investment fields** (estimates). Widget treats planned phases as investment figures without “estimate” labeling. |
| Based on actual customer financial inputs? | **No** for this client (0 recurring services, 0 tech budgets, initiative `actualOneTimeCost` null). |
| Estimates vs approved spending? | Phases all **`planned`**; widget labels say “Investment” / “Services” without “estimate” or “proposed.” Approved/actual fields not used here. |
| Customer entered financials? | **No** evidence on ABC LLC for this widget’s inputs. |

### Upstream estimate engine (why ~$101k / ~$32k/mo)

`src/lib/technology-improvement-plan/defaults.ts` seeds TIP investment from recommendation impact:

- `laborCents = max(250_000, impactTotal × 15_000)`
- hardware ≈ 25% of labor; services ≈ 40% of labor; margin applied  
Then `recommendation-pricing.ts` allocates across recommendations and **always sets `annualRecurringInvestment = monthly × 12`**.

57 initiatives across 4 phases → large impact total → large synthetic plan → numbers that look like precise contracted spend.

---

## 4. Financial integrity / risks (Phase 4)

| Practice today | Risk |
| --- | --- |
| Show unverified estimates as clean dollar KPIs | Customers treat figures as quotes / committed cost |
| Auto-populate “Planned Investment” from open recommendations | Implies commitment without approval |
| Treat roadmap phase status `planned` as budget plan | Conflates proposed TIP with approved budget |
| “Estimated 3-Year” without assumptions / double-count | ~2× overstatement of recurring; reputational / legal exposure |
| No customer budget data still shows large totals | Fabricated precision after a single assessment |
| Annual ≠ 12× monthly | Erodes trust when customers spot inconsistency |

**Should StackScore display these as-is in production?** **No** — not without fixing the double-count, labeling estimates, and separating proposed vs approved vs actual.

---

## 5. Recommended remediation (Phase 5 — do not implement here)

### Immediate (pre-production)

1. **Fix aggregation** in `computeLifecycleBudget`:
   - Prefer **one** recurring basis: e.g. `annualServices = max(roadmapAnnual, monthlyServices × 12)` **or** `monthly × 12` only if annual is known duplicate.
   - Three-year recurring: **`monthlyServices × 36` OR `annualServices × 3`**, never both monthly×36 and annual×3 when annual≡monthly×12.
2. **UI copy:** “Estimated / proposed (not approved)” on every currency row; show formula footnotes (what is included).
3. **Gate display:** If no customer-entered budget / no approved phases / no active billing — show empty state or “Estimates available after staff review” instead of six-figure KPIs.
4. **Do not** present TIP defaults as “Monthly Services” without saying “proposed managed-service estimate.”

### Structural (product)

| Concept | Suggested meaning |
| --- | --- |
| Actual | Customer- or staff-entered spend / invoices / `actualCost` |
| Proposed / estimated | TIP / recommendation-derived (clearly labeled) |
| Planned (approved) | Phases/proposals with approval timestamps |
| Deferred | Explicit deferrals only |

Prefer actuals when present; never auto-promote recommendations to “committed” budgets.

### Tests needed before release

1. Unit: when every phase has `annual = monthly × 12`, assert `annualServices === monthlyServices × 12` (not 2×).
2. Unit: `estimatedThreeYearInvestment` recurring component equals **3** years of monthly (or annual), not 6.
3. Unit: deferred phases excluded from planned one-time and from recurring (existing intent).
4. Unit: `activeMonthlyFromBilling` vs roadmap monthly `max` behavior documented.
5. Integration: client with **zero** roadmap / zero billing → budget zeros or suppressed UI.
6. Integration: tenant A roadmap numbers never appear for tenant B.
7. Regression: update `tests/technology-lifecycle/budget.test.ts` — current test **does not assert** `annualServices` and **allows** the broken 3-year composition (`roadmapAnnual: 500` plus monthly×36).
8. Contract/UI: confirmation that labels include “estimate” / assumptions.

---

## 6. Evidence summary (staging ABC LLC)

| Metric | Value |
| --- | --- |
| Roadmap | `draft`, 4 phases, all `planned` |
| Planned one-time sum | **100,996.88** → UI **$100,997** |
| Monthly sum | **32,319** |
| Annual field sum | **387,828** (= monthly×12) |
| Computed annualServices | **775,656** (= 387,828 + 32,319×12) |
| Computed 3-year | **2,427,964.88** |
| Recurring services rows | **0** |
| Tech budgets | **0** |
| Cross-check `monthly×72 + planned` | **2,427,965** (matches “3-year”) |

---

## 7. Deliverable checklist

1. **Root cause:** Double-count of recurring (monthly fields + annual=monthly×12) in Annual Services and 3-year formula; values are synthetic TIP estimates, not customer finances.  
2. **Formulas:** Documented above from `budget.ts`.  
3. **Data lineage:** Recommendations → TIP defaults/pricing → roadmap phases → lifecycle dashboard; client-scoped.  
4. **Duplication evidence:** Phase `annualEqualsMonthlyTimes12: true` for all four phases; `annualServices = 2 × (monthly×12)`; 3-year ≡ six years of monthly + planned.  
5. **Risks:** Misleading precision, overstated multi-year cost, trust/compliance exposure.  
6. **Remediation:** Fix math; label estimates; suppress or qualify when no actuals/approvals; separate proposed vs approved vs actual.  
7. **Tests:** Assert no double annualization; 3-year = 3× recurring; empty-state; tenant isolation; strengthen existing budget unit test.

**No code, data, pricing, scoring, migration, or production changes were made in this audit.**
