# Organization social accounts and event posts

## Verified API baseline

Inspected on 2026-09-26; `git ls-remote` confirmed both local baselines:

- API `sndcds/uranus`, `dev`: `106ab24af97854e988f3c1b6c72b8ae2e9c1680f`.
- Dashboard `sndcds/uranus-dashboard`, `dev`: `405413a8ecc9c29d74e8ccb9a080199961c269c9`.

Authoritative API sources at that revision:

- [Account routes, input validation, credential handling and permissions](https://github.com/sndcds/uranus/blob/106ab24af97854e988f3c1b6c72b8ae2e9c1680f/api/admin_social_accounts.go)
- [Post routes and target reconciliation](https://github.com/sndcds/uranus/blob/106ab24af97854e988f3c1b6c72b8ae2e9c1680f/api/api_social_post_helper.go)
- [Post and target response model](https://github.com/sndcds/uranus/blob/106ab24af97854e988f3c1b6c72b8ae2e9c1680f/model/social_post.go)
- [Preview/rendering contract](https://github.com/sndcds/uranus/blob/106ab24af97854e988f3c1b6c72b8ae2e9c1680f/docs/social-preview.md)
- [Asynchronous publishing and scheduling](https://github.com/sndcds/uranus/blob/106ab24af97854e988f3c1b6c72b8ae2e9c1680f/docs/social-scheduling.md)
- [Actual publisher support](https://github.com/sndcds/uranus/blob/106ab24af97854e988f3c1b6c72b8ae2e9c1680f/service/social_publish.go)

Organization destinations are **social accounts**, not post targets. The relationship is:

```text
Organization → SocialAccount
Event ← SocialPost → SocialPostTarget → SocialAccount
```

The API requires accepted organization membership and `UserPermEditOrg` for all social operations, including publishing. The dashboard uses `canEditOrg` / `can_edit_org` from the existing organization list. Event editing alone does not grant social access. Backend authorization remains authoritative.

## Dashboard integration

- `UranusOrgCard` opens `UranusSocialAccountsModal` for organizations the user can edit.
- `UranusAdminEventCardsView` loads organization permissions once and passes the matching grant to each `UranusAdminEventCard`.
- `UranusEventSocialPostModal` loads accounts for **the event's organization**, offers multiple enabled accounts, and uses one post with multiple targets.
- `src/api/social.ts` centralizes calls through the existing cookie-authenticated `apiFetch`, validates unknown responses and maps explicit fields to camelCase.
- `src/domain/social/social.model.ts` mirrors the API's models and status constraint. The API does not provide generated TypeScript types, a platform lookup or publisher capabilities. Its four allowed platform values and six target statuses are therefore mirrored once, with their source revision recorded.
- `useSocialEventPost` manages drafts, previews, explicit publishing and status polling. It keeps existing posts accessible across dialog sessions through the API's post list; there is no persistent frontend store.
- UI uses the existing modal, feedback, button, form, input, checkbox and select components. All new text is translated into German, English and Danish.

## Endpoints and payloads

All paths below are existing API routes, with the normal Grains response envelope.

| Action | Method and path | Data |
| --- | --- | --- |
| Organization grants | `GET /api/admin/org/list` | `data.organizations[].can_edit_org` |
| Accounts | `GET /api/admin/social/accounts?org_uuid=…` | `data.accounts` |
| Create account | `POST /api/admin/social/accounts` | Account metadata in `data` |
| Edit account | `PUT /api/admin/social/accounts/:uuid` | Account metadata in `data` |
| Delete account | `DELETE /api/admin/social/accounts/:uuid` | 200; 409 if referenced by post targets |
| Existing event posts | `GET /api/admin/social/posts?org_uuid=…` | `data.posts`, filtered by `source_type` and `source_uuid` in the client |
| Create post | `POST /api/admin/social/posts` | Post and targets in `data` |
| Update draft targets | `PUT /api/admin/social/posts/:uuid` | Updated post and targets in `data` |
| Preview | `POST /api/admin/social/posts/:uuid/preview?lang=…` | `data.previews` |
| Publish now | `POST /api/admin/social/posts/:uuid/publish?lang=…` | 202; individual acceptance/conflict results in `data.results` |
| Read status | `GET /api/admin/social/posts/:uuid` | Current post and targets in `data` |

Account creation requires `org_uuid`, `platform`, `name`, `remote_account_id`. The editor also supports `remote_account_name`, `base_url`, `enabled`, `token_expires_at`, and write-only `access_token` / `refresh_token`. Blank token inputs **omit** the fields on edit; explicit removal sends `null`. Tokens are password inputs held only for the request, cleared on save attempts/cancellation/unmount, never persisted, logged or reflected in error messages. Responses retain presence flags only. Metadata updates do not move accounts between organizations.

Creating one post for two targets:

```json
{
  "org_uuid": "<organization UUID>",
  "source_type": "event",
  "source_uuid": "<event UUID>",
  "targets": [
    { "social_account_uuid": "<first account UUID>" },
    { "social_account_uuid": "<second account UUID>" }
  ]
}
```

Preview and publish send no body. Preview requires a persisted draft. After a preview failure the same draft can be edited/retried. After an ambiguous create failure the UI requires a list reload to recover any committed draft; it does not automatically repeat creation. Publishing is never automatic or retried automatically. Network failures during publishing are reconciled by reading the same post.

Text uses the event summary, falling back to its description; the renderer also includes title and occurrences. The API selects the main event image (falling back to the first image), transforms it per platform and generates public links. The dashboard displays the returned plain text, image and link. URL schemes and embedded URL credentials are checked before rendering links/images. There are **no caption or image-selection fields in the post request**; edits belong in the event editor. Preview is not a frozen publication snapshot: the worker uses the latest event data at execution time.

## Status behavior

Statuses belong to each **target**, not to the parent post:

| API status | Dashboard meaning |
| --- | --- |
| `draft` | Saved, not submitted |
| `scheduled`, `publication_source=manual` | Accepted for immediate background processing |
| `scheduled`, `publication_source=scheduled` | Scheduled through the API; displayed without a scheduling editor |
| `publishing` | Publication in progress; uncertain outcomes can remain here pending backend reconciliation |
| `published` | Published on that target |
| `failed` | Publication failed on that target |
| `cancelled` | Cancelled; terminal in this API version |

The dialog checks status after 3, 6 and 12 seconds, then at most every 15 seconds while a target is queued/publishing. Automatic checks stop after a three-minute observation window, completion, errors, an uncertain worker result, or unmount. A manual status refresh remains available and does not restart an exhausted observation window. Status reads are serialized, cancelled on navigation/unmount and aborted after 15 seconds; stale responses cannot overwrite the current post. The dialog only reports complete publication when every target is published. All-failed posts can be explicitly previewed and retried. Mixed terminal outcomes remain visible per target; selective retry and publication-history reconciliation are not added in this UI.

## Backend dependencies and deliberate limits

**No required CRUD, preview, publish or status endpoint is missing.** No backend files or invented endpoints were added.

However, **only Mastodon has a working publisher** in the verified API revision. Facebook, Instagram and Bluesky have account management and renderers, but their publishers return `publishing is not implemented for platform …`. They are labelled “Preview only”; the dashboard only offers publishing when every selected target has a supported publisher. Multiple Mastodon accounts can be selected together. YouTube is not an accepted account platform.

To enable publication for the other three platforms, the API needs actual implementations behind `NewSocialPublisher`. The existing publish request (no body) and 202 response (`post_uuid`, `results[]` containing target/account UUIDs, status and optional error), followed by post status reads, are sufficient; no new endpoint or dashboard post model is required. Once publisher support exists, update the centralized `socialPublishingPlatforms` capability list. If the API later exposes capabilities, replace this source-derived list with that lookup.

Mastodon publication requires an enabled account, HTTPS origin, remote account ID and access token. Deploy the Part 1–7 migrations and the separate social worker; otherwise accepted requests will remain queued. The API does not currently refresh stored provider tokens automatically.

Scheduling already exists as `POST …/:uuid/schedule` with `{"scheduled_at":"<future RFC3339 timestamp>"}` and `POST …/:uuid/cancel`. `scheduled_at` is a **target field**, as are `publication_source` and `publish_language`; those fields are retained by the dashboard model. No scheduling UI was added. Future scheduling can use this same service/domain boundary and status view.

## Verification

Used isolated Node 26.10.0 (Current) and the pinned pnpm 12.3.4. No dependency or lockfile changes.

- `pnpm test --run`: **138 tests passed in 15 files**, including **40 social workflow tests** for API contracts, account editing, posting workflows and permissions.
- `pnpm build`: **passed**, production bundle built successfully (existing Vite deprecation warnings remain).
- Extra `pnpm typecheck`: baseline comparison found 97 existing errors before this change and 95 after; no new errors. Removed two unused bindings in touched event files. The repository-wide pre-existing type errors are outside this feature.

Tests use mocked API responses; no live provider publication was performed. A deployed API with the worker and configured Mastodon accounts is required for an end-to-end publication check.


## Changed files

| Area | Files |
| --- | --- |
| Organization entry point | `src/component/org/card/UranusOrgCard.vue` |
| Event entry point and permissions | `src/component/event/card/UranusAdminEventCard.vue`, `src/component/event/view/UranusAdminEventCardsView.vue` |
| New dialogs | `src/component/social/UranusSocialAccountsModal.vue`, `src/component/social/UranusEventSocialPostModal.vue` |
| New service, models and workflow | `src/api/social.ts`, `src/domain/social/social.model.ts`, `src/composable/useSocialEventPost.ts` |
| Translations | `src/i18n/social.ts`, `src/i18n/json/{de,en,da}.json`, `tools/i18n/generate-i18n-to-json.ts` |
| New tests and fixtures | `tests/socialApi.test.ts`, `tests/socialComponents.test.ts`, `tests/fixtures/social.ts` |
| Documentation | `docs/social-media.md` |


## Investigation: repeated requests after publishing

Compared the dashboard with the supplied Python Part-7 demo on 2026-09-26. Both create a source-linked post with account targets, call preview, submit a bodyless `POST /api/admin/social/posts/:uuid/publish?lang=…`, and read `GET /api/admin/social/posts/:uuid`. There is no separate HTTP call to start the worker. The publish handler commits `status=scheduled`, `scheduled_at=CURRENT_TIMESTAMP`, `publication_source=manual`; the worker claims due rows from that same database and records the result.

The original dashboard repeated GETs every three seconds for as long as any target remained `scheduled` or `publishing`, with no deadline. That explains a continually increasing Network request count; it does not represent repeated publish POSTs. Concurrent manual reads could also overlap with the automatic timer. Regression tests reproduced both issues before the fix. The dashboard now limits and serializes reads, reports that publication remains unconfirmed after the observation window, and preserves the queue acknowledgment if the first status GET fails.

The Python demo differs in three diagnostic respects:

- It limits waiting to 180 seconds; it does not start the worker itself.
- It reads publication history while a target is `publishing`. Its check treats both history states `publishing` and `uncertain` as requiring reconciliation. An ordinary `publishing` history row can be a healthy in-flight request; only `uncertain` confirms the ambiguous outcome. The dashboard stops immediately when the target itself carries a publishing error, and otherwise waits within its deadline.
- It creates a short, image-free test event. A real event may take a different media-upload path or fail platform content validation even when that demo succeeds.

### Verified locally

Ran API dev `106ab24` against a fresh PostgreSQL 18/PostGIS cluster under `/tmp`, with local mock HTTPS platform servers:

```sh
go test -count=1 -json ./api ./service -run 'Test(Social|Mastodon)'
```

All **199 tests and subtests passed**, with **zero skipped tests**. This includes manual queue handoff, worker claims, current content, multiple targets, concurrent workers, provider success/failure/uncertain outcomes, database failures and idempotency. The disposable PostgreSQL process was stopped afterwards. No production database, real account or backend source file was changed.

This verifies the checked-out implementation, not the process state on Roald's computer. To distinguish the remaining runtime causes there:

1. In the browser's publish response, verify HTTP 202 and `data.results[].status=scheduled`. Subsequent recurring requests should be GETs, not publish POSTs.
2. Inspect `data.targets[].status`, `publication_source` and `scheduled_at` from the post GET. `scheduled` with a past time means the worker has not completed a claim; check worker startup, queue backlog, database/schema configuration and worker logs. Another unresolved publishing target on the same post also blocks claims.
3. Verify that a separate process was started with `--social-worker` and the same configuration/database as the API (the demo defaults to port 9090; verify the dashboard's `VITE_API_URL` points at that same API). Starting only the HTTP API is insufficient. The API repository's deployment workflow restarts only `uranus.service`.
4. For persistent `publishing`, read `GET /api/admin/social/publications?social_post_uuid=<uuid>` and check the worker logs. `uncertain` or a failed database finalization requires verification/reconciliation, not blindly creating another post. A normal brief `publishing` state is expected.

No live status response or worker log from Roald's computer was available during this investigation; the exact reason that his target stays pending is therefore not yet established.
