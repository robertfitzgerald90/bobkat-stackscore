---
name: roadmap
description: >-
  Implements ClientRoadmap/TIP/phase proposals in this repo — phases, initiatives,
  promote-from-TIP, projects. Use when changing roadmaps or TIP (no Milestone
  model; not scoring/recommendation engines).
---

# Roadmap Generator

## Scope

**StackScore-only product domain.** No Prisma `Milestone` model. Do not recreate TIP/roadmap graphs in other products without their own specs.

## Purpose

Materialize and manage the living client roadmap from recommendations through TIP, phases, initiatives, and phase proposals — using the **implemented** graph.

## When to use

- `ClientRoadmap` / phases / initiatives
- TIP wizard (`TechnologyImprovementPlan`)
- Phase proposals and promote-from-TIP
- Projects linked 1:1 to recommendations (execution track)

## When not to use

- Recommendation trigger math → `recommendations`
- Assessment scoring → `assessments`
- PDF only → `reporting`

## Repository locations to inspect

| Area | Path |
|------|------|
| Schema | `ClientRoadmap`, `ClientRoadmapPhase`, `ClientRoadmapInitiative`, `TechnologyImprovementPlan`, `PhaseProposal`, `Project`, `LifecycleOpportunity` |
| Materialize | `src/lib/client-roadmap/materialize.ts`, `promote.ts`, `service.ts` |
| TIP | `src/lib/technology-improvement-plan/` |
| Roadmap engine | `technology-improvement-plan/roadmap-engine/` (`phase-config.ts`, pricing) |
| Proposals | `src/lib/phase-proposals/`, `src/lib/proposals/service.ts` |
| Projects | `src/lib/projects/` |
| Docs | DOC-151*, DOC-152, DOC-153 |

## Required implementation workflow

```
Recommendations (AssessmentRecommendation)
  ↓
Projects (optional 1:1 via Project.recommendationId — execution, not parent of phases)
  ↓
Phases (ClientRoadmapPhase — priority buckets: Critical → High → Operational → Strategic)
  ↓
Initiatives (ClientRoadmapInitiative links recommendationId)
  ↓
Timeline (phase.timeline strings + PRIORITY_TIMELINES — not Milestone entities)
  ↓
Reporting (TIP PDF, phase proposal PDF, on-screen reports → reporting skill)
```

1. Prefer `materializeDraftRoadmap` / `promoteRoadmapFromTip` over ad-hoc inserts.
2. Phase assignment from recommendation `priority` (`phase-config.ts`).
3. TIP wizard state in `wizardState` JSON + `TipWorkflowStep`.
4. Economics: phase investment fields + initiative cost fields when present.
5. **ABSENT:** Prisma `Milestone` — do not invent milestone tables without docs + schema skill.

## Required architecture

- Draft roadmap often created after v2 assessment complete (best-effort).
- `PhaseProposal` snapshots phase economics for client approval.
- Projects are parallel execution entities, not the roadmap parent.

## Validation commands

```bash
npm test -- tests/client-roadmap/
npm test -- tests/technology-improvement-plan/
npm run lint
npm run build
```

## Definition of done

- [ ] Roadmap/TIP/proposal services reused
- [ ] Priority→phase mapping preserved
- [ ] No fake Milestone model without explicit product decision
- [ ] PDF/report paths updated if deliverables change

## Common implementation mistakes

- Inserting phases without materialize/promote
- Treating Project as parent of roadmap phases
- Inventing milestones/ROI engine fields
- Breaking TIP step enum workflow

## Example invocation

> "Adjust phase bucketing for critical recommendations — use **roadmap** and phase-config."
