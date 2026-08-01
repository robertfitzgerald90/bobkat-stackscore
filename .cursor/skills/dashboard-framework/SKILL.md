---
name: dashboard-framework
description: >-
  Builds KPI/trend dashboards in this repo — ExecutiveKpiCard, Recharts,
  summaries, loading/empty states. Use for dashboard/portal/analytics surfaces
  (not admin CRUD tables or PDF reports).
---

# Dashboard Framework

## Scope

**StackScore UI.** Reuse `executive-os` / analytics components here; do not invent a parallel KPI system or copy portal metrics into unrelated apps.

## Purpose

Compose dashboards using existing KPI, chart, and summary patterns rather than generic dashboard kits.

## When to use

- Customer executive portal / KPI rows
- Staff analytics (score trends, category trends)
- Dashboard summary pages and priority action lists
- Loading/empty states for chart panels

## When not to use

- Admin CRUD lists/tables → `enterprise-crud` / `premium-ui`
- PDF executive reports → `reporting`
- Marketing landing heroes → public marketing theme (not this skill)

## Repository locations to inspect

| Pattern | Path |
|---------|------|
| Dashboard summary service | `src/lib/dashboard/summary.ts`, `src/app/(dashboard)/dashboard/page.tsx` |
| Executive KPI card | `src/components/executive-os/executive-kpi-card.tsx`, `mini-sparkline.tsx` |
| Customer executive dashboard | `src/components/customer-portal/customer-executive-dashboard.tsx` |
| Customer 360 | `src/components/commercial-intelligence/customer-360-dashboard.tsx` |
| Score trend (Recharts) | `src/components/analytics/score-trend-chart.tsx` |
| Category trends | `src/components/analytics/category-trends-chart.tsx` |
| Client improvement | `src/components/analytics/client-improvement-dashboard.tsx` |
| Executive-os tokens | `src/lib/executive-os/tokens.ts`, `src/styles/executive-os-theme.css` |
| Spec | `docs/30-Architecture/DOC-127 – Dashboard Specification.md` |

## Required implementation workflow

1. Inspect the closest dashboard (portal KPIs vs staff analytics charts).
2. Load metrics in `src/lib/**` (e.g. `getDashboardSummary`) — not inside chart components.
3. **KPI row:** reuse `ExecutiveKpiCard` + optional SVG sparkline; avoid decorative multi-KPI walls.
4. **Trends:** `ResponsiveContainer` + Recharts in `src/components/analytics/`; keep `animate-pulse` loading placeholders.
5. **Executive summary / actions:** prioritize operational next steps (Customer 360 `Panel` + action links); order by business urgency (open critical items first).
6. **Responsive:** grid `sm`/`md`/`xl` breakpoints; `min-w-0`; charts need explicit height containers.
7. **Empty:** dashed/muted copy in chart body when series empty (see score-trend-chart).
8. Match `executive-os` shell class on dashboard root.

## Required architecture

- KPI sparklines on executive cards are **custom SVG**, not Recharts.
- Recharts used for multi-point score/category/comms analytics.
- No shared global `EmptyState`/`Skeleton` component — use domain empties + `animate-pulse`.
- Permission-aware: client portal vs consultant surfaces (`portal-mode`, `organization`).

## Validation commands

```bash
npm run lint
npm test -- tests/layout/
npm run build
```

## Definition of done

- [ ] Data assembled in lib services
- [ ] KPI/chart patterns match reference components
- [ ] Loading + empty states present
- [ ] Priority/actions useful for operators or executives
- [ ] Responsive without horizontal overflow

## Common implementation mistakes

- Inventing a new KPI card system instead of `ExecutiveKpiCard`
- Nesting cards endlessly / purple gradient “AI dashboard” look
- Fetching Prisma inside chart client components
- Omitting empty series handling

## Example invocation

> "Add a trend panel to the client improvement dashboard — use **dashboard-framework** and mirror score-trend-chart."
