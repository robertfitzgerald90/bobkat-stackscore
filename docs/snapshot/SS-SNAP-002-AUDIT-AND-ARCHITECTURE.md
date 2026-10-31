# SS-SNAP-002 — Technology Snapshot 2.0 Audit & Architecture

| Field | Value |
|-------|--------|
| Ticket | SS-SNAP-002 |
| Phase | Discovery and Architecture (**no implementation**) |
| Environment | Staging planning only |
| Production | **No changes authorized** |
| Date | 2026-10-30 |
| Status | Awaiting product-owner approval before implementation |

---

## 1. Current-state inventory

Verified against the repository (not assumed). Primary domain: `src/lib/technology-snapshot/`.

### 1.1 Public routes and entry points

| Path | Role |
|------|------|
| `/technology-snapshot` | Public page — `src/app/technology-snapshot/page.tsx` |
| `POST /api/v1/public/technology-snapshot` | Create lead + score — `src/app/api/v1/public/technology-snapshot/route.ts` |
| `POST /api/v1/public/technology-snapshot/[leadId]/continue-assessment` | Invitation / continue flow — `.../continue-assessment/route.ts` |

**Marketing entry points** (shared `TechnologySnapshotLink` → `/technology-snapshot`, optional `?prospectId=&campaignId=`):

- Assessment offer / Learn hero & conversion
- Assessment invitation hero, nav, final CTA
- Solutions & services landings
- `SERVICES_CTA_DESTINATIONS.snapshot` (`src/lib/services/cta.ts`)
- Website-lead confirmation email CTA (mentions Snapshot; not Snapshot-owned send)

Auth allowlist: `src/lib/auth/auth.config.ts` (`/technology-snapshot`, `/api/v1/public/technology-snapshot`).

### 1.2 Questionnaire structure

| Item | Implementation |
|------|----------------|
| Catalog | `src/lib/technology-snapshot/questions.ts` |
| Count | **8** questions — one per StackScore maturity pillar |
| Answer scale | `yes` (3) / `partially` (2) / `unsure` (1) / `no` (0) |
| Wizard phases | Intro → contact intake → IT management qualifier → 8 questions → results |
| Step math | `SNAPSHOT_TOTAL_STEPS = 10` (intake + qualifier + 8); intro is extra |
| Est. time constant | `SNAPSHOT_ESTIMATED_MINUTES = 5` |

**Current questions (verbatim):**

1. **Identity & Access** — Do employees use multi-factor authentication when accessing company systems?
2. **Endpoint Management** — Are company devices regularly patched, monitored, and protected?
3. **Network & Connectivity** — Is your network equipment current, documented, and reliable?
4. **Data Protection & Recovery** — When was the last time your business successfully tested restoring data from backup?
5. **Productivity & Collaboration** — Are your email, file sharing, and collaboration tools organized and easy for employees to use?
6. **Security Operations** — Does your business actively review alerts, vulnerabilities, or suspicious activity?
7. **Documentation & Knowledge** — Could another trusted IT professional support your environment if your current IT contact was unavailable?
8. **Technology Strategy** — Does your business have a documented technology roadmap or budget plan?

**Intake fields:** firstName (required in UI), lastName optional, companyName, email, phone optional, industry, companySize optional, `itManagementModel` (not scored).

### 1.3 Scoring / classification

| File | `src/lib/technology-snapshot/scoring.ts` |
|------|------------------------------------------|
| Max score | **24** (`SNAPSHOT_MAX_SCORE` in `display.ts`) |
| Total | Sum of answer points across all catalog questions |
| Bands | ≥21 `healthy`; ≥15 `needs_attention`; ≥8 `elevated_risk`; else `immediate_action` |
| Lowest pillars | Lowest 3 by points (name tie-break) |
| Observations | Deterministic lookup `PILLAR_OBSERVATIONS[pillar][answer]`; empty for `yes`; max 3 |
| Entry | `buildSnapshotResult(answers)` |

IT management model does **not** affect score.

### 1.4 Results generation (public UI)

| Component | Path |
|-----------|------|
| Wizard | `src/components/technology-snapshot/technology-snapshot-wizard.tsx` |
| Progress | `src/components/technology-snapshot/snapshot-progress.tsx` |
| Results shell | `src/components/technology-snapshot/snapshot-results-view.tsx` |
| Result card | `src/components/snapshot/snapshot-result-card.tsx` |

Public results show: company name, **0–24 numeric score**, classification label, summary, up to 3 observations. API also returns `lowestPillars`, but the public card **does not render** a pillar breakdown.

Primary conversion today:

- Default: link to `/assessment-offer` (purchase)
- Invitation flow (`prospectId` / `campaignId`): `continue-assessment` → generic “check your email” message (SEC-hardened; no tokens in JSON)

**Consultation booking is not wired on Snapshot results** (Cal.com exists in `SERVICES_CTA_DESTINATIONS.generalConsultation`; `trackSnapshotConsultationClick` exists but is unused).

### 1.5 Lead capture and persistence

**Model:** `TechnologySnapshotLead` (`prisma/schema.prisma`)

| Group | Fields |
|-------|--------|
| Contact | `contactName`, `firstName`, `lastName`, `companyName`, `email`, `phone`, `industry`, `companySize`, `itManagementModel` |
| Payload | `answers` (Json), `totalScore`, `classification`, `lowestPillars` (Json) |
| Pipeline | `status`, `prospectId?`, `clientId?`, consent/timestamps |
| Notes | `TechnologySnapshotLeadNote` |

**Not persisted:** `observations` / executive summary text (rebuilt for admin via `buildSnapshotResult`).

**Create path:** Zod `createSnapshotLeadSchema` → `createTechnologySnapshotLead` (`service.ts`) → Prisma create. Optional `prospectId` updates `prospect.lastContactAt`.

**WebsiteLead** is a **separate** model (`source` may be `TECHNOLOGY_SNAPSHOT` for other ingress); public Snapshot wizard writes **`TechnologySnapshotLead`**, not `WebsiteLead`.

### 1.6 Administrative integrations

| Surface | Path |
|---------|------|
| List | `/snapshot-leads` — `src/app/(dashboard)/snapshot-leads/page.tsx` |
| Detail | `/snapshot-leads/[id]` |
| UI | `src/components/admin/snapshot-leads-management.tsx`, `snapshot-lead-detail-view.tsx`, actions, delete dialog |
| Service | `src/lib/technology-snapshot/lead-admin.ts`, `lead-deletion.ts` |
| Hub / CC | Leads hub + Command Center snapshot stats |

**Admin APIs** (`requireAdmin`): list, get/patch/delete, notes, send-invitation, convert-preview, convert.

Capabilities already present: status workflow, notes, mailto helpers, assessment invitation, convert to Client / provision invite workspace, delete with converted-lead guards + audit.

### 1.7 Email notifications

| Event | Email? |
|-------|--------|
| Snapshot submit | **No** outbound email today |
| Public continue-assessment | Yes — activation / assessment-ready (token only in email) |
| Admin send invitation | Yes — assessment invitation campaign |
| Admin mailto | Client-side compose only |

### 1.8 Consultation booking

**Absent** from Snapshot results UI. Cal.com free consult URL is available elsewhere in marketing CTAs.

### 1.9 Existing tests

| Area | Paths |
|------|-------|
| Domain | `tests/technology-snapshot/{scoring,schemas,contact-helpers,lead-deletion}.test.ts` |
| Security | `tests/auth/continue-snapshot-security.test.ts`, rate-limit coverage in `tests/auth/rate-limit.test.ts` |
| Layout / routing | `tests/layout/technology-snapshot-layout.test.ts`, critical-routes, route-registry |

### 1.10 Security controls (verified)

| Control | Detail |
|---------|--------|
| Public allowlist | Page + public API prefixes in `auth.config.ts` |
| Admin isolation | Clients redirected away from `/snapshot-leads` |
| Create rate limit | `snapshot_create_ip`: **10 / 15 min**, fail-closed |
| Continue rate limit | IP **5 / 15 min** + lead **3 / 1 hour**, fail-closed |
| Continue response | Generic `{ ok, message }` only (SS-SEC-002) |
| Validation | Zod on create / admin mutations |
| Consent | Copy in `SNAPSHOT_CONSENT_TEXT`; wizard posts `contactConsent: true` without an interactive checkbox |
| Delete | Blocked when converted / linked client / purchased / prospect-linked client |

---

## 2. Existing functionality assessment

### Reuse (keep and extend)

- `TechnologySnapshotLead` + notes + admin CRM (status, invite, convert, delete policy)
- Deterministic scoring pattern (`buildSnapshotResult`) and Zod public create contract
- Rate limits and continue-assessment security model
- Attribution query params (`prospectId` / `campaignId`)
- Pillar taxonomy alignment with maturity pillars (`TechnologyPillarCode`)
- Public marketing shell / CTA destinations for assessment + Cal.com
- Analytics hooks (`trackSnapshotStart`, assessment CTA) — restore consultation tracking when CTA returns

### Improve

- Visitor UX and visual system (card-heavy wizard → StackScore 2.0 instrument / marketing tokens)
- Results depth: category cards, strengths, risks, next steps — not only a 0–24 number + 3 bullets
- Copy that blurs Snapshot vs **Official StackScore** (wizard footer “Powered by … StackScore”; benefits list “Complete Technology Maturity Score”)
- Explicit marketing consent control
- Persist generated findings for admin review (today observations are ephemeral)
- Wire consultation + demo + purchase CTAs on results
- Optional results email on submit (product decision)
- Render category / pillar insights publicly (API already has `lowestPillars`)

### Remove or retire (conceptually — after approval)

- Presenting Snapshot total as a peer to Official StackScore
- Hardcoded consent-without-choice
- Dead consultation analytics without CTA
- Reliance on generic “scratches the surface” card as the only results experience

### Explicit non-goals (preserve)

- Snapshot answers must **not** auto-fill the full 80-question assessment (existing product rule; see `docs/STACKSCORE_PRODUCT_DISCOVERY.md`)
- No Official StackScore from Snapshot alone
- No production deploy in this ticket

---

## 3. Proposed visitor journey

**Target:** ~5 minutes. Flow:

```text
Welcome → Business Profile → Questions → Results → Next Steps
```

| Step | Purpose | Friction |
|------|---------|----------|
| **Welcome** | Brand, what Snapshot is / is not, time estimate, privacy one-liner | Single primary CTA: Start |
| **Business Profile** | Company + contact + light context (size, industry, IT model) | Required: name, email, company, industry, consent |
| **Questions** | 14 guided items in 4 categories (progress by category) | One question per view; Yes / Partially / Unsure / No |
| **Results** | Interactive indicative dashboard (deterministic) | Instant; no login required for same-session results |
| **Next Steps** | Consult / purchase assessment / demo | Clear hierarchy; no false equivalence to Official StackScore |

**Same-session persistence:** Keep client wizard state; submit once at end of questions (current model). Optional: soft-save draft in `sessionStorage` only (no server draft) to survive refresh mid-flow — open decision.

**Invitation flow:** Preserve `prospectId` / `campaignId`; results emphasize continue / purchase paths already used by invitation.

---

## 4. Proposed question set

### 4.1 Design principles

- Language for **business owners**, not IT specialists
- Each answer maps to a transparent point value (same 0–3 scale)
- Questions group into **four visitor categories** while optionally tagging an internal pillar code for engine reuse
- **14 questions** balances coverage vs ~5-minute completion (within 12–16)

### 4.2 Answer choices (unchanged scale)

| Value | Label | Points |
|-------|-------|--------|
| `yes` | Yes | 3 |
| `partially` | Partially / Somewhat | 2 |
| `unsure` | I'm not sure | 1 |
| `no` | No | 0 |

Rationale: Keep existing scoring math and admin familiarity; relabel “Partially” help text in UI as “Somewhat / in some areas.”

### 4.3 Catalog v2 (proposed)

#### Category A — Security & Access (4)

| ID | Question (owner-friendly) | Internal pillar tag | Rationale |
|----|---------------------------|---------------------|-----------|
| A1 | Do people use an extra login step (like a code on their phone) when signing into important company systems? | `identity_access` | MFA; rewrite of current Q1 |
| A2 | When someone leaves the company, are their system logins turned off promptly? | `identity_access` | Offboarding gap owners understand |
| A3 | Does anyone regularly look at security alerts or “something looks wrong” notices for your systems? | `security_operations` | Rewrite of current Q6 |
| A4 | Are shared passwords (shared inboxes, Wi‑Fi, vendor portals) avoided or carefully controlled? | `identity_access` | Common SMB risk; nontechnical |

#### Category B — Devices & Infrastructure (4)

| ID | Question | Pillar tag | Rationale |
|----|----------|------------|-----------|
| B1 | Are company computers and phones kept up to date with security updates? | `endpoint_management` | Rewrite of current Q2 |
| B2 | Can employees work reliably (internet, VPN, office Wi‑Fi) without frequent outages? | `network_connectivity` | Business impact of network |
| B3 | Are email, files, and chat tools organized so people know where work belongs? | `productivity_collaboration` | Rewrite of current Q5 |
| B4 | Do you know who is responsible day-to-day when a computer or network issue happens? | `documentation_knowledge` | Ownership clarity (pairs with IT model) |

#### Category C — Data Protection & Recovery (3)

| ID | Question | Pillar tag | Rationale |
|----|----------|------------|-----------|
| C1 | Is important company data backed up automatically (not only on someone’s laptop)? | `data_protection_recovery` | Existence of backups |
| C2 | Has your business successfully restored files from backup in the last year (a real test, not just “we think it works”)? | `data_protection_recovery` | Rewrite of current Q4 |
| C3 | If ransomware locked your files tomorrow, do you have a clear plan for how you’d recover? | `data_protection_recovery` | Continuity framing |

#### Category D — Technology Planning (3)

| ID | Question | Pillar tag | Rationale |
|----|----------|------------|-----------|
| D1 | Does leadership have a simple written plan for technology priorities and spend this year? | `technology_strategy` | Rewrite of current Q8 |
| D2 | Could another trusted IT person take over support using your notes/passwords/docs if your usual contact disappeared? | `documentation_knowledge` | Rewrite of current Q7 |
| D3 | Do you review technology needs when the business changes (new location, new software, growth)? | `technology_strategy` | Cadence / intentionality |

**Business profile (not scored as posture questions):** first/last name, company, email, phone optional, industry, company size, IT management model (keep enum), **required** marketing consent checkbox.

**Coverage check:** Security & access ✓ · Devices & infrastructure ✓ · Data protection ✓ · Planning ✓ — with 14 items ≈ 15–20 seconds each + profile ≈ 5 minutes.

---

## 5. Results classification methodology

### 5.1 Naming rules (mandatory)

| Term | Allowed on Snapshot? |
|------|----------------------|
| Indicative technology posture / Snapshot posture | Yes |
| Category classification (e.g. Strong / Mixed / At risk) | Yes |
| **Official StackScore** | **No** |
| Implication that Snapshot = full assessment | **No** |
| Numeric 0–24 shown as “your StackScore” | **No** |

Recommend showing category classifications and an overall **posture band** with plain-language labels. Optionally show a small “Snapshot index (0–42)” for transparency *only* with explicit “not an Official StackScore” disclaimer — **open decision** (see §13). Default proposal: **hide raw total** on public UI; keep raw total in admin/DB for sorting.

### 5.2 Deterministic scoring (proposed)

Reuse point scale. Max = **14 × 3 = 42**.

**Overall posture** (thresholds proportional to today’s 24-point bands):

| Band key | Condition | Public label (proposed) |
|----------|-----------|-------------------------|
| `strong_foundation` | ≥ 37 (~87%) | Strong foundation |
| `mixed_signals` | ≥ 26 (~62%) | Mixed signals |
| `notable_gaps` | ≥ 14 (~33%) | Notable gaps |
| `urgent_attention` | < 14 | Urgent attention needed |

Map from legacy keys for migration: healthy→strong_foundation, needs_attention→mixed_signals, elevated_risk→notable_gaps, immediate_action→urgent_attention.

**Category score:** average (or sum) of questions in category → same four band cutoffs on that category’s max.

**Per-category card content (rule-based, not LLM):**

| Field | Rule |
|-------|------|
| Classification | Category band from points |
| Brief explanation | Fixed copy template per category × band |
| Biggest strength | Highest-scoring question in category with answer ∈ {yes, partially}; else “No clear strength signaled in this area” |
| Biggest concern | Lowest-scoring question in category with answer ∈ {no, unsure, partially}; prefer `no` then `unsure` |
| Suggested next step | Fixed next-step catalog keyed by (category, concern question id, answer) |

**Key findings:**

| Finding | Rule |
|---------|------|
| Strongest area | Highest category score (name tie-break) |
| Most significant potential risk | Lowest category score; if tie, prefer Data Protection then Security |
| Three prioritized opportunities | Lowest three questions overall (by points, then severity weight: C2/C3/A1 before soft items); map to opportunity titles from a static catalog |

**Integrity:** Every finding must cite `questionId` + `answer` + `points` in the persisted payload so admins can audit. No generic “your industry typically…” claims.

### 5.3 Persisted result payload (proposed shape)

```ts
{
  catalogVersion: "snap-2.0",
  scoredAt: string, // ISO
  overall: { points: number; max: number; band: string; summary: string },
  categories: Array<{
    id: "security_access" | "devices_infrastructure" | "data_protection" | "technology_planning";
    points: number; max: number; band: string;
    explanation: string;
    strength: { questionId: string; text: string } | null;
    concern: { questionId: string; text: string } | null;
    nextStep: string;
  }>,
  keyFindings: {
    strongestCategoryId: string;
    highestRiskCategoryId: string;
    opportunities: Array<{ questionId: string; title: string; why: string }>; // len ≤ 3
  }
}
```

Engine module (proposed): `src/lib/technology-snapshot/engine/` — pure functions, fully unit-tested (extend `tests/technology-snapshot/`).

---

## 6. Dashboard wireframe description

**Visual system:** Purple-first, dark charcoal, marketing tokens (`src/lib/marketing/tokens.ts`), CornerBrackets / instrument accents (`src/components/design-system/instrument/*`), existing typography — **not** a new design system; **not** legacy green dashboards.

### Layout (single column, mobile-first)

1. **Header strip** — Bobkat / StackScore brand mark; eyebrow: “Free Technology Snapshot”; disclaimer chip: “Indicative posture — not an Official StackScore.”
2. **Snapshot Overview** — Company name; completion date; overall posture badge + 2–3 sentence executive summary (from band template + company name interpolation only).
3. **Technology Categories** — Four interactive cards (accordion on mobile; expand-in-place on desktop). Expanded state shows classification, explanation, strength, concern, next step.
4. **Key Findings** — Three blocks: strongest area · highest risk · prioritized opportunities (list of three).
5. **Next Steps (conversion)** — Primary: Book free consultation (Cal.com). Secondary: Purchase full Technology Maturity Assessment (`/assessment-offer`). Tertiary: Explore interactive demo (`/demo`). Invitation flow may swap secondary for continue-assessment email path.
6. **Footer note** — Consent reminder + link to privacy; “Official StackScore requires a completed assessment.”

### Motion

Subtle section reveal (existing `OfferReveal` pattern) and card expand; respect `prefers-reduced-motion`.

### Accessibility

Keyboard-expandable category cards; focus management; contrast on purple/charcoal; do not convey status by color alone (include text labels).

---

## 7. Design integration (reuse map)

| Need | Reuse |
|------|-------|
| Page chrome | `PublicPageShell`, `PublicMarketingNav`, marketing section tokens |
| Progressive disclosure | `OfferReveal` / existing wizard progress pattern (restyle) |
| Score / posture display | Adapt instrument score readout **with Snapshot labeling**, or marketing KPI card — never customer Official StackScore widget without disclaimer |
| Cards | Prefer soft marketing panels / feature cards over heavy shadcn Card stacks in hero results |
| Buttons | Existing `buttonVariants` / `MARKETING_BTN_*` |
| Admin | Keep current snapshot-leads admin; enhance detail to render `findingsJson` |
| Customer portal | **Do not** place Snapshot results inside authenticated Client Overview as Official score |

---

## 8. Data architecture & lead integration

### 8.1 Recommended approach

**Keep `TechnologySnapshotLead` as the system of record** for Snapshot submissions (already integrated with Prospect, Client convert, admin hub).

### 8.2 Schema changes (proposed — **do not migrate yet**)

| Change | Purpose |
|--------|---------|
| `catalogVersion String` | Distinguish v1 (8Q/24) vs v2 (14Q/42) |
| `findingsJson Json?` | Persist full deterministic results for admin + future email |
| `categoryScores Json?` | Optional denormalized category points/bands for filters |
| `consentMarketingAt DateTime?` | Explicit consent timestamp (clarify vs contactConsentAt) |
| `sourcePath String?` / `campaignId String?` | Attribution beyond prospectId |
| `resultsAccessToken Hash?` + expiry | Optional magic-link to re-open results (open decision) |

**Backward compatibility:** v1 leads remain readable; admin UI branches on `catalogVersion`. Scoring functions versioned (`buildSnapshotResult` v1 retained for old rows).

### 8.3 Lead rules

| Rule | Proposal |
|------|----------|
| Source identity | Snapshot submissions stay on `TechnologySnapshotLead`; status pipeline unchanged |
| Duplicates | **Allow multiple submissions per email** (new row each completion); admin list shows history by email; optional “related submissions” query — avoids silent merge bugs |
| Prospect link | Keep unique `prospectId` when present; if email matches existing Prospect without id param, **link if unambiguous** else create unlinked lead (open decision) |
| WebsiteLead | Do **not** dual-write by default (duplicate CRM noise). Optional future sync flag |
| Admin review | Detail page shows answers + findingsJson + posture |
| Consultation follow-up | Status `contacted` / `follow_up`; mailto + Cal.com UTM `?utm_source=technology_snapshot&utm_content={leadId}` |

### 8.4 What not to change without separate tickets

- Assessment scoring engines
- Stripe checkout
- Continue-assessment security contract (email-only secrets)

---

## 9. Security & privacy considerations

| Risk | Current | Recommendation for 2.0 |
|------|---------|------------------------|
| Public POST abuse | IP rate limit 10/15m fail-closed | Keep; consider fingerprint/soft CAPTCHA only if abuse rises |
| Input validation | Zod | Extend for new answers + consent required `true` |
| Bot / spam leads | Limited | Honeypot field + time-to-complete minimum (~20s); optional Turnstile later |
| Results IDOR | Results shown in-session from create response; `leadId` is UUID | Do **not** add public GET-by-id without token; if share links needed, use hashed one-time token |
| Cross-tenant | Admin-only list; no client portal Snapshot inbox | Preserve; never attach Snapshot findings to wrong Client without convert flow |
| Consent | Implied | Required checkbox; store timestamp; copy reviewed by ops |
| Email abuse | Continue + invite rate limited | Keep; if adding submit thank-you email, rate-limit per email |
| Data retention | No automated purge found | Document retention (e.g. archive after N months); delete policy already blocks converted |
| PII in analytics | GA4 events | Do not send answers/PII in event payloads |

---

## 10. Implementation phases

### Phase 1 — Questionnaire & business profile

**Depends on:** PO approval of question set + consent copy.  
**Deliver:** Catalog v2 module, wizard Welcome → Profile → Questions UX (staging), Zod schema v2, no results redesign yet (temporary score summary OK).  
**Accept:** 14 questions answerable in ~5 minutes on mobile; consent required; create API accepts v2 payload; v1 tests still pass via version branch.

### Phase 2 — Deterministic results engine

**Depends on:** Phase 1 catalog IDs stable.  
**Deliver:** Pure engine producing `findingsJson`; unit tests for bands, strengths, concerns, opportunities; golden fixtures.  
**Accept:** Same answers always same findings; no Official StackScore strings in engine output; admin can recompute from stored answers.

### Phase 3 — Interactive results dashboard

**Depends on:** Phase 2 payload contract.  
**Deliver:** Results UI per §6; marketing/instrument styling; CTAs: consult, assessment offer, demo; invitation continue path preserved.  
**Accept:** Desktop + mobile layouts; a11y expand/collapse; disclaimer visible; no legacy green dashboard.

### Phase 4 — Lead & administrative integration

**Depends on:** Phase 2 persistence fields (migration on staging).  
**Deliver:** Persist `findingsJson` + `catalogVersion`; admin detail renders findings; list filters by posture band; related-by-email optional.  
**Accept:** Staff can open a lead and see category cards / opportunities without re-running client UI; convert/invite/delete unchanged.

### Phase 5 — Conversion & notifications

**Depends on:** Phase 3 CTAs.  
**Deliver:** Cal.com UTM; restore consultation analytics; optional results email (if approved); copy audit vs Official StackScore.  
**Accept:** CTA destinations match marketing standards; no live Stripe purchase required for QA; email templates registered if used.

### Phase 6 — E2E testing & launch readiness

**Depends on:** Phases 1–5.  
**Deliver:** Extended Vitest + layout tests; staging smoke; security re-check (rate limit, continue-assessment, no public GET leak); PO visual QA.  
**Accept:** Staging GO checklist signed; **production still requires a separate release ticket**.

---

## 11. Acceptance criteria (program-level)

1. Visitor completes Welcome → Profile → Questions → Results → Next Steps in about five minutes.
2. Results are premium, interactive, and visually aligned with StackScore 2.0.
3. Findings are deterministic and explainable from answers; no fabricated company-specific claims.
4. Copy never presents Snapshot as Official StackScore or as equivalent to the full assessment.
5. Leads land in existing Snapshot Leads admin with answers + findings reviewable.
6. Conversion paths: consultation, full assessment purchase, demo — all present and correct.
7. Security controls (validation, rate limits, continue-assessment hardening) remain intact or stronger.
8. No production deployment under SS-SNAP-002 architecture ticket.

---

## 12. Open architectural decisions (PO input required)

| ID | Decision | Options | Recommendation |
|----|----------|---------|----------------|
| D1 | Show numeric Snapshot index on public UI? | Hide / show 0–42 with disclaimer | **Hide** raw number; show posture band only |
| D2 | Question count | 12 / 14 / 16 | **14** as proposed |
| D3 | Results email on submit | None / always / opt-in | **Opt-in** checkbox or none initially |
| D4 | Magic-link re-open results | In-session only / tokenized link | **In-session only** for v2.0 launch |
| D5 | Duplicate email policy | Always new row / upsert latest | **Always new row** + admin history |
| D6 | Auto-link Prospect by email | On / off | **Off** unless `prospectId` provided (safer) |
| D7 | CAPTCHA | None / honeypot / Turnstile | **Honeypot + timing** first |
| D8 | Persist v1 observations into findingsJson backfill | Yes / no | **No** backfill; only new completions |
| D9 | Wizard soft-save | sessionStorage / none | **sessionStorage** for answers only (not PII email until submit) — or none if simpler |
| D10 | Register this doc in DOC-000 | Yes when approved | Yes on approval |

---

## 13. Stop condition

This document is the SS-SNAP-002 deliverable for **audit and architecture only**.

**Do not begin implementation** until the product owner approves:

1. Visitor journey and question set  
2. Results methodology and disclaimer rules  
3. Schema change direction  
4. Open decisions D1–D10  

Implementation should proceed under follow-on tickets mapped to Phases 1–6 above, on **staging first**, with a separate production release authorization.
