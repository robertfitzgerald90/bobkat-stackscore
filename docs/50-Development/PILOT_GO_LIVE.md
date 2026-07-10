# Pilot Go-Live Checklist

Use this checklist before handing StackScore to field consultants (1–3 users).

---

## Infrastructure

- [ ] PostgreSQL running and reachable from app host
- [ ] `.env` configured (see [DEPLOY.md](DEPLOY.md))
- [ ] `AUTH_SECRET` ≥ 32 characters (production)
- [ ] `AUTH_URL` matches exact browser URL (including port)
- [ ] Initial migration applied (`db:migrate:deploy` or baseline + deploy)
- [ ] Seed completed (`db:seed`) with **non-default** admin password
- [ ] Daily PostgreSQL backup configured

---

## Application

- [ ] `npm test` — all tests pass
- [ ] `npm run build` — succeeds
- [ ] `npm start` — app listens on expected port
- [ ] `npm run smoke` — health + auth endpoints OK

---

## Manual Smoke Test (15 minutes)

Perform as the user who will run assessments:

1. [ ] **Sign in** at `/login` with admin credentials
2. [ ] **Create client** via `/clients/new`
3. [ ] **Start assessment** from client page
4. [ ] **Complete all 50 questions** — verify live score panel updates
5. [ ] **View results** — recommendations generated
6. [ ] **Export PDF** — downloads successfully
7. [ ] **Create project** from a recommendation
8. [ ] **Run reassessment** — previous answers shown, improvement page works
9. [ ] **Technology Profile** visible on client page with scores
10. [ ] **Sign out** and sign back in — session works

---

## User Accounts

- [ ] Admin account created (`admin@bobkatit.com` or custom)
- [ ] Technician account created if needed (`technician@bobkatit.com`)
- [ ] Passwords documented in secure vault (not in git)

---

## Consultant Briefing

- [ ] Share [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md)
- [ ] Explain: assessments are the core workflow; TIP/roadmap not yet in app
- [ ] Explain: always use the same URL (port 3000 locally)

---

## Sign-Off

| Role | Name | Date |
|------|------|------|
| Deployer | | |
| Primary user | | |

**Pilot approved:** ☐ Yes  ☐ No — blockers: _______________
