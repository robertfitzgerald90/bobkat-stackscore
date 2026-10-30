# SS-ADMIN-007 — Validation Matrix

**Branch:** `staging` (`715cade` — SS-Comm Workspace Refinement)  
**Date:** 2026-10-30  
**Environment:** Local Next.js (`http://localhost:3000`) + staging Neon PostgreSQL  
**Scope:** Administrative platform end-to-end validation after SS-ADMIN-001…006; customer UX regressions SS-UX-012…017 referenced.

**Result legend:** PASS · FAIL · BLOCKED · NOT APPLICABLE  
**Method legend:** Automated · Browser · Manual · Code review · Authenticated HTTP (session cookie; no secrets logged)

---

## Known limitations carried in (docs review)

| Source | Limitation |
| --- | --- |
| SS-ADMIN-004 | Prospects excluded from Open Intake Leads; no AI health scores; Activity feed bounded |
| SS-ADMIN-005 | Prospects hub link only; RecurringService list capped; `/admin/vcio` path unchanged |
| SS-ADMIN-006 | Overview retains prior dashboard under pulse; PROJECTS_SHARED / PROJECT_COMPLETED untouched |
| SS-ADMIN-003 | Risks route retained but hidden from chrome; Relationship secondaries dense |
| SS-UX-017 | DEF-017-001 TIP/QBR `tsc` fixtures; DEF-017-004/005 demo login + live send gates (demo login resolved this session via documented default) |

---

## 1. Administrative navigation

| Area | Test | Method | Result | Evidence | Notes |
| ---- | ---- | ------ | ------ | -------- | ----- |
| Primary destinations | Seven staff primaries present for admin | Authenticated HTTP + Automated | PASS | Admin `/dashboard` HTML markers: Command Center, Clients, Projects, Leads, Recurring Services, Communications, Operations; `ss-admin-002` 13/13 | — |
| Active primary | Exclusive active id resolution | Automated | PASS | `resolveActiveStaffPrimaryId` suites in ADMIN-002/005/006 | — |
| Command Center secondaries | Dashboard, Portfolio, Insights, Consulting, Assessments | Authenticated HTTP | PASS | `/dashboard`, `/portfolio`, `/insights`, `/consulting`, `/assessments` → 200 with staff chrome | — |
| Operations secondaries | Billing, Users, Assessment Library, Technology Catalog, Settings | Authenticated HTTP | PASS | `/admin/billing`, `/admin/users`, `/admin/assessment-library`, `/technology-catalog`, `/settings` → 200 | `/admin/settings` is **not** the Operations Settings route (correct href `/settings`) |
| Dead links | No primary dead routes for admin | Authenticated HTTP | PASS | All seven primaries + listed secondaries 200 after clean `.next` | Transient 500s during concurrent `next build` = env (DEF-007-002) |
| Customer nav exposure | Staff chrome not shown to customers | Browser + Authenticated HTTP | PASS | Customer mobile nav: Overview, Explore, Roadmap, Projects, Reports only; admin routes redirect to customer Overview | — |
| Role visibility | Technician omits Leads primary; admin includes | Authenticated HTTP + Automated | PASS | Tech `/clients`/`/projects` markers omit Leads; admin includes; `ss-admin-005` | Tech `/leads` and `/admin/billing` redirect → `/dashboard` |
| Browser back/forward | History navigation | Browser | BLOCKED | Not re-exercised this session on staff chrome | Prior UX-017 noted similar gap |
| Command palette labels | Match sidebar | Automated | PASS | ADMIN-002 palette/sidebar alignment tests | Interactive palette click not re-run |

---

## 2. Command Center

| Area | Test | Method | Result | Evidence | Notes |
| ---- | ---- | ------ | ------ | -------- | ----- |
| Six sections | Business Pulse, Needs Attention, Client Portfolio, Project Delivery, Recent Activity, Quick Actions | Authenticated HTTP + Automated | PASS | Admin dashboard HTML contains all six titles; `command-center` + `ss-admin-004` tests | — |
| Business Pulse KPIs | Six approved pulse labels | Authenticated HTTP | PASS | Total Clients, Active/Completed Assessments, Active Projects, Open Intake Leads, Recurring Service | — |
| Open Intake Leads formula | Snapshot new+follow_up + Website NEW | Automated + Code review | PASS | `countOpenLeads`; ADMIN-005; prospects excluded | — |
| Technician lead KPI | No Open Intake Leads / leads href | Authenticated HTTP | PASS | Tech dashboard: `hasOpenIntakeLeadsLabel=false`, `hasLeadsNavHref=false` | — |
| Official scores only | No projected-as-official in CC rules | Automated + Code review | PASS | ADMIN-004 / portfolio readiness tests | — |
| Needs Attention | Alert kinds wired to persisted sources | Automated + Code review | PASS | Draft assessments, overdue tasks/milestones, draft updates, lead follow-ups (admin), immediate focus | Live row-by-row audit not exhaustively sampled |
| Quick Actions | Role-aware | Automated | PASS | `buildCommandCenterQuickActions` admin vs technician | — |
| Empty / bounded lists | Caps preserved | Code review + Automated | PASS | ADMIN-004 known limitations | — |

---

## 3. Client management & workspace

| Area | Test | Method | Result | Evidence | Notes |
| ---- | ---- | ------ | ------ | -------- | ----- |
| Client list | `/clients` loads | Authenticated HTTP | PASS | 200; sample client ids present | — |
| Five groups | Overview, Assessment, Strategy, Execution, Relationship | Automated | PASS | `ss-admin-003` + `client-workspace/nav` | — |
| Secondary destinations | DOC-201 routes via groups | Authenticated HTTP | PASS | technology-profile, `/360`, journey, assessments, explore, `/assets`, recommendations, roadmap, documents, executive-reports, projects, contacts, lifecycle, vcio, quarterly-reviews, billing, activity, communications → 200 | Guessed `/client-360` etc. 404s are **wrong paths**, not product defects |
| TIP / improvement plan | Via roadmap/improvement-plan | Authenticated HTTP | PASS | `/improvement-plan` → roadmap 200 | Strategy group uses Roadmap label |
| Customer sidebar unchanged | Five customer primaries | Browser | PASS | Snapshot on Pinnacle Overview + Projects | — |
| Cross-client isolation | API + route access | Automated | PASS | `api-client-isolation` 14/14; `ss-ux-002` | — |
| Client create / switch UX | Interactive create wizard | Browser | BLOCKED | Staff interactive create/switch not walked in browser MCP this session | Covered by prior tickets + list load |

---

## 4. Assessment & scoring

| Area | Test | Method | Result | Evidence | Notes |
| ---- | ---- | ------ | ------ | -------- | ----- |
| Scoring rules | Yes=100 / Partial=50 / No=0 / N/A excluded | Automated | PASS | `ss-opt-002-remediation` 17/17; assessment suites in batch | Formulas not modified |
| Official score display | Customer Official StackScore | Browser | PASS | Pinnacle Overview shows Official StackScore **100 / 100**; copy states updates only after reassessment | — |
| Project ≠ official score | Roadmap/progress copy | Browser + Automated | PASS | Overview “Changes only after a completed reassessment”; UX-013/016 progress tests | — |
| Recommendations / reports | Existing suites | Automated | PASS | assessments + recommendations + customer-facing-report suites | — |

---

## 5. Project management

| Area | Test | Method | Result | Evidence | Notes |
| ---- | ---- | ------ | ------ | -------- | ----- |
| Global / client projects | Staff `/projects`, client workspace projects | Authenticated HTTP + Browser | PASS | Staff `/projects` 200; customer projects list 5 items with status chips | — |
| Progress | `computeProjectProgress` task-based | Automated | PASS | `ss-ux-013`, `ss-admin-004` | — |
| Tasks / milestones | UX-013 suite | Automated | PASS | 15/15 | — |
| Customer experience | UX-012/014 | Automated + Browser | PASS | Suites + customer Projects page | — |
| Project communications | UX-015 | Automated | PASS | 15/15 | Live send **BLOCKED** (policy + no Resend key) |
| Staff notes / visibility | Customer-safe fields | Automated + Code review | PASS | UX-014/015 | — |

---

## 6. Leads

| Area | Test | Method | Result | Evidence | Notes |
| ---- | ---- | ------ | ------ | -------- | ----- |
| Hub `/leads` | Loads; sources separate | Authenticated HTTP + Automated | PASS | Admin `/leads` 200; ADMIN-005; hub loader keeps three models | — |
| Source routes | snapshot / website / prospects | Automated + Authenticated HTTP | PASS | Nav children; prospects under Communications | — |
| Technician restriction | Hub redirect | Authenticated HTTP | PASS | Tech `/leads` → `/dashboard` | — |
| Customer block | Redirect away | Authenticated HTTP | PASS | Client `/leads` → technology-profile | — |
| Website lead workflows | Integration suite | Automated | PASS | `website-leads/integration` 15/15 | — |

---

## 7. Recurring Services

| Area | Test | Method | Result | Evidence | Notes |
| ---- | ---- | ------ | ------ | -------- | ----- |
| `/admin/vcio` | Recurring Services UI | Authenticated HTTP + Automated | PASS | 200; distinct-client counting helpers; ADMIN-005 | Path unchanged |
| Tech access | Page loads; billing nav restricted | Authenticated HTTP | PASS | Tech `/admin/vcio` 200; `/admin/billing` → dashboard | — |
| Stripe behavior | Unchanged | Code review | NOT APPLICABLE | No Stripe changes in ticket | — |

---

## 8. Communications

| Area | Test | Method | Result | Evidence | Notes |
| ---- | ---- | ------ | ------ | -------- | ----- |
| Five groups | Overview…Configuration | Automated + Authenticated HTTP | PASS | ADMIN-006; overview/analytics/campaigns/templates/history/automations 200 | — |
| Pulse metrics | Existing aggregates | Automated + Code review | PASS | ADMIN-006 | — |
| Automation triggers | PROJECTS_SHARED / PROJECT_COMPLETED untouched | Automated | PASS | ADMIN-006 asserts registry + UX-015 file intact | Not fired |
| Customer block | Admin communications redirected | Authenticated HTTP | PASS | Client → technology-profile | — |
| Live outbound | Real customer email | Manual | BLOCKED | Policy + `RESEND_API_KEY` absent locally | DEF-007-003 |

---

## 9. Operations

| Area | Test | Method | Result | Evidence | Notes |
| ---- | ---- | ------ | ------ | -------- | ----- |
| Billing / Users / Library / Catalog / Settings | Admin load | Authenticated HTTP | PASS | All 200 via correct paths | Settings = `/settings` |
| Technician billing | Restricted | Authenticated HTTP | PASS | Redirect to dashboard | — |
| Catalog / library mutation | Unintended writes | Manual | NOT APPLICABLE | Validation did not mutate catalogs | — |

---

## 10. AuthN / AuthZ / tenant isolation

| Area | Test | Method | Result | Evidence | Notes |
| ---- | ---- | ------ | ------ | -------- | ----- |
| Admin session | Login + `/api/v1/auth/me` | Authenticated HTTP | PASS | `role=admin`; SEED_ADMIN_PASSWORD present (not logged) | — |
| Technician session | Login + me | Authenticated HTTP | PASS | `role=technician` | — |
| Customer session | Demo login browser + HTTP | Browser + Authenticated HTTP | PASS | `pinnacle.engineering.demo@bobkatit.com`; Overview + Projects | Documented demo default when env unset |
| Rate limit / password policy | Auth suites | Automated | PASS | rate-limit 29; password-policy 11; activation suites | — |
| Tenant isolation | API isolation | Automated | PASS | 14/14 | — |
| Customer admin denial | Route redirects | Authenticated HTTP + Browser | PASS | No admin primary nav; admin URLs redirect | — |

---

## 11. Responsive & accessibility

| Area | Test | Method | Result | Evidence | Notes |
| ---- | ---- | ------ | ------ | -------- | ----- |
| Customer nav mobile drawer | Open menu shows five primaries | Browser | PASS | Snapshot refs Overview…Reports | Default agent viewport |
| Staff chrome 1440/1024/768/390/320 | Full matrix | Browser | BLOCKED | Staff interactive MCP login not completed (password not entered into browser tool); HTTP HTML structure verified | DEF-007-004 |
| Keyboard / focus | Systematic a11y audit | Browser | BLOCKED | Spot checks only (menu button, links) | Follow-up |
| Horizontal overflow | Staff pages | Browser | BLOCKED | Same as viewport matrix | — |

---

## 12. Cross-module workflows

| Area | Test | Method | Result | Evidence | Notes |
| ---- | ---- | ------ | ------ | -------- | ----- |
| CC → Leads hub | Quick action / pulse link | Automated + Code review | PASS | `href="/leads"`; Open Intake label | — |
| Leads → Prospects | Hub link to Communications | Automated | PASS | ADMIN-006 | — |
| Workspace → Projects → customer updates | UX chain | Automated | PASS | UX-012…015 | Live publish blocked |
| Recurring → client workspace | Links present | Automated + Code review | PASS | ADMIN-005 | — |
| Customer Overview → Projects | Browser | PASS | Projects list with delivery snapshot | — |

---

## 13. Automated quality gates

| Area | Test | Method | Result | Evidence | Notes |
| ---- | ---- | ------ | ------ | -------- | ----- |
| SS-ADMIN-002…006 + auth/nav/comms | Vitest | Automated | PASS | 19 files / 150 tests (auth/admin/comms/website-leads/dashboard batch) | — |
| Command Center / assessments / vcio / portfolio | Vitest | Automated | PASS | 17 files / 98 tests | — |
| SS-UX-012…016 + customer nav | Vitest | Automated | PASS | 7 files / 73 tests | — |
| ADMIN-005/006 fixture fix retest | Vitest | Automated | PASS | 17/17 | PageContext via `buildPageContext` |
| ESLint | `npm run lint` | Automated | PASS | 0 errors / 22 warnings (pre-existing) | — |
| `tsc --noEmit` | Full project | Automated | FAIL | Pre-existing fixture errors only (TIP/QBR/recs/overview); ADMIN-005/006 cleared | DEF-007-001 |
| `npm run build` | Clean `.next`, no concurrent dev | Automated | PASS | Exit 0; routes include `/account`, `/settings`, `/leads` | Concurrent build earlier failed (DEF-007-002) |
