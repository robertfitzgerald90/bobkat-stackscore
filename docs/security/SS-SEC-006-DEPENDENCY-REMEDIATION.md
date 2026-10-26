# SS-SEC-006 — Dependency Security Remediation

| Field | Value |
| --- | --- |
| Status | Implemented on `staging` (not production-deployed; not auto-committed) |
| Date | 2026-10-25 |
| Branch | `staging` |
| Related | [`SS-SEC-005-SECURITY-CLOSURE.md`](SS-SEC-005-SECURITY-CLOSURE.md) |
| Constraint | No `npm audit fix --force`; no Next.js 16 major; no Auth.js v4↔v5 channel change |

---

## 1. Original vulnerability inventory (production, before)

Fresh `npm audit --omit=dev` prior to remediation (SS-SEC-005 baseline):

| Severity | Count |
| --- | --- |
| Critical | **4** |
| High | **18** |
| Moderate | **7** |
| **Total** | **29** |

Priority packages called out in SS-SEC-005: `next-auth`, `@auth/core`, `next`, related production deps.

---

## 2. Dependency versions before and after

| Package | Before | After | Notes |
| --- | --- | --- | --- |
| `next-auth` | 5.0.0-beta.31 | **5.0.0-beta.32** | Same v5 beta channel |
| `@auth/core` (transitive) | 0.41.2 | **0.41.3** | Pinned by next-auth beta.32 |
| `next` | 15.5.19 | **15.5.28** | Same 15.5 maintenance line |
| `eslint-config-next` | 15.5.19 | **15.5.28** | Matched to Next |
| `sharp` | 0.34.5 (via next) | **^0.35.5** (direct) | Required for image-opt RCE advisory mitigation |
| `zod` | 4.4.3 | **4.6.7** | Same major; memory DoS advisory |
| `@prisma/client` | 7.8.0 | **7.10.1** | Same Prisma 7 major |
| `@prisma/adapter-pg` | 7.8.0 | **7.10.1** | Aligned |
| `prisma` (dev) | 7.8.0 | **7.10.1** | Aligned CLI |
| `shadcn` | production dependency | **devDependency** | CLI-only; not imported by app runtime |

No application source changes were required for Auth.js / Next / Zod / Prisma bumps.

---

## 3. Advisory disposition

### Direct / priority packages

| Advisory | Package | Installed before | Vulnerable range | Fixed | Exploit prerequisites | Used by StackScore? | Action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GHSA-7rqj-j65f-68wh | `@auth/core` / `next-auth` | 0.41.2 / beta.31 | `@auth/core` <0.41.3; next-auth ≤beta.31 | 0.41.3 / beta.32 | Email/magic-link provider + default normalizer | **No** email provider (Credentials only) | **Upgraded** (defense-in-depth) |
| GHSA-xmf8-cvqr-rfgj | `@auth/core` | 0.41.2 | <0.41.3 | 0.41.3 | Malformed Bearer to `getToken()` | Possible if JWT helpers used; middleware uses `auth()` | **Upgraded** |
| GHSA-x445-f3h2-j279 | `@auth/core` | 0.41.2 | <0.41.3 | 0.41.3 | OAuth multi-provider cookies | **No** OAuth providers | **Upgraded** |
| GHSA-8fpg-xm3f-6cx3 | `next-auth` v5 | beta.31 | ≤beta.31 | beta.32 | Provider config errors → fail-open auth checks | Middleware uses authConfig | **Upgraded** |
| GHSA-p3m5-59mp-jv5r / CVE-2026-94482 | `next` | 15.5.19 | ≤15.5.27 | 15.5.28 | App Router **with ≥1 Server Action** | **No** Server Actions | **Upgraded** |
| GHSA-2464-fhr4-w9xw | `next` / `sharp` | next 15.5.19 + sharp 0.34.5 | ≤15.5.27; sharp <0.35.5 | 15.5.28 + sharp ≥0.35.5 | Image Optimization + SVG on glibc Linux | Possible if SVG optimization enabled | **Upgraded** next + pin sharp |
| GHSA-673q-mjm6-r5xr (`use cache` RCE) | `next` | 15.5.19 | ≤15.5.27 | 15.5.28 | Cache Components / `use cache` typed arrays | Not used in StackScore patterns | **Upgraded** |
| GHSA-mrhx-c7xc-m3w5 | `zod` | 4.4.3 | <4.6.6 | ≥4.6.6 | Oversized constrained collections | Yes (API validation) | **Upgraded** |

### Transitive / tooling (selected)

| Advisory cluster | Package path | Disposition |
| --- | --- | --- |
| MCP / `proxy-addr` / express | via `shadcn` → `@modelcontextprotocol/sdk` | **Removed from production** by moving `shadcn` to `devDependencies` (CLI not imported in `src/`) |
| `mysql2` / `deepmerge-ts` / `@prisma/dev` / `hono` | via Prisma 7.8 tooling | **Cleared from prod audit** by Prisma **7.10.1** (outside advisory range ≤7.10.0) |
| `postcss` (nested under `next`) | `next` → `postcss` | **Remaining high** — `npm audit` suggests Next 16 (`audit fix --force`); **rejected** as major upgrade |
| `nanoid`, `source-map-js`, `fast-uri` | Transitive (build/tooling graphs) | **Remaining high** — not direct app APIs; no compatible pin without large fan-out |

---

## 4. Changes implemented

1. Bumped `next-auth` → `5.0.0-beta.32` (brings `@auth/core@0.41.3`).
2. Bumped `next` + `eslint-config-next` → `15.5.28`.
3. Added direct `sharp@^0.35.5` so Image Optimization uses patched libvips stack.
4. Bumped `zod` → `^4.6.7`.
5. Bumped Prisma client/adapter/CLI → `7.10.1` (same major).
6. Moved `shadcn` from `dependencies` → `devDependencies` (CLI packaging hygiene).
7. Regenerated Prisma client via postinstall / generate.

**Compatibility adjustments:** none required in application code. Credentials auth, JWT callbacks, RBAC helpers, SEC-003 password policy, SEC-004 rate limiter, and portal isolation paths unchanged.

---

## 5. Compatibility / architecture check

| Concern | Result |
| --- | --- |
| Credentials authentication | Preserved (no API break in beta.32) |
| Session / JWT callbacks | Preserved |
| RBAC / tenant isolation | Preserved (tests green) |
| Password reset / activation | Preserved |
| SEC-004 rate limiting | Preserved (tests green) |
| Prisma integration | Client regenerate succeeded on 7.10.1 |
| Next 16 major | **Not taken** (would be architectural channel change) |

---

## 6. Test results

| Check | Result |
| --- | --- |
| Auth tests (`tests/auth/`) | **65/65 passed** |
| Full suite | **619/619 passed** |
| ESLint | **0 errors** (32 pre-existing warnings) |
| `tsc --noEmit` | **27 errors** — same pre-existing test-file noise as SS-SEC-005 (not new regressions) |
| `npx next build` | **Succeeded** |
| Fresh `npm audit --omit=dev` | See §7 |

No functional regressions attributed to these upgrades.

---

## 7. Remaining vulnerabilities (production)

After remediation — `npm audit --omit=dev`:

| Severity | Before | After |
| --- | --- | --- |
| Critical | 4 | **0** |
| High | 18 | **4** |
| Moderate | 7 | **1** |
| **Total** | 29 | **5** |

Remaining **high**:

| Package | Why remaining | Risk to StackScore | Next step |
| --- | --- | --- | --- |
| `postcss` (via `next`) | Fix path pushes Next 16 | Build-time CSS toolchain; not a direct public API | Wait for Next 15.5 backport or plan Next 16 separately |
| `nanoid` | Transitive; audit fix may pull majors | DoS on non-secure generator misuse | Monitor; override only if safe pin exists |
| `source-map-js` | Transitive DoS via crafted source maps | Build/tooling exposure | Monitor |
| `fast-uri` | Transitive host-confusion class | Not used as StackScore HTTP client surface | Monitor; comes with Prisma/other graphs |

Remaining **moderate**: one residual (tooling). Full audit including **dev** still reports more issues under `shadcn`/Vitest graphs — acceptable for non-production install profiles.

---

## 8. Staging validation requirements

- [ ] Install on staging (`npm ci`) and confirm `next-auth@5.0.0-beta.32`, `next@15.5.28`, `@auth/core@0.41.3`, `sharp@0.35.x`.
- [ ] Smoke: login, logout, password reset request/confirm, account activation, client portal load.
- [ ] Smoke: staff dashboard + one PDF export (sharp/image path).
- [ ] Confirm Prisma client generate on staging build; no migrate required for this milestone (dependency-only).
- [ ] Re-run `npm audit --omit=dev` on staging CI/build image.

---

## 9. Rollback considerations

| Action | How |
| --- | --- |
| Revert package bumps | Restore prior `package.json` / lockfile from git; `npm ci` |
| Auth regression | Roll back `next-auth` to beta.31 only if beta.32 misbehaves (reintroduces Auth.js CVEs) |
| Next regression | Roll back to 15.5.19 + remove sharp pin (reintroduces Next/sharp advisories) |
| Prisma | Roll back trio to 7.8.0 and regenerate client |

Prefer rolling forward within 15.5.x / Auth.js beta.32 rather than reverting security patches unless a blocking production defect appears.

---

## 10. Release readiness impact

| Item | Status |
| --- | --- |
| SEC-005-DEP-01 (Auth.js critical) | **Remediated** in lockfile |
| SEC-005-DEP-02 (Next critical/high patch set) | **Remediated** on 15.5.28 + sharp 0.35.5 |
| Production critical CVE count | **0** |
| Remaining high (transitive / Next-bundled postcss) | Documented; not release-blocking if accepted |
| Auto-deploy / commit | **Not performed** |

This clears the dependency blockers called out in SS-SEC-005 for Auth.js and Next, subject to staging smoke validation before production promote.
