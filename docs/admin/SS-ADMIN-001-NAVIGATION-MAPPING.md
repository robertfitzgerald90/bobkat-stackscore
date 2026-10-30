# SS-ADMIN-001 — Navigation Mapping

**Branch:** `staging`  
**Date:** 2026-10-30  
**Status:** Discovery only — no implementation  
**Companion:** [SS-ADMIN-001 Admin Experience Discovery](./SS-ADMIN-001-ADMIN-EXPERIENCE-DISCOVERY.md)

Complexity: **L** = Low · **M** = Medium · **H** = High

Roles: `admin` · `technician` · `client` (customer portal — out of redesign scope)

---

## 1. Existing staff sidebar → proposed primary sidebar

Source of truth today: `getConsultantSidebarNav` in `src/lib/navigation/sidebar-nav.ts` (rendered by `AppSidebar`).

| # | Existing label | Existing href | Icon | Visibility | Proposed group | Proposed primary label | Notes | Complexity |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Portfolio | `/portfolio` | LayoutGrid | portfolio roles | Command Center (secondary) or Clients | Keep as contextual / merge into Command Center later | Overlaps Dashboard client list | M |
| 2 | Dashboard | `/dashboard` | LayoutDashboard | staff | **Command Center** | Command Center | Existing KPI surface (`getDashboardSummary`) | L |
| 3 | Business Insights | `/insights` | BarChart3 | staff | Command Center | Insights (contextual) | Commercial intelligence + notifications | M |
| 4 | Consulting Workspace | `/consulting` | Briefcase | staff | Command Center / Lifecycle ops | Consulting (contextual) | Cross-client lifecycle ops summary | M |
| 5 | Clients | `/clients` | Users | staff | **Clients** | Clients | Primary directory | L |
| 6 | Assessments | `/assessments` | ClipboardList | staff | Clients / Assessment ops | Assessments | Global list; also client-scoped | L |
| 7 | Projects | `/projects` | FolderKanban | staff | **Projects** | Projects | Cross-client delivery | L |
| 8 | Recommendations | `/clients/{id}/recommendations` or `/clients` | Lightbulb | staff | Clients → Strategy | Remove from primary | Client-scoped; dual-active with Clients | L |
| 9 | Roadmaps | `/clients/{id}/roadmap` or `/clients` | Map | staff | Clients → Strategy | Remove from primary | Same dual-active pattern | L |
| 10 | Lifecycle | `/clients/{id}/lifecycle` or `/clients` | Activity | staff | Clients → Overview/Relationship **or** Recurring Services | Remove from primary | Client-scoped Technology Lifecycle | L |
| 11 | Reports | `/clients/{id}/executive-reports` or `/clients` | FileText | staff | Clients → Relationship/Reports | Remove from primary | Client-scoped | L |
| 12 | Technology Catalog | `/technology-catalog` | Library | consultant | Operations | Catalog (secondary / config) | Functional; hide from primary OK | L |
| 13 | Playbooks | `/playbooks` | BookOpen | consultant | Operations | Hide from primary | Placeholder page only | L |
| 14 | Settings | `/settings` | Settings | consultant | Operations | Settings | Mostly placeholder + appearance | L |
| 15 | vCIO Clients | `/admin/vcio` | LayoutGrid | staff | **Recurring Services** | Recurring Services / vCIO | Subscriptions + reviews | M |
| 16 | Billing | `/admin/billing` | WalletCards | admin | Operations | Billing | Admin billing | L |
| 17 | Users | `/admin/users` | Shield | admin | Operations | Users | Admin users | L |
| 18 | Assessment Library | `/admin/assessment-library` | BookOpen | admin | Operations | Assessment Library | Config | L |
| 19 | Snapshot Leads | `/snapshot-leads` | Camera | admin | **Leads** | Snapshot Leads (under Leads) | Separate model | L |
| 20 | Website Leads | `/website-leads` | Globe | admin | **Leads** | Website Leads (under Leads) | Separate model; badge supported | L |
| 21 | Communications | `/admin/communications` | Mail | staff | **Communications** | Communications | Keep primary; preserve subnav | L |

### Proposed primary sidebar (target for SS-ADMIN-002)

| Order | Label | Landing href | Roles | Complexity |
| --- | --- | --- | --- | --- |
| 1 | Command Center | `/dashboard` | staff | L |
| 2 | Clients | `/clients` | staff | L |
| 3 | Projects | `/projects` | staff | L |
| 4 | Leads | `/snapshot-leads` or new `/leads` hub (nav-only) | admin | M if hub; L if grouped section |
| 5 | Recurring Services | `/admin/vcio` | staff | L |
| 6 | Communications | `/admin/communications` | staff | L |
| 7 | Operations | `/settings` or `/admin/users` hub | admin (+ technician subset) | M |

Secondary / Operations children (not all primary): Assessments (global), Portfolio, Insights, Consulting, Technology Catalog, Playbooks (hidden), Billing, Users, Assessment Library, Settings.

**Do not delete routes.** Prefer omit from primary nav + command-palette reachability.

---

## 2. Active-state strategy (recommended)

**Root cause today** (`isSidebarNavItemActive`):

1. Special-case: `item.href === "/clients"` → active for **any** `/clients/*`.
2. Prefix match: `pathname.startsWith(item.href + "/")` for non-dashboard/non-clients items.
3. Client-scoped sidebar items use `/clients/{id}/recommendations|roadmap|lifecycle|executive-reports`, so on those pages **Clients + the scoped item** both light up.
4. When `clientId` is null, Recommendations/Roadmaps/Lifecycle/Reports href falls back to `/clients`, so they also collide with Clients.

**Recommended rules (implement in SS-ADMIN-002):**

| Rule | Behavior |
| --- | --- |
| Exact match | Active when `pathname === href` |
| Scoped prefix | Active only when item declares `activePathPrefixes` or `matchPrefix: true` |
| Clients directory | Active for `/clients` and `/clients/new` only — **not** for `/clients/{id}/*` |
| Inside client workspace | Prefer workspace horizontal/group nav for section active state; sidebar **Clients** may use “section parent” style (optional) but not competing with Recommendations |
| Communications | Keep exact-or-prefix under `/admin/communications` only |
| Never | Multiple unrelated primary items active from overlapping `/clients` prefixes |

---

## 3. Existing client workspace tabs → proposed groups

Source: `CLIENT_WORKSPACE_NAV` in `src/lib/client-workspace/nav.ts` (18 destinations; horizontal scroll on `md+`, select on mobile).

| Current tab | Route | Functional? | Proposed group | Proposed contextual destination | Dependencies | Complexity |
| --- | --- | --- | --- | --- | --- | --- |
| Overview | `/clients/{id}/technology-profile` | Yes | **Overview** | Overview | TechnologyProfile, recommendations, projects KPIs | L |
| Explore | `/clients/{id}/explore` | Yes (SS-UX-016-R1) | **Assessment** | Explore / Intelligence | Assessment responses, pillar DTO | L |
| Customer 360 | `/clients/{id}/360` | Yes (staff) | **Overview** | Customer 360 | Commercial intelligence | M |
| Technology Lifecycle | `/clients/{id}/lifecycle` | Yes | **Relationship** or Recurring | Lifecycle | Lifecycle dashboard, budgets | M |
| vCIO Dashboard | `/clients/{id}/vcio` | Yes | **Relationship** | vCIO | Subscriptions, reviews, feature unlocks | M |
| Technology Journey | `/clients/{id}/journey` | Yes (staff) | **Overview** | Journey | Profile journey timeline | L |
| Living Execution Plan | `/clients/{id}/roadmap` | Yes | **Strategy** | Roadmap | ClientRoadmap, TIP | L |
| Business Reviews | `/clients/{id}/quarterly-reviews` | Yes | **Relationship** | Business Reviews | QBR | M |
| Projects | `/clients/{id}/projects` | Yes | **Execution** | Projects | Project, tasks, milestones, customer updates | L |
| Assessments | `/clients/{id}/assessments` | Yes | **Assessment** | Assessments | Assessment history/compare | L |
| Recommendations | `/clients/{id}/recommendations` | Yes | **Strategy** | Recommendations | AssessmentRecommendation presentation | L |
| Technology Stack | `/clients/{id}/assets` | Yes | **Assessment** | Technology Stack | Client technology + catalog assign | M |
| Documents | `/clients/{id}/documents` | Yes | **Strategy** / Reports | Documents | Profile documents, TIP | L |
| Contacts | `/clients/{id}/contacts` | Yes | **Relationship** | Contacts | Contacts / business profile | L |
| Subscription & Billing | `/clients/{id}/billing` | Yes | **Relationship** | Billing | Subscriptions, invoices | M |
| Executive Reports | `/clients/{id}/executive-reports` | Yes | **Strategy** or Overview | Reports | Report hub | L |
| Risks | `/clients/{id}/risks` | **Stub** | Overview (hide until built) | Risks | Placeholder | L |
| Activity | `/clients/{id}/activity` | Yes | **Relationship** | Activity | Communications activity timeline | L |

### Additional client routes (not always top-tab)

| Route | Maps to group | Notes |
| --- | --- | --- |
| `/clients/{id}/communications` | Relationship | Client-scoped message history → admin Communications history |
| `/clients/{id}/improvement-plan*` | Strategy | TIP wizard |
| `/clients/{id}/business-profile` | Relationship | Often via Contacts |
| `/clients/{id}/projects/{projectId}` | Execution | Detail + Prepare Customer Update (SS-UX-015) |
| `/clients/{id}/roadmap/phases/{phaseId}` | Strategy | Phase workspace |
| `/assessments/{id}/*` | Assessment | Global assessment surfaces linked from client |

### Proposed workspace chrome (SS-ADMIN-003)

| Group | Default landing | Child destinations (examples) |
| --- | --- | --- |
| Overview | technology-profile | 360, Journey, (Risks when real) |
| Assessment | assessments or explore | Explore, Assessments, Technology Stack |
| Strategy | recommendations | Recommendations, Roadmap/LEP, Documents, Executive Reports, TIP |
| Execution | projects | Projects, project detail, completion reports |
| Relationship | contacts | Contacts, Lifecycle, vCIO, Business Reviews, Billing, Activity, Communications |

Customer-facing routes and SS-UX-002 primary customer IA remain unchanged.

---

## 4. Communications inventory (preserve)

Subnav: `src/components/communications/communications-subnav.tsx`

| Subnav | Path | Admin-only UI filter | Permission note |
| --- | --- | --- | --- |
| Overview | `/admin/communications` | — | staff |
| Campaigns | `.../campaigns` | — | staff |
| Prospects | `.../prospects` | — | staff (`Prospect` model — not WebsiteLead/SnapshotLead) |
| Templates | `.../templates` | — | staff |
| History | `.../history` | — | staff |
| Automations | `.../automations` | adminOnly UI | Preserve `PROJECTS_SHARED`, `PROJECT_COMPLETED` |
| Testing | `.../testing` | adminOnly UI | |
| Analytics | `.../analytics` | — | |
| Components | `.../components` | adminOnly UI | |
| Variables | `.../variables` | — | |
| Settings | `.../settings` | adminOnly UI | |

**SS-UX-015 project customer updates:** staff UI on project delivery panel → `ProjectCustomerUpdate` + `CommunicationMessage`; customer sees published updates only. Nested under **Projects / Execution**, not a separate sidebar item. Do not fork Communications.

---

## 5. Leads mapping (do not merge models)

| Surface | Model | Path | Proposed nav |
| --- | --- | --- | --- |
| Snapshot Leads | `TechnologySnapshotLead` | `/snapshot-leads` | Leads → Snapshot |
| Website Leads | `WebsiteLead` | `/website-leads` | Leads → Website |
| Communications Prospects | `Prospect` | `/admin/communications/prospects` | Stay under Communications (outreach CRM) |

**Open decision:** Leads hub page vs sidebar section with two children — **no schema merge** without approval.

---

## 6. Permission requirements (navigation vs authorization)

| Area | Sidebar filter today | Server authorization |
| --- | --- | --- |
| Most staff pages | consultant mode (not client) | Page-level `auth()` + role checks |
| Portfolio | `canAccessPortfolio(role)` | Page redirect |
| adminOnly items | `role === admin` | Page + API |
| staffOnly (vCIO, Communications) | admin \|\| technician | Page + API |
| Client workspace | Staff see all 18 tabs; clients see `CLIENT_VISIBLE_WORKSPACE_SECTIONS` | `requireClientWorkspaceAccess` / ownership |

**Critical:** Hiding nav ≠ security. API and page guards must remain. Documented in discovery §9.

---

## 7. Implementation complexity summary

| Change class | Examples | Complexity |
| --- | --- | --- |
| Sidebar grouping / labels / hide placeholders | Playbooks hide, Leads group, remove client-scoped primary items | **L** |
| Active-state rewrite | Clients not active on all `/clients/{id}/*` | **L** |
| Client workspace grouped nav | Overview / Assessment / Strategy / Execution / Relationship | **M** |
| Command Center evolution | Merge dashboard + optional insights widgets | **M** |
| Leads hub page | New route composing two lists | **M** |
| Merge WebsiteLead + SnapshotLead + Prospect | Schema unification | **H** — out of scope |
| New roadmap status model | Independent initiative status | **H** — out of scope |
| Communications automation changes | — | **Forbidden** in this program phase |
