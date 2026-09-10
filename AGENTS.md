# AGENTS.md

## Purpose and first steps

Uranus Dashboard is the Vue frontend for the Uranus culture platform: public
calendars, maps and portals, plus administration of events, organizations, venues,
spaces, teams, partners and favorites. The Uranus backend owns data and authorization.
Keep changes within the requested scope and preserve its API contracts.

Read the owning feature, its API types and nearby tests before editing.
Use this guide for agent decisions; consult [README.md](README.md) for the overview
and [docs/frontend-architecture.md](docs/frontend-architecture.md) for longer flow
explanations. Verify examples in older documentation against current source.

## Quick start and verification

Run commands from the repository root. There is no root `engines`, `packageManager`,
or Node version file. Test CI selects Node 20; Vite requires Node 20.19+ or 22.12+.
Node 22.22.3 was used to verify this guide. Do not infer Node requirements from
`@types/node` alone.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm typecheck
pnpm test --run
pnpm build
```

- Use an ignored local environment file based on `.env.example`; set `VITE_API_URL`
  to the intended backend before starting development. Do not overwrite existing settings.
- Use **pnpm only** for installation, scripts and dependency changes. This is the
  project direction; `pnpm-lock.yaml` and `pnpm-workspace.yaml` are the relevant files.
  Keep lockfile updates intentional and do not introduce another package-manager workflow.
- Existing test/deployment workflows still use a different install workflow. Treat
  that as a migration gap, not permission to switch package managers. Fix CI/lockfile
  consistency only when it is within the requested scope.
- `pnpm test` can watch. Use `pnpm test --run` for one-shot verification.
- Build runs Vite only; it does **not** run TypeScript checking or generators.
- No lint or format script/config is checked in. ESLint-related dependencies alone
  do not establish a runnable lint workflow. Follow the surrounding file's formatting.
- Before finishing code changes, run typecheck, relevant tests and build as appropriate.
  Report pre-existing failures separately; do not repair unrelated failures silently.

## Architecture and repository map

The application is a client-rendered SPA: Vue 3, TypeScript, Vite, Vue Router, Pinia
and vue-i18n. MapLibre serves maps; the shared text editor uses TipTap and Markdown.
Separate CLI generators create static sharing pages; there is no Vue SSR runtime.

| Path | Responsibility |
| --- | --- |
| `src/main.ts`, `src/App.vue` | Plugins, lookup bootstrap, root router outlet |
| `src/router/index.ts` | Routes, layouts, authentication guards |
| `src/api.ts`, `src/api/dto/`, `src/api/mapper/` | HTTP/auth boundary, DTOs, admin-event mapping |
| `src/domain/` | Feature models, factories and mapping functions |
| `src/store/`, `src/composable/`, `src/util/` | Shared state, Vue behaviors, utilities |
| `src/component/` | Feature views, editor tabs, cards and shared components |
| `src/component/layout/`, `src/component/ui/`, `src/component/uranus/` | Shells and reusable UI |
| `src/view/`, `src/page/` | Other route views and localized HTML page sources |
| `src/model/`, `src/type/` | Additional models, shared types and declarations |
| `src/i18n/`, `tools/i18n/` | Translation sources, compiled JSON and generator |
| `src/style/`, `src/assets/`, `public/` | Styles, bundled assets and public static assets |
| `tests/`, `vitest.config.ts` | Shared test setup and unit/component tests |
| `tools/share/`, `html-templates/` | Static SEO generators and localized email templates |
| `.github/workflows/` | Test, security, Lighthouse and deployment workflows |

- Organize feature code by the existing domain directory. This is not a requirement
  that every domain have a store, mapper and translation file of its own.
- Views orchestrate loading and navigation; editor tabs and cards encapsulate UI.
  Keep shared state in Pinia and reusable Vue lifecycle behavior in composables.
- Use `@/` for cross-directory source imports; Vite, Vitest and TypeScript map it to `src/`.
- Reuse existing models, stores and UI before introducing parallel abstractions.

## Critical API, auth and i18n rules

- Use `apiFetch` from `src/api.ts` for authenticated Uranus requests. It injects
  the access token, shares concurrent refresh work and retries a 401 once.
- `apiFetch<T>` returns the `ApiResponse<T>` envelope; read `.data`. It does **not**
  camel-case keys. Preserve snake_case wire fields; map to domain models explicitly.
- `useTokenStore` from `src/store/uranusTokenStore.ts` persists tokens. Call its
  setters and `clearTokens()` so logout also clears user/org context and broadcasts.
- Route and component permission checks are UX guards. The backend must authorize
  every protected operation, including operations hidden in the UI.
- UI translations are flat keys in domain TypeScript files under `src/i18n/`.
  Supply German (`de`), English (`en`) and Danish (`da`), run `pnpm generate:i18n`,
  and review the generated `src/i18n/json/` changes. Do not hand-edit locale JSON.
- Preserve loading, success, empty, error and applicable unauthorized/forbidden states.
  Verify changed behavior rather than relying on compilation or hidden buttons.

## API and backend contract

- `apiFetch` concatenates `VITE_API_URL` and the supplied path. Callers normally pass
  paths beginning `/api/`. Avoid duplicating `/api` in the configured base URL.
- It adds `Content-Type: application/json` unless supplied or the body is `FormData`.
  Serialize JSON explicitly and let the browser set multipart boundaries for uploads.
- The envelope has `service`, `api_version`, `response_type`, `status`, `timestamp`,
  optional `message`, `metadata` and `data`. The HTTP response determines failure.
- Failed HTTP responses become `ApiError` with `status`, `message` and `error`.
  Narrow caught `unknown` values; do not assume every exception is an `ApiError`.
  Reuse `src/util/apiError.ts` where its password/forbidden message mapping fits.
- `src/composable/useUranusAPI.ts` exports the opt-in `camelCaseKeys` helper.
  It is separate from `apiFetch` and is not a runtime schema validator.
- Typed DTOs usually live in `src/api/dto/`. Map at the loading boundary in the
  owning store, view or model loader. Pass domain models to reusable feature UI.
- Mapping is intentionally distributed: `src/domain/event/eventListItem.mapper.ts`,
  `src/api/mapper/adminEvent.mapper.ts`, and model-colocated functions such as
  `mapOrg` / `toOrgDTO` in `src/domain/org/org.model.ts` are actual examples.
- Some existing views consume raw DTOs locally; some models still accept `any`.
  Treat these as existing exceptions, not templates for new cross-component APIs.
  Extend the owning pattern without a repository-wide migration.
- Keep wire names, methods, query parameters, pagination and null semantics intact.
  Partial editor updates commonly use `PUT` on an entity's `/fields` endpoint.
  `deepClean` removes nulls as well as undefined; do not apply it to a payload
  where null intentionally clears a field.
- Preserve parent context: spaces belong to venues, and admin workflows carry org
  UUIDs. User/member, event/date, venue, space, portal and favorite-list identifiers
  are not interchangeable. Partner DTOs carry organization UUIDs and a direction.
  Confirm the specific DTO and route rather than renaming generic `uuid` fields.
- Image APIs also use `context`, `contextUuid` and `identifier`. Reuse
  `src/component/image/UranusImageSlot.vue` and `src/util/util.ts` image URL helpers;
  do not assume every image identifier is an image UUID.
- Coordinate contract changes with the backend. This repository cannot establish
  new authorization rules or rename response fields on the server's behalf.

## Authentication and permissions

- `src/component/register/UranusLoginView.vue` posts to `/api/login` and consumes
  wrapped `.data` containing `access_token`, `refresh_token` and `user_uuid`.
  It updates token/user state and applies returned locale/theme preferences.
- `pinia-plugin-persistedstate` is registered in `src/main.ts`; tokens are restored
  through persisted Pinia/localStorage, not an implemented cookie session flow.
- `isAuthenticated` tests access-token presence. It does not verify JWT expiry.
  Expiration is handled reactively through API responses, not a proactive timer.
- On 401 outside login/refresh, a shared `refreshPromise` posts to
  `/api/admin/refresh` with the refresh token as Bearer authorization.
  Refresh expects **unwrapped** token fields, unlike the login envelope.
- Missing refresh tokens, rejected refresh HTTP responses and missing refreshed
  access tokens clear state and navigate to login. Other errors can propagate;
  callers still need an error state. Do not add recursive refresh/retry loops.
- Logout uses `clearTokens()`. Cross-tab logout uses `BroadcastChannel` with a
  localStorage event fallback. Preserve `hasKnownAccount` for the login/signup choice.
- Team visibility uses backend capabilities such as `can_manage_permissions`;
  event models/cards also expose action-specific capabilities. Preserve them.
- `src/component/org/view/UranusOrgMemberPermissionView.vue` loads the permission
  catalog from `/api/admin/permissions/list` and a member's string mask from
  `/api/admin/org/:orgUuid/member/:memberUuid/permissions`.
  Updates send `{ bit, enabled }` via PUT; the view protects self-editing bits 5/6.
  Do not reinterpret these bit positions without backend confirmation.
- Reuse `src/composable/useBigIntFlags.ts` and
  `src/component/uranus/UranusBigIntFlagsEditor.vue` for 64-bit flag editing.
  `src/composable/useBitmaskFeatures.ts` handles numeric masks; it is not a
  replacement for BigInt permission/accessibility masks.
- Preserve BigInt precision and serialize it explicitly at JSON boundaries.
  `src/domain/space/space.model.ts` converts accessibility masks to/from strings.
  Never make a frontend permission flag the sole authorization control.

## Routing

- Register routes in `src/router/index.ts`; it uses `createWebHistory()` and
  statically imported route components. Existing routes are not lazily imported.
- `/admin` nests views in `GenericLayout` and inherits `requiresAuth: true`.
  `/admin/event/:uuid` uses `ContentOnlyLayout` with its own auth metadata.
- Add admin/org/user/team views to the appropriate protected parent, use existing
  kebab-case route naming, and preserve context parameters. Real examples:
  - `/admin/org/:orgUuid/edit` → `admin-edit-org`
  - `/admin/org/:orgUuid/team` → `admin-team-org`
  - `/admin/org/:orgUuid/member/:memberUuid/permissions` → `admin-edit-member-permission`
  - `/admin/org/:orgUuid/venue/:venueUuid/space/:spaceUuid/edit` → `admin-edit-space`
  - `/admin/user/profile` → `admin-user-profile`
- The `/app` login/signup/password group has `guestOnly: true`. Separate
  `/app/activate/account` and `/app/activate/team-invitation` routes are public;
  do not move activation into the guest-only group inadvertently.
- Unauthenticated protected navigation goes to login for known accounts, otherwise
  signup, preserving `query.redirect`. Authenticated guests go to `events`, with
  the existing `logout=1` exception. Check inherited metadata via matched records.
- Public examples: `/`, `/map`, `/portal/:uuid`, `/event/:uuid/date/:eventDateUuid`,
  `/venue/:identifier` (also `/ort/` and `/sted/`) and `/event-display/:uuid/:code`.
  Event dates also have slugs in models; do not assume all public parameters are UUIDs.
- Static content uses `/page/:pageName(.*)`; the catch-all redirects to `/page/404`.
  `getPreviousRoute()` returns the previous navigation record, not a reactive ref.
- Use named routes where practical and verify exact param names. Update the
  appropriate navigation component separately; route registration does not add a menu item.

## State and editor lifecycle

- Most stores use setup-style `defineStore`; lookup stores such as
  `src/store/languageLookupStore.ts` use the options form. Preserve existing style.
- Extend an existing domain store for shared state. Keep transient form values,
  dialog visibility and route-only state local. Add a new store only for distinct
  shared ownership, not simply because a new component exists.
- `src/store/appStore.ts` owns selected org/favorite-list context and event view
  preferences. Changing org clears the selected favorite list. Use its actions.
- Token, user, app, theme and map-view stores opt into persistence. Do not persist
  request errors, temporary drafts or sensitive payloads merely for convenience.
  `pinia-plugin-persistedstate-2` is declared but not registered in bootstrap.
- `src/main.ts` awaits nine selected lookup loads before mounting. Stores use
  different `load` / `initialize` methods; others load on demand. Follow the real
  store API and cache semantics instead of assuming universal startup initialization.
- Org, venue, space, portal and event editing use original/draft state. Inspect
  each store's clone and dirty logic; JSON cloning is unsuitable for BigInt values.
- Editor tabs may expose `commitTab` and emit dirty changes. Preserve partial saves:
  synchronize only successfully saved fields and retain unsaved values on failure.
- Reuse `src/component/ui/modal/UranusUnsavedChangesModal.vue` and
  `src/composable/useSaveShortcut.ts` where applicable. Verify route-leave and
  tab-switch handling in the owning view; it is not supplied globally.
- Preserve event filters, cursor pagination and stale-response handling in
  `src/store/eventListStore.ts`. Reset context and loading state deliberately when
  routes, organizations or filters change.

## Components, forms and TypeScript

- Prefer PascalCase `Uranus…` components and `<script setup lang="ts">` for new Vue
  code. Existing JavaScript and ordinary script blocks are exceptions to this
  dominant style; do not convert unrelated components opportunistically.
- Feature views usually live in a domain's `view/` directory, tabs in `editor/`,
  cards in `card/`; some public/dev/message views are under `src/view/`.
- Search both `src/component/ui/` and `src/component/uranus/` before adding shared UI.
  Reuse `UranusButton`, `UranusCard`, `UranusForm`, `UranusFormActions`,
  `UranusTextfield`, `UranusModal`, `UranusFeedback` and `UranusStatusCard` as appropriate.
- `UranusFeedback` supports notice/success/warning/error; `UranusStatusCard` supports
  loading/success/error. Supply explicit empty and forbidden states when needed.
- `UranusForm` prevents default submission; its `validate` prop controls native
  validation. Forms also use local field errors. Reuse this approach instead of
  adding a new validation library for one form.
- Model submit state explicitly, prevent duplicate writes, retain input on error
  and restore loading state in `finally`. Reuse password confirmation for actions
  whose backend contract requires it.
- Type props, emits, component refs and API boundaries. Runtime prop declarations
  and `defineProps<T>()` both exist. Prefer existing domain types and `unknown`
  with narrowing over `any`; keep null distinct from absent/undefined values.
- `tsconfig.json` enables strict mode, unused checks, `noImplicitReturns`,
  `noFallthroughCasesInSwitch`, `noUncheckedIndexedAccess` and
  `exactOptionalPropertyTypes`. `field?: T` allows omission, not automatic assignment
  of undefined; add `| undefined` only when that value belongs to the contract.
- Typecheck includes `src/` and `env.d.ts`, not all root tests/tools. Inference is
  allowed; do not hide errors with `@ts-ignore`, `as any` or weakened compiler options.
  Document unavoidable boundary exceptions precisely.

## Styling, assets and accessibility

- `src/style/global.scss` imports shared SCSS modules and defines `--uranus-*`
  tokens. Components use scoped CSS/SCSS and some intentional global styles.
  Prefer existing colors, spacing, radii and layout tokens over new literals.
- `src/store/themeStore.ts` applies `data-theme` to the document root through
  `src/composable/useTheme.ts`; dark overrides live in global SCSS. Check both themes.
- Breakpoints vary by feature; global layout uses 768/1024px, forms also 540/600px.
  Reuse the owning layout's responsive rules rather than inventing a global scale.
- Dynamic `:style` and CSS `v-bind()` are established for geometry/configuration.
  Keep ordinary reusable styling in stylesheets; do not impose a blanket inline ban.
- Portal appearance uses `src/component/portal/util/portalStyleGenerator.ts` and
  `src/component/portal/editor/portalLayoutConfig.ts`. Keep generated selectors scoped
  to the portal and preserve its structured configuration contract.
- Prefer existing Lucide icons and assets. Vite uses `vite-svg-loader`; use explicit
  `?component` or `?url` imports when the distinction matters. Public assets are
  served from root URLs; do not treat their paths as bundled source imports.
- Use native buttons for actions and links for navigation. `UranusButton` with `to`
  renders a RouterLink; its native disabled behavior applies to the button branch.
- Give inputs unique IDs/labels and associate errors. `UranusTextfield` already wires
  required/invalid/described-by attributes through `UranusLabel`; preserve them.
- Provide translated accessible names for icon-only controls, meaningful image alt
  text and visible keyboard focus. Exercise narrow layouts and keyboard submission.
- `UranusModal` teleports to body and handles Escape/backdrop closing, but does not
  implement a complete focus trap or dialog ARIA contract. Verify dialog naming,
  focus entry/return and keyboard containment for changes; do not assume compliance.

## Internationalization and generated files

**Do not edit generated outputs directly when their source/generator is available.**

- For ordinary UI copy, edit the owning TypeScript translation map, e.g.
  `src/i18n/event.ts`. Keys are flat (`event_title`, `save`), not domain namespaces.
  Reuse existing keys and provide all three locale values, including errors and ARIA labels.
- Run `pnpm generate:i18n` and commit the relevant
  source plus generated JSON. Register a new source module in
  `tools/i18n/generate-i18n-to-json.ts`; it explicitly imports and merges maps.
  Duplicate keys can overwrite earlier entries; check for collisions.
- `src/i18n/uranus-i18n-index.ts` statically imports all three JSON files. Initial
  locale comes from `app-locale` or `de`; fallback is `en`. Its watcher persists
  changes without fetching or regenerating messages.
- Use `$t()` / `useI18n()` and preserve existing interpolation conventions.
  `src/util/string.ts` also supports `~~name~~` and `[name]` placeholders through
  distinct helpers; check the source string and caller together.
- `src/i18n/accessibility.ts` and `src/i18n/visitor-info.ts` carry generated headers
  and flag catalogs. `tools/i18n/generate_i18n_flags_file.py` generates translations
  and flag groups from backend database tables, using psycopg2 and local DB config.
  Coordinate catalog changes with backend data; do not invent IDs or run this DB
  generator as routine UI regeneration. Review hand-maintained additions before replacing files.
- `tools/i18n_check_with_patch.py` produces the tracked diagnostic report
  `tools/i18n_missing_patch.json`. It is not a CI gate or the translation source.
- `tools/share/share-events.json` selects event/date targets. `pnpm generate:share-pages`
  fetches event DTOs and writes tracked HTML under `public/share/`, including OG,
  Twitter and JSON-LD metadata. Regenerate relevant pages when targets, metadata
  rendering or the intended event snapshots change; review fetched-content diffs.
- `pnpm generate:share-sitemap` scans share HTML and emits `sitemap-share.xml`
  under `public/` by default. That output is currently absent/untracked; do not
  assume a checked-in sitemap. `pnpm generate:share` chains both tasks.
- Share scripts read exported environment values or `--key=value` arguments;
  they do not load `.env` themselves. Supply API/site configuration explicitly.
  Page generation needs the backend; sitemap generation needs existing pages.
- Vite writes ignored `dist/`. Generators are not part of `build` or test CI.
- `src/page/` contains hand-authored localized HTML imported by
  `src/view/public/UranusHTMLView.vue`. `public/help/` contains separate static help
  assets; `html-templates/` holds localized email templates with backend placeholders.
  None is generated by the locale JSON script; preserve template contracts.

## Maps and rich text

- Reuse the active MapLibre components in `src/component/map/` and venue pickers.
  `UranusMapRenderer` supports the location picker; `UranusEventsMap` and
  `UranusVenuesMap` own public map feeds. `LibreMap` backs `UranusSinglePointMap`.
- Leaflet and Quill are declared dependencies with no imports in current `src/`.
  Do not infer a working fallback or remove them as a side effect of another task.
- Initialize maps after mounting, keep external map instances out of deep reactivity,
  wait for style readiness before adding sources/layers and restore them after style changes.
  Follow the existing theme handling and `[longitude, latitude]` coordinate order.
- Remove maps/popups and listeners, disconnect observers and cancel timers/requests
  on teardown. Resize maps after container changes; preserve map-view state deliberately.
- Reuse `extractGeoJsonCoordinates` in `src/util/geojson.ts`: backend data includes
  a `point.coordinates` variant as well as standard geometry coordinates.
- Styles in `public/versatiles/` contain concrete tile, sprite and glyph providers.
  Some map code also has raster fallbacks. Preserve attribution and review network
  consequences before changing providers; there is no general map URL env setting.
- `fetchCoordinatesForAddress` in `src/api.ts` queries the configured-in-code
  Nominatim host and returns the first result or null. Handle failures/no results;
  use `src/composable/useGpsLocation.ts` for existing geolocation behavior.
- `src/component/ui/UranusTextEditor.vue` uses TipTap, markdown-it for Markdown → HTML
  and Turndown for HTML → Markdown. Its model emits Markdown; preserve round-trips,
  character limits and editor destruction rather than changing stored format.
- Public event/venue descriptions and portal footer rendering use `marked` and HTML
  insertion. This is not a verified sanitization boundary. The share generator's
  regex hardening is limited; do not reuse it as a general HTML sanitizer.

## Testing and CI

- Vitest uses happy-dom, Vue Test Utils, globals and v8 coverage. Tests live in
  `tests/*.test.ts` and colocated `*.spec.ts` files. No browser/E2E runner is configured.
- `tests/setup.ts` mocks media queries and observers, clears mocks/localStorage,
  and stubs RouterLink. The stub does not render a real `href`; use an appropriate
  router setup for navigation assertions.
- Existing component tests create isolated Pinia state and local `createI18n`
  instances, stub child components/maps, and mock `@/api.ts`. Follow those boundaries;
  avoid network calls and cross-test store state. Unmount and restore timers/mocks.
- Add focused tests for changed mapping, payloads, permissions and user-visible
  state transitions. Include empty/error behavior when relevant, not just rendering.
  happy-dom cannot establish map/WebGL, focus or responsive browser correctness.
- Additional scripts: `pnpm test:ui`, `pnpm test:coverage --run`,
  and `pnpm preview`. Coverage exclusions do not prohibit tests for those areas.
- `.github/workflows/tests.yml` runs on pushes/PRs with Node 20 and `CI=true`.
  Its test invocation resolves to `vitest --run`; it does not run typecheck or build.
  Its current install/runner commands still need migration to the pnpm-only policy.
  For local verification use `pnpm install --frozen-lockfile` and `pnpm test --run`.
- CodeQL targets JavaScript for TS/Vue path changes. Lighthouse is path-filtered
  to TS/SCSS/Vue and audits the deployed public URL, not the PR's local build.
- `.github/workflows/deploy.yml` runs on main pushes and installs/builds on the
  server. Its package-manager commands also need migration to pnpm. Do not reproduce
  remote reset/deploy commands for routine local validation. No generated-artifact
  check is configured.

## Environment and security

- `VITE_API_URL` is used by the API client/image helpers and Vite's `/api` dev proxy.
  Absolute client URLs go directly to that base; they do not pass through the proxy.
- `.env.example` and `env.d.ts` also declare `VITE_IMPRINT_*`, `VITE_PRIVACY_*`,
  `VITE_TERMS_LAST_UPDATED` and `VITE_APP_VERSION`. Current page loading does not
  substitute these into HTML. Do not promise automatic legal-page configuration.
  Consult `IMPRINT_SETUP.md` / `PRIVACY_SETUP.md` for intent, then verify actual consumers.
- Share CLI configuration: `SHARE_API_BASE` (after `VITE_API_URL`), `SHARE_SITE_BASE`,
  `SHARE_EVENTS_FILE`, `SHARE_OUT_DIR`, `SHARE_LOCALES`, `SHARE_TWITTER_SITE`,
  and `SHARE_SITEMAP_FILE`; see the parsers in `tools/share/` for corresponding flags.
- `VITE_*` values are client-visible. Never put secrets there or commit tokens,
  passwords, private environment files or sensitive logs. `.env` and `*.local` are
  ignored; other environment filenames are not automatically protected by this gitignore.
- Do not log login responses, invitation tokens or private profile payloads, even
  where existing debug code does so. Do not bypass the central token flow.
- Validate untrusted URL schemes and redirect destinations. `uranusEnsureHttpOrHttps`
  in `src/util/url.ts` normalizes a prefix; it is not a complete trust check.
  Keep `noopener noreferrer` for external tabs and escape interpolated popup content.
- Treat `v-html`, map `setHTML`, raw page content and portal custom CSS as trust
  boundaries. Validate/sanitize untrusted content for its output context; Markdown
  parsing, TypeScript assertions and client permission checks do not make it safe.

## Agent decisions and definition of done

1. Locate the owning domain, actual route and data contract; inspect the existing
   API call, model/mapper, store, UI and relevant tests before adding another version.
2. Extend shared state only when ownership requires it; keep transient state local.
   Reuse translations, components, style tokens and lifecycle helpers.
3. Limit edits to requested behavior. Avoid unrelated refactors, formatting sweeps,
   router/store restructures, dependency upgrades and incidental lockfile rewrites.
4. Add a dependency only if existing tools cannot reasonably solve the problem,
   a local implementation would be worse, and bundle/security costs are justified.
   Do not add another library for a capability already present.
5. Follow nearby formatting and add comments for non-obvious reasons/contracts.
   Existing comments vary; avoid trivial narration and mass-generated comments.
6. Run the commands above for the changed behavior, update relevant translations
   and generated outputs, inspect the final diff and report actual results.
7. Finish with scope, behavior, validation and remaining limitations clearly stated.
   Typecheck/tests/build should pass for completed code work; if a baseline check
   already fails, identify it and do not claim a green check or expand scope silently.
   Include API compatibility, permissions, loading/error/empty states and accessibility.

History mixes descriptive commits, dependency updates and merge commits; there is
no enforced Conventional Commits policy. Use a focused descriptive commit and PR.
Recent integration PRs commonly merge dev into main; follow the requested target
branch rather than assuming that all feature PRs target main.
