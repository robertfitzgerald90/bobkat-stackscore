---
name: premium-ui
description: >-
  Implements polished StackScore SaaS UI — hierarchy, spacing, tables/forms,
  responsive desktop/mobile, empty/loading/error states. Use when creating or
  redesigning pages, modules, dashboards, or fixing generic/cluttered UI (not
  PDF/email/backend-only).
---

# Premium SaaS UI

## 1. Purpose

Govern **substantial UI creation and redesign** for dashboards, modules, forms, reports (on-screen), tables, detail pages, portals, and administrative interfaces so new work matches the strongest existing StackScore surfaces: operational, hierarchy-first, dense where useful, and visually native to **executive-os**.

## 2. When to Use

- Creating a new user-facing page
- Redesigning an existing screen
- Building a dashboard (pair with `dashboard-framework` for KPI/chart composition)
- Creating an administrative module (pair with `enterprise-crud` for full verticals)
- Creating forms or detail pages
- Building tables or operational work queues
- Creating reporting **interfaces** (on-screen; PDF → `reporting`)
- Correcting UI described as generic, cluttered, unfinished, awkward, or visually inconsistent

## 3. When Not to Use

| Situation | Use instead |
|-----------|-------------|
| Tiny text / copy-only tweaks | Edit directly |
| Backend-only / schema-only / isolated logic | Domain skills |
| Minor one-off class tweaks with no layout/interaction change | Edit directly |
| Official PDF / print deliverables | `reporting` (unless also redesigning the on-screen report) |
| Email templates | `resend` |
| KPI/chart data wiring details alone | `dashboard-framework` |
| Auth/permission **enforcement** logic | `auth` / `organization` (UI still permission-aware — §16) |

## 4. Canonical References

Inspect these **before** inventing layout. Prefer these over averaging all screens.

| Reference | Demonstrates |
|-----------|----------------|
| `src/components/admin/website-leads-management.tsx` | Page hierarchy; limited stats; operational filters; table density; filtered empty |
| `src/components/admin/website-lead-detail-view.tsx` | Detail columns; primary vs secondary actions; Dialogs; busy/toast |
| `src/components/admin/users-management.tsx` + `permanent-delete-dialog.tsx` | CRUD form; Sheet; typed destructive confirm; `.table-desktop` / `.table-mobile` |
| `src/components/customer-portal/customer-executive-dashboard.tsx` + `executive-os/executive-kpi-card.tsx` | Executive layout; meaningful KPIs; next actions; client polish |
| `src/components/commercial-intelligence/customer-360-dashboard.tsx` | Ops panel + action links (secondary to executive KPI API) |
| `src/components/layout/dashboard-shell.tsx` + `app-sidebar.tsx` | App shell; nav; `executive-os`; main padding |
| `src/components/client-workspace/client-workspace-shell.tsx` | Sticky workspace chrome; section nav |
| `src/components/ui/mobile-data-card.tsx` | Mobile table alternate |
| `src/components/clients/new-client-form.tsx` | Controlled form workflow + busy disable |
| `src/components/client-ui/client-empty-state.tsx` + `client-loading-state.tsx` | Empty / loading with next step |
| `src/components/analytics/score-trend-chart.tsx` | Chart empty + `animate-pulse` (empty/loading only; chart wiring → `dashboard-framework`) |
| `src/components/reports/completion-report-preview.tsx` (+ `report-shell.tsx`) | On-screen report hierarchy |
| `src/components/projects/projects-dashboard.tsx` | Stats + filters + table/mobile split (secondary) |
| Tokens / CSS | `src/lib/client-ui/tokens.ts`, `src/lib/executive-os/tokens.ts`, `src/lib/ui/sticky-chrome.ts`, `src/app/globals.css`, `src/styles/executive-os-theme.css` |
| Spec | `docs/30-Architecture/DOC-127 – Dashboard Specification.md` |

### Non-canonical (do not copy)

| Path | Why |
|------|-----|
| `client-workspace/workspace-stub.tsx`, `clients/[id]/risks/page.tsx` | Placeholders |
| `dashboard/dashboard-view.tsx` | Flat staff KPI divs — prefer `ExecutiveKpiCard` |
| `clients/clients-table.tsx` | Sparse filters/empty vs website-leads |
| `clients/new/page.tsx` | Thin wrapper only |
| `product-overview/section-loading-skeleton.tsx` | Marketing, not app chrome |
| `portfolio/portfolio-view.tsx` empty | Bare dashed box — prefer `ClientEmptyState` |
| Sparse admin page shells that skip `.page-description` | Prefer website-leads / communications-shell page chrome |

## 5. Required Pre-Implementation Workflow

1. Inspect the destination page and neighboring screens in the same area.
2. Find the closest **canonical** reference (§4).
3. Search `src/components/ui/` and domain folders for reusable components before adding new ones.
4. State the page’s **primary user goal** in one sentence.
5. Establish information hierarchy (title → context → body → secondary → destructive).
6. Separate **one** primary action cluster from secondary/destructive actions.
7. List loading, empty, error, permission, and responsive states to implement.
8. Write a concise implementation plan (files to touch / reuse).
9. Avoid changing unrelated visual patterns on sibling screens.
10. Confirm whether print/PDF is affected → if yes, also load `reporting`.

Do not edit until steps 1–8 are clear.

## 6. Information Hierarchy Standards

Every screen needs a **clear primary purpose** — not a pile of unrelated cards.

| Layer | Pattern |
|-------|---------|
| Title + context | `.page-title` + `.page-description` (admin) or `CLIENT_SECTION_*` / `ClientPageHeader` (client) |
| Primary actions | One clear CTA group — `.action-bar` / `.action-bar-start` |
| Status / ownership | `Badge variant="outline"`; metadata row under title |
| KPIs | Few, decision-linked — see §9 / `dashboard-framework` |
| Summary vs detail | List/summary first; detail page or Sheet/Dialog for depth |
| Secondary info | Lower on page, tabs, or progressive disclosure |
| Filters | Only operational dimensions (§10) |
| Table actions | Row-level Links/Buttons; keep bulk rare |
| Destructive | Bottom or explicit Dialog; never compete with primary CTA |
| Help text | Short muted `text-sm text-muted-foreground` near the field/section |
| Empty | Explain gap + next step (§14) |

## 7. Layout Standards

Use **repository utilities** — do not invent spacing scales.

| Concern | Established pattern |
|---------|---------------------|
| Page shell | `.page-shell` (`min-w-0 max-w-full space-y-6 sm:space-y-8`); client: `CLIENT_PAGE_SHELL` (`mx-auto max-w-7xl space-y-8`) |
| Main padding | Shell: `p-4 sm:p-6 lg:p-8`; always `min-w-0` |
| Width | `max-w-full` / `page-content`; avoid fixed desktop-only widths |
| Grids | `md:grid-cols-2`, `xl:grid-cols-5` (stats); detail (website-leads): `lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]` |
| Cards | `Card` / `rounded-xl border bg-card shadow-sm` / `CLIENT_SURFACE_CARD` — group related content |
| Sections | `space-y-6` between major blocks; `.page-header` for title block |
| Sticky | Client workspace sticky chrome via `sticky-chrome.ts` — reuse, don’t fork |
| Headers / toolbars | Title row + `.action-bar` |
| Dialogs / Sheets | `Dialog` for confirm; `Sheet` for secondary flows (e.g. password reset) |
| Mobile stacking | Flex/grid stack by default; `sm:`/`md:` promote to rows |
| Scroll | `.overflow-safe-x` for wide tables; `overflow-x-clip` on main |

Shells: reuse `DashboardShell` / `ClientWorkspaceShell` — no parallel frames.

## 8. Component Reuse

- Search `src/components/ui/` first: `Button`, `Card`, `Table`, `Input`, `Label`, `Select`, `Badge`, `Dialog`, `Sheet`, `Tabs`, `MobileDataCard`, `Sonner`.
- Compose with `cn()` from `@/lib/utils`; icons `lucide-react` (`h-4 w-4` typical).
- Extend domain components (website-leads, client-ui, executive-os) before cloning.
- Preserve component APIs unless an explicit broader refactor is requested.
- Avoid one-off abstractions used once unless complexity clearly requires them.
- **No** react-hook-form / shadcn `Form` / Radix — Base UI via `base-nova`.

## 9. Dashboard Standards

KPI cards, sparklines, Recharts wiring, and dashboard data services → **`dashboard-framework` only**.

This skill covers page chrome around dashboards: shell, title/actions hierarchy, permission-aware controls, and empty/error wrappers. **Prohibit** walls of oversized statistic cards with no actions. Do not restate ExecutiveKpiCard/Recharts recipes here.

## 10. Table Standards

Match the **closest list reference** (usually website-leads or users-management). Not every list uses the same filter strategy.

| Concern | Evidence-backed pattern |
|---------|-------------------------|
| Search / filter | website-leads: client `useMemo` over `initial*` for status/source/date/search — **not** universal; only add filters operators need |
| Sorting | website-leads Select-style sort — do not invent TanStack Table |
| Row actions | Compact `Button`/`Link` outline `sm` |
| Status | `Badge variant="outline"` |
| Dates | Prefer `formatDisplayDate()` from `@/lib/display` when showing dates (website-leads); missing → `—` (users-management may omit dates) |
| Pagination | Only if a neighbor list already paginates — no invented kit |
| Sticky headers | Only if an in-area reference already does |
| Long text | `min-w-0`, `break-words`; `truncate` only with detail access |
| Empty | Colspan message **and** matching mobile empty copy |
| Loading | Disable actions / `animate-pulse` — **no** `src/components/ui` Skeleton primitive |
| Responsive | Prefer `.table-desktop` + `.table-mobile` with `MobileDataCard` / `MobileDataRow` (users-management) |
| Bulk | Only when an existing product pattern needs it |

**Do not** add filters merely because fields exist.

## 11. Form Standards

Evidence: `new-client-form.tsx`, `users-management.tsx`, website-lead detail notes/status.

- Controlled React state + `Label` / `Input` / `Select` / native `textarea` (no `ui/textarea` primitive)
- Group by **user workflow**, not DB column order
- Clear labels; optional muted helper text
- Zod on API (`schemas.ts`) where the domain has schemas; surface API `error` via `toast.error`; keep values on failure
- Primary save with busy disable (`loading` / `saving` / `busyAction`); destructive in separate Dialog
- Mobile: single-column stack

## 12. Detail Page Standards

Separate regions (website-lead detail pattern):

1. **Identity** — name/title
2. **Status** — badge + key dates
3. **Key metadata** — contact/source/ids
4. **Primary actions** — status change, convert, save
5. **Related records** — links to client/assessment
6. **Notes / activity** — secondary column or lower section
7. **Configuration** — only if needed
8. **Destructive** — isolated confirm

Do not dump every field into one undifferentiated card.

## 13. Visual Standards

| Topic | Repository convention |
|-------|------------------------|
| Font | Inter via `src/app/layout.tsx` → `--font-sans` |
| Title scale | `.page-title` = `text-2xl sm:text-3xl font-semibold tracking-tight` |
| Muted | `text-muted-foreground` / `.page-description` |
| Brand | `BRAND.primaryColor` `#082F5B` / `text-primary` — not indigo/violet generics |
| Borders / radii | `rounded-xl`, `border`, `ring-1 ring-border/60` on elevated stats |
| Shadows | Light `shadow-sm` / theme `--shadow-glow` — avoid stacked glassmorphism |
| Icons | Lucide, sparse — not decorative icon walls |
| Badges | `outline` for status |
| Buttons | `button` CVA variants; one primary per region |
| Destructive | `destructive` variant + confirm Dialog |
| Gradients | Prefer `executive-os-theme` / client tokens — no purple AI-SaaS gradients |

Polish = hierarchy + spacing + consistency + usability — not decoration.

## 14. Loading, Empty, and Error States

Every data-driven screen must handle:

| State | Pattern |
|-------|---------|
| Initial load | Server-rendered `initial*` preferred; else `ClientLoadingState` / pulse |
| Refetch | Disable triggering control; optional busy label |
| No records | Operational empty + CTA when user can create |
| No search results | “No X match the current filters.” |
| Permission | Hide/disable + optional explanation — server still enforces (`auth`) |
| Recoverable error | `toast.error` with API `error`; keep form state |
| Unrecoverable | Clear message + safe navigation |
| Partial data | Show available sections; note missing pieces |
| Success | `toast.success` + `router.refresh()` when list/detail stale |

Empty states: **what is missing** + **what to do next**.

## 15. Responsive and Accessibility Standards

- Keyboard: focus-visible rings (`focus-visible:ring-2 focus-visible:ring-ring`)
- Labels on all inputs; icon-only buttons need accessible names
- Semantic heading order (one h1-level page title pattern)
- Contrast: foreground on `bg-card` / `bg-muted`
- Status not color-only (badge text)
- Desktop table + mobile cards — never squeeze critical columns only
- Touch-friendly `Button` sizes; usable Dialog/Sheet on narrow viewports
- No critical actions only in hover menus on mobile
- `motion-reduce:transition-none` when adding motion (client tokens)

Verify ~1280px desktop and ~390px mobile.

## 16. Permission-Aware Interfaces

- Hide actions the role cannot perform (align with page `auth()` and API)
- Never rely on hidden buttons for security — server enforces (`auth` / `organization`)
- Read-only: visible disabled or static text, not misleading edit chrome
- Distinguish **forbidden** (hidden/omitted) vs **temporarily disabled** (busy/invalid)

## 17. Reporting and Export Awareness

- On-screen report hierarchy should match export narrative when both exist
- Clear export/download actions
- Browser print ≠ premium PDF — official PDFs → `reporting` + `@react-pdf/renderer`
- Use `print:hidden` / `.report-no-print` so interactive chrome does not leak into print
- On-screen polish: `completion-report-preview` / report-shell patterns

## 18. Anti-Patterns

Prohibit:

- Excessive / speculative filters
- Card grids with no hierarchy or purpose
- Giant empty heroes inside operational software
- Decorative charts with no decision value
- Duplicate UI primitives (second Button/Badge/Dialog)
- Database-field-order forms
- Scattered action buttons / multiple competing primaries
- Enormous tables with no column prioritization
- Generic templates disconnected from executive-os / website-leads density
- Redesigning the whole app to fix one weak screen
- Placeholder / mock data in production UI
- Browser print preview sold as finished PDF
- Radix installs, `tailwind.config.*`, or colors fighting semantic tokens

## 19. Validation Workflow

Commands from `package.json` / repo docs:

```bash
npm run lint
npx tsc --noEmit
npm test -- tests/layout/
npm run build
```

Also:

1. Run app (`npm run dev` on port 3000) and open the changed route
2. Visual check desktop (~1280) and mobile (~390): hierarchy, overflow, table/card switch
3. Exercise primary flow: filter/detail/submit; toast/error paths
4. Tab through primary actions — focus visible
5. Review browser console for errors

No separate `typecheck` script — use `npx tsc --noEmit`. Broader test strategy → `testing-validation`.

## 20. Definition of Done

- [ ] Matches established application language (canonical refs)
- [ ] Primary user goal is obvious
- [ ] Information hierarchy is clear
- [ ] Responsive behavior verified (desktop + mobile)
- [ ] Loading, empty, and error states exist
- [ ] Permissions represented correctly (UI + server still authoritative)
- [ ] Existing components reused where appropriate
- [ ] No unnecessary filters or cards
- [ ] Lint / tsc / layout tests / build as warranted
- [ ] Diff contains no unrelated redesign work

## 21. Portable Pattern vs StackScore Binding

### Portable principles (reuse elsewhere with local mapping)

- Clear primary purpose and information hierarchy
- Spacing/section rhythm; progressive disclosure
- Component reuse before inventing primitives
- Table usability + mobile alternate presentation
- Workflow-ordered forms; busy/disabled submit
- Restrained dashboards (few decision KPIs + actions)
- Explicit loading / empty / error / permission states
- Accessibility: labels, focus, contrast, non-color status
- Export hierarchy aligned with on-screen content

### StackScore-specific bindings (do not copy blindly)

- Brand `#082F5B`, `BRAND` in `src/lib/branding.ts`, executive-os / midnight themes
- Tokens: `CLIENT_*`, `EXECUTIVE_OS_*`, `.page-*` utilities
- Shells: `DashboardShell`, `ClientWorkspaceShell`, sidebar RBAC
- Primitives: shadcn `base-nova` + `@base-ui/react` (not Radix)
- Domain screens: website-leads, Customer 360, TIP/assessment vocabulary
- Routes under `src/app/(dashboard)/`, client portal modes

Destination repos must map portable principles onto **their** components and theme.

## 22. Example Invocations

> Use **premium-ui** to redesign this administrative page using website-leads-management as the reference.

> Use **repository-auditor** followed by **premium-ui** and **enterprise-crud** to build this module.

> Use **premium-ui** to simplify this page. Reduce filters and establish a clearer primary workflow.

> Use **premium-ui** and **dashboard-framework** to create an executive dashboard from available operational data.
