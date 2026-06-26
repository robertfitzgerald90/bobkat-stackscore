# Technology Improvement Plan Workflow — Changelog

## Summary

Implements the guided 7-step Technology Improvement Plan (TIP) workflow per DOC-103 and DOC-126.

## Schema

- `TechnologyImprovementPlan` model with `wizardState` JSON, workflow step, version, and generation metadata
- `Document.tipId` links generated PDFs to client document history
- `DocumentType.technology_improvement_plan`

## Workflow steps

1. **Technology Profile** — reuses `TechnologyProfileDetailView`
2. **Recommendations** — remove, reorder, consultant/executive notes
3. **Solution Playbooks** — derived from `SolutionPlaybookCatalog.json` and recommendation services
4. **Investment Review** — admin-only labor/hardware/services/margin (hidden from client PDF)
5. **Technology Roadmap** — phased initiatives with projected StackScore per phase
6. **Preview** — browser layout matching DOC-126 PDF sections
7. **Generate** — PDF export, document history record, download

## Routes

- `/clients/[id]/improvement-plan` — list and start plans
- `/clients/[id]/improvement-plan/[tipId]` — wizard
- `GET/POST /api/v1/clients/[id]/tip`
- `GET/PATCH /api/v1/clients/[id]/tip/[tipId]`
- `POST /api/v1/clients/[id]/tip/[tipId]/generate`
- `GET /api/v1/clients/[id]/tip/[tipId]/pdf`

## Client safety

Client-facing PDFs expose investment totals only — no margins, labor rates, or internal playbook mapping labels per DOC-126.
