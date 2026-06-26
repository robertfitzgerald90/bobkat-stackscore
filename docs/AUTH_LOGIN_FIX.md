# Authentication Login Fix

**Date:** June 26, 2026  
**Issue:** Sign-in button appeared to do nothing with valid seeded credentials

---

## Root Cause

The login form used the shared `Input` component from `@base-ui/react/input` with the standard React pattern:

```tsx
value={email}
onChange={(e) => setEmail(e.target.value)}
```

**Base UI `Input` is controlled via `onValueChange`, not `onChange`.** When `value` is bound without `onValueChange`, React state stays `""` even while the user types. On submit, `signIn()` was called with empty email/password, which failed authentication silently or showed a generic error that was easy to miss.

This is why the button seemed to "not react" — credentials never reached the auth handler.

---

## Fixes Applied

### 1. `src/components/ui/input.tsx` (systemic)
- Bridges `onChange` → `onValueChange` so all forms using the standard React pattern work correctly
- Explicitly wires controlled `value` / `defaultValue` to Base UI

### 2. `src/components/auth/login-form.tsx`
- Uses `onValueChange={setEmail}` / `onValueChange={setPassword}` (Base UI native API)
- Adds `autoComplete` attributes for browser password managers
- Wraps `signIn()` in `try/catch/finally` so network errors show a clear message
- Maps Auth.js error codes to user-friendly messages
- Ensures loading state always resets in `finally`

### 3. `src/lib/auth/config.ts`
- Wraps `authorize()` in `try/catch` so database errors log server-side instead of hanging the request

### 4. `src/lib/db/index.ts`
- Adds pool `connectionTimeoutMillis` (10s) to fail fast if the database is unreachable during login

---

## Seeded Credentials

After `npm run db:seed`:

| Field | Value |
|-------|-------|
| Email | `admin@bobkatit.com` |
| Password | Value of `SEED_ADMIN_PASSWORD` in `.env`, or `ChangeMe123!` if unset |

Technician account: `technician@bobkatit.com` (same password)

---

## Environment Checklist

Ensure `.env` contains:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="your-secret-here"
AUTH_URL="http://localhost:3000"
```

**Port note:** If Next.js starts on a different port (e.g. 3001 because 3000 is in use), either:
- Stop the process on port 3000 and use `npm run dev` on 3000, or
- Update `AUTH_URL` to match the port you are actually using

`trustHost: true` is set in auth config to help with local/network URLs.

---

## Verification

1. Restart dev server: `npm run dev`
2. Open `/login`
3. Enter seeded credentials — fields should retain typed text
4. Click **Sign in** — should redirect to `/dashboard`
5. On failure, a red error message appears below the password field

---

## Related Files

- `src/components/ui/input.tsx`
- `src/components/auth/login-form.tsx`
- `src/lib/auth/config.ts`
- `src/lib/db/index.ts`
