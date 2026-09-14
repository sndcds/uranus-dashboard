# Cookie sessions

This frontend depends on the backend authentication changes in
[sndcds/uranus#216](https://github.com/sndcds/uranus/pull/216), including its PostgreSQL
migration. Deploy the migration and backend before this dashboard. Reload open
browser tabs after rollout so older Bearer clients do not keep using the previous
session implementation. Existing sessions require login again.

## Transport and state

`src/api/authSession.ts` handles login, session verification, refresh and logout.
It uses `credentials: include`, no-store requests and the existing endpoints:

- `POST /api/login`
- `GET /api/admin/user/profile`
- `POST /api/admin/refresh`
- `POST /api/admin/logout`

The browser manages both HttpOnly cookies. The dashboard ignores JWTs in the
backend's compatibility responses: only whitelisted profile fields are retained.
The existing Pinia store ID `token` remains, but it represents verified session
state rather than tokens. Persistence retains only `hasKnownAccount`. Before
hydration, migration removes legacy access/refresh tokens from that storage entry.
User and organization stores remain in use and are cleared on verified logout or
an account change.

`apiFetch` sends cookies for `/api/admin/*`, including avatar/image mutations, and
retries a protected request at most once after successful recovery. It never sends
Bearer headers. Public API requests, lookups and public avatar downloads omit
credentials to preserve the backend's wildcard CORS policy. Public 401 responses
never initiate session renewal. Delayed protected responses are rejected after a
logout or account change rather than populating the new session with old data.

Route guards await session verification before checking protected or guest-only
routes. Deep-link destinations are retained. A failed network check renders a
retryable login state rather than falsely treating the session as expired. On a
cross-tab account change, protected views unmount until the new identity is
verified; this prevents previous-account forms from remaining on screen.

## Multiple tabs and interrupted requests

Login, refresh and logout share the `uranus-cookie-session` Web Lock across tabs
of the dashboard origin. Within a tab, parallel 401s also share one recovery
promise. After acquiring the lock, recovery probes the profile endpoint first:
another tab may already have renewed the cookies, so a second refresh is avoided.

`uranus-session-state` stores only a random version and signed-out marker. Storage
events notify other tabs about login/logout; these events never authenticate a
user without a server check. A queued 401 checks the signed-out marker before
renewing, so it cannot reopen a session another tab just logged out of.

Before sending a refresh, `uranus-session-refresh-pending` records that its outcome
may be uncertain if the tab closes or the request is interrupted. A later attempt
first checks whether usable cookies arrived. If they did not, it requires a new
login instead of resubmitting a possibly consumed refresh token and triggering
family revocation. Network/server failures do not claim that logout succeeded or
silently clear a previously authenticated UI state. Session requests have a
15-second timeout; an interrupted refresh remains marked as uncertain.

A [Web Locks API](https://www.w3.org/TR/web-locks/) implementation in a secure
context (HTTPS or localhost), cookies, and working localStorage are required.
There is deliberately no non-atomic localStorage lease fallback for rotation.
Unsupported environments display a localized sign-in error rather than issuing
potentially concurrent refresh requests.

## Logout and user feedback

Logout first honors existing navigation/unsaved-edit guards. If the user cancels
leaving a form, no server logout occurs. Otherwise it calls the dedicated logout
endpoint inside the same lock as refresh. HTTP 200 or 401 completes logout; the
backend deletes the cookies, and the dashboard clears user/org/favorite state and
notifies other tabs. A 401 never triggers a refresh on this endpoint.

On network/5xx failure, logout remains visibly unsuccessful with a retry action.
JavaScript cannot delete the HttpOnly cookies, so clearing only a local store would
be misleading. Repeated clicks are disabled while the server logout is pending.
Session recovery, blocked-cookie and logout messages exist in German, English and
Danish, including generated locale JSON files.

## Deployment and development

Production is expected to use `https://app.kulturbytes.de` with
`VITE_API_URL=https://api.kulturbytes.de`. These hosts are same-site, and the backend
allows the dashboard origin for credentialed authentication/admin requests. Cookie
Domain, SameSite, Secure and CSRF checks remain controlled by the backend. Adding a
new dashboard origin requires a matching backend allowlist change.

During `pnpm dev`, API URLs are relative `/api/...`; the existing Vite proxy uses
`VITE_API_URL` as its upstream. This keeps cookies on localhost instead of trying
to send SameSite=Lax cookies directly from localhost to a different site. The
backend's development-origin allowlist currently uses `http://localhost:5173`.
Avatar/image URL helpers use the same API base resolver. No production cookies,
CORS checks or CSRF protections are weakened for development.

## Validation

Run `pnpm test --run`, `pnpm typecheck` and `pnpm build` with the Node Current
release and the pinned pnpm version.

New Vitest cases cover cookie transport, legacy persistence migration, session
bootstrap, route guards, parallel recovery, interrupted refreshes, cross-tab
logout/account changes, stale responses, logout failure/retry, login feedback and
cancelled navigation from edited forms. They use isolated stores and an ordered
lock test double rather than real account credentials.

Additionally verified in Chromium with two pages sharing a browser context against
the actual Go handlers from backend PR #216 and an isolated PostgreSQL 18.6 schema:
production HttpOnly/Secure/Lax cookies, exactly one rotation for parallel 401s,
reload restoration, failed logout, and logout racing refresh with server-side
family revocation. This check used a temporary test server and did not contact a
production database.

All 98 Vitest tests (including 44 new cases) and the production build pass, using
Node 26.8.2 and pnpm 12.3.4. The full typecheck currently reports 97 pre-existing
errors; comparison with an unmodified checkout shows no new errors introduced by
this change. They are outside the authentication changes and have not been hidden
with compiler settings or suppressions.
