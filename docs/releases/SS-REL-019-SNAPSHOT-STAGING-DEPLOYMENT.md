# SS-REL-019 — Snapshot 2.0 Staging Migration and Deployment

| Field | Value |
|-------|--------|
| Ticket | SS-REL-019 |
| Scope | SS-SNAP-003 Snapshot 2.0 + SS-SNAP-004 radar visibility — **staging only** |
| Branch | `staging` |
| Date | 2026-10-31 (America/Chicago) |
| Production | **No changes** — not authorized |
| Result | **GO for staging** (with noted interactive SSO caveat) |

---

## 1. Git commit SHA

| Ref | SHA |
|-----|-----|
| Staging release commit | `bedc0e95582862a686e56c2d388b2053ec6bd722` |
| Message | `feat(snapshot): ship Snapshot 2.0 to staging with radar visibility fixes` |
| Prior tip | `7deb82f` (SS-REL-018 docs) |

Isolation: working tree contained only Snapshot 2.0 / SNAP-004 paths (plus docs). No unrelated product changes included.

---

## 2. Migration verification

**Path:** `prisma/migrations/20261031120000_snapshot_v2_findings/migration.sql`

| Check | Result |
|-------|--------|
| Additive only | **PASS** — `ADD COLUMN IF NOT EXISTS` + index |
| No DROP TABLE / DELETE | **PASS** |
| No column removals | **PASS** |
| Official assessment scoring | **Unchanged** |
| Stripe / billing tables | **Unchanged** |
| v1 lead compatibility | **PASS** — default `catalogVersion = 'snap-1.0'`; existing rows readable |

**BOM incident:** First `migrate deploy` failed with `syntax error near U+FEFF` (UTF-8 BOM). SQL rewritten UTF-8 without BOM; migration marked `--rolled-back` (nothing applied); redeployed successfully.

---

## 3. Staging database identity (non-sensitive)

| Signal | Value |
|--------|--------|
| Prisma datasource host | `ep-patient-credit-atddo1zm.c-9.us-east-1.aws.neon.tech` |
| Database | `neondb` |
| Active local `.env` | patient-credit (staging) |
| Commented production host in `.env` | `ep-autumn-wave-…` (**not** selected) |
| Prisma config URL source | `DATABASE_URL` via `prisma.config.ts` + dotenv |
| `DIRECT_URL` | Pooler variant of same patient-credit endpoint |
| Vercel Preview `AUTH_URL` / `NEXT_PUBLIC_APP_URL` | `https://staging.stackscore.tech` |
| Vercel Production `NEXT_PUBLIC_APP_URL` | `https://stackscore.tech` |
| Preview build log Datasource | **Same** patient-credit host (prior + this deploy) |

**Positive verification:** Local migrate status/deploy and Vercel Preview build logs both print Datasource host `ep-patient-credit-atddo1zm…` — not production `ep-autumn-wave…`.

---

## 4. Migration execution result

| Step | Result |
|------|--------|
| Pre-status | Pending: `20261031120000_snapshot_v2_findings` |
| First deploy | Failed (BOM) → resolved `--rolled-back` |
| Second deploy | **Applied** on patient-credit / `neondb` |
| Post-status | `Database schema is up to date!` (34 migrations) |
| Vercel Preview build migrate | `No pending migrations to apply` (already applied) against same host |

---

## 5. Vercel deployment

| Item | Value |
|------|--------|
| Deployment ID | `dpl_9pDZ7Jt9BkLS4FXNuCh68qW5Lozh` |
| URL | `https://bobkat-stackscore-lbev4izam-robertfitzgerald90-8984s-projects.vercel.app` |
| Environment | Preview |
| Status | **Ready** |
| Git | Branch `staging`, Commit `bedc0e9` |
| Alias | `staging.stackscore.tech` → this deployment |
| Production deploy | **Not performed** |

---

## 6. Automated test results

| Check | Result |
|-------|--------|
| `npm test -- tests/technology-snapshot tests/layout/technology-snapshot-layout.test.ts` | **35/35 passed** |
| `npm test -- tests/auth/continue-snapshot-security.test.ts tests/auth/rate-limit.test.ts tests/layout/assessment-invitation-layout.test.ts` | **42/42 passed** |
| `npm run lint` | **0 errors** (22 preexisting warnings) |
| `npm run build` | **Succeeded** (exit 0) |

---

## 7. Anonymous Snapshot / contact / admin verification

### Live `staging.stackscore.tech`

| Check | Result |
|-------|--------|
| Unauthenticated browser | **Blocked** by Vercel Authentication (SSO login wall) |
| Bypass secret available this session | **No** |

Interactive UI on the public staging hostname therefore requires operator SSO. Deploy identity (SHA, Ready, alias, migrate host) is confirmed via Vercel CLI/logs.

### Functional smoke (local `next start` :3019 → **same staging Neon**)

Same commit build + staging `DATABASE_URL`:

| # | Check | Result |
|---|--------|--------|
| 1–3 | Anonymous start → 14Q answers → results without contact | **PASS** (session inject Strong Foundation profile) |
| 4 | Radar polygon visible (brand violet) | **PASS** (a11y + results UI; see SNAP-004 assets) |
| 5 | Category cards expand | **PASS** |
| 6 | Critical risks | N/A on all-`yes` Strong profile (expected) |
| 7 | Consultation CTA | **PASS** → `cal.com/.../bobkat-it-free-consult?utm_source=technology_snapshot` |
| 8 | Full assessment CTA | **PASS** → `/assessment-offer` |
| 9 | Demo CTA | **PASS** → `/demo/overview` |
| 10 | Optional contact → lead | **PASS** — synthetic `ss-rel-019-test@example.com` |
| 11 | Lead findings on staging DB | **PASS** — `catalogVersion=snap-2.0`, `findingsJson` + `categoryScores` present, `classification=strong_foundation`, `totalScore=42` |
| 12 | Existing v1 leads readable | **PASS** — 2× `snap-1.0` rows retained; totals 3 after test lead |

Admin UI browse of the new lead was not exercised through Vercel SSO this session; persistence + findings columns confirmed via Prisma against staging Neon (same data admin `/snapshot-leads` would load).

---

## 8. Screenshots

| Asset | Path |
|-------|------|
| Results smoke (local→staging DB) | [`ss-rel-019/results-desktop.png`](./ss-rel-019/results-desktop.png) |
| Radar Strong desktop (SS-SNAP-004) | [`ss-rel-019/radar-strong-desktop.png`](./ss-rel-019/radar-strong-desktop.png) |
| Radar Strong mobile (SS-SNAP-004) | [`ss-rel-019/radar-strong-mobile.png`](./ss-rel-019/radar-strong-mobile.png) |
| Full SNAP-004 set | [`docs/snapshot/ss-snap-004/`](../snapshot/ss-snap-004/) |

---

## 9. Outstanding issues

1. **Vercel Authentication** blocks unauthenticated browser QA on `https://staging.stackscore.tech` — operator SSO (or bypass secret) needed for live hostname click-through.
2. **`_prisma_migrations`** may show a rolled-back + applied pair for `20261031120000_snapshot_v2_findings` from the BOM recovery — schema is up to date; cosmetic history only.
3. Preview env lists typo `SKIP_PRIMSA_MIGRATE` (missing `S`) — migrate still ran via correct path; consider fixing the env name separately.
4. **Production** remains unauthorized — do not merge to `main` or promote this migration/deploy without a separate ticket.

---

## 10. Final staging GO / NO-GO

# **GO — Staging**

Snapshot 2.0 + SNAP-004 are on `staging` at `bedc0e9`, migration applied to verified staging Neon (`ep-patient-credit-…`), Preview deployment Ready and aliased to `staging.stackscore.tech`, automated gates green, synthetic contact lead persisted with v2 findings, v1 leads intact.

**Production: NO-GO** until separately authorized.
