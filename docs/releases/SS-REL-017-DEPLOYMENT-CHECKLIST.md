# SS-REL-017 — Production Deployment Checklist

Use only after **explicit production authorization**.  
RC baseline reviewed: `staging` @ `aa90298` (+ commit registry fix & REL docs before promote).

## A. Pre-flight (before deploy)

- [ ] Written authorization recorded (who / when / RC SHA)
- [ ] `git status` clean on release SHA; `origin/staging` matches intended RC
- [ ] `src/lib/api/route-registry.ts` includes project task/milestone/update routes (SEC-007)
- [ ] Neon Production backup / PITR checkpoint noted
- [ ] Vercel **Production** env verified (names only):
  - [ ] `DATABASE_URL` = Production Neon (not staging host)
  - [ ] `AUTH_URL` / `NEXT_PUBLIC_APP_URL` = `https://stackscore.tech`
  - [ ] `STRIPE_SECRET_KEY` = live; prices/webhook secret = production endpoint
  - [ ] `RESEND_*` / `CRON_SECRET` / `WEBSITE_LEADS_API_SECRET` present
- [ ] Confirm Staging Stripe/DB secrets are **not** applied to Production
- [ ] Operator completed staging browser QA (customer + admin + demo + mobile)
- [ ] Migrations acknowledged (3 additive; no down-migrate plan)

## B. Deploy

- [ ] Deploy RC to Vercel Production (`vercel-build` → generate → migrate deploy → next build)
- [ ] Build log shows three migrations applied (or already applied):
  - `20260425010000_auth_rate_limit_bucket`
  - `20261030100000_project_tasks_milestones_recommendations`
  - `20261030120000_project_customer_updates`
- [ ] If `SKIP_PRISMA_MIGRATE=1`, run `npm run db:migrate:deploy` against Production Neon **before** serving traffic

## C. Immediate smoke

- [ ] `npm run smoke -- https://stackscore.tech` → health `{status:"ok"}` + CSRF
- [ ] `/` purple homepage loads
- [ ] `/login` loads; Sign In form present
- [ ] `/demo` → `/demo/overview`; purple customer-parity chrome; DEMO ENVIRONMENT
- [ ] `/api/product-overview/pdf` → **410**
- [ ] Staff login works; Command Center loads
- [ ] Customer login works; Overview / Explore / Roadmap / Projects / Reports
- [ ] Stripe Dashboard: recent webhook deliveries **200** (no signature failures)
- [ ] Spot-check: no cross-tenant data on a sample customer

## D. Rollback triggers

Rollback (Vercel previous Production deploy) if any of:

- [ ] Health unhealthy or exposes config posture
- [ ] Auth login broken for staff or customers
- [ ] Migrate failed and app cannot start
- [ ] Stripe webhooks failing signature verification after deploy
- [ ] Confirmed cross-tenant data exposure

**DB:** do not drop new tables on rollback; keep additive schema.

## E. Post-release

- [ ] Monitor Vercel / Stripe / Resend / Neon for 24h
- [ ] Announce demo/homepage change to internal stakeholders
- [ ] File follow-ups: `tsc` fixture cleanup (P2), SEC-001-M09 (session invalidation)
- [ ] Do **not** start SS-SNAP-001 until separately authorized
