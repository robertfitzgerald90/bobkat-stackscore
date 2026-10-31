# SS-WEB-003 — Demo Test Matrix

**Project:** StackScore  
**Branch:** `staging`  
**Date:** 2026-10-30  
**Companion:** `docs/web/SS-WEB-003-PUBLIC-DEMO-ALIGNMENT.md`

| Test ID | Area | Scenario | Expected result | Actual result | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| DEMO-01 | Architecture | Anonymous `/demo` access | Public; redirects to overview | Auth whitelist + redirect page | Pass | `auth.config.ts`; `src/app/demo/page.tsx`; unit test |
| DEMO-02 | Architecture | Fictional data source | Provider returns Northstar fixtures only | `public-demo-northstar` + `demo-` ids | Pass | `ss-web-003-public-demo.test.ts` |
| DEMO-03 | Architecture | No tenant / Prisma | Provider has no db imports | No `@/lib/db` / `prisma.` | Pass | Provider walk test |
| DEMO-04 | Architecture | No mutation capability | DTOs omit assessment start, updates, PDF APIs | Asserted absent in workspace JSON | Pass | Read-only enforcement test |
| DEMO-05 | Content | Eight pillars | All TECHNOLOGY_PILLARS present with scores | 8 pillars in overview + explore | Pass | Content scoring tests |
| DEMO-06 | Content | Whole-number scores | `formatMaturityScore` has no decimals | Pass | Scoring tests |
| DEMO-07 | Content | Maturity classifications | Labels from `getCustomerMaturityLabel` | Pass | Scoring tests |
| DEMO-08 | Content | Recommendation relationships | Initiative/project hrefs → demo opportunities | `/demo/opportunities/…` | Pass | Roadmap relationship test |
| DEMO-09 | Content | Roadmap relationships | Phases/initiatives/projects linked | ≥3 phases, ≥4 initiatives | Pass | Roadmap test |
| DEMO-10 | Content | Project progress | Matches `computeProjectProgress` | Identity 50%; docs null | Pass | Progress integrity test |
| DEMO-11 | Navigation | Overview | `/demo/overview` renders customer overview panels | Route + `DemoOverviewExperience` | Pass | Route file + build |
| DEMO-12 | Navigation | Explore | `/demo/explore?pillar=` switches pillars | CustomerExploreExperience | Pass | Route + Suspense |
| DEMO-13 | Navigation | Roadmap | `/demo/roadmap` shows phases/initiatives | CustomerRoadmapExperience | Pass | Route file |
| DEMO-14 | Navigation | Projects | List + detail under `/demo/projects` | Customer project components | Pass | Routes + static params |
| DEMO-15 | Navigation | Reports | Hub + sample preview | DemoReports + sample page | Pass | Routes; no API PDF |
| DEMO-16 | Security | No real customer data | Company labeled sample; demo ids only | Pass | Entity id + sample notice tests |
| DEMO-17 | Security | No privileged actions | vCIO hidden; booking off; no completion report | Pass | DTO + roadmap props |
| DEMO-18 | Security | No server-action exposure | Demo pages are RSC + presentation only | No Server Actions added | Pass | Code review |
| DEMO-19 | Legacy | Deep links | `/demo/dashboard` → overview etc. | `LEGACY_DEMO_SECTION_REDIRECTS` | Pass | Redirect map + `[section]` page |
| DEMO-20 | Regression | Customer portal tests | Existing UX tests still pass | Pass | vitest customer-portal / UX-004 |
| DEMO-21 | Tooling | Lint | `npm run lint` | 0 errors | Pass | lint log |
| DEMO-22 | Tooling | Build | `npm run build` | Success | Pass | build log |
| DEMO-23 | Tooling | Typecheck | `npx tsc --noEmit` | Re-run after prisma generate; baseline fixture debt separate | Conditional | See alignment doc §17 |
| DEMO-24 | Browser | Overview desktop | Visual parity with customer overview | Not executed | **BLOCKED** | No staging browser session |
| DEMO-25 | Browser | Explore pillar switch | Intelligence updates | Not executed | **BLOCKED** | Manual QA required |
| DEMO-26 | Browser | Project detail | Tasks/milestones readable | Not executed | **BLOCKED** | Manual QA required |
| DEMO-27 | Browser | Reports sample | Preview labeled sample | Not executed | **BLOCKED** | Manual QA required |
| DEMO-28 | Browser | Mobile nav 390/320 | Drawer usable; no overflow | Not executed | **BLOCKED** | Manual QA required |
| DEMO-29 | Browser | Sign in CTA | Navigates to `/login` | Not executed | **BLOCKED** | Manual QA required |
| DEMO-30 | A11y | Keyboard + focus | Visible focus; nav operable | Not executed | **BLOCKED** | Manual QA required |

### Manual QA checklist (staging)

1. Open `/demo` — lands on Overview with DEMO ENVIRONMENT label.  
2. Confirm StackScore whole number and Developing (or matching) maturity label.  
3. Switch Explore pillars; strengths/attention update.  
4. Open Roadmap initiatives; follow opportunity link.  
5. Open Identity Governance Improvement project; progress = completed/total tasks.  
6. Reports → View sample preview — no real PDF.  
7. Sign in → `/login`.  
8. 390px: hamburger opens nav; sections reachable.  
9. `/demo/dashboard` redirects to `/demo/overview`.  
10. Confirm no real customer company names appear.
