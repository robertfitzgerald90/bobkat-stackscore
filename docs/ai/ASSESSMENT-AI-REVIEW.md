# Assessment AI Review: first release

## Scope and workflow

Admin-only AI analysis and roadmap **drafting** on a completed assessment's results page. This release does not change scoring, publish customer content, activate roadmaps, create projects, send communications, or expose customer chat.

1. An administrator opens completed assessment results and previews the allowlisted current source data.
2. Explicit provider-sharing confirmation plus that preview's SHA-256 fingerprint is required to generate. A changed fingerprint requires a fresh preview. Fingerprints recursively sort object keys so PostgreSQL JSONB storage does not invalidate them.
3. A short PostgreSQL transaction admits a durable queued review. `next/server` after() processes it after the 202 response, within a 120-second function duration; the provider request times out after 90 seconds.
4. A worker atomically claims the job. Provider output must pass Zod and evidence/dependency validation before it becomes a draft.
5. Admin edits the summary, findings, proposed initiative titles/phases/rationale/steps/completion evidence, assumptions and open questions, then saves and approves a revision.
6. Approval is internal and immutable. Regeneration creates another version. Review history and source snapshots are retained independently of the current assessment/plan.

No model tools or application execution are enabled. Evidence and notes are untrusted input. All generated text is rendered as React text/controlled field values, never model-supplied HTML.

## Configuration and deployment

- Apply the additive migration `20261118090000_ai_assessment_reviews` to an isolated preview database first. Existing Vercel build scripts run `prisma migrate deploy`; verify preview DATABASE_URL points to the preview Neon branch before deploying this branch.
- Generate Prisma Client with the updated schema.
- Add `OPENAI_API_KEY` as a server-only deployment secret. Do not use a NEXT_PUBLIC variable or paste it into source, logs, screenshots, or chat.
- Set `OPENAI_ASSESSMENT_MODEL` to a Responses/Structured Outputs compatible model available to your API project. The model is required rather than silently defaulted; select a currently supported model and pin its version where available after evaluation.
- Set `AI_ASSESSMENT_REVIEW_ENABLED=true` only after setup and privacy review. The default is disabled. A missing flag/key/model returns a disabled admin card without querying the new table.
- Confirm the hosting plan supports a 120-second function duration and post-response after() execution. If it does not, keep disabled and move processReview to an authenticated queue worker before enabling.
- Set a provider-project spend budget/alerts. The application admits at most 20 retained generation records per rolling 24 hours across the installation, one active job per assessment, and a one-minute per-assessment regeneration cooldown. These are conservative first-release constants. Assessment deletion cascades its review history, so the record-count admission cap is not a substitute for provider-level budgeting.
- No live provider request was made during implementation. Automated provider/route/service/UI checks use mocked data and a dummy key. Real model quality, latency, token cost, and configured-project access require the activation checks below.

## Source data and evidence

The source is a generation-time immutable snapshot of stored assessment answers and scores, current linked question text, approved catalog-backed recommendations triggered by that assessment, recorded business context, and matching existing project/roadmap work.

Business context is an explicit allowlist: industry, employee count, primary business goal, highest technology priority, and technology vision. Client names/contact fields, billing records, assessment internal notes, staff identities, question admin notes and file attachments are omitted from the provider input. The provider request uses store:false, which is not a promise of zero retention; review provider abuse-monitoring and account data controls before enabling. Free-text response notes/evidence can still contain sensitive data, which the administrator must review before transmission. Evidence URLs are text only; no attachments or linked pages are fetched.

Recommendation-to-question evidence must be an explicit selected answer-option/recommendation-template link. Manual/consolidated recommendations without this mapping, unresolved/unpublished stub copy and already planned recommendations are not eligible for new proposed initiatives. This conservative limitation can produce an empty roadmap; it must not be "fixed" by guessing evidence links. Add explicit evidence mapping in a future iteration if coverage requires it.

Every finding references actual question IDs. Every initiative references an eligible recommendation and only its supporting question IDs. Duplicate/foreign references, duplicate initiatives, existing work, missing dependencies, later-phase prerequisites and cycles are rejected. Strict JSON structure does not prove semantic correctness; administrators must verify factual support and practicality.

Official scores always come from the scoring engine. The model output schema has no score, price, date, owner or publication fields. Prompt instructions prohibit inventing those facts, but human review remains necessary for unsupported claims in narrative text.

## State, concurrency, recovery and audit

States: queued -> generating -> draft -> approved, or queued/generating -> failed. A partial unique PostgreSQL index permits only one active job per assessment. Job claims and worker writes use compare-and-set status guards.

Saved edits require a matching revision and draft status. Approval uses a serializable transaction, re-reads current source context and rejects a changed fingerprint. Already approved versions cannot be edited. Source snapshots are never overwritten when editing a draft. Model, prompt version, creator, approver, timestamps, revisions, input hash and token usage are stored with each review.

All routes require a verified admin session before reading source data. Customer and technician sessions receive 403. Review selection is scoped to the assessment and its client. Browser mutation origins/content types are checked, and GET output uses private/no-store caching.

Post-response execution is not a guaranteed durable queue. If a process is terminated before completion, queued/generating records older than ten minutes are marked failed when the admin reloads or generates again. The administrator can explicitly regenerate; no automatic model retry spends more money. The old worker cannot overwrite a failed record. For larger volume, use a proper durable job runner with leases and bounded retries rather than extending after().

Provider refusals, incomplete results, non-2xx responses, timeouts and validation errors fail closed. Error codes are sanitized. Raw provider messages, API keys and assessment content are not logged. A failed run never modifies assessment/roadmap data. Failed drafts count toward admission limits.

## Activation and evaluation checklist

1. Preview database migration succeeds and the disabled feature leaves existing pages unchanged.
2. With the feature configured, verify customer/technician sessions cannot read or generate reviews, including another client's assessment IDs.
3. Test paid/free/internal **admin** assessments: generation is an internal admin capability, not a customer entitlement.
4. Test high-risk, mature, sparse/incomplete-context and already-planned assessment fixtures. Verify source minimization, evidence coverage, no duplicated work, missing-data questions and sensible sequencing.
5. Include adversarial response notes (instructions to change scores, reveal secrets, or publish content); confirm no tools/actions are available and inspect draft content for misleading claims.
6. Exercise timeout, refusal, invalid schema/provenance, stale inputs, concurrent edits and interrupted-worker recovery. Confirm saved edits survive failed requests.
7. Review authenticated desktop/mobile layout, keyboard navigation and long evidence strings. Automated UI tests are not a substitute for a real browser review.
8. Record acceptance/rejection reasons, unsupported claims per draft, review time, source coverage, latency and token usage. Approve a model/prompt revision based on these cases before customer-facing use.

## Customer advisor: next stage

Reuse only an intentionally published, customer-safe review and the customer's approved plan/project data. Internal approval in this release is not publication and must not grant chat access.

A future customer route must re-check authenticated organization ownership, completed/published assessment eligibility, a fulfilled and paid qualifying assessment purchase (including refund/revocation handling), and a defined access period/usage allowance on every request. Never infer purchase eligibility from a completed assessment, cached UI state or a hardcoded $1,500 amount. Discounted purchases and product identity require the billing source of truth.

Before release, decide the included access duration and usage allowance. Proposed customer planning changes should remain drafts until explicitly confirmed, and must not rewrite approved initiatives or execution history. Evidence filtering must omit consultant-only trigger/catalog/internal metadata before exposing answers to customers.

## References

- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/models
- https://developers.openai.com/api/docs/guides/your-data

## Implementation validation

- 38 focused AI/UI/route-classification checks passed. Provider, database and job tests are mocked; they do not establish model quality or prove a live PostgreSQL migration.
- Prisma generation and schema validation passed. No migration was applied to a live database during implementation.
- Changed-file ESLint and production build passed, with pre-existing build warnings.
- Full suite: 1,048 passed, 4 failed. Remaining failures are pre-existing customer-project title filtering source expectations, two outdated customer-overview component expectations and a 5-second PDF timeout.
- Standalone TypeScript: the same 13 existing test-fixture errors; no errors in the new AI source/tests.
- Added the new admin API route to the security inventory and filled two pre-existing planner route classification omissions; the complete route inventory checks now pass.
- No live API generation, authenticated visual review, customer release or production deployment was performed. Activate only after the preview evaluation checklist above.
