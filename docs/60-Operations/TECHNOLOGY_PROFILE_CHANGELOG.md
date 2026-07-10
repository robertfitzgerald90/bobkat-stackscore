# Technology Profile — Sprint Foundation (DOC-113)

**Date:** June 2026  
**Specs:** DOC-113, DOC-120, DOC-121, DOC-123, DOC-124, DOC-127 (minimal subset)

---

## Implementation plan

### Scope (v1 foundation)

| In scope | Out of scope (later) |
|----------|----------------------|
| One profile per client | TIP / roadmap widgets |
| StackScore, maturity, categories | Pricing / investment estimates |
| Score history trend | Client portal UI |
| Open recommendations | QBR / warranty tracking |
| Active + completed projects | Full DOC-127 dashboard widgets |
| Technology Journey (minimal) | Event bus / audit log |

### Architecture

```
Client created → TechnologyProfile row (existing)
Assessment completed → syncProfileFromAssessment() (existing)
GET detail → getTechnologyProfileDetail(clientId, role)
UI → /clients/[id]/technology-profile
API → GET /api/v1/clients/[id]/technology-profile
```

### Schema changes

**None required.** Existing models:

- `TechnologyProfile` — aggregate scores, maturity, trend
- `TechnologyProfileSnapshot` — history on assessment complete
- `ClientScoreHistory` — score trend chart
- `AssessmentRecommendation`, `Project` — work items

---

## What was built

### Service layer (`src/lib/technology-profile/`)

| File | Purpose |
|------|---------|
| `index.ts` | Profile sync, `getTechnologyProfile`, snapshot on assessment |
| `detail.ts` | `getTechnologyProfileDetail()` — full page payload |
| `journey.ts` | Assess → Improve → Maintain phase logic |
| `types.ts` | `TechnologyProfileDetail`, audience types |

### API

- `GET /api/v1/clients/:id/technology-profile`

### UI

- `/clients/[id]/technology-profile` — full profile page
- `TechnologyProfileDetailView` — DOC-005 stat cards, category bars, trend chart
- Client page + summary panel link to full profile

### Access control

| Role | Access |
|------|--------|
| Admin | Full profile |
| Technician | Full except `estimatedCost` on projects (hidden) |
| Client | Future: `audience: client` subset (not exposed in nav yet) |

---

## Testing steps

```bash
npm test
```

Manual:

1. Open a client with a completed assessment
2. Click **Technology Profile** → full page loads
3. Verify StackScore, maturity, category bars, score chart
4. Verify open recommendations and projects sections
5. Complete another assessment → profile updates on refresh
6. `GET /api/v1/clients/{id}/technology-profile` returns JSON (authenticated)

---

## Related docs

- [DOC-113 – Technology Profile Specification](DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md)
- [ASSESSMENT_ENGINE_CHANGELOG.md](ASSESSMENT_ENGINE_CHANGELOG.md)
