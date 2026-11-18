# SS-REL-020 — Free Technology Snapshot 2.0 Production Deployment

| Field | Value |
| --- | --- |
| Date | 2026-10-31 |
| Authorization | Product owner — Snapshot 2.0 only (SS-SNAP-003 / 004 / 005) |
| Release branch | `main` |
| Final status | **GO — Production** |

Related: SS-SNAP-003 implementation · SS-SNAP-004 radar visual QA · SS-SNAP-005 questionnaire refinement · SS-REL-019 staging GO

---

## 1. Production commit before deployment

| Item | Value |
| --- | --- |
| SHA (full) | `4dbc85b6502d9ee44dabafe704886934cab65472` |
| SHA (short) | `4dbc85b` |
| Subject | SS-WEB-004: refresh assessment marketing pages with StackScore 2.0 screenshots. |
| Prior production deploy | `dpl_8yLfobjiGsdY4GkTX8oqzRitjEuz` (Ready) |

---

## 2. Final production commit SHA

| Item | Value |
| --- | --- |
| Tip SHA (full) | `bfb7a8c9b5fc6a49a654e897fd789313d41ce446` |
| Tip SHA (short) | `bfb7a8c` |
| Tip subject | fix(snapshot): refine questionnaire UX, IT labels, and radar sizing |
| Parent feature commit | `b6a2cd4` — feat(snapshot): ship Snapshot 2.0 to staging with radar visibility fixes |
| Remote | `origin/main` @ `bfb7a8c` (fast-forward; no force-push) |

---

## 3. Included commits and files

### Isolation method

Staging tip was **not** merged wholesale. Approved Snapshot work was cherry-picked onto `main` as two commits (`b6a2cd4`, `bfb7a8c`), excluding unrelated staging-only material (for example SS-WEB-004 was already on production; no additional non-Snapshot feature commits were promoted in this release).

### Staging sources (pre-cherry-pick)

| Staging commit | Role |
| --- | --- |
| `bedc0e9` | Snapshot 2.0 feature + radar visibility (SS-SNAP-003 / 004 core) |
| `5a93a5c` | Questionnaire UX / IT labels / radar sizing (SS-SNAP-005) |

### Production commits included

1. `b6a2cd4` — Snapshot 2.0 engine, catalog, UI, migration, admin findings, tests  
2. `bfb7a8c` — IT management human-readable labels, question copy polish, radar sizing  

### Application / schema files (release diff `b6a2cd4^..bfb7a8c`)

- `prisma/schema.prisma`
- `prisma/migrations/20261031120000_snapshot_v2_findings/migration.sql`
- `src/app/api/v1/public/technology-snapshot/route.ts`
- `src/app/technology-snapshot/page.tsx`
- `src/components/admin/snapshot-lead-detail-view.tsx`
- `src/components/technology-snapshot/*` (wizard, results dashboard, radar, contact capture)
- `src/lib/technology-snapshot/**` (catalog-v2, engine, schemas, service, session-state, display, types, lead-admin, questions)
- `tests/technology-snapshot/*` and `tests/layout/technology-snapshot-layout.test.ts`
- Snapshot docs under `docs/snapshot/**` (SS-SNAP-002–005 + screenshots)

**Not included:** billing schema, Official StackScore scoring engines, Stripe/checkout behavior changes, unrelated staging docs/refactors.

---

## 4. Migration SQL review

**Migration:** `20261031120000_snapshot_v2_findings`

```sql
ALTER TABLE "TechnologySnapshotLead" ADD COLUMN IF NOT EXISTS "catalogVersion" TEXT NOT NULL DEFAULT 'snap-1.0';
ALTER TABLE "TechnologySnapshotLead" ADD COLUMN IF NOT EXISTS "findingsJson" JSONB;
ALTER TABLE "TechnologySnapshotLead" ADD COLUMN IF NOT EXISTS "categoryScores" JSONB;
ALTER TABLE "TechnologySnapshotLead" ADD COLUMN IF NOT EXISTS "marketingConsentAt" TIMESTAMP(3);
ALTER TABLE "TechnologySnapshotLead" ADD COLUMN IF NOT EXISTS "campaignId" TEXT;
ALTER TABLE "TechnologySnapshotLead" ADD COLUMN IF NOT EXISTS "sourcePath" TEXT;
CREATE INDEX IF NOT EXISTS "TechnologySnapshotLead_catalogVersion_idx" ON "TechnologySnapshotLead"("catalogVersion");
```

| Check | Result |
| --- | --- |
| Additive only | **PASS** |
| No DROP TABLE / TRUNCATE / DELETE | **PASS** |
| No column removals | **PASS** |
| Billing schema untouched | **PASS** |
| Official StackScore scoring untouched | **PASS** |
| Existing rows default `catalogVersion = snap-1.0` | **PASS** |

---

## 5. Production database identity (non-sensitive)

| Item | Value |
| --- | --- |
| Neon project | `morning-heart-77783541` |
| Production branch | `production` / `br-fancy-frost-at9ut2q6` |
| Database name | `neondb` |
| Host fingerprint | `ep-autumn-wave-atiercwu.c-9.us-east-1.aws.neon.tech` |
| Distinct from staging | **YES** — staging uses `ep-patient-credit-…` / Neon staging branch |
| Vercel Production | Confirmed autumn-wave (not patient-credit); `SKIP_PRISMA_MIGRATE` still set — migrations applied explicitly |

Credentials were never printed.

---

## 6. Recovery snapshot / recovery point

| Item | Value |
| --- | --- |
| Manual Neon snapshot (existing) | `snap-morning-waterfall-atig4xhl` — production @ 2026-10-31 02:47:02 UTC |
| New snapshot attempt | Blocked by Neon snapshot quota |
| Pre-migrate recovery branch | `ss-rel-020-pre-migrate` / `br-curly-river-at9d7s5g` |
| Recovery branch parent | `br-fancy-frost-at9ut2q6` (production) |
| Procedure | Restore from Neon snapshot `snap-morning-waterfall-atig4xhl` and/or promote or query recovery branch `ss-rel-020-pre-migrate`; app rollback via prior Vercel Production deployment. Additive columns are forward-only (no down-migrate). |

Recovery readiness treated as **PASS** via existing snapshot + dedicated pre-migrate branch.

---

## 7. Migration execution results

| Step | Result |
| --- | --- |
| Preflight `prisma migrate status` (production URL) | Pending migration identified once; host = autumn-wave / `neondb` |
| Command | `npx prisma migrate deploy` (explicit; not via Vercel build) |
| Forbidden commands | Not used (`migrate reset`, `db push`, `migrate dev`) |
| Post-status | `Database schema is up to date!` — **34** migrations found |
| Re-check after smoke | `Database schema is up to date!` on autumn-wave |
| Existing leads | Pre-migration Snapshot leads remain readable (`snap-1.0` rows retained) |

Migration applied **before** production code that requires the new columns was promoted.

---

## 8. Vercel deployment ID

| Item | Value |
| --- | --- |
| Deployment ID | `dpl_Em6eAd1CrmrsnZTBh8i56hpQoYxc` |
| Status | **Ready** |
| Environment | Production |
| Alias | `https://stackscore.tech` |
| Expected commit | `bfb7a8c` |
| Created | 2026-10-31 ~12:55 CDT |
| Unexpected commit | **No** |

---

## 9. Automated test results

Run on release tip before push (`main` @ Snapshot commits):

| Gate | Result |
| --- | --- |
| `npm test -- tests/technology-snapshot tests/layout/technology-snapshot-layout.test.ts` (+ related Snapshot suites) | **PASS** — 10 test files |
| `npm run lint` | **0 errors** (preexisting warnings only) |
| `npm run build` | **PASS** |

No Official StackScore scoring or billing test regressions introduced by this release set.

---

## 10. Production smoke-test results

### Public Snapshot — `https://stackscore.tech/technology-snapshot`

| Check | Result |
| --- | --- |
| Page loads publicly (no account) | **PASS** |
| Anonymous questionnaire (14 questions) | **PASS** |
| IT management selector — human-readable labels; no raw enums | **PASS** |
| Updated MFA / monitoring / change-management copy | **PASS** (via SS-SNAP-005 content on tip) |
| Results without contact info | **PASS** |
| Indicative posture classification | **PASS** — Mixed Signals |
| Four-axis radar polygon | **PASS** |
| Category percentages | **PASS** — Security 75%, Devices 100%, Data 0%, Planning 100% |
| Interactive category details | **PASS** |
| Critical attention items | **PASS** (MFA, backups, restore test, recovery plan) |
| Three prioritized recommendations | **PASS** |
| Consultation / assessment / demo CTAs present | **PASS** (no live purchase) |

### Existing platform

| Surface | Result |
| --- | --- |
| Homepage `/` | **PASS** (200) |
| Interactive demo `/demo` → `/demo/overview` | **PASS** |
| Assessment offer `/vcio-offer` | **PASS** |
| Assessment invitation `/assessment-invitation` | **PASS** (200) |
| Sign-in `/login` | **PASS** |
| API health `/api/v1/health` | **PASS** — `{"status":"ok"}` |
| Activate account | **PASS** (200) |

### Administrative workflows

| Check | Result |
| --- | --- |
| `/snapshot-leads` unauthenticated | **PASS** — 307 → `/login` (auth gate intact) |
| Interactive admin detail UI | **Not completed in-browser** — staff SSO / credentials not used in this automation session |
| Lead readability (DB) | **PASS** — see §11; legacy `snap-1.0` rows still present |

Invitation API routes remain present in the codebase; destructive admin actions were not executed against production.

---

## 11. Lead capture verification

Synthetic production smoke lead (non-customer):

| Field | Value |
| --- | --- |
| Email | `ss-rel-020-prod-smoke@example.com` |
| Company | SS-REL-020 Prod Smoke |
| UI save | **PASS** — “Snapshot saved” confirmation |
| Lead found in production DB | **PASS** (`id` prefix `b07b16c0`) |
| `catalogVersion` | `snap-2.0` |
| `classification` | `mixed_signals` |
| `findingsJson` / `categoryScores` | Present |
| Contact consent | Set (`contactConsentAt` present) |
| Marketing consent | Independent — **not** set (checkbox left unchecked) |
| Totals after smoke | 3 leads total · 2 × `snap-1.0` · 1 × `snap-2.0` |

---

## 12. Outstanding issues

1. **Admin UI browse of Snapshot lead detail** was not interactively verified on production (SSO). Auth redirect and DB-backed lead/findings persistence were verified instead.
2. Neon **snapshot quota** prevented creating a second named snapshot at migrate time; recovery branch `ss-rel-020-pre-migrate` plus existing snapshot `snap-morning-waterfall-atig4xhl` were used as the recovery point.
3. PowerShell `Invoke-WebRequest` does not follow HTTP 308 for some marketing paths (e.g. `/product-overview`); browser navigation and related offer pages returned healthy content.

None of the above are release blockers for Snapshot 2.0 public functionality.

---

## 13. Final GO / NO-GO status

# **GO — Production**

Free Technology Snapshot 2.0 is live on `https://stackscore.tech/technology-snapshot` at commit `bfb7a8c` / deployment `dpl_Em6eAd1CrmrsnZTBh8i56hpQoYxc`.

Production Neon migration `20261031120000_snapshot_v2_findings` is applied; existing Snapshot leads remain accessible; billing and Official StackScore scoring were not modified by this release.

### Recommended operator follow-up (non-blocking)

- Sign in to production admin and open Snapshot lead `b07b16c0…` to visually confirm findings rendering.
- Optionally delete or archive the synthetic smoke lead after review.
- Retain recovery branch `ss-rel-020-pre-migrate` until the next successful Neon snapshot window.
