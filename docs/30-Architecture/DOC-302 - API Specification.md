# BobKat StackScore - API Specification

## Purpose

REST API specification for BobKat StackScore MVP. All endpoints require authentication unless noted.

**Related documents:** [DOC-300 – Technical Architecture](DOC-300%20-%20Technical%20Architecture.md), [DOC-303 – RBAC & Security Specification](DOC-303%20RBAC%20&%20Security%20Specification.md), [MVP_PRD.md](../50-Development/MVP_PRD.md)

---

## Conventions

| Item | Value |
| ---- | ----- |
| Base URL | `/api/v1` |
| Content-Type | `application/json` |
| Auth | Session cookie (`stackscore_session`) |
| Date format | ISO 8601 (`2026-06-23T14:30:00Z`) |
| IDs | UUID v4 |

### Standard error response

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE"
}
```

### HTTP status codes

| Code | Usage |
| ---- | ----- |
| 200 | Success (GET, PATCH) |
| 201 | Created (POST) |
| 204 | No content (DELETE) |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (e.g., complete with unanswered questions) |
| 429 | Rate limited |

### Pagination

Query parameters: `page` (default 1), `limit` (default 20, max 100)

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

## Authentication

### POST /auth/login

No auth required.

**Request:**
```json
{
  "email": "assessor@bobkatit.com",
  "password": "string"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "assessor@bobkatit.com",
    "role": "technician"
  }
}
```

Sets session cookie.

---

### POST /auth/logout

**Response 204:** Session destroyed.

---

### GET /auth/me

**Response 200:**
```json
{
  "id": "uuid",
  "name": "Jane Smith",
  "email": "assessor@bobkatit.com",
  "role": "technician"
}
```

---

## Users

*Admin only except where noted.*

### GET /users

**Response 200:** Paginated list of users.

---

### POST /users

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "assessor@bobkatit.com",
  "password": "string",
  "role": "technician"
}
```

**Response 201:** Created user (no passwordHash).

---

### PATCH /users/:id

**Request:**
```json
{
  "name": "string",
  "role": "admin | technician",
  "isActive": true
}
```

---

### PATCH /users/me/password

*Any authenticated user.*

**Request:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

---

## Clients

### GET /clients

**Query:** `status`, `search` (company name), `page`, `limit`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "companyName": "Acme Corp",
      "primaryContactName": "John Doe",
      "status": "active",
      "latestScore": 75,
      "latestRating": "stable",
      "assessmentCount": 3
    }
  ],
  "pagination": { }
}
```

---

### POST /clients

**Request:**
```json
{
  "companyName": "Acme Corp",
  "primaryContactName": "John Doe",
  "primaryContactEmail": "john@acme.com",
  "primaryContactPhone": "555-0100",
  "industry": "Manufacturing",
  "employeeCount": 45,
  "deviceCount": 60,
  "locationCity": "Tampa",
  "locationState": "FL",
  "status": "prospect",
  "notes": "string"
}
```

**Response 201:** Full client object.

---

### GET /clients/:id

**Response 200:** Client with latest score summary and assessment list.

---

### PATCH /clients/:id

**Request:** Partial client fields.

---

## Assessments

### GET /clients/:clientId/assessments

**Response 200:** Paginated assessment list for client.

---

### POST /clients/:clientId/assessments

**Request:**
```json
{
  "assessmentName": "Initial Assessment",
  "assessmentType": "initial",
  "assessmentDate": "2026-06-23T00:00:00Z"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "clientId": "uuid",
  "assessorUserId": "uuid",
  "status": "draft",
  "assessmentName": "Initial Assessment",
  "assessmentType": "initial",
  "assessmentDate": "2026-06-23T00:00:00Z",
  "progress": {
    "answered": 0,
    "total": 50
  }
}
```

---

### GET /assessments/:id

**Response 200:** Full assessment with responses, scores (if completed), and recommendations.

---

### PATCH /assessments/:id

*Draft only for response changes; completed allows executiveSummary and internalNotes.*

**Request:**
```json
{
  "executiveSummary": "string",
  "internalNotes": "string"
}
```

---

### DELETE /assessments/:id

*Draft only. Technician may delete own drafts.*

**Response 204**

---

### POST /assessments/:id/archive

*Completed assessments only.*

**Response 200:** `{ "status": "archived" }`

---

## Assessment Responses

### PUT /assessments/:id/responses/:questionId

*Draft only.*

**Request:**
```json
{
  "selectedAnswerOptionId": "uuid",
  "notes": "Optional assessor notes",
  "evidence": "Optional evidence"
}
```

**Response 200:**
```json
{
  "questionId": "uuid",
  "selectedAnswerOptionId": "uuid",
  "scoreEarned": 3,
  "preview": {
    "overallScore": 72,
    "overallRating": "stable"
  }
}
```

---

### GET /assessments/:id/questions

Returns all active questions grouped by category with current responses.

**Response 200:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Security & Protection",
      "maxPoints": 20,
      "questions": [
        {
          "id": "uuid",
          "code": "Q01",
          "questionText": "Is MFA enabled for all Microsoft 365 users?",
          "helpText": "string",
          "weight": 3,
          "answerOptions": [
            { "id": "uuid", "answerText": "Yes", "scoreValue": 3 }
          ],
          "response": {
            "selectedAnswerOptionId": "uuid",
            "scoreEarned": 3,
            "notes": null
          }
        }
      ]
    }
  ]
}
```

---

## Assessment Completion

### POST /assessments/:id/complete

**Preconditions:** All questions answered.

**Response 200:**
```json
{
  "id": "uuid",
  "status": "completed",
  "completedAt": "2026-06-23T15:00:00Z",
  "overallScore": 75,
  "overallRating": "stable",
  "hasCriticalExposure": false,
  "categoryScores": [
    {
      "categoryId": "uuid",
      "categoryName": "Security & Protection",
      "pointsEarned": 16,
      "pointsPossible": 20,
      "percentScore": 80,
      "rating": "strong"
    }
  ],
  "recommendationCount": 8,
  "projectedScore": 88,
  "executiveSummary": "Auto-generated summary..."
}
```

**Response 409:** Unanswered questions remain.

---

## Recommendations

### GET /assessments/:id/recommendations

**Query:** `status`, `priority`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Enable Multi-Factor Authentication for All Users",
      "description": "string",
      "businessImpact": "string",
      "priority": "critical",
      "status": "open",
      "suggestedService": "Microsoft 365 Protection",
      "estimatedImpactPoints": 8,
      "categoryName": "Security & Protection",
      "isConsolidated": false,
      "consolidationGroupId": null
    }
  ]
}
```

---

### POST /assessments/:id/recommendations

*Custom recommendation.*

**Request:**
```json
{
  "title": "string",
  "description": "string",
  "businessImpact": "string",
  "priority": "high",
  "categoryId": "uuid",
  "estimatedImpactPoints": 5
}
```

---

### PATCH /recommendations/:id

**Request:**
```json
{
  "status": "accepted | declined | completed",
  "title": "string",
  "description": "string",
  "priority": "high"
}
```

---

## Projects

### GET /clients/:clientId/projects

**Query:** `status`, `priority`, `page`, `limit`

---

### POST /clients/:clientId/projects

**Request:**
```json
{
  "recommendationId": "uuid",
  "title": "Deploy Microsoft 365 MFA",
  "description": "string",
  "priority": "critical",
  "categoryId": "uuid",
  "assignedUserId": "uuid",
  "estimatedImpactPoints": 8,
  "estimatedCost": 2500.00,
  "targetCompletionDate": "2026-08-01T00:00:00Z"
}
```

**Response 201:** Created project with `status: "proposed"`.

---

### PATCH /projects/:id

**Request:**
```json
{
  "status": "approved | in_progress | completed | deferred | declined",
  "assignedUserId": "uuid",
  "startDate": "2026-07-01T00:00:00Z",
  "targetCompletionDate": "2026-08-01T00:00:00Z",
  "actualImpactPoints": 7
}
```

When `status` set to `completed`, linked recommendation status updates to `completed`.

---

## Score History

### GET /clients/:clientId/score-history

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "recordedDate": "2026-06-23T15:00:00Z",
      "assessmentId": "uuid",
      "overallScore": 75,
      "securityScore": 80,
      "backupScore": 70,
      "infrastructureScore": 90,
      "endpointScore": 85,
      "documentationScore": 60,
      "bcdrScore": 50,
      "strategicScore": 75
    }
  ]
}
```

---

## Assessment Comparison

### GET /clients/:clientId/assessments/compare

**Query:** `baselineId`, `comparisonId` (both required, must be completed)

**Response 200:**
```json
{
  "baseline": {
    "id": "uuid",
    "assessmentName": "Initial Assessment",
    "completedAt": "2026-01-15T00:00:00Z",
    "overallScore": 58
  },
  "comparison": {
    "id": "uuid",
    "assessmentName": "Q2 Review",
    "completedAt": "2026-06-23T00:00:00Z",
    "overallScore": 75
  },
  "delta": {
    "overallScore": 17,
    "categories": [
      {
        "categoryName": "Security & Protection",
        "baselineScore": 45,
        "comparisonScore": 80,
        "delta": 35
      }
    ]
  }
}
```

---

## Dashboard

### GET /dashboard/summary

**Response 200:**
```json
{
  "totalClients": 42,
  "activeClients": 35,
  "assessmentsThisMonth": 8,
  "clientsAtRisk": 5,
  "recentAssessments": [],
  "averageScore": 71
}
```

---

## Health

### GET /health

No auth required.

**Response 200:**
```json
{
  "status": "ok",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## Rate Limits

| Endpoint | Limit |
| -------- | ----- |
| POST /auth/login | 5 per email per 15 min |
| All other endpoints | 100 per user per min |

---

## Versioning

MVP ships as `/api/v1`. Breaking changes require `/api/v2`.
