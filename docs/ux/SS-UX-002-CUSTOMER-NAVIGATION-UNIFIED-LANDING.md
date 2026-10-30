# SS-UX-002 — Customer Navigation & Unified Landing

**Branch:** `staging`  
**Date:** 2026-10-28  
**Status:** Implemented (staging only — no production deploy)  
**Precedent:** [SS-UX-001](./SS-UX-001-CUSTOMER-EXPERIENCE-ARCHITECTURE.md)  
**Constraints honored:** No migrations, scoring changes, recommendation metadata changes, destructive data edits, full dashboard redesign, PDF redesign, or staff navigation redesign.

---

## 1. Navigation changes

### Primary customer sidebar (exactly four items)

| # | Label | Destination | Notes |
| --- | --- | --- | --- |
| 1 | Overview | `/clients/{id}/technology-profile` | Existing technology-profile route; no visual dashboard redesign |
| 2 | Explore | `/clients/{id}/explore` | **New** foundation route for eight pillars |
| 3 | Roadmap | `/clients/{id}/roadmap` | Active also on recommendations / projects |
| 4 | Reports | `/clients/{id}/executive-reports` | Active also on quarterly-reviews / quarterly-review |

Implementation: `getCustomerSidebarNav` in `src/lib/navigation/sidebar-nav.ts`.  
Mobile sheet reuses the same sidebar nav. Active state via `isSidebarNavItemActive` (+ `activePathPrefixes`).

### Secondary navigation (account menu)

Moved out of the primary sidebar; still reachable:

| Label | Path |
| --- | --- |
| Subscription & Billing | `/clients/{id}/billing` |
| Account | `/account` |
| Support | `/support` |

Wired through `getCustomerSecondaryNav` → `AppHeader` account dropdown. Command palette retains matching destinations under the account category.

### Staff navigation

`getConsultantSidebarNav` / staff workspace chrome unchanged. No Explore primary item for staff.

### Command palette

Customer primary destinations updated to Overview / Explore / Roadmap / Reports. Legacy destinations (Recommendations, vCIO, Lifecycle, Projects, Business Reviews, Billing, Account, Support) remain as searchable commands — not removed.

### Page titles

| Path | Shell title |
| --- | --- |
| `…/technology-profile` | Overview |
| `…/explore` | Explore |
| `…/roadmap` | Roadmap |
| `…/executive-reports` | Reports |

---

## 2. Route mapping

### Primary IA → routes

| IA item | Canonical URL | Preserved aliases / deep links |
| --- | --- | --- |
| Overview | `/clients/{id}/technology-profile` | `customerOverviewPath`, `customerAssessmentDashboardPath`, `/clients/{id}` (existing redirect behavior) |
| Explore | `/clients/{id}/explore` | `clientExplorePath` |
| Roadmap | `/clients/{id}/roadmap` | Phase routes under roadmap |
| Reports | `/clients/{id}/executive-reports` | Assessment report + PDF via hub links |

### Legacy routes preserved (not deleted)

| Route | How customers still reach it |
| --- | --- |
| `/clients/{id}/recommendations` | Overview hub + Roadmap “Related” + command palette; Roadmap sidebar stays active |
| `/clients/{id}/projects` | Roadmap “Related” + command palette |
| `/clients/{id}/lifecycle` | Overview workspace links + command palette |
| `/clients/{id}/vcio` | Overview workspace links + command palette |
| `/clients/{id}/quarterly-reviews` | Reports “Related deliverables”; Reports sidebar stays active |
| `/clients/{id}/billing` | Account menu secondary nav |
| `/account`, `/support` | Account menu secondary nav |
| `/assessments/{id}/report` + PDF export | Reports hub |

`CLIENT_VISIBLE_WORKSPACE_SECTIONS` now includes `explore` while retaining prior client-visible sections so middleware allowlist does not break bookmarks or emails.

### Path helpers

- `clientExplorePath(clientId)`
- `customerOverviewPath(clientId)` (alias of technology-profile)

---

## 3. Redirect behavior

### Unified landing (all onboarded customers → Overview)

```
/login (client)
  → /dashboard
    → onboarding incomplete? → /onboarding
    → else → /clients/{id}/technology-profile   (Overview)
```

**Removed** entitlement-based redirect to `/vcio` from:

1. `src/app/(dashboard)/dashboard/page.tsx`
2. `src/app/(dashboard)/clients/[id]/technology-profile/page.tsx`

Entitlement checks still gate vCIO **features** and write APIs; customers can open `/vcio` when the section is client-visible. No Overview ↔ vCIO redirect loop.

| Audience | Landing |
| --- | --- |
| Assessment-only | Overview |
| Active vCIO | Overview |
| Grace / read-only vCIO | Overview |

---

## 4. Authorization findings and changes

### SS-UX-001 gap

Middleware previously allowlisted client-visible **sections** but did **not** compare `session.user.clientId` to the route `:id`.

### Changes

1. **JWT / session:** Node `config.ts` continues to refresh `clientId` from Prisma into the JWT. Edge-safe `auth.config.ts` session callback projects `token.clientId` onto `session.user.clientId` (no Prisma on edge).
2. **Middleware defense-in-depth:** For customer `/clients/{routeClientId}/…`, if JWT `clientId` is present and differs from `routeClientId`, redirect to the user’s own Overview.
3. **Page-level ownership:** Explore, Roadmap, Reports, and Overview (technology-profile) enforce `user.clientId === route id` for customers (`notFound()`), matching existing patterns on other client pages.
4. **Command palette:** `canClientAccessPath` already rejected cross-tenant workspace paths; covered by automated tests.
5. **Staff:** Middleware tenant check is customer-role scoped; staff cross-client access preserved.

### Edge limitation (documented)

Edge middleware can only enforce ownership when `clientId` is present on the JWT/session projection. Fresh sessions after login carry it via Node jwt refresh. Page/API ownership remains the authoritative server boundary if a token lacks `clientId`. Do not rely solely on client-supplied route parameters.

---

## 5. vCIO CTA correction

**Before:** “Complete Budget Planning” → `/clients/{id}/assets` (not client-visible; middleware bounced customers to technology-profile).

**After:** Same CTA → `/clients/{id}/lifecycle` (client-visible Technology Lifecycle / budget planning context).

File: `src/app/(dashboard)/clients/[id]/vcio/page.tsx`.

---

## 6. Explore foundation

New page: `src/app/(dashboard)/clients/[id]/explore/page.tsx`

- Customer tenant ownership check
- Empty state when no completed assessment (link back to Overview)
- Lists the eight canonical `TECHNOLOGY_PILLARS` (names + business questions only)
- No demo fixtures, no hardcoded assessment values, no catalog projected maturity
- No pillar drilldowns (deferred)

---

## 7. Automated test results

```
vitest run
  tests/ux/ss-ux-002-customer-navigation.test.ts
  tests/navigation/page-titles.test.ts
  tests/client-workspace/paths.test.ts
  tests/command-center/command-center.test.ts
  tests/reliability/ss-rel-015-customer-trust.test.ts
  tests/reliability/ss-rel-016-maturity-reporting.test.ts
  tests/recommendations/visibility.test.ts

Result: 7 files, 60 tests passed
```

SS-UX-002 coverage includes:

- Exactly four primary customer nav labels
- Secondary Account / Billing / Support
- Staff sidebar still without Explore primary
- Roadmap active on recommendations/projects
- Explore as client-visible section
- Cross-tenant command-path rejection
- Unified landing (no vCIO redirect from dashboard/Overview)
- Budget Planning CTA points at lifecycle, not assets

---

## 8. ABC LLC staging regression (read-only)

Observed via app services against staging DB (no writes):

| Check | Result |
| --- | --- |
| Client | ABC LLC |
| Official StackScore | **39** |
| Customer-visible recommendations (`getClientRecommendations`, role `client`) | **57** |
| Assessment / score data mutated | **No** |
| Catalog projected maturity shown to customers | Still suppressed (SS-REL-015/016 helpers unchanged) |

---

## 9. Manual validation checklist

Use ABC LLC (or equivalent staging customer) after deploy-to-staging preview:

- [ ] Assessment-only customer: sidebar shows Overview / Explore / Roadmap / Reports only
- [ ] Active vCIO customer: same four primary items; `/vcio` reachable from Overview links / command palette
- [ ] Grace / read-only vCIO: lands on Overview; vCIO readable per existing entitlement rules
- [ ] Login → Overview (not vCIO) for all onboarded customers
- [ ] Deep links to recommendations, projects, lifecycle, billing, account, support still work
- [ ] Sidebar active states: Overview; Explore; Roadmap on roadmap/recommendations/projects; Reports on executive-reports/quarterly-reviews
- [ ] Mobile sheet mirrors four-item primary nav; account menu has Billing / Account / Support
- [ ] Command palette: Overview/Explore/Roadmap/Reports + legacy destinations
- [ ] Customer A cannot open Customer B’s `/clients/{otherId}/…` (middleware redirect or 404)
- [ ] Staff sidebar / Portfolio / Clients navigation unchanged
- [ ] ABC LLC StackScore still 39; 57 customer-visible recommendations still listed
- [ ] Explore empty vs populated states behave correctly (no projected maturity tiles)

---

## 10. Discrepancies vs SS-UX-001 (inventory)

| SS-UX-001 finding | SS-UX-002 resolution |
| --- | --- |
| 10-item primary sidebar | Reduced to 4 primary + secondary account menu |
| Executive Briefing label | Relabeled **Overview** (same URL) |
| vCIO entitlement landing / Overview→vCIO redirect | Removed; unified Overview landing |
| Support missing from primary (only Account/Billing) | Support + Billing + Account in secondary menu |
| Middleware missing tenant ownership | JWT `clientId` + middleware compare + page checks |
| Broken Budget Planning → assets | Retargeted to lifecycle |
| Explore not present | Foundation route added |
| Command palette omitted some sidebar items historically | Explore added; lifecycle/projects remain as commands |

Staff DOC-201 workspace nav labels (e.g. “Living Execution Plan”) remain for consultant chrome; customer shell titles for roadmap/reports follow the new IA.

---

## 11. Remaining issues

1. **Explore** is foundation-only — pillar drilldowns, live scores, and interactive maturity exploration are out of scope (follow-up ticket).
2. **Overview visual redesign** deferred (SS-UX-001 Phase B+); this ticket only establishes navigation + landing.
3. **Staff workspace subnav** still uses DOC-201 labels; customers use contextual hub links instead of a secondary sidebar for legacy surfaces.
4. **Edge JWT cold path:** if `clientId` were absent from the token, middleware ownership compare is skipped until Node jwt refresh; page/API checks still apply.
5. **Manual browser checklist** above should be completed on a staging preview before promoting beyond staging.
6. No production deployment from this ticket.

---

## Acceptance summary

| Requirement | Status |
| --- | --- |
| Four primary customer nav items | Done |
| Secondary Account / Billing / Support | Done |
| Unified Overview landing | Done |
| Explore foundation route | Done |
| Legacy routes preserved | Done |
| Auth hardening + negative tests | Done (middleware + pages + command tests) |
| Budget Planning CTA fixed | Done |
| Staff nav unchanged | Done |
| Staging only / no migrations / no scoring / no metadata | Honored |
| Deliverable doc | This file |
