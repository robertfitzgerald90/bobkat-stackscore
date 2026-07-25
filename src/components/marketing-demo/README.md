# StackScore Technology Improvement Plan — Marketing Demo

Reusable, client-facing React components that demonstrate the Technology Improvement Plan experience for marketing websites (for example, Bobkat IT).

## Isolation guarantees

- No NextAuth / Auth.js session usage
- No Prisma, databases, server actions, Stripe, or environment variables
- No production API calls or StackScore route context
- Fixture-only data (`clientImprovementPlanDemoData`) — Acme Inc. demo content
- No consultant notes, internal pricing, investment totals, margins, or exclusion controls

## Exports

Import from `@/components/marketing-demo` (or relative `./components/marketing-demo` after copy):

- `TechnologyImprovementPlanDemo`
- `MaturityProfileDemo`
- `RecommendationsDemo`
- `SolutionPlaybooksDemo`
- `TechnologyRoadmapDemo`
- `ExecutiveReportDemo`
- `clientImprovementPlanDemoData`
- Stage helpers: `TIP_DEMO_STAGES`, `TIP_DEMO_STAGE_LABELS`, `isTipDemoStage`

## Usage

```tsx
import {
  TechnologyImprovementPlanDemo,
  type TipDemoStage,
} from "@/components/marketing-demo";

<TechnologyImprovementPlanDemo
  activeStage="recommendations"
  audience="client"
/>
```

Controlled stage selection:

```tsx
const [stage, setStage] = useState<TipDemoStage>("maturity-profile");

<TechnologyImprovementPlanDemo
  activeStage={stage}
  onStageChange={setStage}
  audience="client"
/>
```

## Required dependencies

| Dependency | Purpose |
|---|---|
| `react` | UI runtime |
| `lucide-react` | Icons in Recommendations summary strip |
| Tailwind CSS | Utility classes used throughout |
| StackScore / Midnight CSS tokens | Semantic colors such as `bg-card`, `text-muted-foreground`, `bg-primary`, `bg-destructive`, `.midnight` |

This folder includes its own lightweight presentation primitives (`ui/demo-primitives.tsx`) and helpers (`utils/cn.ts`, `utils/score-display.ts`). You do **not** need to copy `src/components/ui/*` or production TIP modules.

## Portability

The folder `src/components/marketing-demo/` is designed to be copied into another Next.js + Tailwind project.

Also copy or recreate theme tokens so classes resolve:

- CSS variables for card/background/primary/muted/destructive/success/warning/border
- Optional `.midnight` theme block (see StackScore `globals.css`)

Optional host route pattern:

`/demo/technology-improvement-plan?stage=recommendations`

## Stages

- `maturity-profile`
- `recommendations`
- `solution-playbooks`
- `technology-roadmap`
- `executive-report`

## Responsive notes

Layouts use fluid grids and `min-w-0` / `max-w-full` to avoid horizontal overflow from 1440px down to 390px. Stage tabs scroll horizontally on small screens.
