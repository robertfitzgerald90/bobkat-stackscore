# DOC-021 – Environment & Deployment Strategy

**Document Owner:** Bobkat IT  
**Product:** StackScore  
**Status:** Planned  
**Version:** 0.1 (Draft)

---

# Purpose

Define the development, preview, and production environments used by StackScore.

This document establishes how environments are separated, how database connections are managed, and how deployments should occur to minimize risk while maintaining an efficient development workflow.

This document governs infrastructure configuration rather than application functionality.

---

# Objectives

The environment strategy exists to:

- Protect production client data.
- Allow unrestricted feature development.
- Simplify machine migration.
- Support future team collaboration.
- Reduce deployment risk.
- Ensure predictable application behavior.

---

# Environment Overview

StackScore supports three logical environments.

## Development

Purpose:

Feature development and experimentation.

Characteristics:

- Local execution.
- Uses a dedicated Development PostgreSQL database.
- Safe for test data.
- Safe for schema experimentation.
- Displays a Development banner.

---

## Preview (Future)

Purpose:

Validate features before production deployment.

Characteristics:

- Automatically deployed from feature branches.
- Uses Preview database or Preview database branch.
- Supports internal testing.
- Optional client demonstrations.

---

## Production

Purpose:

Live consulting operations.

Characteristics:

- Real client data.
- Production PostgreSQL database.
- Stable releases only.
- No development utilities.

---

# Environment Variables

Application behavior should never be inferred from database connection strings.

Environment behavior is explicitly controlled using environment variables.

Example:

Development

```env
DATABASE_URL=<Development PostgreSQL>
APP_ENV=development
```

Preview

```env
DATABASE_URL=<Preview PostgreSQL>
APP_ENV=preview
```

Production

```env
DATABASE_URL=<Production PostgreSQL>
APP_ENV=production
```

---

# Environment Responsibilities

DATABASE_URL

Determines:

Where application data is stored.

APP_ENV

Determines:

How the application behaves.

Examples:

- Development banner
- Debug features
- Future feature flags
- Development-only utilities

Application behavior should never depend on parsing database connection strings.

---

# Database Strategy

Development

Dedicated Development PostgreSQL database.

Contains:

- Test clients
- Sample assessments
- Test projects
- Experimental data

Production

Dedicated Production PostgreSQL database.

Contains:

- Real clients
- Production assessments
- Production recommendations
- Historical records

Development should never intentionally modify Production data.

---

# Local Development Workflow

New development machine:

1. Install Git.
2. Install Node.js.
3. Install Cursor.
4. Clone repository from GitHub.
5. Run npm install.
6. Create .env.local.
7. Configure DATABASE_URL.
8. Configure APP_ENV.
9. Run npm run dev.

No Vercel configuration should be required for local development.

---

# Deployment Workflow

Development

↓

Git Commit

↓

Git Push

↓

GitHub

↓

Vercel Build

↓

Production Deployment

Only Vercel manages Production environment variables.

Local development should never require modification of Production configuration.

---

# Visual Environment Indicators

Future enhancement:

Development

🟡 DEVELOPMENT

Preview

🔵 PREVIEW

Production

No indicator.

Visual indicators reduce the likelihood of accidental changes in the wrong environment.

---

# Future Improvements

Potential future enhancements:

- Automated database seeding.
- One-click development database reset.
- Preview databases for feature branches.
- Production database backup automation.
- Scheduled development data refresh.
- Feature flags.
- Environment diagnostics page.

---

# Design Principles

Environment configuration should be:

- Explicit.
- Predictable.
- Repeatable.
- Easily portable between development machines.

The application should always know where it is running without requiring inference.

---

# Acceptance Criteria

The environment strategy is complete when:

- Development and Production databases are fully isolated.
- Local machines require only a Git clone and .env.local configuration.
- Production deployments remain unaffected by local development.
- Developers can migrate to new hardware with minimal setup.
- Application behavior changes only through APP_ENV.

---

# Related Documents

- DOC-020 – Development Standards (Planned)
- DOC-006 – Product Constitution
- DOC-007 – User Experience Constitution