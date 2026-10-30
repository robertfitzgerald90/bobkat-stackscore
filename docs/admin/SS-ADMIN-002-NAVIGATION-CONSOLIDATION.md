# SS-ADMIN-002 — Administrative Navigation Consolidation

**Project:** StackScore  
**Branch:** `staging`  
**Date:** 2026-10-30  
**Status:** Implemented on staging  
**Type:** Navigation architecture / UX  
**Baseline:** [SS-ADMIN-001 Discovery](./SS-ADMIN-001-ADMIN-EXPERIENCE-DISCOVERY.md) · [SS-ADMIN-001 Navigation Mapping](./SS-ADMIN-001-NAVIGATION-MAPPING.md)

---

## 1. Executive summary

Staff administrative sidebar navigation was consolidated from ~21 flat destinations into **seven primary destinations**, with expandable secondary groups for Command Center, Leads, and Operations.

Exclusive active-state resolution now maps each recognized staff route to exactly one primary destination. Command palette labels were aligned (Clients, Command Center, Recurring Services). Customer portal navigation and client workspace tabs were left unchanged. No schema, authorization, Communications automation, or production changes were made.

---

## 2. Files changed

| File | Change |
| --- | --- |
| `src/lib/navigation/sidebar-nav.ts` | Seven staff primaries, grouped children, `resolveActiveStaffPrimaryId`, exclusive `isSidebarNavItemActive` for staff |
| `src/components/layout/app-sidebar.tsx` | Expandable `GroupNavItem` / child links, ARIA expand state, badges on groups |
| `src/lib/command-center/modules/navigation.ts` | Palette destinations aligned to new IA; Playbooks omitted |
| `src/lib/command-center/modules/organizations.ts` | “Browse Clients” / “New Client” labels |
| `src/lib/navigation/page-titles.ts` | Command Center + Recurring Services chrome titles |
| `tests/admin/ss-admin-002-navigation-consolidation.test.ts` | New coverage (ordering, groups, roles, active-state, palette sync) |
| `tests/ux/ss-ux-002-customer-navigation.test.ts` | Staff assertion updated for Command Center |
| `tests/navigation/page-titles.test.ts` | Title expectations updated |
| `docs/admin/SS-ADMIN-002-NAVIGATION-CONSOLIDATION.md` | This deliverable |

---

## 3. Navigation architecture implemented

```
Administrative sidebar (staff)
├── Command Center          → /dashboard          [expandable]
│   ├── Portfolio           → /portfolio          (portfolio roles)
│   ├── Business Insights   → /insights
│   ├── Consulting Workspace→ /consulting
│   └── Assessments         → /assessments
├── Clients                 → /clients
├── Projects                → /projects
├── Leads                   → /snapshot-leads     [expandable, admin-only]
│   ├── Snapshot Leads
│   └── Website Leads       (badge preserved)
├── Recurring Services      → /admin/vcio
├── Communications          → /admin/communications
└── Operations              → /settings           [expandable]
    ├── Billing             → /admin/billing      (admin)
    ├── Users               → /admin/users        (admin)
    ├── Assessment Library  → /admin/assessment-library (admin)
    ├── Technology Catalog  → /technology-catalog
    └── Settings            → /settings
```

Customer primary nav remains: Overview · Explore · Roadmap · Projects · Reports.

---

## 4. Primary and secondary destination mapping

| Order | Primary | Landing | Secondary / notes |
| --- | --- | --- | --- |
| 1 | Command Center | `/dashboard` | Portfolio, Insights, Consulting, Assessments |
| 2 | Clients | `/clients` | Client workspace tabs unchanged (SS-ADMIN-003) |
| 3 | Projects | `/projects` | Global register only |
| 4 | Leads | Grouped | Snapshot + Website; no `/leads` hub |
| 5 | Recurring Services | `/admin/vcio` | Label rename only |
| 6 | Communications | `/admin/communications` | Existing subnav untouched |
| 7 | Operations | Grouped | Billing, Users, Assessment Library, Catalog, Settings |

**Removed from primary sidebar (routes preserved):** Playbooks, Technology Catalog (now under Operations), Recommendations, Roadmaps, Lifecycle, Reports (remain client-workspace routes).

---

## 5. Active-state implementation

`resolveActiveStaffPrimaryId(pathname)` returns at most one `StaffPrimaryNavId`.

Priority order (specific first): Communications → Recurring Services → Operations → Leads → Projects → Clients (including `/clients/{id}/*`) → Command Center → `null`.

`isSidebarNavItemActive` for staff items with `id` uses that resolver exclusively. Customer items keep prefix / `activePathPrefixes` behavior (SS-UX-002).

Child active state: `isStaffNavChildActive` uses path-prefix matching against the child href.

---

## 6. Command palette changes

- Staff navigation commands use Command Center, Clients, Projects, Leads children, Recurring Services, Communications, Operations children.
- Global Assessments retained.
- Technology Catalog retained under Operations keywords.
- Playbooks omitted from navigation registry (route `/playbooks` still exists).
- Organizations module titles: Browse Clients / New Client.
- Role filters (`adminOnly`, `staffOnly`, `portfolioOnly`, `clientHidden`) unchanged in permission helpers.

---

## 7. Permission preservation

| Destination | Visibility |
| --- | --- |
| Leads (+ children) | admin only |
| Billing, Users, Assessment Library | admin only |
| Portfolio | portfolio-capable roles |
| Recurring Services, Communications, Projects, Clients, Command Center | staff |
| Technology Catalog, Settings | staff (technician subset under Operations) |
| Customer nav | client role only |

Server-side authorization helpers and RBAC were not modified. Hiding links does not grant access.

---

## 8. Responsive validation

| Viewport | Result |
| --- | --- |
| 1440px | Automated structure coverage; live browser visual check — see §10 |
| 1024px | Sidebar desktop layout (`lg:flex`); structure covered in unit tests |
| 768px | Mobile sheet path (`MobileSidebar`); expand/collapse via `aria-expanded` |
| 390px / 320px | Sheet width `min(100%, 280px)`; live browser — see §10 |

Expand/collapse uses a dedicated button with `aria-expanded` and `aria-label`. No new decorative animations beyond a short chevron rotate (respects `motion-reduce`).

---

## 9. Automated test results

| Suite | Result |
| --- | --- |
| `tests/admin/ss-admin-002-navigation-consolidation.test.ts` | **Pass** (13) |
| `tests/ux/ss-ux-002-customer-navigation.test.ts` | **Pass** |
| `tests/navigation/page-titles.test.ts` | **Pass** |
| `tests/auth/*` (sample) | **Pass** |
| `tests/ux/ss-ux-010-customer-experience-polish.test.ts` | **Pass** |
| ESLint | **0 errors** (pre-existing warnings elsewhere; `_clientId` unused warning resolved) |
| `tsc --noEmit` | **Fails** on pre-existing unrelated fixtures (see Known limitations) |
| `npm run build` | **Pass** (Next.js 15.5.28 turbopack; prisma generate + production build) |

---

## 10. Browser validation results

| Check | Status |
| --- | --- |
| Command Center / Clients / Projects / Leads / Recurring Services / Communications / Operations | **Blocked** — staff staging credentials / interactive login not available to the agent in this session |
| Active-state exclusivity (visual) | **Covered by unit tests**; visual confirmation blocked |
| Responsive expand/collapse at listed breakpoints | **Blocked** pending staff session |
| Customer portal sidebar unchanged | **Covered by unit tests**; visual confirmation blocked |

Do not treat browser checks as passed.

---

## 11. Known limitations

1. **No `/leads` hub page** — grouped nav only (by design for this ticket).
2. **Client workspace IA** — still DOC-201 flat tabs; Risks placeholder remains (SS-ADMIN-003).
3. **vCIO page body** may still say “vCIO Clients” in page copy; chrome/nav use Recurring Services.
4. **Playbooks** reachable by URL only (not sidebar/palette primary).
5. **TypeScript fixture debt (SS-UX-017 / prior):** `tsc --noEmit` still fails on older tests such as:
   - `tests/qbr/pdf-export.test.ts`
   - `tests/recommendations/ss-content-002-batch1-publication.test.ts`
   - `tests/technology-improvement-plan/tip-*.test.ts`
   - `tests/technology-profile/overview.test.ts`  
   Not suppressed; out of scope for SS-ADMIN-002.

---

## 12. Recommendations for SS-ADMIN-003

1. Restructure client workspace into the approved five-group navigation.
2. Hide or finish the Risks placeholder.
3. Optionally align in-page vCIO headings with Recurring Services language where product-approved.
4. Consider a lightweight `/leads` overview if dual lead queues need a shared landing.
5. Revisit whether Command Center secondaries should live in a compact panel vs. always-expandable group for dense displays.
6. After 003, re-validate staff→client workspace deep links and active-state parent highlighting.

**Do not start SS-ADMIN-003 without explicit approval.**

---

## Implementation summary

Seven primary staff destinations replace the flat ~21-item sidebar; Leads and Operations (and Command Center secondaries) are expandable groups; active state is exclusive via `resolveActiveStaffPrimaryId`; command palette and page titles were synchronized; automated nav/auth/customer regression tests pass; live staff browser validation remains blocked without credentials.
