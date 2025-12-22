# Uranus Dashboard

[![Lighthouse CI](https://github.com/sndcds/uranus-dashboard/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/sndcds/uranus-dashboard/actions/workflows/lighthouse.yml)
[![Run codeql](https://github.com/sndcds/uranus-dashboard/actions/workflows/codeql.yml/badge.svg)](https://github.com/sndcds/uranus-dashboard/actions/workflows/codeql.yml)
[![Frontend Tests](https://github.com/sndcds/uranus-dashboard/actions/workflows/tests.yml/badge.svg)](https://github.com/sndcds/uranus-dashboard/actions/workflows/tests.yml)

Uranus Dashboard is a Vue 3 single-page application that helps cultural organisations run their events, venues, and spaces. The app offers a visitor-facing calendar as well as an authenticated workspace where editors can manage organisers, venues, event metadata, translations, and personal settings.

> **Good to know**  
> The UI expects a Uranus API server that exposes the `/api` endpoints used throughout the codebase (for example `/api/admin/login`, `/api/admin/organization/:id`, `/api/admin/event/create`, …). You can still explore the UI without a backend, but data loads and mutations will fail.

## Feature Highlights

- **Authentication flow** with login, signup, forgotten-password, and reset-password screens, token refresh, and local storage persistence.
- **Dashboard workspace** for logged-in users featuring organiser, venue, space, and event management, including split create/update flows.
- **Rich form experiences** such as Markdown-enabled descriptions, Leaflet-powered maps for picking coordinates, and dependent selects for legal forms, countries, and states.
- **Event builder** with a two-stage tag selector, availability calendar, language selector backed by live API data, and validation before submission.
- **Visitor layout** that exposes the public event calendar, language selector, theme switcher, and legal links without requiring an account.
- **Internationalisation** with German, English, and Danish translations wired through Vue I18n and ready for extension.
- **Personalisation** with light/dark themes, profile editing, avatar upload, and user permissions quick links.

## Tech Stack

- [Vue 3](https://vuejs.org/) with the `<script setup>` syntax
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for development and bundling
- [Pinia](https://pinia.vuejs.org/) for state management
- [Vue Router](https://router.vuejs.org/) navigation guards and layouts
- [Vue I18n](https://vue-i18n.intlify.dev/) internationalisation
- [Leaflet](https://leafletjs.com/) for interactive maps in address forms
- [Quill](https://quilljs.com/) (via `MarkdownEditorComponent.vue`) for enhanced text editing

## Quick Start

### Prerequisites

- Node.js 20 LTS or newer (use [nvm](https://github.com/nvm-sh/nvm) or a similar tool to manage versions).
- npm 10 (bundled with Node 20).
- Access to a Uranus API instance (development or staging) with credentials you can use.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sndcds/uranus-dashboard.git
   cd uranus-dashboard
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```

### Configure environment variables

Create a `.env.local` (or `.env`) file in the project root and set the API base URL:

```ini
# .env.local
VITE_API_URL=https://uranus-api.example.org
```

The value can point at `http://localhost:8000` when running a local backend. During development the Vite dev server proxies `/api/*` requests to the URL defined here (see `vite.config.ts`).

### Run the application

- **Development server**
  ```bash
  npm run dev
  ```
  Vite prints a local and network URL (default: `http://localhost:5173`). Hot Module Replacement is enabled out of the box.

- **Type checking & linting**
  
  The project relies on TypeScript’s compiler diagnostics and ESLint. Run `npm run build` or `vue-tsc --noEmit` manually if you need a dedicated type check step.

- **Production build**
  ```bash
  npm run build
  ```
  Bundled assets are emitted into `dist/`.

- **Preview a production build**
  ```bash
  npm run preview
  ```

## Testing

Uranus Dashboard ships with a [Vitest](https://vitest.dev/) suite that exercises components, views, Pinia stores, and high-level authentication flows. Run the commands below from the project root:

```bash
# Run the full suite (default happy-dom environment)
npm run test

# Launch the Vitest UI runner
npm run test:ui

# Collect coverage information
npm run test:coverage
```

Test helpers, mocks, and specs live inside the `tests/` directory—see `tests/README.md` for a full breakdown of available specs and coverage focus areas.

## Project Layout

```
├─ public/                    # Static assets copied as-is
├─ src/
│  ├─ api.ts                  # apiFetch helper with token refresh logic
│  ├─ components/             # Reusable UI units (forms, layout, editors, maps)
│  ├─ i18n/                   # Vue I18n setup and translation catalogue
│  ├─ models/                 # Shared TypeScript interfaces (event models, …)
│  ├─ router/                 # Route definitions and navigation guards
│  ├─ store/                  # Pinia stores (token, theme, app, user)
│  ├─ styles/                 # Global SCSS theme tokens and mixins
│  ├─ utils/                  # Helpers (e.g. theme application)
│  └─ views/                  # Page-level components registered in the router
├─ vite.config.ts             # Vite build and dev-server configuration
└─ tsconfig.json              # TypeScript project settings
```

## User Guide

### Authentication & Account Access

- **Login & Signup:** Accessed via `/login` and `/signup` under the visitor layout. Successful login stores access and refresh tokens in `localStorage` (`useTokenStore`) and redirects to the dashboard.
- **Forgot / Reset password:** `/forgot-password` sends a reset link, `/reset-password?token=…` lets users choose a new password with double entry and eye icons for toggling visibility.
- **Session refresh:** `apiFetch` transparently refreshes JWTs when a 401 response comes back, using the stored refresh token and reattempting the failed request.

### Dashboard Workspace (authenticated)

- **Dashboard home (`/`):** A welcome hero reminding users of key tasks.
- **Organisers (`/organizations`):** List fetched from `/api/admin/organization/dashboard`, with cards linking to create/update flows.
- **Create & edit organiser (`/organization/create`, `/organization/:id/edit`):**
  - Forms capture legal form, country/state via live dropdowns (`/api/choosable-legal-forms`, `/api/choosable-countries`, `/api/choosable-states`).
  - Use the integrated Markdown editor for rich descriptions and the Leaflet map to refine coordinates.
  - Non-profit status is toggled via an accessible checkbox.
- **Venues (`/organization/:id/venues` and `/organization/:id/venue/:venueId/edit`):**
  - Reuses the shared `VenueForm.vue`, ensuring consistent layout between create and update flows.
  - Supports optional Markdown descriptions, opened/closed dates, website URLs without protocol prefixes, and geocoding.
- **Spaces (`/organization/:id/venue/:venueId/space/...`):**
  - `FormSpaceView.vue` loads existing spaces when editing and submits updates through the admin API.
- **Events:**
  - `EventDashboardView.vue` aggregates an organiser’s events.
  - `FormEventView.vue` guides editors through basic info, scheduling (including multiple time slots), and content details, blocking submission until all sections validate.
  - `EventDetailsComponent.vue` fetches choosable languages from `/api/choosable-languages?lang=de` and records selections as language codes.
- **User profile & permissions:** Accessed via `/user/profile` and `/user/permissions`, linked from the sidebar user menu. Avatar uploads hit `/api/user/:id/avatar/256` and bump a cache-busting version.

### Visitor-Facing Experience

- **Default layout:** `DefaultVisitorLayout.vue` provides a responsive mobile menu that slides in from the left, language and theme dropdowns, and hides login/signup buttons when a session exists.
- **Events calendar (`/events`):**
  - Fetches events, categories, and filters via the public API.
  - Offers search, date range selection, type filtering, and tag shortcuts.
  - Shows “View details” links for authenticated users.

### Personalisation & Persistence

- **Theme switcher:** Stored via `useThemeStore`; selections persist in `localStorage` and update the DOM `data-theme` attribute (`light`/`dark`).
- **Organization selection memory:** `useAppStore` keeps the last chosen organiser ID to streamline event/venue creation.
- **Locale persistence:** Vue I18n syncs with user preferences returned by the API after login.

## Internationalisation

- Supported locales live in `src/i18n/uranus-i18n-index.ts` with German (`de`), English (`en`), and Danish (`da`) catalogues.
- Shared translation groups (e.g., authentication copy) are centralised for consistency.
- Use `te('key')` in components when you must guard against missing translations.
- To add a new language:
  1. Extend the `LocaleKey` union.
  2. Update the `messages` object with the new locale.
  3. Add the locale to the `localeOptions` array in `DefaultVisitorLayout.vue`.

## Theming & Styling

- Global tokens and mixins reside in `src/styles/global.scss` and `src/styles/_mixins.scss`.
- Components adopt mixins like `form-page`, `form-card`, and `form-grid` to keep layout consistent.
- Theme switching updates CSS custom properties on the root element, allowing you to customise colours or spacing globally.

## API Integration Notes

- `apiFetch` (in `src/api.ts`) wraps `fetch` to:
  - Prefix all paths with `VITE_API_URL`.
  - Automatically set `Content-Type: application/json` unless the body is `FormData`.
  - Inject `Authorization` headers when tokens exist.
  - Parse JSON/text responses and throw an `ApiError` with the HTTP status.
  - Handle 401s by posting to `/api/admin/refresh` and retrying the original request.
- `fetchCoordinatesForAddress` leverages the OSM Nominatim service at `https://nominatim.oklabflensburg.de` to locate coordinates for map components.
- When building new features, prefer `apiFetch` to keep token handling and error surfacing consistent across the app.

## Accessibility Considerations

- Forms use labelled inputs, `aria-*` attributes, and focus outlines by default. Password fields include eye toggles with appropriate labels.
- Important feedback messages (`auth-feedback`, calendar errors, etc.) use `role="alert"` / `aria-live` for screen readers.
- The visitor layout provides an accessible mobile menu with `aria-expanded` and `aria-controls` hooks.

## Troubleshooting

- **Blank data / 401 errors:** Ensure `VITE_API_URL` points to a reachable API and that your credentials are valid.
- **CORS issues in development:** Verify the backend allows the Vite dev origin or rely on the proxy specified in `vite.config.ts`.
- **“Module 'node:test' has been externalized” error:** Importing Node-only modules inside Vue components causes Vite to externalise them. Remove those imports or wrap test helpers in environment checks.
- **Translations missing:** Add the key to all supported locales; `te('key')` allows you to fall back gracefully while you build out translations.
- **Leaflet map tiles not loading:** Confirm outbound network access to `nominatim.oklabflensburg.de` and the tile provider, or configure your own tile URL within `LocationMapComponent.vue`.

## Next Steps

- Connect the dashboard to your Uranus backend and seed sample data for organisers, venues, and events.
- Extend the translation catalogue if you serve additional languages.
- Add automated tests (`vitest`, `cypress`, …) to cover critical flows—no test suite ships with the repo yet.

Happy organising! 🎉
