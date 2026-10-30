# SS-UX-016 — Explore Intelligence Center

**Branch:** `staging`  
**Date:** 2026-10-30  
**Database:** Staging Neon only — no schema migration; production untouched.  
**Precedents:** [SS-UX-005](./SS-UX-005-INTERACTIVE-PILLAR-EXPLORATION.md), [SS-UX-006](./SS-UX-006-CUSTOMER-IMPROVEMENT-OPPORTUNITIES.md), [SS-UX-012](./SS-UX-012-CUSTOMER-PROJECTS-DASHBOARD.md)–[SS-UX-015](./SS-UX-015-PROJECT-COMMUNICATIONS.md).

**Constraints honored:** No production deploy; no AI; no scoring or recommendation catalog changes; no admin/public redesign; no customer writes; no unrelated migrations; no second assessment interpretation engine.

---

## 1. Existing architecture and services reused

| Layer | Path / service |
| --- | --- |
| Route | `/clients/[id]/explore?pillar=` — ownership check unchanged |
| Assembly | `getCustomerExplore` in `pillar-explore.ts` |
| Pure DTO | `pillar-detail-dto.ts` (+ new `explore-intelligence.ts`) |
| Official scores / maturity | `getTechnologyProfileDetail` → `buildPillarInsights` / DOC-119 labels |
| Responses | `AssessmentResponse` scoped by `question.category.code` |
| Recommendations | `presentRecommendationsForRole` + pillar category filter |
| Complexity | Existing playbook effort mapping (`complexity.ts`) |
| Recommendation copy | `presentRecommendationDescription` (Finding / Action / Outcome) |
| Project progress | `computeProjectProgress` (SS-UX-013) — never invents % |
| Projects / roadmap links | Legacy `recommendation.project` + `ProjectRecommendation` + `ClientRoadmapInitiative` |
| UI shell | Existing `CustomerExploreExperience` + `PillarTile` + `PillarDetailPanel` |

**Data flow**

```
page → getCustomerExplore(clientId, role, …)
  → getTechnologyProfileDetail (authoritative pillar scores)
  → per pillar:
      assessment responses
      customer-visible recommendations (+ initiatives, project links)
      task/milestone progress for linked projects
  → buildCustomerPillarDetail (pure)
→ CustomerExploreExperience (pillar selector + detail)
```

No competing scoring engine. No duplicate roadmap/project business logic.

---

## 2. Files changed

| File | Change |
| --- | --- |
| `src/lib/customer-portal/explore-intelligence.ts` | **New** — Yes/Partial/No/N/A classification; strength/attention selection |
| `src/lib/customer-portal/pillar-detail-dto.ts` | Findings, plural strengths/attention, enriched opportunities, roadmap/projects |
| `src/lib/customer-portal/pillar-explore.ts` | Load initiatives + multi-project links + progress/milestones |
| `src/components/customer-portal/explore/pillar-detail-panel.tsx` | Intelligence layout sections |
| `src/components/customer-portal/explore/customer-explore-experience.tsx` | Copy only |
| `tests/ux/ss-ux-016-explore-intelligence-center.test.ts` | **New** coverage |
| `docs/ux/SS-UX-016-EXPLORE-INTELLIGENCE-CENTER.md` | This report |

---

## 3. Pillar selection implementation

- Eight tiles from `TECHNOLOGY_PILLARS` (not hardcoded names/scores).
- Score + maturity from authoritative profile insights when present.
- `?pillar=` deep link + in-place selection (desktop adjacent / mobile sheet) unchanged from SS-UX-005/010.

---

## 4. Strength and weakness derivation

| Section | Source |
| --- | --- |
| **What's Working** | Controls classified **Satisfied** (`Yes` / full-score equivalent) |
| **What Needs Attention** | **Not satisfied** then **Partially satisfied**; critical-flagged first when `triggersCriticalFlag` exists |
| N/A | **Excluded from scoring** — listed in findings only, never as strength/attention |

Deterministic ordering by score ratio + question code. Empty states are explicit; nothing is fabricated.

SS-UX-005 single `strength` / `weakness` summaries remain for compatibility.

---

## 5. Assessment control presentation

Full **Assessment findings** list per pillar:

- Question text  
- Recorded answer  
- Result label: Satisfied / Partially satisfied / Not satisfied / Excluded from scoring  
- Critical flag badge **only** when assessment option sets `triggersCriticalFlag`

**Evidence / notes:** Staff/internal notes are not selected. Ambiguous evidence fields are omitted (known limitation).

Official pillar score is never recalculated in the UI.

---

## 6. Recommendation relationships

Per pillar opportunities reuse customer-visible recommendations with:

- Title, priority, status, complexity (when mapped)  
- Approved Finding / Recommended action / Expected outcome when structured description exists  
- Else `businessImpact` only — no invented copy  

Links use existing recommendation detail routes.

---

## 7. Roadmap and project integration

| Artifact | Display |
| --- | --- |
| Roadmap initiatives | Title, recommendation lifecycle status label, phase name, phase target date when present, phase deep link |
| Projects | Deduped from legacy FK + `ProjectRecommendation`; status; task progress (`null` if no tasks); next open milestone; project workspace link |

Completing tasks/projects does **not** change official maturity in Explore.

---

## 8. Customer data-access controls

- Read-only Explore (no create/update/delete in explore service).  
- Tenant ownership enforced by page before `getCustomerExplore`.  
- Deliverable filtering via `presentRecommendationsForRole`.  
- Excludes internal notes, staff-only commentary, financial initiative costs, other clients’ data.

---

## 9. Automated test results

```
npm test -- tests/ux/ss-ux-016-explore-intelligence-center.test.ts \
  tests/ux/ss-ux-005-interactive-pillar-exploration.test.ts
```

**Result (2026-10-30):** 2 files, **21 passed** (15 SS-UX-016 + 6 SS-UX-005 regression).

---

## 10. Browser validation results

Staging localhost against Neon staging data.

| Scenario | Result |
| --- | --- |
| **ABC LLC** (incomplete maturity, Identity & Access 51.43 Basic) | Pass — strengths from Yes; attention from No/Partial + critical flags; findings; structured recommendation sections; roadmap initiatives; empty projects state |
| **Pinnacle Engineering** (strong / Optimized 100) | Pass — strengths shown; attention empty (no invented gaps); opportunities + roadmap + project with 67% progress / next milestone |
| Pillar switch (Identity → Data Protection) | Pass — content updates without extra navigation |
| Internal note leakage in HTML | Pass — no `STAFF ONLY` / `internalNotes` |
| No completed assessment empty UX | Covered by existing Explore empty state + unit “missing assessment”; no separate unassessed staging client exercised in this pass |

Desktop layout validated; mobile sheet mount behavior preserved from SS-UX-010.

---

## 11. Known limitations

- Assessment **notes/evidence** are not shown when the model does not distinguish customer-safe vs internal evidence.  
- Initiative “status” uses linked **recommendation** lifecycle labels (initiatives have no independent status column).  
- Target dates come from **phase** `completionDate` when set — not invented initiative deadlines.  
- Freeform legacy answer text (non-V2 labels) falls back to earned/max ratio for classification without changing official scores.  
- Staging Pinnacle profile is fully Optimized — gap UX validated primarily on ABC LLC.

---

## 12. Architectural decisions requiring review

1. **Extend SS-UX-005** rather than replace Explore — avoids a second interpretation stack.  
2. **Critical** wording only when `triggersCriticalFlag` is set on the recorded option.  
3. **No schema migration** — relationships already exist (`projectLinks`, roadmap initiatives, tasks/milestones).  
4. SS-UX-005 single strength/weakness kept alongside plural SS-UX-016 lists for regression safety; future cleanup can collapse the single summaries if desired.
