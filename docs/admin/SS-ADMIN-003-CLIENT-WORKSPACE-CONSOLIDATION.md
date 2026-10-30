# SS-ADMIN-003 — Client Workspace Consolidation

**Project:** StackScore  
**Branch:** `staging`  
**Date:** 2026-10-30  
**Status:** Implemented on staging  
**Type:** UX / information architecture / navigation consolidation  
**Baseline:** [SS-ADMIN-001](./SS-ADMIN-001-ADMIN-EXPERIENCE-DISCOVERY.md) · [SS-ADMIN-001 Mapping](./SS-ADMIN-001-NAVIGATION-MAPPING.md) · [SS-ADMIN-002](./SS-ADMIN-002-NAVIGATION-CONSOLIDATION.md)

---

## 1. Executive summary

Administrative client workspace navigation was changed from an 18-tab horizontal strip to a **two-level model**: five always-visible groups (**Overview · Assessment · Strategy · Execution · Relationship**) plus contextual secondary destinations for the active group.

Routes, services, scoring, recommendations, projects (including SS-UX-015 communications), billing, and customer AppSidebar navigation were not redesigned. Risks remains reachable by URL but is hidden from staff workspace chrome. No schema or production changes.

---

## 2. Files changed

| File | Change |
| --- | --- |
| `src/lib/client-workspace/nav.ts` | Five-group registry, communications section, group/section active helpers; Risks excluded from visible staff nav |
| `src/lib/client-workspace/index.ts` | Export group types/helpers |
| `src/components/client-workspace/client-workspace-nav.tsx` | Two-level staff nav (group + secondary); mobile group select + wrapped secondaries |
| `src/components/client-workspace/client-workspace-nav-static.tsx` | Marketing preview mirrors five groups |
| `tests/admin/ss-admin-003-client-workspace-consolidation.test.ts` | New coverage |
| `tests/client-workspace/nav.test.ts` | Updated for groups / communications / Risks |
| `tests/client-workspace/paths.test.ts` | Communications + workspace project detail href |
| `tests/client-workspace/display.test.ts` | Project focus hrefs match workspace routes |
| `tests/navigation/page-titles.test.ts` | Quarterly review maps to Business Reviews |
| `docs/admin/SS-ADMIN-003-CLIENT-WORKSPACE-CONSOLIDATION.md` | This deliverable |

---

## 3. Workspace navigation architecture

Staff only (`ClientWorkspaceShell` skips chrome for `role === "client"`).

```
Level 1 — Groups (horizontal, wrap-safe)
  Overview | Assessment | Strategy | Execution | Relationship

Level 2 — Contextual destinations for the active group
  (wrapped links; Relationship uses compact density)
```

Clicking a group navigates to that group’s default section while preserving `clientId`.

---

## 4. Group-to-route mapping

| Group | Default | Secondary destinations |
| --- | --- | --- |
| Overview | `/technology-profile` | Client Overview, Customer 360, Technology Journey |
| Assessment | `/assessments` | Assessments, Explore, Technology Stack (`/assets`) |
| Strategy | `/recommendations` | Recommendations, Roadmap, Documents, Executive Reports |
| Execution | `/projects` | Projects (+ nested project / completion-report) |
| Relationship | `/contacts` | Contacts, Technology Lifecycle, vCIO, Business Reviews, Billing, Activity, Communications |

**Associated without dedicated secondary tabs:** TIP / improvement-plan → Strategy (Roadmap); business-profile → Relationship (Contacts); Risks URL → Overview group active, no visible secondary.

---

## 5. Active-state resolution

1. `resolveActiveWorkspaceSection(pathname)` — section identity (including nested prefixes such as assessments/history, projects/{id}, roadmap/phases, improvement-plan).
2. `resolveActiveWorkspaceGroup(pathname)` — maps section → exactly one group via `SECTION_TO_GROUP`.
3. `isWorkspaceNavChildActive` — secondary highlight when section matches.

Quarterly singular `/quarterly-review` resolves to **quarterly-reviews** (Relationship), not Executive Reports.

---

## 6. Responsive design behavior

| Breakpoint | Behavior |
| --- | --- |
| ≥ md | Five group links + wrapping secondary row |
| < md | Group `Select` + wrapping secondary chips |
| Relationship | Compact secondary labels to avoid overflow |

No 18-tab horizontal scroll strip.

---

## 7. Client context preservation

- All hrefs built with `resolveClientWorkspaceNavHref(clientId, …)`.
- `TpWorkspaceHeader` / sticky shell unchanged aside from nav swap.
- Deep links and breadcrumbs unchanged at the route layer.

---

## 8. Role and permission preservation

| Audience | Navigation |
| --- | --- |
| Staff | Five-group workspace chrome |
| Customer | Existing AppSidebar: Overview · Explore · Roadmap · Projects · Reports; no five-group chrome |
| Authorization | Unchanged server/API guards; hiding Risks ≠ access grant |

---

## 9. Automated test results

| Suite | Result |
| --- | --- |
| `tests/admin/ss-admin-003-client-workspace-consolidation.test.ts` | Pass |
| `tests/client-workspace/*` | Pass (project detail expectations aligned to workspace paths) |
| `tests/admin/ss-admin-002-navigation-consolidation.test.ts` | Pass |
| `tests/ux/ss-ux-002-customer-navigation.test.ts` | Pass |
| `tests/auth/api-client-isolation.test.ts` | Pass |
| `tests/navigation/page-titles.test.ts` | Pass |
| ESLint (touched files) | Clean |
| `tsc --noEmit` | **Fails** on pre-existing fixtures only (qbr/pdf-export, ss-content-002, tip-*, technology-profile/overview) — not suppressed |
| `npm run build` | **Pass** |

---

## 10. Browser validation results

| Check | Status |
| --- | --- |
| Staff five-group navigation / nested routes | **Blocked** — no staff staging session available to the agent |
| Customer AppSidebar preservation (visual) | **Covered by unit tests**; visual blocked |
| Responsive wrapping | Structure implemented; live viewport sweep blocked |

---

## 11. Known limitations

1. Risks still exists as a page; only hidden from chrome.
2. Relationship still has seven secondaries (wrapped/compact, not a separate hub).
3. Marketing `ClientWorkspaceNavStatic` shows staff groups only.
4. Page body copy (e.g. Living Execution Plan) may differ from secondary label “Roadmap”.
5. Pre-existing `tsc` fixture debt remains (SS-UX-017 / prior).

---

## 12. Recommendations for SS-ADMIN-004

1. Optional Relationship sub-hub or overflow menu if seven secondaries still feel dense in production use.
2. Finish or formally retire Risks; then decide Overview placement.
3. Align in-page headings with group language where product-approved.
4. Staff visual identity reskin (green industrial tokens) after IA settles — not in this ticket.
5. Consider command-palette “jump to workspace group” shortcuts.

**Do not start SS-ADMIN-004 without explicit approval.**

---

## Implementation summary

Staff client workspace chrome is now five groups with contextual secondaries; Risks is hidden; customer sidebar IA is unchanged; routes and business logic are preserved; automated workspace/admin/customer tests pass; live staff browser validation remains blocked without credentials.
