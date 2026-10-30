# SS-ADMIN-005 — Leads & Recurring Services Consolidation

**Project:** StackScore  
**Branch:** `staging`  
**Date:** 2026-10-30  
**Status:** Implemented on staging  
**Type:** Administrative UX / operational consolidation  
**Baseline:** SS-ADMIN-001–004

---

## 1. Executive summary

Administrative Leads and Recurring Services presentation was consolidated without merging data models or changing billing/lifecycle logic.

- New admin-only **`/leads` hub** summarizes Snapshot, Website, and Communications Prospects separately and routes into existing workflows.
- Primary sidebar **Leads** now opens `/leads`; Snapshot and Website remain secondary destinations.
- **`/admin/vcio`** presentation is **Recurring Services** (route unchanged), with distinct-client pulse, vCIO subscriptions, and RecurringService records in separate sections.
- Command Center KPI renamed to **Open Intake Leads** (same calculation) and links to `/leads`.

---

## 2. Existing systems reused

| Area | Reuse |
| --- | --- |
| Snapshot stats | `getTechnologySnapshotLeadSummaryStats` |
| Website stats | `getWebsiteLeadSummaryStats` |
| Prospects | `listProspects` (total / status=new) — no new prospect pipeline |
| Recurring distinct clients | Shared with Command Center via `countDistinctRecurringServiceClients` |
| vCIO subscriptions | Existing Prisma subscription query shape (extracted) |
| RecurringService rows | Existing model statuses |

---

## 3. Files changed

| File | Change |
| --- | --- |
| `src/app/(dashboard)/leads/page.tsx` | New admin hub |
| `src/lib/leads/hub.ts` | Hub summary loader |
| `src/components/admin/leads-hub-view.tsx` | Three source panels |
| `src/lib/vcio/recurring-services-overview.ts` | Overview + distinct counts |
| `src/components/vcio/recurring-services-admin-view.tsx` | Recurring Services UI |
| `src/app/(dashboard)/admin/vcio/page.tsx` | Uses overview view |
| `src/lib/navigation/sidebar-nav.ts` | Leads → `/leads` |
| `src/lib/navigation/page-titles.ts` | Leads title |
| `src/lib/auth/auth.config.ts` | Customer blocks `/leads`, `/website-leads` |
| `src/lib/command-center/route-access.ts` | Same customer blocks |
| `src/lib/dashboard/command-center*.ts` / `dashboard-view.tsx` | Intake KPI label + `/leads` |
| `src/lib/command-center/modules/navigation.ts` | Hub + prospects commands |
| Snapshot / website lead pages | Breadcrumb back to Leads |
| Tests + this doc | Coverage |

---

## 4. Leads architecture

Three models remain separate. Hub is summary + routing only — full tables stay on source pages.

```
/leads (admin)
├── Technology Snapshot panel → /snapshot-leads
├── Website Inquiries panel → /website-leads
└── Communications Prospects panel → /admin/communications/prospects
```

---

## 5. Lead-source KPI definitions

| Source | Metrics shown | Terminology |
| --- | --- | --- |
| Snapshot | new, follow_up, awaiting (new+follow_up), contacted, invited, converted | Snapshot statuses |
| Website | total, NEW, CONTACTED, QUALIFIED, CONVERTED | Website statuses |
| Prospects | total, status `new` (when listProspects succeeds) | Prospect statuses |

**No combined “all leads” total** on the hub.

**Command Center Open Intake Leads** (unchanged formula): Snapshot `new`+`follow_up` + Website `NEW`. Prospects excluded.

---

## 6. Leads navigation

| Item | Destination |
| --- | --- |
| Sidebar Leads (primary) | `/leads` |
| Snapshot Leads (child) | `/snapshot-leads` |
| Website Leads (child) | `/website-leads` |
| Prospects | Hub panel + command palette (Communications remains primary when on that route) |

---

## 7. Authorization behavior

| Role | `/leads` | Snapshot / Website | Prospects page | Recurring Services |
| --- | --- | --- | --- | --- |
| Admin | Yes | Yes | Yes | Yes (MRR + billing link) |
| Technician | Redirect `/dashboard` | Redirect | Via Communications auth | Yes (no MRR/billing) |
| Customer | Blocked | Blocked | Blocked via `/admin` | Blocked |

Server redirects preserved; middleware/route-access updated for `/leads` and `/website-leads`.

---

## 8. Recurring-service data mapping

| Section | Source |
| --- | --- |
| Pulse: Distinct active clients | Unique client IDs from active/trialing vCIO **OR** active/pending_activation RecurringService |
| Pulse: vCIO counts | Subscription rows |
| Pulse: Recurring active / pending | RecurringService status |
| vCIO table | Subscriptions `serviceType=stackscore_vcio` |
| Recurring records table | Non-draft/canceled/expired RecurringService |

---

## 9. Distinct-client counting

Same rule as SS-ADMIN-004: `Set(clientId)` across both sources — clients with both relationships count once in **Distinct active clients**.

---

## 10. Subscription / service status behavior

- Filters on vCIO table reuse existing subscription statuses.
- RecurringService statuses displayed as-is (no invented lifecycle).
- Inactive/canceled/expired recurring rows excluded from the recurring list; canceled vCIO still reachable via status filter.

---

## 11. Responsive behavior

Hub: three-column → single column on small screens. Recurring tables remain horizontally scrollable with compact pulse metrics.

---

## 12. Automated test results

| Suite | Result |
| --- | --- |
| `tests/admin/ss-admin-005-leads-recurring-services.test.ts` | **Pass** (8) |
| SS-ADMIN-002 / 003 / 004 + customer nav | **Pass** |
| Auth isolation + website-leads | **Pass** |
| ESLint (touched) | **Clean** |
| `tsc --noEmit` | Pre-existing fixture failures only |
| `npm run build` | **Pass** (includes `/leads`) |

---

## 13. Browser validation results

| Check | Status |
| --- | --- |
| Staff Leads hub / Recurring Services visual | **Blocked** — no staff staging session |
| Role restrictions (live) | **Covered by page redirects + unit tests**; visual blocked |

---

## 14. Known limitations

1. Prospects under Leads hub are a navigation/summary surface only — Communications owns the operational UI.
2. Prospects counts depend on `listProspects`; failures yield “—” rather than zeros that look authoritative.
3. RecurringService list capped at 100 rows.
4. `/admin/vcio` route path unchanged (label-only Recurring Services).

---

## 15. Recommendations for SS-ADMIN-006

1. Optional dedicated prospect summary stats helper (groupBy status) if hub needs richer breakdowns.
2. Technician-safe lead subsets only if product explicitly expands access.
3. Paginated RecurringService admin list when volume grows.
4. Visual identity reskin after admin consolidation settles.

**Do not start SS-ADMIN-006 without explicit approval.**

---

## Implementation summary

Leads hub at `/leads` keeps three sources separate; Recurring Services UI on `/admin/vcio` uses distinct-client counting and role-aware billing visibility; Command Center Open Intake Leads links to the hub without changing KPI math.
