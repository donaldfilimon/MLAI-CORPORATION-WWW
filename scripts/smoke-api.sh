#!/usr/bin/env bash
# API smoke matrix for the Next.js route handlers (migration gate 3).
#
#   BASE_URL=http://localhost:3000 bash scripts/smoke-api.sh
#
# Contracts mirror src/lib/api.ts and the handlers under app/api/:
#   204 accept            — allowlisted telemetry event is accepted
#   204 csp sink          — /api/csp-report accepts any body shape, never 5xx
#   429 rate-limited      — csp-report sheds past 60/min per IP (SMOKE_RATELIMIT=1)
#   413 oversize          — bodies past each route's byte cap are rejected unread
#   DNT no-store          — DNT:1 short-circuits to 204 BEFORE the DB insert
#   400 unknown event     — non-allowlisted telemetry event rejected
#   400 non-object body   — `null`/`[]` is valid JSON but not an object, and
#                           must be the route's 400, never an uncaught 500
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

# `null` and `[]` PARSE — they are valid JSON — so they used to reach the
# handler and throw on the first `body.event` access, outside the try/catch,
# escaping as a public 500 on an unauthenticated route (and breaking this
# handler's own "always 204" invariant). readJsonLimited now rejects any
# non-object body up front. A 500 here is the regression these guard.
check "telemetry: null body → 400" 400 "$(code -X POST "$BASE_URL/api/telemetry" \
  -H 'content-type: application/json' -d 'null')"

check "telemetry: array body → 400" 400 "$(code -X POST "$BASE_URL/api/telemetry" \
  -H 'content-type: application/json' -d '[]')"

# ── csp-report ───────────────────────────────────────────────────────────────
# Sink for report-uri/report-to in next.config.ts. Contract: always 204
# regardless of body shape (two wire formats exist and neither is validated),
# never 5xx, rate-limited like /api/telemetry (60s/60 per client IP).
#
# Each case sends a distinct X-Forwarded-For from the RFC 5737 documentation
# range so it gets its own limiter bucket. Without that, re-running this script
# inside one 60s window accumulates against the shared "unknown" key
# (clientIpOf falls back to "unknown" when curl hits localhost with no proxy
# headers) and the always-on cases start failing spuriously.
CSP_IP="203.0.113.$((RANDOM % 200 + 1))"

check "csp-report: report-uri shape → 204" 204 "$(code -X POST "$BASE_URL/api/csp-report" \
  -H "x-forwarded-for: $CSP_IP" -H 'content-type: application/csp-report' \
  -d '{"csp-report":{"document-uri":"https://mlai-corp.com/","violated-directive":"script-src","blocked-uri":"https://evil.test/x.js"}}')"

check "csp-report: Reporting API batch → 204" 204 "$(code -X POST "$BASE_URL/api/csp-report" \
  -H "x-forwarded-for: $CSP_IP" -H 'content-type: application/reports+json' \
  -d '[{"type":"csp-violation","body":{"effectiveDirective":"img-src","blockedURL":"https://evil.test/a.png"}}]')"

check "csp-report: empty body → 204" 204 "$(code -X POST "$BASE_URL/api/csp-report" \
  -H "x-forwarded-for: $CSP_IP" -d '')"

check "csp-report: unparseable body → 204" 204 "$(code -X POST "$BASE_URL/api/csp-report" \
  -H "x-forwarded-for: $CSP_IP" -H 'content-type: application/json' -d 'not-json-at-all')"

# Body-size caps (src/lib/server/body-limit.ts). One oversize probe per public
# POST route that has a cap small enough to exercise cheaply. The payload is
# generated, not stored — 200 KB of 'x' clears every cap under 128 KB.
BIG_FILE="$(mktemp)"
head -c 200000 /dev/zero | tr '\0' 'x' > "$BIG_FILE"
check "csp-report: oversize body → 413" 413 "$(code -X POST "$BASE_URL/api/csp-report" \
  -H "x-forwarded-for: $CSP_IP" -H 'content-type: application/csp-report' \
  --data-binary "@$BIG_FILE")"
check "telemetry: oversize body → 413" 413 "$(code -X POST "$BASE_URL/api/telemetry" \
  -H 'content-type: application/json' --data-binary "@$BIG_FILE")"
# Dedicated IP: the inquiries limiter is 5/5min and rateLimit runs before the
# body cap, so this probe would otherwise spend a token on the shared default
# bucket and back-to-back smoke runs would tip later inquiries checks into 429.
check "inquiries: oversize body → 413" 413 "$(code -X POST "$BASE_URL/api/inquiries" \
  -H "x-forwarded-for: 203.0.113.253" \
  -H 'content-type: application/json' --data-binary "@$BIG_FILE")"
rm -f "$BIG_FILE"

# Exhausting a 60/min limiter costs 61 requests, so it is opt-in — same
# convention as SMOKE_WRITE. Uses its own IP so the four cases above are
# unaffected by the burst regardless of ordering.
if [ "${SMOKE_RATELIMIT:-0}" = "1" ]; then
  BURST_IP="203.0.113.254"
  i=0
  while [ "$i" -lt 60 ]; do
    code -X POST "$BASE_URL/api/csp-report" -H "x-forwarded-for: $BURST_IP" \
      -H 'content-type: application/csp-report' -d '{"csp-report":{}}' >/dev/null
    i=$((i + 1))
  done
  check "csp-report: 61st request in window → 429" 429 "$(code -X POST "$BASE_URL/api/csp-report" \
    -H "x-forwarded-for: $BURST_IP" -H 'content-type: application/csp-report' -d '{"csp-report":{}}')"
fi

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

# Same non-object-body defect as the telemetry pair above, on the other
# unauthenticated POST route. Dedicated IP for the same reason as the oversize
# probe: the inquiries limiter is 5/5min and runs before the body read, so this
# would otherwise spend a token from the bucket the two checks above share.
check "inquiries: null body → 400" 400 "$(code -X POST "$BASE_URL/api/inquiries" \
  -H "x-forwarded-for: 203.0.113.252" \
  -H 'content-type: application/json' -d 'null')"

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
