# BobKat StackScore - Score Calculation Methodology

## Purpose

This document defines how StackScore calculates category scores, overall scores, risk ratings, recommendation priorities, and projected improvement scores.

The objective of StackScore is not to measure technology complexity.

The objective is to measure business technology maturity and identify areas where operational, security, and continuity risks exist.

---

# Core Scoring Philosophy

Technology should be evaluated based on business impact.

Business owners do not care about:

* VLANs
* SPF Records
* Firewall Rules
* DHCP Servers

Business owners care about:

* Can employees work?
* Is company data protected?
* Can operations continue during an outage?
* Can the business recover from an incident?

StackScore translates technical findings into business risk scores.

---

# Overall Scoring Model

The maximum possible StackScore is 100.

Each category contributes a weighted percentage to the final score.

## Category Weights

| Category                                | Weight |
| --------------------------------------- | -----: |
| Security & Protection                   |    20% |
| Backup & Recovery                       |    20% |
| Infrastructure & Network Health         |    15% |
| Endpoint & Asset Management             |    15% |
| Documentation & Operational Readiness   |    10% |
| Business Continuity & Disaster Recovery |    10% |
| Strategic Technology Management         |    10% |

Total Weight = 100%

---

# Question Scoring Model

Each assessment question contains:

* A maximum point value
* Answer options
* Point values assigned to each answer

## Example

Question:

Is MFA enabled for all Microsoft 365 users?

Maximum Points = 5

### Answer Values

| Answer  | Points |
| ------- | -----: |
| Yes     |      5 |
| Partial |      2 |
| No      |      0 |

---

# Question Types

## Binary Questions

Example:

Is endpoint protection installed?

| Answer | Points |
| ------ | -----: |
| Yes    |      5 |
| No     |      0 |

---

## Partial Compliance Questions

Example:

Is MFA enabled?

| Answer  | Points |
| ------- | -----: |
| Yes     |      5 |
| Partial |      2 |
| No      |      0 |

---

## Lifecycle Questions

Example:

Firewall Age

| Answer        | Points |
| ------------- | -----: |
| Under 5 Years |      5 |
| 5-8 Years     |      3 |
| Over 8 Years  |      0 |

---

# Category Score Calculation

Each category is scored independently.

## Formula

Category Score %

=
(Points Earned ÷ Points Possible)
× 100

---

## Example

Security Category

| Question          | Max Points | Earned |
| ----------------- | ---------: | -----: |
| MFA               |          5 |      5 |
| Endpoint Security |          5 |      4 |
| Patching          |          5 |      3 |
| Email Security    |          5 |      4 |

Points Earned = 16

Points Possible = 20

Security Score

=
16 ÷ 20

=
80%

---

# Overall StackScore Calculation

The overall score is calculated using weighted category scores.

## Formula

(Security Score × 20%)

*

(Backup Score × 20%)

*

(Infrastructure Score × 15%)

*

(Endpoint Score × 15%)

*

(Documentation Score × 10%)

*

(BCDR Score × 10%)

*

(Strategic Score × 10%)

---

## Example

| Category       | Score | Weight |
| -------------- | ----: | -----: |
| Security       |    80 |    20% |
| Backup         |    70 |    20% |
| Infrastructure |    90 |    15% |
| Endpoint       |    85 |    15% |
| Documentation  |    60 |    10% |
| BCDR           |    50 |    10% |
| Strategic      |    75 |    10% |

Weighted Score

=
16 + 14 + 13.5 + 12.75 + 6 + 5 + 7.5

=

74.75

Rounded

=

75

Final Rating = Stable

---

# Rating Bands

## Exceptional

Score: 90-100

Characteristics:

* Mature environment
* Strong security controls
* Tested recovery procedures
* Strategic technology management

Risk Level: Low

---

## Strong

Score: 80-89

Characteristics:

* Healthy environment
* Minor improvement opportunities

Risk Level: Low to Moderate

---

## Stable

Score: 70-79

Characteristics:

* Functional environment
* Multiple improvement opportunities

Risk Level: Moderate

---

## At Risk

Score: 60-69

Characteristics:

* Significant weaknesses exist
* Increased operational risk

Risk Level: High

---

## Critical

Score: Below 60

Characteristics:

* Immediate concerns
* Increased likelihood of security incidents, downtime, or data loss

Risk Level: Severe

---

# Risk Multiplier Logic

Certain answers represent elevated business risk and may reduce scores beyond normal point deductions.

These are considered Critical Risk Findings.

## Examples

### No Backups

Severity: Critical

### No MFA

Severity: Critical

### Unsupported Firewall

Severity: Critical

### No Disaster Recovery Plan

Severity: High

### No Endpoint Protection

Severity: Critical

### No Administrative Password Management

Severity: Critical

---

# Critical Risk Indicator

Critical findings create a visible warning regardless of overall score.

Example:

Overall Score = 82

Critical Findings:

* No Microsoft 365 Backup
* No MFA

Result:

Status:

Strong Score

BUT

Critical Security Exposure Detected

This prevents businesses from appearing healthy while carrying major risks.

---

# Recommendation Priority Calculation

Recommendations are assigned priority based on business impact.

## Critical

Immediate risk of:

* Data loss
* Security compromise
* Business interruption

Examples:

* No backups
* No MFA
* Unsupported firewall

---

## High

Significant operational risk.

Examples:

* No disaster recovery plan
* No patch management
* No endpoint monitoring

---

## Medium

Improves resilience and efficiency.

Examples:

* Missing network documentation
* No asset inventory
* No technology roadmap

---

## Low

Optimization opportunities.

Examples:

* Improve reporting
* Improve lifecycle planning
* Additional documentation

---

# Project Impact Scoring

Each recommendation includes a projected score improvement.

## Example

Current Score

63

Recommendations

| Project                    | Impact |
| -------------------------- | -----: |
| Enable MFA                 |     +8 |
| Deploy Endpoint Management |     +6 |
| Implement M365 Backup      |    +10 |

Potential Improvement

=

24 Points

Projected Score

=

87

---

# Client Progress Tracking

The platform tracks score improvements over time.

Example:

## Initial Assessment

58

Critical

---

## Six Months

73

Stable

---

## One Year

88

Strong

---

This allows BobKat IT to demonstrate measurable business value.

---

# Executive Summary Logic

Every assessment should produce:

## Overall Score

Example:

75 / 100

Stable

---

## Top Strengths

Highest scoring categories.

Example:

* Infrastructure
* Endpoint Management

---

## Top Risks

Lowest scoring categories.

Example:

* Backup & Recovery
* Business Continuity

---

## Recommended Next Actions

Highest priority recommendations.

---

# Future Enhancement Opportunities

Future versions of StackScore may include:

* Industry-specific weighting
* Compliance scoring
* Insurance readiness scoring
* Cybersecurity maturity scoring
* Automated score adjustments from integrations
* AI-generated executive summaries
* Benchmark comparisons against similar businesses

---

# Guiding Principle

The goal of StackScore is not to produce technical reports.

The goal is to help business leaders understand risk, prioritize improvements, and make informed technology decisions.
