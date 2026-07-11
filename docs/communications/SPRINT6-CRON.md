# Sprint 6 Communications Cron

Daily internal scan for quarterly review reminders and scheduled communication queue processing.

## Vercel Cron

Configured in `vercel.json`:

- Path: `/api/cron/communications`
- Schedule: `0 12 * * *` (daily at 12:00 UTC)

## Required Environment Variables

- `CRON_SECRET` — Bearer token Vercel Cron sends as `Authorization: Bearer <CRON_SECRET>`

## Behavior

1. Scans clients with a quarterly review anchor date and creates idempotent internal reminder records.
2. Processes due scheduled communication queue items.
3. Never sends customer quarterly review emails automatically — consultants must approve from the Communications Dashboard.

## Local Testing

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/communications
```
