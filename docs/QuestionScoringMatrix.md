# BobKat StackScore - Question Scoring Matrix v1

## Purpose

This document is the authoritative scoring reference for all 50 assessment questions in v1. It defines question weights, answer option point values, risk levels, and recommendation template linkage.

**Related documents:** [AssessmentQuestions.md](AssessmentQuestions.md), [ScoringSpecification.md](ScoringSpecification.md), [RecommendationRuleCatalog.json](RecommendationRuleCatalog.json)

---

## Scoring Patterns

### Pattern A — Partial Compliance (Yes / Partial / No variants)

| Answer tier | Score formula |
| ----------- | ------------- |
| Best        | Full weight   |
| Middle      | 50% of weight (rounded down, minimum 1 if weight ≥ 2) |
| Worst       | 0             |

### Pattern B — Lifecycle (age-based)

| Answer tier     | Score formula |
| --------------- | ------------- |
| Best (newest)   | Full weight   |
| Middle          | 67% of weight (rounded) |
| Worst (oldest)  | 0             |

### Pattern C — Inverse Risk (None / Some / Many)

Best answer receives full weight; middle receives 33% (rounded); worst receives 0.

### Pattern D — Frequency (best / middle / worst cadence)

Same as Pattern A.

### Pattern E — Restore Confidence (Yes / Unsure / No)

| Answer | Score formula |
| ------ | ------------- |
| Yes    | Full weight   |
| Unsure | 33% of weight (rounded) |
| No     | 0             |

---

## Category Weight Summary

| Category | Questions | Max Points |
| -------- | --------: | ---------: |
| Security & Protection | 10 | 20 |
| Backup & Recovery | 8 | 20 |
| Infrastructure & Network Health | 7 | 15 |
| Endpoint & Asset Management | 7 | 15 |
| Documentation & Operational Readiness | 7 | 10 |
| Business Continuity & Disaster Recovery | 6 | 10 |
| Strategic Technology Management | 5 | 10 |
| **Total** | **50** | **100** |

---

## Security & Protection (20 Points)

| ID | Question | Weight | Pattern | Risk (worst answer) | Rec Template |
| -- | -------- | -----: | ------- | ------------------- | ------------ |
| Q01 | Is MFA enabled for all Microsoft 365 users? | 3 | A | critical | `SEC-MFA-ALL` |
| Q02 | Is MFA required for all administrative accounts? | 2 | A | high | `SEC-MFA-ADMIN` |
| Q03 | Is endpoint protection installed on all devices? | 3 | A | critical | `SEC-ENDPOINT-DEPLOY` |
| Q04 | Is endpoint protection actively monitored? | 2 | A | high | `SEC-ENDPOINT-MONITOR` |
| Q05 | Are operating system updates managed centrally? | 2 | A | high | `SEC-PATCH-CENTRAL` |
| Q06 | Are critical security patches installed within 30 days? | 2 | A | high | `SEC-PATCH-TIMELY` |
| Q07 | Is advanced email filtering in place? | 2 | A | medium | `SEC-EMAIL-FILTER` |
| Q08 | Has phishing awareness training been conducted within the last year? | 1 | A | medium | `SEC-PHISHING-TRAIN` |
| Q09 | Are user accounts reviewed regularly? | 1 | D | medium | `SEC-ACCOUNT-REVIEW` |
| Q10 | Are former employee accounts disabled immediately upon termination? | 2 | A | high | `SEC-OFFBOARD-ACCOUNTS` |

### Q01 — MFA for Microsoft 365 users

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 3 | false |
| Partial | 1 | false |
| No | 0 | true |

### Q02 — MFA for administrative accounts

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Partial | 1 | false |
| No | 0 | false |

### Q03 — Endpoint protection installed

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 3 | false |
| Most Devices | 1 | false |
| No | 0 | true |

### Q04 — Endpoint protection monitored

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Limited Monitoring | 1 | false |
| No | 0 | false |

### Q05 — OS updates managed centrally

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Partially | 1 | false |
| No | 0 | false |

### Q06 — Critical patches within 30 days

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Sometimes | 1 | false |
| No | 0 | false |

### Q07 — Advanced email filtering

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Basic Spam Filtering | 1 | false |
| No | 0 | false |

### Q08 — Phishing awareness training

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 1 | false |
| More than 1 Year Ago | 0 | false |
| Never | 0 | false |

### Q09 — User account reviews

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Quarterly | 1 | false |
| Annually | 0 | false |
| Never | 0 | false |

### Q10 — Former employee account disablement

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Always | 2 | false |
| Usually | 1 | false |
| No Formal Process | 0 | false |

---

## Backup & Recovery (20 Points)

| ID | Question | Weight | Pattern | Risk (worst answer) | Rec Template |
| -- | -------- | -----: | ------- | ------------------- | ------------ |
| Q11 | Are servers backed up? | 4 | A | critical | `BKP-SERVER` |
| Q12 | Are critical workstations backed up? | 2 | A | high | `BKP-WORKSTATION` |
| Q13 | Is Microsoft 365 data backed up separately? | 3 | A | critical | `BKP-M365` |
| Q14 | Have backups been tested within the last 90 days? | 3 | A | high | `BKP-TEST-90` |
| Q15 | Has a full restore been successfully performed? | 2 | E | high | `BKP-RESTORE-VALIDATE` |
| Q16 | Are backups stored offsite? | 2 | A | high | `BKP-OFFSITE` |
| Q17 | Are backups protected from ransomware or deletion? | 3 | A | critical | `BKP-RANSOMWARE` |
| Q18 | Are backup failures monitored and reviewed? | 1 | A | medium | `BKP-MONITOR` |

### Q11 — Server backups

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 4 | false |
| Some Systems | 2 | false |
| No | 0 | true |

### Q12 — Workstation backups

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Some Systems | 1 | false |
| No | 0 | false |

### Q13 — Microsoft 365 backup

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 3 | false |
| Partial | 1 | false |
| No | 0 | true |

### Q14 — Backup testing (90 days)

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 3 | false |
| Within Last Year | 1 | false |
| Never | 0 | false |

### Q15 — Full restore performed

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Unsure | 1 | false |
| No | 0 | false |

### Q16 — Offsite backups

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Partial | 1 | false |
| No | 0 | false |

### Q17 — Ransomware backup protection

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 3 | false |
| Partial Protection | 1 | false |
| No | 0 | true |

### Q18 — Backup failure monitoring

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 1 | false |
| Occasionally | 0 | false |
| No | 0 | false |

---

## Infrastructure & Network Health (15 Points)

| ID | Question | Weight | Pattern | Risk (worst answer) | Rec Template |
| -- | -------- | -----: | ------- | ------------------- | ------------ |
| Q19 | How old is the primary firewall? | 3 | B | critical | `INF-FIREWALL-AGE` |
| Q20 | How old are the primary switches? | 2 | B | high | `INF-SWITCH-AGE` |
| Q21 | Is wireless coverage adequate throughout the facility? | 2 | A | medium | `INF-WIRELESS` |
| Q22 | Is there a UPS protecting critical systems? | 2 | A | medium | `INF-UPS` |
| Q23 | Is there internet redundancy? | 2 | A | medium | `INF-ISP-REDUNDANCY` |
| Q24 | Is network equipment actively monitored? | 2 | A | high | `INF-NETWORK-MONITOR` |
| Q25 | Are guest and business networks separated? | 2 | A | high | `INF-SEGMENTATION` |

### Q19 — Firewall age

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Less than 5 Years | 3 | false |
| 5-8 Years | 2 | false |
| More than 8 Years | 0 | true |

### Q20 — Switch age

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Less than 5 Years | 2 | false |
| 5-8 Years | 1 | false |
| More than 8 Years | 0 | false |

### Q21 — Wireless coverage

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Some Coverage Issues | 1 | false |
| Significant Issues | 0 | false |

### Q22 — UPS protection

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Partial Coverage | 1 | false |
| No | 0 | false |

### Q23 — Internet redundancy

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Limited Redundancy | 1 | false |
| No | 0 | false |

### Q24 — Network monitoring

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Partial Monitoring | 1 | false |
| No | 0 | false |

### Q25 — Network segmentation

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Partial Separation | 1 | false |
| No | 0 | false |

---

## Endpoint & Asset Management (15 Points)

| ID | Question | Weight | Pattern | Risk (worst answer) | Rec Template |
| -- | -------- | -----: | ------- | ------------------- | ------------ |
| Q26 | Is there a complete inventory of company devices? | 2 | A | medium | `END-INVENTORY` |
| Q27 | Are endpoints centrally managed? | 3 | A | high | `END-CENTRAL-MGMT` |
| Q28 | Is remote support capability available? | 2 | A | medium | `END-REMOTE-SUPPORT` |
| Q29 | Are device warranties tracked? | 1 | A | low | `END-WARRANTY` |
| Q30 | Is there a defined hardware replacement cycle? | 2 | A | medium | `END-LIFECYCLE` |
| Q31 | Are unsupported operating systems present? | 3 | C | critical | `END-UNSUPPORTED-OS` |
| Q32 | Are devices monitored for health and performance? | 2 | A | high | `END-HEALTH-MONITOR` |

### Q26 — Device inventory

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Partial Inventory | 1 | false |
| No | 0 | false |

### Q27 — Centralized endpoint management

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 3 | false |
| Some Devices | 1 | false |
| No | 0 | false |

### Q28 — Remote support capability

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Limited | 1 | false |
| No | 0 | false |

### Q29 — Warranty tracking

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 1 | false |
| Some Devices | 0 | false |
| No | 0 | false |

### Q30 — Hardware replacement cycle

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Informal | 1 | false |
| No | 0 | false |

### Q31 — Unsupported operating systems

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| None | 3 | false |
| Some | 1 | false |
| Many | 0 | true |

### Q32 — Device health monitoring

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Limited Monitoring | 1 | false |
| No | 0 | false |

---

## Documentation & Operational Readiness (10 Points)

| ID | Question | Weight | Pattern | Risk (worst answer) | Rec Template |
| -- | -------- | -----: | ------- | ------------------- | ------------ |
| Q33 | Is there a current network diagram? | 2 | A | medium | `DOC-NETWORK-DIAGRAM` |
| Q34 | Are vendor contacts documented? | 1 | A | low | `DOC-VENDOR-CONTACTS` |
| Q35 | Are administrative credentials securely stored? | 2 | A | high | `DOC-CREDENTIAL-VAULT` |
| Q36 | Are critical IT procedures documented? | 2 | A | medium | `DOC-IT-PROCEDURES` |
| Q37 | Is there an employee onboarding procedure? | 1 | A | medium | `DOC-ONBOARDING` |
| Q38 | Is there an employee offboarding procedure? | 1 | A | medium | `DOC-OFFBOARDING` |
| Q39 | Is software licensing tracked? | 1 | A | low | `DOC-LICENSING` |

### Q33 — Network diagram

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Outdated | 1 | false |
| No | 0 | false |

### Q34 — Vendor contacts

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 1 | false |
| Partial | 0 | false |
| No | 0 | false |

### Q35 — Administrative credentials storage

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Partial | 1 | false |
| No | 0 | false |

### Q36 — Critical IT procedures

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Partial | 1 | false |
| No | 0 | false |

### Q37 — Employee onboarding procedure

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 1 | false |
| Informal | 0 | false |
| No | 0 | false |

### Q38 — Employee offboarding procedure

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 1 | false |
| Informal | 0 | false |
| No | 0 | false |

### Q39 — Software licensing tracking

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 1 | false |
| Partial | 0 | false |
| No | 0 | false |

---

## Business Continuity & Disaster Recovery (10 Points)

| ID | Question | Weight | Pattern | Risk (worst answer) | Rec Template |
| -- | -------- | -----: | ------- | ------------------- | ------------ |
| Q40 | Is there a documented disaster recovery plan? | 3 | A | high | `BCDR-DR-PLAN` |
| Q41 | Has the disaster recovery plan been tested? | 2 | D | high | `BCDR-DR-TEST` |
| Q42 | Can employees work remotely during a facility outage? | 2 | A | medium | `BCDR-REMOTE-WORK` |
| Q43 | Are emergency contact procedures documented? | 1 | A | medium | `BCDR-EMERGENCY-CONTACTS` |
| Q44 | Is critical equipment protected from flooding or environmental hazards? | 1 | A | medium | `BCDR-ENVIRONMENTAL` |
| Q45 | Is generator power available for critical systems? | 1 | A | low | `BCDR-GENERATOR` |

### Q40 — Disaster recovery plan

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 3 | false |
| Draft Exists | 1 | false |
| No | 0 | false |

### Q41 — DR plan tested

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Within Last Year | 2 | false |
| More than 1 Year Ago | 1 | false |
| Never | 0 | false |

### Q42 — Remote work during outage

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Limited Capability | 1 | false |
| No | 0 | false |

### Q43 — Emergency contact procedures

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 1 | false |
| Partial | 0 | false |
| No | 0 | false |

### Q44 — Environmental hazard protection

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 1 | false |
| Partial | 0 | false |
| No | 0 | false |

### Q45 — Generator power

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 1 | false |
| Limited | 0 | false |
| No | 0 | false |

---

## Strategic Technology Management (10 Points)

| ID | Question | Weight | Pattern | Risk (worst answer) | Rec Template |
| -- | -------- | -----: | ------- | ------------------- | ------------ |
| Q46 | Is there a documented technology roadmap? | 2 | A | medium | `STR-ROADMAP` |
| Q47 | Is technology spending budgeted annually? | 2 | A | medium | `STR-BUDGET` |
| Q48 | Are technology risks reviewed with leadership? | 2 | D | medium | `STR-LEADERSHIP-REVIEW` |
| Q49 | Are hardware refreshes planned proactively? | 2 | A | medium | `STR-HARDWARE-REFRESH` |
| Q50 | Does leadership receive regular technology status reports? | 2 | D | low | `STR-STATUS-REPORTS` |

### Q46 — Technology roadmap

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Informal | 1 | false |
| No | 0 | false |

### Q47 — Annual technology budget

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Sometimes | 1 | false |
| No | 0 | false |

### Q48 — Leadership technology risk reviews

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Quarterly | 2 | false |
| Annually | 1 | false |
| Never | 0 | false |

### Q49 — Proactive hardware refresh planning

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Yes | 2 | false |
| Sometimes | 1 | false |
| No | 0 | false |

### Q50 — Leadership technology status reports

| Answer | scoreValue | triggersCriticalFlag |
| ------ | ---------: | -------------------- |
| Monthly | 2 | false |
| Occasionally | 1 | false |
| Never | 0 | false |

---

## Critical Risk Flag Summary

Answers with `triggersCriticalFlag: true` surface a **Critical Exposure Warning** on the assessment report regardless of overall score. See [ScoringSpecification.md](ScoringSpecification.md).

| Question | Trigger answer |
| -------- | -------------- |
| Q01 | No |
| Q03 | No |
| Q11 | No |
| Q13 | No |
| Q17 | No |
| Q19 | More than 8 Years |
| Q31 | Many |

---

## Validation Rules

1. Sum of question weights per category must equal category `maxPoints`.
2. Sum of all category `maxPoints` must equal 100.
3. Every answer option `scoreValue` must be between 0 and question weight (inclusive).
4. At least one answer per question must equal full weight.
5. Recommendation triggers fire on worst-tier answers (scoreValue = 0) unless noted in [RecommendationRuleCatalog.json](RecommendationRuleCatalog.json).

---

## Seed Data Notes

When seeding the database:

- `Assessment Questions.weight` = weight column above
- `Assessment Questions.riskLevel` = worst-answer risk column (low / medium / high / critical)
- `Answer Options.scoreValue` = values in tables above
- `Answer Options.triggersRecommendation` = true when worst-tier answer and a rec template exists
- `Answer Options.recommendationTemplateId` = link to template by code (e.g. `SEC-MFA-ALL`)
