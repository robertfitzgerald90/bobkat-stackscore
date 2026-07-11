# Cursor Build Prompt — StackScore Technology Catalog

Use the Markdown files in `/docs/technology-catalog/` as the source of truth for the Technology Catalog module.

## Objective

Build a polished, production-quality Technology Catalog that showcases the Bobkat IT Standard using real products, real capabilities, practical deployment guidance, StackScore mappings, and future playbook relationships.

This should feel like a mature standards and architecture library—not a generic software inventory page.

## Required Work

### 1. Review Existing Architecture

Before making changes:

- Inspect the existing Prisma schema
- Inspect current navigation and route conventions
- Inspect the existing Technology Catalog implementation
- Reuse current authentication, organization, UI, table, badge, dialog, form, and layout patterns
- Do not create duplicate models if equivalent structures already exist
- Preserve existing data and migrations

### 2. Data Model

Implement or extend the data model defined in `CAT-001-CATALOG-DATA-MODEL.md`.

The model must support:

- Technologies
- Categories
- Capabilities
- Real-world products or editions
- Business outcomes
- Use cases
- Integrations
- StackScore pillar mappings
- Recommendation mappings
- Playbook mappings
- Standard status
- Lifecycle status
- Review dates
- Governance notes

Use normalized relational models where practical. Markdown-enabled long-text fields are acceptable for narrative content.

### 3. Seed Data

Create idempotent seed data for:

- Ubiquiti UniFi
- NinjaOne
- StackScore
- Uptime Kuma

Use the corresponding `TECH-*.md` files as the content source.

Seed:

- Categories
- Platform summaries
- Capabilities
- Business outcomes
- Product examples
- Standard deployment guidance
- StackScore pillar mappings
- Common recommendation relationships
- Placeholder playbook relationships

Do not use lorem ipsum or fake vendor names.

### 4. Catalog Landing Page

Build the experience defined in `CAT-002-UI-AND-MODULE-REQUIREMENTS.md`.

The page must include:

- Technology Catalog header
- Bobkat IT Standard subtitle
- Summary metric cards
- Four prominent featured technology cards
- Search
- Category filters
- Standard status filters
- Lifecycle filters
- Grid and table views
- Responsive behavior
- Empty, loading, and error states

The seeded page should look complete immediately and be suitable for product screenshots.

### 5. Technology Detail Page

Create a detailed page for each technology with tabs:

1. Overview
2. Capabilities
3. Products
4. Deployment Standard
5. Business Value
6. StackScore Mapping
7. Playbooks
8. Governance

Use real seeded content and clear visual hierarchy.

### 6. Admin Management

Authorized administrators should be able to:

- Add and edit technologies
- Activate or deactivate records
- Mark technologies as featured
- Change standard and lifecycle status
- Manage capabilities
- Manage products
- Manage mappings
- Record review dates
- Add governance notes

Read-only client users should not see administrative controls.

### 7. Visual Design

Match the existing StackScore design language and dark-blue theme.

Prioritize:

- Deep navy surfaces
- Compact information density
- Strong headings
- Layered cards
- Clean borders
- Blue or cyan accents
- Clear status badges
- Icon-led sections
- Responsive layouts
- Screenshot-ready presentation

Avoid excessive whitespace, generic placeholder cards, or a basic CRUD-table appearance.

### 8. Integration Readiness

Structure the module so future work can connect:

- Assessment questions to technologies
- Recommendations to preferred technologies
- Projects to implementation technologies
- Playbooks to catalog records
- Proposals to approved products and services
- Client environment records to installed technologies

### 9. Delivery Requirements

After implementation:

- Run Prisma validation
- Run migrations
- Run seed
- Run lint
- Run type checking
- Run the production build
- Fix any errors introduced by the work
- Summarize all created or changed files
- Document any assumptions
- Provide the exact local route to review the Technology Catalog

Do not stop at scaffolding. Deliver a fully populated and visually finished first version of the module.
