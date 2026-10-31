# SS-REL-017-R3 — Executive PDF Report Remediation

| Field | Value |
| --- | --- |
| Date | 2026-10-30 |
| Branch | `staging` |
| Priority | P1 — Release Blocking |
| Type | Existing feature remediation |
| Scope | Customer assessment PDF (`/api/v1/assessments/[id]/export/pdf`) |

---

## 1. Root causes

| Defect | Cause |
| --- | --- |
| Nearly invisible wolf logo on white paper | PDF used transparent `bkit-logo.png`; dark artwork washed out on light backgrounds |
| Logo missing / solid black plate only | Windows absolute file paths were unreliable for `@react-pdf/renderer` `Image` |
| StackScore overlapping / vanishing under “CURRENT STACKSCORE” | `PdfCornerBrackets` absolute overlays + JetBrains Mono vertical metrics collapsed or overlapped subsequent `Text` nodes |
| Blank trailing page before closing | Single `PdfScoreGauge` with `flex: 1` expanded to remaining page height inside `wrap={false}` rows, forcing an empty page; separate closing `<Page>` compounded the orphan |
| “+61 Estimated Improvement” | Closing KPI used catalog `projectedScore - overallScore` as a speculative StackScore gain |
| “+N pts” on recommendations | Ranking weight (`estimatedImpactPoints`) presented as if it were StackScore points |
| “a initial level” | Executive summary always used article “a” before maturity labels |
| Awkward Executive Summary split | Overview dumped as bullets; large `wrap={false}` blocks collided with the footer |
| Legacy green dominant chrome | Shared `REPORT_COLORS` still mapped brand accent/`forest`/`navy` to forest green `#0B5A46` |

---

## 2. Files changed

| Path | Change |
| --- | --- |
| `src/lib/pdf/shared/constants.ts` / `logo-source.ts` | PDF logo → `new-bobkat-it-logo.png`; Buffer loader |
| `src/lib/pdf/shared/tokens.ts` | Purple brand accent (`#6D28D9`) + soft purple surfaces |
| `src/lib/pdf/shared/styles/components.ts` | Gauge spacing; charcoal headings; cover logo sizing |
| `src/lib/pdf/shared/components/score-gauge.tsx` | Bracket-free gauge; capped height; no unbounded flex grow |
| `src/lib/pdf/shared/components/cover-page.tsx` / `report-header.tsx` | Buffer logo source |
| `src/lib/pdf/shared/components/bullet-section.tsx` | Keep short bullet groups together |
| `src/lib/pdf/assessment-report.tsx` | Closing KPIs; priority-impact wording; denser cards; exec narrative; merge closing onto recs page; drop pillar corner brackets |
| `src/lib/assessments/executive-summary.ts` | “an initial” / correct indefinite article |
| `src/lib/pdf/tip/header.tsx` / `invoice-document.tsx` | Same Buffer logo source |
| `tests/pdf/ss-rel-017-r3-assessment-visual.test.ts` | Fixture smoke + token assertions |
| `tests/assessments/executive-summary.test.ts` | Article grammar coverage |
| `docs/releases/assets/ss-rel-017-r3/*` | Live ABC LLC PDF + page PNGs |

**Not changed:** scoring engines, recommendation ranking, Stripe/billing, migrations, report access control.

---

## 3. Logo asset selected

**`public/branding/new-bobkat-it-logo.png`** — approved Bobkat IT wolf on opaque black plate.

- Aspect ratio preserved (`4800×3300`).
- Loaded via `getPdfLogoSource()` (`fs.readFileSync` → Buffer) for reliable embedding.
- Web/email continue to use transparent `bkit-logo.png`.

---

## 4. Layout / copy corrections (R3 round 2)

- Score gauge: shared `PdfScoreGauge` — no brackets, body-bold score, max height so single-gauge rows cannot expand into blank pages.
- Closing section merged onto Detailed Recommendations page as one `wrap={false}` block (no empty interstitial page).
- Removed “Estimated Improvement”; closing KPIs are Critical / High / Recommendations count / Maturity Target.
- Recommendation impact labeled **Priority-Impact Rating** with “(planning weight)”; ranking algorithm unchanged.
- Executive Summary uses flowing Assessment Overview prose; short bullet groups stay together; “an initial level” grammar fixed at narrative builder + display sanitize.
- Recommendation cards tightened (padding/margins) while remaining atomic across page breaks.

---

## 5. Branding corrections

- Primary accent / score fills / accent borders → print-safe purple `#6D28D9`.
- Soft purple backgrounds for accent surfaces.
- Strong headings → charcoal (`REPORT_COLORS.ink`).
- Critical / warning semantic colors retained.

---

## 6. Test results

| Suite | Result |
| --- | --- |
| `tests/pdf/ss-rel-017-r3-assessment-visual.test.ts` | **PASS** |
| `tests/assessments/executive-summary.test.ts` | **PASS** |
| `tests/pdf/assessment-paper-safe-pilot.test.ts` | **PASS** (earlier this session) |
| `tests/branding/assets.test.ts` | **PASS** (earlier this session) |
| `tests/ux/ss-ux-008-premium-customer-reports.test.ts` | **PASS** |

Scoring / assessment / recommendation ranking / access logic: **unchanged**.

---

## 7. Visual validation evidence (live ABC LLC)

Regenerated customer-facing report from assessment `b11085ce-eba8-4a82-a93e-157f38855fad`:

- PDF: `docs/releases/assets/ss-rel-017-r3/abc-llc-assessment-report.pdf`
- Pages: `page-01.png` … `page-31.png` (**31 pages**, was 34)

| Check | Result |
| --- | --- |
| Cover — black-plate wolf logo legible | **PASS** |
| Purple branding consistent | **PASS** |
| Score gauges (pp. 2, 7, 31) — no overlap | **PASS** |
| No blank footer-only pages | **PASS** |
| No “+61 Estimated Improvement” | **PASS** |
| Official score 39 + maturity target 80+ preserved separately | **PASS** |
| Priority-impact rating / planning weight wording | **PASS** |
| “an initial level” grammar | **PASS** |
| All 57 recommendations present | **PASS** |

---

## 8. Remaining notes

| Item | Notes |
| --- | --- |
| Last recommendation page can be sparse | Closing block stays atomic and moves as a unit when it does not fit; not blank |
| Interior pages lack header logo | Pre-existing footer-only branding on body pages |
| `pdf-to-img` LiberationSans warning | Rasterizer only; does not affect generated PDF |

---

## 9. Release recommendation

**Include in the SS-REL-017 production candidate** after product-owner review of `abc-llc-assessment-report.pdf`.

**No production deploy from this ticket alone.**
