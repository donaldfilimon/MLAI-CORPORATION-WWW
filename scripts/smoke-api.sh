#!/usr/bin/env bash
# API smoke matrix for the Next.js route handlers (migration gate 3).
#
#   BASE_URL=http://localhost:3000 bash scripts/smoke-api.sh
#
# Contracts mirror src/lib/api.ts and the handlers under app/api/:
#   204 accept            — allowlisted telemetry event is accepted
#   DNT no-store          — DNT:1 short-circuits to 204 BEFORE the DB insert
#   400 unknown event     — non-allowlisted telemetry event rejected
#   401 unauthenticated   — protected endpoints without a session
#   403 MFA-gated         — summary with a session but no admin MFA
#                           (needs SESSION_COOKIE=mlai_session=... to exercise)
#   /api/auth/me          — returns 200 {"user":null} when logged out (by design)
#   /api/auth/login       — 3xx redirect into WorkOS AuthKit (or config error page)
#
# Inquiry happy-path POST writes to inquiries.db, so it only runs with SMOKE_WRITE=1.

set -u
BASE_URL="${BASE_URL:-http://localhost:3000}"
PASS=0; FAIL=0

check() { # label expected actual [extra]
  if [ "$2" = "$3" ]; then
    PASS=$((PASS + 1)); printf '  ok   %-44s %s\n' "$1" "$3"
  else
    FAIL=$((FAIL + 1)); printf '  FAIL %-44s expected %s, got %s\n' "$1" "$2" "$3"
  fi
}

code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

echo "API smoke matrix → $BASE_URL"

# ── telemetry ────────────────────────────────────────────────────────────────
check "telemetry: allowlisted event → 204" 204 "$(code -X POST "$BASE_URL/api/telemetry" \
  -H 'content-type: application/json' -d '{"event":"inquiry_open","path":"/contact"}')"

check "telemetry: DNT:1 no-store → 204" 204 "$(code -X POST "$BASE_URL/api/telemetry" \
  -H 'DNT: 1' -H 'content-type: application/json' -d '{"event":"inquiry_open","path":"/contact"}')"

check "telemetry: unknown event → 400" 400 "$(code -X POST "$BASE_URL/api/telemetry" \
  -H 'content-type: application/json' -d '{"event":"bogus_event"}')"

check "telemetry: invalid JSON → 400" 400 "$(code -X POST "$BASE_URL/api/telemetry" \
  -H 'content-type: application/json' -d 'not-json')"

# ── auth ─────────────────────────────────────────────────────────────────────
ME=$(curl -s "$BASE_URL/api/auth/me")
check "auth/me: logged out → 200" 200 "$(code "$BASE_URL/api/auth/me")"
case "$ME" in
  *'"user":null'*) PASS=$((PASS + 1)); echo '  ok   auth/me: body is {"user":null}' ;;
  *) FAIL=$((FAIL + 1)); echo "  FAIL auth/me: body missing \"user\":null → $ME" ;;
esac

LOGIN_CODE=$(code "$BASE_URL/api/auth/login")
case "$LOGIN_CODE" in
  30*) PASS=$((PASS + 1)); echo "  ok   auth/login: AuthKit redirect → $LOGIN_CODE" ;;
  *) FAIL=$((FAIL + 1)); echo "  FAIL auth/login: expected 3xx redirect, got $LOGIN_CODE" ;;
esac

# ── protected endpoints, unauthenticated → 401 ───────────────────────────────
for ep in /api/telemetry/summary /api/billing/plans /api/llm/status /api/auth/mfa-status; do
  check "401 unauthenticated: $ep" 401 "$(code "$BASE_URL$ep")"
done

# ── inquiries validation (no DB write) ───────────────────────────────────────
check "inquiries: short name → 400" 400 "$(code -X POST "$BASE_URL/api/inquiries" \
  -H 'content-type: application/json' \
  -d '{"name":"x","email":"a@b.co","company":"ACME","message":"hello there friend"}')"

check "inquiries: bad email → 400" 400 "$(code -X POST "$BASE_URL/api/inquiries" \
  -H 'content-type: application/json' \
  -d '{"name":"Smoke Test","email":"nope","company":"ACME","message":"hello there friend"}')"

# ── opt-in write + session paths ─────────────────────────────────────────────
if [ "${SMOKE_WRITE:-0}" = "1" ]; then
  check "inquiries: valid submit → 200" 200 "$(code -X POST "$BASE_URL/api/inquiries" \
    -H 'content-type: application/json' \
    -d '{"name":"Smoke Test","email":"smoke@test.local","company":"Smoke Co","projectType":"research","message":"Automated smoke-test inquiry; safe to delete."}')"
fi

if [ -n "${SESSION_COOKIE:-}" ]; then
  SUM=$(code -H "Cookie: $SESSION_COOKIE" "$BASE_URL/api/telemetry/summary")
  case "$SUM" in
    403) PASS=$((PASS + 1)); echo "  ok   summary: session without MFA → 403 (MFA-gated)" ;;
    200) PASS=$((PASS + 1)); echo "  ok   summary: MFA session → 200" ;;
    *) FAIL=$((FAIL + 1)); echo "  FAIL summary with session: expected 403 or 200, got $SUM" ;;
  esac
fi

echo "──────────────────────────────────────────────"
echo "smoke: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
