# BobKat StackScore - RBAC & Security Specification

## Purpose

This document defines role-based access control, authentication requirements, and security policies for BobKat StackScore MVP.

**Related documents:** [MVP_PRD.md](MVP_PRD.md), [DOC-301 – Database Schema Specification](DOC301%20-%20Database%20Schema%20Specification.md), [DOC-300 – Technical Architecture](DOC-300%20-%20Technical%20Architecture.md)

---

## Authentication

### MVP approach

| Aspect | Specification |
| ------ | ------------- |
| Method | Email + password |
| Session | HTTP-only secure cookie with server-side session store |
| Password hashing | bcrypt (cost factor 12) or argon2id |
| Session duration | 8 hours idle timeout; 24 hours absolute maximum |
| Password policy | Minimum 10 characters; no common-password blocklist |
| MFA | Not required in MVP; planned for Phase 2 |
| SSO (Azure AD) | Phase 2 |

### Login flow

1. User submits email and password
2. Server validates credentials against `Users.passwordHash`
3. Server checks `Users.isActive = true`
4. Server creates session and sets secure cookie
5. Failed attempts return generic "Invalid credentials" (no email enumeration)

### Session invalidation

- Logout destroys server session
- Admin disabling a user (`isActive = false`) invalidates all active sessions on next request
- Password change invalidates all other sessions

---

## Roles

### MVP roles

| Role | Description | MVP status |
| ---- | ----------- | ---------- |
| admin | Full platform access including user management | Active |
| technician | Client, assessment, recommendation, and project access | Active |
| client | Client portal access to own data only | **Dormant** — schema reserved, no MVP implementation |

### Future client role (Phase 2)

When enabled, client users will:

- Link to exactly one `Clients` record via a new `clientId` field on `Users`
- View only their own assessments, recommendations, and client-visible notes
- Not create assessments or access other clients

---

## Permission Matrix

Legend: ✅ Allowed | ❌ Denied | 🔒 Own records only

### Users

| Action | admin | technician | client |
| ------ | ----- | ---------- | ------ |
| List all users | ✅ | ❌ | ❌ |
| Create user | ✅ | ❌ | ❌ |
| Edit user (name, role, isActive) | ✅ | ❌ | ❌ |
| Change own password | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |

### Clients

| Action | admin | technician | client |
| ------ | ----- | ---------- | ------ |
| List clients | ✅ | ✅ | 🔒 |
| Create client | ✅ | ✅ | ❌ |
| View client detail | ✅ | ✅ | 🔒 |
| Edit client | ✅ | ✅ | ❌ |
| Delete/deactivate client | ✅ | ❌ | ❌ |

### Assessments

| Action | admin | technician | client |
| ------ | ----- | ---------- | ------ |
| List assessments | ✅ | ✅ | 🔒 |
| Create assessment | ✅ | ✅ | ❌ |
| View assessment (draft) | ✅ | ✅ | ❌ |
| Edit responses (draft) | ✅ | ✅ | ❌ |
| Complete assessment | ✅ | ✅ | ❌ |
| View completed assessment | ✅ | ✅ | 🔒 |
| Edit executive summary | ✅ | ✅ | ❌ |
| Edit internal notes | ✅ | ✅ | ❌ |
| Archive assessment | ✅ | ✅ | ❌ |
| Delete draft assessment | ✅ | 🔒 own drafts | ❌ |

### Recommendations

| Action | admin | technician | client |
| ------ | ----- | ---------- | ------ |
| View recommendations | ✅ | ✅ | 🔒 |
| Update status | ✅ | ✅ | ❌ |
| Add custom recommendation | ✅ | ✅ | ❌ |
| Delete recommendation | ✅ | ❌ | ❌ |

### Projects

| Action | admin | technician | client |
| ------ | ----- | ---------- | ------ |
| List projects | ✅ | ✅ | 🔒 |
| Create project | ✅ | ✅ | ❌ |
| Edit project | ✅ | ✅ | ❌ |
| Assign project | ✅ | ✅ | ❌ |
| Complete project | ✅ | ✅ | ❌ |

### Score History

| Action | admin | technician | client |
| ------ | ----- | ---------- | ------ |
| View score trends | ✅ | ✅ | 🔒 |
| Compare assessments | ✅ | ✅ | 🔒 |

### Administration

| Action | admin | technician | client |
| ------ | ----- | ---------- | ------ |
| View at-risk dashboard | ✅ | ✅ | ❌ |
| Manage seed data (questions) | ✅ | ❌ | ❌ |
| View audit log | ✅ | ❌ | ❌ |

---

## Data Isolation

### MVP (single-tenant internal tool)

All BobKat staff (admin and technician) access **all clients**. There is no per-technician client assignment in MVP.

### Phase 2 considerations

- Optional client assignment per technician
- Client role scoped to `Users.clientId`
- `Notes.visibility = client_visible` filtering for portal users

---

## Field-Level Access

| Field | admin | technician | client (Phase 2) |
| ----- | ----- | ---------- | -------------- |
| Assessments.internalNotes | ✅ | ✅ | ❌ |
| Assessments.executiveSummary | ✅ | ✅ | ✅ |
| Assessment Responses.notes | ✅ | ✅ | ❌ |
| Assessment Responses.evidence | ✅ | ✅ | ❌ |
| Clients.notes | ✅ | ✅ | ❌ |

---

## API Authorization

Every API endpoint (except `/auth/login` and `/health`) requires a valid session.

Authorization is enforced at the API layer:

1. Validate session → resolve `userId` and `role`
2. Check permission matrix for action + resource
3. Return `401 Unauthorized` if no session
4. Return `403 Forbidden` if insufficient permissions

Resource-level checks:

- Draft assessment delete: technician may only delete own drafts (`assessorUserId = currentUser`)
- All other technician actions: no ownership restriction in MVP

---

## Security Requirements

### Transport

- HTTPS required in production (TLS 1.2+)
- HSTS header enabled
- Secure, HttpOnly, SameSite=Lax session cookies

### Input validation

- All API inputs validated with schema validation (Zod or equivalent)
- SQL injection prevented via ORM parameterized queries
- XSS prevented via output encoding in frontend framework

### Rate limiting

| Endpoint | Limit |
| -------- | ----- |
| POST /auth/login | 5 attempts per email per 15 minutes |
| General API | 100 requests per minute per user |

### Secrets management

- Database credentials and session secret in environment variables
- No secrets in source control
- `.env` files in `.gitignore`

### Audit logging (MVP minimal)

Log the following server-side events:

| Event | Fields logged |
| ----- | ------------- |
| Login success/failure | userId, email, IP, timestamp |
| User created/disabled | actorId, targetUserId, timestamp |
| Assessment completed | actorId, assessmentId, clientId, score, timestamp |
| Recommendation status change | actorId, recommendationId, oldStatus, newStatus, timestamp |

Audit logs are admin-viewable only. Full activity log UI is Phase 2.

---

## Data Protection

| Data type | Classification | Handling |
| --------- | -------------- | -------- |
| User passwords | Sensitive | Hashed only; never stored or logged in plain text |
| Client contact info | Business confidential | Database encrypted at rest (hosting provider) |
| Assessment evidence notes | Business confidential | Internal access only |
| Scores and recommendations | Business confidential | Staff access; client portal in Phase 2 |

### Backup

- Database daily automated backups (hosting provider)
- 30-day retention minimum

---

## Compliance Notes (MVP)

- No PCI data stored
- No HIPAA-specific controls required unless client data policies change
- Client data deletion: admin can deactivate client; hard delete procedure documented in operations runbook (Phase 2)

---

## Implementation Checklist

- [ ] Session middleware on all protected routes
- [ ] Role enum checked per permission matrix
- [ ] `isActive` check on every authenticated request
- [ ] Login rate limiting
- [ ] Password hashing with bcrypt/argon2
- [ ] Internal notes excluded from any future client-facing API responses
- [ ] Audit log table or structured logging for security events
