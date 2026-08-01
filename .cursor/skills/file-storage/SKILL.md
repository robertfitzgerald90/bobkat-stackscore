---
name: file-storage
description: >-
  Handles documents in this repo via Document.fileUrl and on-demand PDF routes
  (no S3/blob uploads). Use when linking Document rows, serving PDFs, or
  evaluating upload requests.
---

# File Storage

## Scope

**StackScore repository.** File handling is **URL / on-demand PDF** based. Do not add S3/Blob upload stacks without an explicit product decision. PDF document content → `reporting`.

## Purpose

Generate PDFs on request; store metadata on `Document` with `fileUrl` usually pointing at an authenticated API path.

## When to use

- Registering a `Document` after TIP/QBR/proposal generation
- Serving PDF downloads via existing export routes
- Evaluating a request for “file uploads”

## When not to use

- Building PDF content → `reporting`
- Browser localStorage for command palette → ignore (`command-center/storage.ts` is not file storage)
- Inventing object storage without an explicit product/architecture decision

## Repository locations to inspect

| Area | Path |
|------|------|
| Schema | `model Document` + `DocumentType` in `prisma/schema.prisma` |
| PDF generate | `src/lib/pdf/generate.tsx` |
| Export routes | `src/app/api/v1/**/pdf/`, `assessments/[id]/export/pdf/`, `product-overview/pdf` |
| TIP/QBR doc rows | services under `technology-improvement-plan`, `qbr`, `phase-proposals` that set `fileUrl` |

## Required implementation workflow

```
Storage — Document row (metadata) + bytes generated at request time
  ↓
Validation — access checks on export route (assessment/client permissions)
  ↓
Permissions — same as reporting/auth (no public blob URLs)
  ↓
Serving — Route Handler streams PDF buffer
  ↓
Cleanup — hard-delete cascades with client cleanup utilities; no orphaned bucket lifecycle
```

1. Prefer generating via `generate*.Pdf` helpers and returning the buffer from the route.
2. If persisting a library entry, set `Document.fileUrl` to the app API path (existing pattern).
3. **Do not** add AWS SDK / Vercel Blob / multer upload stacks unless product docs and user explicitly require it — then design via `documentation-driven-development` + `prisma-postgres`.
4. Validate content-type/size only if a future upload feature is approved; none exists today.

## Required architecture

| Capability | Status |
|------------|--------|
| S3 / Blob / multipart upload | **ABSENT** |
| PDF on-demand | **Present** |
| `Document.fileUrl` | Often `/api/v1/.../pdf` path |

## Validation commands

```bash
npm test -- tests/technology-improvement-plan/tip-pdf
npm test -- tests/billing/invoice-pdf.test.ts
npm run lint
```

## Definition of done

- [ ] No unauthorized PDF/document access
- [ ] Document metadata consistent with export route if registered
- [ ] No new object-storage dependency without explicit approval

## Common implementation mistakes

- Adding S3 “because SaaS apps have uploads”
- Storing secrets or binary files in the repo
- Public unauthenticated file URLs for client documents

## Example invocation

> "Link a TIP PDF in Document records — use **file-storage** and existing fileUrl API path pattern."
