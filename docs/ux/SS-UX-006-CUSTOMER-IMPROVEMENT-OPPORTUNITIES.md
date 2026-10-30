# SS-UX-006 — Customer Improvement Opportunities Experience

**Branch:** `staging`  
**Date:** 2026-10-29  
**Status:** Implemented (staging only — no production deploy)  
**Precedents:** [SS-UX-003](./SS-UX-003-CUSTOMER-PORTAL-VISUAL-FOUNDATION.md), [SS-UX-004](./SS-UX-004-PREMIUM-EXECUTIVE-OVERVIEW.md), [SS-UX-005](./SS-UX-005-INTERACTIVE-PILLAR-EXPLORATION.md)

**Constraints honored:** No migrations, scoring changes, recommendation catalog modifications, automatic roadmap modifications, status transitions without customer action, staff dashboard redesign, projected maturity KPI, or production deploy.

---

## 1. Architecture

```
/clients/{id}/recommendations?pillar=&priority=&status=&selected=
  → page ownership check (customer JWT clientId === route id)
  → getCustomerOpportunities(clientId, filters, role, selectedId)
      → Prisma AssessmentRecommendation (customer-visible statuses)
      → roadmapInitiatives + phase name (existing relations only)
      → presentRecommendationsForRole (deliverable + strip consulting fields)
      → buildCustomerOpportunitiesDto (pure)
  → <CustomerRecommendationsView />
      → summary (active / completed / deferred / declined)
      → URL-driven filters
      → compact OpportunityRow list
      → expand selected detail via ?selected=
```

Staff path unchanged: `getClientRecommendations` → `ClientRecommendationsView`.

Visual system: SS-UX-003 customer portal theme + industrial surface tokens from Explore/Overview.

| Module | Role |
| --- | --- |
| `src/lib/customer-portal/opportunities.ts` | Authorized assembly |
| `src/lib/customer-portal/opportunities-dto.ts` | Pure filters / DTO / summary |
| `src/lib/customer-portal/recommendation-content.ts` | Parse approved description sections |
| `src/lib/customer-portal/complexity.ts` | Reused playbook effort → Easy/Moderate/Complex |
| `src/components/customer-portal/opportunities/*` | Summary, filters, row, detail |
| `src/components/customer-portal/customer-recommendations-view.tsx` | Customer shell UX |
| `src/lib/clients/paths.ts` | `selected` (+ optional pillar), roadmap phase path |

**Not modified:** recommendation engines, catalogs, sync/dedupe, scoring, Prisma schema.

---

## 2. Recommendation presentation changes

### Before

- Fully expanded card stack of **active** recommendations only.
- Highlighted estimated StackScore point gains.
- No filters UI, no `?selected=` focus, no roadmap links, no structured Finding/Action sections.

### After

- **Compact rows** (title, pillar, priority, status, complexity).
- **One expanded detail panel** for the selected opportunity.
- Detail uses approved catalog sections when present:
  - Finding
  - Recommended action
  - Expected outcome
  - Implementation considerations
- Plus pillar link (Explore), complexity (when mapped), business context (`businessImpact`), and roadmap relationship when a `ClientRoadmapInitiative` exists.
- **Does not** present `estimatedImpactPoints` as a guaranteed StackScore improvement.
- Unstructured descriptions fall back to “Why this matters” from `businessImpact` only — no invented copy.

---

## 3. Filtering behavior

| Param | Behavior |
| --- | --- |
| `pillar` | Category code (canonical TECHNOLOGY_PILLARS) |
| `priority` | `critical` \| `high` \| `medium` \| `low` |
| `status` | Default **`active`** (`open` + `accepted` + `in_progress`). Also: `all`, or a single visible status including `completed` / `deferred` / `declined`. |
| (none) | Active opportunities only — full set remains reachable via status filter |

**Ordering:** priority ascending (critical first), then `estimatedImpactPoints` desc (sort helper), matching list query determinism.

**Summary strip:** counts across all customer-visible deliverable rows (identified / active / completed / deferred / declined), independent of the active list filter. Matching count reflects current filters.

Archived recommendations remain staff-side only (not customer-visible).

---

## 4. Deep-link implementation

| Source | Link shape |
| --- | --- |
| Overview priorities / Explore opportunity rows | `?selected={id}&pillar={code}` via `clientRecommendationDetailPath` |
| Explore “View all” | `?pillar={code}` |
| In-page expand / collapse | `router.push` updates `selected` (cleared on filter change) |

Behavior:

- Valid `selected` expands the row and smooth-scrolls to `#rec-{id}`.
- Selected outside current filters: shown expanded with a status notice (not fabricated into the matching set).
- Missing / non-deliverable / cross-tenant id: fail-safe message; no data leak.
- Browser back/forward restores filter + selection via URL search params.

---

## 5. Roadmap integration

When `AssessmentRecommendation.roadmapInitiatives` has rows:

- Show first initiative title + phase name.
- Link to existing `/clients/{id}/roadmap/phases/{phaseId}` (`clientRoadmapPhasePath`).

When absent: explicit empty copy — no invented initiatives, no auto-create, no status mutation.

---

## 6. Authorization validation

| Layer | Enforcement |
| --- | --- |
| Middleware | Clients limited to allowlisted workspace sections including `recommendations` |
| Page | Customer `user.clientId` must match route `id` → otherwise `notFound()` |
| Data | Queries scoped by `clientId`; `presentRecommendationsForRole` fail-closed for stubs / missing template codes; consulting fields stripped |
| Mutations | None on this page — no customer status transitions introduced |

Staff recommendations UI and APIs unchanged.

---

## 7. Automated tests

```
npm test -- tests/ux/ss-ux-006-customer-improvement-opportunities.test.ts
npm test -- tests/ux/ss-ux-005-interactive-pillar-exploration.test.ts
npm test -- tests/client-workspace/paths.test.ts
```

**SS-UX-006 coverage:**

- Structured description parsing (and no invention when unstructured)
- Status filter normalization / active semantics
- DTO summary, pillar/priority filtering, selected outside filter, missing selected
- Path helpers (selected + optional pillar, roadmap phase)
- View/page wiring without impact-guarantee copy; no engine/catalog coupling

Result (this pass): SS-UX-006 **8** tests + related path/Explore tests **passed**.

---

## 8. ABC LLC staging regression

| Check | Expected / documented |
| --- | --- |
| Official StackScore | **39** |
| DOC-119 maturity | **Initial** |
| Customer-visible recommendations | **57** remain accessible (via filters / all statuses) |
| Projected maturity KPI | **None** |
| Recommendation statuses | **Unchanged** by this ticket |
| Default list | Active opportunities (compact) |

Live ABC DB verification remains a staging preview checklist item (read-only).

---

## 9. Manual browser checklist

- [ ] Summary distinguishes Active / Completed / Deferred / Declined  
- [ ] Pillar, priority, and status filters update the list without layout shift  
- [ ] Compact rows; only selected row shows full detail  
- [ ] Explore opportunity link opens correct row (`?selected=` + scroll)  
- [ ] Pillar filter preserved when linked from Explore  
- [ ] Browser back/forward restores filters and selection  
- [ ] Invalid `selected` fails safely  
- [ ] Roadmap link appears only when initiative exists; phase navigation works  
- [ ] No “guaranteed StackScore improvement” framing  
- [ ] Mobile: filters usable; expand/collapse readable; no horizontal overflow  
- [ ] Staff `/clients/{id}/recommendations` unchanged  
- [ ] Cross-tenant customer URL → not found  

---

## 10. Remaining issues

1. Many opportunities may still show **Not classified** complexity until `suggestedService` matches playbook mappings — by design (SS-UX-005).  
2. Unstructured legacy descriptions omit labeled Finding/Action blocks — UI falls back to business impact only.  
3. Multiple roadmap initiatives per recommendation show the **first** linked initiative only.  
4. Customer page remains read-only for status — intentional; no self-serve accept/defer/complete in this ticket.  
5. Manual ABC checklist still required on staging preview.  
6. No production deployment from this ticket.

---

## Acceptance summary

| Requirement | Status |
| --- | --- |
| Cohesive Explore → Opportunities → Roadmap journey | Done |
| Compact list + expandable approved detail | Done |
| Pillar / priority / status filters + deterministic order | Done |
| `?selected=` deep links + history | Done |
| Roadmap relationships when present | Done |
| Customer authorization + visibility filters | Preserved |
| No scoring / catalog / status / roadmap auto-changes | Honored |
| Staging-only deliverable | Honored |
