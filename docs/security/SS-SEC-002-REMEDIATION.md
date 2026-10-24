# SS-SEC-002 — Critical Account Activation Security Remediation

| Field | Value |
| --- | --- |
| Status | Remediated (code complete; staging validation pending) |
| Date | 2026-04-24 |
| Branch | `staging` |
| Addresses | **SEC-001-C01** (Critical), **SEC-001-M08** (Medium) |
| Prior audit | [`SS-SEC-001-AUDIT.md`](SS-SEC-001-AUDIT.md) |
| Deployed | **No** (do not auto-deploy) |

---

## Root cause

`POST /api/v1/public/technology-snapshot/[leadId]/continue-assessment` called `continueSnapshotToFullAssessment`, which:

1. Provisioned a client workspace and minted an activation token.
2. Returned `activationUrl` (raw token in query string), `assessmentId`, and `clientId` to the unauthenticated caller.
3. For existing accounts, returned `loginUrl` and `assessmentId` without requiring inbox possession.

Anyone who obtained a Technology Snapshot `leadId` (returned from the public snapshot POST, or guessed) could complete account takeover for that lead’s email before the owner activated.

---

## Security controls implemented

| Control | Implementation |
| --- | --- |
| No raw tokens in public API | Continue endpoint returns only `{ ok: true, message }` |
| Email-only activation delivery | Fresh token emailed via `EMAIL-001` + `recordAndSendCommunication` |
| Inbox possession required | Activation URL only in outbound email to lead address |
| Existing-account anti-leak | Same public message; login/start links only in `LEGACY-ASSESSMENT-READY` email |
| Anti-enumeration | Identical public message for new vs existing accounts |
| Token at rest | SHA-256 hash in `AccountActivationToken`; fresh token per continue |
| Short-lived / single-use | Existing `activationTokenExpiresAt()` + `usedAt` on activate |
| Env-specific URLs | `buildActivationUrls` → `getAppUrl()` / `NEXT_PUBLIC_APP_URL` |
| Email failure | Throws generic error; **never** returns token on failure |
| Frontend | Shows “check your email” confirmation; ignores legacy sensitive response fields |

Provisioning and assessment association (`provisionInviteWorkspace`, lead status updates, campaign events) are preserved.

---

## Files modified

| File | Change |
| --- | --- |
| `src/lib/communications/outreach/convert-snapshot-to-assessment.ts` | Secure continuation: email delivery, generic public result |
| `src/lib/communications/outreach/continue-snapshot-messages.ts` | Shared public message (client-safe) |
| `src/app/api/v1/public/technology-snapshot/[leadId]/continue-assessment/route.ts` | Returns generic JSON only |
| `src/components/technology-snapshot/snapshot-results-view.tsx` | Confirmation UI instead of redirect to activation URL |
| `tests/auth/continue-snapshot-security.test.ts` | TM-C01-a/b/c + failure / route / hash tests |
| `tests/auth/activation-lifecycle.test.ts` | Expire, single-use, invalid, env URL base |
| `docs/security/SS-SEC-002-REMEDIATION.md` | This report |
| `docs/DOC-000 – Documentation Architecture & Index.md` | Index entry |

---

## Tests added

| Suite | Coverage |
| --- | --- |
| `tests/auth/continue-snapshot-security.test.ts` | TM-C01-a (no token in response), TM-C01-b (email-only delivery + hashed storage), TM-C01-c (no assessmentId), anti-enumeration, email failure, route handler, `issueFreshActivationToken` |
| `tests/auth/activation-lifecycle.test.ts` | Invalid / expired / used tokens; successful mark-used; `validateActivationToken`; env base URL |

Email transport is mocked (`recordAndSendCommunication`); no real customer email is sent in CI.

---

## Validation results

| Check | Result |
| --- | --- |
| `npm test -- tests/auth/` | Pass (including new SEC-002 suites) |
| `npm test -- tests/technology-snapshot/` | Pass |
| `npm test` (full suite) | Pass after env-URL test fix (see note) |
| `npx tsc --noEmit` | Pre-existing errors in unrelated test files; **no errors in SEC-002 source files** |
| `npm run build` | **Success** |

Note: An initial full-suite run failed one test that dynamically imported the heavy email template module (timeout). Replaced with a lightweight `getBaseUrl` assertion aligned with `buildActivationUrls`.

---

## Remaining risks (out of scope for SS-SEC-002)

| Risk | Ref | Notes |
| --- | --- | --- |
| No rate limit on continue / snapshot / login | SEC-001-H01 / H04 | Still open |
| Middleware excludes `/api` | SEC-001-H03 | Defense-in-depth |
| Password-reset min length | SEC-001-H02 | Unrelated |
| Orphan workspace if email fails after provision | — | User can retry continue; new token emailed. No token leak. |
| Console email fallback in local/dev | — | When `RESEND_API_KEY` unset, send succeeds via console provider (dev only) |

---

## Staging validation instructions (manual)

1. Deploy or run this branch against **staging** only (not production).
2. Confirm staging `NEXT_PUBLIC_APP_URL` / `AUTH_URL` and `RESEND_API_KEY` / `EMAIL_FROM` are set.
3. Complete a Technology Snapshot in **invitation flow** (continue CTA visible).
4. Click **Continue to Full Assessment**.
5. Expect on-page message: *Check your email for instructions to continue your assessment.* — **no** redirect to `/activate-account?token=…`.
6. Inspect Network tab: response body must be `{ ok: true, message: "…" }` only.
7. Open the lead inbox: activation email (`EMAIL-001`) with staging host in the link.
8. Activate via email link; confirm assessment workspace loads.
9. Repeat with an email that already has an active client account: same public UI/API message; inbox receives assessment-ready / login email (no assessment id in API).
10. Optionally force Resend failure (invalid key on a scratch env): API returns send error **without** token fields.

---

## Rollback considerations

- Revert the four source files above (conversion service, message constant, route, snapshot results view) to restore prior behavior — **not recommended** (re-opens C01).
- Prefer forward fix if email delivery regresses: verify Resend/env, then retry continue (idempotent-ish; new activation token issued each successful provision path send).
- No database migrations were introduced; unused activation tokens may remain if email fails (harmless; expire via TTL).

---

## Completion criteria checklist

- [x] No unauthenticated response exposes activation tokens or private assessment identifiers
- [x] Activation requires control of the destination email inbox
- [x] Existing and new account responses do not permit account enumeration via continue API
- [x] Legitimate users can continue via emailed instructions
- [x] Automated regression tests pass
- [x] Application builds successfully
- [ ] Staging manual validation (operator)
- [ ] Production deploy (**not** performed)
