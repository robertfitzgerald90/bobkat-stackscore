# StackScore portfolio export

Portable React preview package for the StackScore application. Built for professional case studies and marketing sites.

This package is self contained under `marketing/portfolio-export-stackscore/`.

## What this is

Five polished, client facing StackScore workflow previews:

1. `ExecutiveDashboardPreview`
2. `TechnologyMaturityPreview`
3. `RecommendationsWorkspacePreview`
4. `TechnologyRoadmapPreview`
5. `ExecutiveReportPreview`

All previews use fictional mock data only.

No production components were modified for this package.

## Note on product scope

This repository is StackScore (technology maturity and improvement planning).

missionCONTROL and ShiftFlow prioritization from the request do not apply to this codebase. The export focuses on StackScore strengths:

- executive dashboard
- maturity profile
- recommendations workspace
- technology roadmap
- executive report / business review surface

## Files to copy

Copy the entire folder:

```text
marketing/portfolio-export-stackscore/
```

Recommended target path in another project:

```text
components/stackscore-portfolio-export/
```

or

```text
marketing/stackscore-portfolio-export/
```

## Required npm packages

Minimum:

- `react`
- `react-dom`
- `next` (App Router)

Optional:

- none

This package intentionally avoids:

- `lucide-react`
- `@react-pdf/renderer`
- `prisma`
- `next-auth`
- `recharts`
- `sonner`
- `stripe`
- application providers

## Required Tailwind configuration

Tailwind CSS v3 or v4 is required.

The package uses utility classes such as:

- `bg-white`, `dark:bg-slate-900`
- `border-slate-200`, `dark:border-slate-700`
- `text-sky-600`, `dark:text-sky-400`
- responsive grid utilities
- dark mode classes

Ensure dark mode is configured, for example:

- class strategy: `class` on `<html class="dark">`
- or media strategy if preferred

No shadcn UI theme variables are required. Semantic colors are expressed as standard Tailwind utilities so the package works outside StackScore.

## Required shared UI components

None outside this folder.

Local presentation primitives live in:

- `components/portfolio-primitives.tsx`
- `components/cn.ts`
- `components/score-display.ts`

## Icons and fonts

- Icons: none required (intentionally omitted for portability)
- Fonts: host project font is fine. Inter, Geist, or a branded sans stack work well.

## How to import each preview

```tsx
import {
  ExecutiveDashboardPreview,
  TechnologyMaturityPreview,
  RecommendationsWorkspacePreview,
  TechnologyRoadmapPreview,
  ExecutiveReportPreview,
  portfolioPreviewData,
} from "@/marketing/portfolio-export-stackscore";
// or relative:
// from "../marketing/portfolio-export-stackscore";

export default function CaseStudyPage() {
  return (
    <div className="space-y-10 p-6">
      <ExecutiveDashboardPreview />
      <TechnologyMaturityPreview />
      <RecommendationsWorkspacePreview />
      <TechnologyRoadmapPreview />
      <ExecutiveReportPreview />
    </div>
  );
}
```

Override data:

```tsx
<ExecutiveDashboardPreview
  data={{
    ...portfolioPreviewData.executiveDashboard,
    organizationName: "Your Showcase Company",
  }}
/>
```

## How to change the mock data

Edit a single file:

`data/preview-data.ts`

That file is the source of truth for every preview.

Keep all values fictional.

## Light and dark themes

Every component uses `dark:` variants.

Wrap the host page with your theme toggle or set:

```html
<html class="dark">
```

## Isolation guarantees

These components do not:

- call APIs
- query databases
- use authentication
- use server actions
- read environment variables
- import from `src/` outside this package

`RecommendationsWorkspacePreview` is a client component solely for local filter state.

## Remaining dependencies that could not be removed

| Dependency | Why |
|---|---|
| React | Component model |
| Tailwind CSS | Visual system |
| `"use client"` for recommendations filters | Interactive local demo only |

No remaining StackScore application imports.

## Portfolio copy checklist

1. Copy `marketing/portfolio-export-stackscore/`
2. Ensure React + Tailwind dark mode
3. Import the previews into a case study page
4. Customize `data/preview-data.ts`
5. Screenshot at 1440, 1024, and 390 widths
