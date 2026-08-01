---
name: reporting
description: >-
  Builds PDF and on-screen reports in this repo via @react-pdf/renderer and
  src/lib/reports. Use when changing PDF exports or report DTOs (not email or
  dashboard KPI widgets).
---

# Reporting Engine

## Scope

**StackScore deliverables** (assessment/TIP/proposal/invoice PDFs). Portable idea: prepare DTOs in services, render with a shared PDF kit, gate downloads with auth.

## Purpose

Produce reports using shared PDF tokens, typed DTOs from lib services, and authenticated export routes — plus on-screen modules under `src/lib/reports/`.

## When to use

- PDF document types/sections (assessment, TIP, phase proposal, product overview, invoice)
- Export API routes (`**/pdf`, `/export/pdf`)
- On-screen executive report modules (progress, QBR, comparison)
- Branding/print layout for deliverables

## When not to use

- Email → `resend`
- Dashboard KPI widgets → `dashboard-framework`
- CSV export (not a current pattern)

## Repository locations to inspect

| Area | Path |
|------|------|
| Generators | `src/lib/pdf/generate.tsx` |
| Documents | `assessment-report.tsx`, `tip-report.tsx`, `phase-proposal-report.tsx`, `product-overview-report.tsx`, `invoice-document.tsx` |
| Shared PDF | `src/lib/pdf/shared/` |
| On-screen reports | `src/lib/reports/` (`types.ts`, tip/progress/completion) |
| Themes | `src/styles/report-document-theme.css`, TIP/QBR CSS |
| Document registry | Prisma `Document` + `DocumentType` (`fileUrl` often API path) |
| Spec | DOC-126 |
| Tests | `tests/technology-improvement-plan/tip-pdf`, `tests/billing/invoice-pdf`, `tests/reports/` |

## Required implementation workflow

1. Read DOC-126 + module spec for content rules.
2. Assemble metrics/recommendations in `src/lib/**` DTOs (e.g. `assessments/report-data.ts`, TIP `report-data.ts`).
3. Build PDF with `@react-pdf/renderer` + `src/lib/pdf/shared/` tokens/fonts.
4. Register generator in `generate.tsx` (`renderToBuffer`).
5. Expose authenticated download route; enforce assessment/client access.
6. Optional: register `Document` row with `fileUrl` pointing at export API path (`file-storage`).
7. Test fragile pagination/layout.

## Required architecture

- Official deliverables = react-pdf, not browser print alone.
- Business calculations stay out of PDF JSX.
- Charts in PDF are composed as report visuals — dashboard Recharts are separate (`dashboard-framework`).

## Validation commands

```bash
npm test -- tests/technology-improvement-plan/tip-pdf
npm test -- tests/billing/invoice-pdf.test.ts
npm test -- tests/reports/
npm run build
```

## Definition of done

- [ ] Generator exported; typed DTO
- [ ] Access control on export route
- [ ] Shared PDF tokens used
- [ ] Tests for critical layout when fragile

## Common implementation mistakes

- Email components inside PDF
- Inline hex instead of shared tokens
- Fetching Prisma inside PDF components
- Changing scoring content without business docs

## Example invocation

> "Add a section to the assessment PDF executive summary — use **reporting** and shared PDF tokens."
