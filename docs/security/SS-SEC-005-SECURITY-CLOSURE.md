# SS-SEC-005 — Security Closure & Release Readiness

| Field | Value |
| --- | --- |
| Status | Complete (read-only reconciliation; no code/migrate/deploy) |
| Date | 2026-10-25 |
| Branch reviewed | `staging` |
| Scope | Reconcile SS-SEC-001 → SS-SEC-004 against live code; baseline review; release recommendation |
| Related | [`SS-SEC-001-AUDIT.md`](SS-SEC-001-AUDIT.md), [`SS-SEC-002-REMEDIATION.md`](SS-SEC-002-REMEDIATION.md), [`SS-SEC-003-PASSWORD-POLICY.md`](SS-SEC-003-PASSWORD-POLICY.md), [`SS-SEC-004-AUTH-ABUSE-PROTECTION.md`](SS-SEC-004-AUTH-ABUSE-PROTECTION.md), [`SS-SEC-006-DEPENDENCY-REMEDIATION.md`](SS-SEC-006-DEPENDENCY-REMEDIATION.md), [`SS-SEC-007-API-GUARDRAILS.md`](SS-SEC-007-API-GUARDRAILS.md), DOC-303, SS-ENV-001 |
| Post-closure updates | Finding statuses for H03/M01–M03/M06/M07 refreshed after **SS-SEC-007** (2026-10-25); DEP items after **SS-SEC-006** |
| Independent code verification | Explore agent + direct source inspection (docs not trusted alone) |

---

## 1. Executive summary

StackScore’s **account-takeover Critical (C01)** and **password-policy High (H02)** are **remediated and verified in code**. Durable **auth abuse rate limiting (H01/H04)** is **implemented in code** with migration and automated tests, but **staging DB apply and manual validation are not evidenced** in this closure — status remains **Implemented but awaiting validation**.

The platform has a **credible commercial security baseline** for AuthN/AuthZ/tenant isolation, provided release checklist items are completed. After SS-SEC-006/007, remaining open SEC-001 items are primarily **session invalidation on password change (M09)**, **cookie/host hardening (L01)**, and **error-message disclosure (L04)** — none reintroduce the original C01 takeover path.

### Totals (SS-SEC-001 register + closure additions; post SS-SEC-006/007)

| Category | Count |
| --- | --- |
| Original SEC-001 findings (C/H/M/L) | **18** (1 Critical, 4 High, 9 Medium, 4 Low*) |
| Phase 1 / SS-OPT-001 isolation items (treated as prior remediated) | **7** (verified via regression tests; not re-opened) |
| Remediated and verified (SEC-001 C/H/M) | **8** (C01, H02, H03, M01, M02, M03, M07, M08) |
| Implemented but awaiting validation | **2** (H01, H04 — includes SEC-004 migrate/manual) |
| Partially remediated | **3** (M04, M06, L05) |
| Open | **3** (M09, L01, L04) |
| Accepted risk (requires formal approval) | **3** (M05, L02, L03) |
| **Production release readiness** | **CONDITIONALLY READY** |

\*L05 overlaps H04/M04; counted once as partially remediated.

### Recommendation

**CONDITIONALLY READY** for commercial production after the release blockers in §5 are cleared (staging SEC-004 migrate + manual validation, production migrate under change control, env isolation confirmation, Auth.js critical CVE triage, formal acceptance of M05/L02/L03 and residual mediums or a time-boxed remediation plan).

---

## 2. Original audit reconciliation — findings register

Statuses used: **Remediated and verified** | **Implemented but awaiting validation** | **Partially remediated** | **Open** | **Accepted risk** | **Not applicable**

### 2.1 SEC-001 Critical / High / Medium / Low

| Finding ID | Original severity | Affected component | Original vulnerability | Current implementation | Verification evidence | Remaining risk | Remediation status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **SEC-001-C01** | Critical | `POST …/continue-assessment` | Returned raw `activationUrl` / token to unauthenticated caller | Generic `{ ok, message }` only; token emailed | Route + `convert-snapshot-to-assessment.ts` `publicSuccess()`; `tests/auth/continue-snapshot-security.test.ts` | Email pipeline compromise; `leadId` still public | **Remediated and verified** |
| **SEC-001-H01** | High | Credentials `authorize` | No login rate limit | PostgreSQL `AuthRateLimitBucket`; IP 20/15m + email atomic admit 5/15m; clear on success; fail-open | `src/lib/auth/rate-limit/*`, `config.ts`; `tests/auth/rate-limit.test.ts`; migration file present | Staging/prod table apply unproven; fail-open if DB down | **Implemented but awaiting validation** |
| **SEC-001-H02** | High | Password-reset confirm | No min length | Shared `passwordSchema` / `assertPasswordMeetsPolicy` before token use; `hashPassword` gate | `password-reset.ts` L66–69; `password-policy.ts`; `tests/auth/password-policy.test.ts` | Complexity/HIBP still deferred (L03) | **Remediated and verified** |
| **SEC-001-H03** | High | `middleware.ts` | `/api` excluded from NextAuth middleware | Registry + CI completeness (`route-registry.ts`); runtime still per-route helpers | `SS-SEC-007-API-GUARDRAILS.md`; `tests/api/route-registry.test.ts` | Wrong classification still possible; middleware exclusion intentional | **Remediated and verified** |
| **SEC-001-H04** | High | Reset / activate / snapshot public APIs | Unbounded abuse | Durable limiter wired; fail-closed on reset-request + snapshot; fail-open confirm/activation | Public routes + rate-limit module + tests | Same migrate/validation caveat as H01 | **Implemented but awaiting validation** |
| **SEC-001-M01** | Medium | `GET /api/v1/health` | Exposes config posture | Minimal `{ status }` only + `health_ip` (fail-open) | `health/route.ts`; public-endpoint guardrail tests | Ops lose public check detail | **Remediated and verified** |
| **SEC-001-M02** | Medium | `GET /api/product-overview/pdf` | Unauth PDF DoS/cost | `product_overview_pdf_ip` + short cache | `product-overview/pdf/route.ts` | Cost still possible under limit | **Remediated and verified** |
| **SEC-001-M03** | Medium | `POST /api/checkout/create-session` | Unauth Checkout spam | `checkout_create_ip` (fail-closed); commerce still public | `checkout/create-session/route.ts` | Stripe quota under limit | **Remediated and verified** |
| **SEC-001-M04** | Medium | Snapshot create | Unbounded lead create | IP durable limit (10/15m); still returns `id` | `technology-snapshot/route.ts` + policies | Bounded spam; `id` feeds continue | **Partially remediated** |
| **SEC-001-M05** | Medium | Technician RBAC | Firm-wide staff access | By design `requireConsultantOrAdmin` | `helpers.ts` | Technician compromise = firm blast radius | **Accepted risk** |
| **SEC-001-M06** | Medium | `POST /api/checkout/vcio` | Anon subscription Checkout | `checkout_vcio_ip`; anon create still allowed by product | `checkout/vcio/route.ts` | Unattached checkouts under limit | **Partially remediated** |
| **SEC-001-M07** | Medium | Website-leads limiter | Process-local `Map` | Durable `website_leads_ip` via AuthRateLimitBucket | integration route + rate-limit module | Same Neon limiter ops caveat | **Remediated and verified** |
| **SEC-001-M08** | Medium | Continue existing-account path | Leaked `assessmentId` / `loginUrl` | Generic public message only | Same as C01 tests TM-C01-c | — | **Remediated and verified** |
| **SEC-001-M09** | Medium | JWT after password change | No session versioning | JWT callback checks `isActive` only; reset updates hash only | `config.ts` jwt; `password-reset.ts` | Stolen JWT valid ≤24h after reset | **Open** |
| **SEC-001-L01** | Low | `trustHost: true` | Cookie/host hardening | Still `trustHost: true`; Auth.js defaults | `auth.config.ts` | Needs staging header review | **Open** |
| **SEC-001-L02** | Low | MFA | No MFA | Not implemented | Codebase search | Staff MFA deferred (DOC-303) | **Accepted risk** |
| **SEC-001-L03** | Low | Password complexity | Length-only | Explicit DOC-303 MVP policy | `password-policy.ts` | Weak-but-long passwords | **Accepted risk** |
| **SEC-001-L04** | Low | Error disclosure | Raw `Error.message` on some routes | Still present on public reset/activate/continue | Route handlers | Info leak / unstable clients | **Open** |
| **SEC-001-L05** | Low–Med | Missing durable limits elsewhere | Overlap with H04 | Auth-critical + health/PDF/checkout/leads covered (SS-SEC-007); residual other public surfaces | Cross-cutting | Tune thresholds; CAPTCHA later | **Partially remediated** |

### 2.2 Phase 1 / SS-OPT-001 prior items (from SEC-001 §7)

| Finding | Status | Evidence |
| --- | --- | --- |
| Unscoped client/project/assessment APIs | **Remediated and verified** | `requireClientWorkspaceAccess` / `requireAssessmentAccess` widespread; `tests/auth/api-client-isolation.test.ts` |
| Client list enumeration | **Remediated and verified** | Portal scoped list tests |
| Firm dashboard for any user | **Remediated and verified** | Staff-only dashboard guards |
| Assessment PDF / recommendations foreign id | **Remediated and verified** | Access helpers + isolation tests |
| Recommendation PATCH by any user | **Remediated and verified** | Staff-only + visibility tests |
| Portal consulting field exposure | **Remediated and verified** | `presentRecommendationForRole` / visibility tests |
| 403 vs 404 enumeration | **Remediated and verified** | Foreign resource → 404 pattern in access helpers |

### 2.3 Closure-era additions (not in original SEC-001 list)

| ID | Severity | Issue | Status |
| --- | --- | --- | --- |
| **SEC-005-DEP-01** | Critical (dependency) | `next-auth@5.0.0-beta.31` / `@auth/core` advisories (incl. email normalizer homoglyph) | **Open** — upgrade not performed (milestone constraint) |
| **SEC-005-DEP-02** | High/Critical (dependency) | `next@15.5.19` multiple advisories; several Server-Actions-centric | **Partially remediated** by architecture (0 Server Actions) — still needs version triage |
| **SEC-005-OPS-01** | High (ops) | SEC-004 migration + staging manual checklist not evidenced as complete | **Implemented but awaiting validation** |
| **SEC-005-INFRA-01** | High (ops) | Staging vs production Neon/`AUTH_SECRET` isolation cannot be proven from repo alone | **Implemented but awaiting validation** (process) |

---

## 3. Verified remediations

| Control | Verified |
| --- | --- |
| Continue-assessment never returns activation tokens/IDs | Yes (C01/M08) |
| Shared password policy min 10 on reset/activation/admin paths | Yes (H02 / SEC-003) |
| bcrypt cost 12 | Yes |
| JWT maxAge 24h; DB revalidation of `isActive`/role via email | Yes |
| Activation/reset tokens hashed at rest; reset anti-enumeration | Yes |
| Stripe `constructEvent` + Resend Svix verification | Yes |
| Cron `Authorization: Bearer ${CRON_SECRET}` | Yes |
| Website-leads shared secret | Yes + durable `website_leads_ip` (SS-SEC-007) |
| Client workspace / assessment object-level auth helpers | Yes |
| Recommendation field filtering for portal | Yes |
| No Server Actions mutation surface | Yes |
| Durable rate-limit **code** (atomic UPSERT, HMAC keys, Vercel-first IP, atomic login admit) | Yes (runtime DB apply **not** verified) |

---

## 4. Security baseline review (current implementation)

### Authentication

| Area | Assessment |
| --- | --- |
| Login | Credentials + bcrypt; rate-limited in code; fail-open if limiter DB missing |
| Passwords | Min 10 enforced on set paths; no complexity/HIBP |
| Reset / activation | Hashed tokens, TTL, single-use; rate limits in code |
| Sessions | JWT 24h; inactive invalidation; **no** password-change invalidation (M09) |
| Rate limiting | Durable Postgres design; website-leads still process-local |

### Authorization

| Area | Assessment |
| --- | --- |
| RBAC | admin / technician / client helpers in broad use |
| Tenant isolation | Client boundary; portal IDOR closed in tests |
| Object-level auth | Assessment/project/workspace helpers |
| Admin privileges | `requireAdmin` on user management etc. |
| Public endpoints | Intentional public set; abuse residual on health/PDF/checkout |

### Data protection

| Area | Assessment |
| --- | --- |
| Secrets | Env-based; health reveals presence/status of some | 
| DB boundaries | Prisma + Neon; env isolation is operational |
| Error messages | Some raw `Error.message` on public routes (L04) |
| Logging | Rate-limit logs sanitized (no secrets); auth failures generic |

### Application security

| Area | Assessment |
| --- | --- |
| Input validation | Zod on many writes; public routes mixed |
| API protections | Per-route + `API_ROUTE_REGISTRY` CI (H03 / SS-SEC-007); middleware still excludes `/api` |
| File/export | On-demand PDFs with access checks for tenant exports; public product-overview PDF open |
| Security headers | No custom CSP/frame headers found in app config (rely on platform defaults) |
| Dependencies | `npm audit --omit=dev`: **29** issues (4 critical, 18 high, 7 moderate) — see §7 |
| Production config | Documented in SS-ENV-001; not runtime-verified here |

### Infrastructure

| Area | Assessment |
| --- | --- |
| Vercel / Neon separation | Required by SS-ENV-001; **not verified** against live dashboards |
| Migration safety | `vercel-build` migrate-on-deploy; `SKIP_PRISMA_MIGRATE` risk documented in SS-ENV-003 |
| SEC-004 migration | Present in repo; staging apply **unproven**; production must not be assumed |

---

## 5. Open findings (unresolved) — prioritized

### Critical

| ID | Evidence | Exploitability / impact | Remediation | Complexity | Blocks release? |
| --- | --- | --- | --- | --- | --- |
| **SEC-005-DEP-01** (`@auth/core` / next-auth) | `npm audit`; next-auth 5.0.0-beta.31 | Homoglyph email / Auth.js issues; Credentials-only reduces OAuth cookie issues but email normalization still relevant | Controlled upgrade of `next-auth` / `@auth/core` + regression of login/session | Medium | **Yes** (or formal risk acceptance with compensating controls) |

### High

| ID | Evidence | Exploitability / impact | Remediation | Complexity | Blocks release? |
| --- | --- | --- | --- | --- | --- |
| **SEC-005-OPS-01** / **H01/H04 validation** | Unchecked SEC-004 manual checklist; no evidence migration applied | Without table: login fail-open (no throttle); snapshot fail-closed (503) | Staging `migrate deploy` + checklist; then production migrate under change control | Low–Medium | **Yes** for claiming H01/H04 closed in production |
| **SEC-005-INFRA-01** | SS-ENV-001 risks R1–R3 | Wrong `DATABASE_URL` → migrate/seed production | Confirm Vercel Staging ≠ Production Neon; distinct `AUTH_SECRET` | Low (ops) | **Yes** until confirmed |
| **SEC-005-DEP-02** (Next.js) | audit critical/high on next | Several SA-centric; app has 0 Server Actions | Patched in SS-SEC-006 (`next@15.5.28`); re-audit on promote | Medium | **Conditional** — confirm staging install |

### Medium

| ID | Evidence | Impact | Remediation | Complexity | Blocks release? |
| --- | --- | --- | --- | --- | --- |
| M06 residual | Anon vCIO Checkout still allowed | Unattached sessions under `checkout_vcio_ip` | Product: require auth for subscription attach | Low–Med | No |
| M09 JWT after password change | jwt callback | Session theft window | `passwordChangedAt` / session version | Medium | No (accept short window or fix) |
| M04 residual | Snapshot still returns id | Continue amplification bounded by RL | CAPTCHA / signed lead capability | Med | No |

### Low

| ID | Notes | Blocks release? |
| --- | --- | --- |
| L01 trustHost / cookies | Staging header review | No |
| L04 Error.message leaks | Map to stable codes | No |

### Attention items requested in SS-SEC-005

| Topic | Closure finding |
| --- | --- |
| SEC-004 staging migration/validation | **Awaiting validation** — migration exists; checklist unchecked; DB apply not proven |
| Client IP trust | **Verified in code** for direct Vercel (`x-vercel-forwarded-for` first); residual if external proxy without Verified Proxy |
| Concurrent login failures | **Verified fixed in code** (atomic admit + clear-on-success + concurrent tests) |
| Website-leads in-memory RL | **Remediated (M07 / SS-SEC-007)** — durable `website_leads_ip` |
| Other SEC-001 opens | M09, L01, L04 remain open; M06 partially remediated; H03/M01–M03/M07 closed in SS-SEC-007 |

---

## 6. Accepted risks requiring approval

Document these for explicit product/security owner sign-off before production:

1. **M05 — Technician firm-wide access** — by design until assignment model exists; treat technician credentials as tier-0.
2. **L02 — No MFA** — DOC-303 Phase 2 deferral; prioritize staff MFA later.
3. **L03 — Length-only password policy** — matches DOC-303 MVP.
4. **Login/confirm/activation fail-open** during limiter outages — approved in SS-SEC-004 architecture.
5. **Optional:** Accept residual M06/M09 (and L01/L04) for GA with WAF/monitoring and a 30-day remediation window.

---

## 7. Test results (Phase 5 validation)

| Check | Result | Notes |
| --- | --- | --- |
| Full Vitest suite | **619/619 passed** | Includes auth isolation, password policy, rate-limit |
| ESLint | **0 errors**, 32 warnings | Pre-existing unused-var warnings |
| `tsc --noEmit` | **27 errors** | Pre-existing in unrelated **test** files; not SEC-005 regressions |
| `npx next build` | **Succeeded** | Webpack production build |
| `npm run build --turbopack` | Not re-run as gate | Prior local turbopack font issue treated as env/tooling |
| `npm audit --omit=dev` | **29** vulns (4 critical, 18 high, 7 moderate) | No auto-upgrade performed |
| `npm audit` (incl. dev) | **34** vulns | Includes vite etc. |

**Preexisting vs new:** No new test/lint/build failures attributed to this read-only milestone. Dependency audit findings are **preexisting** inventory (not introduced by SEC-005).

---

## 8. Recommended remediation sequence

1. **Ops** — Confirm staging Neon ≠ production; apply `20260425010000_auth_rate_limit_bucket` on staging; complete SEC-004 manual checklist.
2. **Deps** — SS-SEC-006 applied in lockfile (`next-auth` beta.32 / `next` 15.5.28); confirm staging install + smoke.
3. **Release** — Production migrate AuthRateLimitBucket under change control when promoting staging → main.
4. **H03 / public abuse** — Done in SS-SEC-007 (registry CI + durable limits); deploy/validate on staging.
5. **M06 residual** — Product decision: require auth for vCIO subscription attach (optional).
6. **M09** — Session version / `passwordChangedAt` invalidation.
7. **L04 / L01** — Stable public errors; cookie/header staging review.
8. **MFA (L02)** — Staff MFA when DOC-303 Phase 2 starts.

---

## 9. Production release checklist

- [ ] Staging `DATABASE_URL` host confirmed ≠ production
- [ ] Staging `AUTH_SECRET` distinct; `AUTH_URL` / app URL match staging origin
- [ ] `npx prisma migrate deploy` on staging includes `20260425010000_auth_rate_limit_bucket`
- [ ] SEC-004 manual validation checklist completed on staging
- [ ] Stripe/Resend/cron secrets are staging-scoped (test mode / non-prod)
- [ ] Production backup + migrate plan for AuthRateLimitBucket documented
- [ ] `next-auth` critical CVE remediated **or** formally accepted with owner signature
- [ ] Next.js advisory triage recorded (Server Actions N/A noted)
- [ ] Accepted risks M05/L02/L03 signed
- [ ] Residual mediums (M06/M09) accepted with due dates **or** fixed
- [ ] Smoke: login, reset, activate, snapshot continue, webhook health on staging
- [ ] Rollback: previous deployment + migrate resolve plan understood
- [ ] Monitoring: auth rate-limit warnings, 429/503 rates, Stripe/Resend errors

---

## 10. Final readiness recommendation

### **CONDITIONALLY READY**

**Why not READY:** SEC-004 runtime validation and env isolation may still need operator evidence; residual M06/M09/L01/L04; staging deploy of SS-SEC-006/007 not automatic.

**Why not NOT READY:** Critical account-takeover (C01) and password-policy gap (H02) are verified closed; H03/M01–M03/M07 closed in SS-SEC-007; Auth.js/Next patches in SS-SEC-006; tenant isolation regressions covered by automated tests; durable abuse controls exist in code.

**Commercial use stance:** Suitable to proceed toward production **after** completing §9 blockers (especially SEC-004 migrate/validate, env isolation, Auth.js triage/acceptance). Do not treat H01/H04 as “done in production” until the bucket table exists on the production Neon database and staging checklist is green.

---

## Appendix A — Count summary (completion board)

| Metric | Value |
| --- | --- |
| Total original SEC-001 findings | **18** |
| Verified remediated (C01, H02, H03, M01–M03, M07, M08) | **8** SEC-001 (+ Phase 1 isolation set) |
| Awaiting validation (H01, H04 / SEC-004 ops) | **2** |
| Partially remediated (M04, M06, L05) | **3** |
| Still open (M09, L01, L04) | **3** |
| Requiring risk acceptance (M05, L02, L03) | **3** |
| Production readiness | **CONDITIONALLY READY** |

## Appendix B — Next actions (await review)

1. Owner: execute staging SEC-004 migrate + manual checklist; record evidence in SEC-004 doc.
2. Owner: confirm Vercel/Neon env isolation; sign accepted risks.
3. Owner: deploy/validate SS-SEC-006 + SS-SEC-007 on staging (see SEC-006/007 docs); then residual M06/M09 plan.
