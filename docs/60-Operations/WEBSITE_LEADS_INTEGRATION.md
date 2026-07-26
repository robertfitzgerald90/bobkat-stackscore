# Website Leads Integration

StackScore receives contact-form submissions from BobkatIT.com through a secure server-to-server API and stores them as `WebsiteLead` records for admin review, follow-up, and conversion.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `WEBSITE_LEADS_API_SECRET` | Yes (integration) | Shared secret for Bobkat IT → StackScore submissions. Server-side only. |
| `BOBKAT_NOTIFICATION_EMAIL` | Recommended | Internal notification recipient for new leads. Falls back to workflow settings (`proposalApprovalNotificationEmail` + `internalNotificationEmails`). |
| `NEXT_PUBLIC_APP_URL` | Yes | Used for confirmation email links and admin lead URLs. |
| `RESEND_API_KEY` | Recommended | Sends confirmation + internal notification emails. |
| `EMAIL_FROM` | Recommended | Outbound sender for confirmation emails. |

Add to `.env` locally and Vercel production settings. Never expose `WEBSITE_LEADS_API_SECRET` to client-side code.

## Endpoint

`POST /api/integrations/website-leads`

Public (no session). Protected by integration secret + rate limiting.

### Authentication

Provide the secret using either:

```http
Authorization: Bearer YOUR_WEBSITE_LEADS_API_SECRET
```

or

```http
X-Website-Leads-Secret: YOUR_WEBSITE_LEADS_API_SECRET
```

### Request body

```json
{
  "name": "Jane Smith",
  "company": "Pinnacle Engineering",
  "phone": "346-555-0100",
  "email": "jane@pinnacle.example",
  "message": "We would like to discuss managed IT services.",
  "source": "BOBKAT_WEBSITE_CONTACT",
  "submissionId": "bobkat-contact-form-2026-07-25-001",
  "websiteUrl": "https://bobkatit.com/contact"
}
```

| Field | Required | Notes |
|---|---|---|
| `name` | Yes | Trimmed, max 200 chars |
| `email` | Yes | Valid email, normalized to lowercase |
| `message` | Yes | Plain text only; HTML stripped, max 5000 chars |
| `source` | Yes | `BOBKAT_WEBSITE_CONTACT`, `TECHNOLOGY_SNAPSHOT`, `MANUAL`, `OTHER` |
| `company` | No | Max 200 chars |
| `phone` | No | Max 40 chars |
| `submissionId` | No | Idempotency key; duplicates return `409` |
| `websiteUrl` | No | Valid URL, max 500 chars |

### Responses

| Status | Meaning |
|---|---|
| `201` | Lead created |
| `400` | Validation error |
| `401` | Missing/invalid secret |
| `409` | Duplicate `submissionId` |
| `429` | Rate limited (30 requests/minute/IP) |
| `500` | Server/configuration error |

Success example:

```json
{
  "id": "uuid",
  "status": "NEW",
  "submittedAt": "2026-07-25T18:00:00.000Z"
}
```

## Admin UI

| Route | Access |
|---|---|
| `/website-leads` | Admin list + filters |
| `/website-leads/[id]` | Admin detail, status updates, notes, conversion, delete |

Sidebar shows a badge with the count of `NEW` leads for administrators.

## Local testing

1. Set `WEBSITE_LEADS_API_SECRET` in `.env`.
2. Run migrations: `npx prisma migrate dev`
3. Start the app: `npm run dev`
4. Submit a test lead:

```bash
curl -X POST http://localhost:3000/api/integrations/website-leads \
  -H "Authorization: Bearer YOUR_WEBSITE_LEADS_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Hello from local test",
    "source": "BOBKAT_WEBSITE_CONTACT",
    "submissionId": "local-test-001"
  }'
```

5. Sign in as an admin and open `/website-leads`.

## Production deployment

1. Set all required environment variables in Vercel.
2. Deploy and run migrations against production (`prisma migrate deploy`).
3. Configure BobkatIT.com to POST to `https://stackscore.tech/api/integrations/website-leads`.
4. Verify confirmation email delivery and internal notification receipt.
5. Confirm admin badge and lead detail workflow in production.

## Audit events

Recorded via `AdminAuditEvent`:

- `website_lead_received`
- `website_lead_confirmation_sent`
- `website_lead_viewed`
- `website_lead_status_changed`
- `website_lead_converted`
- `website_lead_deleted`

Message content is not sent to analytics systems.
