# SS-UX-017 — Customer Platform End-to-End Validation & Release Readiness

**Branch:** `staging`  
**Date:** 2026-10-30  
**Environment:** Local Next.js (`http://localhost:3000`) + staging Neon PostgreSQL  
**Dependencies:** SS-UX-001 → SS-UX-016-R1  
**Constraints honored:** No production deploy; no production migrations; no real customer emails; no scoring/catalog/lifecycle changes; SS-UX-016-R1 Explore layout preserved; no AI/admin/public redesign.

**Companion:** [SS-UX-017 Defect Register](./SS-UX-017-DEFECT-REGISTER.md)

---

## 1. Executive summary

End-to-end validation of the customer platform was executed on `staging` against staging Neon. Core customer surfaces (Overview, Explore Intelligence Center, Recommendations, Roadmap/Living Execution Plan, Projects/tasks/milestones, Executive Reports hub) load with authoritative scores and deterministic findings. API-level tenant isolation and customer mutation refusal suites pass. Explore R1 layout remains intact.

**Release recommendation: CONDITIONALLY READY**

No unresolved P0/P1 product defects. Remaining gaps are controlled release gates: dedicated customer demo login this session, live communications publish (policy), leftover TIP/QBR test-fixture TypeScript drift (non-runtime), and PDF binary inspection via browser fetch (Export UI present; unit PDF suite passed).

---

## 2. Environment verification

| Check | Result | Evidence |
| --- | --- | --- |
| Git branch `staging` | **PASS** | `git branch --show-current` → `staging` (tracks `origin/staging`) |
| Staging Neon only | **PASS** | `prisma migrate status` datasource matches documented staging host (`ep-patient-credit-…`); name `neondb` |
| Staging ≠ production | **PASS** | Host matches SS-UX-015 staging endpoint; no production URL key in local env; not `LOOKS_LIKE_PROD_HOST` |
| Prisma schema valid | **PASS** | `npx prisma validate` |
| Generated client present | **PASS** | `src/generated/prisma/client.ts` |
| Migrations applied | **PASS** | `Database schema is up to date!` — **33** migrations |
| SS-UX-015 migration present | **PASS** | `20261030120000_project_customer_updates` on disk + applied |
| Pending migrations | **PASS** | None |
| App starts | **PASS** | `npm run dev` Ready (after `.next` reset — DEF-017-002) |
| Required auth env | **PASS** | `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL` present (values not disclosed) |
| Production resources modified | **PASS** | None — validation only |

---

## 3. Validation matrix

| Area | Status | Evidence | Outstanding |
| --- | --- | --- | --- |
| Authentication | **PASS** (partial) | Logout → login; invalid credentials stay on login; forgot-password form; protected Explore → login redirect; auth Vitest suites | Customer demo login **BLOCKED** (no demo password in env); expired reset token UI **NOT VERIFIED**; session expiry timer **NOT VERIFIED** |
| Authorization | **PASS** | `tests/auth/api-client-isolation.test.ts` 14/14; client writes 403; cross-tenant reads blocked | Live dual-customer browser session **BLOCKED** without second customer login |
| Overview | **PASS** | ABC LLC browser: StackScore **39**, Critical, 13 critical recs, last assessed Oct 26 2026; empty-ish projects KPI 0 matches ABC | Customer-audience projected KPI suppression verified via REL-015 tests (staff view still shows projected — expected) |
| Explore | **PASS** | R1 layout confirmed; 8 pillars; deep link; strengths/attention; tabs; ABC + Pinnacle + unscored Bobby | History back/forward **NOT RE-VERIFIED** this session (deep link PASS) |
| Recommendations | **PASS** | ABC recommendations list loads; Explore Recommendations tab shows Finding/Action/Outcome | — |
| Roadmap | **PASS** | ABC Living Execution Plan phases + Official StackScore 39; Explore Roadmap tab labels **Recommendation status** | Independent initiative status model intentionally not added |
| Projects | **PASS** | Pinnacle list (5 projects); detail Formalize admin accounts — 67% (2/3), task groups, milestones, activity, linked rec/roadmap | New staff create-task live mutation **NOT RE-RUN** (fixtures from 013/014 present) |
| Communications | **PASS** (automated) / **BLOCKED** (live publish) | `ss-ux-015` 15/15 | Live send/publish — DEF-017-005 |
| Reports | **PASS** | Executive Reports hub; Latest Assessment Results; Export PDF control; ss-ux-008 + PDF unit suites | Browser `%PDF` header fetch failed in CDP this session — unit PDF render **PASS** |
| Mobile / responsive | **PASS** (partial) | R1 artifacts 1440/768/390; Explore mobile selector usable | Full matrix 1024/320 re-walk **NOT COMPLETE** this ticket |
| Tenant isolation | **PASS** | API isolation + nav cross-tenant rejection tests | — |
| Automated regression | **PASS** | `tests/ux/` **127/127**; auth/isolation/trust suites green; ESLint 0 errors | Remaining TIP/QBR `tsc` fixture errors — DEF-017-001 |

---

## 4. Authentication and authorization

### Authentication (browser)

| Scenario | Result |
| --- | --- |
| Logout | **PASS** — `/api/auth/signout` → `/login` |
| Invalid credentials | **PASS** — remains on login (no session established) |
| Forgot password form | **PASS** — email + Send Reset Link (not submitted) |
| Activate Account link | **PASS** — present on login |
| Unauthenticated protected route | **PASS** — `/clients/…/explore` → `/login` |
| Customer demo login | **BLOCKED** — DEF-017-004 |
| Password reset token / expiry | **NOT VERIFIED** |
| Session refresh persistence | **NOT VERIFIED** this session (prior staff session persisted across pages before logout) |

### Authorization (API / automated)

| Scenario | Result |
| --- | --- |
| Client cannot write projects/assessments/recommendations | **PASS** (`api-client-isolation`) |
| Cross-tenant resource reads | **PASS** (403/404 patterns) |
| Technician blocked from admin-only surfaces | **PASS** |
| Customer nav rejects other-client paths | **PASS** (`ss-ux-002`) |

---

## 5. Overview validation

**ABC LLC** (staff workspace view of customer Overview):

- Organization: ABC LLC  
- Official StackScore: **39** / Critical  
- Critical recommendations: **13**  
- Immediate focus cards link to recommendations  
- Open projects: **0** (consistent with ABC project inventory)  
- Last assessed: Oct 26, 2026  

**Empty / unscored:** Bobby Fitzgerald dashboard card “Not assessed / Score —” — no fabricated score.

Customer projected-maturity suppression: **PASS** via `ss-rel-015` / customer-facing report tests (client audience). Staff Overview may still show Projected KPI — expected.

---

## 6. Explore validation (SS-UX-016-R1 preserved)

| Requirement | Result |
| --- | --- |
| Compact 8-pillar selector | **PASS** |
| Full-width overview | **PASS** |
| Side-by-side strengths / attention | **PASS** (desktop) |
| Findings / Recommendations / Roadmap & Projects tabs | **PASS** |
| No left-grid / right-panel shell | **PASS** |
| Authoritative scores (ABC IA 51.43 Basic; Pinnacle 100 Optimized) | **PASS** |
| `?pillar=` deep link | **PASS** |
| Strengths from Yes; attention from No/Partial + critical | **PASS** |
| Empty strengths on Pinnacle attention | **PASS** (explicit empty copy) |
| Unscored / in-progress (Bobby) | **PASS** |
| Accessibility tab investigation | **Clarified** — DEF-017-003 |

---

## 7. Recommendations and Roadmap

- ABC Recommendations page loads large customer-visible set with priorities.  
- Explore Recommendations tab: Finding / Recommended action / Expected outcome present.  
- Roadmap (Living Execution Plan): Official 39, phases Critical Stabilization → Strategic Enhancements.  
- Explore Roadmap initiatives label **Recommendation status · …** (known SS-UX-016 limitation — not mislabeled as independent initiative execution status).  
- Task/project completion does not alter official StackScore in validated fixtures (scores remain 39 / 100).

---

## 8. Projects

**Pinnacle Engineering** project dashboard: five projects listed.

**Detail** `Formalize administrative account controls`:

- Progress **67%** = 2 of 3 tasks  
- Groups: In Progress / Up Next / Completed  
- Milestone timeline with completed + open next milestone  
- Linked recommendation (accepted) + roadmap initiative (Critical Stabilization)  
- Activity: task + milestone completions Oct 30, 2026  

Zero-task fabricated %: covered by SS-UX-013/014 automated suites (**PASS**).

---

## 9. Communications

| Check | Result |
| --- | --- |
| Automated SS-UX-015 suite | **15/15 PASS** |
| Draft/test/send live UI this session | **BLOCKED** — DEF-017-005; `RESEND_API_KEY` absent locally |
| No automatic emails on task completion | **PASS** (suite + prior SS-UX-015 report) |
| `PROJECTS_SHARED` / `PROJECT_COMPLETED` preserved | **PASS** (suite contract) |

---

## 10. Reports and PDFs

| Check | Result |
| --- | --- |
| Executive Reports hub | **PASS** (`/clients/…/executive-reports`) |
| Wrong path `/reports` | 404 (nav correctly uses `executive-reports`) |
| Latest Assessment Results | **PASS** — results page with Export PDF |
| `ss-ux-008` + PDF unit/safeguard tests | **PASS** (10 tests across 3 files) |
| Live browser `%PDF` byte inspection | **NOT VERIFIED** this session (CDP fetch failed); Export control present |

---

## 11. Responsive testing

| Viewport | Evidence |
| --- | --- |
| 1440 / 768 / 390 Explore | SS-UX-016-R1 artifacts reused as accepted layout baseline |
| This session | Desktop staff journey across Overview → Explore → Recs → Roadmap → Projects → Reports |

Full 1024/320 re-sweep not duplicated; no layout redesign performed.

---

## 12. Tenant isolation

- API isolation suite **PASS** (reads/writes across OWN vs OTHER).  
- No P0 cross-tenant exposure observed.  
- Staff browsing of ABC vs Pinnacle showed distinct scores/projects (sanity).  
- Customer dual-login isolation browser pass **BLOCKED** without demo credentials.

---

## 13. Automated test results

Exact commands and outcomes:

```text
npm test -- tests/auth/api-client-isolation.test.ts …          → 37 passed (auth bundle)
npm test -- tests/ux/ss-ux-005 … ss-ux-016-r1 …               → 89 passed
npm test -- tests/client-roadmap … ss-rel-015 … ss-ux-010 …   → 67 passed
npm test -- tests/ux/                                         → 127 passed (15 files)
npm test -- tests/customer-portal/next-action.test.ts …       → remediations green
npm run lint                                                  → 0 errors (22 pre-existing warnings)
npx prisma migrate status                                     → up to date (33)
npx prisma validate                                           → valid
npx tsc --noEmit                                              → remaining TIP/QBR/overview fixture errors (DEF-017-001)
```

Prior session `npm run build` on staging: **exit 0**.

---

## 14–15. Defects discovered / remediated

See [SS-UX-017-DEFECT-REGISTER.md](./SS-UX-017-DEFECT-REGISTER.md).

**Remediated this ticket:**

- Test fixture TypeScript drift for next-action, env `NODE_ENV`, responsive-layout regex, ss-ux-002 PageContext, REL-015 consultant→technician + `storedExecutiveSummary`, pillar `maturityLevelCode`.  
- Dev server recovery after `.next` corruption.

**No P0/P1 product defects requiring code changes.**

---

## 16. Outstanding limitations / release gates

1. Re-verify customer portal login with dedicated staging demo credentials.  
2. Controlled communications test-send + publish gate when Resend staging is available (no real customers).  
3. Finish remaining TIP/QBR test TypeScript fixture updates (non-blocking for Next build).  
4. Optional: browser PDF `%PDF` smoke after authenticated export.  
5. Optional: full 1024/320 responsive walk across Projects + Reports.

---

## 17. Release-readiness recommendation

### CONDITIONALLY READY

No unresolved P0/P1 product defects. Essential customer workflows validated via staging browser (staff client-workspace surfaces) + comprehensive automated UX/auth isolation suites. Controlled gates remain for dedicated customer-session login and live communications publish.

**No production deployment is authorized by this ticket.**
