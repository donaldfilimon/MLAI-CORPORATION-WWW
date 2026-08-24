# MFA for administrative access — WorkOS runbook

The site's auth is WorkOS AuthKit. MFA *policy* (which factors exist, whether
they're required at sign-in) is configured in the WorkOS Dashboard, not in this
repo. This runbook covers the dashboard steps plus the code-side enforcement
this repo ships.

## 1. Dashboard steps (operator action — requires the WorkOS account)

1. Sign in at <https://dashboard.workos.com> and select the environment that
   matches `WORKOS_CLIENT_ID` in `.env`.
2. **Authentication → Multi-Factor Auth**: enable **TOTP (authenticator app)**.
   Passkeys may be enabled separately, but the current admin gate deliberately
   requires an enrolled TOTP factor for non-SSO sessions.
3. Set the MFA policy to **Required** (every sign-in) or **Optional**
   (user-enrolled). For founder-led admin access, *Required* on the production
   environment is the recommended posture.
4. Have each administrative user sign in once and complete enrollment when
   AuthKit prompts for it.

No code change is needed for the AuthKit prompt itself — the hosted sign-in
flow picks up the dashboard policy automatically.

[WorkOS documents an important exception](https://workos.com/docs/authkit/mfa):
its MFA requirement does **not** apply to SSO users. For an SSO administrator,
verify in that organization's identity provider that MFA is mandatory for the
Quesar application. Do not treat a WorkOS MFA toggle or the presence of a
factor on the target user as proof of the IdP policy.

## 2. Code-side enforcement shipped in this repo

- `GET /api/auth/mfa-status` (session-required) — returns the signed-in user's
  enrolled factors (via `userManagement.listUserAuthFactors`) and whether admin
  enforcement is active.
- `ADMIN_EMAILS` (comma-separated env var) — administrative reads are limited
  to signed-in users on this allowlist. In production, an unset allowlist fails
  closed.
- `ADMIN_REQUIRE_MFA=true` and `WORKOS_MFA_POLICY_VERIFIED=true` — the second
  value is an explicit deployment attestation that an operator verified the
  production WorkOS policy is Required. Admin access fails closed without it.
  When both are set, the administrative read
  endpoints (`GET /api/inquiries`, `GET /api/telemetry/summary`, and
  `/api/admin/audits*`) return 403
  unless the allowlisted non-SSO session user has at least one enrolled TOTP
  factor, active organization membership, and authentication less than ten minutes old.
  Verification fails closed (403) if WorkOS can't be reached while enforcement
  is on. Factor lookups are cached for 5 minutes per user. A decrypted
  conversation-audit inventory and each read additionally require an operator
  reason of 8–200 characters. Both are POST-only and record
  requested/succeeded/failed access events without
  storing plaintext in the access-event row.
- SSO sessions follow a separate fail-closed path:
  `WORKOS_SSO_MFA_POLICY_VERIFIED=true` attests that the organization's IdP
  requires MFA. Leave it explicitly `false` until that provider-side policy is
  verified; SSO admin access remains denied. No WorkOS factor is required on
  this path because WorkOS does not apply its MFA requirement to SSO users.
- Freshness is not callback time. Following WorkOS's
  [reauthentication guidance](https://workos.com/docs/authkit/reauthentication),
  sign-in authorization sends `max_age=600`,
  and the callback records the signed access token's `auth_time` claim. Admin
  routes accept that evidence for at most ten minutes and deny missing, stale,
  implausibly future, or impersonated sessions. For SSO, WorkOS sends the user
  back through the IdP during this step-up.

## 3. Rollout order (avoids locking yourself out)

1. Enable TOTP in the dashboard with policy **Optional**.
2. Sign in, enroll a factor, confirm `GET /api/auth/mfa-status` shows it.
3. Put `ADMIN_EMAILS` in Google Secret Manager.
4. Flip the dashboard policy to **Required** once all admin users are enrolled.
5. Set the GitHub production variable `WORKOS_MFA_POLICY_VERIFIED=true` only
   after verifying that live policy, then redeploy. The workflow always sets
   `ADMIN_REQUIRE_MFA=true` and rejects any other attestation value.
6. Set `WORKOS_SSO_MFA_POLICY_VERIFIED=false` unless an SSO administrator is
   required. If one is required, verify MFA enforcement in that organization's
   IdP first, then set the variable to `true` and complete a live step-up test.
7. Sign out and sign back in after deployment. Sessions minted by an older
   release have no recorded `auth_time` and intentionally cannot use admin
   endpoints, even though ordinary invited-member features may still work.
