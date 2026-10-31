# SS-SNAP-003 — Technology Snapshot 2.0 Implementation

| Field | Value |
|-------|--------|
| Ticket | SS-SNAP-003 |
| Reference | `docs/snapshot/SS-SNAP-002-AUDIT-AND-ARCHITECTURE.md` |
| Environment | **Staging only** — no production deploy |
| Date | 2026-10-31 |
| Status | Implemented — **awaiting product-owner visual review** |

---

## 1. Files changed

### Added

| Path | Purpose |
|------|---------|
| `src/lib/technology-snapshot/catalog-v2.ts` | 14-question catalog, categories, answer labels |
| `src/lib/technology-snapshot/engine/*` | Deterministic findings engine (bands, critical risks, build) |
| `src/lib/technology-snapshot/session-state.ts` | Anonymous `sessionStorage` progress (no contact PII) |
| `src/components/technology-snapshot/snapshot-radar.tsx` | Four-axis indicative radar |
| `src/components/technology-snapshot/snapshot-results-dashboard.tsx` | Command-center results UI + CTAs |
| `src/components/technology-snapshot/snapshot-contact-capture.tsx` | Optional Save / Request a Copy |
| `prisma/migrations/20261031120000_snapshot_v2_findings/` | Additive lead fields |
| `tests/technology-snapshot/engine-v2.test.ts` | Scoring / critical risk / boundary tests |
| `tests/technology-snapshot/schemas-v2.test.ts` | Contact-capture Zod tests |
| `docs/snapshot/ss-snap-003/results-desktop.png` | PO review screenshot |

### Updated

| Path | Change |
|------|--------|
| `prisma/schema.prisma` | `catalogVersion`, `findingsJson`, `categoryScores`, `marketingConsentAt`, `campaignId`, `sourcePath` |
| `src/lib/technology-snapshot/{types,display,schemas,service,lead-admin}.ts` | v2 create path, admin payload, dual-band labels |
| `src/app/api/v1/public/technology-snapshot/route.ts` | Prefer v2 contact capture; keep v1 compat |
| `src/components/technology-snapshot/technology-snapshot-wizard.tsx` | Anonymous-first flow |
| `src/components/admin/snapshot-lead-detail-view.tsx` | Findings / categories / critical flags / consents |
| `src/app/technology-snapshot/page.tsx` | Metadata + wider shell for results |
| `tests/layout/technology-snapshot-layout.test.ts` | SNAP-003 layout guards |

Legacy snap-1.0 scoring (`scoring.ts`, `questions.ts`) retained for existing leads.

---

## 2. Architecture decisions

1. **Anonymous-first** — Welcome → Business Context → Questions → Results → optional contact. No `TechnologySnapshotLead` until Save / Request a Copy.
2. **Client-side findings** — `buildSnapshotFindingsV2` is pure and runs in the browser for immediate results; server **recomputes** on contact capture (never trusts client scores).
3. **No anonymous persist / public GET-by-id** — avoids IDOR; session recovery via `sessionStorage` only.
4. **Catalog versioning** — `snap-1.0` vs `snap-2.0` on the lead row.
5. **Critical risks are flags**, not overall-band overrides.
6. **Results email deferred** — UI does not claim email delivery; Request a Copy stores the lead for staff follow-up.
7. **Four-axis radar only** — not the official eight-pillar StackScore radar.

---

## 3. Question catalog (`snap-2.0`)

14 questions · Yes / Somewhat / I'm Not Sure / No · points 3/2/1/0.

| Category | IDs |
|----------|-----|
| Security & Access | A1–A4 |
| Devices & Infrastructure | B1–B4 |
| Data Protection & Recovery | C1–C3 |
| Technology Planning | D1–D3 |

Full wording lives in `src/lib/technology-snapshot/catalog-v2.ts`.

---

## 4. Scoring methodology

| Item | Rule |
|------|------|
| Max raw | **42** (admin/internal; not shown as Official StackScore) |
| Category compare | **Normalized percent** (points/max×100) |
| Public bands | Strong Foundation ≥87% · Mixed Signals ≥62% · Notable Gaps ≥33% · Urgent Attention Needed otherwise |
| Critical flags | A1=`no` MFA · C1=`no` backups · C2=`no` restore · C3=`no` recovery plan |
| Traceability | Every finding cites `questionId` + `answer` (+ points where applicable) |

---

## 5. Results dashboard components

- `SnapshotResultsDashboard` — header, disclaimer, radar, critical alerts, expandable categories, key findings, conversion CTAs, optional contact
- `SnapshotRadar` — Recharts four-axis profile
- `SnapshotContactCapture` — consent-gated lead create

---

## 6. Contact capture behavior

On Save / Request a Copy (requires contact consent checkbox):

- Validates via `createSnapshotLeadV2Schema` (honeypot `website` must be empty)
- Creates `TechnologySnapshotLead` with answers, recomputed `findingsJson`, `catalogVersion=snap-2.0`, `categoryScores`, attribution, `contactConsentAt`, optional `marketingConsentAt`
- Rate limited by existing `snapshot_create_ip` (10 / 15 min, fail-closed)
- Marketing consent never implied

---

## 7. Administrative integration

`/snapshot-leads/[id]` shows catalog version, posture label, category summaries, opportunities, critical flags, marketing vs contact consent, source path. Status / notes / invite / convert / delete safeguards unchanged.

---

## 8. Security controls

| Control | Status |
|---------|--------|
| Create rate limit | Preserved |
| Continue-assessment email-only response | Untouched (tests pass) |
| Honeypot on v2 create | Added |
| No unauthenticated lead GET | Preserved |
| No marketing without checkbox | Enforced |
| Analytics | No answers/PII in events |
| Official StackScore engines | Unchanged |
| Migration | Additive only — apply on **staging** |

---

## 9. Test results

| Suite | Result |
|-------|--------|
| `tests/technology-snapshot/*` (incl. engine-v2, schemas-v2) | **Pass** |
| `tests/layout/technology-snapshot-layout.test.ts` | **Pass** |
| `tests/auth/continue-snapshot-security.test.ts` | **Pass** |
| `npm run lint` | **0 errors** |
| `npm run build` | **Pass** |

Profiles covered in engine tests: all yes, all unsure, all no, MFA gap on strong posture, backup gap on strong posture, uneven category normalization, determinism.

---

## 10. Known limitations

1. Staging DB migration must be applied before contact capture writes new columns (`20261031120000_snapshot_v2_findings`).
2. Automated results email not implemented (by design this ticket).
3. Invitation `continue-assessment` still requires a saved lead ID — visitors in invitation flow should use Save My Snapshot first.
4. Mobile visual QA screenshot pack is partial; desktop results + welcome verified locally on `:3016`.
5. Not committed/pushed in this session unless separately requested; **not deployed to production**.

---

## 11. Screenshots

| File | Description |
|------|-------------|
| [`ss-snap-003/welcome-desktop.png`](./ss-snap-003/welcome-desktop.png) | Anonymous welcome — Start Free Snapshot |
| [`ss-snap-003/results-desktop.png`](./ss-snap-003/results-desktop.png) | Results dashboard — Strong Foundation with MFA critical flag, radar, categories |

Local preview used for QA: `http://localhost:3016/technology-snapshot`.

---

## Stop condition

Snapshot 2.0 is ready for **product-owner visual review on staging** after migration apply.  
**Do not promote to production** until a separate release ticket authorizes it.
