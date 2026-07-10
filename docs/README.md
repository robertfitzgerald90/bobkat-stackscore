# StackScore Documentation

Authoritative product and engineering specifications for Bobkat StackScore.

**Start here:** [DOC-000 – Documentation Architecture & Index](DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md) — master registry, authority hierarchy, and conflict resolution.

---

## Folder guide

| Folder | Contents |
| ------ | -------- |
| [00-Governance/](00-Governance/) | Product vision, philosophy, BTIL, design principles, constitutions (DOC-001 – DOC-007) |
| [10-Product/](10-Product/) | Commercial domain and deliverable specs (DOC-100 – DOC-109) |
| [20-Business-Logic/](20-Business-Logic/) | Scoring, assessments, maturity framework, engines (DOC-110 – DOC-119, DOC-131 – DOC-135, DOC-150 – DOC-153) |
| [30-Architecture/](30-Architecture/) | Domain model, database, workflow, services, technical layer (DOC-120 – DOC-130, DOC-300 – DOC-303) |
| [40-Modules/](40-Modules/) | Portfolio, client workspace, lifecycle modules (DOC-160 – DOC-163, DOC-180, DOC-200 – DOC-206) |
| [50-Development/](50-Development/) | Engineering standards, migration plan, **operational guides** (non-governing) |
| [60-Operations/](60-Operations/) | Deployment strategy, changelogs, runbooks |
| [70-Data/](70-Data/) | Machine-readable documentation mirrors |
| [90-Archive/](90-Archive/) | Retired notes (not authoritative) |

---

## Quick links

### Constitutions & governance

- [DOC-129 – Engineering Constitution](30-Architecture/DOC-129%20%E2%80%93%20AI%20Development%20Rules%20&%20Engineering%20Constitution.md)
- [DOC-006 – Product Constitution](00-Governance/DOC-006%20%E2%80%93%20StackScore%20Product%20Constitution.md)
- [DOC-007 – UX Constitution](00-Governance/DOC-007%20%E2%80%93%20StackScore%20User%20Experience%20Constitution.md)
- [DOC-150 – Technology Maturity Framework](20-Business-Logic/DOC-150%20%E2%80%93%20StackScore%20Technology%20Maturity%20Framework.md)

### Architecture & implementation

- [DOC-120 – Domain Model](30-Architecture/DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md)
- [DOC-300 – Technical Architecture](30-Architecture/DOC-300%20-%20Technical%20Architecture.md)
- [DOC-302 – API Specification](30-Architecture/DOC-302%20-%20API%20Specification.md)
- [DOC-301 – Database Schema (v1 implementation)](30-Architecture/DOC-301%20%E2%80%93%20Database%20Schema%20Specification.md)
- [DEV-002 – Migration Plan](50-Development/DEV-002%20%E2%80%93%20Next%20Generation%20Migration%20Plan.md)

### Operational guides (non-governing)

- [DEVELOPMENT_GUIDE.md](50-Development/DEVELOPMENT_GUIDE.md) — local setup
- [DEPLOY.md](50-Development/DEPLOY.md) — production deployment
- [MVP_PRD.md](50-Development/MVP_PRD.md) — MVP scope
- [PROJECT_STATUS.md](50-Development/PROJECT_STATUS.md) — implementation status

---

## Legacy redirects

Old flat filenames (`Vision.md`, `TechnicalArchitecture.md`, etc.) are redirected by [`Superceded-*.md`](Superceded-Vision.md) stubs at the `docs/` root. See [DOC-000 – Legacy redirect stubs](DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md#legacy-redirect-stubs).

---

## Creating new documentation

1. Choose the folder matching the DOC series (see [DOC-000 – Folder structure](DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md#folder-structure)).
2. Register the document in [DOC-000](DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md).
3. Use **relative paths** in cross-references (not flat basename-only links).
