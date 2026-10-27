# SS-REL-005 — Resolve Staging Webhook Protection

| Field | Value |
| --- | --- |
| Status | **Investigation complete — awaiting operator authorization** |
| Date | 2026-10-26 |
| Branch | `staging` @ `bebfb77` |
| Related | [`SS-REL-004-STRIPE-INTEGRATION-VALIDATION.md`](SS-REL-004-STRIPE-INTEGRATION-VALIDATION.md) |
| Scope | Investigation + recommendation only — **no** protection changes, deploys, env mutations, or code shipped |

### Recommendation (short)

**Use Vercel Protection Bypass for Automation** with the **query-parameter** form on Stripe and Resend webhook URLs only.

There is **no path-specific Deployment Protection exception** in Vercel. That is why the operator cannot find a “webhook path only” toggle. Official docs explicitly support Stripe/Slack-style webhooks via `?x-vercel-protection-bypass=…` on **all plans**, with **no additional paid add-on** and **no application code changes** required for StackScore’s existing signature-verified handlers.

---

## 1. Root cause

Staging uses **Vercel Authentication** (Deployment Protection). Unauthenticated requests to `https://staging.stackscore.tech/...` — including `POST /api/webhooks/stripe` and `POST /api/webhooks/resend` — receive the Vercel login HTML instead of the Next.js route handlers (confirmed in SS-REL-004).

Stripe and Resend/Svix cannot present a Vercel session cookie and **cannot** attach Vercel’s preferred custom bypass **header**. They only call a configured HTTPS URL.

Production (`https://stackscore.tech`) is unaffected under typical **Standard Protection** (production domains remain public); this issue is **staging-only**.

---

## 2. Available Vercel protection features

Sources: current Vercel docs — [Bypass Deployment Protection](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection), [Protection Bypass for Automation](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation), [Deployment Protection Exceptions](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/deployment-protection-exceptions), [Trusted Sources](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/trusted-sources), [Automated & Agent Access](https://vercel.com/docs/deployment-protection/automated-agent-access).

| Feature | Path-specific? | Plan | Fits Stripe/Resend? |
| --- | --- | --- | --- |
| **Vercel Authentication / Standard Protection** | No (whole deployment/domain gate) | All plans | Blocks webhooks today |
| **Deployment Protection Exceptions** | **No** — unprotects an **entire preview/domain**, not a path | Documented “all plans” for exceptions UI | Would open **all** of staging if `staging.stackscore.tech` is excepted — not path-scoped |
| **Trusted Sources** | N/A | All plans | **No** — requires OIDC header `x-vercel-trusted-oidc-idp-token`; Stripe/Resend cannot issue it |
| **Protection Bypass for Automation** | Request-scoped (any path when secret presented) | **All plans** | **Yes** — header *or* `?x-vercel-protection-bypass=` (docs call out Stripe explicitly) |
| **`vercel.json` protection config** | N/A | — | **Not supported** — repo `vercel.json` only defines crons; protection is **dashboard** settings |

### Why the operator cannot find a “path exception”

Vercel does **not** offer “allow `/api/webhooks/*` only” under Deployment Protection. Community threads asking for path allowlists are directed to **domain Exceptions** or **Automation Bypass**, not path ACLs. Looking for a path toggle will not succeed on current product surface.

---

## 3. Recommended solution

### **Recommended: Option A′ — Protection Bypass for Automation (query parameter)**

Treat this as the practical “native” solution (Option A as originally framed assumed path exceptions; those **do not exist**).

| Criterion | Assessment |
| --- | --- |
| Security | Staging UI stays behind Vercel Auth; only requests that know the bypass secret clear the edge. **Stripe Signature** / **Resend Svix** still required by app code — bypass alone cannot forge paid fulfillment. |
| Complexity | **Minimal** — dashboard secret + update two webhook URLs. **No app code.** |
| Plan / cost | Available on **all plans**; **no** extra paid service. |
| Stripe + Resend | Officially documented for third-party webhooks that cannot set headers. |
| Production | Unchanged if Staging webhook endpoints only are updated. |
| Maintainability | Rotate secret in Vercel + Stripe/Resend dashboards; redeploy if `VERCEL_AUTOMATION_BYPASS_SECRET` injection must refresh (per Vercel docs when secret regenerated). |

### Exact operator configuration (no code)

1. Vercel → Project → **Settings → Deployment Protection**.
2. Enable / open **Protection Bypass for Automation**; create or copy a secret (optionally label e.g. `stripe-resend-webhooks`).
3. Note system env `VERCEL_AUTOMATION_BYPASS_SECRET` (do **not** commit it; do **not** put it in app source).
4. **Stripe Dashboard** (Bobkat IT **Sandbox** endpoint only), set destination to:

   `https://staging.stackscore.tech/api/webhooks/stripe?x-vercel-protection-bypass=<SECRET>`

5. **Resend** webhook URL (staging only):

   `https://staging.stackscore.tech/api/webhooks/resend?x-vercel-protection-bypass=<SECRET>`

6. Keep existing `STRIPE_WEBHOOK_SECRET` / `RESEND_WEBHOOK_SECRET` on Staging — signature verification is unchanged (body signing is independent of the query string).
7. Smoke: Stripe “Send test webhook” → expect JSON from Next.js (not Vercel login HTML). Same for Resend test ping if available.

**Do not** disable Deployment Protection for this milestone.  
**Do not** add the bypass secret to git, `vercel.json`, or application source.

### Query-string risk (acknowledged)

The bypass secret will appear in:

- Stripe / Resend dashboard URL fields  
- Possibly provider/CDN access logs  

**Mitigations:** restrict dashboard access; rotate secret if leaked; rely on **Stripe/Resend cryptographic verification** as the authorization boundary for business actions; never reuse staging bypass on production webhook URLs.

This tradeoff is the **documented Vercel pattern** for Stripe when path exceptions are unavailable.

---

## 4. Alternative solutions

### Option A — Native path exception

**Not available.** Domain-level **Deployment Protection Exceptions** only. Excepting `staging.stackscore.tech` would make the **entire** staging app public (login, APIs, admin UI paths reachable without Vercel Auth). Rejected as primary recommendation when the goal is to keep staging gated.

### Option B — Separate webhook receiver

Independently deployed service that verifies signatures then forwards to staging.

| Pros | Cons |
| --- | --- |
| Staging UI can stay fully gated without query secrets in Stripe | New project/service, env, deploy, ops; higher cost/complexity; must re-implement or carefully proxy raw bodies for signature verify; retry/idempotency duplication risk |

**Defer** unless query-param bypass is rejected on policy grounds.

### Option C — Local webhook forwarding

- Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Resend: local/dev webhook testing per Resend docs (or temporary tunnel)

| Pros | Cons |
| --- | --- |
| Excellent for **dev** fulfillment debugging against staging Neon | Does **not** prove Vercel staging delivery; not a substitute for sandbox→staging E2E |

**Keep as parallel developer workflow**, not the staging resolution.

### Option D — Other

| Idea | Verdict |
| --- | --- |
| Trusted Sources for Stripe IPs | **No** — Trusted Sources are OIDC callers, not IP allowlists for Stripe |
| Disable protection entirely | Works but exposes staging; **out of scope** / last resort |
| Host webhooks only on production domain | Blurs staging isolation; risk of staging test events hitting prod handlers if misconfigured — **not recommended** |

---

## 5. Required configuration changes

| Item | Change | Who |
| --- | --- | --- |
| Vercel Deployment Protection | Enable Protection Bypass for Automation; copy secret | Operator |
| Stripe Sandbox webhook URL | Append `?x-vercel-protection-bypass=…` | Operator |
| Resend staging webhook URL | Same query param | Operator |
| Staging `STRIPE_*` / `RESEND_WEBHOOK_SECRET` | Must already be set for handlers to succeed after edge allow | Operator (verify) |
| `vercel.json` | **None** | — |
| Application source | **None** for recommended path | — |
| Production webhook URLs | **Do not** add staging bypass secrets | Operator |

---

## 6. Required code changes (if any)

### Recommended path

**None.**

Existing handlers already:

| Route | Verification |
| --- | --- |
| `POST /api/webhooks/stripe` | Raw `request.text()` + `stripe.webhooks.constructEvent` + idempotency |
| `POST /api/webhooks/resend` | Raw body + Svix headers via `verifyResendWebhook` |

Bypass is evaluated at Vercel’s edge **before** the function runs; handlers continue to reject unsigned payloads.

### Only if Option B is later authorized

Would need a new receiver service, env for staging forward auth, careful raw-body forward, and staging ingest auth — **out of scope** until approved. Not sketched as an implementation PR here.

---

## 7. Security implications

| Requirement | How recommended approach satisfies |
| --- | --- |
| Does not expose staging auth routes by default | UI still Vercel-Auth gated; bypass secret required per request |
| Does not bypass app authorization | Session RBAC unchanged |
| Does not accept unsigned Stripe events | `constructEvent` still mandatory |
| Does not accept unverified Resend events | Svix verification still mandatory |
| Does not expose webhook signing secrets in git | Signing secrets stay in Vercel/Stripe/Resend; bypass secret only in dashboards |
| Does not allow arbitrary forward into staging | No forwarder; only edge bypass + existing routes |
| Does not affect production payments | Production URLs unchanged; sandbox endpoint only |
| Test events vs production DB | Staging Neon only if Staging env `DATABASE_URL` is correct (already a release prerequisite) |

**Residual risk:** Anyone with the bypass URL can hit staging HTTP **edge** (still must pass Stripe/Resend signatures for fulfillment). Treat bypass secret like an API key; rotate on leak.

---

## 8. Estimated implementation complexity

| Approach | Effort | Paid extras |
| --- | --- | --- |
| **Recommended (Automation Bypass + URL query)** | **~15–30 minutes** ops | **None** |
| Domain Exception (whole staging public) | ~15 minutes ops | None — but larger exposure |
| Option B separate receiver | Days + ongoing ops | Possible second project/hosting |
| Option C local only | Minutes per session | None — incomplete for staging proof |

---

## 9. Exact next steps (operator)

1. **Authorize** use of Protection Bypass for Automation with query params on **staging** Stripe/Resend webhook URLs (this doc’s recommended tradeoff).
2. In Vercel → **Deployment Protection** → create/copy **Protection Bypass for Automation** secret.
3. Update **Stripe Sandbox** webhook endpoint URL to include `x-vercel-protection-bypass` (staging host + `/api/webhooks/stripe` only).
4. Update **Resend** staging webhook URL similarly for `/api/webhooks/resend`.
5. Confirm Staging env has `STRIPE_SECRET_KEY` (`sk_test_…`), price IDs, `STRIPE_WEBHOOK_SECRET`, and `RESEND_WEBHOOK_SECRET`.
6. Send Stripe **test** event; confirm response is application JSON (`received: true` / error codes), not Vercel login HTML.
7. Resume **SS-REL-004** sandbox checkout testing checklist.
8. Optionally keep Stripe CLI local forward for developer iteration (Option C).

**Stop condition:** No further agent implementation until operator approves step 1 (and optionally rejects query-param approach in favor of Option B).

---

## 10. Can this be done without additional paid services?

**Yes.** Protection Bypass for Automation is documented on **all plans**. No new Vercel project, no webhook gateway SaaS, and no code deploy are required for the recommended path.

---

## Solution comparison (summary)

| Option | Recommended? | Why |
| --- | --- | --- |
| Path-only native exception | **N/A** | Feature does not exist |
| Domain Exception for staging | Possible but **worse exposure** | Entire staging becomes public |
| **Automation Bypass (query)** | **Yes** | Official, free, minimal, keeps UI gated |
| Trusted Sources | **No** | OIDC; Stripe/Resend incompatible |
| Separate receiver (B) | Only if policy forbids URL secrets | High complexity |
| Local CLI (C) | Supplement only | Not staging proof |
| Disable protection | Rejected for this milestone | Contradicts constraints |

---

## Appendix — Repo facts

- `vercel.json`: crons only (`/api/cron/communications`); **no** protection keys.
- Stripe handler: `src/app/api/webhooks/stripe/route.ts`
- Resend handler: `src/app/api/webhooks/resend/route.ts`
- SS-REL-004 preference to avoid query bypass is superseded here by **current Vercel product reality** and official Stripe webhook guidance; residual secret-in-URL risk is documented above for operator acceptance.
