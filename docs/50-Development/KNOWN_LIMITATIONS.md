# StackScore v1.0 — Known Limitations

**Pilot scope:** 1–3 internal BobKat users  
**What v1.0 is:** Assessment-first technology maturity platform

---

## Included in v1.0 (pilot-ready)

- Credential authentication (admin, technician)
- Client CRUD and archive
- 50-question assessment wizard with live scoring
- Recommendation engine with consolidation
- Assessment results, improvement/reassessment views
- Projects from recommendations (v1 lifecycle)
- Assessment PDF export
- Technology Profile (scores, maturity, snapshots)
- Admin: users, assessment library metadata
- Client improvement dashboard and score history

---

## Not included (documented v2 — do not expect in field)

| Capability | Status |
|------------|--------|
| Technology Improvement Plan (TIP) | Not built |
| Technology Roadmap | Not built |
| Service catalog / pricing engine | Not built |
| Client portal (client role login) | Role exists; no portal UI |
| Today's Focus dashboards (DOC-127) | Not built |
| Assessment browser preview | Unified framework assessment report at `/assessments/[id]/report` |
| Progress & completion browser reports | Unified framework shells at `/clients/[id]/progress-report` and `/clients/[id]/projects/[projectId]/completion-report`; PDF export deferred |
| QBR PDF export | Interactive browser reports use unified `stackscore-report` framework; dedicated QBR PDF deferred |
| Integrations (NinjaOne, M365, etc.) | Not built |
| Audit log | Not built |
| Multi-tenant / SaaS | Single-tenant BobKat use |

---

## Operational limits

- **Users:** Designed for 1–3 concurrent users; not load-tested beyond that
- **Port:** Dev and production start scripts use **port 3000** — do not run multiple instances on different ports without updating `AUTH_URL`
- **Migrations:** Use `db:migrate:deploy` in production; avoid `db push` after go-live
- **Passwords:** Change seed defaults before first production seed

---

## Workarounds for consultants

| Need | Workaround today |
|------|------------------|
| Client improvement plan | Use assessment PDF + recommendations list |
| Roadmap / phasing | Track in projects; external spreadsheet if needed |
| Client-facing report | Export assessment PDF |
| Reassessment | Use reassessment flow on client page |

---

## Reporting issues

Note: URL used, user role, client/assessment ID, browser console error, and `/api/v1/health` response.
