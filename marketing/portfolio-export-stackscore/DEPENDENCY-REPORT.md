# Dependency report

Package root: `marketing/portfolio-export/`

## External imports by file

| File | External imports |
|---|---|
| `types/index.ts` | none |
| `data/preview-data.ts` | none (relative types only) |
| `components/cn.ts` | none |
| `components/score-display.ts` | none |
| `components/portfolio-primitives.tsx` | `react` (`HTMLAttributes`, `ReactNode`) |
| `components/ExecutiveDashboardPreview.tsx` | none outside package |
| `components/TechnologyMaturityPreview.tsx` | none outside package |
| `components/RecommendationsWorkspacePreview.tsx` | `react` (`useMemo`, `useState`) |
| `components/TechnologyRoadmapPreview.tsx` | none outside package |
| `components/ExecutiveReportPreview.tsx` | none outside package |
| `index.ts` | none outside package |

## npm packages referenced

| Package | Used for |
|---|---|
| `react` | Component rendering and local state |
| `react-dom` | Host app only |
| `next` | Optional host App Router only |

## Packages explicitly not used

- `@prisma/client`
- `next-auth`
- `stripe`
- `lucide-react`
- `recharts`
- `@react-pdf/renderer`
- `sonner`
- `@base-ui/react`
- application `src/components/ui/*`
- application `src/lib/*`

## Runtime network surface

No `fetch`, `axios`, `XMLHttpRequest`, Prisma, route handlers, or server actions exist inside this package.

## Confidential data scan

Mock organization: Lumen Harbor Group  
Mock firm: Horizon Consulting  
No real employee names, emails, domains, server names, pricing, or production identifiers.
