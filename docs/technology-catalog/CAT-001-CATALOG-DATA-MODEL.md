# CAT-001 — Technology Catalog Data Model

## 1. Objective

The Technology Catalog must support real-world products, service platforms, hardware families, deployment guidance, StackScore mappings, and implementation playbooks.

The module should be data-driven rather than hard-coded into the user interface.

## 2. Primary Entity: Technology

### Required Fields

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| slug | String | URL-safe unique identifier |
| name | String | Display name |
| vendor | String | Technology vendor |
| productFamily | String | Product family or platform |
| categoryId | UUID | Related technology category |
| summary | Text | Short catalog summary |
| purpose | Text | Primary role in the Bobkat IT Standard |
| standardStatus | Enum | Preferred, Approved, Conditional, Existing, Legacy, Prohibited |
| lifecycleStatus | Enum | Current, ReviewRequired, EndOfSale, EndOfSupport, ReplacementPlanned, Retired |
| isFeatured | Boolean | Highlights the technology in the catalog |
| isActive | Boolean | Controls visibility |
| icon | String | Icon key or asset path |
| websiteUrl | String | Optional vendor or product URL |
| documentationUrl | String | Optional documentation URL |
| lastReviewedAt | DateTime | Governance review date |
| createdAt | DateTime | Record creation date |
| updatedAt | DateTime | Record update date |

### Extended Content Fields

- whySelected
- businessValue
- technicalOverview
- standardDeployment
- supportScope
- limitations
- licensingNotes
- securityNotes
- operationalNotes

These may be stored as Markdown-enabled text.

## 3. Supporting Entities

### TechnologyCategory

Examples:

- Network Infrastructure
- Endpoint Management
- Backup and Recovery
- Monitoring and Visibility
- Security
- Identity and Access
- Business Applications
- Cloud and Collaboration
- Documentation and Governance

### TechnologyCapability

Represents individual capabilities such as:

- Remote monitoring
- OS patching
- Third-party patching
- Endpoint backup
- Vulnerability scanning
- Network gateway
- Managed switching
- Wireless access
- Service uptime monitoring
- Technology maturity assessments
- Roadmap generation

Fields:

- id
- technologyId
- name
- description
- capabilityType
- displayOrder

### TechnologyProduct

Represents real hardware models, software editions, or service packages.

Fields:

- id
- technologyId
- name
- modelNumber
- productType
- summary
- recommendedUseCase
- environmentSize
- lifecycleStatus
- isPreferred
- specificationsJson
- notes
- displayOrder

### TechnologyBusinessOutcome

Examples:

- Reduced downtime
- Faster support response
- Improved patch compliance
- Improved executive visibility
- Better lifecycle planning
- Reduced infrastructure complexity

### TechnologyUseCase

Examples:

- Five-person professional services office
- Multi-site small business
- Small manufacturing environment
- Customer-facing office with guest Wi-Fi
- Remote workforce
- Server and network monitoring

### TechnologyIntegration

Defines relationships between catalog technologies.

Examples:

- NinjaOne endpoint condition feeds StackScore review conversations
- Uptime Kuma monitors UniFi gateways, switches, access points, and servers
- StackScore recommendations generate projects and playbooks
- NinjaOne supports remediation actions identified during StackScore assessments

### TechnologyPillarMapping

Fields:

- technologyId
- pillarId
- relationshipType
- explanation
- weightingRelevance

Relationship types:

- Primary
- Supporting
- Informational

### TechnologyRecommendationMapping

Fields:

- technologyId
- recommendationTemplateId
- relationshipType
- implementationPriority
- notes

### TechnologyPlaybookMapping

Fields:

- technologyId
- playbookId
- relationshipType
- notes

## 4. Suggested Prisma Enums

```prisma
enum TechnologyStandardStatus {
  PREFERRED
  APPROVED
  CONDITIONAL
  EXISTING_ENVIRONMENT
  LEGACY
  PROHIBITED
}

enum TechnologyLifecycleStatus {
  CURRENT
  REVIEW_REQUIRED
  END_OF_SALE
  END_OF_SUPPORT
  REPLACEMENT_PLANNED
  RETIRED
}
```

## 5. Seed Strategy

Initial seed data should create:

1. Core categories
2. Four featured technology platforms
3. Capabilities for each platform
4. Real-world product examples
5. Business outcomes
6. Integration relationships
7. StackScore pillar mappings
8. Placeholder playbook relationships

Seed data must be idempotent and safe to rerun.
