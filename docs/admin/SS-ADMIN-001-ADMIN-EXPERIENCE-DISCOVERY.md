# SS-ADMIN-001 — Administrative Experience Discovery & Consolidation Planning

**Project:** StackScore  
**Branch:** `staging`  
**Date:** 2026-10-30  
**Type:** Architecture discovery / UX audit / IA planning  
**Status:** Discovery only — **no application code changes**  
**Companion:** [Navigation Mapping](./SS-ADMIN-001-NAVIGATION-MAPPING.md)  
**Context:** Follows customer UX work through SS-UX-017; admin platform has not received equivalent consolidation.

---

## 1. Executive summary

The StackScore **staff** experience is a dense, feature-complete operations suite with roughly **21 primary sidebar destinations** for admins, plus an **18-tab horizontal client workspace** that overflows on typical desktop widths. Functionality is largely real (assessments, recommendations, roadmaps, projects, communications, billing, leads), but **information architecture lags product capability**: overlapping dashboards (Portfolio / Dashboard / Insights / Consulting), client-scoped items incorrectly elevated to global sidebar, and at least one intentional placeholder (Playbooks) exposed as a peer of production modules.

**Active-state defect (confirmed):** `isSidebarNavItemActive` treats `/clients` as active for every `/clients/{id}/…` path and uses prefix matching on client-scoped hrefs, so **Clients + Recommendations/Roadmaps/Lifecycle/Reports** can appear selected simultaneously.

**Recommended direction:** evolve a **StackScore Business Operations Workspace** by consolidating navigation—not rebuilding domains—into:

1. Command Center  
2. Clients (with grouped workspace chrome)  
3. Projects  
4. Leads  
5. Recurring Services  
6. Communications  
7. Operations  

Preserve customer portal IA (SS-UX-002+), Communications automations (`PROJECTS_SHARED`, `PROJECT_COMPLETED`), and all data models. Prefer low/medium complexity nav and workspace chrome work before any data-model consolidation.

**Do not begin SS-ADMIN-002 without approval.**

---

## 2. Current administrative architecture

### Runtime shape

| Layer | Location |
| --- | --- |
| App shell | `dashboard-shell` → `AppSidebar` + header + command palette |
| Staff nav | `getConsultantSidebarNav` (`sidebar-nav.ts`) |
| Customer nav | `getCustomerSidebarNav` (separate; out of redesign scope) |
| Client chrome | `ClientWorkspaceApplicationChrome` + `ClientWorkspaceNav` |
| Client section registry | `CLIENT_WORKSPACE_NAV` / `CLIENT_WORKSPACE_SECTIONS` |
| AuthZ | Page `auth()` + role redirects; API `requireClientWorkspaceAccess` / `isStaffRole` |
| Roles | `admin`, `technician`, `client` |

### Staff entry points

| Surface | Path | Service |
| --- | --- | --- |
| Dashboard | `/dashboard` | `getDashboardSummary` |
| Portfolio | `/portfolio` | `getPortfolioSummary` |
| Insights | `/insights` | `getCommercialInsightsDashboard` + notifications |
| Consulting Workspace | `/consulting` | `getConsultingWorkspaceSummary` |
| Clients directory | `/clients` | Client CRUD list |
| Global assessments | `/assessments` | Assessment list |
| Global projects | `/projects` | Cross-client project register |
| Client workspace | `/clients/[id]/*` | Domain services per section |

Staff and customer share many `/clients/[id]/…` routes; audience filtering happens in pages/services (e.g. Explore DTO, projected score suppression).

---

## 3. Complete route inventory (administrative)

Classification legend: **Primary** · **Contextual** · **Utility** · **Config** · **Legacy** · **Placeholder** · **Consolidate candidate**

### 3.1 Global staff destinations

| Path | Nav label | Purpose | Page / services | Models (typical) | Permissions | Workflow | Linked from | Functional? | Class |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/dashboard` | Dashboard | Portfolio KPIs + client rows | `DashboardView` / `getDashboardSummary` | Client, TechnologyProfile, AssessmentRecommendation, Project | Staff (clients redirected) | Daily ops pulse | Logo fallback, sidebar | Yes | Primary → Command Center |
| `/portfolio` | Portfolio | Client health cards | `PortfolioView` / `getPortfolioSummary` | Client, profile | `canAccessPortfolio` | Portfolio review | Sidebar, logo (portfolio roles) | Yes | Consolidate w/ Dashboard |
| `/insights` | Business Insights | Commercial intelligence + ops notifications | `InsightsDashboardView` | CI aggregates, notifications | Staff | Analytics | Sidebar | Yes | Contextual under Command Center |
| `/consulting` | Consulting Workspace | Cross-client lifecycle ops | `ConsultingWorkspaceView` | Lifecycle aggregates | Staff | Consulting ops | Sidebar | Yes | Contextual / Lifecycle ops |
| `/clients` | Clients | Client directory | Clients management | Client | Staff | Find client | Sidebar | Yes | Primary |
| `/clients/new` | — | Create client | New client form | Client | Staff | Onboarding | Clients UI | Yes | Contextual |
| `/assessments` | Assessments | Global assessment list | Assessments pages | Assessment | Staff | Find assessment | Sidebar | Yes | Contextual / ops |
| `/assessments/[id]/*` | — | Assessment detail/results/report/PDF | Assessment surfaces | Assessment, responses, recs | Staff (+ client own) | Assessment delivery | Clients, Overview | Yes | Contextual |
| `/projects` | Projects | Cross-client project register | Projects UI | Project | Staff | Delivery queue | Sidebar | Yes | Primary |
| `/technology-catalog` | Technology Catalog | Approved stack library | Catalog services | Technology*, products, pillar maps | Consultant mode | Standards / assignment source | Sidebar, Assets | Yes | Config / hide from primary OK |
| `/technology-catalog/[slug]` | — | Technology detail | Catalog detail | Technology | Consultant | Standards | Catalog | Yes | Contextual |
| `/playbooks` | Playbooks | Placeholder SOPs | Static card only | **No Playbook model** | Consultant | Future | Sidebar | Incomplete | Placeholder |
| `/settings` | Settings | Workspace prefs placeholder + appearance | Settings page | — | Consultant | Prefs | Sidebar | Partial | Config |
| `/admin/vcio` | vCIO Clients | Recurring vCIO subscriptions/reviews | Admin vCIO page | Subscription, VcioOnboarding, VcioQuarterlyReview | staffOnly | Recurring service mgmt | Sidebar | Yes | Primary → Recurring Services |
| `/admin/billing` | Billing | Admin billing | Billing admin | Billing models | adminOnly | Finance ops | Sidebar | Yes | Operations |
| `/admin/users` | Users | User admin | Users management | User | adminOnly | Access mgmt | Sidebar | Yes | Operations |
| `/admin/assessment-library` | Assessment Library | Question/catalog admin | Assessment library | Assessment library models | adminOnly | Content config | Sidebar | Yes | Operations |
| `/snapshot-leads` | Snapshot Leads | Public snapshot funnel | Snapshot leads admin | TechnologySnapshotLead | adminOnly | Acquisition | Sidebar | Yes | Leads |
| `/website-leads` | Website Leads | Website contact funnel | Website leads admin | WebsiteLead | adminOnly | Acquisition | Sidebar | Yes | Leads |
| `/admin/communications/*` | Communications | Full Comms platform | See §6 | Prospect, Campaign, CommunicationMessage, templates, automations | staff (+ admin subpages) | Outreach + delivery | Sidebar + project updates | Yes | Primary |
| `/account` | — | Account | Account | User | All | Profile | Header | Yes | Utility |
| `/support` | — | Support | Support | — | All | Help | Customer secondary; staff reachable | Yes | Utility |
| `/portal/vcio*` | — | Customer/staff vCIO portal variants | vCIO portal | Subscription | Role-gated | Recurring | Links | Yes | Contextual |
| `/portal/billing` | — | Portal billing | Billing portal | Subscription | Role-gated | Billing | Links | Yes | Contextual |

### 3.2 Client workspace destinations (`/clients/[id]/…`)

| Path | Tab label | Purpose | Functional? | Class |
| --- | --- | --- | --- | --- |
| `technology-profile` | Overview | Executive client overview | Yes | Primary in workspace |
| `explore` | Explore | Technology Intelligence Center | Yes | Primary |
| `360` | Customer 360 | Commercial 360 (staff; clients redirected to lifecycle) | Yes | Contextual |
| `lifecycle` | Technology Lifecycle | Lifecycle dashboard | Yes | Contextual |
| `vcio` | vCIO Dashboard | Client vCIO | Yes | Contextual |
| `journey` | Technology Journey | Score journey (staff) | Yes | Contextual |
| `roadmap` (+ phases, improvement-plan) | Living Execution Plan | Roadmap / TIP | Yes | Primary |
| `quarterly-reviews` | Business Reviews | QBR list | Yes | Contextual |
| `projects` (+ detail, completion-report) | Projects | Delivery | Yes | Primary |
| `assessments` (+ history, compare) | Assessments | Assessment admin | Yes | Primary |
| `recommendations` | Recommendations | Opportunities | Yes | Primary |
| `assets` | Technology Stack | Assigned technologies | Yes | Contextual |
| `documents` | Documents | Reports/docs | Yes | Contextual |
| `contacts` / `business-profile` | Contacts | CRM-lite contacts | Yes | Contextual |
| `billing` (+ invoices) | Subscription & Billing | Client billing | Yes | Contextual |
| `executive-reports` (+ related report routes) | Executive Reports | Report hub | Yes | Contextual |
| `risks` | Risks | **Stub** (`WorkspaceStub`) | Incomplete | Placeholder |
| `activity` | Activity | Comms activity timeline | Yes | Contextual |
| `communications` | — | Client message list | Yes | Contextual (not always in top 18 labels as separate IA concern) |

Sidebar also injects **Recommendations, Roadmaps, Lifecycle, Reports** as global items that deep-link into the current client (or `/clients` if none)—**consolidate candidates**.

---

## 4. Navigation inventory & active-state root cause

### 4.1 Count and grouping

Admin sees a **flat** list (~21 entries) with no visual groups: dashboards, client tools, delivery, config, leads, and communications compete for the same vertical space.

### 4.2 Dual/multi active selection

**File:** `src/lib/navigation/sidebar-nav.ts` → `isSidebarNavItemActive`

```text
pathname === href
OR activePathPrefixes match
OR pathname.startsWith(href + "/")   // for most items
OR (href === "/clients" AND pathname.startsWith("/clients/"))
```

**Effects:**

- On `/clients/{id}/recommendations`: **Clients** (rule 4) **and** **Recommendations** (exact/prefix) are active.
- Same for Roadmaps, Lifecycle, Reports.
- When no path client id, those four items’ href is `/clients`, amplifying collision with Clients.

**Recommended strategy:** exact + explicit prefixes only; Clients active only for directory/create; inside workspace rely on workspace nav. Details in [Navigation Mapping §2](./SS-ADMIN-001-NAVIGATION-MAPPING.md).

### 4.3 Command palette drift

`src/lib/command-center/modules/navigation.ts` registers a **subset** of staff routes (missing Insights, Consulting, vCIO, Billing, etc.) and labels Clients as “Organizations”. Consolidation should keep palette in sync with the approved sidebar IA.

---

## 5. Client workspace inventory

### 5.1 Presentation problem

`ClientWorkspaceNav` renders all visible sections in a **horizontal, scrollable** strip (`overflow-x-auto`, scrollbar hidden). Staff see **18** labels—too many for a single row without scrolling, which hides destinations and weakens discoverability. Mobile uses a select (better), but desktop overflow remains the core issue.

### 5.2 Proposed groups (validated against app)

| Group | Fits | Stretch / notes |
| --- | --- | --- |
| Overview | Overview, Journey, Customer 360 | Risks stub until implemented |
| Assessment | Assessments, Explore, Technology Stack | Explore is “assessment intelligence,” not admin of instruments—still assessment-domain |
| Strategy | Recommendations, Roadmap/LEP, TIP, Documents, Executive Reports | Documents/Reports could alternatively sit under Overview |
| Execution | Projects (+ tasks/milestones/customer updates) | Clear fit |
| Relationship | Contacts, Lifecycle, vCIO, Business Reviews, Billing, Activity, client Communications | Lifecycle/vCIO also relate to Recurring Services globally |

**Workflows that do not fit a single group:** TIP spans Strategy→Execution; Billing is commercial Relationship but also Operations; Customer 360 overlaps Insights globally.

### 5.3 Mapping

Full current-tab → proposed-group mapping: [Navigation Mapping §3](./SS-ADMIN-001-NAVIGATION-MAPPING.md).

**Constraint:** Do not change customer-facing routes or SS-UX-002 primary customer nav.

---

## 6. Communications inventory

### 6.1 Platform

Primary entry `/admin/communications` with sticky subnav (Overview, Campaigns, Prospects, Templates, History, Automations, Testing, Analytics, Components, Variables, Settings). Automations/Testing/Components/Settings UI filtered `adminOnly` in subnav; server routes still enforce roles.

### 6.2 Data domains (do not conflate)

| Domain | Model | Purpose |
| --- | --- | --- |
| Outreach CRM | `Prospect` | Campaigns, quick invite |
| Snapshot acquisition | `TechnologySnapshotLead` | Public snapshot |
| Website acquisition | `WebsiteLead` | Website forms |
| Outbound messages | `CommunicationMessage` (+ templates/automations) | Delivery |
| Project updates | `ProjectCustomerUpdate` | SS-UX-015 manual customer updates |

### 6.3 SS-UX-015 relationship

Project delivery panel drafts/sends updates via project APIs → `customer-update-service` → Communications message recording. Published updates appear in customer Projects experience. **Keep nested in project Execution UX**; continue using Communications infrastructure. Preserve automations **`PROJECTS_SHARED`** and **`PROJECT_COMPLETED`**.

**Do not remove or redesign Communications behavior in SS-ADMIN phases without a dedicated ticket.**

---

## 7. Legacy and placeholder analysis

### 7.1 Playbooks (`/playbooks`)

| Question | Finding |
| --- | --- |
| Functional? | **No** — placeholder Card: “planned for a future release” |
| Underlying data? | **No** Prisma `Playbook` model. Catalog field `Technology.relatedPlaybookCount` is a numeric attribute only |
| Dependents? | Catalog metrics display `playbookCount`; page not required for catalog |
| Safe to hide from primary nav? | **Yes** — keep route for deep links/future; remove sidebar entry |

### 7.2 Technology Catalog

| Question | Finding |
| --- | --- |
| Functional? | **Yes** — featured + library, products, pillar mappings |
| Used by? | Client Technology Stack assignment (`getActiveTechnologiesForAssignment`), standards browsing |
| Hide from primary? | **Yes, acceptable** if reachable from Operations / Assets / command palette |
| Delete data? | **No** |

### 7.3 Lifecycle

| Question | Finding |
| --- | --- |
| Purpose | Client **Technology Lifecycle** dashboard (`getTechnologyLifecycleDashboard`) + global **Consulting Workspace** summary |
| Overlap | Adjacent to vCIO/Recurring Services and Client Overview priorities; not obsolete |
| Standalone? | Keep as client workspace destination; remove global sidebar “Lifecycle” deep-link item |
| Dependencies | Lifecycle budgets/services; customer-visible lifecycle section exists |

### 7.4 Risks tab

Staff-only stub (`WorkspaceStub`). Hide under Overview group until implemented—do not delete route.

### 7.5 Settings

Partial: appearance works; “organization-wide settings” copy is future. Keep under Operations.

---

## 8. Workflow analysis

### 8.1 New customer acquisition (as implemented)

```text
WebsiteLead  ──┐
SnapshotLead ──┼─→ (manual ops) → Client create / assessment purchase / activation
Prospect ──────┘     Communications outreach
```

No single “Leads” UI joins the three models. Conversion paths are module-specific. **Do not invent a unified conversion engine in planning.**

### 8.2 Assessment delivery

```text
Client → Assessment (global or client) → Results/Report → Recommendations → Roadmap/TIP → (optional) Projects
```

Handoffs require switching among Assessments, Recommendations, Roadmap, and Projects tabs (and sometimes global Assessments). Explore duplicates intelligence for pillars (good for customers; for staff, overlaps Recommendations).

### 8.3 Project delivery

```text
Recommendation → Project → Tasks/Milestones → Activity → Prepare Customer Update (SS-UX-015) → Communications history
```

Friction: staff must leave client Projects for global `/projects` register; customer updates are easy to miss if not on project detail. Official maturity does **not** auto-change on task completion (by design).

### 8.4 Ongoing customer management

```text
Client Overview → Lifecycle / vCIO → Business Reviews → Communications / Activity → Billing
```

Recurring Services are split between `/admin/vcio` (fleet) and `/clients/{id}/vcio` (single client).

### 8.5 Billing and operations

```text
Client billing pages ↔ Subscriptions/Invoices ↔ /admin/billing (admin)
Users / Assessment Library / Catalog = configuration
```

Stripe/subscription models exist; admin Billing is the portfolio control surface.

---

## 9. Permission analysis

| Proposed group | Typical roles | Notes |
| --- | --- | --- |
| Command Center | admin, technician | Portfolio may be narrower via `canAccessPortfolio` |
| Clients | admin, technician | Client users use customer shell only |
| Projects | admin, technician | Customer projects are separate UX |
| Leads | admin (today both lead modules are adminOnly) | Technician access = open decision |
| Recurring Services | admin, technician | Matches `/admin/vcio` staffOnly |
| Communications | staff; some subpages admin UI | API must stay authoritative |
| Operations | mostly admin; Catalog/Settings consultant | |

**Security note:** Navigation visibility is **not** authorization. Several pages rely on page-level redirects; APIs use `require*` helpers. Consolidation must not weaken guards. No permission changes in this ticket.

No P0 auth holes discovered during read-only inspection; prior SS-UX-017 isolation suites remain the regression baseline.

---

## 10. Design system findings

| Area | Finding |
| --- | --- |
| Shell | Dark sidebar (`sidebar` tokens) + Executive OS link styles |
| Client chrome | Sticky application shell; charcoal/green customer surfaces via `client-ui` tokens on shared routes |
| Primitives | shadcn/Base UI: Card, Table, Tabs, Dialog, Select, Sheet |
| Headers | `WorkspaceSectionHeader`, `ClientPageHeader` patterns coexist |
| Status | Badges / `ClientStatusBadge` on customer-facing; admin tables more mixed |
| Responsive | Sidebar collapse + mobile sheet; client nav select on small screens |
| Shared with customer | Many `/clients/[id]` pages intentionally shared |

**Guidance:** Prefer consolidating **nav chrome and grouping** over a broad visual redesign. Stay within charcoal / phosphor-green StackScore language. Reuse existing headers/tables before inventing new shells.

---

## 11. Consolidation opportunities (prioritized)

| Opportunity | Benefit | Complexity | Risk |
| --- | --- | --- | --- |
| Fix sidebar active states | Clarity | L | Low |
| Remove client-scoped items from primary sidebar | Shorter nav | L | Deep links remain |
| Hide Playbooks from primary | Less noise | L | Route kept |
| Group Leads (Snapshot + Website) | Acquisition clarity | L–M | Separate models |
| Relabel/move vCIO → Recurring Services | Naming clarity | L | Copy only |
| Group Operations (Users, Billing, Library, Catalog, Settings) | Config out of primary | M | Discoverability via palette |
| Client workspace 5-group chrome | Fix overflow | M | Many deep links; preserve URLs |
| Command Center enrich from existing KPIs | Better landing | M | Avoid fabricated metrics |
| Merge Portfolio + Dashboard | Less duplication | M | Role/portfolio access rules |
| Unify lead schemas | Single CRM | H | **Requires approval** |

---

## 12. Risks and dependencies

| Risk | Mitigation |
| --- | --- |
| Breaking customer URLs | Never rename customer paths; staff chrome only |
| Communications automation regression | No automation edits in early ADMIN tickets; validate in ADMIN-007 |
| Hidden nav mistaken for auth | Keep server checks; add regression tests |
| Staff bookmark breakage | Prefer redirects or keep routes; hide only from sidebar |
| Command palette drift | Update registry with sidebar IA |
| TIP / roadmap status confusion | Continue labeling recommendation status (SS-UX-016 known limitation) |
| Dual project UIs (`/projects` vs client projects) | Keep both; clarify IA (Projects primary = cross-client) |

**Migrations:** Not required for proposed L/M nav work. Schema merges = separate architecture review.

---

## 13. Recommended information architecture

### Primary sidebar (staff)

1. **Command Center** → `/dashboard` (evolve; Insights/Consulting as secondary links or widgets)  
2. **Clients** → `/clients`  
3. **Projects** → `/projects`  
4. **Leads** → hub or section (Snapshot + Website)  
5. **Recurring Services** → `/admin/vcio`  
6. **Communications** → `/admin/communications`  
7. **Operations** → nested: Users, Billing, Assessment Library, Technology Catalog, Settings; Playbooks omitted from UI until real

### Client workspace chrome

Five groups: **Overview · Assessment · Strategy · Execution · Relationship** (see mapping doc). URLs unchanged.

### Metrics available for Command Center (existing — do not invent)

From `DashboardKpis` / summary: average StackScore, immediate focus total, open/critical recommendations, active projects, at-risk clients, improving/declining counts, assessed/total clients, per-client rows (score, critical recs, open projects, focus). Additional: Insights commercial dashboard; notification list; draft assessments count in summary pipeline; vCIO subscription lists.

---

## 14. Proposed implementation roadmap

Adjusted from the ticket’s suggested sequence based on dependencies:

| Phase | Title | Scope | Depends on |
| --- | --- | --- | --- |
| **SS-ADMIN-002** | Administrative Navigation Consolidation | Primary sidebar IA, active-state fix, hide Playbooks, demote client-scoped globals, sync command palette | Approval of this discovery |
| **SS-ADMIN-003** | Client Workspace Consolidation | Grouped workspace nav (5 groups); preserve all routes | ADMIN-002 recommended first (shared chrome thinking) |
| **SS-ADMIN-004** | Administrative Command Center | Strengthen `/dashboard` with existing KPIs; optional Insights/Consulting entry points | ADMIN-002 |
| **SS-ADMIN-005** | Leads and Recurring Services Organization | Leads grouping; Recurring Services labeling; clarify Lifecycle vs vCIO | ADMIN-002 |
| **SS-ADMIN-006** | Communications Workspace Refinement | Subnav/usability only; **no** automation changes; document SS-UX-015 entry points | ADMIN-002 |
| **SS-ADMIN-007** | Administrative End-to-End Validation | Workflows, permissions, customer sync, regression | ADMIN-002–006 as landed |

Optional later (separate ADRs): Portfolio/Dashboard merge; lead-model unification; Playbooks product build.

---

## 15. Open architectural decisions

1. **Command Center name vs keep “Dashboard”** — product language preference.  
2. **Leads hub page** vs sidebar section with two children only.  
3. **Technician access to lead modules** — today adminOnly.  
4. **Should Portfolio remain** for portfolio-capable roles after Command Center enrichment?  
5. **Documents / Executive Reports** under Strategy vs Overview.  
6. **Lifecycle tab** under Relationship vs a Recurring Services client sub-area.  
7. **Whether Assessments stays in Operations or as a peer primary** (high frequency for staff).  
8. **Risks stub** — hide now vs leave visible as “coming soon.”  
9. **Command palette “Organizations”** label vs “Clients” alignment.  
10. **Any future Playbooks product** — catalog `relatedPlaybookCount` vs new models (out of scope).

---

## Stop for review

Discovery complete. Artifacts:

- `docs/admin/SS-ADMIN-001-ADMIN-EXPERIENCE-DISCOVERY.md` (this file)  
- `docs/admin/SS-ADMIN-001-NAVIGATION-MAPPING.md`

**No SS-ADMIN-002 implementation until explicitly approved.**
