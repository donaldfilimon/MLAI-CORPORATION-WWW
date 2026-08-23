# MFA for administrative access — WorkOS runbook

The site's auth is WorkOS AuthKit. MFA *policy* (which factors exist, whether
they're required at sign-in) is configured in the WorkOS Dashboard, not in this
repo. This runbook covers the dashboard steps plus the code-side enforcement
this repo ships.

## 1. Dashboard steps (operator action — requires the WorkOS account)

1. Sign in at <https://dashboard.workos.com> and select the environment that
   matches `WORKOS_CLIENT_ID` in `.env`.
2. **Authentication → Multi-Factor Auth**: enable **TOTP (authenticator app)**.
   Enable passkeys under **Authentication → Passkeys** if desired (passkeys
   count as a strong factor).
3. Set the MFA policy to **Required** (every sign-in) or **Optional**
   (user-enrolled). For founder-led admin access, *Required* on the production
   environment is the recommended posture.
4. Have each administrative user sign in once and complete enrollment when
   AuthKit prompts for it.

No code change is needed for the AuthKit prompt itself — the hosted sign-in
flow picks up the dashboard policy automatically.

## 2. Code-side enforcement shipped in this repo

- `GET /api/auth/mfa-status` (session-required) — returns the signed-in user's
  enrolled factors (via `userManagement.listUserAuthFactors`) and whether admin
  enforcement is active.
- `ADMIN_EMAILS` (comma-separated env var) — administrative reads are limited
  to signed-in users on this allowlist. In production, an unset allowlist fails
  closed.
- `ADMIN_REQUIRE_MFA=true` (env var) — when set, the administrative read
  endpoints (`GET /api/inquiries`, `GET /api/telemetry/summary`) return 403
  unless the allowlisted session user has at least one enrolled MFA factor.
  Verification fails closed (403) if WorkOS can't be reached while enforcement
  is on. Factor lookups are cached for 5 minutes per user.

## 3. Rollout order (avoids locking yourself out)

1. Enable TOTP in the dashboard with policy **Optional**.
2. Sign in, enroll a factor, confirm `GET /api/auth/mfa-status` shows it.
3. Set `ADMIN_EMAILS` to the production admin addresses.
4. Set `ADMIN_REQUIRE_MFA=true` on the server (Cloud Run env var) and redeploy.
5. Flip the dashboard policy to **Required** once all admin users are enrolled.
