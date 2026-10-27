# SS-CONTENT-001 — Recommendation Catalog Completion (Batch 1)

| Field | Value |
| --- | --- |
| Status | **Content proposed — awaiting approval (not published)** |
| Date | 2026-10-27 |
| Branch | `staging` |
| Scope | Documentation & Knowledge (10) + Technology Strategy (10) |
| Catalog file | `data/RecommendationCatalogV2.json` |
| Constraints | Stub flags retained; impact points / priorities / IDs / mappings unchanged; scoring untouched; no production deploy; **catalog JSON not modified in this release** |

---

## 1. Phase 1 — Catalog inventory

### Schema (per template)

| Field | Notes |
| --- | --- |
| `id` | Stable `REC-{pillar}-{nnn}` |
| `questionId` | 1:1 DOC-151 question (`DK-###` / `TS-###`) |
| `pillarCode` / `pillarName` | Eight Technology Maturity pillars |
| `title`, `description`, `businessImpact` | Customer-facing copy when `isStub: false` |
| `suggestedService` | Service label for delivery planning |
| `priority`, `estimatedImpactPoints` | **Do not change in this batch** |
| `triggerAnswers`, `alsoTriggerOnPartial` | No / Partially |
| `isStub` | Fail-closed customer gate (SS-OPT-003 / visibility filter) |

Approved description structure (IA/SO pattern):

`Finding:` → `Recommended action:` → `Expected outcome:` → `Implementation considerations:`

### Inventory summary

| Pillar | Approved (`isStub: false`) | Unfinished stubs |
| --- | --- | --- |
| Identity & Access | **10** | 0 |
| Security Operations | **10** | 0 |
| Documentation & Knowledge | 0 | **10** ← Batch 1 |
| Technology Strategy | 0 | **10** ← Batch 1 |
| Endpoint Management | 0 | 10 |
| Network & Connectivity | 0 | 10 |
| Data Protection & Recovery | 0 | 10 |
| Productivity & Collaboration | 0 | 10 |
| **Total** | **20** | **60** |

### Stub visibility

Clients never receive `isStub: true` rows (`filterClientDeliverableRecommendations`). Titles starting with `Improve ` are also fail-closed. **This batch does not clear `isStub`.**

### Approved recommendations

All `REC-IA-*` and `REC-SO-*` rows were left untouched.

### Question mappings (Batch 1)

| Template | Question | Current stub title pattern |
| --- | --- | --- |
| REC-DK-001 | DK-001 Is the network documented? | Improve Documentation & Knowledge: … |
| REC-DK-002 | DK-002 Is there a current technology asset inventory? | … |
| REC-DK-003 | DK-003 Are credentials securely managed? | … |
| REC-DK-004 | DK-004 Are vendors documented? | … |
| REC-DK-005 | DK-005 Are SOPs documented? | … |
| REC-DK-006 | DK-006 Are configurations documented? | … |
| REC-DK-007 | DK-007 Are licensing and warranty records maintained? | … |
| REC-DK-008 | DK-008 Could another IT professional support the environment? | … |
| REC-DK-009 | DK-009 Is documentation maintained? | … |
| REC-DK-010 | DK-010 Has documentation ownership been assigned? | … |
| REC-TS-001 | TS-001 Is there a documented technology roadmap? | Improve Technology Strategy: … |
| REC-TS-002 | TS-002 Are technology decisions aligned with business goals? | … |
| REC-TS-003 | TS-003 Is there a planned technology budget? | … |
| REC-TS-004 | TS-004 Is hardware lifecycle planned? | … |
| REC-TS-005 | TS-005 Are business applications reviewed regularly? | … |
| REC-TS-006 | TS-006 Are technology risks reviewed? | … |
| REC-TS-007 | TS-007 Is continuous improvement practiced? | … |
| REC-TS-008 | TS-008 Is there a technology vision? | … |
| REC-TS-009 | TS-009 Are executive technology reviews performed? | … |
| REC-TS-010 | TS-010 Has technology leadership been assigned? | … |

Preserved metadata (unchanged in proposal):

| ID | Priority | Impact pts |
| --- | --- | --- |
| REC-DK-001 | high | 8 |
| REC-DK-002 | medium | 6 |
| REC-DK-003 | critical | 10 |
| REC-DK-004 | low | 4 |
| REC-DK-005 | high | 8 |
| REC-DK-006 | high | 8 |
| REC-DK-007 | low | 4 |
| REC-DK-008 | medium | 6 |
| REC-DK-009 | medium | 6 |
| REC-DK-010 | low | 3 |
| REC-TS-001 | critical | 10 |
| REC-TS-002 | critical | 10 |
| REC-TS-003 | high | 8 |
| REC-TS-004 | medium | 6 |
| REC-TS-005 | medium | 6 |
| REC-TS-006 | high | 8 |
| REC-TS-007 | critical | 10 |
| REC-TS-008 | low | 4 |
| REC-TS-009 | medium | 6 |
| REC-TS-010 | low | 3 |

Proposed `suggestedService` labels (for approval with publish):

- Documentation & Knowledge → **Documentation & Knowledge Improvement**
- Technology Strategy → **Technology Strategy Improvement**

---

## 2. Phase 2 — Proposed Batch 1 content

> **Publication rule:** Apply to `RecommendationCatalogV2.json` and set `isStub: false` **only after explicit approval**. Until then, catalog stubs remain as-is so customers cannot see unfinished copy.

Partial vs absent: each Finding notes that “No” implies missing or negligible practice and “Partially” implies incomplete coverage; remediation discovery should confirm scope.

---

### Documentation & Knowledge

#### REC-DK-001 — Document the network for support and recovery

**Proposed title:** Document the business network for support and recovery

**businessImpact:** When network layout, key devices, and connectivity paths are not documented, outages take longer to diagnose, vendor handoffs become unreliable, and recovery work depends on tribal knowledge. That raises downtime risk and increases the cost of every change or emergency.

**description:**

Finding: Assessment responses indicate network documentation is missing or incomplete. This reflects reported documentation maturity, not a completed network discovery or diagram audit. A “No” answer typically means usable diagrams or inventories are absent; “Partially” usually means some notes exist but are incomplete, outdated, or not shared with the people who support the environment.

Recommended action: Produce a practical network overview covering sites, internet circuits, firewalls/routers, core switches, wireless, VPN/remote access, and major server or cloud connectivity. Label critical paths (email, line-of-business apps, payments, voice). Store the package where IT support can reach it, and schedule a lightweight refresh after material changes.

Expected outcome: Support staff and providers can orient faster during incidents and changes, reducing time-to-diagnose and dependency on a single individual’s memory.

Implementation considerations: Prefer simple diagrams and device lists over unused elaborate tooling. Protect documentation that reveals internal addressing or credentials. Align updates with change tickets so the package does not go stale after the first draft.

---

#### REC-DK-002 — Maintain a current technology asset inventory

**Proposed title:** Maintain a current technology asset inventory

**businessImpact:** Without a current inventory of devices, servers, and major software, leaders cannot plan refresh cycles, license needs, or security coverage confidently. Missing assets are easier to overlook in patching, backup, and retirement decisions.

**description:**

Finding: Assessment responses indicate a current technology asset inventory is missing or only partially maintained. This is based on assessment answers, not a full discovery scan of every endpoint. “No” suggests no reliable inventory; “Partially” suggests lists exist but are incomplete or infrequently updated.

Recommended action: Establish a living inventory of workstations, servers, network appliances, major SaaS/line-of-business applications, and mobile devices in scope. Capture owner, location/site, warranty or subscription dates where known, and criticality. Reconcile the list at a defined cadence (for example quarterly) and after onboarding or retirement events.

Expected outcome: Planning, support, and security coverage decisions are based on a shared view of what the organization actually runs.

Implementation considerations: Start with business-critical systems, then expand. Reuse existing RMM, directory, or purchase records where available rather than rebuilding from scratch. Assign an owner for inventory accuracy (see also REC-DK-010).

---

#### REC-DK-003 — Manage credentials with controlled secret storage

**Proposed title:** Manage shared and service credentials in a controlled secret store

**businessImpact:** Credentials stored in spreadsheets, browsers, or shared chats are easy to leak and hard to revoke. For an SMB, one exposed admin or vendor password can interrupt operations, enable fraud, or prolong recovery after an incident.

**description:**

Finding: Assessment responses indicate credentials are not securely managed in a consistent way. This is assessment-reported practice maturity, not proof that a specific password has been compromised. “No” typically means no controlled vault or process; “Partially” often means some secrets are protected while others remain in informal locations.

Recommended action: Inventory privileged, shared, vendor, and service credentials. Move them into an approved password manager or secrets vault with individual accountability, MFA on the vault, and least-privilege sharing. Retire plaintext lists. Define who may retrieve break-glass credentials and how rotations are recorded.

Expected outcome: Sensitive passwords are harder to lose casually, easier to rotate after staff changes, and less likely to appear in email or chat during routine work.

Implementation considerations: Prioritize domain/admin, firewall, backup, banking, and vendor portals first. Train staff who currently share passwords. Coordinate rotations so production services are not interrupted. This complements—but does not replace—individual workforce accounts and MFA under Identity & Access recommendations.

---

#### REC-DK-004 — Document critical vendors and support contacts

**Proposed title:** Document critical vendors and support contacts

**businessImpact:** When vendor contacts, contract terms, and escalation paths are unknown, outages and renewals create avoidable delay. Leadership loses negotiating leverage and support teams waste time finding who can help.

**description:**

Finding: Assessment responses indicate vendor documentation is missing or incomplete. Findings reflect reported records maturity, not a legal contract review. “No” means no usable vendor register; “Partially” means some contacts exist but key providers or renewal details are missing.

Recommended action: Create a concise vendor register for internet, telecom, cloud, security, backup, line-of-business applications, and managed IT. Capture primary contacts, support portals, account numbers, renewal windows, and what each vendor supports. Review the register at least annually and after provider changes.

Expected outcome: Incidents and renewals proceed with less hunting for contacts, and ownership of third-party relationships is clearer.

Implementation considerations: Keep the register short enough to maintain. Store it with other operations documentation. Mark which vendors are business-critical versus discretionary.

---

#### REC-DK-005 — Document standard operating procedures for key IT work

**Proposed title:** Document standard operating procedures for key IT work

**businessImpact:** Undocumented repeatable work produces inconsistent results, longer onboarding for new support staff, and higher error rates during pressure events. Knowledge walks out the door when one person is unavailable.

**description:**

Finding: Assessment responses indicate standard operating procedures (SOPs) for technology operations are missing or incomplete. This is based on reported process documentation, not an observation of every task. “No” implies SOPs are largely absent; “Partially” implies some procedures exist but coverage is uneven.

Recommended action: Document a short set of SOPs for high-frequency or high-risk work—examples: new-user setup, offboarding, backup verification, restoring a critical application, and vendor escalation. Use checklists with owners and expected timing. Store them where the support team actually works.

Expected outcome: Routine and emergency tasks are performed more consistently, and coverage does not depend solely on one individual’s memory.

Implementation considerations: Prefer brief checklists over long manuals that nobody updates. Pilot with the two or three most painful processes first. Tie SOP updates to change events (see REC-DK-009).

---

#### REC-DK-006 — Document critical system configurations

**Proposed title:** Document critical system configurations for rebuild and support

**businessImpact:** Without configuration baselines, rebuilds and troubleshooting take longer and increase the chance of incorrect recovery. Provider transitions become riskier because essential settings live only in production systems or personal notes.

**description:**

Finding: Assessment responses indicate configuration documentation is missing or incomplete. This reflects assessment answers, not a full configuration export of every device. “No” suggests little durable config documentation; “Partially” suggests some notes exist but critical systems are incomplete.

Recommended action: Capture configuration baselines for firewalls, identity/directory essentials, backup jobs, email/security gateways, and other systems that would be painful to recreate from memory. Include versions, key settings, and where authoritative backups of config files are stored. Protect sensitive values and reference the credential vault where secrets belong.

Expected outcome: Support and recovery teams can rebuild or diagnose faster with less guesswork after failures or staff changes.

Implementation considerations: Focus on systems that are hard to rediscover under pressure. Automate exports where the platform allows. Avoid duplicating secrets into documents—link to the vault (REC-DK-003).

---

#### REC-DK-007 — Maintain licensing and warranty records

**Proposed title:** Maintain licensing and warranty records

**businessImpact:** Missing license and warranty records lead to surprise renewals, compliance uncertainty, and hardware left unprotected after coverage expires. Budget planning becomes reactive rather than scheduled.

**description:**

Finding: Assessment responses indicate licensing and warranty records are not maintained reliably. This is reported administrative maturity, not a software-compliance audit. “No” means records are largely absent; “Partially” means some entitlements are tracked while others are not.

Recommended action: Centralize records for major software subscriptions, cloud tenants, security tools, and hardware warranties—purchase date, term, seats/quantity, renewal date, and owner. Review upcoming renewals on a defined calendar (for example 60–90 days ahead).

Expected outcome: Renewals and refresh decisions are planned with fewer surprises, and ownership of entitlements is clearer.

Implementation considerations: Start with the highest-cost and business-critical subscriptions. Reconcile against invoices and admin consoles. Pair with the asset inventory (REC-DK-002) so devices and licenses stay aligned.

---

#### REC-DK-008 — Make the environment supportable by another IT professional

**Proposed title:** Make the environment supportable by another IT professional

**businessImpact:** When only one person can support the environment, illness, turnover, or provider change creates outsized operational risk. Knowledge concentration slows incident response and raises transition cost.

**description:**

Finding: Assessment responses indicate another qualified IT professional could not readily support the environment with current documentation and access practices. This is an organizational readiness finding from the assessment, not a judgment of individual competence. “No” implies heavy reliance on tribal knowledge; “Partially” implies some transferability but remaining single points of failure.

Recommended action: Combine living network/asset docs, credential vault access for designated backups, SOPs, and a short “how we support this company” briefing. Ensure at least one backup person or provider can authenticate, escalate vendors, and perform core recovery steps. Test knowledge transfer with a tabletop or shadowed incident.

Expected outcome: Support continuity improves when the primary administrator is unavailable, and provider transitions become less disruptive.

Implementation considerations: This recommendation is largely the roll-up of documentation, vaulting, and ownership work in this pillar. Prioritize break-glass access and the top five recovery procedures before polishing secondary diagrams.

---

#### REC-DK-009 — Keep technology documentation current

**Proposed title:** Keep technology documentation current after changes

**businessImpact:** Outdated documentation creates false confidence—teams follow wrong diagrams or miss new systems during incidents. Stale records waste time and can extend outages.

**description:**

Finding: Assessment responses indicate documentation is not maintained as the environment changes. This reflects reported maintenance discipline, not proof that every document is wrong. “No” suggests documentation is rarely updated; “Partially” suggests updates happen inconsistently.

Recommended action: Define a lightweight maintenance rule: update network, inventory, SOP, and config docs as part of completed changes, and perform a periodic review (for example quarterly) for drift. Assign reviewers and track overdue refreshes.

Expected outcome: Documentation remains trustworthy enough to use under pressure, reducing diagnosis time and transition risk.

Implementation considerations: Attach “docs updated?” to change tickets or project closeout. Prefer fewer documents that stay accurate over many that go stale. Ownership (REC-DK-010) makes the cadence enforceable.

---

#### REC-DK-010 — Assign documentation ownership

**Proposed title:** Assign ownership for technology documentation

**businessImpact:** Without a named owner, documentation tasks fall through the cracks between internal staff and providers. Accountability gaps are a common reason inventories and diagrams decay.

**description:**

Finding: Assessment responses indicate documentation ownership has not been clearly assigned. This is an organizational finding from the assessment, not a technical defect. “No” means no clear owner; “Partially” means ownership is informal or split without accountability.

Recommended action: Name a primary owner (and backup) for technology documentation quality—inventory, network overview, SOPs, vendor register, and config baselines. Document whether an internal manager or MSP executes updates, and include documentation health in a recurring operations review.

Expected outcome: Documentation work has a clear point of accountability, improving the odds that records stay usable over time.

Implementation considerations: Ownership can sit with a business leader supported by a provider; the key is explicit responsibility. Avoid distributing edit rights widely without a single accountable owner.

---

### Technology Strategy

#### REC-TS-001 — Establish a documented technology roadmap

**Proposed title:** Establish a documented technology roadmap

**businessImpact:** Without a shared roadmap, technology work becomes reactive—urgent fires crowd out improvements that protect uptime, security, and growth. Leaders lack a sequenced view of what matters next and why.

**description:**

Finding: Assessment responses indicate a documented technology roadmap is missing or incomplete. This reflects planning maturity reported in the assessment, not a judgment that no useful work is occurring. “No” typically means no living plan; “Partially” means informal lists exist without shared sequencing or ownership.

Recommended action: Produce a practical multi-horizon roadmap (near-term stabilization, mid-term improvements, longer-term enhancements) tied to assessment priorities and business goals. Review and adjust it on a defined cadence with leadership. Keep it short enough to use in planning conversations.

Expected outcome: Stakeholders share a sequenced view of technology priorities, making funding and scheduling decisions clearer and reducing purely reactive spend.

Implementation considerations: Use StackScore recommendations and living execution plans as inputs, not as a substitute for leadership agreement. Revisit after major business changes. Do not treat the roadmap as a guaranteed outcome schedule—capacity and approvals still govern delivery.

---

#### REC-TS-002 — Align technology decisions with business goals

**Proposed title:** Align technology decisions with stated business goals

**businessImpact:** Technology spend that is not tied to business outcomes creates frustration, duplicate tools, and missed risk reduction. Leaders struggle to decide what to fund when priorities are unclear.

**description:**

Finding: Assessment responses indicate technology decisions are not consistently aligned with business goals. This is based on reported decision practice, not an audit of every purchase. “No” suggests little explicit linkage; “Partially” suggests occasional alignment without a repeatable method.

Recommended action: Document the organization’s primary business goals and technology constraints. Require a short “business purpose” note for material technology decisions (new systems, major upgrades, security investments). Review alignment in executive technology discussions (see REC-TS-009).

Expected outcome: Investments and projects more clearly support growth, efficiency, risk reduction, or customer obligations—and low-value work is easier to defer.

Implementation considerations: Keep the decision record lightweight (a paragraph, not a bureaucracy). Involve both operations and leadership for decisions that affect customer delivery or compliance. Revisit goals when strategy changes.

---

#### REC-TS-003 — Plan a technology budget

**Proposed title:** Establish a planned technology budget

**businessImpact:** Without a planned technology budget, renewals, hardware refresh, and security work arrive as surprises. That forces rushed decisions and undercuts multi-quarter improvement plans.

**description:**

Finding: Assessment responses indicate a planned technology budget is missing or incomplete. This is reported financial-planning maturity for technology, not a full accounting review. “No” means budgeting is largely reactive; “Partially” means some categories are planned while others are ad hoc.

Recommended action: Build an annual (or rolling) technology budget covering recurring services, licenses, anticipated refresh, and a reserve for urgent risk items. Align major roadmap items to budget categories. Review actuals versus plan at least quarterly with the budget owner.

Expected outcome: Leadership can approve sequenced work with fewer surprise invoices and clearer tradeoffs between deferral and risk.

Implementation considerations: Start with known recurring costs from vendors and invoices (see also REC-DK-007). Separate run-the-business spend from improvement initiatives. This recommendation does not invent cost estimates—actual figures come from contracts, quotes, and finance.

---

#### REC-TS-004 — Plan hardware lifecycle and refresh

**Proposed title:** Plan hardware lifecycle and refresh

**businessImpact:** Unplanned hardware aging increases failure risk, performance complaints, and emergency replacement cost. Warranty cliffs and unsupported devices also complicate security and support.

**description:**

Finding: Assessment responses indicate hardware lifecycle planning is missing or incomplete. This reflects reported planning practice, not a certified remaining-life analysis of every device. “No” suggests refresh is reactive; “Partially” suggests some planning exists without consistent execution.

Recommended action: Using the asset inventory, classify devices by age, warranty, and business criticality. Define target refresh windows for workstations, servers, and network gear. Schedule replacements before failure where practical, and capture exceptions intentionally.

Expected outcome: Refresh becomes predictable, reducing emergency purchases and surprise downtime from aged equipment.

Implementation considerations: Prioritize devices that gate revenue or safety-critical work. Coordinate with budget planning (REC-TS-003). Pair with warranty/license records (REC-DK-007).

---

#### REC-TS-005 — Review business applications regularly

**Proposed title:** Review business applications on a defined cadence

**businessImpact:** Unreviewed applications accumulate unused licenses, overlapping tools, and outdated platforms that increase cost and support burden. Security and vendor risk can linger unnoticed.

**description:**

Finding: Assessment responses indicate business applications are not reviewed regularly. This is reported governance maturity, not a software asset management audit. “No” means reviews rarely happen; “Partially” means reviews are informal or incomplete.

Recommended action: Maintain an application catalog of systems that matter to operations. Review ownership, business fit, renewals, and risk on a defined cadence (for example semiannual). Decide to retain, replace, consolidate, or retire with a named owner for each decision.

Expected outcome: The application portfolio stays closer to actual business needs, with fewer redundant tools and clearer renewal decisions.

Implementation considerations: Start with paid and business-critical apps. Involve department leads for fitness-to-purpose. Link retirements to data migration and access removal so shadow use does not continue.

---

#### REC-TS-006 — Review technology risks on a defined cadence

**Proposed title:** Review technology risks with leadership on a defined cadence

**businessImpact:** When technology risks are not reviewed, known gaps remain unprioritized and new threats or dependencies go unnoticed. Leadership learns about problems primarily through incidents.

**description:**

Finding: Assessment responses indicate technology risks are not reviewed in a reliable way. This reflects reported risk-management practice, not a completed formal risk assessment of every control. “No” suggests little structured review; “Partially” suggests ad hoc discussion without cadence or tracking.

Recommended action: Maintain a short risk register of technology issues that could disrupt operations, compromise data, or block growth. Review it with leadership on a set cadence, update status after remediation, and connect top risks to roadmap and budget items.

Expected outcome: Risk discussion becomes proactive, improving prioritization of limited remediation capacity.

Implementation considerations: Keep the register focused (top 10, not hundreds). Use assessment findings and incident history as inputs. Avoid implying that a listed risk has already caused harm unless evidence exists.

---

#### REC-TS-007 — Practice continuous technology improvement

**Proposed title:** Establish a continuous technology improvement cadence

**businessImpact:** Without continuous improvement habits, environments plateau after one project wave and slowly accumulate debt. Small recurring fixes that prevent outages never get scheduled.

**description:**

Finding: Assessment responses indicate continuous improvement is not practiced consistently. This is reported operating cadence, not a claim that no improvements ever occur. “No” means improvement is largely crisis-driven; “Partially” means some improvement happens without a repeatable rhythm.

Recommended action: Institute a lightweight recurring improvement cycle—review open recommendations and incidents, pick a small number of next actions, assign owners, and verify completion. Align the cycle with roadmap and executive review forums.

Expected outcome: Progress compounds over time instead of depending solely on large one-time projects, and residual risks receive steady attention.

Implementation considerations: Protect a modest capacity for improvement amid break/fix work. Measure completion of agreed actions, not activity volume. Do not promise specific StackScore gains; score movement depends on which items are completed and how thoroughly.

---

#### REC-TS-008 — Define a technology vision

**Proposed title:** Define a clear technology vision for the organization

**businessImpact:** Without a shared technology vision, teams make local tool choices that conflict, and multi-year investments lack a north star. Vendors and staff receive mixed signals about what “good” looks like.

**description:**

Finding: Assessment responses indicate a technology vision is missing or unclear. This is an organizational clarity finding from the assessment, not a technical vulnerability claim. “No” means no articulated vision; “Partially” means informal ideas exist without documented agreement.

Recommended action: Draft a short technology vision (one page or less) describing how technology should enable the business over the next 2–3 years—reliability, security posture, customer experience, and operating model. Confirm it with leadership and use it to test major decisions.

Expected outcome: Roadmap and purchase decisions have a shared directional filter, reducing contradictory initiatives.

Implementation considerations: Keep language business-readable. Revisit annually or after strategy shifts. Vision should guide—not replace—budget and risk prioritization.

---

#### REC-TS-009 — Perform executive technology reviews

**Proposed title:** Conduct executive technology reviews on a defined schedule

**businessImpact:** When executives do not review technology health, priorities, and risks, decisions default to the loudest incident. Strategic work loses sponsorship and funding clarity.

**description:**

Finding: Assessment responses indicate executive technology reviews are not performed reliably. This reflects reported governance cadence, not meeting-minute forensics. “No” means reviews rarely occur; “Partially” means occasional discussions without a standing rhythm.

Recommended action: Schedule a recurring executive technology review (for example quarterly) covering StackScore/pillar health, top risks, roadmap status, budget outlook, and decisions needed. Capture actions and owners. Use Business Reviews or strategy sessions where those forums already exist.

Expected outcome: Leadership stays informed enough to approve sequencing and tradeoffs before problems become outages.

Implementation considerations: Keep materials executive-short. Separate informational updates from decision requests. Align with continuous improvement cadence (REC-TS-007).

---

#### REC-TS-010 — Assign technology leadership ownership

**Proposed title:** Assign clear technology leadership ownership

**businessImpact:** Ambiguous technology leadership slows decisions, blurs accountability with providers, and leaves risk ownership unclear. Improvements stall when nobody is empowered to prioritize.

**description:**

Finding: Assessment responses indicate technology leadership has not been clearly assigned. This is an organizational finding from the assessment. “No” means no named leader; “Partially” means informal influence without explicit authority.

Recommended action: Name the internal owner accountable for technology outcomes (and a backup), including roadmap sponsorship, budget advocacy, and provider oversight. Document decision rights versus any MSP or IT provider. Include this role in executive reviews.

Expected outcome: Prioritization and escalation have a clear internal point of accountability, improving follow-through on agreed work.

Implementation considerations: Ownership can be a business executive supported by technical providers; technical depth is less important than authority and cadence. Avoid equating “has admin passwords” with leadership ownership.

---

## 3. Phase 3 — Quality validation results

| Check | Result |
| --- | --- |
| Matches triggering question | Pass — each template maps 1:1 to DK/TS question above |
| Actionable steps | Pass — Recommended action is concrete SMB-scale work |
| Findings do not overstate assessment | Pass — each Finding states assessment-reported limits; No vs Partially distinguished |
| No raw question text in proposed titles | Pass — titles are imperative business language |
| No speculative $ / guaranteed score gains | Pass — explicitly avoided |
| No vendor lock-in | Pass — no required product brands |
| Priority/impact unchanged | Pass — proposal preserves catalog metadata |
| Duplicate/contradiction review | Pass — DK-008 framed as roll-up; TS items complementary (roadmap/budget/vision/governance) |
| Executive readability | Pass — written for nontechnical leaders |
| Approved IA/SO untouched | Pass — catalog file not edited |

Minor editorial notes for approvers:

- REC-DK-008 overlaps intentionally with other DK items; keep as the “supportability” outcome check.
- REC-TS-007 and REC-TS-009 reinforce cadence; wording avoids promising StackScore point gains.

---

## 4. Phase 4 — Tests performed

Commands:

```
npm test -- tests/recommendations/batch-b1-catalog.test.ts \
  tests/recommendations/b1-deliverable-quality.test.ts \
  tests/recommendations/visibility.test.ts \
  tests/recommendations/pdf-delivery-safeguards.test.ts \
  tests/client-roadmap/stub-visibility.test.ts
```

Expected with **no catalog publish** in this change set:

- B1 (IA/SO) remains the only approved 20 templates
- 60 stubs remain, including all DK/TS rows
- Client filters still hide stubs
- Scoring suites not required for content-only proposal (no scoring edits)

**Run results (2026-10-27, staging):**

| Suite | Result |
| --- | --- |
| `batch-b1-catalog.test.ts` | Pass (20 approved IA/SO; 60 stubs remain) |
| `b1-deliverable-quality.test.ts` | Pass |
| `visibility.test.ts` | Pass |
| `stub-visibility.test.ts` | Pass |
| `pdf-delivery-safeguards.test.ts` | Pass (updated assertion to SS-REL-013 audience helper; filter still enforced) |

Catalog JSON **unchanged** — unfinished DK/TS content remains non-customer-visible.

---

## 5. Items requiring approval

Before any catalog publish on staging:

1. **Editorial approval** of all 20 titles + description + businessImpact blocks above  
2. **Service label approval** (`Documentation & Knowledge Improvement`, `Technology Strategy Improvement`)  
3. **Explicit authority to set `isStub: false`** for `REC-DK-001`…`010` and `REC-TS-001`…`010`  
4. Confirmation that **priority and `estimatedImpactPoints` remain unchanged**  
5. Optional: sync published templates to DB via existing catalog sync path (no migration) after JSON update  
6. Optional follow-up: regenerate customer-facing narratives for assessments that previously only had stub titles (display already regenerates; stored historical text may still mention stubs until refreshed by policy)

**Not approved / not done in SS-CONTENT-001:** clearing stub flags, modifying `RecommendationCatalogV2.json`, production deploy.

---

## 6. Remaining unfinished templates (40)

| Pillar | Stub IDs | Count |
| --- | --- | --- |
| Endpoint Management | REC-EP-001 … REC-EP-010 | 10 |
| Network & Connectivity | REC-NC-001 … REC-NC-010 | 10 |
| Data Protection & Recovery | REC-DP-001 … REC-DP-010 | 10 |
| Productivity & Collaboration | REC-PC-001 … REC-PC-010 | 10 |

Suggested next content batch: **Endpoint Management** + **Data Protection & Recovery** (security/resilience adjacent to approved IA/SO).

---

## Appendix — Publish checklist (when approved)

1. Update only DK/TS rows in `data/RecommendationCatalogV2.json` with approved copy.  
2. Set `isStub: false` for those 20 IDs only.  
3. Leave IA/SO and other pillars unchanged.  
4. Extend/adjust catalog tests (current `batch-b1-catalog.test.ts` asserts non-B1 titles still start with `Improve ` — update that assertion when Batch 1 publishes).  
5. Run recommendation + visibility test suites.  
6. Spot-check client PDF/report for ABC LLC: DK/TS cards appear only after stub flags cleared.  
7. No scoring or impact-point edits.
