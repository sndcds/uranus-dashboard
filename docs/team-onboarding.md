# Persistent team onboarding notifications

The dashboard now renders a notification center on `/admin/dashboard`, alongside
existing event reminders. It uses the backend's authenticated
`/api/admin/user/notifications` API and the existing `apiFetch` client, Pinia, cards,
buttons and feedback components. No runtime/UI dependency is added.

`organization_team_invite_accepted` tells the original inviter who joined and opens
`/admin/org/{orgUuid}/member/{memberUuid}/permissions`. The copy describes the state
at joining, so it does not incorrectly claim that permissions are still missing
if someone has since assigned them. `organization_team_joined` welcomes the member
and opens the existing `/admin/orgs` list, which is accessible with zero permissions.

Records remain visible when displayed or marked read. Opening a CTA first marks
an unread notification read; an API failure retains its state and shows a translated
retry message. Explicit dismissal updates the server and removes the card after
success. Dismissed records are excluded on subsequent loads. Read cards remain
available until dismissed. Pagination exposes older active notifications.

The list refreshes on mount, window focus and once a minute while visible. There
is no localStorage notification cache. Logout/account changes clear the store
synchronously, and stale responses are ignored. An older list request cannot undo
a successful read/dismiss. Metadata is rendered as text, and action URLs are
restricted to internal `/admin/` paths. All new text is translated in DE/EN/DA,
including unknown notification type fallback, loading/empty/error states and CTAs.

The team page distinguishes pending invitations and joined members. A permission
CTA is shown when the API explicitly supplies `permissions_missing: true` and the
viewer has permission management rights; older API responses remain supported.
The existing invitation and permission editor routes are retained.

## Backend dependency / rollout

Deploy the companion Uranus API change and its two SQL migrations first. The backend
also requires its existing `frontend` configuration to be the trusted dashboard
base URL for follow-up email links. New persistent notifications are created only
for acceptances after deployment, without retroactive notifications for old joins.
The API owns recipient authorization, atomic acceptance/dedupe, language-aware
system mail templates and the mail outbox. Its deployment document explains how
to inspect failed or ambiguous SMTP deliveries without creating duplicate mail.

## Validation

- `pnpm test --run`: component/store tests plus existing regression tests. Covers
  inviter/member copy and CTAs with a real memory router; unread/read/dismiss;
  empty/error/retry; English/Danish output; pagination; unsafe URLs; logout and
  stale-request isolation. No real email or external API is contacted.
- `pnpm build`: production build.
- `pnpm generate:i18n`: regenerates committed JSON from the translation sources.
- `pnpm typecheck`: the branch has the same 95 pre-existing diagnostics as `dev`
  before this work (unused declarations, legacy API response access, missing type
  packages and component typing). No new diagnostics were introduced. Full-project
  typecheck is **not green**; fixing those unrelated components remains separate work.
- There is no project lint/format script or configuration. The existing ESLint
  executable in node_modules is broken. New notification files and their tests
  were checked with isolated temporary tooling: ESLint 9.39.1 with TypeScript
  ESLint 8.59.2 recommended rules (and Vue parser checks) and Prettier 3.6.2 using
  `--single-quote --no-semi`. No tooling dependencies were added to the application.
- No Playwright configuration or dependency exists on this branch. An additional
  smoke test used temporary Playwright 1.58.2 tooling with installed Chromium and
  mocked API responses against the actual Vite app at 1440px and 390px. It checked
  unread display, the exact permission route and editor, read state, dismissal
  across reloads, the welcome organization CTA, horizontal bounds and page errors.
  Both viewport runs passed, and the mobile screenshot was visually inspected.
  This does not replace live end-to-end verification against the deployed backend.

## Manual verification checklist

This is a deployment checklist, not a claim of live mailbox/browser verification.

1. A logs in, opens a team's invitation form and invites existing user B.
2. B receives the invite email, follows its link and accepts successfully.
3. A receives the acceptance email, opens Dashboard and sees the unread notification.
4. A opens “Set permissions” and reaches the permission page for B in that organization.
5. A assigns a permission and checks that the team page's missing-permissions CTA clears.
6. B receives the welcome email, opens Dashboard and sees the welcome notification.
7. B opens Organizations and sees the new membership (also before rights are assigned).
8. Mark both notifications read; verify they remain visible. Dismiss them, reload,
   sign out/in and confirm they remain hidden.
9. Repeat in DE/EN/DA, at desktop and narrow/mobile widths. Simulate a failed API
   request and verify the error/retry and unchanged notification state.
10. Switch accounts while a request is pending and confirm no previous user's cards appear.
