# SS-UX-009 — End-to-End Customer Experience Validation

**Branch:** `staging`  
**Date:** 2026-10-30  
**Scope:** SS-UX-002 → SS-UX-008 customer portal surfaces  
**Method:** Local Next.js (`http://localhost:3000`) against staging Neon + Vitest UX/auth suites + interactive browser (demo client).  
**Constraints honored:** Staging only; no production deploy; no migrations; no scoring/catalog/roadmap mutations; no real customer emails sent; assessment/recommendation data not modified.

Result classifications use only evidence from executed checks (browser, HTTP, DB/service reads, or automated tests). Code inspection alone is never marked **PASS**.

---

## 1. Environment verification

| Check | Result | Evidence |
| --- | --- | --- |
| Current branch `staging` | **PASS** | `git branch --show-current` → `staging` (tracks `origin/staging`) |
| Staging Neon (not production) | **PASS** | Local `.env` `DATABASE_URL` host `ep-patient-credit-…` / `neondb` — documented staging endpoint (prod historically `ep-autumn-wave-…`) |
| No production DB active in this session | **PASS** | Local app binds to staging Neon via `.env`; `AUTH_URL=http://localhost:3000` |
| No production deployment required/performed | **PASS** | Validation only; no Vercel production deploy |
| Fixtures intact (ABC / Pinnacle) | **PASS** | Read-only queries: ABC LLC + Pinnacle Engineering present with expected shapes |

---

## 2. Test matrix

| Area | Automated | Browser / live | ABC data | Notes |
| --- | --- | --- | --- | --- |
| Auth / session | Auth suite | Demo login/logout | — | See §4 |
| Overview | ss-ux-002/004 | Demo desktop + mobile | Service DTO | See §5 |
| Explore | ss-ux-005 | Demo deep link | Service DTO | See §5 |
| Opportunities | ss-ux-006 | Demo empty state | Service counts | See §5 |
| Roadmap | ss-ux-007 (+ fix) | Demo | Service metrics | See §5–§9 |
| Reports | ss-ux-008 | Demo hub | Service DTO | See §5 |
| AuthZ isolation | api-client-isolation | Cross-tenant URL | — | See §6 |
| Visual | ss-ux-003 | Desktop + mobile screenshots | — | See §7 |

**Vitest (this run):** `tests/ux/` **54/54 PASS**; auth/isolation/visibility suites **77/77 PASS**.

---

## 3. Browser validation results

**Account used:** dedicated staging demo `pinnacle.engineering.demo@bobkatit.com` (Pinnacle Engineering).  
**Not used:** ABC LLC portal login (real customer-linked mailbox — policy: dedicated test accounts only).

| Check | Result |
| --- | --- |
| Login → Overview landing | **PASS** |
| Primary nav Overview / Explore / Roadmap / Reports | **PASS** |
| Charcoal + phosphor identity + watermark visible | **PASS** |
| Mobile (390×844) Overview usable | **PASS** |
| Tablet viewport pass | **NOT TESTED** |
| Deployed Vercel staging URL | **BLOCKED** | Prior docs: Vercel Authentication gate; this run used local app + staging DB |

---

## 4. Authentication results

| Test | Result | Evidence |
| --- | --- | --- |
| Customer login (demo) | **PASS** | Browser signed in; landed on `/clients/{pinnacleId}/technology-profile` |
| Logout | **PASS** | NextAuth sign-out confirmation completed; returned to unauthenticated login |
| Forgot-password form | **PASS** | `/forgot-password` renders email + “Send Reset Link” |
| Forgot-password email send | **NOT TESTED** | Intentionally not submitted (no real outbound email in this validation) |
| Password reset confirm flow | **NOT TESTED** | Requires token from email |
| Registration | **NOT TESTED** | No new customer created (shared staging safety) |
| Customer onboarding wizard | **NOT TESTED** | Demo already onboarded |
| Session handling (post-login routes) | **PASS** | Authenticated navigation across Overview/Explore/Roadmap/Reports |
| Activation page link present | **PASS** | Login shows Activate Account link (full activation path not re-run) |

Automated: password policy, activation lifecycle, rate-limit, continue-snapshot security — **PASS** (suite).

---

## 5. Customer journey results

### Overview (SS-UX-004) — demo browser + ABC service

| Test | Result |
| --- | --- |
| Official StackScore shown | **PASS** (demo 100; ABC service **39**) |
| DOC-119 maturity | **PASS** (demo Optimized; ABC **Initial**) |
| Assessment completion date | **PASS** (demo “Latest completed assessment: Oct 26, 2026”) |
| Eight canonical pillars | **PASS** |
| Priority recommendations | **PASS** (demo empty state when none active) |
| Demonstrated strengths | **PASS** |
| Roadmap progress section + footnote | **PASS** |
| Next action | **PASS** |
| Responsive / equal-height pillars | **PASS** (desktop + mobile) |
| No projected maturity KPI | **PASS** |

### Explore (SS-UX-005) — demo browser + ABC service

| Test | Result |
| --- | --- |
| Eight-pillar selection | **PASS** |
| Pillar score + maturity | **PASS** |
| Evidence-based strength / weakness | **PASS** |
| Recommendation filtering (empty when none) | **PASS** |
| Complexity footnote | **PASS** |
| `?pillar=` deep link | **PASS** |
| Browser history | **NOT TESTED** (deep link open verified; back/forward not exercised this pass) |
| Mobile detail dialog | **NOT TESTED** (mobile Overview only) |

### Improvement Opportunities (SS-UX-006)

| Test | Result |
| --- | --- |
| Demo empty state | **PASS** |
| ABC deliverable count / statuses (service) | **PASS** (57 open; filters available in product) |
| Pillar/priority/status filters (UI) | **NOT TESTED** (demo has zero rows; ABC UI login skipped) |
| Deep links from Explore | **NOT TESTED** (no demo opportunities) |
| Roadmap relationships UI | **NOT TESTED** (requires ABC UI or fixture with links) |
| No projected StackScore guarantees | **PASS** (copy + DTO scan) |
| Visibility restrictions | **PASS** (visibility suites + deliverable count) |

### Roadmap (SS-UX-007)

| Test | Result |
| --- | --- |
| Executive summary | **PASS** (after fix: demo Official StackScore **100**) |
| Phase ordering / empty phases | **PASS** (demo: no customer-visible phases) |
| ABC initiative totals / 0% completion (service) | **PASS** (13 visible / 0% / draft / 3 phases) |
| Projects panel navigation | **PASS** |
| Consultation next action | **PASS** |
| Draft/empty handling | **PASS** |
| Phase Workspace navigation | **NOT TESTED** this pass (no visible demo phases) |
| Initiative status badge contrast | **PASS** (automated readability suite) |

### Reports (SS-UX-008)

| Test | Result |
| --- | --- |
| Demo reports hub sections | **PASS** |
| Latest assessment + history cards | **PASS** |
| View / Download PDF links present | **PASS** |
| Technology Progress Report card | **PASS** |
| Business reviews (entitled demo) | **PASS** |
| ABC latest report + PDF actions (service) | **PASS** |
| PDF bytes download end-to-end | **NOT TESTED** (links present; binary download not opened) |
| Empty states | **PASS** (guide + entitled empty patterns covered in suite/UI) |

---

## 6. Authorization results

| Test | Result | Evidence |
| --- | --- | --- |
| Customer A cannot open Customer B Overview | **PASS** | Logged-in Pinnacle navigating ABC `technology-profile` stayed on Pinnacle workspace |
| Cross-tenant recommendations URL | **PASS** | Same redirect/ownership behavior |
| Unauthenticated client route | **PASS** | HTTP **307** to auth |
| API client isolation | **PASS** | `tests/auth/api-client-isolation.test.ts` |
| Recommendation visibility fail-closed | **PASS** | visibility suites |
| Staff surfaces unchanged | **PASS** | Staff roadmap path still `RoadmapDashboard` + TIP (code path exercised by suite wiring; staff UI not re-browsed this pass → browser staff **NOT TESTED**) |

ABC PDF cross-tenant download as Pinnacle: **NOT TESTED** (would require hitting ABC assessment PDF URL while authenticated — recommended follow-up with dedicated second synthetic client).

---

## 7. Responsive validation

| Viewport | Result |
| --- | --- |
| Desktop ~1440 | **PASS** |
| Mobile 390×844 | **PASS** |
| Tablet ~768 | **NOT TESTED** |

Observations: watermark remains behind content; no horizontal overflow observed on Overview mobile; nav collapses to menu control.

---

## 8. Defects found

| ID | Severity | Reproduction | Root cause |
| --- | --- | --- | --- |
| D1 | **High** | Demo Roadmap showed Official StackScore **53** while Overview showed **100** | Customer roadmap summary used roadmap `baselineScore`, which can lag after reassessment |
| D2 | **Medium** | Overview Roadmap Progress **67%** vs Roadmap page **0%** (Pinnacle) | Overview falls back to journey heuristic when `initiativesTotal === 0`; Roadmap page shows initiative completion % |
| D3 | **Low** | Explore a11y tree lists pillar detail twice | Desktop panel + mobile dialog content both present in DOM |
| D4 | **Low** | Roadmap projects show “No linked recommendation title” | Fail-closed deliverable filter on linked recommendation (expected for stub/non-deliverable links) |

---

## 9. Defects fixed

| ID | Fix | Regression |
| --- | --- | --- |
| D1 | `getCustomerRoadmapExperience` now prefers technology-profile `overallStackScore` for the Official StackScore summary | `tests/ux/ss-ux-007-customer-roadmap-experience.test.ts` (+1); browser revalidated demo Roadmap → **100** |

No migrations, scoring changes, or roadmap engine mutations.

---

## 10. Outstanding issues

1. **D2** — Overview vs Roadmap progress % wording/math when customer-visible initiatives are empty (document for product decision; not changed here to avoid conflicting with SS-UX-005 journey fallback).  
2. **D3** — Explore dual detail markup for mobile/desktop.  
3. **ABC browser journey** — not exercised with portal login (real customer credential policy). Service-layer ABC regression used instead.  
4. **Registration / reset email / PDF binary / Phase Workspace / tablet** — remaining **NOT TESTED** items above.  
5. **Second synthetic client** — still recommended for stronger cross-tenant PDF/report download proofs.  
6. **Deployed staging HTTP** — **BLOCKED** by Vercel Authentication (unchanged).  
7. Next.js Dev Tools “1 Issue” badge appeared intermittently in local Turbopack — not treated as product defect without a customer-facing failure.

---

## 11. Production readiness assessment

| Acceptance criterion | Status |
| --- | --- |
| Critical customer journeys pass | **Met** for demo path (login → Overview → Explore → Roadmap → Reports → logout) |
| No critical/high authorization defects remain | **Met** for checks run; D1 fixed |
| Assessment data remains accurate | **Met** (ABC 39 / Initial / 57 / 13 / 0% via read-only services) |
| Reports and PDF downloads function | **Partial** — hub + links **PASS**; PDF byte download **NOT TESTED** |
| Mobile experience usable | **Met** (Overview) |
| No misleading maturity projections | **Met** |
| Remaining issues documented | **Met** |

**Verdict:** Ready for **production consideration pending** operator follow-ups: (1) resolve Overview/Roadmap progress messaging (D2), (2) PDF binary smoke on staging preview, (3) optional ABC UI pass with a dedicated non-production mailbox or approved staff preview, (4) Vercel staging protection bypass for public smoke if required.

**Do not production-deploy from this ticket.**

---

## ABC LLC staging regression (read-only)

| Anchor | Observed |
| --- | --- |
| Official StackScore | **39** |
| DOC-119 maturity | **Initial** |
| Eight pillars | **8** |
| Customer-visible recommendations | **57** (all `open`) |
| Customer-visible roadmap initiatives | **13** (dashboard metrics; raw initiative rows may be higher before stub filter) |
| Roadmap completion | **0%** |
| Roadmap status | **draft** |
| Phases (customer-visible) | **3** |
| Projected maturity KPI on customer DTOs | **None** |

---

## Automated commands executed

```bash
git branch --show-current
npm test -- tests/ux/
npm test -- tests/auth tests/security tests/api-client-isolation \
  tests/vcio/client-recommendation-visibility.test.ts \
  tests/recommendations/visibility.test.ts
```

Temporary read-only snapshot scripts were used during validation and removed afterward (not part of the product surface).
