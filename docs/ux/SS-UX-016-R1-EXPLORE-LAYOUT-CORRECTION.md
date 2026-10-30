# SS-UX-016-R1 — Explore Workspace Layout Correction

**Branch:** `staging`  
**Date:** 2026-10-30  
**Database:** Staging Neon only — no schema migration; production untouched.  
**Depends on:** [SS-UX-016 — Explore Intelligence Center](./SS-UX-016-EXPLORE-INTELLIGENCE-CENTER.md)  
**Next (blocked until review):** SS-UX-017 — Customer Platform Validation

**Constraints honored:** Presentation-only; no scoring/catalog/lifecycle changes; no migrations; no AI; no admin/public redesign; no customer writes; no parallel Explore data path.

---

## 1. Original layout problem

SS-UX-016 delivered assessment findings, strengths, weaknesses, recommendations, roadmap relationships, and project intelligence, but retained the SS-UX-005 shell:

- Eight large pillar cards occupying roughly half the viewport.
- Selected pillar detail constrained to a narrow right-side panel.
- Long vertical finding lists and repeated score emphasis.
- Poor use of horizontal content width and excessive scrolling.

Functionality was acceptable; the Technology Intelligence Center presentation was not.

---

## 2. Files changed

| File | Change |
| --- | --- |
| `src/components/customer-portal/explore/customer-explore-experience.tsx` | Full-width stack; removed left-grid / right-detail / mobile sheet dual-mount |
| `src/components/customer-portal/explore/pillar-selector.tsx` | **New** — compact 2 / 4 / 8 responsive pillar tiles |
| `src/components/customer-portal/explore/pillar-overview.tsx` | **New** — full-width selected pillar overview |
| `src/components/customer-portal/explore/pillar-strengths-attention.tsx` | **New** — side-by-side What's Working / What Needs Attention + View all |
| `src/components/customer-portal/explore/pillar-intelligence-tabs.tsx` | **New** — Findings / Recommendations / Roadmap & Projects tabs |
| `src/components/customer-portal/explore/pillar-detail-panel.tsx` | Thin composition wrapper of overview + strengths + tabs |
| `src/components/customer-portal/explore/pillar-tile.tsx` | Unchanged (Overview still uses large tiles) |
| `tests/ux/ss-ux-016-r1-explore-layout.test.ts` | **New** layout wiring assertions |
| `tests/ux/ss-ux-016-explore-intelligence-center.test.ts` | Updated for new component structure |
| `docs/ux/artifacts/ss-ux-016-r1/*.png` | Browser screenshots |
| `docs/ux/SS-UX-016-R1-EXPLORE-LAYOUT-CORRECTION.md` | This report |

**Unchanged (by design):** `getCustomerExplore`, `pillar-detail-dto`, `explore-intelligence`, scoring, recommendation presentation, project progress, auth/ownership.

---

## 3. New component structure

```
CustomerExploreExperience
  ├─ ClientPageHeader
  ├─ PillarSelector          (compact eight-pillar control)
  └─ selected detail stack
       ├─ PillarOverview
       ├─ PillarStrengthsAttention
       └─ PillarIntelligenceTabs
            ├─ Assessment Findings
            ├─ Recommendations
            └─ Roadmap & Projects
```

`PillarDetailPanel` remains as a reusable full-width stack for the same three sections. No second Explore fetch path.

---

## 4. Pillar selector

- Data: existing `explore.pillars` tiles (authoritative scores + maturity labels).
- Layout: `grid-cols-2` → `sm:grid-cols-4` → `xl:grid-cols-8`; compact `min-h-16` tiles (not Overview-sized cards).
- Interaction: `aria-pressed` / selected ring; `?pillar=` via `router.push(..., { scroll: false })`; URL sync preserves back/forward.
- Incomplete scores render as `—` with “not scored” accessible labels.

---

## 5. Full-width overview

Single panel spanning content width (`max-w-6xl` shell):

- Pillar name, business question, maturity summary.
- One official score display (`N / 100` + maturity badge).
- Assessed control count, improvement opportunity count, related work count.

Score is prominent but not duplicated in oversized sibling cards.

---

## 6. Strengths and weaknesses

- Desktop: `lg:grid-cols-2` — What's Working | What Needs Attention.
- Mobile: stacked.
- Compact finding rows (status, question, recorded answer, critical flag).
- Preview limit of 3 with accessible **View all** disclosure; full list remains in Assessment Findings tab.
- Empty states explicit; no fabricated findings (SS-UX-016 classifiers reused).

---

## 7. Detailed intelligence tabs

| Tab | Content |
| --- | --- |
| Assessment Findings | Complete assessed controls including N/A / excluded |
| Recommendations | Customer-visible opportunities via existing presentation fields + detail links |
| Roadmap & Projects | Initiatives (phase, recommendation status) + projects (status, task progress, next milestone) |

Empty states for missing initiatives/projects. No new recommendation lifecycle or invented activity.

---

## 8. Responsive behavior

| Width | Observed |
| --- | --- |
| 1440px | Compact selector (up to 8 across); full-width overview; side-by-side findings; wide tabs |
| 1024px / 768px | 4-column selector; overview full width; findings side-by-side from `lg` |
| 390px / 320px | 2-column compact selector; stacked findings; tabs wrap; questions wrap; no page-level horizontal overflow from Explore content |

Critical acceptance: desktop no longer shows left pillar grid + narrow right detail panel.

---

## 9. Screenshots and paths

| Viewport | Path |
| --- | --- |
| Desktop 1440 | `docs/ux/artifacts/ss-ux-016-r1/desktop-1440.png` |
| Tablet 768 | `docs/ux/artifacts/ss-ux-016-r1/tablet-768.png` |
| Mobile 390 | `docs/ux/artifacts/ss-ux-016-r1/mobile-390.png` |

Desktop artifact shows full-width overview, side-by-side What's Working / What Needs Attention, and detailed intelligence — not the prior two-column Explore shell.

---

## 10. Automated test results

| Suite | Result |
| --- | --- |
| `tests/ux/ss-ux-016-r1-explore-layout.test.ts` | **4 passed** |
| `tests/ux/ss-ux-016-explore-intelligence-center.test.ts` | **15 passed** |
| `tests/ux/ss-ux-005-interactive-pillar-exploration.test.ts` | **6 passed** |
| `tests/ux/ss-ux-002-customer-navigation.test.ts` | **9 passed** |
| `tests/ux/ss-ux-010-customer-experience-polish.test.ts` | **9 passed** |
| ESLint `src/components/customer-portal/explore/**` + R1 test | **Clean** (no findings) |
| `npx tsc --noEmit` | Pre-existing failures in unrelated test files (next-action, env, tip-*, etc.); none attributed to Explore R1 sources |
| `npm run build` | **Passed** (Prisma generate + `next build --turbopack`, exit 0) |

Combined UX regression for this ticket: **43 tests passed** across the five suites above.

---

## 11. Browser validation results

Staging clients used:

| Scenario | Client | Result |
| --- | --- | --- |
| Mixed findings + recs + roadmap | **ABC LLC** (`757ed163-…`) Identity & Access 51.43 Basic | Pass — strengths, critical attention items, View all, Findings/Recommendations/Roadmap tabs, 6 initiatives, empty projects for this pillar |
| Strong maturity + projects | **Pinnacle Engineering** (`a0000001-…`) Identity & Access 100 Optimized | Pass — strengths present; **no fabricated weaknesses**; roadmap initiative + linked project with task progress/milestone |
| Incomplete / unscored | **Bobby Fitzgerald** (`0f9e7855-…`) assessment in progress | Pass — in-progress banner; scores `—`; empty strengths/attention; “No assessment findings yet”; no invented results |

Deep link `?pillar=identity_access` preserved. Pillar switching updates selection without full navigation reload. Tenant isolation unchanged (client-scoped Explore routes).

---

## 12. Known limitations

- Mobile still uses a compact 2-column selector (ticket-allowed); eight tiles remain taller than a single horizontal scroller would be.
- Base UI `TabsContent` may keep inactive panels in the accessibility tree while visually hidden — visual tab switching works.
- Pure “never started assessment” empty shell (`ClientEmptyState` Assessment required) was not separately screenshot’d; in-progress unscored client covers empty findings/strengths without fabrication.
- Repo-wide `tsc --noEmit` still fails on pre-existing unrelated test typing issues outside this ticket.

---

## Stop for review

SS-UX-016-R1 is ready for stakeholder review on `staging`. Do **not** begin SS-UX-017 until this layout correction is accepted.
