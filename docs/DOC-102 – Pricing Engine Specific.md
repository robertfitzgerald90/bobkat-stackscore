# DOC-102 – Pricing Engine Specification

**Document ID:** DOC-102
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# Purpose

The Pricing Engine defines how BobKat IT calculates the financial value of services, products, projects, and managed service offerings.

Its purpose is to ensure every proposal is:

* Consistent
* Profitable
* Transparent
* Repeatable
* Easy to modify over time

The Pricing Engine separates business rules from configurable rates, allowing pricing to evolve without changing application logic.

---

# Pricing Philosophy

BobKat IT does not compete solely on price.

We compete through:

* Professionalism
* Clarity
* Consistency
* Executive communication
* Measurable technology improvements

Every Technology Improvement Plan should clearly explain:

* Current Technology Profile
* Business risks
* Recommended improvements
* Expected business outcomes
* Investment required

Clients purchase business outcomes—not labor hours.

---

# Pricing Architecture

Pricing consists of four primary components.

1. Professional Services
2. Hardware & Software
3. Managed Technology Program
4. Taxes & Adjustments

Each component is calculated independently before producing the final investment summary.

---

# Professional Services

## Commercial

Default Labor Rate

**$150/hour**

Minimum Billing

**1 Hour**

Emergency / After Hours

**1.5× Standard Rate**

Weekend

**1.5× Standard Rate**

Holiday

**1.5× Standard Rate**

Travel time may be billed when applicable.

---

## Residential

Trip Charge

**$75**

Labor Rate

**$100/hour**

Minimum Billing

**1 Hour**

Emergency / After Hours

**1.5× Standard Rate**

Residential services are billed independently from commercial pricing.

---

# Hardware Pricing

The Pricing Engine shall separate:

* Vendor Cost
* Customer Price

Every product shall contain:

* Acquisition Cost
* Markup Rule
* Customer Price

Markup percentages remain configurable.

Suggested default policy:

| Acquisition Cost | Default Markup |
| ---------------: | -------------: |
|       Under $100 |            35% |
|      $100 – $500 |            25% |
|    $500 – $2,000 |            18% |
|     Above $2,000 |            12% |

Markup rules may be overridden by administrators.

---

# Managed Technology Program

The Managed Technology Program is composed of modular service components.

Clients purchase only the services applicable to their environment.

Modules are additive.

---

## Foundation

Examples

* Device Monitoring
* Patch Management
* Asset Inventory
* Documentation

---

## Security

Examples

* Endpoint Protection
* Vulnerability Monitoring
* Security Reporting

---

## Microsoft 365

Examples

* Microsoft 365 Backup
* User Administration
* License Management

---

## Business Continuity

Examples

* Backup Monitoring
* Backup Verification
* Disaster Recovery Reviews

---

## Strategic Services

Examples

* Quarterly Technology Review
* Technology Profile Updates
* Technology Roadmap Reviews
* Executive Reporting

Strategic services increase the long-term value of the Managed Technology Program.

---

# Internal Financial Calculations

The Pricing Engine shall calculate:

* Revenue
* Labor Cost
* Hardware Cost
* Software Cost
* Travel Cost
* Gross Profit
* Gross Margin
* Estimated Labor Hours
* Estimated Completion Time

These values are visible only to administrators.

---

# Customer Investment Summary

Clients shall only see:

* Professional Services
* Hardware & Software
* Managed Technology Program
* Taxes
* Total Investment

Internal costs and margins shall never appear in customer-facing documents.

---

# Tax Engine

Tax shall be configurable.

Administrators shall define:

* Tax Rate
* Taxable Services
* Taxable Products
* Jurisdiction

The Pricing Engine shall calculate tax automatically.

---

# Discounts

Supported discount types include:

* Percentage Discount
* Fixed Dollar Discount
* Managed Client Discount
* Promotional Discount
* Nonprofit Discount

Every discount shall record:

* Reason
* Authorizing User
* Date Applied

---

# Profitability Analysis

Every proposal shall calculate:

* Gross Revenue
* Estimated Cost
* Gross Profit
* Gross Margin

Margin thresholds:

| Margin    | Status          |
| --------- | --------------- |
| Under 25% | Review Required |
| 25–35%    | Acceptable      |
| 35–50%    | Target          |
| Above 50% | Exceptional     |

Administrators may override warnings.

---

# Proposal Health

Before a Technology Improvement Plan can be finalized, StackScore shall validate:

✓ Pricing complete

✓ Tax configured

✓ Labor estimate present

✓ Hardware pricing complete

✓ Margin meets target

✓ Timeline included

✓ Executive summary included

✓ Expected Technology Profile improvement calculated

Proposal Health shall be displayed as an internal readiness score.

---

# Configurable System Values

The following values shall be configurable through Administration.

* Commercial Hourly Rate
* Residential Hourly Rate
* Trip Charge
* Emergency Labor Multiplier
* Hardware Markup Rules
* Tax Rate
* Managed Technology Program Module Pricing
* Discount Policies
* Margin Thresholds

No pricing values shall be hard-coded within the application.

---

# Relationship to Other Modules

Assessment

↓

Technology Profile

↓

Improvement Opportunities

↓

Solution Playbooks

↓

Recommended Services

↓

Pricing Engine

↓

Technology Improvement Plan

↓

Projects

The Pricing Engine determines the financial investment associated with implementing the recommended improvements.

---

# Business Rules

* Pricing calculations shall remain independent from service definitions.
* Products shall maintain separate acquisition cost and customer price.
* Internal profitability shall never be visible to clients.
* Pricing shall remain editable by authorized administrators.
* Every proposal shall pass Proposal Health validation prior to client delivery.

---

# Future Enhancements

Future versions may include:

* Vendor API integrations
* Automatic distributor pricing
* Dynamic margin optimization
* Subscription forecasting
* Multi-currency support
* Financing calculations
* Leasing options
* Payment schedule generation

---

# Acceptance Criteria

The Pricing Engine Specification is considered complete when:

* Every proposal is priced consistently.
* Internal profitability is automatically calculated.
* Managed services support modular pricing.
* Taxes are configurable.
* Proposal Health validates pricing quality.
* Pricing rules remain configurable without modifying application code.

---

# Related Documents

* DOC-100 – Service Catalog Specification
* DOC-101 – Approved Technology Catalog Specification
* DOC-103 – Proposal Engine Specification
* DOC-106 – Solution Playbook Specification

---

# Revision History

| Version | Date       | Author    | Changes                              |
| ------- | ---------- | --------- | ------------------------------------ |
| 1.0     | 2026-06-25 | BobKat IT | Initial Pricing Engine Specification |
