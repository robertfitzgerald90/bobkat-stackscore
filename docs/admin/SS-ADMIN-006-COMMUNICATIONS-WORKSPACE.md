# SS-ADMIN-006 — Communications Workspace Refinement

**Project:** StackScore  
**Branch:** `staging`  
**Date:** 2026-10-30  
**Status:** Implemented on staging  
**Type:** Administrative UX / information architecture  
**Baseline:** SS-ADMIN-001–005 · SS-UX-015

---

## 1. Executive summary

The Communications admin workspace flat ~11-item subnav was replaced with a **five-group, two-level** navigation (Overview · Outreach · Delivery · Automation · Configuration). All existing routes, delivery logic, automations (`PROJECTS_SHARED` / `PROJECT_COMPLETED`), and SS-UX-015 project customer updates are unchanged.

The Overview page gained a compact **Communications Pulse** and clearer lifecycle-oriented quick actions using existing stats loaders only.

---

## 2. Existing navigation architecture

Prior flat `NAV_ITEMS` in `communications-subnav.tsx` with `adminOnly` filtering. Layout: `admin/communications/layout.tsx` via `assertCommunicationsAccessRole`.

---

## 3. Files changed

| File | Change |
| --- | --- |
| `src/lib/communications/nav.ts` | Five-group registry + active resolution |
| `src/lib/communications/index.ts` | Export nav helpers |
| `src/components/communications/communications-subnav.tsx` | Two-level UI (SS-ADMIN-003 pattern) |
| `src/components/communications/communications-dashboard-view.tsx` | Pulse + header/quick actions |
| `tests/admin/ss-admin-006-communications-workspace.test.ts` | Coverage |
| `docs/admin/SS-ADMIN-006-COMMUNICATIONS-WORKSPACE.md` | This deliverable |

---

## 4. Five-group navigation mapping

| Group | Destinations (routes unchanged) |
| --- | --- |
| Overview | `/admin/communications`, `/admin/communications/analytics` |
| Outreach | `/admin/communications/campaigns`, `.../prospects` |
| Delivery | `.../templates`, `.../history`, `.../testing` (admin) |
| Automation | `.../automations` (admin) |
| Configuration | `.../components` (admin), `.../variables`, `.../settings` (admin) |

---

## 5. Active-state resolution

`resolveActiveCommunicationsGroup(pathname)` matches specific prefixes before the exact Overview root. Secondary active state uses exact match for Overview and prefix match for other destinations. Exactly one primary group for `/admin/communications/*`.

---

## 6. Communications Overview improvements

- Lifecycle-oriented page description.
- **Communications Pulse:** Active Campaigns, Messages Sent, Failed Deliveries, Delivery Rate (from `getOutreachDashboardStats` + `getCommunicationDashboardStats`).
- Quick actions: New Campaign, Prospects, Templates, History, Analytics.
- Existing outreach section, metrics grid, health, activity, failures retained.

---

## 7. Data sources reused

| Metric / panel | Source |
| --- | --- |
| Active campaigns | `getOutreachDashboardStats` |
| Messages / rates / failures | `getCommunicationDashboardStats` / analytics summary |
| Health | `getCommunicationHealth` |
| Failures list | `getRecentDeliveryFailures` |
| Activity | `getRecentOrganizationActivity`, template activity |

No new analytics pipeline.

---

## 8. Role and authorization preservation

| Role | Visible groups |
| --- | --- |
| Admin | All five |
| Technician | Overview, Outreach, Delivery (no Testing), Configuration (Variables only); Automation hidden |
| Customer | No access (`/admin/*` blocked) |

Page-level `assertCommunicationsAdminRole` redirects unchanged.

---

## 9. Project communications preservation

SS-UX-015 remains project-workspace scoped. Automations `PROJECTS_SHARED` and `PROJECT_COMPLETED` untouched. No new auto-send.

---

## 10. Responsive behavior

Desktop: group row + secondary wrap. Mobile: group `Select` + secondary chips. No 11-tab scroll strip.

---

## 11. Automated test results

| Suite | Result |
| --- | --- |
| `tests/admin/ss-admin-006-communications-workspace.test.ts` | **Pass** (9) |
| SS-ADMIN-002–005 + SS-UX-015 + outreach | **Pass** |
| Auth isolation + customer nav | **Pass** |
| ESLint (touched) | **Clean** |
| `tsc --noEmit` | Pre-existing fixture failures only |
| `npm run build` | **Pass** |

---

## 12. Browser validation results

Staff interactive validation **blocked** (no staging staff session in agent environment). Structure covered by unit tests.

---

## 13. Known limitations

1. Overview still loads the full prior dashboard below the pulse (intentional preservation).
2. Pulse does not invent pending/queued delivery counts beyond existing failed/sent aggregates.
3. Prospects remain Communications-owned; Leads hub only links.

---

## 14. Recommendations for SS-ADMIN-007

1. Optional slim “operations only” overview mode for technicians.
2. Soften legacy `accent-blue` tokens in `communications-shell` during the visual reskin.
3. Consider unread/pending queue pulse if product wants queue prominence without new pipelines.

**Do not start SS-ADMIN-007 without explicit approval.**

---

## Implementation summary

Communications admin chrome is five groups with contextual secondaries; Overview pulse uses existing metrics; delivery/automation/project-update behavior is unchanged.
