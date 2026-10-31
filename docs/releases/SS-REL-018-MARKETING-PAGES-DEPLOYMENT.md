# SS-REL-018 — Assessment Marketing Pages Production Deployment

| Field | Value |
|-------|--------|
| Ticket | SS-REL-018 |
| Scope | SS-WEB-004 marketing refresh — `/assessment-offer`, `/assessment-invitation` |
| Authorization | Product owner — visual approval granted; controlled production deploy authorized |
| Date | 2026-10-30 (America/Chicago) |
| Result | **GO** |

---

## 1. Source commit SHA

| Ref | SHA |
|-----|-----|
| Staging source commit (SS-WEB-004) | `2a247569ab35c9d0f26a120858754d49c7ed1429` |
| Cherry-pick onto `main` | Identical tree; new SHA `4dbc85b6502d9ee44dabafe704886934cab65472` |

Isolation: staging tip had unrelated SS-REL-017 docs (`a13f4c5`, `1e03aa9`) ahead of `main`. Those were **not** merged. Only the WEB-004 commit was cherry-picked onto `main` at `39d9ef8`.

---

## 2. Production commit SHA

| Ref | SHA |
|-----|-----|
| Prior production (`main`) | `39d9ef8e8e4f87cff2ba5bde4a978b2e174b64a3` (SS-REL-017-R5) |
| **Current production (`origin/main`)** | **`4dbc85b6502d9ee44dabafe704886934cab65472`** |

---

## 3. Files deployed

26 paths (WEB-004 only):

- `docs/marketing/SS-WEB-004-ASSESSMENT-PAGES-REFRESH.md`
- `docs/marketing/ss-web-004/*` (PO review screenshots)
- `public/images/marketing/ss-web-004/{overview,explore,roadmap}.{webp,png}`
- `src/lib/marketing/app-showcase.ts`
- `src/components/marketing/app-showcase-frame.tsx`
- `src/components/marketing/stackscore-app-showcase.tsx`
- `src/components/learn-about-stackscore/{learn-about-stackscore-landing,learn-hero}.tsx`
- Deleted: `learn-maturity.tsx`, `learn-improvement-planning.tsx`
- `src/components/assessment-invitation/{assessment-invitation-landing,invitation-hero,invitation-discover-section}.tsx`
- `src/lib/assessment-invitation/content.ts`
- `tests/layout/assessment-{offer,invitation}-layout.test.ts`

**Not included:** Prisma migrations, auth, Stripe/billing, scoring engines, unrelated staging docs.

---

## 4. Automated test results

| Check | Result |
|-------|--------|
| `npm test -- tests/layout/assessment-offer-layout.test.ts tests/layout/assessment-invitation-layout.test.ts tests/stripe/routes.test.ts` | **13/13 passed** |
| `npm run lint` | **0 errors** (preexisting warnings only) |
| `npm run build` | **Succeeded** (exit 0) |

---

## 5. Vercel deployment ID

| Item | Value |
|------|--------|
| Deployment | `dpl_8yLfobjiGsdY4GkTX8oqzRitjEuz` |
| URL | `https://bobkat-stackscore-oy2b9xebl-robertfitzgerald90-8984s-projects.vercel.app` |
| Trigger | Push `39d9ef8..4dbc85b` → `origin/main` |

---

## 6. Production deployment status

| Gate | Result |
|------|--------|
| Production deploy started | **PASS** (Queued → Building → Ready) |
| Status | **Ready** |
| Aliases include `stackscore.tech` | **PASS** (same project production aliases) |
| Deployed commit | **`4dbc85b`** matches intended release |
| Force-push / history rewrite | **Not used** |

---

## 7. Production screenshot verification

Live HTML + assets on `https://stackscore.tech`:

| Check | Offer | Invitation |
|-------|-------|------------|
| Page HTTP 200 | **PASS** | **PASS** |
| `overview.webp` referenced + served (200, image/webp) | **PASS** | **PASS** |
| `explore.webp` | **PASS** | **PASS** |
| `roadmap.webp` | **PASS** | **PASS** |
| Headings: Understand / Explore / Turn Insights | **PASS** | **PASS** |
| Legacy executive preview strings absent | **PASS** | **PASS** |
| “Projected StackScore” / “Immediate Focus” absent | **PASS** | **PASS** |
| Browser: Overview showcase visible (Northstar / Official 60) | **PASS** | Showcase sections present |

---

## 8. CTA verification

### `/assessment-offer`

| CTA | Destination | Result |
|-----|-------------|--------|
| Purchase Technology Maturity Assessment — $1,500 | Stripe via `/api/checkout/create-session` (unchanged; not live-purchased) | **PASS** — button present |
| Start My Free Technology Snapshot | `/technology-snapshot` | **PASS** |
| Book a Consultation | `https://cal.com/bobkat-it/bobkat-it-free-consult` | **PASS** |
| See how StackScore works | `#how-stackscore-works` | **PASS** |

### `/assessment-invitation`

| CTA | Destination | Result |
|-----|-------------|--------|
| Start My Free Technology Snapshot | `/technology-snapshot` | **PASS** |
| Learn About StackScore / Purchase the full assessment | `/assessment-offer` | **PASS** |

### Platform regression

| Route | Result |
|-------|--------|
| `https://stackscore.tech/` | **200** |
| `https://stackscore.tech/demo` | **200** |
| `https://stackscore.tech/login` | **200** |
| `https://stackscore.tech/api/v1/health` | **200** `{"status":"ok"}` |

---

## 9. Outstanding issues

1. Authenticated customer/admin smoke not re-run for this marketing-only release (unchanged from R5 recommendation).
2. Live Stripe purchase not initiated (per ticket restrictions).
3. Staging remains ahead of `main` by SS-REL-017 docs commits only (`a13f4c5`, `1e03aa9`) plus this report commit after push — intentional isolation.

---

## 10. Final GO / NO-GO

**GO** — SS-WEB-004 marketing pages are live on production at commit `4dbc85b` / deployment `dpl_8yLfobjiGsdY4GkTX8oqzRitjEuz`.

### Promotion method

```text
staging: commit 2a24756 (WEB-004 only)
main @ 39d9ef8 → cherry-pick 2a24756 → 4dbc85b
git push origin main
```

No database migrations. No billing/auth/scoring changes.
