# DOC-101 — Bobkat IT Technology Standard

**Status:** Active  
**Owner:** Bobkat IT  
**Applies To:** StackScore, Bobkat IT assessments, recommendations, proposals, projects, managed services, and implementation playbooks

## 1. Purpose

The Bobkat IT Technology Standard defines the preferred technology stack used to design, improve, monitor, and support small and midsize business environments.

The standard exists to reduce unnecessary complexity, improve support consistency, accelerate implementation, strengthen security, and provide customers with a clearly documented technology direction.

## 2. Standard Philosophy

Bobkat IT does not recommend technology solely because it is popular or feature-rich. Technologies are selected because they are:

- Practical for small and midsize businesses
- Supportable by Bobkat IT
- Capable of centralized management
- Secure by default or capable of being securely configured
- Cost-conscious without sacrificing business reliability
- Compatible with repeatable implementation playbooks
- Able to produce measurable operational or business outcomes
- Appropriate for integration into StackScore assessments and roadmaps

## 3. Standardization Principles

### 3.1 Reduce Complexity

The supported technology stack should remain intentionally focused. Supporting fewer platforms allows Bobkat IT to build deeper expertise, better automations, stronger playbooks, and more predictable outcomes.

### 3.2 Increase Visibility

Every managed environment should provide clear visibility into network health, endpoint condition, patch status, backup condition, service availability, risk, and planned improvements.

### 3.3 Automate Repeatable Work

Health checks, patching, routine maintenance, alerting, reporting, and common remediation actions should be automated wherever practical.

### 3.4 Connect Technology to Business Outcomes

The catalog must explain why each technology matters to the business—not only what the technology does.

### 3.5 Improve Environments Over Time

Not every client will begin on the Bobkat IT Standard. StackScore should document the current state, identify gaps, and create a realistic roadmap toward the standard.

## 4. Core Technology Layers

| Layer | Standard Platform | Primary Purpose |
|---|---|---|
| Strategy and Improvement | StackScore | Assessment, prioritization, roadmap creation, reporting, and progress tracking |
| Endpoint Operations | NinjaOne | RMM, patching, automation, remote support, vulnerability visibility, and backup |
| Network Infrastructure | Ubiquiti UniFi | Gateway, switching, wireless, cameras, access control, and centralized infrastructure management |
| Availability Monitoring | Uptime Kuma | Network device, server, application, website, and service availability monitoring |

## 5. Standard Relationship

The platforms work together as a unified operating model:

```text
Business Strategy and Technology Governance
                    |
               StackScore
                    |
Endpoint Operations and Service Delivery
                    |
                NinjaOne
                    |
Network and Physical Infrastructure
                    |
             Ubiquiti UniFi
                    |
Infrastructure and Service Availability
                    |
              Uptime Kuma
```

## 6. Catalog Classification

Each technology record should include:

- Technology name
- Vendor
- Product family
- Category
- Standard status
- Lifecycle status
- Summary
- Primary purpose
- Why Bobkat IT selected it
- Business outcomes
- Core capabilities
- Standard deployment model
- Supported use cases
- Limitations and exceptions
- Dependencies
- Integrations
- Managed service applicability
- StackScore pillar mappings
- Recommendation mappings
- Related implementation playbooks
- Product or hardware models
- Licensing notes
- Last review date
- Catalog owner

## 7. Standard Status Values

| Status | Meaning |
|---|---|
| Preferred | Default Bobkat IT recommendation |
| Approved | Supported and acceptable for defined use cases |
| Conditional | Allowed only when specific technical or business conditions are met |
| Existing Environment | Supported temporarily while a roadmap is developed |
| Legacy | Should not be used for new deployments |
| Prohibited | Not supported or approved |

## 8. Lifecycle Status Values

- Current
- Review Required
- End of Sale
- End of Support
- Replacement Planned
- Retired

## 9. Exception Handling

Exceptions may be approved when:

- A client has a valid contractual or regulatory requirement
- A line-of-business application requires a specific platform
- Replacing an existing platform would create unreasonable cost or operational risk
- The alternative provides an equivalent or better security and support outcome

Every exception should include:

- Business justification
- Technical justification
- Risk considerations
- Support expectations
- Review date
- Long-term disposition

## 10. Review Cadence

The Bobkat IT Technology Standard should be reviewed at least twice per year and whenever:

- A preferred vendor materially changes licensing
- A product reaches end of support
- A security concern affects the platform
- A better-supported replacement becomes available
- Bobkat IT changes its managed service model
