# DOC-311 – Interactive StackScore Experience Phased Demo

## Purpose

Document the public Interactive StackScore Experience (`/product-overview`) after alignment with the production phased Technology Roadmap, phase proposals, and effective StackScore journey.

## Demo scenario structure

Central source of truth:

`src/lib/product-overview/interactive-demo/scenario.ts` → `NORTHSTAR_INTERACTIVE_DEMO_SCENARIO`

Includes:

- Company profile (Northstar Manufacturing SMB ICP)
- Assessment snapshot (initial score 58, projected final 92)
- Four roadmap phases (production `DEFAULT_ROADMAP_PHASE_DEFINITIONS`)
- Phase 1 proposal seed
- Score progression and pillar before/after values
- Pricing constants aligned to production (`VCIO_MONTHLY_AMOUNT_CENTS`, Managed IT $15/device)

Do not scatter phase pricing across React components. Derive UI from the scenario + state machine.

## Demo-only state management

| Concern | Location |
|--------|----------|
| Types | `interactive-demo/types.ts` |
| Reducer / actions | `interactive-demo/state.ts` |
| Derived view | `interactive-demo/derive.ts` |
| React provider | `components/product-overview/interactive-demo-context.tsx` |

Persisted only in `sessionStorage` under `stackscore-interactive-demo-v1`.

Actions:

- `approve_phase1`
- `start_implementation`
- `complete_initiative`
- `complete_phase1`
- `select_phase`
- `reset`

`clearAllDemoSessionStorage()` also clears this key and dispatches `stackscore-interactive-demo-reset` so Restart Demo / Start Fresh restore the original scenario.

## Simulated interactions

Safe local-only behaviors:

- Approve Phase 1 in Demo
- Start Implementation in Demo
- Simulate Phase Completion
- Restart Demo

These must never:

- Create production proposals, projects, invoices, or signatures
- Send email
- Trigger Stripe
- Mutate client records
- Require authentication

## Shared production components / utilities

Reused (not duplicated):

- `RoadmapStatusBadge`
- `ROADMAP_PHASE_STATUS_LABELS` / `RECOMMENDATION_LIFECYCLE_LABELS`
- `DEFAULT_ROADMAP_PHASE_DEFINITIONS` / `PRIORITY_TIMELINES`
- `formatCurrency` / `centsToDollars` from TIP pricing
- `VCIO_MONTHLY_AMOUNT_CENTS`
- Managed IT catalog price label from `CORE_SERVICES`
- Existing OfferReveal, cards, badges, nav shell, report library chrome

## Pricing alignment

- Managed IT: 60 devices × $15/device/month = $900/month (catalog-aligned)
- Strategic IT Consulting: `VCIO_MONTHLY_AMOUNT_CENTS` ($300/month)
- One-time amounts are SMB-realistic implementation fees in the scenario object
- UI never combines one-time + monthly into a grand total (`DemoInvestmentSummary`)

## How to update the scenario safely

1. Edit `NORTHSTAR_INTERACTIVE_DEMO_SCENARIO` only.
2. Keep phase IDs equal to `DEFAULT_ROADMAP_PHASE_DEFINITIONS`.
3. Keep Phase 1 initiative score contributions totaling the phase improvement.
4. Keep report preview copy in `demo-execution.ts` consistent with scenario totals.
5. Run `npx vitest run tests/product-overview`.

## Guided navigation

Overview → Assessment → Roadmap → Proposal → Implementation → Improvement → Budget → Reports

Enrichment sections remain below the guided journey and are intentionally omitted from primary nav.
