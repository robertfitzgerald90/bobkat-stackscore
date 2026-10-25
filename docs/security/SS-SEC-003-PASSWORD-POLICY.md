# SS-SEC-003 — Password Policy Consistency & Enforcement

| Field | Value |
| --- | --- |
| Status | Remediated (code complete; not production-deployed) |
| Date | 2026-04-24 |
| Branch | `staging` |
| Addresses | **SEC-001-H02** |
| Related | [`SS-SEC-001-AUDIT.md`](SS-SEC-001-AUDIT.md), DOC-303 |

---

## Root cause

Password-setting paths used **inconsistent** validation:

| Path | Before |
| --- | --- |
| Account activation | Zod `min(10)` |
| Admin user create / update | Zod `min(10)` |
| Password-reset confirmation | **No length check** — any non-empty string was hashed |
| Reset password UI | HTML `minLength={8}` (weaker than server intent) |

DOC-303 requires a **minimum of 10 characters** with no complexity blocklist. Reset confirmation bypassed that policy server-side (SEC-001-H02).

---

## Password-setting entry points

| Entry point | Enforcement after SS-SEC-003 |
| --- | --- |
| `POST /api/v1/public/activate-account` → `activateAccount` | Shared `passwordSchema` + `hashPassword` |
| `PUT /api/v1/public/password-reset` → `confirmPasswordReset` | `assertPasswordMeetsPolicy` **before** token lookup; then `hashPassword` |
| `POST /api/v1/users` (admin create) | `createUserSchema` → `passwordSchema` → `hashPassword` |
| `PATCH /api/v1/users/[id]` (admin password set) | `updateUserSchema` → `optionalPasswordSchema` → `hashPassword` |
| Login credentials | Unchanged — verifies existing hashes only (`min(1)` on submit) |
| System placeholder hashes (`createPlaceholderPasswordHash`) | Unchanged — not a user-chosen password path |

No schema migration. Existing `passwordHash` values remain valid; users are not forced to reset.

---

## Shared validation implementation

**Module:** `src/lib/users/password-policy.ts`

- `PASSWORD_MIN_LENGTH = 10`
- `PASSWORD_MIN_LENGTH_MESSAGE`
- `passwordSchema` / `optionalPasswordSchema` (Zod 4)
- `validatePassword` / `assertPasswordMeetsPolicy` — user-safe errors; **never** include the submitted password

**Gate:** `hashPassword` in `src/lib/users/password.ts` calls `assertPasswordMeetsPolicy` before bcrypt (cost factor **12** unchanged).

Reset confirmation validates policy **before** loading or marking the reset token, so invalid passwords cannot consume a valid token or update the user row.

---

## Files modified

| File | Change |
| --- | --- |
| `src/lib/users/password-policy.ts` | **New** shared policy |
| `src/lib/users/password.ts` | Policy gate in `hashPassword`; re-exports |
| `src/lib/users/schemas.ts` | Uses shared schemas |
| `src/lib/auth/activation.ts` | Shared schema + `hashPassword` |
| `src/lib/auth/password-reset.ts` | Assert policy before token use |
| `src/app/api/v1/public/password-reset/route.ts` | Clearer empty/required handling |
| `src/components/auth/reset-password-form.tsx` | Client min length 10 + messaging |
| `src/components/auth/activate-account-form.tsx` | Shared constants |
| `tests/auth/password-policy.test.ts` | **New** TM-H02 coverage |
| `docs/security/SS-SEC-001-AUDIT.md` | H02 marked remediated |
| `docs/security/SS-SEC-003-PASSWORD-POLICY.md` | This report |

---

## Tests added

`tests/auth/password-policy.test.ts`:

- TM-H02-a — short passwords rejected  
- TM-H02-b — exactly 10 characters accepted  
- TM-H02-c — activation rejects short passwords without DB writes  
- Empty / non-string rejected  
- Errors omit submitted password  
- create/update user schemas aligned  
- Reset: short password does not touch token/user  
- Reset: 10-char password proceeds  
- `hashPassword` refuses short passwords; bcrypt 12 for valid ones  

---

## Validation results

| Check | Result |
| --- | --- |
| `npm test -- tests/auth/` | **Pass** (40 tests) |
| `npm test -- tests/auth/password-policy.test.ts` | **Pass** (11) |
| `npm run build` | **Pass** (`Compiled successfully`) |
| `npx tsc --noEmit` | Pre-existing failures in unrelated test files (documented historically); **no new errors in SEC-003 sources** after Zod 4 `error` param fix |

---

## Remaining risks

| Risk | Notes |
| --- | --- |
| No complexity / breach blocklist | Per DOC-303 MVP — intentional |
| No rate limiting on reset/activate | Still SEC-001-H01 / H04 |
| Frontend-only checks | Defense in depth only; server policy is authoritative |
| Login still accepts historically short hashes | Intentional — no forced reset of existing accounts |

---

## Staging smoke (manual)

1. Request password reset for a test user.  
2. Open reset link; submit 9-character password → expect policy error; token still usable.  
3. Submit 10-character password → success; sign in.  
4. Activation flow: short password rejected; 10+ accepted.  
5. Admin create user / reset password sheet: short password rejected by API.
